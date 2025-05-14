// auth.js

  function getAuthHeader() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('未登入，無 token');
    }
    return {  
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    
    };
  }


  function showScreen(id) {
    ['start-screen','task-screen'].forEach(screen => {
      document.getElementById(screen).classList.add('hidden');
    });
    document.getElementById(id).classList.remove('hidden');
    
  }

  const container1 = document.querySelector('.container1');
  const registerBtn = document.querySelector('.register-btn');
  const loginBtn = document.querySelector('.login-btn');

  registerBtn.addEventListener('click', () => {
      container1.classList.add('active');
  })

  loginBtn.addEventListener('click', () => {
      container1.classList.remove('active');
  })
  
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
      console.log(data)
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        showScreen('task-screen');
        //initCalendar();
        //loadTasks();
      } else {
        alert('登入失敗：' + (data.message || '請確認帳號密碼'));
      }
    })
    .catch(err => {
      console.error('登入錯誤', err);
      alert('登入失敗，請稍後再試');
    });
  }
  
