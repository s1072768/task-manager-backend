// tasks.js

  console.log('authToken 是:', localStorage.getItem('authToken'));

  document.getElementById('task-form').addEventListener('submit', function (e) {
      e.preventDefault();
      const title = document.getElementById('title').value.trim();
      const description = document.getElementById('description').value.trim();
      //const due_date = document.getElementById('due_date').value
      const location_name = document.getElementById('location_name').value;
      if (!title) {
          alert('請輸入任務標題');
          return;
      }

      const latitude = document.getElementById('latitude').value;
      const longitude = document.getElementById('longitude').value;
      let selectedDateStr = selectedDate.toISOString().split('T')[0];

      // 前端送出的資料格式 (tasks.js)
      const taskData = {
        title,
        description,
        selected_date: selectedDateStr,
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
        //document.getElementById('due_date').value = '';
        document.getElementById('location_name').value = '';
        selectedDateStr = '';
        //loadTasks();
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
  
  
  function deleteTask(id) {
    fetch(`http://localhost:3000/api/tasks/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    })
    .then(res => res.json())
    .then(data => {
      //loadTasks(); // 重新載入任務列表
    })
    .catch(err => {
      console.error('刪除任務失敗', err);
      alert(err.message || '刪除失敗');
    });
  }
  
  function submitEdit(id) {
    const title = document.getElementById(`edit-title-${id}`).value.trim();
    const description = document.getElementById(`edit-description-${id}`).value.trim();
    const location_name = document.getElementById(`edit-location-${id}`).value.trim();
    
    // 發送 PATCH 請求，並確保不更新 selected_date
    fetch(`http://localhost:3000/api/tasks/${id}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify({ title, description, location_name})
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message || '更新成功');
    })
    .catch(err => {
        console.error('更新任務失敗', err);
        alert(err.message || '更新失敗');
    });
}



