// tasks/controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT)");
  db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    selected_date DATE,
    latitude REAL,
    longitude REAL,
    location_name TEXT,
    status TEXT DEFAULT 'pending',
    user_id INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
  });

// 新增任務
function createTask(req, res) {
  console.log("req.body", req.body);
  const { title, description, selected_date , location } = req.body;
  const status = 'pending';
  const latitude = location ? location.latitude : null;
  const longitude = location ? location.longitude : null;
  const location_name = location? location.location_name : null;
  const userId = req.user.id;

  if (!title) {
    return res.status(400).json({ error: '標題是必填欄位' });
  }

  const sql = `
    INSERT INTO tasks (
      title, description, selected_date ,
      latitude, longitude, location_name,
      user_id, status
    ) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [
      title,
      description,
      selected_date ,
      latitude,
      longitude,
      location_name,
      userId,
      status
    ],
   function (err) {
    if (err) {
      return res.status(500).json({ error: '新增任務失敗', details: err.message });
    }

    res.status(201).json({
      message: '任務新增成功',
      task: {
        id: this.lastID,
        title,
        description,
        selected_date ,
        latitude,
        longitude,
        location_name: location_name
      },
    }
  );
  });
}

// 讀取所有任務
function getAllTasks(req, res) {
  const userId = req.user.id; 
  const date = req.query.date;

  let sql = 'SELECT * FROM tasks WHERE user_id = ?';
  const params = [userId];

  if (date) {
    sql += ' AND selected_date = ?';
    params.push(date);
  }

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
  const updates = [];
  const params = [];

  if (req.body.title !== undefined) {
    updates.push("title = ?");
    params.push(req.body.title);
  }
  if (req.body.description !== undefined) {
    updates.push("description = ?");
    params.push(req.body.description);
  }
  if (req.body.location_name !== undefined) {
    updates.push("location_name = ?");
    params.push(req.body.location_name);
  }

  if (updates.length === 0) {
    return res.status(400).json({ message: "沒有提供更新欄位" });
  }

  const sql = `UPDATE tasks SET ${updates.join(", ")} WHERE id = ?`;
  params.push(id);

  db.run(sql, params, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "任務未找到" });
    }
    res.json({ message: "任務已更新", id });
  });
  console.log(req.body);
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
  getAllTasks, 
  updateTasks,
  deleteTasks
};
