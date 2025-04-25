// routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db'); // 外部資料庫連線
const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || 'your-fallback-key';

//  註冊
router.post('/register', async (req, res) => {
  try {
  console.log(req.body); // 檢查是否收到正確的 body 資料
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: '請輸入帳號與密碼' });

  
    // 使用 bcrypt 加密密碼
    const hashedPassword = await bcrypt.hash(password, 10);

    // SQL 查詢語句，將新用戶插入資料庫
    const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.run(sql, [username, hashedPassword], function (err) {
      if (err) {
        // 若帳號已存在，返回相應錯誤訊息
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ message: '此帳號已存在' });
        }
        // 資料庫其他錯誤處理
        return res.status(500).json({ message: '資料庫錯誤' });
      }

      // 註冊成功，返回用戶 ID
      res.status(201).json({ message: '註冊成功', userId: this.lastID });
    });
  } catch (err) {
    // 伺服器錯誤處理
    res.status(500).json({ message: '伺服器錯誤' });
  }
});

//  登入
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: '請輸入帳號與密碼' });

  const sql = 'SELECT * FROM users WHERE username = ?';
  db.get(sql, [username], async (err, user) => {
    if (err) return res.status(500).json({ message: '資料庫錯誤' });
    if (!user) return res.status(404).json({ message: '帳號不存在' });

    try {
      // 使用 bcrypt 比對密碼
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(400).json({ message: '密碼錯誤' });

      // 密碼比對成功，生成 JWT token
      const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
      res.json({ message: '登入成功', token });
    } catch (err) {
      // 伺服器錯誤處理
      res.status(500).json({ message: '伺服器錯誤' });
    }
  });
});

module.exports = router;
