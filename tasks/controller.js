// 引入資料庫
const db = require('../db');

// 新增任務
function createTask(req, res) {
  const { title, description, due_date } = req.body;

  if (!title) {
    return res.status(400).json({ error: '標題是必填欄位' });
  }

  const sql = `
    INSERT INTO tasks (title, description, due_date)
    VALUES (?, ?, ?)
  `;

  db.run(sql, [title, description, due_date], function (err) {
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
  const sql = 'SELECT * FROM tasks';  // 查詢所有任務

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: '無法讀取任務資料', details: err.message });
    }

    res.status(200).json({ message: '任務列表', tasks: rows });
  });
}

module.exports = {
  createTask,
  getAllTasks,  // 確保這裡有匯出 getAllTasks 函數
};
