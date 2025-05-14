// location.js

let map; // 地圖變數
let marker;

const enableLocationCheckbox = document.getElementById('enable-location');
const locationFields = document.getElementById('location-fields');

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
        document.getElementById('location_name').value;
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
    document.getElementById('location_name').value = ''; // 清空地點名稱
  }
});
