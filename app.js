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
    title: "🟢 ВАРІАНТ 1: ~2500 ккал (Базовий)",
    bju: "БЖУ: ~197 г Б | ~100 г Ж | ~187 г В",
    breakfast: [
      "Speisequark 20%: 300 г",
      "Яйця курячі: 2 шт. (~110 г)",
      "Протеїн (Whey): 30 г",
      "Вівсяні пластівці: 80 г",
      "Заморожені ягоди: 150 г",
      "Насіння: 15 г",
      "Молоко 1.5%: 150 мл",
      "Твердий сир (45%): 20 г"
    ],
    dinner1: {
      title: "Курка Карі (~1350 ккал)",
      filet: 330,
      rice: 105,
      veggies: 250,
      cream: 100,
      oilFry: 15,
      oilEV: 10,
      almonds: 35
    },
    dinner2: [
      "Фарш з індички (160 ккал): 400 г",
      "Гречка суха: 120 г",
      "Томатний соус: 150 г",
      "Овочі: 200 г",
      "Оливкова олія EV: 10 г",
      "Мигдаль: 15 г"
    ]
  },
  2400: {
    title: "🟡 ВАРІАНТ 2: ~2400 ккал (-25г вуглеводів)",
    bju: "БЖУ: ~195 г Б | ~98 г Ж | ~162 г В",
    breakfast: [
      "Speisequark 20%: 300 г",
      "Яйця курячі: 2 шт. (~110 г)",
      "Протеїн (Whey): 30 г",
      "Вівсяні пластівці: 65 г (−15г)",
      "Заморожені ягоди: 150 г",
      "Насіння: 15 г",
      "Молоко 1.5%: 150 мл",
      "Твердий сир (45%): 20 г"
    ],
    dinner1: {
      title: "Курка Карі (~1210 ккал)",
      filet: 330,
      rice: 80,
      veggies: 250,
      cream: 100,
      oilFry: 15,
      oilEV: 10,
      almonds: 35
    },
    dinner2: [
      "Фарш з індички: 400 г",
      "Суха гречка: 90 г (−30г)",
      "Томатний соус: 150 г",
      "Овочі: 200 г",
      "Оливкова олія EV: 10 г",
      "Мигдаль: 15 г"
    ]
  },
  2300: {
    title: "🟠 ВАРІАНТ 3: ~2300 ккал (-50г вуглеводів)",
    bju: "БЖУ: ~193 г Б | ~96 г Ж | ~137 г В",
    breakfast: [
      "Speisequark 20%: 300 г",
      "Яйця курячі: 2 шт. (~110 г)",
      "Протеїн (Whey): 30 г",
      "Вівсяні пластівці: 55 г (−25г)",
      "Заморожені ягоди: 150 г",
      "Насіння: 15 г",
      "Молоко 1.5%: 150 мл",
      "Твердий сир (45%): 20 г"
    ],
    dinner1: {
      title: "Курка Карі (~1150 ккал)",
      filet: 330,
      rice: 55,
      veggies: 250,
      cream: 100,
      oilFry: 15,
      oilEV: 10,
      almonds: 35
    },
    dinner2: [
      "Фарш з індички: 400 г",
      "Суха гречка: 65 г (−55г)",
      "Томатний соус: 150 г",
      "Овочі: 200 г",
      "Оливкова олія EV: 10 г",
      "Мигдаль: 15 г"
    ]
  },
  2200: {
    title: "🔴 ВАРІАНТ 4: ~2200 ккал (-75г вуглеводів)",
    bju: "БЖУ: ~190 г Б | ~94 г Ж | ~112 г В",
    breakfast: [
      "Speisequark 20%: 300 г",
      "Яйця курячі: 2 шт. (~110 г)",
      "Протеїн (Whey): 30 г",
      "Вівсяні пластівці: 45 г (−35г)",
      "Заморожені ягоди: 150 г",
      "Насіння: 15 г",
      "Молоко 1.5%: 150 мл",
      "Твердий сир (45%): 20 г"
    ],
    dinner1: {
      title: "Курка Карі (~1100 ккал)",
      filet: 330,
      rice: 35,
      veggies: 250,
      cream: 100,
      oilFry: 15,
      oilEV: 10,
      almonds: 35
    },
    dinner2: [
      "Фарш з індички: 400 г",
      "Суха гречка: 40 г (−80г)",
      "Томатний соус: 150 г",
      "Овочі: 200 г",
      "Оливкова олія EV: 10 г",
      "Мигдаль: 15 г"
    ]
  }
};

let currentCalorieTarget = 2500;
let curryServings = 1;

function changeCalorieTarget(val) {
  currentCalorieTarget = parseInt(val);
  renderNutrition();
}

function changeCurryServings(delta) {
  curryServings = Math.max(1, curryServings + delta);
  document.getElementById('curry-servings-count').innerText = curryServings;
  renderNutrition();
}

function renderNutrition() {
  const data = nutritionData[currentCalorieTarget];
  if (!data) return;

  document.getElementById('nutrition-title').innerText = data.title;
  document.getElementById('nutrition-bju').innerText = data.bju;

  const bfElem = document.getElementById('breakfast-list');
  if (bfElem) {
    bfElem.innerHTML = data.breakfast.map(item => `<li>${item}</li>`).join('');
  }

  const d1 = data.dinner1;
  const d1Elem = document.getElementById('dinner1-list');
  if (d1Elem) {
    d1Elem.innerHTML = `
      <li><b>${d1.title}</b></li>
      <li>Куряче філе: ${d1.filet} г</li>
      <li>Сухий рис: ${d1.rice} г</li>
      <li>Заморожені овочі: ${d1.veggies} г</li>
      <li>Вершки 7%: ${d1.cream} мл</li>
      <li>Олія для смаження: ${d1.oilFry} г | Оливкова EV: ${d1.oilEV} г</li>
      <li>Мигдаль: ${d1.almonds} г</li>
    `;
  }

  const curryList = document.getElementById('curry-ingredients-list');
  if (curryList) {
    curryList.innerHTML = `
      <li>Куряче філе: <b>${d1.filet * curryServings} г</b></li>
      <li>Сухий рис: <b>${d1.rice * curryServings} г</b></li>
      <li>Заморожені овочі: <b>${d1.veggies * curryServings} г</b></li>
      <li>Вершки 7%: <b>${d1.cream * curryServings} мл</b></li>
      <li>Олія для смаження: <b>${d1.oilFry * curryServings} г</b></li>
      <li>Оливкова олія EV: <b>${d1.oilEV * curryServings} г</b></li>
      <li>Мигдаль: <b>${d1.almonds * curryServings} г</b></li>
    `;
  }

  const d2Elem = document.getElementById('dinner2-list');
  if (d2Elem) {
    d2Elem.innerHTML = data.dinner2.map(item => `<li>${item}</li>`).join('');
  }
}

// --- ІНІЦІАЛІЗАЦІЯ ІНТЕРФЕЙСУ ---

function initUI() {
  const renderList = (data, elementId) => {
    const container = document.getElementById(elementId);
    if (!container) return;
    
    container.innerHTML = data.map(item => {
      // Безопечне екранування апострофів для McDonald's
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
}

document.addEventListener('DOMContentLoaded', initUI);
