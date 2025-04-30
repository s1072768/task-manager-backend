let calendar; // 全域變數，存 FullCalendar 實例
let mode = 'view'; // 'view'：預設瀏覽任務，'add'：新增任務模式

const toggleButton = document.getElementById('mode-toggle-btn');
  const listView = document.getElementById('list-view');
  const calendarView = document.getElementById('calendar-view');

  // 初始顯示月曆模式
  let isListView = false; // 默認顯示月曆視圖

  // 按鈕點擊事件：切換模式
  toggleButton.addEventListener('click', () => {
    isListView = !isListView; // 反轉視圖狀態

    if (isListView) {
      showListView()
    } else {
      showCalendarView()
    }
  });

// 新增 showListView 和 showCalendarView，給 HTML 的 onclick 呼叫
function showListView() {
  document.getElementById('list-view').classList.remove('hidden');
  document.getElementById('calendar-view').classList.add('hidden');
}

function showCalendarView() {
  document.getElementById('list-view').classList.add('hidden');
  document.getElementById('calendar-view').classList.remove('hidden');
  if (!calendar) {
    initCalendar();
  }
}

// 初始化 FullCalendar
function initCalendar() {
  const calendarEl = document.getElementById('calendar');

  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'zh-tw',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,listWeek'
    },
    events: loadCalendarEvents,
    dateClick: function(info) {
      if (mode === 'add') {
        // 新增任務模式
        openTaskForm(info.dateStr);
      } else {
        // 瀏覽模式
        showTasksOnDate(info.dateStr);
      }
    },
    eventContent: renderEventContent
  });

  calendar.render();
}

// 載入任務資料
function loadCalendarEvents(fetchInfo, successCallback, failureCallback) {
  fetch('http://localhost:3000/api/tasks', {
    headers: getAuthHeader(),
  })
  .then(res => res.json())
  .then(data => {
    const events = data.tasks.map(task => ({
      title: task.title,
      start: task.due_date,
      description: task.description
    }));
    console.log(events);
    successCallback(events);
  })
  .catch(err => {
    console.error('載入月曆事件錯誤', err);
    failureCallback(err);
  });
}

// 點擊日期 - 顯示當日任務
function showTasksOnDate(dateStr) {
  const events = calendar.getEvents();

  const todayTasks = events.filter(event => event.startStr.slice(0, 10) === dateStr);

  if (todayTasks.length === 0) {
    alert('這天沒有任務喔！');
  } else {
    const taskList = todayTasks.map(event =>
       ` ${event.title}
       \n${event.extendedProps.description}`).join('\n');
    alert(`📅 ${dateStr} 任務：\n\n${taskList}`);
  }
}


// 點擊日期 - 開啟新增任務表單
function openTaskForm(selectedDate) {
  showListView();

  setTimeout(() => {
    const dueDateInput = document.getElementById('due_date');
    if (dueDateInput) {
      // 將 "2025-04-02" 補上時間為 00:00
      const datetimeString = `${selectedDate}T00:00`;
      dueDateInput.value = datetimeString;
      console.log('設定完成日期為：', dueDateInput.value);
    } else {
      console.warn('❗️ 找不到 #due_date');
    }
  }, 100);
}


function renderEventContent(info) {
  return {
    html: `<div class="hover:scale-105 transition-transform duration-300">${info.event.title}</div>`
  };
}

// 新增 / 瀏覽模式切換按鈕
const switchToViewBtn = document.getElementById('switch-to-view');
const switchToAddBtn = document.getElementById('switch-to-add');

if (switchToViewBtn) {
  switchToViewBtn.addEventListener('click', () => {
    mode = 'view';
    console.log('已切換為瀏覽模式');
  });
}

if (switchToAddBtn) {
  switchToAddBtn.addEventListener('click', () => {
    mode = 'add';
    console.log('已切換為新增模式');
  });
}

