// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'your-fallback-key';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']; // 從 header 取出 Authorization 欄位
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: '未提供 Token' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token 無效或過期' });

    req.user = user; // 把解碼出來的 user 附加到 req 上
    next(); // 繼續執行後續的處理器
  });
}

module.exports = authenticateToken;
