import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, CoinIconLogo } from './Icons';

function Calculator({ prices, onExchangeStart }) {
  const [cryptoAmount, setCryptoAmount] = useState('0.05');
  const [selectedCoin, setSelectedCoin] = useState('BTC');
  const [inrAmount, setInrAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const availableCoins = ['BTC', 'ETH', 'USDT', 'BNB', 'USDC', 'XRP'];

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

  // Calculate INR equivalent whenever input amount, coin, or prices change
  useEffect(() => {
    if (prices && prices[selectedCoin]) {
      const rate = prices[selectedCoin].inr;
      const amount = parseFloat(cryptoAmount) || 0;
      setInrAmount(Math.round(amount * rate));
    }
  }, [cryptoAmount, selectedCoin, prices]);

  const handleCoinChange = (symbol) => {
    setSelectedCoin(symbol);
    setIsDropdownOpen(false);
    // Set some sensible default amounts when switching coins
    if (symbol === 'BTC') setCryptoAmount('0.05');
    else if (symbol === 'ETH') setCryptoAmount('0.5');
    else if (symbol === 'USDT') setCryptoAmount('500');
    else if (symbol === 'BNB') setCryptoAmount('2');
    else if (symbol === 'USDC') setCryptoAmount('500');
    else if (symbol === 'XRP') setCryptoAmount('200');
  };

  const handleExchangeSubmit = (e) => {
    e.preventDefault();
    if (parseFloat(cryptoAmount) <= 0 || !cryptoAmount) return;
    onExchangeStart({
      coin: selectedCoin,
      amount: parseFloat(cryptoAmount),
      inrAmount: inrAmount,
      paymentMethod: paymentMethod
    });
  };

  const currentRate = prices && prices[selectedCoin] ? prices[selectedCoin].inr : 0;
  const priceChange = prices && prices[selectedCoin] ? prices[selectedCoin].inr_24h_change : 0;

  return (
    <div className="glass-panel calc-container" style={{ position: 'relative' }}>
      <div className="calc-title">
        <h3>Convert Crypto</h3>
        <span>Zero Hidden Fees</span>
      </div>

      <form onSubmit={handleExchangeSubmit}>
        {/* Crypto Input Group */}
        <div className="input-group">
          <label className="input-label">You Send</label>
          <div className="input-wrapper">
            <input
              type="number"
              step="any"
              placeholder="0.00"
              value={cryptoAmount}
              onChange={(e) => setCryptoAmount(e.target.value)}
              min="0"
              required
            />
            
            {/* Custom Coin Select Dropdown */}
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button
                type="button"
                className="coin-select-btn"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <CoinIconLogo symbol={selectedCoin} size={20} />
                <span>{selectedCoin}</span>
                <ChevronDown />
              </button>

              {isDropdownOpen && (
                <div className="coin-dropdown-portal">
                  {availableCoins.map((symbol) => (
                    <div
                      key={symbol}
                      className="coin-option"
                      onClick={() => handleCoinChange(symbol)}
                    >
                      <div className="coin-option-left">
                        <CoinIconLogo symbol={symbol} size={18} />
                        <span className="coin-option-name">{symbol}</span>
                      </div>
                      <span className="coin-option-symbol">
                        {symbol === 'USDT' ? 'Stablecoin' : 'Crypto'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live conversion rate display */}
        <div className="calc-rate-info">
          <span>
            1 {selectedCoin} ≈ ₹{currentRate.toLocaleString('en-IN')}
          </span>
          {priceChange !== 0 && (
            <span className={priceChange >= 0 ? 'change-up' : 'change-down'}>
              {priceChange >= 0 ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)}%
            </span>
          )}
        </div>

        {/* INR Output Group */}
        <div className="input-group">
          <label className="input-label">You Receive (Estimated)</label>
          <div className="input-wrapper" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <input
              type="text"
              readOnly
              value={inrAmount ? `₹${inrAmount.toLocaleString('en-IN')}` : '₹0'}
              style={{ color: 'var(--color-primary)' }}
            />
          </div>
        </div>

        {/* CTA Button */}
        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', padding: '15px', fontSize: '1.05rem', marginTop: '15px' }}
        >
          Exchange Now
        </button>
      </form>
    </div>
  );
}

export default Calculator;

