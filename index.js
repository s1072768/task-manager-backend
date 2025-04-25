// index.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 3000;

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./tasks/routes');
const authenticateToken = require('./middleware/authMiddleware');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ✅ 不需驗證的放前面
app.use('/api/auth', authRoutes);

// ✅ 驗證中介層放在中間
app.use(authenticateToken);

// ✅ 需要驗證的放後面
app.use('/api', taskRoutes);

app.listen(PORT, () => {
  console.log(`✅ 伺服器已啟動：http://localhost:${PORT}`);
});
