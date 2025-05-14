const sqlite3 = require('sqlite3').verbose();

// 連接資料庫（檔案名：tasks.db，如果不存在會自動建立）
const db = new sqlite3.Database('tasks.db');

// 建立 tasks 資料表（如果尚未存在）
db.serialize(() => {
  // 重新創建 tasks 資料表
  db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      selected_date DATE,
      tel TEXT,
      url TEXT,
      email TEXT,
      start_time TEXT,
      end_time TEXT,
      latitude REAL,
      longitude REAL,
      location_name TEXT,
      status TEXT DEFAULT 'pending',
      user_id INTEGER,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);

  // 確保 users 資料表存在
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT,
      password TEXT
    );
  `);
});

module.exports = db;
