import React from 'react';
import { CoinIconLogo } from '../../../components/Icons';

function UserRates({
  rateBTC,
  rateETH,
  rateUSDT,
  rateUSDC,
  setExchangeCoin,
  setActiveTab
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '16px' }}>Live Exchange Market Rates</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { symbol: 'BTC', name: 'Bitcoin', price: rateBTC },
            { symbol: 'ETH', name: 'Ethereum', price: rateETH },
            { symbol: 'USDT', name: 'Tether USD', price: rateUSDT },
            { symbol: 'USDC', name: 'USD Coin', price: rateUSDC }
          ].map((r) => (
            <div key={r.symbol} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CoinIconLogo symbol={r.symbol} size={28} />
                <div>
                  <strong style={{ fontSize: '1rem' }}>{r.name}</strong>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.symbol} / INR</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--color-primary)' }}>₹{r.price.toLocaleString('en-IN')}</span>
                  <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--color-primary)' }}>Fixed Rate</span>
                </div>
                <button 
                  onClick={() => { setExchangeCoin(r.symbol); setActiveTab('exchange'); }} 
                  className="btn btn-accent" 
                  style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                >
                  Convert
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserRates;
