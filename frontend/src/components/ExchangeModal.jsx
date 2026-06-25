import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown, CoinIconLogo } from './Icons';

const AVAILABLE_COINS = ['BTC', 'ETH', 'USDT', 'BNB', 'USDC', 'XRP'];

function ExchangeModal({ isOpen, onClose, exchangeData, prices }) {
  if (!isOpen || !exchangeData) return null;

  const [selectedCoin, setSelectedCoin] = useState('BTC');
  const [cryptoAmount, setCryptoAmount] = useState('0.05');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Reset/sync state when modal opens
  useEffect(() => {
    if (isOpen && exchangeData) {
      setSelectedCoin(exchangeData.coin || 'BTC');
      setCryptoAmount(exchangeData.amount?.toString() || '0.05');
    }
  }, [isOpen, exchangeData]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCoinChange = (symbol) => {
    setSelectedCoin(symbol);
    setIsDropdownOpen(false);
    // Set sensible defaults on coin switch
    if (symbol === 'BTC') setCryptoAmount('0.05');
    else if (symbol === 'ETH') setCryptoAmount('0.5');
    else if (symbol === 'USDT') setCryptoAmount('500');
    else if (symbol === 'BNB') setCryptoAmount('2');
    else if (symbol === 'USDC') setCryptoAmount('500');
    else if (symbol === 'XRP') setCryptoAmount('200');
  };

  const currentRate = prices && prices[selectedCoin] ? prices[selectedCoin].usd : 0;
  const calculatedUsdAmount = (parseFloat(cryptoAmount) || 0) * currentRate;

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-content" style={{ border: '1px solid rgba(189, 52, 254, 0.25)', maxWidth: '480px' }}>
        <button className="modal-close-btn" onClick={onClose}>
          <X className="w-5 h-5" />
        </button>

        <div className="modal-header">
          <h3>Instant Crypto Price Converter</h3>
          <p style={{ marginTop: '4px' }}>
            Check real-time conversion rates based on Binance live data.
          </p>
        </div>

        <div className="step-content">
          {/* Inside Modal Converter */}
          <div 
            style={{ 
              background: 'rgba(255, 255, 255, 0.02)', 
              border: '1px solid var(--border-color)', 
              padding: '20px', 
              borderRadius: 'var(--radius-md)', 
              marginBottom: '10px'
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <label className="input-label" style={{ marginBottom: '6px' }}>You Send</label>
                <input
                  type="number"
                  step="any"
                  className="step-input"
                  placeholder="0.00"
                  value={cryptoAmount}
                  onChange={(e) => setCryptoAmount(e.target.value)}
                  min="0"
                  required
                  style={{ background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255,255,255,0.05)', margin: 0, fontSize: '1.1rem' }}
                />
              </div>

              <div style={{ position: 'relative', marginTop: '19px' }} ref={dropdownRef}>
                <button
                  type="button"
                  className="coin-select-btn"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  style={{ height: '44px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
                >
                  <CoinIconLogo symbol={selectedCoin} size={18} />
                  <span>{selectedCoin}</span>
                  <ChevronDown />
                </button>

                {isDropdownOpen && (
                  <div className="coin-dropdown-portal" style={{ right: 0, width: '180px' }}>
                    {AVAILABLE_COINS.map((symbol) => (
                      <div
                        key={symbol}
                        className="coin-option"
                        onClick={() => handleCoinChange(symbol)}
                      >
                        <div className="coin-option-left">
                          <CoinIconLogo symbol={symbol} size={16} />
                          <span className="coin-option-name" style={{ fontSize: '0.8rem' }}>{symbol}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Conversion display */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              <span>1 {selectedCoin} ≈ {currentRate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} USDT</span>
              <span style={{ color: 'var(--color-primary)', fontWeight: '600' }}>Live Rate</span>
            </div>

            {/* Estimated Output display */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="input-label" style={{ margin: 0 }}>You Receive (Estimated)</span>
              <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--color-primary)' }}>
                {calculatedUsdAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} USDT
              </span>
            </div>
          </div>
        </div>

        <button 
          className="btn btn-primary" 
          onClick={onClose} 
          style={{ width: '100%', marginTop: '16px', padding: '12px' }}
        >
          Close Converter
        </button>
      </div>
    </div>
  );
}

export default ExchangeModal;
