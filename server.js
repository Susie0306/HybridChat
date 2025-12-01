require("dotenv").config();
const dbUrl = process.env.DATABASE_URL || "未定义";
const http = require("http");
const WebSocket = require("ws");
const { setupWebSocket } = require("./chatService");
const { handleApiRequest } = require("./apiRoutes");

const PORT = process.env.PORT || 8080;

const server = http.createServer(async (req, res) => {
  // 全局 CORS 设置
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // 交给路由处理器
  const handled = await handleApiRequest(req, res);

  // 如果路由没处理，返回 404
  if (!handled) {
    res.writeHead(404);
    res.end("Not found");
  }
});

// 绑定 WebSocket
const wss = new WebSocket.Server({ server });
setupWebSocket(wss);

server.listen(PORT, () => {
  console.log(`✅ 后端服务启动成功`);
  console.log(`   监听端口: ${PORT}`);
});
