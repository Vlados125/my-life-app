const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }

// --- РОЗДІЛ: ФІНАНСИ ТА ІНВЕСТИЦІЇ ---

let stocksData = [
  { id: 'meta', name: "Meta Platforms", ticker: "META", logo: "https://img.icons8.com/color/96/meta.png", invested: 0 },
  { id: 'coinbase', name: "Coinbase Global", ticker: "COIN", logo: "https://img.icons8.com/color/96/coinbase.png", invested: 0 },
  { id: 'netflix', name: "Netflix Inc.", ticker: "NFLX", logo: "https://img.icons8.com/color/96/netflix--v1.png", invested: 0 },
  { id: 'albemarle', name: "Albemarle Corp.", ticker: "ALB", logo: "https://img.icons8.com/color/96/chemical-plant.png", invested: 0 },
  { id: 'taketwo', name: "Take-Two Interactive", ticker: "TTWO", logo: "https://img.icons8.com/color/96/game-controller.png", invested: 0 },
  { id: 'mcdonalds', name: "McDonald's Corp.", ticker: "MCD", logo: "https://img.icons8.com/color/96/mcdonalds.png", invested: 0 },
  { id: 'tesla', name: "Tesla Inc.", ticker: "TSLA", logo: "https://img.icons8.com/color/96/tesla-motors.png", invested: 0 },
  { id: 'dax', name: "DAX Index", ticker: "DAX", logo: "https://img.icons8.com/color/96/line-chart.png", invested: 0 }
];

let cryptoData = [
  { id: 'gram', name: "Gram / Toncoin", ticker: "GRAM", logo: "https://assets.coingecko.com/coins/images/17980/large/ton_symbol.png", invested: 0 },
  { id: 'btc', name: "Bitcoin", ticker: "BTC", logo: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png", invested: 0 },
  { id: 'xrp', name: "XRP", ticker: "XRP", logo: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png", invested: 0 },
  { id: 'sol', name: "Solana", ticker: "SOL", logo: "https://assets.coingecko.com/coins/images/4128/large/solana.png", invested: 0 },
  { id: 'eth', name: "Ethereum", ticker: "ETH", logo: "https://assets.coingecko.com/coins/images/279/large/ethereum.png", invested: 0 }
];

let journalStocks = [
  { name: "Meta Platforms", profit: 22.00 },
  { name: "Coinbase Global", profit: 45.00 },
  { name: "Netflix Inc.", profit: 9.65 },
  { name: "Albemarle Corp.", profit: 41.77 },
  { name: "DAX Index", profit: 7.47 }
];

let journalCrypto = [
  { name: "Gram (Toncoin)", profit: 67.80 },
  { name: "Bitcoin", profit: 58.35 },
  { name: "XRP (Ripple)", profit: 0.00 },
  { name: "Solana", profit: 102.67 },
  { name: "Ethereum", profit: 86.52 }
];

let selectedAsset = null;
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

function openTradeModal(asset) {
  selectedAsset = asset;
  document.getElementById('modal-title').innerText = `Операція: ${asset.name}`;
  document.getElementById('trade-modal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('trade-modal').style.display = 'none';
}

function submitTrade() {
  const type = document.getElementById('trade-type').value;
  const price = parseFloat(document.getElementById('trade-price').value) || 0;
  
  if (selectedAsset) {
    if (type === 'buy') {
      selectedAsset.invested += price;
    } else {
      const profit = price;
      selectedAsset.invested = Math.max(0, selectedAsset.invested - price);
      
      const isStock = stocksData.some(s => s.id === selectedAsset.id);
      const targetJournal = isStock ? journalStocks : journalCrypto;
      
      targetJournal.unshift({
        name: selectedAsset.name,
        profit: profit
      });
    }
    updateTotals();
    renderJournals();
  }
  closeModal();
}

function updateTotals() {
  const totalStocks = stocksData.reduce((acc, item) => acc + item.invested, 0);
  const totalCrypto = cryptoData.reduce((acc, item) => acc + item.invested, 0);
  
  const sumElem = document.getElementById('total-invested-sum');
  if (sumElem) sumElem.innerText = `${(totalStocks + totalCrypto).toFixed(2)} €`;

  const allTrades = [...journalStocks, ...journalCrypto];
  let totalProfit = 0;
  let totalLoss = 0;

  allTrades.forEach(item => {
    if (item.profit >= 0) {
      totalProfit += item.profit;
    } else {
      totalLoss += Math.abs(item.profit);
    }
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

function renderJournals() {
  const jStocks = document.getElementById('journal-stocks');
  if (jStocks) {
    jStocks.innerHTML = journalStocks.map(j => `
      <div class="journal-item">
        <span class="journal-name">${j.name}</span>
        <span class="${j.profit >= 0 ? 'green' : 'red'}">${j.profit >= 0 ? '+' : ''}${j.profit.toFixed(2)}€</span>
      </div>
    `).join('');
  }

  const jCrypto = document.getElementById('journal-crypto');
  if (jCrypto) {
    jCrypto.innerHTML = journalCrypto.map(j => `
      <div class="journal-item">
        <span class="journal-name">${j.name}</span>
        <span class="${j.profit >= 0 ? 'green' : 'red'}">${j.profit >= 0 ? '+' : ''}${j.profit.toFixed(2)}$</span>
      </div>
    `).join('');
  }
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

// --- РОЗДІЛ: РУТИНА, ДИСЦИПЛІНА ТА АРХІВ ---

function switchRoutineTab(tab) {
  document.getElementById('tab-a-btn').classList.toggle('active', tab === 'A');
  document.getElementById('tab-b-btn').classList.toggle('active', tab === 'B');
  document.getElementById('routine-plan-a').classList.toggle('active', tab === 'A');
  document.getElementById('routine-plan-b').classList.toggle('active', tab === 'B');
}

let daysStatus = JSON.parse(localStorage.getItem('current_month_days')) || Array(30).fill('green');
let monthHistory = JSON.parse(localStorage.getItem('discipline_history')) || [];
const statusCycle = ['green', 'yellow', 'red', 'gray'];

function renderDisciplineCalendar() {
  const container = document.getElementById('discipline-calendar');
  if (!container) return;

  container.innerHTML = daysStatus.map((status, index) => `
    <div class="day-square status-${status}" onclick="cycleDayStatus(${index})">
      ${index + 1}
    </div>
  `).join('');

  calculateDisciplineRate();
  renderHistory();
}

function cycleDayStatus(index) {
  const currentIdx = statusCycle.indexOf(daysStatus[index]);
  const nextIdx = (currentIdx + 1) % statusCycle.length;
  daysStatus[index] = statusCycle[nextIdx];
  localStorage.setItem('current_month_days', JSON.stringify(daysStatus));
  renderDisciplineCalendar();
}

function calculateDisciplineRate() {
  const activeDays = daysStatus.filter(s => s !== 'gray');
  if (activeDays.length === 0) {
    document.getElementById('discipline-rate').innerText = '100%';
    return '100%';
  }

  let totalPoints = 0;
  activeDays.forEach(s => {
    if (s === 'green') totalPoints += 100;
    if (s === 'yellow') totalPoints += 50;
    if (s === 'red') totalPoints += 0;
  });

  const rate = Math.round(totalPoints / activeDays.length);
  const rateElem = document.getElementById('discipline-rate');
  if (rateElem) {
    rateElem.innerText = `${rate}%`;
    rateElem.className = rate >= 80 ? 'green' : (rate >= 50 ? 'yellow' : 'red');
  }
  return `${rate}%`;
}

function archiveCurrentMonth() {
  if (!confirm("Завершити поточний місяць та зберегти результат в Архів?")) return;

  const currentRate = calculateDisciplineRate();
  const dateStr = new Date().toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' });

  monthHistory.unshift({
    title: `Місяць #${monthHistory.length + 1} (${dateStr})`,
    rate: currentRate
  });

  localStorage.setItem('discipline_history', JSON.stringify(monthHistory));

  daysStatus = Array(30).fill('green');
  localStorage.setItem('current_month_days', JSON.stringify(daysStatus));

  renderDisciplineCalendar();
}

function renderHistory() {
  const container = document.getElementById('history-list');
  if (!container) return;

  if (monthHistory.length === 0) {
    container.innerHTML = `<div style="color: #8e8e93; font-size: 0.85rem; text-align: center;">Архів поки порожній.</div>`;
    return;
  }

  container.innerHTML = monthHistory.map(item => `
    <div class="history-item">
      <span>${item.title}</span>
      <strong class="${parseInt(item.rate) >= 80 ? 'green' : 'yellow'}">${item.rate}</strong>
    </div>
  `).join('');
}

// --- РОЗДІЛ: ПЛАНИ, ТЕРМІНИ ТА ЦІЛІ ---

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
  // 1. Терміни
  const tContainer = document.getElementById('termine-list');
  if (tContainer) {
    if (termineList.length === 0) {
      tContainer.innerHTML = `<div style="color: #8e8e93; font-size: 0.85rem;">Немає запланованих термінів.</div>`;
    } else {
      tContainer.innerHTML = termineList.map(t => `
        <div class="plan-card">
          <input type="checkbox" onclick="completePlanItem('termine', ${t.id})">
          <div class="plan-card-content">
            <div class="plan-card-title">${t.title}</div>
            <div class="plan-card-sub">📅 ${t.date.replace('T', ' ')} ${t.note ? ' | ' + t.note : ''}</div>
          </div>
        </div>
      `).join('');
    }
  }

  // 2. Цілі на рік
  const yContainer = document.getElementById('year-goals-list');
  if (yContainer) {
    if (yearGoals.length === 0) {
      yContainer.innerHTML = `<div style="color: #8e8e93; font-size: 0.85rem;">Немає річних цілей. Додайте першу вище!</div>`;
    } else {
      yContainer.innerHTML = yearGoals.map(g => `
        <div class="plan-card">
          <input type="checkbox" onclick="completePlanItem('year', ${g.id})">
          <div class="plan-card-content">
            <div class="plan-card-title">${g.title}</div>
          </div>
        </div>
      `).join('');
    }
  }

  // 3. Кроки
  const sContainer = document.getElementById('step-goals-list');
  if (sContainer) {
    if (stepGoals.length === 0) {
      sContainer.innerHTML = `<div style="color: #8e8e93; font-size: 0.85rem;">Немає кроків. Додайте перший вище!</div>`;
    } else {
      sContainer.innerHTML = stepGoals.map(g => `
        <div class="plan-card">
          <input type="checkbox" onclick="completePlanItem('step', ${g.id})">
          <div class="plan-card-content">
            <div class="plan-card-title">${g.title}</div>
          </div>
        </div>
      `).join('');
    }
  }

  // 4. Архів
  const aContainer = document.getElementById('plans-archive-list');
  if (aContainer) {
    if (plansArchive.length === 0) {
      aContainer.innerHTML = `<div style="color: #8e8e93; font-size: 0.85rem;">Архів поки порожній.</div>`;
    } else {
      aContainer.innerHTML = plansArchive.map(a => `
        <div class="plan-card" style="opacity: 0.7;">
          <div class="plan-card-content">
            <div class="plan-card-title" style="text-decoration: line-through;">${a.title}</div>
            <div class="plan-card-sub">Завершено: ${a.completedAt} (${a.sub})</div>
          </div>
        </div>
      `).join('');
    }
  }
}

// --- ІНІЦІАЛІЗАЦІЯ ІНТЕРФЕЙСУ ---

function initUI() {
  const renderList = (data, elementId) => {
    const container = document.getElementById(elementId);
    if (!container) return;
    
    container.innerHTML = data.map(item => {
      const safeItem = JSON.stringify(item).replace(/'/g, "&#39;");
      
      return `
        <div class="asset-card" onclick='openTradeModal(${safeItem})'>
          <div class="asset-info">
            <img class="real-logo" src="${item.logo}" alt="${item.ticker}" onerror="this.src='https://img.icons8.com/color/48/coins.png'" />
            <div class="asset-names">
              <span class="ticker">${item.ticker}</span>
              <span class="subtitle">${item.name}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  };

  renderList(stocksData, 'stocks-list');
  renderList(cryptoData, 'crypto-list');

  renderJournals();
  updateTotals();
  renderNutrition();
  renderDisciplineCalendar();
  renderPlans();
}

document.addEventListener('DOMContentLoaded', initUI);
