import React, { useState, useEffect } from 'react';
import { CoinIconLogo } from '../../../components/Icons';
import { submitSellOrder, fetchUserExchangeLimits, fetchUserOrders } from '../../../services/auth';
import { fetchDepositWallets } from '../../../services/admin';

function UserExchange({
  exchangeCoin,
  setExchangeCoin,
  exchangeAmount,
  setExchangeAmount,
  balances,
  exchangeRate,
  receiveAmount,
  setActiveTab,
  bankAccounts,
  loadTransactions,
  getPendingExchangeAmount,
  getExchangeRate,
  getCurrencyConfig,
  formatUserCurrency,
  step = 1,
  setStep,
  transactions = [],
  deposits = [],
  withdrawals = []
}) {
  const config = getCurrencyConfig ? getCurrencyConfig() : { symbol: '₹', code: 'INR', locale: 'en-IN' };
  const formatVal = (val) => {
    if (formatUserCurrency) return formatUserCurrency(val);
    return `₹${Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  const [customAlert, setCustomAlert] = useState(null); // { message: '', type: 'error' | 'success' | 'info' }
  const [toastMessage, setToastMessage] = useState('');

  // Combine and sort recent transactions
  const allRecent = [
    ...transactions.map(t => ({ ...t, type: 'Exchange' })),
    ...deposits.map(d => ({ ...d, type: 'Deposit', inr: 0 })),
    ...withdrawals.map(w => ({ ...w, type: 'Withdrawal', inr: 0 }))
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 4);
  const [payoutOption, setPayoutOption] = useState('wire transfer');
  const [txId, setTxId] = useState('');
  const [screenshot, setScreenshot] = useState('');
  const [fileName, setFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmTimeLeft, setConfirmTimeLeft] = useState(1800); // 30 minutes = 1800 seconds
  const [processingTimeLeft, setProcessingTimeLeft] = useState(1800);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [currentOrderStatus, setCurrentOrderStatus] = useState('Pending');

  // Poll for status update when in Step 3
  useEffect(() => {
    let pollInterval = null;
    if (step === 3 && currentOrderId) {
      pollInterval = setInterval(async () => {
        try {
          const orders = await fetchUserOrders();
          const match = orders.find(o => o._id === currentOrderId);
          if (match) {
            if (match.status !== 'Pending') {
              setCurrentOrderStatus(match.status);
              clearInterval(pollInterval);
              // Also reload parent transactions list to ensure total consistency
              if (loadTransactions) {
                loadTransactions();
              }
            }
          }
        } catch (err) {
          console.warn('Error polling order status:', err.message);
        }
      }, 3000);
    } else if (step === 1) {
      setCurrentOrderId(null);
      setCurrentOrderStatus('Pending');
    }
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [step, currentOrderId]);

  // Auto-dismiss toast notification after 3 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Timer logic for Confirm order step (Step 2) & Processing step (Step 3)
  useEffect(() => {
    let timer = null;
    if (step === 2 && confirmTimeLeft > 0) {
      timer = setInterval(() => {
        setConfirmTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            alert('Confirmation time expired. Please re-enter the exchange amount.');
            setStep(1);
            return 1800;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (step === 3 && processingTimeLeft > 0) {
      timer = setInterval(() => {
        setProcessingTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (step === 1) {
      setConfirmTimeLeft(1800);
      setProcessingTimeLeft(1800);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, confirmTimeLeft, processingTimeLeft]);

  const formatConfirmTime = (sec) => {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const showAlert = (message, type = 'error') => {
    setCustomAlert({ message, type });
  };

  // Network selection for USDT (TRC20 / BEP20)
  const [usdtNetwork, setUsdtNetwork] = useState('TRC20');

  const [limitsInfo, setLimitsInfo] = useState(null);
  const [loadingLimits, setLoadingLimits] = useState(true);

  const loadLimitsInfo = async () => {
    try {
      const data = await fetchUserExchangeLimits();
      setLimitsInfo(data);
    } catch (err) {
      console.error('Error loading user limits:', err);
    } finally {
      setLoadingLimits(false);
    }
  };

  useEffect(() => {
    loadLimitsInfo();
  }, []);

  // Dynamic wallet addresses loaded from backend settings database
  const [walletAddresses, setWalletAddresses] = useState({
    USDT_TRC20: '',
    USDT_BEP20: '',
    BTC: '',
    ETH: '',
    USDC: '',
    TRX: ''
  });

  // Load wallets on component mount
  useEffect(() => {
    const loadWallets = async () => {
      try {
        const addr = await fetchDepositWallets();
        if (addr) {
          setWalletAddresses(addr);
        }
      } catch (err) {
        console.warn('Failed to load dynamic wallet addresses:', err.message);
      }
    };
    loadWallets();
  }, []);

  // Get selected target wallet address
  const getWalletAddress = () => {
    if (exchangeCoin === 'USDT') {
      return usdtNetwork === 'TRC20' ? walletAddresses.USDT_TRC20 : walletAddresses.USDT_BEP20;
    }
    return walletAddresses[exchangeCoin] || '';
  };

  // Fallback default bank if not fully initialized
  const linkedBank = bankAccounts && bankAccounts.length > 0 ? bankAccounts[0] : null;

  const handleCopyWallet = () => {
    const addr = getWalletAddress();
    navigator.clipboard.writeText(addr);
    setToastMessage(`${exchangeCoin} Address Copied!`);
  };

  // Convert uploaded image to Base64 data URL
  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshot(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!linkedBank) {
      showAlert('Please link a bank account to proceed with the exchange.', 'error');
      return;
    }
    const amt = parseFloat(exchangeAmount);
    if (isNaN(amt) || amt <= 0) {
      showAlert('Please enter a valid amount.', 'error');
      return;
    }
    const userBalance = balances?.[exchangeCoin] ?? 0;
    if (amt > userBalance) {
      showAlert(`Insufficient balance! Your current ${exchangeCoin} wallet balance is ${userBalance} ${exchangeCoin}. Please deposit funds to proceed.`, 'error');
      return;
    }
    if (limitsInfo) {
      const minExchangeUsdt = limitsInfo.minExchangeUsdt ?? 100;
      if (exchangeCoin === 'USDT' && amt < minExchangeUsdt) {
        showAlert(`Minimum exchange amount for USDT is ${minExchangeUsdt} USDT. Please enter an amount equal to or greater than ${minExchangeUsdt} USDT.`, 'error');
        return;
      }

      const usdtRate = getExchangeRate ? getExchangeRate('USDT') : 85;
      const reqUsdt = Number(receiveAmount) / usdtRate;
      if (reqUsdt > limitsInfo.remainingLimit) {
        showAlert(`Exchange limit exceeded! Your remaining daily exchange limit is ${limitsInfo.remainingLimit.toFixed(2)} USDT. This order requires ${reqUsdt.toFixed(2)} USDT. Please verify your KYC to raise limits or reduce the amount.`, 'error');
        return;
      }
    }
    // Proceed to confirmation step
    setStep(2);
  };

  const handleCloseProcessing = () => {
    setStep(1);
    if (setExchangeAmount) {
      setExchangeAmount('');
    }
  };

  const handleConfirmOrder = async () => {
    if (!linkedBank) {
      showAlert('Please link a bank account to proceed with the exchange.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const resData = await submitSellOrder({
        coin: exchangeCoin,
        amount: parseFloat(exchangeAmount),
        inr: receiveAmount,
        bankDetails: {
          name: linkedBank.name,
          number: linkedBank.number,
          ifsc: linkedBank.ifsc
        },
        txId: 'DIRECT_EXCHANGE',
        screenshot: 'direct',
        depositAddress: 'N/A',
        payoutOption: payoutOption
      });

      if (resData && resData.order) {
        setCurrentOrderId(resData.order._id);
        setCurrentOrderStatus(resData.order.status || 'Pending');
      }

      if (loadTransactions) {
        await loadTransactions();
      }
      setStep(3);
    } catch (err) {
      showAlert(`Error submitting order: ${err.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const renderContent = () => {
    if (!linkedBank) {
      return (
        <div style={{ maxWidth: '600px', margin: '40px auto' }} className="glass-panel text-center">
          <div style={{ padding: '40px 24px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🏦</div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '12px', color: '#ff1744' }}>
              No Bank Account Linked
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '24px' }}>
              To sell cryptocurrency for Indian Rupees (INR), you must first link an active bank account where your payout funds will be deposited.
            </p>
            <button 
              onClick={() => setActiveTab('banks')} 
              className="btn btn-primary" 
              style={{ padding: '12px 24px', fontSize: '0.95rem', fontWeight: '700', borderRadius: '8px' }}
            >
              ➕ Link Bank Account Now
            </button>
          </div>
        </div>
      );
    }

    if (step === 1) {
      return (
        <div className="exchange-card glass-panel">
          <style>{`
            .exchange-card {
              width: 100%;
              max-width: 560px;
              margin: 0 auto;
              transition: all 0.2s ease;
            }
            .exchange-card-inner {
              padding: 24px;
            }
            .crypto-select-grid {
              display: grid;
              grid-template-columns: repeat(5, 1fr);
              gap: 12px;
            }
            .crypto-card-item {
              padding: 12px 6px;
              text-align: center;
              border-radius: var(--radius-sm);
              cursor: pointer;
            }
            .payout-options-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 16px;
            }
            .payout-card-item {
              padding: 16px;
              border-radius: 10px;
            }
            .payout-icon {
              font-size: 1.5rem;
              margin-bottom: 8px;
            }
            .payout-label {
              font-size: 0.88rem;
            }
            .amount-input-field {
              padding: 12px 14px;
              font-size: 0.95rem;
            }
            .exchange-details-card {
              background: rgba(255,255,255,0.02);
              border: 1px solid var(--border-color);
              padding: 16px;
              border-radius: var(--radius-sm);
              display: flex;
              flex-direction: column;
              gap: 10px;
              font-size: 0.85rem;
            }
            .exchange-receive-amount {
              font-size: 1.25rem;
            }
            .exchange-btn-submit {
              padding: 14px;
              font-size: 1.05rem;
            }

            @media (max-width: 768px) {
              .exchange-card {
                max-width: 440px;
              }
              .exchange-card-inner {
                padding: 16px;
              }
              .crypto-select-grid {
                gap: 6px;
              }
              .crypto-card-item {
                padding: 8px 4px;
              }
              .payout-options-grid {
                gap: 8px;
              }
              .payout-card-item {
                padding: 10px 6px;
                border-radius: 8px;
              }
              .payout-icon {
                font-size: 1.2rem;
                margin-bottom: 4px;
              }
              .payout-label {
                font-size: 0.8rem;
              }
              .amount-input-field {
                padding: 10px 12px;
                font-size: 0.88rem;
              }
              .exchange-details-card {
                padding: 12px;
                gap: 8px;
                font-size: 0.78rem;
              }
              .exchange-receive-amount {
                font-size: 1.1rem;
              }
              .exchange-btn-submit {
                padding: 10px;
                font-size: 0.9rem;
              }
            }
          `}</style>

          <div className="exchange-card-inner">
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '16px', textAlign: 'center' }}>Convert Crypto to Fiat/Currency</h3>
            
            {limitsInfo && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                padding: '8px 12px',
                marginBottom: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.78rem'
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Daily Limit:</span>{' '}
                  <strong style={{ color: '#fff' }}>{limitsInfo.userLimit.toLocaleString('en-US')} USDT</strong>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Remaining:</span>{' '}
                  <strong style={{ color: limitsInfo.remainingLimit > 0 ? '#4ade80' : '#ef4444' }}>
                    {limitsInfo.remainingLimit.toLocaleString('en-US')} USDT
                  </strong>
                </div>
              </div>
            )}

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div>
                <label className="input-label" style={{ fontSize: '0.75rem', marginBottom: '8px', display: 'block' }}>Select Cryptocurrency</label>
                <div className="crypto-select-grid">
                  {['USDT', 'BTC', 'ETH', 'USDC', 'TRX'].map((coin) => (
                    <div 
                      key={coin}
                      className={`payment-method-card crypto-card-item ${exchangeCoin === coin ? 'active' : ''}`}
                      onClick={() => setExchangeCoin(coin)}
                    >
                      <CoinIconLogo symbol={coin} size={18} className="m-auto" style={{ margin: '0 auto 6px' }} />
                      <span style={{ fontWeight: '700', fontSize: '0.82rem' }}>{coin}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="input-label" style={{ margin: 0, fontSize: '0.75rem' }}>Cryptocurrency Amount</label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Balance: <strong style={{ color: 'var(--color-primary)' }}>{balances?.[exchangeCoin] ?? 0} {exchangeCoin}</strong>
                    {getPendingExchangeAmount(exchangeCoin) > 0 && (
                      <span style={{ color: '#ffaa00', marginLeft: '4px' }}>
                        ({getPendingExchangeAmount(exchangeCoin)} pending)
                      </span>
                    )}
                  </span>
                </div>
                <input 
                  type="number" 
                  step="any"
                  className="step-input amount-input-field" 
                  placeholder="0.00"
                  value={exchangeAmount} 
                  onChange={(e) => setExchangeAmount(e.target.value)} 
                  required 
                />
                {exchangeCoin === 'USDT' && limitsInfo && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                    ⚠️ Min Exchange Limit: <strong style={{ color: 'var(--color-primary)' }}>{limitsInfo.minExchangeUsdt ?? 100} USDT</strong>
                  </span>
                )}
              </div>

              <div>
                <label className="input-label" style={{ fontSize: '0.75rem', marginBottom: '8px', display: 'block' }}>Choose Payout Option</label>
                <div className="payout-options-grid">
                  {[
                    { key: 'wire transfer', label: 'Wire Transfer', icon: '🏦' },
                    { key: 'CDM deposit', label: 'CDM Deposit', icon: '💵' }
                  ].map((opt) => (
                    <div 
                      key={opt.key}
                      onClick={() => setPayoutOption(opt.key)}
                      className="payout-card-item"
                      style={{
                        border: '1px solid',
                        borderColor: payoutOption === opt.key ? '#a855f7' : 'rgba(255, 255, 255, 0.06)',
                        background: payoutOption === opt.key ? 'rgba(168, 85, 247, 0.08)' : 'rgba(255, 255, 255, 0.01)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s',
                        boxShadow: payoutOption === opt.key ? '0 0 10px rgba(168, 85, 247, 0.15)' : 'none'
                      }}
                    >
                      <div className="payout-icon">{opt.icon}</div>
                      <div className="payout-label" style={{ fontWeight: '700', color: payoutOption === opt.key ? '#fff' : 'var(--text-secondary)' }}>{opt.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="exchange-details-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Available Balance:</span>
                  <strong>{balances?.[exchangeCoin] ?? 0} {exchangeCoin}</strong>
                </div>
                {getPendingExchangeAmount(exchangeCoin) > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ffaa00' }}>
                    <span>For Exchange:</span>
                    <strong>{getPendingExchangeAmount(exchangeCoin)} {exchangeCoin}</strong>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Rate:</span>
                  <strong>1 {exchangeCoin} = {config.symbol}{exchangeRate.toLocaleString(config.locale, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Fee:</span>
                  <strong style={{ color: 'var(--success)' }}>{config.symbol}0 (Zero Fees)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px', fontWeight: '700' }}>
                  <span>You Receive:</span>
                  <span className="exchange-receive-amount" style={{ color: 'var(--color-primary)', fontWeight: '700' }}>{config.symbol}{receiveAmount.toLocaleString(config.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              <button type="submit" className="btn btn-primary exchange-btn-submit" style={{ fontWeight: '700', borderRadius: '8px' }}>
                Exchange Now
              </button>
            </form>
          </div>
        </div>
      );
    }

    if (step === 2) {
      return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }} className="glass-panel">
          <div style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '12px', textAlign: 'center', color: 'var(--color-primary)' }}>
              Confirm Payout Destination
            </h3>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 14px',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '8px',
              color: '#f87171',
              fontSize: '0.85rem',
              fontWeight: '700',
              marginBottom: '20px'
            }}>
              ⏱️ Session expires in: <span style={{ fontFamily: 'monospace', fontSize: '1rem', color: '#ef4444' }}>{formatConfirmTime(confirmTimeLeft)}</span>
            </div>
            
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: '10px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0 0 10px 0', lineHeight: '1.6' }}>
                You are selling <strong>{exchangeAmount} {exchangeCoin}</strong> for an estimated <strong>{config.symbol}{receiveAmount.toLocaleString(config.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>.
              </p>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '0 0 10px 0' }}>
                The payout amount will be transferred directly to your linked bank account details:
              </p>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Bank Name:</span>
                  <strong style={{ color: '#fff' }}>{linkedBank.name}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Account Number:</span>
                  <strong style={{ color: '#fff', fontFamily: 'monospace' }}>{linkedBank.number}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>IFSC Code:</span>
                  <strong style={{ color: '#fff', fontFamily: 'monospace' }}>{linkedBank.ifsc}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', borderTop: '1px dashed rgba(255,255,255,0.06)', paddingTop: '8px', fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Payout Option:</span>
                  <strong style={{ color: '#fbbf24', textTransform: 'capitalize' }}>{payoutOption}</strong>
                </div>
              </div>
            </div>

            <p style={{ textAlign: 'center', fontWeight: '700', fontSize: '0.95rem', color: '#fff', marginBottom: '20px' }}>
              Do you want to proceed with this payout bank destination?
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button 
                onClick={() => setStep(1)} 
                className="btn btn-secondary" 
                disabled={submitting}
                style={{ padding: '12px', fontSize: '0.95rem', fontWeight: '700', borderRadius: '8px' }}
              >
                ❌ No, Go Back
              </button>
              <button 
                onClick={handleConfirmOrder} 
                className="btn btn-primary" 
                disabled={submitting}
                style={{ padding: '12px', fontSize: '0.95rem', fontWeight: '700', borderRadius: '8px', opacity: submitting ? 0.6 : 1 }}
              >
                {submitting ? 'Submitting...' : '✅ Yes, Proceed'}
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (step === 3) {
      return (
        <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }} className="glass-panel">
          
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>

          {/* Close button at the top-right */}
          <button 
            onClick={handleCloseProcessing}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#fff',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '1.2rem',
              lineHeight: 1,
              transition: 'background 0.2s',
              zIndex: 10
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
            title="Close"
          >
            &times;
          </button>

          <div style={{ padding: '32px 24px', textAlign: 'center' }}>
            
            {currentOrderStatus === 'Completed' && (
              <>
                {/* Big green success checkmark icon */}
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  margin: '0 auto 20px', 
                  background: 'rgba(16, 185, 129, 0.1)', 
                  border: '2px solid #10b981', 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10b981',
                  fontSize: '2.5rem',
                  boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)'
                }}>
                  ✓
                </div>

                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', marginBottom: '8px', color: '#10b981' }}>
                  Exchange Completed!
                </h3>
                
                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.6', margin: '0 auto 24px', maxWidth: '400px' }}>
                  Your order for <strong>{exchangeAmount} {exchangeCoin}</strong> has been approved by the admin. The INR amount of <strong>{config.symbol}{receiveAmount.toLocaleString(config.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> has been successfully transferred to your linked bank account.
                </p>

                <div style={{
                  background: 'rgba(16, 185, 129, 0.04)',
                  border: '1px solid rgba(16, 185, 129, 0.15)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '0.82rem',
                  color: '#34d399',
                  lineHeight: '1.5',
                  maxWidth: '460px',
                  margin: '0 auto 28px',
                  textAlign: 'center'
                }}>
                  🎉 Funds have been processed and dispatched to your bank!
                </div>
              </>
            )}

            {currentOrderStatus === 'Rejected' && (
              <>
                {/* Big red cross icon */}
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  margin: '0 auto 20px', 
                  background: 'rgba(239, 68, 68, 0.1)', 
                  border: '2px solid #ef4444', 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ef4444',
                  fontSize: '2.5rem',
                  boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)'
                }}>
                  &times;
                </div>

                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', marginBottom: '8px', color: '#ef4444' }}>
                  Exchange Order Rejected
                </h3>
                
                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.6', margin: '0 auto 24px', maxWidth: '400px' }}>
                  Your order for <strong>{exchangeAmount} {exchangeCoin}</strong> has been rejected by the admin. Please verify your details or contact customer support for further information.
                </p>

                <div style={{
                  background: 'rgba(239, 68, 68, 0.04)',
                  border: '1px solid rgba(239, 68, 68, 0.15)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '0.82rem',
                  color: '#f87171',
                  lineHeight: '1.5',
                  maxWidth: '460px',
                  margin: '0 auto 28px',
                  textAlign: 'center'
                }}>
                  ❌ Order was declined. No funds were debited from your account.
                </div>
              </>
            )}

            {currentOrderStatus !== 'Completed' && currentOrderStatus !== 'Rejected' && (
              <>
                {/* Spinning/pulsing loader icon */}
                <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
                  <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    border: '4px solid rgba(251, 191, 36, 0.1)',
                    borderTop: '4px solid #fbbf24',
                    borderRadius: '50%',
                    width: '100%',
                    height: '100%',
                    animation: 'spin 1.5s linear infinite'
                  }}></div>
                  <span style={{ fontSize: '2rem', margin: 'auto' }}>⏱️</span>
                </div>

                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', marginBottom: '8px', color: '#fbbf24' }}>
                  Processing Your Exchange
                </h3>
                
                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.6', margin: '0 auto 24px', maxWidth: '400px' }}>
                  Your order is submitted. Please wait while we process your amount of <strong>{exchangeAmount} {exchangeCoin}</strong> for <strong>{config.symbol}{receiveAmount.toLocaleString(config.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>.
                </p>

                {/* Live Ticking Countdown Box */}
                <div style={{
                  background: 'rgba(251, 191, 36, 0.06)',
                  border: '1px solid rgba(251, 191, 36, 0.15)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'inline-flex',
                  flexDirection: 'column',
                  gap: '6px',
                  marginBottom: '28px',
                  minWidth: '220px'
                }}>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.05em' }}>
                    Estimated Time Remaining
                  </span>
                  <span style={{ fontFamily: 'monospace', fontSize: '1.8rem', fontWeight: '800', color: '#fbbf24' }}>
                    {formatConfirmTime(processingTimeLeft)}
                  </span>
                </div>

                {/* Informational Message */}
                <div style={{
                  background: 'rgba(255,255,255,0.01)',
                  border: '1px solid rgba(255,255,255,0.03)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '0.82rem',
                  color: 'var(--text-muted)',
                  lineHeight: '1.5',
                  textAlign: 'left',
                  maxWidth: '460px',
                  margin: '0 auto 28px'
                }}>
                  💡 <strong>Note:</strong> You do not need to keep this page open. The exchange will continue processing in the background, and the status will update in your <strong>Transactions</strong> dashboard.
                </div>
              </>
            )}

            {/* Bottom Close Button */}
            <button 
              onClick={handleCloseProcessing}
              className="btn btn-secondary"
              style={{
                padding: '12px 32px',
                fontSize: '0.95rem',
                fontWeight: '700',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.03)',
                color: '#fff',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
            >
              Close Window
            </button>

          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Render current layout state */}
      {renderContent()}

      {/* Recent Transactions Table (only show in Step 1) */}
      {step === 1 && (
        <div className="glass-panel" style={{ width: '100%', maxWidth: '560px', margin: '0 auto', padding: '24px', borderRadius: '16px' }}>
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
      )}

      {/* Custom Alert Modal popup */}
      {customAlert && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(6, 9, 20, 0.88)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ 
            width: '100%',
            maxWidth: '400px', 
            padding: '32px 24px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              background: customAlert.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : customAlert.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
              color: customAlert.type === 'success' ? '#10b981' : customAlert.type === 'error' ? '#ef4444' : '#f59e0b',
              border: `1px solid ${customAlert.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : customAlert.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
            }}>
              {customAlert.type === 'success' ? '✓' : customAlert.type === 'error' ? '⚠️' : 'ℹ️'}
            </div>

            <h4 style={{ 
              fontSize: '1.15rem', 
              fontWeight: '800', 
              color: '#fff',
              margin: 0
            }}>
              {customAlert.type === 'success' ? 'Success' : customAlert.type === 'error' ? 'Compliance Warning' : 'Notification'}
            </h4>

            <p style={{ 
              fontSize: '0.88rem', 
              color: 'var(--text-secondary)', 
              lineHeight: '1.6',
              margin: 0
            }}>
              {customAlert.message}
            </p>

            <button 
              onClick={() => setCustomAlert(null)} 
              className="btn btn-primary" 
              style={{ 
                width: '100%',
                padding: '12px', 
                fontSize: '0.9rem', 
                fontWeight: '700', 
                borderRadius: '8px',
                marginTop: '8px',
                cursor: 'pointer'
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Copy notification toast popup */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: '30px',
          fontSize: '0.88rem',
          fontWeight: '700',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
          zIndex: 999999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ color: 'var(--color-primary)' }}>✓</span> {toastMessage}
        </div>
      )}
    </div>
  );
}

export default UserExchange;
