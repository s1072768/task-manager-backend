// 引入資料庫
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT)");
  db.run("CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, due_date TEXT, status TEXT DEFAULT 'pending', user_id INTEGER, FOREIGN KEY(user_id) REFERENCES users(id))");
});

// 註冊功能
async function registerUser(req, res) {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10); // 加密密碼

  const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
  const params = [username, hashedPassword];

  db.run(sql, params, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: '註冊成功' });
  });
}

// 登入功能
function loginUser(req, res) {
  const { username, password } = req.body;

  const sql = 'SELECT * FROM users WHERE username = ?';
  const params = [username];

  db.get(sql, params, (err, row) => {
    if (err || !row) {
      return res.status(400).json({ message: '使用者或密碼錯誤' });
    }

    // 驗證密碼
    bcrypt.compare(password, row.password, (err, isMatch) => {
      if (!isMatch) {
        return res.status(400).json({ message: '使用者或密碼錯誤' });
      }

      // 密碼正確，生成 JWT
      const token = jwt.sign({ id: row.id, username: row.username }, 'your_jwt_secret', { expiresIn: '1h' });

      res.json({ message: '登入成功', token });
    });
  });
}

// 新增任務
function createTask(req, res) {
  const { title, description, due_date, is_completed, completed} = req.body;
  const userId = req.user.id;

  if (!title) {
    return res.status(400).json({ error: '標題是必填欄位' });
  }

  const sql = `
  INSERT INTO tasks (title, description, due_date, is_completed, completed, user_id) 
  VALUES (?, ?, ?, ?, ?, ?) `;

  db.run(sql, [title, description, due_date, is_completed, completed, userId], function (err) {
    if (err) {
      return res.status(500).json({ error: '新增任務失敗', details: err.message });
    }

    res.status(201).json({
      message: '任務新增成功',
      task: {
        id: this.lastID,
        title,
        description,
        due_date,
        is_completed: 0,
      },
    });
  });
}

// 讀取所有任務
function getAllTasks(req, res) {
  const userId = req.user.id; // 🔑 從 JWT 取得目前使用者 ID
  const sql = 'SELECT * FROM tasks WHERE user_id = ?';
  
  db.all(sql, [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: '無法讀取任務資料', details: err.message });
    }

    res.status(200).json({ message: '任務列表', tasks: rows });
  });
}

// 更新任務
function updateTasks(req, res) {
  const { id } = req.params;
  const { title, description, due_date } = req.body;

  const sql = 'UPDATE tasks SET title = ?, description = ?, due_date = ? WHERE id = ?';
  const params = [title, description, due_date, id];

  db.run(sql, params, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: '任務未找到' });
    }
    res.json({ message: '任務已更新', id });
  });
}

// 刪除任務
function deleteTasks(req, res) {
  const { id } = req.params;

  const sql = 'DELETE FROM tasks WHERE id = ?';
  const params = [id];

  db.run(sql, params, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: '任務未找到' });
    }
    res.json({ message: '任務已刪除', id });
  });
}

module.exports = {
  createTask,
  getAllTasks,  // 確保這裡有匯出 getAllTasks 函數
  updateTasks,
  deleteTasks,
  registerUser,
  loginUser
};
