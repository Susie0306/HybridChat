const { Pool } = require("pg");
require("dotenv").config();

// 检查是否配置了数据库连接串
if (!process.env.DATABASE_URL) {
  console.error("❌ 错误: 未在 .env 文件中找到 DATABASE_URL");
  console.error("请先去 Neon.tech 或 Supabase 创建数据库，并将连接串填入 .env");
  process.exit(1);
}

// 创建连接池
// connectionString 格式通常为: postgres://user:password@host:port/database?sslmode=require
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // 允许大多数云数据库的 SSL 连接
  },
});

// 初始化表结构
async function initTables() {
  const client = await pool.connect();
  try {
    // PostgreSQL 建表语句
    // Postgres 推荐使用 TEXT 或 VARCHAR，时间戳用 BIGINT 存储毫秒数是可行的
    const sql = `
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        content TEXT,
        "userId" TEXT NOT NULL,    -- 加引号以保留大小写（可选，习惯上 PG 字段用小写）
        "userAvatar" TEXT,
        "roomId" TEXT NOT NULL,
        timestamp BIGINT NOT NULL, -- JS Date.now() 是大整数
        "deviceInfo" TEXT
      );
    `;
    await client.query(sql);
    console.log("✅ 已连接到 PostgreSQL 并检查了表结构");
  } catch (err) {
    console.error("创建表失败:", err.message);
  } finally {
    client.release();
  }
}

// 启动时尝试初始化
initTables();

// 保存消息
function saveMessage(msg) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO messages (id, type, content, "userId", "userAvatar", "roomId", timestamp, "deviceInfo")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    const params = [
      msg.id,
      msg.type,
      msg.content,
      msg.userId,
      msg.userAvatar || "",
      msg.roomId,
      msg.timestamp,
      msg.deviceInfo,
    ];

    pool.query(sql, params, (err, res) => {
      if (err) {
        console.error("保存消息失败:", err.message);
        reject(err);
      } else {
        resolve(res.rowCount);
      }
    });
  });
}

// 加载消息
function getMessages(roomId, limit = 20, beforeTimestamp = Date.now()) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT * FROM messages 
      WHERE "roomId" = $1 AND timestamp < $2
      ORDER BY timestamp DESC
      LIMIT $3
    `;
    // 注意：params 必须是数组，且类型要匹配
    pool.query(sql, [roomId, beforeTimestamp, limit], (err, res) => {
      if (err) {
        console.error("查询消息失败:", err.message);
        reject(err);
      } else {
        // 数据库取出来是倒序的，前端展示需要正序 (旧 -> 新)
        resolve(res.rows.reverse());
      }
    });
  });
}

// 搜索消息功能
function searchMessages(roomId, keyword) {
  return new Promise((resolve, reject) => {
    // PostgreSQL 的模糊匹配也是 LIKE，或者可以用 ILIKE (不区分大小写)
    const sql = `
      SELECT * FROM messages 
      WHERE "roomId" = $1 AND content ILIKE $2 AND type = 'text'
      ORDER BY timestamp DESC
      LIMIT 50
    `;
    const searchPattern = `%${keyword}%`;

    pool.query(sql, [roomId, searchPattern], (err, res) => {
      if (err) {
        console.error("搜索消息失败:", err.message);
        reject(err);
      } else {
        resolve(res.rows);
      }
    });
  });
}

// 删除消息功能
function deleteMessage(id) {
  return new Promise((resolve, reject) => {
    const sql = `DELETE FROM messages WHERE id = $1`;
    pool.query(sql, [id], (err, res) => {
      if (err) {
        console.error("删除消息失败:", err.message);
        reject(err);
      } else {
        resolve(res.rowCount);
      }
    });
  });
}

// 批量更新用户头像
function updateUserAvatar(userId, newAvatarUrl) {
  return new Promise((resolve, reject) => {
    if (!userId || !newAvatarUrl) {
      resolve(0);
      return;
    }
    const sql = `UPDATE messages SET "userAvatar" = $1 WHERE "userId" = $2`;
    pool.query(sql, [newAvatarUrl, userId], (err, res) => {
      if (err) {
        console.error("更新用户头像失败:", err.message);
        reject(err);
      } else {
        console.log(
          `✅ 已同步更新用户 ${userId} 的 ${res.rowCount} 条历史消息头像`
        );
        resolve(res.rowCount);
      }
    });
  });
}

module.exports = {
  saveMessage,
  getMessages,
  searchMessages,
  deleteMessage,
  updateUserAvatar,
};
