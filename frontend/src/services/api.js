// Cryptocurrency price service for cashXcrypto using Binance API

const FALLBACK_PRICES = {
  BTC: { usd: 63908.04, usd_24h_change: 2.35, usd_market_cap: 1250000000000, inr: 5850000, inr_24h_change: 2.45, inr_market_cap: 110000000000000 },
  ETH: { usd: 1677.33, usd_24h_change: 1.23, usd_market_cap: 200000000000, inr: 310000, inr_24h_change: 1.25, inr_market_cap: 27000000000000 },
  USDT: { usd: 1.00, usd_24h_change: 0.00, usd_market_cap: 112000000000, inr: 88.00, inr_24h_change: 0.00, inr_market_cap: 9800000000000 },
  USDC: { usd: 1.00, usd_24h_change: 0.00, usd_market_cap: 32000000000, inr: 88.00, inr_24h_change: 0.00, inr_market_cap: 2800000000000 },
  BNB: { usd: 580.45, usd_24h_change: 1.85, usd_market_cap: 90000000000, inr: 51000, inr_24h_change: 1.85, inr_market_cap: 7900000000000 },
  XRP: { usd: 0.5215, usd_24h_change: -0.92, usd_market_cap: 29000000000, inr: 45.90, inr_24h_change: -0.92, inr_market_cap: 2500000000000 },
  TRX: { usd: 0.1168, usd_24h_change: 0.42, usd_market_cap: 10000000000, inr: 10.15, inr_24h_change: 0.45, inr_market_cap: 890000000000 }
};

export const fetchLivePrices = async () => {
  try {
    const symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "USDCUSDT", "XRPUSDT", "TRXUSDT"];
    const response = await fetch(
      `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(JSON.stringify(symbols))}`
    );

    if (!response.ok) {
      throw new Error('Binance API request failed');
    }

    const data = await response.json();
    const formattedData = {};
    const USD_INR_RATE = 88.0; // Default standard USD-to-INR scaling rate

    const priceMap = {};
    if (Array.isArray(data)) {
      data.forEach(item => {
        priceMap[item.symbol] = {
          usd: parseFloat(item.lastPrice),
          usd_24h_change: parseFloat(item.priceChangePercent)
        };
      });
    }

    const coinSymbols = ['BTC', 'ETH', 'USDT', 'BNB', 'USDC', 'XRP', 'TRX'];

    coinSymbols.forEach(symbol => {
      if (symbol === 'USDT') {
        formattedData[symbol] = {
          usd: 1.00,
          usd_24h_change: 0.00,
          usd_market_cap: 112000000000,
          inr: USD_INR_RATE,
          inr_24h_change: 0.00,
          inr_market_cap: 9800000000000
        };
      } else {
        const pair = `${symbol}USDT`;
        if (priceMap[pair]) {
          const usdPrice = priceMap[pair].usd;
          const usdChange = priceMap[pair].usd_24h_change;
          formattedData[symbol] = {
            usd: usdPrice,
            usd_24h_change: usdChange,
            usd_market_cap: FALLBACK_PRICES[symbol]?.usd_market_cap || 0,
            inr: usdPrice * USD_INR_RATE,
            inr_24h_change: usdChange,
            inr_market_cap: (FALLBACK_PRICES[symbol]?.usd_market_cap || 0) * USD_INR_RATE
          };
        } else {
          formattedData[symbol] = FALLBACK_PRICES[symbol] || {
            usd: 1.0,
            usd_24h_change: 0.0,
            usd_market_cap: 0,
            inr: USD_INR_RATE,
            inr_24h_change: 0.0,
            inr_market_cap: 0
          };
        }
      }
    });

    return formattedData;
  } catch (error) {
    console.warn('Failed to fetch live prices from Binance, using fallback data:', error.message);
    const formattedData = {};
    const USD_INR_RATE = 88.0;
    const coinSymbols = ['BTC', 'ETH', 'USDT', 'BNB', 'USDC', 'XRP', 'TRX'];
    coinSymbols.forEach(symbol => {
      formattedData[symbol] = FALLBACK_PRICES[symbol] || {
        usd: 1.0,
        usd_24h_change: 0.0,
        usd_market_cap: 0,
        inr: USD_INR_RATE,
        inr_24h_change: 0.0,
        inr_market_cap: 0
      };
    });
    return formattedData;
  }
};

/**
 * Simulates a minor price fluctuation to make the board look "live"
 * @param {Object} currentPrices - The current prices object
 * @returns {Object} Fluctuted prices
 */
export const fluctuatePrices = (currentPrices) => {
  const fluctuated = {};
  Object.keys(currentPrices).forEach(symbol => {
    const priceData = currentPrices[symbol];
    if (!priceData) return;
    // Random fluctuation between -0.05% and +0.05%
    const changePercent = (Math.random() - 0.5) * 0.001;

    const currentInr = priceData.inr || 1;
    const currentUsd = priceData.usd || 1;
    const currentInrChange = priceData.inr_24h_change || 0;
    const currentUsdChange = priceData.usd_24h_change || 0;

    const newInr = currentInr * (1 + changePercent);
    const newUsd = currentUsd * (1 + changePercent);

    fluctuated[symbol] = {
      ...priceData,
      inr: parseFloat(newInr.toFixed(symbol === 'USDT' || symbol === 'USDC' ? 2 : 0)),
      inr_24h_change: parseFloat((currentInrChange + changePercent * 100).toFixed(2)),
      usd: parseFloat(newUsd.toFixed(symbol === 'USDT' || symbol === 'USDC' ? 4 : (symbol === 'TRX' || symbol === 'XRP' ? 4 : 2))),
      usd_24h_change: parseFloat((currentUsdChange + changePercent * 100).toFixed(2)),
      lastDirection: changePercent >= 0 ? 'up' : 'down'
    };
  });
  return fluctuated;
};
