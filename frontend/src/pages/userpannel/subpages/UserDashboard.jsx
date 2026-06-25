import React, { useState } from 'react';
import { CoinIconLogo } from '../../../components/Icons';

const SwapIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 8 16 13"></polyline><line x1="21" y1="8" x2="9" y2="8"></line><polyline points="8 21 3 16 8 11"></polyline><line x1="3" y1="16" x2="15" y2="16"></line></svg>
);

const EyeIcon = ({ open = true }) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: 'pointer', opacity: 0.7, transition: 'opacity 0.2s' }}>
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
      </>
    )}
  </svg>
);

function UserDashboard({
  balances = {},
  bankAccounts = [],
  kycStatus = 'Unverified',
  transactions = [],
  deposits = [],
  withdrawals = [],
  exchangeCoin,
  setExchangeCoin,
  exchangeAmount,
  setExchangeAmount,
  exchangeRate,
  receiveAmount,
  handleQuickExchange,
  setActiveTab,
  getPendingExchangeAmount,
  getExchangeRate,
  getCurrencyConfig,
  formatUserCurrency,
  prices = {}
}) {
  const [showBalance, setShowBalance] = useState(true);
  const [activeWatchlistTab, setActiveWatchlistTab] = useState('Hot');

  const config = getCurrencyConfig ? getCurrencyConfig() : { symbol: '₹', code: 'INR', locale: 'en-IN' };
  const formatVal = (val) => {
    if (formatUserCurrency) return formatUserCurrency(val);
    return `₹${Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  // Calculations
  const totalExchangesVal = transactions
    .filter(tx => tx.status === 'Completed')
    .reduce((sum, tx) => sum + (parseFloat(tx.inr) || 0), 0);

  const pendingOrdersVal = 
    transactions.filter(tx => tx.status === 'Pending').length +
    deposits.filter(d => d.status === 'Pending').length +
    withdrawals.filter(w => w.status === 'Pending').length;

  const completedOrdersVal = 
    transactions.filter(tx => tx.status === 'Completed').length +
    deposits.filter(d => d.status === 'Completed').length +
    withdrawals.filter(w => w.status === 'Completed').length;

  // Total balance in USDT / USD
  const totalBalanceUsdtVal = Object.entries(balances).reduce((sum, [symbol, val]) => {
    const coinRate = getExchangeRate ? getExchangeRate(symbol) : 100;
    const usdtRate = getExchangeRate ? getExchangeRate('USDT') : 87;
    const priceInUsdt = coinRate / (usdtRate || 1);
    return sum + (parseFloat(val) || 0) * priceInUsdt;
  }, 0);

  // Total balance in INR
  const totalBalanceInrVal = Object.entries(balances).reduce((sum, [symbol, val]) => {
    const rate = getExchangeRate ? getExchangeRate(symbol) : 100;
    return sum + (parseFloat(val) || 0) * rate;
  }, 0);

  // List of coins for our watchlist
  const watchlistCoins = ['BTC', 'ETH', 'USDT', 'USDC', 'TRX'];
  
  const COIN_STATS = {
    BTC: { name: 'Bitcoin', marketCap: 1250000000000, fallbackChange: 2.35 },
    ETH: { name: 'Ethereum', marketCap: 200000000000, fallbackChange: 1.23 },
    USDT: { name: 'Tether USD', marketCap: 112000000000, fallbackChange: -0.16 },
    USDC: { name: 'USD Coin', marketCap: 32000000000, fallbackChange: 0.09 },
    TRX: { name: 'TRON', marketCap: 10000000000, fallbackChange: 0.42 }
  };

  const getSortedCoins = () => {
    const coins = [...watchlistCoins];
    if (activeWatchlistTab === 'Market Cap') {
      return coins.sort((a, b) => {
        const aCap = prices[a]?.usd_market_cap || COIN_STATS[a].marketCap;
        const bCap = prices[b]?.usd_market_cap || COIN_STATS[b].marketCap;
        return bCap - aCap;
      });
    } else if (activeWatchlistTab === 'Price') {
      return coins.sort((a, b) => {
        const aUsdPrice = prices[a]?.usd || ((getExchangeRate ? getExchangeRate(a) : 1) / (getExchangeRate ? getExchangeRate('USDT') || 1 : 1));
        const bUsdPrice = prices[b]?.usd || ((getExchangeRate ? getExchangeRate(b) : 1) / (getExchangeRate ? getExchangeRate('USDT') || 1 : 1));
        return bUsdPrice - aUsdPrice;
      });
    } else if (activeWatchlistTab === '24H Change') {
      return coins.sort((a, b) => {
        const aChange = prices[a]?.usd_24h_change ?? COIN_STATS[a].fallbackChange;
        const bChange = prices[b]?.usd_24h_change ?? COIN_STATS[b].fallbackChange;
        return bChange - aChange;
      });
    }
    return coins;
  };

  const formatMarketCap = (val) => {
    if (!val) return '$0.00';
    if (val >= 1e12) return `$${(val / 1e12).toFixed(2)}T`;
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    return `$${val.toLocaleString()}`;
  };

  // Combine and sort recent transactions
  const allRecent = [
    ...transactions.map(t => ({ ...t, type: 'Exchange' })),
    ...deposits.map(d => ({ ...d, type: 'Deposit', inr: 0 })),
    ...withdrawals.map(w => ({ ...w, type: 'Withdrawal', inr: 0 }))
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 4);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <style>{`
        @media (max-width: 991px) {
          .dashboard-main-split {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 576px) {
          .watchlist-row {
            padding: 10px 12px !important;
          }
        }
      `}</style>
      
      {/* 1. Binance Style Header: Estimated Total Value & Add Funds */}
      <div className="glass-panel" style={{
        padding: '24px',
        background: 'linear-gradient(135deg, rgba(20,28,60,0.4) 0%, rgba(10,14,35,0.4) 100%)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <span>Est. Total Value</span>
            <div onClick={() => setShowBalance(!showBalance)} style={{ display: 'flex', alignItems: 'center' }}>
              <EyeIcon open={showBalance} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '2.2rem', fontWeight: '800', color: '#fff', letterSpacing: '-1px' }}>
              {showBalance ? `$${totalBalanceUsdtVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '******'}
            </span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {showBalance ? `≈ ${formatVal(totalBalanceInrVal)}` : '******'}
            </span>
          </div>
        </div>

        <button 
          onClick={() => setActiveTab('wallets')}
          style={{
            background: 'linear-gradient(135deg, #f3ba2f 0%, #d89e1b 100%)',
            color: '#0d101d',
            border: 'none',
            borderRadius: '24px',
            padding: '12px 28px',
            fontSize: '0.9rem',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: '0 4px 15px rgba(243, 186, 47, 0.2)'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(243, 186, 47, 0.3)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(243, 186, 47, 0.2)'; }}
        >
          Add Funds
        </button>
      </div>

      {/* 2. Binance-inspired Coin Watchlist */}
      <div className="glass-panel" style={{ padding: '20px 24px', borderRadius: '16px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '12px', marginBottom: '16px', gap: '20px', flexWrap: 'wrap' }}>
          {['Hot', 'Market Cap', 'Price', '24H Change'].map((tab) => (
            <span
              key={tab}
              onClick={() => setActiveWatchlistTab(tab)}
              style={{
                fontSize: '0.9rem',
                fontWeight: '700',
                color: activeWatchlistTab === tab ? '#f3ba2f' : 'var(--text-secondary)',
                cursor: 'pointer',
                position: 'relative',
                paddingBottom: '12px',
                transition: 'color 0.2s'
              }}
            >
              {tab}
              {activeWatchlistTab === tab && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2.5px', background: '#f3ba2f', borderRadius: '2px' }}></div>
              )}
            </span>
          ))}
        </div>

        {/* Watchlist coins table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {getSortedCoins().map((symbol) => {
            const coinRate = getExchangeRate ? getExchangeRate(symbol) : 100;
            const usdtRate = getExchangeRate ? getExchangeRate('USDT') : 87;
            const priceInUsdtFallback = coinRate / (usdtRate || 1);

            // Get live price and live change
            const livePriceUsd = prices[symbol]?.usd ?? priceInUsdtFallback;
            const liveChange = prices[symbol]?.usd_24h_change ?? COIN_STATS[symbol].fallbackChange;
            const isPositive = liveChange >= 0;

            return (
              <div 
                key={symbol} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '12px 16px', 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid rgba(255,255,255,0.04)', 
                  borderRadius: '12px',
                  transition: 'background 0.2s, transform 0.2s'
                }}
                className="watchlist-row"
              >
                {/* Left: Coin Icon & Names */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <CoinIconLogo symbol={symbol} size={32} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#fff' }}>{COIN_STATS[symbol].name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{symbol}</div>
                  </div>
                </div>

                {/* Right: Change percentage and Price / Market Cap */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      fontSize: '0.95rem', 
                      fontWeight: '800', 
                      color: isPositive ? '#10b981' : '#ef4444' 
                    }}>
                      {isPositive ? '+' : ''}{liveChange.toFixed(2)}%
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {symbol === 'USDT' || symbol === 'USDC' 
                        ? '$1.00' 
                        : `$${livePriceUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: symbol === 'TRX' ? 4 : 2 })}`
                      }
                      {activeWatchlistTab === 'Market Cap' && (
                        <span style={{ color: '#f3ba2f', marginLeft: '6px', fontWeight: '600' }}>
                          ({formatMarketCap(prices[symbol]?.usd_market_cap || COIN_STATS[symbol].marketCap)})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Quick Exchange & Recent Transactions Full-Width Stack */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Quick Exchange widget */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SwapIcon /> Convert Crypto to INR
          </h3>
          <form onSubmit={handleQuickExchange} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'end' }}>
              <div>
                <label className="input-label">Amount to Swap</label>
                <input 
                  type="number" 
                  step="any"
                  value={exchangeAmount} 
                  onChange={(e) => setExchangeAmount(e.target.value)} 
                  className="step-input" 
                  style={{ background: 'rgba(0,0,0,0.2)' }}
                  required 
                />
              </div>
              <div>
                <label className="input-label">From Crypto</label>
                <select 
                  value={exchangeCoin} 
                  onChange={(e) => setExchangeCoin(e.target.value)}
                  className="step-input"
                  style={{ width: '130px', background: 'var(--bg-secondary)' }}
                >
                  <option value="USDT">USDT</option>
                  <option value="BTC">BTC</option>
                  <option value="ETH">ETH</option>
                  <option value="USDC">USDC</option>
                  <option value="TRX">TRX</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
              <span>Exchange Rate:</span>
              <strong style={{ color: '#fff' }}>1 {exchangeCoin} = {config.symbol}{exchangeRate.toLocaleString(config.locale, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
              <span className="input-label" style={{ margin: 0 }}>You Receive:</span>
              <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-primary)' }}>
                {config.symbol}{receiveAmount.toLocaleString(config.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
              Exchange Now
            </button>
          </form>
        </div>

        {/* Recent Transactions */}
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px' }}>Recent Transactions</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="rates-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Type</th>
                  <th style={{ textAlign: 'left' }}>Coin</th>
                  <th style={{ textAlign: 'left' }}>Amount</th>
                  <th style={{ textAlign: 'left' }}>INR Value</th>
                  <th style={{ textAlign: 'left' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {allRecent.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      No transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  allRecent.map((tx) => (
                    <tr key={tx.id}>
                      <td style={{ fontWeight: '700', fontSize: '0.82rem' }}>{tx.type}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CoinIconLogo symbol={tx.coin} size={16} />
                          <span>{tx.coin}</span>
                        </div>
                      </td>
                      <td>{tx.amount}</td>
                      <td style={{ color: tx.inr > 0 ? 'var(--color-primary)' : 'inherit', fontWeight: tx.inr > 0 ? '600' : 'normal' }}>
                        {tx.inr > 0 ? `${config.symbol}${tx.inr.toLocaleString(config.locale)}` : '-'}
                      </td>
                      <td>
                        <span className={`badge ${
                          tx.status === 'Completed' || tx.status === 'Approved' ? 'badge-success' : 
                          tx.status === 'Pending' ? 'badge-warning' : 'badge-danger'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}

export default UserDashboard;
