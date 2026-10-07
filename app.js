const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }

// --- ДОПОМІЖНІ ФУНКЦІЇ ---
const CUR = '€';
const FALLBACK_LOGO = "data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 48 48%27%3E%3Ccircle cx=%2724%27 cy=%2724%27 r=%2724%27 fill=%27%232c2c2e%27/%3E%3C/svg%3E";
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad = n => String(n).padStart(2, '0');
const dKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const mKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
const todayKey = () => dKey(new Date());
const MONTHS = ['січень','лютий','березень','квітень','травень','червень','липень','серпень','вересень','жовтень','листопад','грудень'];
const monthTitle = (y, m) => `${MONTHS[m]} ${y}`;
const load = (k, def) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? def; } catch (e) { return def; } };
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

// Календарна сітка з реальними датами (Пн — перший день тижня)
function buildMonthGrid(y, m, startKey, getStatus, onclickFn) {
  const offset = (new Date(y, m, 1).getDay() + 6) % 7;
  const days = new Date(y, m + 1, 0).getDate();
  const today = todayKey();
  let html = ['Пн','Вт','Ср','Чт','Пт','Сб','Нд'].map(d => `<div class="weekday-label">${d}</div>`).join('');
  html += '<div></div>'.repeat(offset);
  for (let d = 1; d <= days; d++) {
    const key = `${y}-${pad(m + 1)}-${pad(d)}`;
    const locked = key > today || key < startKey;
    const cls = locked ? 'locked' : `status-${getStatus(key)}`;
    html += `<div class="day-square ${cls}${key === today ? ' today' : ''}" ${locked ? '' : `onclick="${onclickFn}('${key}')"`}>${d}</div>`;
  }
  return html;
}

// --- ЕКСПОРТ ТА ІМПОРТ ДАНИХ ---
const ALL_KEYS = [
  'user_stocks_v6', 'user_crypto_v6', 'journal_stocks_v6', 'journal_crypto_v6',
  'current_month_days', 'discipline_history', 'discipline_log', 'discipline_started',
  'user_termine', 'user_year_goals', 'user_step_goals', 'user_plans_archive',
  'user_workouts_history', 'last_exercise_weights', 'user_habits_list', 'user_habits_v2', 'current_weight', 'routine_checks'
];

function exportData() {
  const backupData = {};
  ALL_KEYS.forEach(key => {
    const item = localStorage.getItem(key);
    if (item !== null) {
      try { backupData[key] = JSON.parse(item); } catch (e) { backupData[key] = item; }
    }
  });
  const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `my_life_app_backup_${todayKey()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const parsed = JSON.parse(e.target.result);
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) throw new Error('format');
      const keys = Object.keys(parsed).filter(k => ALL_KEYS.includes(k));
      if (keys.length === 0) throw new Error('empty');
      keys.forEach(k => localStorage.setItem(k, JSON.stringify(parsed[k])));
      alert('Дані успішно імпортовано! Додаток буде перезавантажено.');
      window.location.reload();
    } catch (err) {
      alert('Помилка при читанні файлу бекапу. Перевірте формат JSON.');
    }
  };
  reader.readAsText(file);
}

// --- РОЗДІЛ: ФІНАНСИ ТА ІНВЕСТИЦІЇ ---

let defaultStocks = [
  { id: 'meta', name: "Meta Platforms", ticker: "META", logo: "https://img.icons8.com/color/96/meta.png", invested: 0, amount: 0 },
  { id: 'coinbase', name: "Coinbase Global", ticker: "COIN", logo: "https://img.icons8.com/color/96/coinbase.png", invested: 0, amount: 0 },
  { id: 'netflix', name: "Netflix Inc.", ticker: "NFLX", logo: "https://img.icons8.com/color/96/netflix--v1.png", invested: 369.39, amount: 5.08 },
  { id: 'albemarle', name: "Albemarle Corp.", ticker: "ALB", logo: "https://img.icons8.com/color/96/chemical-plant.png", invested: 289.38, amount: 2.29 },
  { id: 'taketwo', name: "Take-Two Interactive", ticker: "TTWO", logo: "https://img.icons8.com/color/96/game-controller.png", invested: 376.00, amount: 1.99 },
  { id: 'mcdonalds', name: "McDonald's Corp.", ticker: "MCD", logo: "https://img.icons8.com/color/96/mcdonalds.png", invested: 601.00, amount: 2.57 },
  { id: 'tesla', name: "Tesla Inc.", ticker: "TSLA", logo: "https://img.icons8.com/color/96/tesla-motors.png", invested: 63.00, amount: 0.18 },
  { id: 'dax', name: "DAX Index", ticker: "DAX", logo: "https://img.icons8.com/color/96/line-chart.png", invested: 100.00, amount: 0.42 }
];

let defaultCrypto = [
  { id: 'gram', name: "Gram / Toncoin", ticker: "GRAM", logo: "https://assets.coingecko.com/coins/images/17980/large/ton_symbol.png", invested: 0, amount: 0 },
  { id: 'btc', name: "Bitcoin", ticker: "BTC", logo: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png", invested: 0, amount: 0 },
  { id: 'xrp', name: "XRP", ticker: "XRP", logo: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png", invested: 0, amount: 0 },
  { id: 'sol', name: "Solana", ticker: "SOL", logo: "https://assets.coingecko.com/coins/images/4128/large/solana.png", invested: 0, amount: 0 },
  { id: 'eth', name: "Ethereum", ticker: "ETH", logo: "https://assets.coingecko.com/coins/images/279/large/ethereum.png", invested: 0, amount: 0 }
];

let stocksData = JSON.parse(localStorage.getItem('user_stocks_v6')) || defaultStocks;
let cryptoData = JSON.parse(localStorage.getItem('user_crypto_v6')) || defaultCrypto;

let journalStocks = JSON.parse(localStorage.getItem('journal_stocks_v6')) || [
  { name: "Meta Platforms", profit: 22.00 },
  { name: "Coinbase Global", profit: 45.00 },
  { name: "Netflix Inc.", profit: 9.65 },
  { name: "Albemarle Corp.", profit: 41.77 },
  { name: "DAX Index", profit: 7.47 }
];

let journalCrypto = JSON.parse(localStorage.getItem('journal_crypto_v6')) || [
  { name: "Gram (Toncoin)", profit: 67.80 },
  { name: "Bitcoin", profit: 58.35 },
  { name: "Solana", profit: 102.61 },
  { name: "Ethereum", profit: 86.52 }
];

let selectedAsset = null;
let journalEditTarget = null;
let screenHistory = ['main-menu'];

function navigateTo(screenId) {
  if (screenHistory[screenHistory.length - 1] !== screenId) {
    screenHistory.push(screenId);
    renderScreen(screenId);
  }
}

function goBack() {
  if (screenHistory.length > 1) {
    screenHistory.pop();
    renderScreen(screenHistory[screenHistory.length - 1]);
  }
}

function renderScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId)?.classList.add('active');
  window.scrollTo(0, 0);
}

function openTradeModal(id) {
  selectedAsset = [...stocksData, ...cryptoData].find(a => a.id === id) || null;
  if (!selectedAsset) return;
  document.getElementById('modal-title').innerText = `Операція: ${selectedAsset.name}`;
  document.getElementById('trade-amount').value = '';
  document.getElementById('trade-price').value = '';
  document.getElementById('trade-price-mode').value = 'total';
  document.getElementById('trade-modal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('trade-modal').style.display = 'none';
}

function submitTrade() {
  const type = document.getElementById('trade-type').value;
  const qty = parseFloat(document.getElementById('trade-amount').value) || 0;
  const price = parseFloat(document.getElementById('trade-price').value) || 0;
  const mode = document.getElementById('trade-price-mode').value; // total | unit
  if (!selectedAsset) { closeModal(); return; }

  const total = mode === 'unit' ? qty * price : price;
  const asset = [...stocksData, ...cryptoData].find(a => a.id === selectedAsset.id);

  if (asset) {
    asset.invested = asset.invested || 0;
    asset.amount = asset.amount || 0;
    if (type === 'buy') {
      asset.invested += total;
      asset.amount += qty;
    } else if (type === 'sell') {
      // при продажу зменшуємо вкладену суму за середньою ціною купівлі
      const avg = asset.amount > 0 ? asset.invested / asset.amount : 0;
      const sellQty = Math.min(qty, asset.amount);
      asset.invested = Math.max(0, asset.invested - avg * sellQty);
      asset.amount = Math.max(0, asset.amount - sellQty);
    } else if (type === 'set') {
      asset.invested = total;
      asset.amount = qty;
    }
    save('user_stocks_v6', stocksData);
    save('user_crypto_v6', cryptoData);
  }
  closeModal();
  initUI();
}

// --- УПРАВЛІННЯ ЩОДЕННИКОМ УГОД ---

function openJournalAddModal(type) {
  journalEditTarget = { type: type, isNew: true };
  document.getElementById('journal-modal-title').innerText = type === 'stock' ? '➕ Додати нову акцію (угоду)' : '➕ Додати нову угоду (крипто)';
  document.getElementById('journal-name-group').style.display = 'block';
  document.getElementById('journal-input-name').value = '';
  document.getElementById('journal-input-profit').value = '';
  document.getElementById('journal-modal').style.display = 'flex';
}

function openJournalEditModal(typeName, index) {
  journalEditTarget = { type: typeName, isNew: false, index: index };
  const targetList = typeName === 'stock' ? journalStocks : journalCrypto;
  const item = targetList[index];

  document.getElementById('journal-modal-title').innerText = `Додати прибуток: ${item.name}`;
  document.getElementById('journal-name-group').style.display = 'none';
  document.getElementById('journal-input-profit').value = '';
  document.getElementById('journal-modal').style.display = 'flex';
}

function closeJournalModal() {
  document.getElementById('journal-modal').style.display = 'none';
}

function submitJournalAdd() {
  const profitInput = parseFloat(document.getElementById('journal-input-profit').value) || 0;
  if (!journalEditTarget) {
    closeJournalModal();
    return;
  }

  const targetList = journalEditTarget.type === 'stock' ? journalStocks : journalCrypto;

  if (journalEditTarget.isNew) {
    const nameInput = document.getElementById('journal-input-name').value.trim() || (journalEditTarget.type === 'stock' ? 'Нова акція' : 'Нова угода');
    targetList.unshift({ name: nameInput, profit: profitInput });
  } else {
    targetList[journalEditTarget.index].profit += profitInput;
  }

  localStorage.setItem('journal_stocks_v6', JSON.stringify(journalStocks));
  localStorage.setItem('journal_crypto_v6', JSON.stringify(journalCrypto));

  closeJournalModal();
  initUI();
}

function updateTotals() {
  const totalStocks = stocksData.reduce((acc, item) => acc + (item.invested || 0), 0);
  const totalCrypto = cryptoData.reduce((acc, item) => acc + (item.invested || 0), 0);
  
  const sumElem = document.getElementById('total-invested-sum');
  if (sumElem) sumElem.innerText = `${(totalStocks + totalCrypto).toFixed(2)} €`;

  const allTrades = [...journalStocks, ...journalCrypto];
  let totalProfit = 0;
  let totalLoss = 0;

  allTrades.forEach(item => {
    if (item.profit >= 0) totalProfit += item.profit;
    else totalLoss += Math.abs(item.profit);
  });

  const countElem = document.getElementById('stat-count');
  const profitElem = document.getElementById('stat-profit');
  const lossElem = document.getElementById('stat-loss');
  const rateElem = document.getElementById('stat-rate');

  if (countElem) countElem.innerText = allTrades.length;
  if (profitElem) profitElem.innerText = `+${totalProfit.toFixed(2)}€`;
  if (lossElem) lossElem.innerText = `-${totalLoss.toFixed(2)}€`;
  
  if (rateElem) {
    const successRate = allTrades.length > 0 ? ((allTrades.filter(t => t.profit >= 0).length / allTrades.length) * 100).toFixed(0) : 100;
    rateElem.innerText = `${successRate}%`;
  }
}

function fmtProfit(p) { return `${p >= 0 ? '+' : '−'}${Math.abs(p).toFixed(2)}${CUR}`; }

function renderJournals() {
  const draw = (id, list, type) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = list.map((j, index) => `
      <div class="journal-item" onclick="openJournalEditModal('${type}', ${index})">
        <span class="journal-name">${esc(j.name)}</span>
        <span class="${j.profit >= 0 ? 'green' : 'red'}">${fmtProfit(j.profit)}</span>
      </div>
    `).join('');
  };
  draw('journal-stocks', journalStocks, 'stock');
  draw('journal-crypto', journalCrypto, 'crypto');
}

// --- РОЗДІЛ: ХАРЧУВАННЯ ---

const nutritionData = {
  2500: {
    title: "🟢 2500 ккал (Базовий)",
    bju: "БЖУ: ~197 г Б | ~100 г Ж | ~187 г В",
    breakfast: { quark: 300, eggs: 2, protein: 30, oats: 80, berries: 150, seeds: 15, milk: 150, cheese: 20 },
    dinner1: { filet: 330, rice: 105, veggies: 250, cream: 100, oilFry: 15, oilEV: 10 },
    dinner2: { turkey: 400, buckwheat: 120, sauce: 150, veggies: 200, oilEV: 10 },
    snack: { almondsCurry: 35, almondsBuckwheat: 15, apple: 1 }
  },
  2400: {
    title: "🟡 2400 ккал (При вазі 95 кг)",
    bju: "БЖУ: ~195 г Б | ~98 г Ж | ~162 г В",
    breakfast: { quark: 300, eggs: 2, protein: 30, oats: 65, berries: 150, seeds: 15, milk: 150, cheese: 20 },
    dinner1: { filet: 330, rice: 80, veggies: 250, cream: 100, oilFry: 15, oilEV: 10 },
    dinner2: { turkey: 400, buckwheat: 90, sauce: 150, veggies: 200, oilEV: 10 },
    snack: { almondsCurry: 35, almondsBuckwheat: 15, apple: 1 }
  },
  2300: {
    title: "🟠 2300 ккал (При вазі 90 кг)",
    bju: "БЖУ: ~193 г Б | ~96 г Ж | ~137 г В",
    breakfast: { quark: 300, eggs: 2, protein: 30, oats: 55, berries: 150, seeds: 15, milk: 150, cheese: 20 },
    dinner1: { filet: 330, rice: 55, veggies: 250, cream: 100, oilFry: 15, oilEV: 10 },
    dinner2: { turkey: 400, buckwheat: 65, sauce: 150, veggies: 200, oilEV: 10 },
    snack: { almondsCurry: 35, almondsBuckwheat: 15, apple: 1 }
  },
  2200: {
    title: "🔴 2200 ккал (При вазі <90 кг)",
    bju: "БЖУ: ~190 г Б | ~94 г Ж | ~112 г В",
    breakfast: { quark: 300, eggs: 2, protein: 30, oats: 45, berries: 150, seeds: 15, milk: 150, cheese: 20 },
    dinner1: { filet: 330, rice: 35, veggies: 250, cream: 100, oilFry: 15, oilEV: 10 },
    dinner2: { turkey: 400, buckwheat: 40, sauce: 150, veggies: 200, oilEV: 10 },
    snack: { almondsCurry: 35, almondsBuckwheat: 15, apple: 1 }
  }
};

let currentCalorieTarget = 2500;
let servingsCount = 1;

function changeCalorieTarget(val) { currentCalorieTarget = parseInt(val); renderNutrition(); }
function changeServings(delta) { servingsCount = Math.max(1, servingsCount + delta); document.getElementById('servings-count').innerText = servingsCount; renderNutrition(); }

function renderNutrition() {
  const data = nutritionData[currentCalorieTarget];
  if (!data) return;

  const mult = servingsCount;
  document.getElementById('nutrition-title').innerText = data.title;
  document.getElementById('nutrition-bju').innerText = data.bju;

  const bf = data.breakfast;
  const bfElem = document.getElementById('breakfast-list');
  if (bfElem) {
    bfElem.innerHTML = `
      <div>Speisequark 20%: <b>${bf.quark * mult} г</b></div>
      <div>Яйця курячі: <b>${bf.eggs * mult} шт. (~${110 * mult} г)</b></div>
      <div>Протеїн (Whey): <b>${bf.protein * mult} г</b></div>
      <div>Вівсяні пластівці: <b>${bf.oats * mult} г</b></div>
      <div>Заморожені ягоди: <b>${bf.berries * mult} г</b></div>
      <div>Насіння: <b>${bf.seeds * mult} г</b></div>
      <div class="sub-block-title">☕ Додатки до кави:</div>
      <div style="padding-left: 10px;">• Твердий сир (45%): <b>${bf.cheese * mult} г</b></div>
      <div style="padding-left: 10px;">• Молоко 1.5%: <b>${bf.milk * mult} мл</b></div>
    `;
  }

  const d1 = data.dinner1;
  const d1Elem = document.getElementById('dinner1-list');
  if (d1Elem) {
    d1Elem.innerHTML = `
      <div>Куряче філе: <b>${d1.filet * mult} г</b></div>
      <div>Сухий рис: <b>${d1.rice * mult} г</b></div>
      <div>Заморожені овочі: <b>${d1.veggies * mult} г</b></div>
      <div>Вершки 7%: <b>${d1.cream * mult} мл</b></div>
      <div>Олія для смаження: <b>${d1.oilFry * mult} г</b> | Оливкова EV: <b>${d1.oilEV * mult} г</b></div>
    `;
  }

  const d2 = data.dinner2;
  const d2Elem = document.getElementById('dinner2-list');
  if (d2Elem) {
    d2Elem.innerHTML = `
      <div>Фарш з індички: <b>${d2.turkey * mult} г</b></div>
      <div>Суха гречка: <b>${d2.buckwheat * mult} г</b></div>
      <div>Томатний соус: <b>${d2.sauce * mult} г</b></div>
      <div>Овочі: <b>${d2.veggies * mult} г</b></div>
      <div>Оливкова олія EV: <b>${d2.oilEV * mult} г</b></div>
    `;
  }

  const snack = data.snack;
  const snackElem = document.getElementById('snack-list');
  if (snackElem) {
    snackElem.innerHTML = `
      <div>Мигдаль (до Вечері №1): <b>${snack.almondsCurry * mult} г</b></div>
      <div>Мигдаль (до Вечері №2): <b>${snack.almondsBuckwheat * mult} г</b></div>
      <div>Яблуко: <b>${snack.apple * mult} шт.</b></div>
    `;
  }
}

// --- РОЗДІЛ: ТРЕНУВАННЯ ---

let workoutsHistory = JSON.parse(localStorage.getItem('user_workouts_history')) || [];
let lastWeights = load('last_exercise_weights', {}); // остання вага для кожної вправи

// підставляє останню використану вагу при виборі вправи
function initWorkoutWeights() {
  document.querySelectorAll('#workout-exercises-container .workout-exercise-card').forEach(card => {
    const sel = card.querySelector('.exercise-select');
    const inp = card.querySelector('.weight-input');
    if (!sel || !inp) return;
    const fill = () => { inp.value = lastWeights[sel.value] ?? ''; };
    sel.addEventListener('change', fill);
    fill();
  });
}

function updateBodyFat() {
  const weightInput = document.getElementById('current-weight-input');
  const fatDisplay = document.getElementById('body-fat-display');
  if (!weightInput || !fatDisplay) return;

  const weight = parseFloat(weightInput.value) || 100;
  let estimatedFat = 26 - (100 - weight) * 0.95;
  
  if (estimatedFat < 8) estimatedFat = 8;
  if (estimatedFat > 40) estimatedFat = 40;

  fatDisplay.innerText = estimatedFat.toFixed(1) + '%';
  localStorage.setItem('current_weight', weight);
}

function finishWorkout() {
  const exerciseCards = document.querySelectorAll('#workout-exercises-container .workout-exercise-card');
  let summaryDetails = [];

  exerciseCards.forEach(card => {
    const exerciseSelect = card.querySelector('.exercise-select');
    const setsSelect = card.querySelector('.sets-select');
    const repsSelect = card.querySelector('.reps-select');

    const exName = exerciseSelect ? exerciseSelect.value : '';
    const sets = setsSelect ? setsSelect.value : '';
    const reps = repsSelect ? repsSelect.value : '';
    const weightInput = card.querySelector('.weight-input');
    const kg = weightInput ? parseFloat(String(weightInput.value).replace(',', '.')) : NaN;

    if (sets && reps) {
      const kgText = kg > 0 ? ` × ${kg} кг` : '';
      summaryDetails.push(`${exName}: ${sets} підх. по ${reps} пов.${kgText}`);
      if (kg > 0) lastWeights[exName] = kg;
    }
  });

  if (summaryDetails.length === 0) {
    alert('Будь ласка, оберіть підходи та повторення хоча б для деяких вправ!');
    return;
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + now.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
  const weightVal = document.getElementById('current-weight-input').value;
  
  const description = `Вага: ${weightVal} кг. ` + summaryDetails.join(' | ');

  save('last_exercise_weights', lastWeights);
  workoutsHistory.unshift({ date: dateStr, desc: description });
  localStorage.setItem('user_workouts_history', 'last_exercise_weights', JSON.stringify(workoutsHistory));

  renderWorkoutsHistory();

  exerciseCards.forEach(card => {
    const setsSelect = card.querySelector('.sets-select');
    const repsSelect = card.querySelector('.reps-select');
    if (setsSelect) setsSelect.selectedIndex = 0;
    if (repsSelect) repsSelect.selectedIndex = 0;
  });

  alert('Тренування успішно завершено та додано до архіву!');
}

function renderWorkoutsHistory() {
  const container = document.getElementById('workouts-history-list');
  if (!container) return;

  if (workoutsHistory.length === 0) {
    container.innerHTML = `<div class="placeholder" style="margin-top: 10px; font-size: 0.85rem;">Ще немає завершених тренувань</div>`;
    return;
  }

  container.innerHTML = workoutsHistory.map(item => `
    <div class="history-item" style="flex-direction: column; align-items: flex-start; gap: 4px;">
      <strong style="color: #30d158; font-size: 0.85rem;">${esc(item.date)}</strong>
      <span style="color: #d1d1d6; font-size: 0.8rem; line-height: 1.3;">${esc(item.desc)}</span>
    </div>
  `).join('');
}

// --- РОЗДІЛ: РУТИНА ТА ДИСЦИПЛІНА ---

function switchRoutineTab(tab) {
  document.getElementById('tab-a-btn').classList.toggle('active', tab === 'A');
  document.getElementById('tab-b-btn').classList.toggle('active', tab === 'B');
  document.getElementById('routine-plan-a').classList.toggle('active', tab === 'A');
  document.getElementById('routine-plan-b').classList.toggle('active', tab === 'B');
}

const statusCycle = ['green', 'yellow', 'red', 'gray'];
let discLog = load('discipline_log', {});          // { 'YYYY-MM-DD': status } — зберігається назавжди
let discStarted = localStorage.getItem('discipline_started');
if (!discStarted) {
  const now = new Date();
  discStarted = dKey(new Date(now.getFullYear(), now.getMonth(), 1));
  localStorage.setItem('discipline_started', discStarted);
  const old = load('current_month_days', null);      // міграція зі старого формату
  if (Array.isArray(old)) old.forEach((s, i) => { if (s !== 'green') discLog[`${mKey(now)}-${pad(i + 1)}`] = s; });
  save('discipline_log', discLog);
}
let discView = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
const discStatus = k => discLog[k] || 'green';
const rateClass = r => r >= 80 ? 'green' : (r >= 50 ? 'yellow' : 'red');

function discMonthStats(y, m) {
  const c = { green: 0, yellow: 0, red: 0, gray: 0 };
  const today = todayKey();
  for (let d = 1, n = new Date(y, m + 1, 0).getDate(); d <= n; d++) {
    const k = `${y}-${pad(m + 1)}-${pad(d)}`;
    if (k < discStarted || k > today) continue;
    c[discStatus(k)]++;
  }
  const active = c.green + c.yellow + c.red;
  c.rate = active ? Math.round((c.green * 100 + c.yellow * 50) / active) : 100;
  return c;
}

function renderDisciplineCalendar() {
  const el = document.getElementById('discipline-calendar');
  if (!el) return;
  const y = discView.getFullYear(), m = discView.getMonth(), now = new Date();
  el.innerHTML = buildMonthGrid(y, m, discStarted, discStatus, 'cycleDayStatus');
  document.getElementById('discipline-month-title').innerText = monthTitle(y, m);
  const s = discMonthStats(y, m);
  const r = document.getElementById('discipline-rate');
  r.innerText = `${s.rate}%`;
  r.className = rateClass(s.rate);
  document.getElementById('disc-next-btn').disabled = (y === now.getFullYear() && m === now.getMonth());
  document.getElementById('disc-prev-btn').disabled = mKey(discView) <= discStarted.slice(0, 7);
  renderHistory();
}

function shiftDiscMonth(delta) {
  discView = new Date(discView.getFullYear(), discView.getMonth() + delta, 1);
  renderDisciplineCalendar();
}

function openDiscMonth(y, m) {
  discView = new Date(y, m, 1);
  renderDisciplineCalendar();
  document.getElementById('discipline-calendar').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function cycleDayStatus(key) {
  discLog[key] = statusCycle[(statusCycle.indexOf(discStatus(key)) + 1) % statusCycle.length];
  save('discipline_log', discLog);
  renderDisciplineCalendar();
}

// Архів формується автоматично з журналу днів: кожен минулий місяць зберігається з результатом
function renderHistory() {
  const box = document.getElementById('history-list');
  if (!box) return;
  const now = new Date();
  const s0 = new Date(discStarted + 'T00:00:00');
  const rows = [];
  for (let y = s0.getFullYear(), m = s0.getMonth(); y < now.getFullYear() || (y === now.getFullYear() && m <= now.getMonth());) {
    rows.push({ y, m, s: discMonthStats(y, m) });
    if (++m > 11) { m = 0; y++; }
  }
  rows.reverse();
  const yr = rows.filter(r => r.y === now.getFullYear());
  const avg = yr.length ? Math.round(yr.reduce((a, r) => a + r.s.rate, 0) / yr.length) : 0;
  let html = `<div class="history-item"><span>Середня успішність за ${now.getFullYear()} рік</span><strong class="${rateClass(avg)}">${avg}%</strong></div>`;
  html += rows.map(r => `
    <div class="history-item" onclick="openDiscMonth(${r.y}, ${r.m})" style="cursor:pointer">
      <span>${monthTitle(r.y, r.m)}${(r.y === now.getFullYear() && r.m === now.getMonth()) ? ' (поточний)' : ''}<br>
        <small class="subtitle">🟢 ${r.s.green} · 🟡 ${r.s.yellow} · 🔴 ${r.s.red} · ⚪ ${r.s.gray}</small></span>
      <strong class="${rateClass(r.s.rate)}">${r.s.rate}%</strong>
    </div>`).join('');
  html += load('discipline_history', []).map(i => `<div class="history-item"><span>${esc(i.title)}</span><strong class="yellow">${esc(i.rate)}</strong></div>`).join('');
  box.innerHTML = html;
}

// --- РОЗДІЛ: ШКІДЛИВІ ЗВИЧКИ ---
// Кожна звичка: { id, name, reason, created: 'YYYY-MM-DD', log: { 'YYYY-MM-DD': 'green'|'red'|'gray' } }
// green = тримаюсь (за замовчуванням від дня створення), red = здався, gray = нейтрально
let habitsList = load('user_habits_v2', null);
if (!habitsList) {
  const now = new Date();
  const first = dKey(new Date(now.getFullYear(), now.getMonth(), 1));
  habitsList = load('user_habits_list', []).map(h => {
    const log = {};
    (h.days || []).forEach((s, i) => { if (s !== 'green') log[`${mKey(now)}-${pad(i + 1)}`] = s; });
    return { id: h.id, name: h.name, reason: h.reason, created: first, log };
  });
  save('user_habits_v2', habitsList);
}
const habitStatusCycle = ['green', 'red', 'gray'];
let habitView = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
const habitStatus = (h, k) => h.log[k] || 'green';

function addHabit() {
  const nameInput = document.getElementById('habit-name-input');
  const reasonInput = document.getElementById('habit-reason-input');
  const name = nameInput.value.trim();
  if (!name) { alert('Будь ласка, введіть назву звички!'); return; }
  habitsList.push({ id: Date.now(), name, reason: reasonInput.value.trim() || "Шкідливо для здоров'я та продуктивності.", created: todayKey(), log: {} });
  save('user_habits_v2', habitsList);
  nameInput.value = '';
  reasonInput.value = '';
  renderHabits();
}

function deleteHabit(id) {
  if (!confirm('Видалити цю звичку разом з історією?')) return;
  habitsList = habitsList.filter(h => h.id !== id);
  save('user_habits_v2', habitsList);
  renderHabits();
}

function cycleHabitDay(habitId, key) {
  const h = habitsList.find(x => x.id === habitId);
  if (!h) return;
  h.log[key] = habitStatusCycle[(habitStatusCycle.indexOf(habitStatus(h, key)) + 1) % habitStatusCycle.length];
  save('user_habits_v2', habitsList);
  renderHabits();
}

function shiftHabitMonth(delta) {
  habitView = new Date(habitView.getFullYear(), habitView.getMonth() + delta, 1);
  renderHabits();
}

function habitStreaks(h) {
  let cur = 0, best = 0;
  const end = new Date(); end.setHours(0, 0, 0, 0);
  for (let d = new Date(h.created + 'T00:00:00'); d <= end; d.setDate(d.getDate() + 1)) {
    const s = habitStatus(h, dKey(d));
    if (s === 'green') { cur++; best = Math.max(best, cur); } else if (s === 'red') cur = 0;
  }
  return { cur, best };
}

function habitMonthCounts(h, y, m) {
  const c = { green: 0, red: 0, gray: 0 };
  const today = todayKey();
  for (let d = 1, n = new Date(y, m + 1, 0).getDate(); d <= n; d++) {
    const k = `${y}-${pad(m + 1)}-${pad(d)}`;
    if (k < h.created || k > today) continue;
    c[habitStatus(h, k)]++;
  }
  return c;
}

function habitArchiveHtml(h) {
  const now = new Date(), s0 = new Date(h.created + 'T00:00:00'), rows = [];
  for (let y = s0.getFullYear(), m = s0.getMonth(); y < now.getFullYear() || (y === now.getFullYear() && m <= now.getMonth());) {
    const c = habitMonthCounts(h, y, m);
    rows.push(`<div class="history-item"><span>${monthTitle(y, m)}</span><span>🟢 ${c.green} · 🔴 ${c.red} · ⚪ ${c.gray}</span></div>`);
    if (++m > 11) { m = 0; y++; }
  }
  return rows.reverse().join('');
}

function renderHabits() {
  const container = document.getElementById('habits-list-container');
  if (!container) return;
  const y = habitView.getFullYear(), m = habitView.getMonth(), now = new Date();
  const t = document.getElementById('habit-month-title');
  if (t) t.innerText = monthTitle(y, m);
  const nx = document.getElementById('habit-next-btn');
  if (nx) nx.disabled = (y === now.getFullYear() && m === now.getMonth());

  if (habitsList.length === 0) {
    container.innerHTML = `<div style="color: #8e8e93; font-size: 0.85rem; text-align: center; margin-top: 20px;">Немає доданих шкідливих звичок. Додайте першу вище!</div>`;
    return;
  }
  container.innerHTML = habitsList.map(h => {
    const st = habitStreaks(h);
    return `
    <div class="stats-card habit-card-item">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
        <h4 style="margin-bottom: 0; color: #ff453a;">🚫 ${esc(h.name)}</h4>
        <button onclick="deleteHabit(${h.id})" style="background: none; border: none; color: #ff453a; cursor: pointer; font-size: 0.8rem; font-weight: bold;">Видалити</button>
      </div>
      <div class="subtitle" style="margin-bottom: 6px;">🔥 Серія: <b class="green">${st.cur} дн.</b> · 🏆 Рекорд: <b>${st.best} дн.</b> · з ${h.created.split('-').reverse().join('.')}</div>
      <div class="status-legend" style="margin: 6px 0;">
        <span>🟢 Тримаюсь</span><span>🔴 Здався</span><span>⚪ Нейтрально</span>
      </div>
      <div class="calendar-grid">${buildMonthGrid(y, m, h.created, k => habitStatus(h, k), `cycleHabitDay.bind(null,${h.id})`)}</div>
      <details style="margin-top: 10px;">
        <summary class="subtitle" style="cursor: pointer;">📦 Архів по місяцях</summary>
        <div class="history-list">${habitArchiveHtml(h)}</div>
      </details>
      <div class="habit-reason-footer">💡 <b>Чому шкідливо:</b> ${esc(h.reason)}</div>
    </div>`;
  }).join('');
}

// --- РОЗДІЛ: ПЛАНИ ---

let termineList = JSON.parse(localStorage.getItem('user_termine')) || [];
let yearGoals = JSON.parse(localStorage.getItem('user_year_goals')) || [];
let stepGoals = JSON.parse(localStorage.getItem('user_step_goals')) || [];
let plansArchive = JSON.parse(localStorage.getItem('user_plans_archive')) || [];

function switchPlansTab(tab) {
  document.getElementById('plan-tab-termine-btn').classList.toggle('active', tab === 'termine');
  document.getElementById('plan-tab-year-btn').classList.toggle('active', tab === 'year');
  document.getElementById('plan-tab-step-btn').classList.toggle('active', tab === 'step');
  document.getElementById('plan-tab-archive-btn').classList.toggle('active', tab === 'archive');

  document.getElementById('plans-tab-termine').classList.toggle('active', tab === 'termine');
  document.getElementById('plans-tab-year').classList.toggle('active', tab === 'year');
  document.getElementById('plans-tab-step').classList.toggle('active', tab === 'step');
  document.getElementById('plans-tab-archive').classList.toggle('active', tab === 'archive');
}

function addTermine() {
  const title = document.getElementById('termine-title').value.trim();
  const date = document.getElementById('termine-date').value;
  const note = document.getElementById('termine-note').value.trim();

  if (!title || !date) {
    alert("Будь ласка, введіть назву та дату зустрічі!");
    return;
  }

  termineList.push({ id: Date.now(), title, date, note });
  localStorage.setItem('user_termine', JSON.stringify(termineList));

  document.getElementById('termine-title').value = '';
  document.getElementById('termine-date').value = '';
  document.getElementById('termine-note').value = '';

  renderPlans();
}

function addGoal(type) {
  const inputElem = type === 'year' ? document.getElementById('year-goal-input') : document.getElementById('step-goal-input');
  const title = inputElem.value.trim();

  if (!title) return;

  const newGoal = { id: Date.now(), title };
  if (type === 'year') {
    yearGoals.push(newGoal);
    localStorage.setItem('user_year_goals', JSON.stringify(yearGoals));
  } else {
    stepGoals.push(newGoal);
    localStorage.setItem('user_step_goals', JSON.stringify(stepGoals));
  }

  inputElem.value = '';
  renderPlans();
}

function completePlanItem(category, id) {
  let item = null;
  const dateStr = new Date().toLocaleDateString('uk-UA');

  if (category === 'termine') {
    const idx = termineList.findIndex(t => t.id === id);
    if (idx !== -1) {
      item = termineList.splice(idx, 1)[0];
      localStorage.setItem('user_termine', JSON.stringify(termineList));
      plansArchive.unshift({ title: `📌 Termine: ${item.title}`, sub: `Дата була: ${item.date.replace('T', ' ')}`, completedAt: dateStr });
    }
  } else if (category === 'year') {
    const idx = yearGoals.findIndex(g => g.id === id);
    if (idx !== -1) {
      item = yearGoals.splice(idx, 1)[0];
      localStorage.setItem('user_year_goals', JSON.stringify(yearGoals));
      plansArchive.unshift({ title: `🏆 Ціль на рік: ${item.title}`, sub: 'Виконано!', completedAt: dateStr });
    }
  } else if (category === 'step') {
    const idx = stepGoals.findIndex(g => g.id === id);
    if (idx !== -1) {
      item = stepGoals.splice(idx, 1)[0];
      localStorage.setItem('user_step_goals', JSON.stringify(stepGoals));
      plansArchive.unshift({ title: `🗓 Крок/Плани: ${item.title}`, sub: 'Виконано!', completedAt: dateStr });
    }
  }

  localStorage.setItem('user_plans_archive', JSON.stringify(plansArchive));
  renderPlans();
}

function renderPlans() {
  const tContainer = document.getElementById('termine-list');
  if (tContainer) {
    if (termineList.length === 0) {
      tContainer.innerHTML = `<div style="color: #8e8e93; font-size: 0.85rem;">Немає запланованих термінів.</div>`;
    } else {
      tContainer.innerHTML = [...termineList].sort((a, b) => a.date.localeCompare(b.date)).map(t => `
        <div class="plan-card">
          <input type="checkbox" onclick="completePlanItem('termine', ${t.id})">
          <div class="plan-card-content">
            <div class="plan-card-title">${esc(t.title)}</div>
            <div class="plan-card-sub">📅 ${t.date.replace('T', ' ')} ${t.note ? ' | ' + esc(t.note) : ''}</div>
          </div>
        </div>
      `).join('');
    }
  }

  const yContainer = document.getElementById('year-goals-list');
  if (yContainer) {
    if (yearGoals.length === 0) {
      yContainer.innerHTML = `<div style="color: #8e8e93; font-size: 0.85rem;">Немає річних цілей. Додайте першу вище!</div>`;
    } else {
      yContainer.innerHTML = yearGoals.map(g => `
        <div class="plan-card">
          <input type="checkbox" onclick="completePlanItem('year', ${g.id})">
          <div class="plan-card-content">
            <div class="plan-card-title">${esc(g.title)}</div>
          </div>
        </div>
      `).join('');
    }
  }

  const sContainer = document.getElementById('step-goals-list');
  if (sContainer) {
    if (stepGoals.length === 0) {
      sContainer.innerHTML = `<div style="color: #8e8e93; font-size: 0.85rem;">Немає кроків. Додайте перший вище!</div>`;
    } else {
      sContainer.innerHTML = stepGoals.map(g => `
        <div class="plan-card">
          <input type="checkbox" onclick="completePlanItem('step', ${g.id})">
          <div class="plan-card-content">
            <div class="plan-card-title">${esc(g.title)}</div>
          </div>
        </div>
      `).join('');
    }
  }

  const aContainer = document.getElementById('plans-archive-list');
  if (aContainer) {
    if (plansArchive.length === 0) {
      aContainer.innerHTML = `<div style="color: #8e8e93; font-size: 0.85rem;">Архів поки порожній.</div>`;
    } else {
      aContainer.innerHTML = plansArchive.map(a => `
        <div class="plan-card" style="opacity: 0.7;">
          <div class="plan-card-content">
            <div class="plan-card-title" style="text-decoration: line-through;">${esc(a.title)}</div>
            <div class="plan-card-sub">Завершено: ${esc(a.completedAt)} (${esc(a.sub)})</div>
          </div>
        </div>
      `).join('');
    }
  }
}

// --- ІНІЦІАЛІЗАЦІЯ ІНТЕРФЕЙСУ ---

function initUI() {
  const renderList = (data, elementId, currencySymbol) => {
    const container = document.getElementById(elementId);
    if (!container) return;
    
    container.innerHTML = data.map(item => {
      const invested = item.invested || 0;
      const amount = item.amount || 0;
      const avgPrice = amount > 0 ? (invested / amount).toFixed(2) : '0.00';
      
      return `
        <div class="asset-card" onclick="openTradeModal('${item.id}')">
          <div class="asset-info">
            <img class="real-logo" src="${item.logo}" alt="${item.ticker}" onerror="this.onerror=null;this.src=FALLBACK_LOGO" />
            <div class="asset-names">
              <span class="ticker">${item.ticker}</span>
              <span class="subtitle">${item.name}</span>
            </div>
          </div>
          <div class="asset-right-meta">
            <span class="asset-meta-amount">${invested.toFixed(2)} ${currencySymbol}</span>
            <span class="asset-meta-qty">${amount.toFixed(3)} шт. (сер. ${avgPrice})</span>
          </div>
        </div>
      `;
    }).join('');
  };

  renderList(stocksData, 'stocks-list', CUR);
  renderList(cryptoData, 'crypto-list', CUR);

  renderJournals();
  updateTotals();
  renderNutrition();
  renderDisciplineCalendar();
  renderPlans();
  renderWorkoutsHistory();
  renderHabits();
  const w = localStorage.getItem('current_weight');
  const wi = document.getElementById('current-weight-input');
  if (w && wi) wi.value = w;
  updateBodyFat();
}

function initRoutineChecks() {
  let data = load('routine_checks', {});
  if (data.date !== todayKey()) data = { date: todayKey(), checked: {} }; // нова доба — чек-лист скидається
  document.querySelectorAll('#notes-screen .custom-ingredients-list input[type=checkbox]').forEach((cb, i) => {
    cb.checked = !!data.checked[i];
    cb.onchange = () => { data.checked[i] = cb.checked; save('routine_checks', data); };
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initUI();
  initRoutineChecks();
  initWorkoutWeights();
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
});
// після півночі / повернення в додаток — оновити «сьогодні»
document.addEventListener('visibilitychange', () => { if (!document.hidden) { initUI(); initRoutineChecks(); } });
