require("dotenv").config();
const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");
const WebSocket = require("ws");
const { setupWebSocket } = require("./chatService");
const { getMessages, searchMessages } = require("./storageService");

const PORT = 8080;
// 确保上传保存目录是绝对路径
const UPLOAD_DIR = path.join(__dirname, "uploads");

// 启动时自动创建 uploads 文件夹
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

const server = http.createServer(async (req, res) => {
  // 1. 全局 CORS 设置 (允许前端跨域访问)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // 处理预检请求
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // 静态文件服务
  // 如果请求路径以 /uploads/ 开头，说明是来拿图片的
  if (pathname.startsWith("/uploads/")) {
    // 去掉前缀，拿到文件名 (解码 URI，防止中文乱码)
    const filename = decodeURIComponent(pathname.replace("/uploads/", ""));
    const filepath = path.join(UPLOAD_DIR, filename);

    // 检查文件是否存在
    fs.readFile(filepath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("File not found");
        return;
      }

      // 简单的 MIME 类型判断，确保浏览器正确识别图片/视频
      const ext = path.extname(filepath).toLowerCase();
      const mimeTypes = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".gif": "image/gif", // 动图支持
        ".webp": "image/webp",
        ".mp4": "video/mp4",
        ".mp3": "audio/mpeg",
      };

      res.writeHead(200, {
        "Content-Type": mimeTypes[ext] || "application/octet-stream",
      });
      res.end(data);
    });
    return;
  }

  // 文件上传接口
  if (pathname === "/upload" && req.method === "POST") {
    // 获取文件名，如果没有则用时间戳
    const queryFilename = parsedUrl.query.filename || `file-${Date.now()}`;
    const safeFilename = path.basename(queryFilename); // 安全处理，防止路径攻击
    const filepath = path.join(UPLOAD_DIR, safeFilename);

    const writeStream = fs.createWriteStream(filepath);

    // 管道流式写入
    req.pipe(writeStream);

    req.on("end", () => {
      // 返回完整的可访问 URL
      const fileUrl = `http://localhost:${PORT}/uploads/${encodeURIComponent(
        safeFilename
      )}`;
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ url: fileUrl }));
    });

    req.on("error", (err) => {
      console.error("Upload failed:", err);
      res.writeHead(500);
      res.end(JSON.stringify({ error: "Upload failed" }));
    });
    return;
  }

  // 历史消息接口
  if (pathname === "/history" && req.method === "GET") {
    try {
      const { roomId, limit, beforeTimestamp } = parsedUrl.query;
      const messages = await getMessages(
        roomId,
        parseInt(limit) || 20,
        parseInt(beforeTimestamp) || Date.now()
      );
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(messages));
    } catch (err) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 搜索接口
  if (pathname === "/search" && req.method === "GET") {
    try {
      const { roomId, q } = parsedUrl.query;
      if (!q) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify([]));
        return;
      }
      const messages = await searchMessages(roomId, q);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(messages));
    } catch (err) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 404
  res.writeHead(404);
  res.end("Not found");
});

// 绑定 WebSocket
const wss = new WebSocket.Server({ server });
setupWebSocket(wss);

server.listen(PORT, () => {
  console.log(`✅ 后端服务启动成功`);
  console.log(`   本地访问: http://localhost:${PORT}`);
  console.log(`   静态资源: http://localhost:${PORT}/uploads/`);
  console.log(`   WebSocket: ws://localhost:${PORT}`);
});
