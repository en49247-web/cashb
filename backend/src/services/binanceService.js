const Settings = require('../models/Settings');
const { broadcastAllRatesUpdate } = require('../websocket');

const COUNTRY_DEFAULTS = {
  '+91': { USDT: 85, USDC: 88, BTC: 8540000, ETH: 210000, TRX: 10 },
  '+1': { USDT: 1.00, USDC: 1.00, BTC: 95000, ETH: 3500, TRX: 0.12 },
  '+44': { USDT: 0.79, USDC: 0.79, BTC: 75000, ETH: 2750, TRX: 0.09 },
  '+92': { USDT: 278, USDC: 278, BTC: 26000000, ETH: 970000, TRX: 33 },
  '+971': { USDT: 3.67, USDC: 3.67, BTC: 349000, ETH: 12850, TRX: 0.44 },
  '+61': { USDT: 1.51, USDC: 1.51, BTC: 143500, ETH: 5280, TRX: 0.18 },
  '+49': { USDT: 0.93, USDC: 0.93, BTC: 88500, ETH: 3250, TRX: 0.11 },
  '+65': { USDT: 1.35, USDC: 1.35, BTC: 128000, ETH: 4720, TRX: 0.16 },
  '+966': { USDT: 3.75, USDC: 3.75, BTC: 356000, ETH: 13100, TRX: 0.45 },
  '+880': { USDT: 117, USDC: 117, BTC: 11000000, ETH: 410000, TRX: 14 },
  '+977': { USDT: 133, USDC: 133, BTC: 12600000, ETH: 465000, TRX: 16 },
  '+94': { USDT: 302, USDC: 302, BTC: 28600000, ETH: 1050000, TRX: 36 }
};

let lastFetchedPrices = {
  BTCUSDT: 95000,
  ETHUSDT: 3500,
  TRXUSDT: 0.12,
  USDCUSDT: 1.00
};

// Fetch real-time prices from Binance public ticker API
async function fetchBinancePrices() {
  try {
    const symbols = ['BTCUSDT', 'ETHUSDT', 'TRXUSDT', 'USDCUSDT'];
    const response = await fetch('https://api.binance.com/api/v3/ticker/price');
    if (!response.ok) {
      throw new Error(`Binance API returned status ${response.status}`);
    }
    const data = await response.json();
    if (Array.isArray(data)) {
      const prices = {};
      data.forEach(item => {
        if (symbols.includes(item.symbol)) {
          prices[item.symbol] = parseFloat(item.price);
        }
      });
      if (prices.BTCUSDT && prices.ETHUSDT && prices.TRXUSDT) {
        lastFetchedPrices = { ...lastFetchedPrices, ...prices };
        console.log('[Binance Service] Real-time prices updated successfully:', lastFetchedPrices);
      }
    }
  } catch (error) {
    console.warn('[Binance Service] Error fetching from Binance API, using fallback/cached prices:', error.message);
  }
}

// Update settings collection and broadcast rates
async function updateGlobalRates() {
  try {
    // 1. Fetch latest prices from Binance
    await fetchBinancePrices();

    // 2. Load current exchange rates setting from database
    const setting = await Settings.findOne({ key: 'exchange_rates' });
    let dbRates = setting ? setting.value : {};

    // 3. For each country, calculate rates relative to configured USDT rate
    const updatedRates = {};
    const countryCodes = Object.keys(COUNTRY_DEFAULTS);

    countryCodes.forEach(code => {
      // Find current USDT rate in DB or fallback to default
      const currentUsdtRate = dbRates[code]?.USDT || COUNTRY_DEFAULTS[code].USDT;
      const currentUsdcRate = dbRates[code]?.USDC || COUNTRY_DEFAULTS[code].USDC;

      // Calculate new rates based on Binance global rates scaled by the local USDT rate
      const btcPrice = Number((lastFetchedPrices.BTCUSDT * currentUsdtRate).toFixed(2));
      const ethPrice = Number((lastFetchedPrices.ETHUSDT * currentUsdtRate).toFixed(2));
      const trxPrice = Number((lastFetchedPrices.TRXUSDT * currentUsdtRate).toFixed(4));
      const usdcPrice = Number((lastFetchedPrices.USDCUSDT * currentUsdtRate).toFixed(4));

      updatedRates[code] = {
        USDT: currentUsdtRate,
        USDC: currentUsdcRate || usdcPrice,
        BTC: btcPrice,
        ETH: ethPrice,
        TRX: trxPrice
      };
    });

    // 4. Save to database
    await Settings.findOneAndUpdate(
      { key: 'exchange_rates' },
      { key: 'exchange_rates', value: updatedRates },
      { upsert: true, new: true }
    );

    // 5. Broadcast to websocket clients for each country
    // Let's broadcast the rates to all connected users
    // Note: We can broadcast the updated rates dictionary so clients get the update.
    broadcastAllRatesUpdate(updatedRates);

  } catch (error) {
    console.error('[Binance Service] Error updating global rates in background:', error);
  }
}

// Start background task
let intervalId = null;

function startBinanceSync(intervalMs = 10000) {
  if (intervalId) return;
  
  console.log('[Binance Service] Starting Binance sync service...');
  // Initial run
  updateGlobalRates();

  // Schedule interval
  intervalId = setInterval(updateGlobalRates, intervalMs);
}

function stopBinanceSync() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('[Binance Service] Stopped Binance sync service.');
  }
}

module.exports = {
  startBinanceSync,
  stopBinanceSync,
  updateGlobalRates
};
