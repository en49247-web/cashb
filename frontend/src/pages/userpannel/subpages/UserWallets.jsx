import React, { useState, useEffect } from 'react';
import { CoinIconLogo } from '../../../components/Icons';
import { swapCoins } from '../../../services/auth';
import { fetchSwapConfig } from '../../../services/admin';

const COINS = ['USDT', 'BTC', 'ETH', 'USDC', 'TRX'];

const COIN_LABELS = {
  USDT: 'Tether USD',
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  USDC: 'USD Coin',
  TRX: 'Tron'
};

const formatCoinAmount = (amt, symbol) => {
  const num = Number(amt || 0);
  return num.toFixed(2);
};

function SwapModal({ isOpen, onClose, balances, getExchangeRate, initialFromCoin, onSwapSuccess, swapFeePercent }) {
  const [fromCoin, setFromCoin] = useState(initialFromCoin || 'USDT');
  const [toCoin, setToCoin] = useState(initialFromCoin === 'USDT' ? 'BTC' : 'USDT');
  const [fromAmount, setFromAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [swapResult, setSwapResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setFromCoin(initialFromCoin || 'USDT');
      setToCoin(initialFromCoin === 'USDT' ? 'BTC' : 'USDT');
      setFromAmount('');
      setError('');
      setSuccess('');
      setSwapResult(null);
    }
  }, [isOpen, initialFromCoin]);

  const fromBalance = Number(balances?.[fromCoin] ?? 0);
  const toBalance = Number(balances?.[toCoin] ?? 0);

  const isStable = (coin) => coin === 'USDT' || coin === 'USDC';
  const isStableToStable = isStable(fromCoin) && isStable(toCoin);
  const activeFeePercent = isStableToStable ? 0 : swapFeePercent;

  // Calculate estimated output using exchange rates and fee percent
  const calcOutput = () => {
    const amt = Number(fromAmount);
    if (!amt || amt <= 0) return null;
    let raw;
    if (isStableToStable) {
      raw = amt;
    } else {
      const fromRate = getExchangeRate(fromCoin);
      const toRate = getExchangeRate(toCoin);
      if (!fromRate || !toRate) return null;
      raw = (amt * fromRate) / toRate;
    }
    const multiplier = 1 - (activeFeePercent / 100);
    return Number((raw * multiplier).toFixed(8));
  };

  const estimatedOutput = calcOutput();

  const handleSwap = async () => {
    setError('');
    setSuccess('');
    const amt = Number(fromAmount);
    if (!amt || amt <= 0) { setError('Please enter a valid amount.'); return; }
    if (fromCoin === toCoin) { setError('Cannot swap same coin.'); return; }
    if (amt > fromBalance) { setError(`Insufficient ${fromCoin} balance.`); return; }

    setIsSubmitting(true);
    try {
      const result = await swapCoins(fromCoin, toCoin, amt);
      setSwapResult(result);
      setSuccess(result.message || 'Swap completed successfully!');
      setFromAmount('');
      if (onSwapSuccess) onSwapSuccess(result.balances);
      
      // Auto close the modal completely after 2.5 seconds
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (err) {
      setError(err.message || 'Swap failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFlip = () => {
    setFromCoin(toCoin);
    setToCoin(fromCoin);
    setFromAmount('');
    setError('');
    setSuccess('');
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)'
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-secondary, #0f1320)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        padding: '32px',
        width: '100%',
        maxWidth: '440px',
        position: 'relative',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        overflow: 'hidden'
      }} onClick={e => e.stopPropagation()}>

        {success ? (
          /* Premium Animated Success Screen */
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px 0',
            textAlign: 'center'
          }}>
            {/* Animated Checkmark Circle */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '2px dashed #10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
              animation: 'spin 12s linear infinite'
            }}>
              <span style={{ fontSize: '2.5rem', animation: 'bounce 1s ease infinite' }}>✅</span>
            </div>

            <h3 style={{ fontWeight: '900', fontSize: '1.45rem', margin: '0 0 10px 0', color: '#10b981' }}>
              Swap Completed!
            </h3>
            
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0 0 24px 0', maxWidth: '300px' }}>
              {swapResult?.message || `Successfully swapped ${fromCoin} to ${toCoin}`}
            </p>

            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '16px 20px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              marginBottom: '28px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Sent</span>
                <span style={{ color: '#fff', fontWeight: '700' }}>
                  {formatCoinAmount(swapResult?.from?.amount, swapResult?.from?.coin)} {swapResult?.from?.coin}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Received</span>
                <span style={{ color: '#10b981', fontWeight: '700' }}>
                  + {formatCoinAmount(swapResult?.to?.amount, swapResult?.to?.coin)} {swapResult?.to?.coin}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <div style={{ width: '12px', height: '12px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'var(--text-secondary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <span>Closing automatically in 2 seconds...</span>
            </div>
          </div>
        ) : (
          /* Swap Form Screen */
          <>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <div>
                <h3 style={{ fontWeight: '800', fontSize: '1.3rem', margin: 0 }}>⚡ Swap Crypto</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>
                  Instant crypto-to-crypto conversion • {activeFeePercent}% fee
                </p>
              </div>
              <button onClick={onClose} style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px', color: '#fff', width: '32px', height: '32px',
                cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>×</button>
            </div>

            {/* From Section */}
            <div style={{
              background: 'rgba(255,255,255,0.03)', borderRadius: '14px',
              padding: '18px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '4px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>YOU SEND</span>
                <button
                  onClick={() => setFromAmount(String(fromBalance))}
                  style={{
                    background: 'rgba(255,23,68,0.1)', border: 'none', color: 'var(--danger, #ff1744)',
                    fontSize: '0.73rem', fontWeight: '700', borderRadius: '6px',
                    padding: '3px 8px', cursor: 'pointer'
                  }}
                >
                  MAX {formatCoinAmount(fromBalance, fromCoin)} {fromCoin}
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <select
                  value={fromCoin}
                  onChange={e => {
                    const val = e.target.value;
                    setFromCoin(val);
                    if (val === toCoin) setToCoin(COINS.find(c => c !== val));
                    setFromAmount('');
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px', color: '#fff', padding: '8px 12px',
                    fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer', minWidth: '100px'
                  }}
                >
                  {COINS.map(c => (
                    <option key={c} value={c} style={{ background: '#0f1320' }}>{c}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={fromAmount}
                  onChange={e => setFromAmount(e.target.value)}
                  style={{
                    flex: 1, background: 'transparent', border: 'none', color: '#fff',
                    fontSize: '1.5rem', fontWeight: '800', outline: 'none', textAlign: 'right',
                    minWidth: 0
                  }}
                />
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px', textAlign: 'right' }}>
                {COIN_LABELS[fromCoin]}
              </div>
            </div>

            {/* Flip Button */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '6px 0' }}>
              <button
                onClick={handleFlip}
                title="Flip swap direction"
                style={{
                  background: 'var(--bg-tertiary, #1a2035)', border: '2px solid rgba(255,255,255,0.1)',
                  borderRadius: '50%', width: '40px', height: '40px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#fff', fontSize: '1.1rem',
                  transition: 'all 0.2s ease', boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}
              >
                ⇅
              </button>
            </div>

            {/* To Section */}
            <div style={{
              background: 'rgba(255,255,255,0.03)', borderRadius: '14px',
              padding: '18px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>YOU RECEIVE</span>
                <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>Balance: {formatCoinAmount(toBalance, toCoin)} {toCoin}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <select
                  value={toCoin}
                  onChange={e => {
                    const val = e.target.value;
                    setToCoin(val);
                    if (val === fromCoin) setFromCoin(COINS.find(c => c !== val));
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px', color: '#fff', padding: '8px 12px',
                    fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer', minWidth: '100px'
                  }}
                >
                  {COINS.filter(c => c !== fromCoin).map(c => (
                    <option key={c} value={c} style={{ background: '#0f1320' }}>{c}</option>
                  ))}
                </select>
                <div style={{
                  flex: 1, fontSize: '1.5rem', fontWeight: '800',
                  color: estimatedOutput ? '#10b981' : 'var(--text-muted)',
                  textAlign: 'right'
                }}>
                  {estimatedOutput !== null ? formatCoinAmount(estimatedOutput, toCoin) : '—'}
                </div>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px', textAlign: 'right' }}>
                {COIN_LABELS[toCoin]}
              </div>
            </div>

            {/* Rate Info */}
            {estimatedOutput !== null && fromAmount && (
              <div style={{
                background: 'rgba(255,255,255,0.02)', borderRadius: '10px',
                padding: '12px 16px', marginBottom: '16px',
                border: '1px solid rgba(255,255,255,0.04)',
                display: 'flex', flexDirection: 'column', gap: '6px',
                fontSize: '0.78rem', color: 'var(--text-secondary)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Rate</span>
                  <span style={{ fontWeight: '700', color: '#fff' }}>
                    1 {fromCoin} = {isStableToStable ? '1.00000000' : ((getExchangeRate(fromCoin) || 1) / (getExchangeRate(toCoin) || 1)).toFixed(8)} {toCoin}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Platform Fee ({activeFeePercent}%)</span>
                  <span style={{ color: '#f59e0b' }}>
                    ≈ {(Number(fromAmount) * (isStableToStable ? 1 : ((getExchangeRate(fromCoin) || 1) / (getExchangeRate(toCoin) || 1))) * (activeFeePercent / 100)).toFixed(8)} {toCoin}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '6px' }}>
                  <span style={{ fontWeight: '700' }}>You Get</span>
                  <span style={{ fontWeight: '800', color: '#10b981' }}>{formatCoinAmount(estimatedOutput, toCoin)} {toCoin}</span>
                </div>
              </div>
            )}

            {/* Error / Success */}
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: '10px', padding: '12px 14px', marginBottom: '14px',
                fontSize: '0.82rem', color: '#ef4444', display: 'flex', gap: '8px', alignItems: 'center'
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Swap Button */}
            <button
              onClick={handleSwap}
              disabled={isSubmitting || !fromAmount || Number(fromAmount) <= 0}
              style={{
                width: '100%', padding: '14px',
                background: 'linear-gradient(135deg, #ff1744 0%, #d500f9 100%)',
                border: 'none', borderRadius: '12px',
                color: '#fff', fontWeight: '800', fontSize: '1rem',
                cursor: isSubmitting || !fromAmount ? 'not-allowed' : 'pointer',
                opacity: isSubmitting || !fromAmount ? 0.6 : 1,
                transition: 'all 0.2s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              {isSubmitting ? (
                <>
                  <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                  Processing Swap...
                </>
              ) : (
                <>⚡ Swap {fromCoin} → {toCoin}</>
              )}
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '12px', margin: '12px 0 0' }}>
              Swaps are processed instantly using platform exchange rates.
            </p>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        select option { background: #0f1320; color: #fff; }
      `}</style>
    </div>
  );
}

function UserWallets({
  balances,
  prices,
  getExchangeRate,
  setSelectedTxCoin,
  setIsDepositModalOpen,
  setIsWithdrawModalOpen,
  getPendingExchangeAmount,
  onBalanceUpdate
}) {
  const [isSwapOpen, setIsSwapOpen] = useState(false);
  const [swapFromCoin, setSwapFromCoin] = useState('USDT');
  const [swapFeePercent, setSwapFeePercent] = useState(0.5);

  useEffect(() => {
    fetchSwapConfig()
      .then(res => {
        if (res.config && typeof res.config.swapFeePercent === 'number') {
          setSwapFeePercent(res.config.swapFeePercent);
        }
      })
      .catch(err => console.warn('Failed to load swap config:', err));
  }, [isSwapOpen]);

  const handleSwapClick = (symbol) => {
    setSwapFromCoin(symbol);
    setIsSwapOpen(true);
  };

  const handleSwapSuccess = (newBalances) => {
    if (onBalanceUpdate) onBalanceUpdate(newBalances);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Wallet Cards */}
      <div className="wallets-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
        {Object.entries(balances).map(([symbol, val]) => (
          <div key={symbol} className="glass-panel" style={{ padding: '16px', position: 'relative', overflow: 'hidden' }}>
            
            {/* Header Row: Left = Coin Info, Right = Balance */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <CoinIconLogo symbol={symbol} size={28} />
                <div style={{ minWidth: 0 }}>
                  <h4 style={{ fontWeight: '800', fontSize: '1rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{symbol} Wallet</h4>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{COIN_LABELS[symbol] || 'Crypto asset'}</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: '1rem', fontWeight: '800', color: '#fff', lineHeight: 1.2 }}>{formatCoinAmount(val, symbol)} {symbol}</div>
                <span style={{ color: '#10b981', fontWeight: '700', fontSize: '0.72rem', marginTop: '2px' }}>
                  {(() => {
                    if (typeof getExchangeRate !== 'function') return '≈ 0.00 USDT';
                    const usdtRate = getExchangeRate('USDT') || 1;
                    const coinRate = getExchangeRate(symbol) || 0;
                    const priceInUsdt = coinRate / usdtRate;
                    const totalValue = Number(val) * priceInUsdt;
                    return `≈ ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`;
                  })()}
                </span>
              </div>
            </div>

            {/* Rates Info Row */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              borderTop: '1px solid rgba(255, 255, 255, 0.04)',
              paddingTop: '8px',
              marginBottom: '12px'
            }}>
              <span>Market Rate</span>
              <span style={{ color: '#fff', fontWeight: '600' }}>
                1 {symbol} = {(() => {
                  if (typeof getExchangeRate !== 'function') return '—';
                  const usdtRate = getExchangeRate('USDT') || 1;
                  const coinRate = getExchangeRate(symbol) || 0;
                  const priceInUsdt = coinRate / usdtRate;
                  if (symbol === 'USDT' || symbol === 'USDC') return '1.00 USDT';
                  if (symbol === 'BTC' || symbol === 'ETH') {
                    return `${priceInUsdt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`;
                  }
                  return `${priceInUsdt.toFixed(4)} USDT`;
                })()}
              </span>
            </div>

            {/* 3 Action Buttons - Compact Side by Side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
              <button
                onClick={() => { setSelectedTxCoin(symbol); setIsDepositModalOpen(true); }}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '0.75rem',
                  padding: '8px 0',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 10px rgba(16, 185, 129, 0.15)'
                }}
              >
                📥 Deposit
              </button>
              <button
                onClick={() => { setSelectedTxCoin(symbol); setIsWithdrawModalOpen(true); }}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '0.75rem',
                  padding: '8px 0',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  transition: 'all 0.2s ease'
                }}
              >
                📤 Withdraw
              </button>
              <button
                onClick={() => handleSwapClick(symbol)}
                style={{
                  background: 'linear-gradient(135deg, rgba(189,52,254,0.12) 0%, rgba(157,78,221,0.12) 100%)',
                  border: '1px solid rgba(189,52,254,0.3)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '0.75rem',
                  padding: '8px 0',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  transition: 'all 0.2s ease'
                }}
              >
                ⚡ Swap
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Swap Modal */}
      <SwapModal
        isOpen={isSwapOpen}
        onClose={() => setIsSwapOpen(false)}
        balances={balances}
        getExchangeRate={getExchangeRate}
        initialFromCoin={swapFromCoin}
        onSwapSuccess={handleSwapSuccess}
        swapFeePercent={swapFeePercent}
      />
    </div>
  );
}

export default UserWallets;
