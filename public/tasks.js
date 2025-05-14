// tasks.js

  console.log('authToken 是:', localStorage.getItem('authToken'));

  document.getElementById('task-form').addEventListener('submit', function (e) {
      e.preventDefault();
      const title = document.getElementById('title').value.trim();
      const description = document.getElementById('description').value;
      //const due_date = document.getElementById('due_date').value
      const location_name = document.getElementById('location_name').value;
      if (!title) {
          alert('請輸入任務標題');
          return;
      }

      const latitude = document.getElementById('latitude').value;
      const longitude = document.getElementById('longitude').value;
      let selectedDateStr = selectedDate.toISOString().split('T')[0];
      const tel = document.getElementById('tel')?.value || "";
      const url = document.getElementById('url')?.value || "";
      const email = document.getElementById('email')?.value || "";
      const start_time = document.getElementById('start_time')?.value;
      const end_time = document.getElementById('end_time')?.value;


      // 前端送出的資料格式 (tasks.js)
      const taskData = {
        title,
        description,
        selected_date: selectedDateStr,
        location: {
          latitude,
          longitude,
          location_name
        },
        newType:{
          tel,
          url,
          email,
          start_time,
          end_time
        }
      };

      console.log(taskData)

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
        document.getElementById('location_name').value = '';
        selectedDateStr = '';
        const form = document.getElementById('task-form');
        form.reset(); 
        document.getElementById('Type').innerHTML = '';

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
    fetch(`https://task-manager-backend-l9va.onrender.com/api/tasks/${id}`, {
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
    const tel = document.getElementById(`edit-tel-${id}`).value;
    const url = document.getElementById(`edit-url-${id}`).value;
    const email = document.getElementById(`edit-email-${id}`).value;
    const start_time = document.getElementById(`edit-start_time-${id}`).value;
    const end_time = document.getElementById(`edit-end_time-${id}`).value;

    
    // 發送 PATCH 請求，並確保不更新 selected_date
    fetch(`https://task-manager-backend-l9va.onrender.com/api/tasks/${id}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify({ title, description, location_name, tel, url, email, start_time, end_time })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message || '更新成功');
        console.log(email)
    })
    .catch(err => {
        console.error('更新任務失敗', err);
        alert(err.message || '更新失敗');
    });
}

  document.getElementById('addInputBtn').addEventListener('click', function () {
    const select = document.getElementById('inputTypeSelect');
    const selectedValue = select.value;
    const typeContainer = document.getElementById('Type'); // 把 input 都放進這裡
    const labelText = select.options[select.selectedIndex].text;
    const existingInput = typeContainer.querySelector(`input[id="${selectedValue}"]`);

    if (!selectedValue) {
      alert('請先選擇一個欄位類型！');
      return;
    }

    if (existingInput) {
      alert(`欄位類型「${labelText}」已經新增過了！`);
      return;
    }

    if (selectedValue === 'time') {
      // Start Time
      const startLabel = document.createElement('label');
      startLabel.textContent = '開始';
      const startInput = document.createElement('input');
      startInput.placeholder = '開始-格式：24hr HH:mm'
      startInput.type = 'text';
      startInput.className = 'form-control my-2';
      startInput.id = "start_time";

      // End Time
      const endLabel = document.createElement('label');
      endLabel.textContent = '結束';
      const endInput = document.createElement('input');
      endInput.placeholder = '結束-格式：24hr HH:mm'
      endInput.type = 'text';
      endInput.className = 'form-control my-2';
      endInput.id = "end_time";

      // 加到 #Type 裡面
      typeContainer.appendChild(startLabel);
      typeContainer.appendChild(startInput);
      typeContainer.appendChild(endLabel);
      typeContainer.appendChild(endInput);

    } else {    
      const input = document.createElement('input');
      input.type = selectedValue;
      input.placeholder = `請輸入 ${labelText}`;
      input.className = 'form-control my-2';
      input.id = selectedValue;
      // 加到 #Type 裡面
      typeContainer.appendChild(input);
    }
  });

