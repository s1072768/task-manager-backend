const sqlite3 = require('sqlite3').verbose();

// 連接資料庫（檔案名：tasks.db，如果不存在會自動建立）
const db = new sqlite3.Database('tasks.db');

// 建立 tasks 資料表（如果尚未存在）
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      due_date TEXT,
      is_completed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
});

module.exports = db;
