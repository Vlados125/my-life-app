// Ініціалізація Telegram WebApp SDK
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.expand(); // Розгортаємо на увесь екран
}

// Локальні дані
let stocksData = [];
let gymData = [];

// Перемикання екранів
function openScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}

// --- РОЗДІЛ: ФІНАНСИ ТА АКЦІЇ ---

function addStockPurchase() {
  const name = document.getElementById('stock-name').value;
  const qty = parseFloat(document.getElementById('stock-qty').value);
  const price = parseFloat(document.getElementById('stock-price').value);

  if (!name || isNaN(qty) || isNaN(price) || qty <= 0 || price <= 0) {
    alert('Будь ласка, введіть коректну кількість та ціну!');
    return;
  }

  const item = { id: Date.now(), name, qty, price };
  stocksData.push(item);

  // Очищаємо поля
  document.getElementById('stock-qty').value = '';
  document.getElementById('stock-price').value = '';

  saveAndRenderStocks();
}

function deleteStock(id) {
  stocksData = stocksData.filter(item => item.id !== id);
  saveAndRenderStocks();
}

function saveAndRenderStocks() {
  saveToCloud('stocks_data', stocksData);

  const listEl = document.getElementById('stocks-history-list');
  listEl.innerHTML = '';

  let totalQty = 0;
  let totalSpent = 0;

  stocksData.forEach(item => {
    totalQty += item.qty;
    totalSpent += item.qty * item.price;

    const div = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML = `
      <div>
        <b>${item.name}</b>: ${item.qty} шт. × $${item.price} 
        <br><small style="color:#94a3b8">Всього: $${(item.qty * item.price).toFixed(2)}</small>
      </div>
      <button class="btn-delete" onclick="deleteStock(${item.id})">🗑</button>
    `;
    listEl.appendChild(div);
  });

  const avgPrice = totalQty > 0 ? (totalSpent / totalQty) : 0;

  // Оновлюємо автоматичну статистику
  document.getElementById('stat-total-qty').innerText = `${totalQty} шт.`;
  document.getElementById('stat-total-spent').innerText = `$${totalSpent.toFixed(2)}`;
  document.getElementById('stat-avg-price').innerText = `$${avgPrice.toFixed(2)}`;
}

// --- РОЗДІЛ: ТРЕНУВАННЯ ---

function addGymSet() {
  const exercise = document.getElementById('gym-exercise').value;
  const weight = parseFloat(document.getElementById('gym-weight').value);
  const reps = parseInt(document.getElementById('gym-reps').value);

  if (!exercise || isNaN(weight) || isNaN(reps)) {
    alert('Введіть вагу та кількість повторів!');
    return;
  }

  const item = { id: Date.now(), exercise, weight, reps };
  gymData.push(item);

  document.getElementById('gym-weight').value = '';
  document.getElementById('gym-reps').value = '';

  saveAndRenderGym();
}

function deleteGymSet(id) {
  gymData = gymData.filter(item => item.id !== id);
  saveAndRenderGym();
}

function saveAndRenderGym() {
  saveToCloud('gym_data', gymData);

  const listEl = document.getElementById('gym-history-list');
  listEl.innerHTML = '';

  let totalTonnage = 0;

  gymData.forEach(item => {
    totalTonnage += item.weight * item.reps;

    const div = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML = `
      <div>
        <b>${item.exercise}</b>: ${item.weight} кг × ${item.reps} репів
      </div>
      <button class="btn-delete" onclick="deleteGymSet(${item.id})">🗑</button>
    `;
    listEl.appendChild(div);
  });

  document.getElementById('gym-total-tonnage').innerText = `${totalTonnage} кг`;
  document.getElementById('gym-total-sets').innerText = gymData.length;
}

// --- ЗБЕРЕЖЕННЯ В TELEGRAM CLOUD STORAGE ---

function saveToCloud(key, data) {
  if (tg && tg.CloudStorage) {
    tg.CloudStorage.setItem(key, JSON.stringify(data));
  } else {
    localStorage.setItem(key, JSON.stringify(data));
  }
}

function loadData() {
  if (tg && tg.CloudStorage) {
    tg.CloudStorage.getItem('stocks_data', (err, val) => {
      if (!err && val) {
        stocksData = JSON.parse(val);
        saveAndRenderStocks();
      }
    });
    tg.CloudStorage.getItem('gym_data', (err, val) => {
      if (!err && val) {
        gymData = JSON.parse(val);
        saveAndRenderGym();
      }
    });
  } else {
    const s = localStorage.getItem('stocks_data');
    if (s) { stocksData = JSON.parse(s); saveAndRenderStocks(); }
    const g = localStorage.getItem('gym_data');
    if (g) { gymData = JSON.parse(g); saveAndRenderGym(); }
  }
}

// Завантажуємо збережені дані при запуску
loadData();