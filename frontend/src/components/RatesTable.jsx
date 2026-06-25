import React, { useEffect, useState } from 'react';
import { CoinIconLogo } from './Icons';

// Simple historical points generator for Sparklines
const generateSparklineData = (length = 10, seed = 50) => {
  const points = [];
  let current = seed;
  for (let i = 0; i < length; i++) {
    const change = (Math.random() - 0.5) * 8;
    current += change;
    points.push(current);
  }
  return points;
};

function RatesTable({ prices, onActionClick }) {
  const [sparklines, setSparklines] = useState({});

  const coinSymbols = ['BTC', 'ETH', 'USDT', 'BNB', 'USDC', 'XRP'];
  const coinNames = {
    BTC: 'Bitcoin',
    ETH: 'Ethereum',
    USDT: 'Tether',
    BNB: 'Binance Coin',
    USDC: 'USD Coin',
    XRP: 'Ripple'
  };

  // Generate initial sparkline data on load
  useEffect(() => {
    const data = {};
    coinSymbols.forEach(symbol => {
      // Different base prices for seeds
      let seed = 50;
      if (symbol === 'BTC') seed = 80;
      else if (symbol === 'ETH') seed = 60;
      else if (symbol === 'USDT') seed = 50;
      else if (symbol === 'USDC') seed = 50;
      data[symbol] = generateSparklineData(12, seed);
    });
    setSparklines(data);
  }, []);

  // Update sparklines when prices fluctuate
  useEffect(() => {
    if (prices && Object.keys(prices).length > 0) {
      setSparklines(prev => {
        const updated = { ...prev };
        coinSymbols.forEach(symbol => {
          if (prev[symbol]) {
            const currentPoints = [...prev[symbol]];
            currentPoints.shift(); // remove oldest
            // Add new point based on trend
            const last = currentPoints[currentPoints.length - 1];
            const direction = prices[symbol]?.lastDirection === 'up' ? 1.5 : -1.5;
            const newPoint = last + (Math.random() * 2) * direction;
            currentPoints.push(newPoint);
            updated[symbol] = currentPoints;
          }
        });
        return updated;
      });
    }
  }, [prices]);

  // Render Sparkline polyline points
  const getPolylinePoints = (points) => {
    if (!points || points.length === 0) return '';
    const width = 100;
    const height = 30;
    const padding = 2;
    
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;

    return points.map((p, index) => {
      const x = (index / (points.length - 1)) * (width - padding * 2) + padding;
      const y = height - ((p - min) / range) * (height - padding * 2) - padding;
      return `${x},${y}`;
    }).join(' ');
  };

  return (
    <div id="rates" className="glass-panel" style={{ 
      padding: '32px', 
      overflowX: 'auto',
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35)',
      background: 'rgba(13, 18, 39, 0.45)'
    }}>
      <table className="rates-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <th style={{ padding: '16px 12px', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', textAlign: 'left' }}>Crypto Asset</th>
            <th style={{ padding: '16px 12px', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', textAlign: 'left' }}>Live Price (USDT)</th>
            <th style={{ padding: '16px 12px', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', textAlign: 'left' }}>24h Change</th>
            <th style={{ padding: '16px 12px', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', textAlign: 'center' }}>Market Trend (7D)</th>
            <th style={{ padding: '16px 12px', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {coinSymbols.map((symbol) => {
            const coinPrice = prices[symbol];
            if (!coinPrice) return null;

            const isUp = coinPrice.usd_24h_change >= 0;
            const flashClass = coinPrice.lastDirection === 'up' 
              ? 'price-flash-up' 
              : coinPrice.lastDirection === 'down' 
                ? 'price-flash-down' 
                : '';

            const pts = sparklines[symbol] || [];
            const sparklineColor = isUp ? 'var(--success)' : 'var(--danger)';

            return (
              <tr key={symbol} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', transition: 'background 0.2s' }} className="rates-row-hover">
                {/* Coin Info */}
                <td style={{ padding: '20px 12px' }}>
                  <div className="coin-cell">
                    <CoinIconLogo symbol={symbol} size={38} />
                    <div className="coin-cell-names" style={{ marginLeft: '12px' }}>
                      <span className="coin-cell-symbol" style={{ fontSize: '1.05rem', fontWeight: '800', color: '#fff' }}>{symbol}</span>
                      <span className="coin-cell-name" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>{coinNames[symbol]}</span>
                    </div>
                  </div>
                </td>

                {/* Price (flashing on update) */}
                <td className={`price-cell ${flashClass}`} style={{ padding: '20px 12px', fontSize: '1.05rem', fontWeight: '700', fontFamily: 'monospace' }}>
                  ${coinPrice.usd.toLocaleString('en-US', { minimumFractionDigits: symbol === 'USDT' || symbol === 'USDC' ? 4 : 2, maximumFractionDigits: symbol === 'USDT' || symbol === 'USDC' ? 4 : 2 })}
                </td>

                {/* 24h Change */}
                <td style={{ padding: '20px 12px' }}>
                  <span className={`change-cell ${isUp ? 'change-up' : 'change-down'}`} style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    background: isUp ? 'rgba(0, 230, 118, 0.08)' : 'rgba(255, 23, 68, 0.08)'
                  }}>
                    {isUp ? '▲ +' : '▼ '}{Math.abs(coinPrice.usd_24h_change).toFixed(2)}%
                  </span>
                </td>

                {/* Sparkline Trend Graph */}
                <td style={{ padding: '20px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <svg className="sparkline-svg" style={{ width: '110px', height: '35px', filter: `drop-shadow(0 2px 8px ${sparklineColor}40)` }}>
                      <polyline
                        fill="none"
                        stroke={sparklineColor}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={getPolylinePoints(pts)}
                      />
                    </svg>
                  </div>
                </td>

                {/* Exchange Action */}
                <td style={{ padding: '20px 12px', textAlign: 'right' }}>
                  <button 
                    className="btn btn-primary"
                    style={{ 
                      padding: '8px 20px', 
                      fontSize: '0.85rem', 
                      fontWeight: '800', 
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(189, 52, 254, 0.25)'
                    }}
                    onClick={() => onActionClick(symbol)}
                  >
                    Convert
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <style>{`
        .rates-row-hover:hover {
          background: rgba(255, 255, 255, 0.02) !important;
        }
      `}</style>
    </div>
  );
}

export default RatesTable;
