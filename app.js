const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }

let stocksData = [
  { id: 'meta', name: "Meta Platforms", ticker: "META", logo: "https://logo.clearbit.com/meta.com", invested: 0 },
  { id: 'coinbase', name: "Coinbase Global", ticker: "CoinBase", logo: "https://logo.clearbit.com/coinbase.com", invested: 0 },
  { id: 'netflix', name: "Netflix Inc.", ticker: "Netflix", logo: "https://logo.clearbit.com/netflix.com", invested: 0 },
  { id: 'albemarle', name: "Albemarle Corp.", ticker: "ALB", logo: "https://logo.clearbit.com/albemarle.com", invested: 0 },
  { id: 'taketwo', name: "Take-Two Interactive", ticker: "TAKE TWO", logo: "https://logo.clearbit.com/take2games.com", invested: 0 },
  { id: 'mcdonalds', name: "McDonald's Corp.", ticker: "MCdonalds", logo: "https://logo.clearbit.com/mcdonalds.com", invested: 0 },
  { id: 'tesla', name: "Tesla Inc.", ticker: "Tesla", logo: "https://logo.clearbit.com/tesla.com", invested: 0 },
  { id: 'dax', name: "DAX Index", ticker: "DAX", logo: "https://logo.clearbit.com/dax-indices.com", invested: 0 }
];

let cryptoData = [
  { id: 'ton', name: "Toncoin", ticker: "TON", logo: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/ton.png", invested: 0 },
  { id: 'btc', name: "Bitcoin", ticker: "BTC", logo: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/btc.png", invested: 0 },
  { id: 'xrp', name: "XRP", ticker: "XRP", logo: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/xrp.png", invested: 0 },
  { id: 'sol', name: "Solana", ticker: "SOL", logo: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/sol.png", invested: 0 },
  { id: 'eth', name: "Ethereum", ticker: "ETH", logo: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/icon/eth.png", invested: 0 }
];

let journalStocks = [
  { name: "Meta Platforms", profit: 22, note: "8%" },
  { name: "Coinbase Global", profit: 45, note: "27%" },
  { name: "Netflix Inc.", profit: 9.65, note: "" },
  { name: "Albemarle Corp.", profit: 41.77, note: "" },
  { name: "DAX Index", profit: 7.47, note: "" }
];

let journalCrypto = [
  { name: "Toncoin", profit: 67.80 },
  { name: "Bitcoin", profit: 58.35 },
  { name: "XRP (Ripple)", profit: 0 },
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
      selectedAsset.invested = Math.max(0, selectedAsset.invested - price);
    }
    updateTotals();
  }
  closeModal();
}

function updateTotals() {
  const totalStocks = stocksData.reduce((acc, item) => acc + item.invested, 0);
  const totalCrypto = cryptoData.reduce((acc, item) => acc + item.invested, 0);
  document.getElementById('total-invested-sum').innerText = `${(totalStocks + totalCrypto).toFixed(2)} €`;
}

function initUI() {
  const renderList = (data, elementId) => {
    const container = document.getElementById(elementId);
    if (!container) return;
    container.innerHTML = data.map(item => `
      <div class="asset-card" onclick='openTradeModal(${JSON.stringify(item)})'>
        <div class="asset-info">
          <img class="real-logo" src="${item.logo}" onerror="this.src='https://via.placeholder.com/32'" />
          <div class="asset-names">
            <span class="ticker">${item.ticker}</span>
            <span class="subtitle">${item.name}</span>
          </div>
        </div>
      </div>
    `).join('');
  };

  renderList(stocksData, 'stocks-list');
  renderList(cryptoData, 'crypto-list');

  const jStocks = document.getElementById('journal-stocks');
  if (jStocks) {
    jStocks.innerHTML = journalStocks.map(j => `
      <div class="journal-item"><span>${j.name}</span><span class="green">+${j.profit}€</span></div>
    `).join('');
  }

  const jCrypto = document.getElementById('journal-crypto');
  if (jCrypto) {
    jCrypto.innerHTML = journalCrypto.map(j => `
      <div class="journal-item"><span>${j.name}</span><span class="green">+${j.profit}$</span></div>
    `).join('');
  }

  updateTotals();
}

document.addEventListener('DOMContentLoaded', initUI);