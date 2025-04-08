// index.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const taskRoutes = require('./tasks/routes');

const app = express();
const PORT = 3000;

// 中介軟體（middleware）
app.use(cors()); // 允許跨來源請求（給前端用）
app.use(express.json()); // 解析 JSON 請求
app.use(express.static(path.join(__dirname, 'public'))); // 提供 public 資料夾的靜態檔案

// 註冊任務路由
app.use('/', taskRoutes);

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`✅ 伺服器已啟動：http://localhost:${PORT}`);
});
