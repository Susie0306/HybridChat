import { useState, useRef } from "react";
import { Bridge } from "../utils/bridge";
import { useAuth } from "@clerk/clerk-react";

// 配置区域
const USE_ANDROID_EMULATOR = false;
const HOST_IP = USE_ANDROID_EMULATOR ? "10.0.2.2" : "localhost";
const WS_URL = `ws://${HOST_IP}:8080`;
const API_URL = `http://${HOST_IP}:8080`;

export function useChat(userId, userAvatar, roomId, deviceInfo) {
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [allHistoryLoaded, setAllHistoryLoaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const { getToken } = useAuth();

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const connectToChat = async () => {
    if (!userId.trim()) return;

    let token;
    try {
      token = await getToken();
    } catch (err) {
      console.error("获取 Token 失败:", err);
      Bridge.showToast("登录验证失败");
      return;
    }

    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log("WebSocket Connected");
      ws.send(
        JSON.stringify({ type: "login", token, userId, userAvatar, roomId })
      );
      Bridge.showToast(`欢迎 ${userId} 进入聊天室`);
      fetchHistory(true);
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "users_update") {
        setOnlineUsers(msg.users);
      } else if (msg.type === "recall") {
        setMessages((prev) => prev.filter((m) => m.id !== msg.messageId));
      } else if (msg.type === "error") {
        Bridge.showToast(`错误: ${msg.content}`);
      } else {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
      }
    };

    ws.onclose = () => {
      Bridge.showToast("连接已断开");
    };

    setSocket(ws);
  };

  const sendMessage = (type = "text", content) => {
    if (!socket || !content) return;

    const payload = {
      type: "chat",
      msgType: type,
      content: content,
      deviceInfo: deviceInfo,
    };

    socket.send(JSON.stringify(payload));
  };

  const recallMessage = (messageId) => {
    if (!socket) return;
    socket.send(JSON.stringify({ type: "recall", messageId }));
  };

  const uploadFile = async (file) => {
    setIsUploading(true);
    try {
      const filename = encodeURIComponent(file.name);
      const res = await fetch(`${API_URL}/upload?filename=${filename}`, {
        method: "POST",
        body: file,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      return data.url;
    } catch (error) {
      console.error("Upload Error:", error);
      Bridge.showToast("文件上传失败");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const fetchHistory = async (isInitial = false) => {
    if (loadingHistory || allHistoryLoaded) return;
    setLoadingHistory(true);

    const oldestTimestamp =
      messages.length > 0 && !isInitial ? messages[0].timestamp : Date.now();

    try {
      const res = await fetch(
        `${API_URL}/history?roomId=${roomId}&limit=20&beforeTimestamp=${oldestTimestamp}`
      );
      const history = await res.json();

      if (history.length === 0) {
        setAllHistoryLoaded(true);
      } else {
        if (isInitial) {
          setMessages(history);
          scrollToBottom();
        } else {
          const container = chatContainerRef.current;
          const previousHeight = container.scrollHeight;
          setMessages((prev) => [...history, ...prev]);
          requestAnimationFrame(() => {
            const currentHeight = container.scrollHeight;
            container.scrollTop = currentHeight - previousHeight;
          });
        }
      }
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const doSearch = async (keyword) => {
    if (!keyword.trim()) return;
    try {
      const res = await fetch(
        `${API_URL}/search?roomId=${roomId}&q=${encodeURIComponent(keyword)}`
      );
      const data = await res.json();
      setSearchResults(data);
    } catch (e) {
      console.error("Search failed", e);
    }
  };

  const clearSearch = () => {
    setSearchResults([]);
  };

  return {
    messages,
    onlineUsers,
    socket,
    loadingHistory,
    allHistoryLoaded,
    isUploading,
    searchResults,
    doSearch,
    clearSearch,
    messagesEndRef,
    chatContainerRef,
    connectToChat,
    sendMessage,
    recallMessage,
    uploadFile,
    fetchHistory,
  };
}
