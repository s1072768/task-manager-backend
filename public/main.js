let map; // 把 map 宣告在外面
let marker;
let location_name = ''

  const enableLocationCheckbox = document.getElementById('enable-location');
  const locationFields = document.getElementById('location-fields');
  const location_nameInput = document.getElementById('location-name');

  enableLocationCheckbox.addEventListener('change', () => {
    if (enableLocationCheckbox.checked) {
      locationFields.classList.remove('hidden');

      if (!map) {
        // 靜宜大學座標
        const providenceUniversity = [24.2256, 120.5783];

        // 預設先用靜宜大學
        map = L.map('map').setView(providenceUniversity, 16);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap'
        }).addTo(map);

        // 嘗試抓使用者位置
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const userLat = position.coords.latitude;
              const userLng = position.coords.longitude;
              map.setView([userLat, userLng], 16); // 把地圖中心移到使用者位置
            },
            (error) => {
              console.log('無法取得定位，使用預設位置', error);
              // 出錯時就保持靜宜大學
            }
          );
        }

        map.on('click', function (e) {
          const { lat, lng } = e.latlng;

          if (marker) {
            map.removeLayer(marker);
          }
          marker = L.marker([lat, lng]).addTo(map);

          document.getElementById('latitude').value = lat;
          document.getElementById('longitude').value = lng;
          location_name = location_nameInput.value;
        });
      }

      // 如果是從隱藏狀態打開地圖，要重新計算尺寸
      setTimeout(() => {
        map.invalidateSize();
      }, 100);

    } else {
        locationFields.classList.add('hidden');
        document.getElementById('latitude').value = '';
        document.getElementById('longitude').value = '';
        location_nameInput.value = '';
        location_name = ''; // 清空地點名稱
    }
  });

    function getAuthHeader() {
      const token = localStorage.getItem('authToken');
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
    }

    function showScreen(id) {
      ['start-screen', 'register-screen', 'login-screen', 'task-screen'].forEach(screen => {
        document.getElementById(screen).classList.add('hidden');
      });
      document.getElementById(id).classList.remove('hidden');
    }
  
    function handleRegister() {
      const username = document.getElementById('register-username').value.trim();
      const password = document.getElementById('register-password').value.trim();
  
      if (!username || !password) {
        alert('請輸入使用者名稱與密碼');
        return;
      }
  
      fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      .then(res => res.json())
      .then(data => {
        alert(data.message);
        if (data.message === '註冊成功') showScreen('login-screen');
      })
      .catch(err => {
        console.error('註冊錯誤', err);
        alert('註冊失敗，請稍後再試');
      });
    }
  
    function handleLogin() {
      const username = document.getElementById('login-username').value.trim();
      const password = document.getElementById('login-password').value.trim();
  
      if (!username || !password) {
        alert('請輸入使用者名稱與密碼');
        return;
      }
  
      fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      .then(res => res.json())
      .then(data => {
        if (data.token) {
          localStorage.setItem('authToken', data.token);
          showScreen('task-screen');
          loadTasks();
        } else {
          alert('登入失敗：' + (data.message || '請確認帳號密碼'));
        }
      })
      .catch(err => {
        console.error('登入錯誤', err);
        alert('登入失敗，請稍後再試');
      });
    }
    
    function deleteTask(id) {
        if (!confirm('確定要刪除這個任務嗎？')) return;
      
        const token = localStorage.getItem('authToken');
      
        fetch(`http://localhost:3000/api/tasks/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        .then(res => res.json())
        .then(data => {
          alert(data.message || '刪除成功');
          loadTasks(); // 重新載入任務列表
        })
        .catch(err => {
          console.error('刪除任務失敗', err);
          alert(err.message || '刪除失敗');
        });
      }
      
    document.getElementById('task-form').addEventListener('submit', function (e) {
      e.preventDefault();
      const title = document.getElementById('title').value.trim();
      const description = document.getElementById('description').value.trim();
      const due_date = document.getElementById('due_date').value;
  
      if (!title) {
        alert('請輸入任務標題');
        return;
      }
  
      const latitude = document.getElementById('latitude').value;
      const longitude = document.getElementById('longitude').value;

      const taskData = {
        title,
        description,
        due_date,
        location: {
            latitude,
            longitude,
            name: location_name
        }
      };
  
      fetch('http://localhost:3000/api/tasks', {
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
        // 清空表單
        document.getElementById('title').value = '';
        document.getElementById('description').value = '';
        document.getElementById('due_date').value = '';
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
  
    function loadTasks() {
      fetch('http://localhost:3000/api/tasks', {
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
                <br>📅 ${task.due_date}
                <br>📍 地點: ${task.location?.location_name || '未命名'}
                <div class="mt-2 space-x-2">
                    <button onclick="showEditForm(${task.id}, '${task.title}', \`${task.description || ''}\`, '${task.due_date}')" class="text-sm text-blue-600 hover:underline">✏️ 編輯</button>
                    <button onclick="deleteTask(${task.id})" class="text-sm text-red-600 hover:underline">🗑️ 刪除</button>
                </div>

                <form id="edit-form-${task.id}" class="hidden space-y-2 mt-2">

                  <input type="text" id="edit-title-${task.id}" value="${task.title}" class="w-full border p-1 rounded"/>
                  
                  <textarea id="edit-description-${task.id}" class="w-full border p-1 rounded">${task.description || ''}</textarea>
                  
                  <input type="date" id="edit-due-date-${task.id}" value="${task.due_date}" class="w-full border p-1 rounded"/>
                  
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
        if (!confirm('確定要刪除這個任務嗎？')) return;
    
        const token = localStorage.getItem('authToken');
    
        fetch(`http://localhost:3000/api/tasks/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
        })
        .then(res => res.json())
        .then(data => {
        alert(data.message || '刪除成功');
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

      const token = localStorage.getItem('authToken');

      fetch(`http://localhost:3000/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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