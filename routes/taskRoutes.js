const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const router = express.Router();
const db = require('../initDB');

// JWT 驗證中介軟體
function authenticateToken(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: '未提供授權令牌' });

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) return res.status(403).json({ message: '無效的授權令牌' });
    req.user = user;
    next();
  });
}

// 所有路由都需要身份驗證
router.use('/tasks', authenticateToken);

// 讀取所有任務
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM tasks WHERE user_id = ?';
  db.all(sql, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ tasks: rows });
  });
});

// 新增任務
router.post('/', (req, res) => {
  const { title, description, due_date } = req.body;
  const sql = 'INSERT INTO tasks (title, description, due_date, user_id) VALUES (?, ?, ?, ?)';
  const params = [title, description, due_date, req.user.id];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: '任務新增成功', id: this.lastID });
  });
});

// 更新任務
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, due_date } = req.body;

  const sql = 'UPDATE tasks SET title = ?, description = ?, due_date = ? WHERE id = ? AND user_id = ?';
  const params = [title, description, due_date, id, req.user.id];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ message: '任務未找到或無權修改' });
    res.json({ message: '任務已更新', id });
  });
});

// 刪除任務
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM tasks WHERE id = ? AND user_id = ?';
  const params = [id, req.user.id];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ message: '任務未找到或無權刪除' });
    res.json({ message: '任務已刪除', id });
  });
});

module.exports = router;
