// tasks/routes.js
const express = require('express');
const router = express.Router();
const { createTask, getAllTasks } = require('./controller');  // 引入 getAllTasks 函數

// 設定 POST /tasks 路由，新增任務
router.post('/tasks', createTask);

// 設定 GET /tasks 路由，讀取所有任務
router.get('/tasks', getAllTasks);  // 使用 getAllTasks

module.exports = router;
