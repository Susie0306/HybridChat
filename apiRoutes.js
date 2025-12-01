const fs = require("fs");
const path = require("path");
const url = require("url");
const { getMessages, searchMessages } = require("./storageService");

const UPLOAD_DIR = path.join(__dirname, "uploads");

// 启动时自动创建 uploads 文件夹
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

async function handleApiRequest(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // 静态文件服务 /uploads/
  if (pathname.startsWith("/uploads/")) {
    const filename = decodeURIComponent(pathname.replace("/uploads/", ""));
    const filepath = path.join(UPLOAD_DIR, filename);

    fs.readFile(filepath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("File not found");
        return;
      }
      const ext = path.extname(filepath).toLowerCase();
      const mimeTypes = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".gif": "image/gif",
        ".webp": "image/webp",
        ".mp4": "video/mp4",
        ".mp3": "audio/mpeg",
      };
      res.writeHead(200, {
        "Content-Type": mimeTypes[ext] || "application/octet-stream",
      });
      res.end(data);
    });
    return true; // 已处理
  }

  // 文件上传接口
  if (pathname === "/upload" && req.method === "POST") {
    const queryFilename = parsedUrl.query.filename || `file-${Date.now()}`;
    const safeFilename = path.basename(queryFilename);
    const filepath = path.join(UPLOAD_DIR, safeFilename);

    const writeStream = fs.createWriteStream(filepath);
    req.pipe(writeStream);

    req.on("end", () => {
      const host = req.headers.host;
      const protocol = req.headers["x-forwarded-proto"] || "http"; // 适配 Render/Vercel
      const fileUrl = `${protocol}://${host}/uploads/${encodeURIComponent(
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
    return true;
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
    return true;
  }

  // 搜索接口
  if (pathname === "/search" && req.method === "GET") {
    try {
      const { roomId, q } = parsedUrl.query;
      if (!q) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify([]));
        return true;
      }
      const messages = await searchMessages(roomId, q);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(messages));
    } catch (err) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message }));
    }
    return true;
  }

  return false; // 未匹配到路由
}

module.exports = { handleApiRequest };
