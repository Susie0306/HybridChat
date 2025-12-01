const WebSocket = require("ws");
const {
  saveMessage,
  deleteMessage,
  updateUserAvatar,
} = require("./storageService");
const OpenAI = require("openai");
const { verifyToken } = require("@clerk/clerk-sdk-node");

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

const clients = new Map();

function setupWebSocket(wss) {
  wss.on("connection", (ws) => {
    let currentUser = null;
    let currentUserAvatar = "";
    let currentRoom = null;

    console.log("🔌 新的 WebSocket 连接已建立 (等待身份验证...)");

    ws.on("message", async (messageStr) => {
      try {
        const data = JSON.parse(messageStr);

        if (data.type === "login") {
          const { token, userId, userAvatar, roomId } = data;

          try {
            await verifyToken(token, {
              secretKey: process.env.CLERK_SECRET_KEY,
            });

            console.log(`✅ 鉴权成功: ${userId}`);

            currentUser = userId;
            currentUserAvatar = userAvatar || "";
            currentRoom = roomId || "public";

            clients.set(ws, {
              userId: currentUser,
              userAvatar: currentUserAvatar,
              roomId: currentRoom,
              isAuthenticated: true,
            });

            // 登录时同步更新数据库中的历史头像
            if (currentUserAvatar) {
              updateUserAvatar(currentUser, currentUserAvatar).catch((err) => {
                console.error("后台同步头像失败", err);
              });
            }

            console.log(`👤 用户登录: ${currentUser} 进入房间 ${currentRoom}`);

            const joinMsg = {
              id: Date.now().toString() + Math.random().toString().slice(2),
              type: "system",
              content: `${currentUser} 加入了聊天室`,
              userId: "System",
              roomId: currentRoom,
              timestamp: Date.now(),
              deviceInfo: "Server",
            };

            saveMessage(joinMsg).catch((err) =>
              console.error("保存加入消息失败:", err)
            );
            broadcast(wss, joinMsg);
            broadcastUserList(wss, currentRoom);
          } catch (err) {
            console.error("❌ 鉴权失败:", err.message);
            ws.send(
              JSON.stringify({
                type: "error",
                content: "身份验证失败，请重新登录",
              })
            );
            ws.close();
            return;
          }
        } else if (data.type === "chat") {
          const clientData = clients.get(ws);
          if (!clientData || !clientData.isAuthenticated) return;

          const msgObj = {
            id: Date.now().toString() + Math.random().toString().slice(2),
            type: data.msgType || "text",
            content: data.content,
            userId: currentUser,
            userAvatar: currentUserAvatar,
            roomId: currentRoom,
            timestamp: Date.now(),
            deviceInfo: data.deviceInfo || "Web",
          };

          await saveMessage(msgObj);
          broadcast(wss, msgObj);

          if (data.msgType === "text" && data.content.includes("@DeepSeek")) {
            const prompt = data.content.replace("@DeepSeek", "").trim();
            handleDeepSeekReply(wss, currentRoom, prompt, currentUser);
          }
        } else if (data.type === "recall") {
          const clientData = clients.get(ws);
          if (!clientData || !clientData.isAuthenticated) return;

          const messageId = data.messageId;
          if (messageId) {
            deleteMessage(messageId)
              .then(() => {
                console.log(`🗑️ 消息已撤回: ${messageId}`);
                broadcast(wss, {
                  type: "recall",
                  messageId: messageId,
                  roomId: currentRoom,
                });
              })
              .catch((err) => {
                console.error("删除消息失败", err);
              });
          }
        }
      } catch (e) {
        console.error("Parse error:", e);
      }
    });

    ws.on("close", () => {
      if (currentUser && currentRoom) {
        console.log(`👋 用户退出: ${currentUser}`);
        clients.delete(ws);

        const leaveMsg = {
          id: Date.now().toString() + Math.random().toString().slice(2),
          type: "system",
          content: `${currentUser} 离开了聊天室`,
          userId: "System",
          roomId: currentRoom,
          timestamp: Date.now(),
          deviceInfo: "Server",
        };

        saveMessage(leaveMsg).catch((err) =>
          console.error("保存离开消息失败:", err)
        );
        broadcast(wss, leaveMsg);
        broadcastUserList(wss, currentRoom);
      }
    });
  });
}

async function handleDeepSeekReply(wss, roomId, userPrompt, senderName) {
  try {
    const completion = await deepseek.chat.completions.create({
      messages: [
        { role: "system", content: "你是一个幽默、乐于助人的聊天室助手。" },
        { role: "user", content: `${senderName} 问: ${userPrompt}` },
      ],
      model: "deepseek-chat",
    });

    const replyContent = completion.choices[0].message.content;

    const botMsg = {
      id: Date.now().toString() + Math.random().toString().slice(2),
      type: "text",
      content: replyContent,
      userId: "DeepSeek",
      userAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=DeepSeek",
      roomId: roomId,
      timestamp: Date.now(),
      deviceInfo: "AI-Bot",
    };

    await saveMessage(botMsg);
    broadcast(wss, botMsg);
  } catch (error) {
    console.error("DeepSeek API Error:", error);
    const errorMsg = {
      id: Date.now().toString() + Math.random().toString().slice(2),
      type: "text",
      content: "DeepSeek 暂时无法连接，请检查 API Key。",
      userId: "DeepSeek",
      roomId: roomId,
      timestamp: Date.now(),
      deviceInfo: "System",
    };
    broadcast(wss, errorMsg);
  }
}

function broadcast(wss, msg) {
  wss.clients.forEach((client) => {
    const clientData = clients.get(client);
    if (
      client.readyState === WebSocket.OPEN &&
      clientData &&
      clientData.isAuthenticated &&
      clientData.roomId === msg.roomId
    ) {
      client.send(JSON.stringify(msg));
    }
  });
}

function broadcastUserList(wss, roomId) {
  const users = [];
  wss.clients.forEach((client) => {
    const clientData = clients.get(client);
    if (
      client.readyState === WebSocket.OPEN &&
      clientData &&
      clientData.isAuthenticated &&
      clientData.roomId === roomId
    ) {
      users.push(clientData.userId);
    }
  });
  const uniqueUsers = [...new Set(users)];
  const msg = {
    type: "users_update",
    users: uniqueUsers,
    roomId: roomId,
  };

  wss.clients.forEach((client) => {
    const clientData = clients.get(client);
    if (
      client.readyState === WebSocket.OPEN &&
      clientData &&
      clientData.isAuthenticated &&
      clientData.roomId === roomId
    ) {
      client.send(JSON.stringify(msg));
    }
  });
}

module.exports = { setupWebSocket };
