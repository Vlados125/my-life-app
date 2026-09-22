const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }

// 100% робочі та відкриті CDN-посилання без блокувань Hotlink/CORS
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

function initUI() {
  const renderList = (data, elementId) => {
    const container = document.getElementById(elementId);
    if (!container) return;
    
    container.innerHTML = data.map(item => {
      // Безопечне екранування апострофів для запобігання синтаксичних помилок в HTML (наприклад, для McDonald's)
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
}

document.addEventListener('DOMContentLoaded', initUI);
