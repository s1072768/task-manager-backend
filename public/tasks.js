// tasks.js
  console.log('authToken 是:', localStorage.getItem('authToken'));

  
  document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const selectedDate = urlParams.get('date');  // 取得查詢參數中的 date
  
    if (selectedDate) {
      // 如果有日期參數，將其設置為任務表單的到期日
      document.getElementById('due_date').value = selectedDate;
    }
  
    // 設置其他頁面邏輯，像是顯示任務清單、提交表單等
    loadTasks();
  });

  function getAuthHeader() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('未登入，無 token');
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }


  document.getElementById('task-form').addEventListener('submit', function (e) {
      e.preventDefault();
      const title = document.getElementById('title').value.trim();
      const description = document.getElementById('description').value.trim();
      const due_date = document.getElementById('due_date').value
      const location_name = document.getElementById('location_name').value;
      if (!title) {
          alert('請輸入任務標題');
          return;
      }

      const latitude = document.getElementById('latitude').value;
      const longitude = document.getElementById('longitude').value;

      // 前端送出的資料格式 (tasks.js)
      const taskData = {
        title,
        description,
        due_date,
        location: {
          latitude,
          longitude,
          location_name
        }
      };

// 送出 POST 請求
    fetch('https://task-manager-backend-l9va.onrender.com/api/tasks', {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(taskData)
    })
    .then(res => {
        if (res.status === 403) throw new Error('登入已過期，請重新登入');
        return res.json();
    })
    .then(data => {
        alert(data.message || '新增成功');
        console.log("送出的 taskData：", taskData);
        // 清空表單
        document.getElementById('title').value = '';
        document.getElementById('description').value = '';
        document.getElementById('due_date').value = '';
        document.getElementById('location_name').value = '';
        loadTasks();
    })
    .catch(err => {
        console.error('新增任務錯誤', err);
        alert(err.message || '新增任務失敗');
        if (err.message.includes('登入')) {
          localStorage.removeItem('authToken');
          showScreen('login-screen');
      }
    });
  });

  function formatDate(dateString) {
    const date = new Date(dateString);  
  
    const year = date.getFullYear();  
    const month = (date.getMonth() + 1).toString().padStart(2, '0');  
    const day = date.getDate().toString().padStart(2, '0');  
  
    return `${year}-${month}-${day}`;
  }
  
  function loadTasks() {
    fetch('https://task-manager-backend-l9va.onrender.com/api/tasks', {
      headers: getAuthHeader(),
    })
    .then(res => {
      if (res.status === 403) throw new Error('登入已過期，請重新登入');
      return res.json();
    })
    .then(data => {
      const tasksList = document.getElementById('tasks-list');
      tasksList.innerHTML = '';
      if (data && Array.isArray(data.tasks)) {
        data.tasks.forEach(task => {
          const li = document.createElement('li');
          li.className = 'p-3 bg-gray-100 rounded shadow';
          li.innerHTML = `
            <div class="space-y-1">
              <strong>${task.title}</strong>
              <br>${task.description || ''}
              <br>📅 ${formatDate(task.due_date)}
              <br>📍 地點: ${task.location_name || ''}
              <div class="mt-2 space-x-2">
                  <button onclick="showEditForm(${task.id}, '${task.title}', \`${task.description || ''}\`, '${task.due_date}')" class="text-sm text-blue-600 hover:underline">✏️ 編輯</button>
                  <button onclick="deleteTask(${task.id})" class="text-sm text-red-600 hover:underline">🗑️ 刪除</button>
              </div>
              <form id="edit-form-${task.id}" class="hidden space-y-2 mt-2">
                <input type="text" id="edit-title-${task.id}" value="${task.title}" class="w-full border p-1 rounded"/>
                <textarea id="edit-description-${task.id}" class="w-full border p-1 rounded">${task.description || ''}</textarea>
                <input type="datetime-local" id="edit-due-date-${task.id}" value="${task.due_date}" class="w-full border p-1 rounded"/>
                <button type="button" onclick="submitEdit(${task.id})" class="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">儲存</button>
              </form>
            </div>
          `;
          tasksList.appendChild(li);
        });
      } else {
        console.error("tasks 不存在或不是陣列", data);
      }
    })
    .catch(err => {
      console.error('載入任務失敗', err);
      alert(err.message || '無法載入任務');
      if (err.message.includes('登入')) {
        localStorage.removeItem('authToken');
        showScreen('login-screen');
      }
    });
  }

  function showEditForm(id, title, description, due_date) {
    const form = document.getElementById(`edit-form-${id}`);
    form.classList.toggle('hidden');
  }
  
  function deleteTask(id) {
  
    fetch(`https://task-manager-backend-l9va.onrender.com/api/tasks/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    })
    .then(res => res.json())
    .then(data => {
      loadTasks(); // 重新載入任務列表
    })
    .catch(err => {
      console.error('刪除任務失敗', err);
      alert(err.message || '刪除失敗');
    });
  }
  
  
  function submitEdit(id) {
    const title = document.getElementById(`edit-title-${id}`).value.trim();
    const description = document.getElementById(`edit-description-${id}`).value.trim();
    const due_date = document.getElementById(`edit-due-date-${id}`).value;
    if (!title) {
        alert('標題不能為空');
        return;
    }

    fetch(`https://task-manager-backend-l9va.onrender.com/api/tasks/${id}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify({ title, description, due_date })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message || '更新成功');
        loadTasks(); // 更新畫面
    })
    .catch(err => {
        console.error('更新任務失敗', err);
        alert(err.message || '更新失敗');
    });
    }

