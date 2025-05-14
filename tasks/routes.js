// tasks/routes.js
const express = require('express');
const router = express.Router();
const { createTask, getAllTasks,  updateTasks,  deleteTasks} = require('./controller');  // 引入 getAllTasks 函數
const authenticateToken = require('../middleware/authMiddleware'); // 引入 JWT 驗證中介軟體

// 在這裡使用中介軟體，使所有後續的路由都需要 JWT 驗證
router.use(authenticateToken);

// 設定 POST /tasks 路由，新增任務
router.post('/tasks', createTask);

// 設定 GET /tasks 路由，讀取所有任務
router.get('/tasks', getAllTasks);  // 使用 getAllTasks

// 設定 PUT /tasks/:id 路由，更新任務
router.put('/tasks/:id', updateTasks);

// 設定 DELETE /tasks/:id 路由，刪除任務
router.delete('/tasks/:id', deleteTasks);

module.exports = router;