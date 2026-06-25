import React, { useState, useEffect } from 'react';
import { fetchExchangeRates, saveExchangeRates } from '../../../services/admin';

const COUNTRIES = [
  { name: 'India', code: '+91', flag: '🇮🇳' },
  { name: 'USA', code: '+1', flag: '🇺🇸' },
  { name: 'UK', code: '+44', flag: '🇬🇧' },
  { name: 'Pakistan', code: '+92', flag: '🇵🇰' },
  { name: 'UAE', code: '+971', flag: '🇦🇪' },
  { name: 'Canada', code: '+1', flag: '🇨🇦' },
  { name: 'Australia', code: '+61', flag: '🇦🇺' },
  { name: 'Germany', code: '+49', flag: '🇩🇪' },
  { name: 'Singapore', code: '+65', flag: '🇸🇬' },
  { name: 'Saudi Arabia', code: '+966', flag: '🇸🇦' },
  { name: 'Bangladesh', code: '+880', flag: '🇧🇩' },
  { name: 'Nepal', code: '+977', flag: '🇳🇵' },
  { name: 'Sri Lanka', code: '+94', flag: '🇱🇰' }
];

const CURRENCIES = {
  '+91': { symbol: '₹', code: 'INR', name: 'Indian Rupee' },
  '+1': { symbol: '$', code: 'USD/CAD', name: 'US / Canadian Dollar' },
  '+44': { symbol: '£', code: 'GBP', name: 'British Pound' },
  '+92': { symbol: '₨', code: 'PKR', name: 'Pakistani Rupee' },
  '+971': { symbol: 'د.إ', code: 'AED', name: 'UAE Dirham' },
  '+61': { symbol: '$', code: 'AUD', name: 'Australian Dollar' },
  '+49': { symbol: '€', code: 'EUR', name: 'Euro' },
  '+65': { symbol: '$', code: 'SGD', name: 'Singapore Dollar' },
  '+966': { symbol: '﷼', code: 'SAR', name: 'Saudi Riyal' },
  '+880': { symbol: '৳', code: 'BDT', name: 'Bangladeshi Taka' },
  '+977': { symbol: '₨', code: 'NPR', name: 'Nepalese Rupee' },
  '+94': { symbol: '₨', code: 'LKR', name: 'Sri Lankan Rupee' }
};

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

const COINS = [
  {
    key: 'USDT',
    label: 'Tether',
    symbol: 'USDT',
    network: 'TRC20 / BEP20',
    color: '#26a17b',
    glow: 'rgba(38,161,123,0.25)',
    bg: 'rgba(38,161,123,0.08)',
    border: 'rgba(38,161,123,0.2)',
    icon: (
      <svg viewBox="0 0 32 32" width="28" height="28" fill="none">
        <circle cx="16" cy="16" r="16" fill="#26a17b"/>
        <path d="M17.922 17.383v-.002c-.11.008-.677.042-1.942.042-1.01 0-1.721-.03-1.971-.042v.003c-3.888-.171-6.79-.848-6.79-1.658 0-.809 2.902-1.486 6.79-1.66v2.644c.254.018.982.061 1.988.061 1.207 0 1.812-.05 1.925-.06v-2.643c3.88.173 6.775.85 6.775 1.658 0 .81-2.895 1.485-6.775 1.657m0-3.59v-2.366h5.414V7.819H8.595v3.608h5.414v2.365c-4.4.202-7.709 1.074-7.709 2.118 0 1.044 3.309 1.915 7.709 2.118v7.582h3.913v-7.584c4.393-.202 7.694-1.073 7.694-2.116 0-1.043-3.301-1.914-7.694-2.117" fill="white"/>
      </svg>
    )
  },
  {
    key: 'USDC',
    label: 'USD Coin',
    symbol: 'USDC',
    network: 'ERC20 / BEP20',
    color: '#2775ca',
    glow: 'rgba(39,117,202,0.25)',
    bg: 'rgba(39,117,202,0.08)',
    border: 'rgba(39,117,202,0.2)',
    icon: (
      <svg viewBox="0 0 32 32" width="28" height="28" fill="none">
        <circle cx="16" cy="16" r="16" fill="#2775ca"/>
        <path d="M20 17.8c0-2.1-1.3-2.8-3.8-3.1-1.8-.2-2.2-.7-2.2-1.5s.6-1.3 1.7-1.3c1 0 1.6.3 1.9 1.1.1.2.3.3.5.3h1c.3 0 .5-.2.5-.5v-.1c-.3-1.3-1.3-2.3-2.7-2.5v-1.4c0-.3-.2-.5-.6-.6h-1c-.3 0-.5.2-.6.6v1.4c-1.6.3-2.6 1.4-2.6 2.7 0 2 1.2 2.7 3.8 3 1.6.3 2.2.7 2.2 1.6s-.7 1.5-1.9 1.5c-1.2 0-1.8-.5-2-1.3-.1-.2-.3-.4-.6-.4h-1.1c-.3 0-.5.2-.5.5v.1c.3 1.5 1.2 2.5 3 2.8v1.4c0 .3.2.5.6.6h1c.3 0 .5-.2.6-.6V22c1.7-.3 2.9-1.5 2.9-3z" fill="white"/>
      </svg>
    )
  },
  {
    key: 'BTC',
    label: 'Bitcoin',
    symbol: 'BTC',
    network: 'Bitcoin Network',
    color: '#f7931a',
    glow: 'rgba(247,147,26,0.25)',
    bg: 'rgba(247,147,26,0.08)',
    border: 'rgba(247,147,26,0.2)',
    icon: (
      <svg viewBox="0 0 32 32" width="28" height="28" fill="none">
        <circle cx="16" cy="16" r="16" fill="#f7931a"/>
        <path d="M22.7 13.4c.3-2-1.2-3.1-3.3-3.8l.7-2.7-1.7-.4-.6 2.6-1.4-.3.6-2.6-1.7-.4-.7 2.7-2.8-.7-.5 1.8s1.3.3 1.2.3c.7.2.8.7.8.8l-2 7.9c-.1.2-.3.5-.7.4-.1 0-1.2-.3-1.2-.3l-.8 1.9 2.7.7-.7 2.7 1.7.4.7-2.7 1.4.4-.7 2.7 1.7.4.7-2.8c2.9.5 5.1.3 6-2.2.7-2-.1-3.1-1.5-3.9 1-.3 1.7-1 2-2.3zm-3.5 5c-.5 1.9-3.8.9-4.8.6l.9-3.4c1 .3 4.4.9 3.9 2.8zm.5-5c-.5 1.7-3.3.9-4.2.6l.8-3.1c.9.2 3.9.7 3.4 2.5z" fill="white"/>
      </svg>
    )
  },
  {
    key: 'ETH',
    label: 'Ethereum',
    symbol: 'ETH',
    network: 'ERC20 Network',
    color: '#627eea',
    glow: 'rgba(98,126,234,0.25)',
    bg: 'rgba(98,126,234,0.08)',
    border: 'rgba(98,126,234,0.2)',
    icon: (
      <svg viewBox="0 0 32 32" width="28" height="28" fill="none">
        <circle cx="16" cy="16" r="16" fill="#627eea"/>
        <path d="M16.498 4v8.87l7.497 3.35z" fill="white" fillOpacity="0.6"/>
        <path d="M16.498 4L9 16.22l7.498-3.35z" fill="white"/>
        <path d="M16.498 21.968v6.027L24 17.616z" fill="white" fillOpacity="0.6"/>
        <path d="M16.498 27.995v-6.028L9 17.616z" fill="white"/>
        <path d="M16.498 20.573l7.497-4.353-7.497-3.348z" fill="white" fillOpacity="0.2"/>
        <path d="M9 16.22l7.498 4.353v-7.701z" fill="white" fillOpacity="0.6"/>
      </svg>
    )
  },
  {
    key: 'TRX',
    label: 'Tron',
    symbol: 'TRX',
    network: 'TRC20 Network',
    color: '#ec0623',
    glow: 'rgba(236,6,35,0.25)',
    bg: 'rgba(236,6,35,0.08)',
    border: 'rgba(236,6,35,0.2)',
    icon: (
      <svg viewBox="0 0 32 32" width="28" height="28" fill="none">
        <circle cx="16" cy="16" r="16" fill="#ec0623"/>
        <path d="M16 8l8.5 5v10L16 28l-8.5-5V13L16 8zM16 11l-6 3.5v7l6 3.5 6-3.5v-7L16 11z" fill="white"/>
      </svg>
    )
  }
];

function AdminRates() {
  const [selectedCountry, setSelectedCountry] = useState('+91');
  const [rates, setRates] = useState({ USDT: '', USDC: '', BTC: '', ETH: '', TRX: '' });
  const [allRatesDict, setAllRatesDict] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load all rates on mount
  useEffect(() => {
    const loadRates = async () => {
      try {
        setIsLoading(true);
        const data = await fetchExchangeRates();
        const dict = data.allRates || {};
        setAllRatesDict(dict);
        
        // Initial setup for default country (+91)
        const countryRates = dict['+91'] || COUNTRY_DEFAULTS['+91'];
        setRates({
          USDT: String(countryRates.USDT || ''),
          USDC: String(countryRates.USDC || ''),
          BTC: String(countryRates.BTC || ''),
          ETH: String(countryRates.ETH || ''),
          TRX: String(countryRates.TRX || '')
        });
      } catch (err) {
        console.error('Failed to load rates configuration:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadRates();
  }, []);

  const handleCountryChange = (countryCode) => {
    setSelectedCountry(countryCode);
    const countryRates = allRatesDict[countryCode] || COUNTRY_DEFAULTS[countryCode] || { USDT: '', USDC: '', BTC: '', ETH: '', TRX: '' };
    setRates({
      USDT: String(countryRates.USDT ?? ''),
      USDC: String(countryRates.USDC ?? ''),
      BTC: String(countryRates.BTC ?? ''),
      ETH: String(countryRates.ETH ?? ''),
      TRX: String(countryRates.TRX ?? '')
    });
  };

  const handleRateInputChange = (coinKey, val) => {
    setRates(prev => ({ ...prev, [coinKey]: val }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payloadRates = {
        USDT: Number(rates.USDT),
        USDC: Number(rates.USDC),
        BTC: Number(rates.BTC),
        ETH: Number(rates.ETH),
        TRX: Number(rates.TRX)
      };
      
      const response = await saveExchangeRates(payloadRates, selectedCountry);
      
      // Update local cache dictionary
      if (response && response.allRates) {
        setAllRatesDict(response.allRates);
      } else {
        setAllRatesDict(prev => ({ ...prev, [selectedCountry]: payloadRates }));
      }
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      alert(`Exchange rates configured successfully for country code ${selectedCountry}!`);
    } catch (err) {
      alert(`Error saving rates: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (val, countryCode) => {
    const n = Number(val || 0);
    const curr = CURRENCIES[countryCode] || { symbol: '₹', code: 'INR' };
    
    if (curr.code === 'INR' || curr.code === 'PKR' || curr.code === 'BDT' || curr.code === 'NPR' || curr.code === 'LKR') {
      if (n >= 10000000) return `${curr.symbol}${(n / 10000000).toFixed(2)} Cr`;
      if (n >= 100000) return `${curr.symbol}${(n / 100000).toFixed(2)} L`;
      return `${curr.symbol}${n.toLocaleString('en-IN')}`;
    } else {
      if (n >= 1000000) return `${curr.symbol}${(n / 1000000).toFixed(2)} M`;
      return `${curr.symbol}${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 4 })}`;
    }
  };

  const activeCurrency = CURRENCIES[selectedCountry] || { symbol: '₹', code: 'INR', name: 'Indian Rupee' };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <div className="status-spinner" style={{ width: '40px', height: '40px' }}></div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .rate-card {
          animation: fadeInUp 0.3s ease both;
          transition: border-color 0.25s, box-shadow 0.25s, transform 0.2s;
          position: relative;
          overflow: hidden;
        }
        .rate-card:hover {
          transform: translateY(-2px);
        }
        .rate-input-field {
          width: 100%;
          background: rgba(0,0,0,0.25);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          color: #fff;
          font-size: 1.5rem;
          font-weight: 800;
          padding: 14px 16px 14px 56px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-family: 'SF Mono', 'Fira Code', monospace;
          box-sizing: border-box;
        }
        .rate-input-field:focus {
          border-color: var(--coin-color);
          box-shadow: 0 0 0 3px var(--coin-glow);
        }
        .rate-input-field::-webkit-inner-spin-button,
        .rate-input-field::-webkit-outer-spin-button {
          -webkit-appearance: none;
        }
        .save-btn {
          position: relative;
          overflow: hidden;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
        }
        .save-btn:hover:not(:disabled) {
          transform: translateY(-1px);
        }
        .save-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        @media (max-width: 700px) {
          .rates-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: '900', margin: 0, letterSpacing: '-0.5px' }}>
            Exchange Rates Configuration (Country-Wise)
          </h3>
          <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            Set fixed fiat conversion rates for each supported country. Changes apply instantly to users of the selected country.
          </p>
        </div>

        {saved && (
          <div style={{
            background: 'rgba(16,185,129,0.12)', color: '#10b981',
            border: '1px solid rgba(16,185,129,0.25)',
            borderRadius: '8px', padding: '8px 16px',
            fontSize: '0.82rem', fontWeight: '700',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <span>✓</span> Rates saved successfully!
          </div>
        )}
      </div>

      {/* Country Selector Dropdown Panel */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.2) 100%)' }}>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: '12px' }}>
          Select Target Country / Region
        </label>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={selectedCountry}
            onChange={(e) => handleCountryChange(e.target.value)}
            style={{
              flex: 1,
              minWidth: '260px',
              background: 'rgba(0,0,0,0.35)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              padding: '14px 16px',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: '700',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {COUNTRIES.map((c, idx) => (
              <option key={idx} value={c.code} style={{ background: '#0b0e17', color: '#fff' }}>
                {c.flag} {c.name} ({c.code}) - {CURRENCIES[c.code]?.code || ''}
              </option>
            ))}
          </select>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Rates are configured in <strong>{activeCurrency.name} ({activeCurrency.code})</strong> for users registered under this region code.
          </div>
        </div>
      </div>

      {/* Rate Cards Grid */}
      <form onSubmit={onSubmit}>
        <div className="rates-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '20px',
          marginBottom: '24px'
        }}>
          {COINS.map((coin, i) => {
            const val = rates[coin.key] || '';
            return (
              <div
                key={coin.key}
                className="rate-card glass-panel"
                style={{
                  '--coin-color': coin.color,
                  '--coin-glow': coin.glow,
                  padding: '24px',
                  border: `1px solid ${coin.border}`,
                  borderRadius: '16px',
                  background: coin.bg,
                  animationDelay: `${i * 0.06}s`,
                  backdropFilter: 'blur(12px)'
                }}
              >
                {/* Decorative top accent */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                  background: `linear-gradient(90deg, ${coin.color}, transparent)`,
                  borderRadius: '16px 16px 0 0'
                }} />

                {/* Coin header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `rgba(0,0,0,0.3)`,
                    border: `2px solid ${coin.border}`,
                    boxShadow: `0 0 16px ${coin.glow}`
                  }}>
                    {coin.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '1rem', color: '#fff' }}>{coin.label}</div>
                    <div style={{ fontSize: '0.72rem', color: coin.color, fontWeight: '600', marginTop: '2px' }}>
                      {coin.network}
                    </div>
                  </div>
                  <div style={{
                    marginLeft: 'auto',
                    background: `rgba(0,0,0,0.3)`,
                    border: `1px solid ${coin.border}`,
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    fontWeight: '800',
                    color: coin.color,
                    fontFamily: 'monospace',
                    letterSpacing: '0.5px'
                  }}>
                    {coin.symbol}
                  </div>
                </div>

                {/* Input with Country specific Currency prefix */}
                <div style={{ marginBottom: '12px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    color: 'var(--text-muted)',
                    marginBottom: '8px'
                  }}>
                    Rate ({activeCurrency.code} per 1 {coin.symbol})
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
                      fontSize: '1.4rem', fontWeight: '800', color: coin.color,
                      pointerEvents: 'none', fontFamily: 'monospace'
                    }}>{activeCurrency.symbol}</span>
                    <input
                      type="number"
                      className="rate-input-field"
                      value={val}
                      onChange={(e) => handleRateInputChange(coin.key, e.target.value)}
                      required
                      min="0.0001"
                      step="any"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Live preview bar */}
                <div style={{
                  background: 'rgba(0,0,0,0.2)',
                  border: `1px solid ${coin.border}`,
                  borderRadius: '10px',
                  padding: '12px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Live Preview
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#fff', marginTop: '3px' }}>
                      1 {coin.symbol} =
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: '900', color: coin.color }}>
                      {val ? formatCurrency(val, selectedCountry) : '—'}
                    </div>
                    {val && (
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Full: {activeCurrency.symbol}{Number(val).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Warning notice */}
        <div style={{
          background: 'rgba(59,130,246,0.06)',
          border: '1px solid rgba(59,130,246,0.18)',
          borderRadius: '10px',
          padding: '14px 18px',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start',
          marginBottom: '20px'
        }}>
          <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>ℹ️</span>
          <div>
            <strong style={{ color: '#3b82f6' }}>Binance Real-Time Price Integration:</strong> The system automatically syncs BTC, ETH, and TRX with global real-time market prices from Binance. Configured rates for BTC, ETH, and TRX serve as starting baselines and will automatically track live market prices scaled by your country's local <strong style={{ color: '#fff' }}>USDT</strong> rate.
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={isSaving}
          className="save-btn"
          style={{
            width: '100%',
            padding: '16px',
            background: saved
              ? 'linear-gradient(135deg, #059669, #10b981)'
              : 'linear-gradient(135deg, var(--danger), #ff6b6b)',
            border: 'none',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '1rem',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            letterSpacing: '0.3px',
            boxShadow: saved
              ? '0 4px 20px rgba(16,185,129,0.3)'
              : '0 4px 20px rgba(255,23,68,0.25)'
          }}
        >
          {isSaving ? (
            <>
              <div style={{
                width: '18px', height: '18px',
                border: '2.5px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff',
                borderRadius: '50%',
                animation: 'spin 0.6s linear infinite'
              }} />
              Broadcasting to all panels...
            </>
          ) : saved ? (
            <>✓ All rates saved successfully</>
          ) : (
            <>💾 Save &amp; Broadcast Exchange Rates</>
          )}
        </button>
      </form>
    </div>
  );
}

export default AdminRates;
