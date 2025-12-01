const { Pool } = require("pg");
require("dotenv").config();

if (!process.env.DATABASE_URL) {
  console.error("❌ 错误: 未在 .env 文件中找到 DATABASE_URL");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function initTables() {
  const client = await pool.connect();
  try {
    const sql = `
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        content TEXT,
        "userId" TEXT NOT NULL,
        "userAvatar" TEXT,
        "roomId" TEXT NOT NULL,
        timestamp BIGINT NOT NULL,
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

initTables();

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

function getMessages(roomId, limit = 20, beforeTimestamp = Date.now()) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT * FROM messages 
      WHERE "roomId" = $1 AND timestamp < $2
      ORDER BY timestamp DESC
      LIMIT $3
    `;
    pool.query(sql, [roomId, beforeTimestamp, limit], (err, res) => {
      if (err) {
        console.error("查询消息失败:", err.message);
        reject(err);
      } else {
        // 数据库返回的 BIGINT 是字符串，必须转为 Number
        const formattedRows = res.rows.map((row) => ({
          ...row,
          timestamp: parseInt(row.timestamp, 10),
        }));
        resolve(formattedRows.reverse());
      }
    });
  });
}

function searchMessages(roomId, keyword) {
  return new Promise((resolve, reject) => {
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
        const formattedRows = res.rows.map((row) => ({
          ...row,
          timestamp: parseInt(row.timestamp, 10),
        }));
        resolve(formattedRows);
      }
    });
  });
}

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
