// ІНІЦІАЛІЗАЦІЯ TELEGRAM WEB APP
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}

// СПИСОК АКЦІЙ (За розкладкою зі скріншоту)
const stocksData = [
  { name: "Meta Platforms", ticker: "META", logo: "M" },
  { name: "Coinbase Global", ticker: "CoinBase", logo: "CB" },
  { name: "Netflix Inc.", ticker: "Netflix", logo: "NFLX" },
  { name: "Albemarle Corp.", ticker: "ALB", logo: "ALB" },
  { name: "Take-Two Interactive", ticker: "TAKE TWO", logo: "TT" },
  { name: "McDonald's Corp.", ticker: "MCdonalds", logo: "MCD" },
  { name: "Tesla Inc.", ticker: "Tesla", logo: "TSLA" },
  { name: "DAX Index", ticker: "DAX", logo: "DAX" }
];

// СПИСОК КРИПТОВАЛЮТ (У повній оригінальній назві)
const cryptoData = [
  { name: "Toncoin", ticker: "TON", logo: "💎" },
  { name: "Bitcoin", ticker: "BTC", logo: "₿" },
  { name: "XRP (Ripple)", ticker: "XRP", logo: "✕" },
  { name: "Solana", ticker: "SOL", logo: "◎" },
  { name: "Ethereum", ticker: "ETH", logo: "Ξ" }
];

// ЩОДЕННИК ФІКСАЦІЙ
const journalStocks = [
  { name: "Meta Platforms", profit: "+22€", note: "8%" },
  { name: "Coinbase Global", profit: "+45€", note: "27%" },
  { name: "Netflix Inc.", profit: "+9.65€", note: "" },
  { name: "Albemarle Corp.", profit: "+41.77€", note: "" },
  { name: "DAX Index", profit: "+7.47€", note: "" }
];

const journalCrypto = [
  { name: "Toncoin", profit: "+67.80$" },
  { name: "Bitcoin", profit: "+58.35$" },
  { name: "XRP (Ripple)", profit: "0$" },
  { name: "Solana", profit: "+102.67$" },
  { name: "Ethereum", profit: "+86.52$" }
];

// НАВІГАЦІЯ ТА ІСТОРІЯ
let screenHistory = ['main-menu'];

function navigateTo(screenId) {
  const currentScreen = screenHistory[screenHistory.length - 1];
  if (currentScreen !== screenId) {
    screenHistory.push(screenId);
    renderScreen(screenId);
  }
}

function goBack() {
  if (screenHistory.length > 1) {
    screenHistory.pop();
    const previousScreen = screenHistory[screenHistory.length - 1];
    renderScreen(previousScreen);
  }
}

function renderScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(screenId);
  if (target) target.classList.add('active');
}

// ВІДОБРАЖЕННЯ СПИСКІВ
function initUI() {
  // Рендер Акцій
  const stocksList = document.getElementById('stocks-list');
  stocksList.innerHTML = stocksData.map(s => `
    <div class="asset-card">
      <div class="asset-info">
        <div class="logo-circle">${s.logo}</div>
        <div class="asset-names">
          <span class="ticker">${s.ticker}</span>
          <span class="subtitle">${s.name}</span>
        </div>
      </div>
    </div>
  `).join('');

  // Рендер Крипти
  const cryptoList = document.getElementById('crypto-list');
  cryptoList.innerHTML = cryptoData.map(c => `
    <div class="asset-card">
      <div class="asset-info">
        <div class="logo-circle" style="background:#f7931a;">${c.logo}</div>
        <div class="asset-names">
          <span class="ticker">${c.ticker}</span>
          <span class="subtitle">${c.name}</span>
        </div>
      </div>
    </div>
  `).join('');

  // Рендер Щоденника Акцій
  document.getElementById('journal-stocks').innerHTML = journalStocks.map(j => `
    <div class="journal-item">
      <span>${j.name} ${j.note ? '(' + j.note + ')' : ''}</span>
      <span class="profit">${j.profit}</span>
    </div>
  `).join('');

  // Рендер Щоденника Крипти
  document.getElementById('journal-crypto').innerHTML = journalCrypto.map(j => `
    <div class="journal-item">
      <span>${j.name}</span>
      <span class="profit">${j.profit}</span>
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', initUI);