import React from 'react';
import { CoinIconLogo } from './Icons';

function CoinsGrid({ prices, onActionClick }) {
  const coins = [
    { symbol: 'BTC', name: 'Bitcoin', speed: '5-10 Mins', network: 'Native Network' },
    { symbol: 'ETH', name: 'Ethereum', speed: '2-3 Mins', network: 'ERC20' },
    { symbol: 'USDT', name: 'Tether USD', speed: 'Instant', network: 'TRC20 / ERC20' },
    { symbol: 'BNB', name: 'Binance Coin', speed: 'Instant', network: 'BEP20 / BEP2' },
    { symbol: 'USDC', name: 'USD Coin', speed: 'Instant', network: 'ERC20' },
    { symbol: 'XRP', name: 'Ripple', speed: 'Instant', network: 'XRP Ledger' }
  ];

  return (
    <section id="supported-coins">
      <div className="container">
        <div className="section-header">
          <h2>Supported Cryptocurrencies</h2>
          <p>Convert any of our supported digital assets to INR instantly with high-liquidity order routing.</p>
        </div>

        <div className="coins-grid">
          {coins.map((coin) => {
            const priceInfo = prices[coin.symbol];
            const priceString = priceInfo ? `$${priceInfo.usd.toLocaleString('en-US', { minimumFractionDigits: coin.symbol === 'USDT' || coin.symbol === 'USDC' ? 4 : 2, maximumFractionDigits: coin.symbol === 'USDT' || coin.symbol === 'USDC' ? 4 : 2 })}` : 'Loading...';
            const changeVal = priceInfo ? priceInfo.usd_24h_change : 0;
            const isUp = changeVal >= 0;

            return (
              <div key={coin.symbol} className="glass-panel coin-card">
                <div className="coin-card-header">
                  <div className="coin-card-icon-info">
                    <CoinIconLogo symbol={coin.symbol} size={40} />
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>{coin.name}</h3>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{coin.symbol}</span>
                    </div>
                  </div>
                  <span className="coin-card-badge">{coin.speed}</span>
                </div>

                <div className="coin-card-price-info">
                  <div className="coin-card-price">{priceString}</div>
                  {priceInfo && (
                    <div className={`coin-card-change ${isUp ? 'change-up' : 'change-down'}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>{isUp ? '▲' : '▼'}</span>
                      <span>{Math.abs(changeVal).toFixed(2)}% (24h)</span>
                    </div>
                  )}
                </div>

                <div className="coin-card-stats">
                  <div>
                    <span>Network: </span>
                    <span style={{ color: '#fff', fontWeight: '600' }}>{coin.network}</span>
                  </div>
                </div>


              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default CoinsGrid;
