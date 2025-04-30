// auth.js

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
  
    fetch('https://task-manager-backend-l9va.onrender.com/api/auth/register', {
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
  
    fetch('https://task-manager-backend-l9va.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        showScreen('task-screen');
        initCalendar();
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
  
