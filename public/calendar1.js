// 取得整個行事曆表格容器
var calendar = document.getElementById("calendar-table");

// 取得表格內部用來放日期格子的區塊
var gridTable = document.getElementById("table-body");

// 取得今天的日期物件
var currentDate = new Date();

// 初始化選擇的日期為今天
window.selectedDate = currentDate;

// 初始時沒有任何日期被選取
var selectedDayBlock = null;

// 儲存所有事件的物件，使用日期字串為 key
var globalEventObj = {};

// 側邊欄元素，用來顯示當日事件
var sidebar = document.getElementById("sidebar");


function createCalendar(date, side) {
   fetch('https://task-manager-backend-l9va.onrender.com/api/tasks', {
      method: 'GET',
      headers: getAuthHeader(),
    })

   var currentDate = date;  // 目前要顯示的月份
   var startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1); // 當月第一天

   // 取得月份標題的元素
   var monthTitle = document.getElementById("month-name");

   // 以中文格式顯示月份與年份
   var monthName = currentDate.toLocaleString("zh-TW", { month: "long" });
   var yearNum = currentDate.toLocaleString("zh-TW", { year: "numeric" });
   monthTitle.innerHTML = ` ${yearNum}${monthName}`; // 例如「五月 2025」

   // 根據點擊方向決定動畫效果
   if (side == "left") {
      gridTable.className = "animated fadeOutRight";
   } else {
      gridTable.className = "animated fadeOutLeft";
   }

   // 延遲動畫結束後建立新表格
   setTimeout(() => {
      gridTable.innerHTML = ""; // 清除之前的日期格子

      // 新增一行（星期一到日）
      var newTr = document.createElement("div");
      newTr.className = "row";
      var currentTr = gridTable.appendChild(newTr);

      // 對齊第一天的星期幾，補空白格
      for (let i = 1; i < (startDate.getDay() || 7); i++) {
         let emptyDivCol = document.createElement("div");
         emptyDivCol.className = "col empty-day";
         currentTr.appendChild(emptyDivCol);
      }

      // 計算這個月有幾天
      var lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

      // 建立每一格的日期
      for (let i = 1; i <= lastDay; i++) {
         if (currentTr.children.length >= 7) {
            currentTr = gridTable.appendChild(addNewRow()); // 每 7 天換行
         }

         let currentDay = document.createElement("div");
         currentDay.className = "col";
         currentDay.innerHTML = i; // 顯示日期數字

         // 判斷是否為今天或目前選取的日期
         if (
            // 判斷條件一：尚未有選中的格子（第一次載入），且 i 為今天的日期
            (selectedDayBlock == null && i == currentDate.getDate()) ||
         
            // 判斷條件二：這個格子的日期和目前選中的日期相同
            selectedDate.toDateString() == new Date(currentDate.getFullYear(), currentDate.getMonth(), i).toDateString()
         ) {
            // 如果上述任一條件為真，就將這個格子設為目前選中的日期
            selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
         
            // 將右側標題顯示為所選日期（中文格式：幾月幾號幾年）
            document.getElementById("eventDayName").innerHTML = selectedDate.toLocaleString("zh-TW", {
               month: "long", day: "numeric", year: "numeric"
            });
         
            // 將目前這個格子設為被選中的格子，用來之後移除樣式
            selectedDayBlock = currentDay;
         
            // 延遲加入選中樣式
            setTimeout(() => {
               currentDay.classList.add("blue");
               currentDay.classList.add("lighten-3");
            }, 900);
         }

         // 如果當天有事件，就加一個小標記
         if (globalEventObj[new Date(currentDate.getFullYear(), currentDate.getMonth(), i).toDateString()]) {
            let eventMark = document.createElement("div");
            eventMark.className = "day-mark";
            currentDay.appendChild(eventMark);
         }

         currentTr.appendChild(currentDay); // 加入到目前行
      }

      // 最後一行如果不足七格，補空白格
      for (let i = currentTr.getElementsByTagName("div").length; i < 7; i++) {
         let emptyDivCol = document.createElement("div");
         emptyDivCol.className = "col empty-day";
         currentTr.appendChild(emptyDivCol);
      }

      // 淡入動畫
      if (side == "left") {
         gridTable.className = "animated fadeInLeft";
      } else {
         gridTable.className = "animated fadeInRight";
      }

      // 建立新的一行
      function addNewRow() {
         let node = document.createElement("div");
         node.className = "row";
         return node;
      }

   }, !side ? 0 : 270);
  
   console.log(currentDate);
   
}

createCalendar(currentDate); // 初始建立行事曆

var todayDayName = document.getElementById("todayDayName"); // 顯示今天日期的元素
todayDayName.innerHTML = "今天是 " + currentDate.toLocaleString("zh-TW", {
   weekday: "long", day: "numeric", month: "short"
}); // 顯示今天是幾月幾號星期幾（使用中文格式）

var prevButton = document.getElementById("prev"); // 取得上一月按鈕
var nextButton = document.getElementById("next"); // 取得下一月按鈕

prevButton.onclick = function changeMonthPrev() {
   currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1); // 將月份往前一個月
   createCalendar(currentDate, "left"); // 重新建立左滑進入的行事曆
}
nextButton.onclick = function changeMonthNext() {
   currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1); // 將月份往後一個月
   createCalendar(currentDate, "right"); // 重新建立右滑進入的行事曆
}

function addEvent(title, desc) {
   if (!globalEventObj[selectedDate.toDateString()]) {
      globalEventObj[selectedDate.toDateString()] = {}; // 若當天沒事件則先建立空物件
   }
   globalEventObj[selectedDate.toDateString()][title] = desc; // 將事件標題與描述存入對應日期中
}

function formatDate(date) {
   const d = new Date(date);
   d.setDate(d.getDate() + 1); // ✅ 自動跨月與閏年處理
   return d.toISOString().split('T')[0];
 }
 
 

// 用來創建每個欄位的函式
function createTaskField(container, className, textContent, prefix = '') {
   if (textContent && textContent.trim() !== '') {
      let div = document.createElement('div');
      div.className = className;
      div.textContent = prefix + textContent;
      container.appendChild(div);
   }
}

function showEvents() {
   let sidebarEvents = document.getElementById("sidebarEvents");
   let selectedDateStr = selectedDate.toISOString().split('T')[0]; // 取得選取日期的字串
   sidebarEvents.innerHTML = ""; // 清空原本事件顯示區

   // 使用 fetch 向後端請求該日期的事件資料
   fetch(`https://task-manager-backend-l9va.onrender.com/api/tasks`, {
      method: 'GET',
      headers: getAuthHeader()
   })
   .then(res => res.json())
   .then(data => {
      const tasks = data.tasks;
      const matchingTask = tasks.filter(task => task.selected_date === selectedDateStr);
      if (matchingTask.length > 0) {
         let eventsCount = 0;
         matchingTask.forEach(task => {
            let eventContainer = document.createElement("div");
            eventContainer.className = "eventCard";

            // 直接使用封裝函式來創建欄位
            createTaskField(eventContainer, "eventCard-header", task.title);  // 標題
            createTaskField(eventContainer, "eventCard-description", task.description); // 描述
            createTaskField(eventContainer, "eventCard-location", "📍 " + (task.location_name));  // 地點

            // 新增額外欄位（電話、電子郵件、網址等）
            createTaskField(eventContainer, "eventCard-tel", task.tel, "📞 ");
            createTaskField(eventContainer, "eventCard-email", task.email, "📧 ");
            createTaskField(eventContainer, "eventCard-url", task.url, "🔗 ");

            // 時間區段
            if (task.start_time || task.end_time) {
               const timeDiv = document.createElement("div");
               timeDiv.className = "eventCard-time";
               let start = task.start_time ? `🕒 開始：${task.start_time}` : '';
               let end = task.end_time ? `　結束：${task.end_time}` : '';
               timeDiv.appendChild(document.createTextNode(start + end));
               eventContainer.appendChild(timeDiv);
            }

            // 標記圓點
            let markWrapper = document.createElement("div");
            markWrapper.className = "eventCard-mark-wrapper";
            let mark = document.createElement("div");
            mark.className = "eventCard-mark";
            markWrapper.appendChild(mark);

            // 編輯與刪除按鈕
            let buttonGroup = document.createElement("div");
            buttonGroup.className = "eventCard-buttons";
            let editButton = document.createElement("button");
            editButton.textContent = "編輯";
            editButton.className = "editButton";
            editButton.onclick = function () {
               // 避免重複產生編輯表單
               if (document.getElementById(`edit-form-${task.id}`)) return;

               const editForm = document.createElement("div");
               editForm.id = `edit-form-${task.id}`;
               editForm.className = "edit-form";

                // 標題輸入欄位
               const titleInput = document.createElement("input");
               titleInput.type = "text";
               titleInput.placeholder = "標題";
               titleInput.value = task.title;
               titleInput.className = "edit-input";
               titleInput.id = `edit-title-${task.id}`;
               editForm.appendChild(titleInput);
             
               // 描述輸入欄位
               const descriptionInput = document.createElement("textarea");
               descriptionInput.placeholder = "描述";
               descriptionInput.value = task.description || "" ;
               descriptionInput.className = "edit-textarea";
               descriptionInput.id = `edit-description-${task.id}`;
               editForm.appendChild(descriptionInput);

               //地點輸入欄位
               const locationInput = document.createElement("input");
               locationInput.type = "text";
               locationInput.placeholder = "地點";
               locationInput.value = task.location_name || "";  // ← 這裡要用 .value
               locationInput.className = "edit-location";
               locationInput.id = `edit-location-${task.id}`;
               editForm.appendChild(locationInput);

               //電話輸入欄位
               const telInput = document.createElement("input");
               telInput.type = "tel";
               telInput.placeholder = "電話";
               telInput.value = task.tel || "";  // ← 這裡要用 .value
               telInput.className = "edit-tel";
               telInput.id = `edit-tel-${task.id}`;
               editForm.appendChild(telInput);

               //網址輸入欄位
               const urlInput = document.createElement("input");
               urlInput.type = "url";
               urlInput.placeholder = "網址";
               urlInput.value = task.url || "";  // ← 這裡要用 .value
               urlInput.className = "edit-url";
               urlInput.id = `edit-url-${task.id}`;
               editForm.appendChild(urlInput);

               //電子郵件輸入欄位
               const emailInput = document.createElement("input");
               emailInput.type = "email";
               emailInput.placeholder = "電子郵件";
               emailInput.value = task.email || "";  // ← 這裡要用 .value
               emailInput.className = "edit-email";
               emailInput.id = `edit-email-${task.id}`;
               editForm.appendChild(emailInput);

               //開始輸入欄位
               const startInput = document.createElement("input");
               startInput.type = "text";
               startInput.placeholder = "開始-格式：24hr HH:mm";
               startInput.value = task.start_time || "";  // ← 這裡要用 .value
               startInput.className = "edit-start_time";
               startInput.id = `edit-start_time-${task.id}`;
               editForm.appendChild(startInput);

               //結束輸入欄位
               const endInput = document.createElement("input");
               endInput.type = "text";
               endInput.placeholder = "結束-格式：24hr HH:mm";
               endInput.value = task.end_time || "";  // ← 這裡要用 .value
               endInput.className = "edit-end_time";
               endInput.id = `edit-end_time-${task.id}`;
               editForm.appendChild(endInput);

               // 儲存按鈕
               const saveBtn = document.createElement("button");
               saveBtn.type = "submit";
               saveBtn.textContent = "儲存";
               saveBtn.className = "edit-save-btn";
               saveBtn.onclick = function () {
                  console.log(task.id);
                  submitEdit(task.id); // 提交編輯資料
                  editForm.remove(); // 移除編輯表單
               };
               editForm.appendChild(saveBtn);

               // 取消按鈕
               const cancelBtn = document.createElement("button");
               cancelBtn.textContent = "取消";
               cancelBtn.className = "edit-cancel-btn";
               cancelBtn.onclick = function () {
                  editForm.remove();
               };
               editForm.appendChild(cancelBtn);

               // 插入到原本卡片下方
               eventContainer.appendChild(editForm);
            };

            let deleteButton = document.createElement("button");
            deleteButton.textContent = "刪除";
            deleteButton.className = "deleteButton";
            deleteButton.onclick = function () {
              deleteTask(task.id);
              eventContainer.remove();
            };

            buttonGroup.appendChild(editButton);
            buttonGroup.appendChild(deleteButton);

            // 加入到卡片中
            let eventBody = document.createElement("div");
            eventBody.className = "eventCard-body";
            eventBody.appendChild(markWrapper);
            eventBody.appendChild(buttonGroup);
            eventContainer.appendChild(eventBody);

            // 加入側邊欄
            sidebarEvents.appendChild(eventContainer);
            eventsCount++;
         });

         // 顯示事件數量
         let emptyFormMessage = document.getElementById("emptyFormTitle");
         emptyFormMessage.innerHTML = `共有${eventsCount}件事件`;
      } else {
         let emptyMessage = document.createElement("div");
         emptyMessage.className = "empty-message";
         emptyMessage.innerHTML = "這裡沒東西";
         sidebarEvents.appendChild(emptyMessage);
         let emptyFormMessage = document.getElementById("emptyFormTitle");
         emptyFormMessage.innerHTML = "現在沒有事件";
      }
   })
   .catch(err => {
      console.error("Failed to fetch events:", err);
   });
}



gridTable.onclick = function (e) {
   if (!e.target.classList.contains("col") || e.target.classList.contains("empty-day")) return; // 若非點擊有效日期格則跳出

   if (selectedDayBlock && selectedDayBlock.classList.contains("blue") && selectedDayBlock.classList.contains("lighten-3")) {
      selectedDayBlock.classList.remove("blue");
      selectedDayBlock.classList.remove("lighten-3"); // 取消先前選取的日期樣式
   }

   selectedDayBlock = e.target; // 更新為目前點擊的格子
   selectedDayBlock.classList.add("blue");
   selectedDayBlock.classList.add("lighten-3"); // 加入高亮樣式

   selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), parseInt(e.target.innerHTML)); // 取得點擊的實際日期
   showEvents(); // 顯示該日期的事件
   console.log('234--', selectedDate.toISOString().split('T')[0]);

   document.getElementById("eventDayName").innerHTML = selectedDate.toLocaleString("zh-TW", {
      month: "long", day: "numeric", year: "numeric"
   }); // 更新右側標題，顯示所選日期
}


var changeFormButton = document.getElementById("changeFormButton");
var addForm = document.getElementById("addForm");
changeFormButton.onclick = function (e) {
   addForm.style.top = 0; // 顯示新增事件表單
}

var cancelAdd = document.getElementById("cancelAdd");
const form = document.getElementById('task-form');
cancelAdd.onclick = function (e) {
   addForm.style.top = "100%"; // 隱藏表單
   let inputs = addForm.getElementsByTagName("input");
   for (let i = 0; i < inputs.length; i++) inputs[i].value = ""; // 清空輸入
   let labels = addForm.getElementsByTagName("label");
   for (let i = 0; i < labels.length; i++) labels[i].className = ""; // 重設 label 樣式
   form.reset(); 
   document.getElementById('Type').innerHTML = '';

}
