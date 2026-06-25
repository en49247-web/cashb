import React, { useState, useEffect } from 'react';
import { CoinIconLogo } from '../../../components/Icons';

// Inline Icons for Premium UI
const CopyIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
);
const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
);
const ExchangeIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 8 16 13"></polyline><line x1="21" y1="8" x2="9" y2="8"></line><polyline points="8 21 3 16 8 11"></polyline><line x1="3" y1="16" x2="15" y2="16"></line></svg>
);
const DepositIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
);

function UserTransactions({
  transactions,
  deposits,
  withdrawals = [],
  historyFilter,
  setHistoryFilter,
  historyCoin,
  setHistoryCoin,
  handleExportCSV,
  getCurrencyConfig,
  formatUserCurrency
}) {
  const config = getCurrencyConfig ? getCurrencyConfig() : { symbol: '₹', code: 'INR', locale: 'en-IN' };
  const [activeTab, setActiveTab] = useState('all');
  const [timeTick, setTimeTick] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeTick(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatRemainingTime = (ms) => {
    if (ms <= 0) return '00:00';
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Merge exchange orders, deposits, and withdrawals into a unified list
  const allTransactions = [
    ...transactions.map(tx => ({ ...tx, type: tx.type || 'Exchange' })),
    ...(deposits || []).map(d => ({ ...d, type: d.type || 'Deposit' })),
    ...(withdrawals || []).map(w => ({ ...w, type: w.type || 'Withdrawal' }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Filter by tab
  const getFilteredByTab = (list) => {
    if (activeTab === 'exchange') return list.filter(tx => tx.type === 'Exchange');
    if (activeTab === 'deposit') return list.filter(tx => tx.type === 'Deposit');
    if (activeTab === 'withdrawal') return list.filter(tx => tx.type === 'Withdrawal');
    return list; // 'all'
  };

  // Filter by status and coin
  const filteredTransactions = getFilteredByTab(allTransactions)
    .filter(tx => {
      const matchStatus = historyFilter === 'All' || tx.status === historyFilter;
      const matchCoin = historyCoin === 'All' || tx.coin === historyCoin || (historyCoin === 'USDT' && tx.coin?.startsWith('USDT'));
      return matchStatus && matchCoin;
    });

  const exchangeCount = allTransactions.filter(tx => tx.type === 'Exchange').length;
  const depositCount = allTransactions.filter(tx => tx.type === 'Deposit').length;
  const withdrawalCount = allTransactions.filter(tx => tx.type === 'Withdrawal').length;
  const pendingCount = allTransactions.filter(tx => tx.status === 'Pending').length;

  const handleCopyId = (e, id) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    alert(`Transaction ID copied: ${id}`);
  };

  const formatTxDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleString(config.locale, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Dynamic styles to handle responsive views */}
      <style>{`
        .transactions-overview-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        .horizontal-scroll-tabs {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none;  /* IE and Edge */
        }
        .horizontal-scroll-tabs::-webkit-scrollbar {
          display: none; /* Chrome, Safari and Opera */
        }
        .horizontal-scroll-tabs button {
          white-space: nowrap;
          flex-shrink: 0;
        }
        .desktop-only-table {
          display: block;
        }
        .mobile-only-list {
          display: none;
        }
        
        @media (max-width: 991px) {
          .transactions-overview-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .overview-card-wrapper {
            padding: 14px 16px !important;
            gap: 12px !important;
          }
          .overview-card-title {
            font-size: 0.7rem !important;
          }
          .overview-card-value {
            font-size: 1.3rem !important;
          }
        }

        @media (max-width: 768px) {
          .desktop-only-table {
            display: none !important;
          }
          .mobile-only-list {
            display: flex !important;
            flex-direction: column;
            gap: 12px;
          }
        }
      `}</style>
      
      {/* 1. Header Overview Cards */}
      <div className="transactions-overview-grid">
        
        {/* Card: Exchange count */}
        <div className="glass-panel overview-card-wrapper" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ padding: '10px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', color: '#a78bfa' }}>
            <ExchangeIcon />
          </div>
          <div>
            <div className="overview-card-title" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Exchange Orders</div>
            <div className="overview-card-value" style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fff', marginTop: '2px' }}>{exchangeCount}</div>
          </div>
        </div>

        {/* Card: Deposit count */}
        <div className="glass-panel overview-card-wrapper" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #22c55e' }}>
          <div style={{ padding: '10px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '12px', color: '#4ade80' }}>
            <DepositIcon />
          </div>
          <div>
            <div className="overview-card-title" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Completed Deposits</div>
            <div className="overview-card-value" style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fff', marginTop: '2px' }}>{depositCount}</div>
          </div>
        </div>

        {/* Card: Withdrawals count */}
        <div className="glass-panel overview-card-wrapper" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #ef4444' }}>
          <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', color: '#f87171' }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
          </div>
          <div>
            <div className="overview-card-title" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Withdrawals</div>
            <div className="overview-card-value" style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fff', marginTop: '2px' }}>{withdrawalCount}</div>
          </div>
        </div>

        {/* Card: Pending queue */}
        <div className="glass-panel overview-card-wrapper" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ padding: '10px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', color: '#fbbf24' }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <div>
            <div className="overview-card-title" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pending Approvals</div>
            <div className="overview-card-value" style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fbbf24', marginTop: '2px' }}>{pendingCount}</div>
          </div>
        </div>
      </div>

      {/* 2. Main Ledger Area */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        
        {/* Tab switcher: All / Exchange / Deposits */}
        <div className="horizontal-scroll-tabs" style={{ 
          background: 'rgba(255,255,255,0.02)', 
          borderRadius: '10px', 
          padding: '4px', 
          border: '1px solid rgba(255,255,255,0.04)',
          marginBottom: '20px'
        }}>
          {[
            { key: 'all', label: 'All Transactions', count: allTransactions.length },
            { key: 'exchange', label: 'Exchange Orders', count: exchangeCount },
            { key: 'deposit', label: 'Deposits', count: depositCount },
            { key: 'withdrawal', label: 'Withdrawals', count: withdrawalCount }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                padding: '12px 16px',
                fontSize: '0.82rem',
                fontWeight: activeTab === tab.key ? '700' : '600',
                background: activeTab === tab.key ? 'var(--color-primary)' : 'transparent',
                color: activeTab === tab.key ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>{tab.label}</span>
              <span style={{
                background: activeTab === tab.key ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.06)',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '0.72rem',
                fontWeight: '700',
                minWidth: '20px',
                textAlign: 'center'
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Filter Toolbar controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '18px' }}>
          
          {/* Status Pills */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['All', 'Completed', 'Pending', 'Rejected'].map((f) => {
              const isActive = historyFilter === f;
              return (
                <button
                  key={f}
                  onClick={() => setHistoryFilter(f)}
                  className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ 
                    padding: '8px 16px', 
                    fontSize: '0.78rem', 
                    borderRadius: '30px',
                    fontWeight: '700',
                    background: isActive ? 'var(--color-primary)' : 'rgba(255,255,255,0.02)',
                    border: '1px solid ' + (isActive ? 'transparent' : 'rgba(255,255,255,0.06)')
                  }}
                >
                  {f}
                </button>
              );
            })}
          </div>

          {/* Action Tools */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select
              value={historyCoin}
              onChange={(e) => setHistoryCoin(e.target.value)}
              className="step-input"
              style={{ 
                width: '120px', 
                padding: '8px 14px', 
                background: 'rgba(0,0,0,0.25)', 
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px', 
                height: '36px', 
                fontSize: '0.8rem',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              <option value="All">All Coins</option>
              <option value="USDT">USDT</option>
              <option value="BTC">BTC</option>
              <option value="ETH">ETH</option>
              <option value="USDC">USDC</option>
            </select>

            <button 
              onClick={handleExportCSV}
              className="btn btn-secondary"
              style={{ 
                padding: '8px 16px', 
                fontSize: '0.8rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                borderRadius: '8px',
                height: '36px',
                fontWeight: '700',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)'
              }}
            >
              <DownloadIcon />
              Export
            </button>
          </div>
        </div>

        {/* 3. Desktop Table View */}
        <div className="desktop-only-table" style={{ overflowX: 'auto' }}>
          <table className="rates-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
            <thead>
              <tr style={{ background: 'transparent' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date & Time</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Transaction Hash / Address</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Coin</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Quantity</th>
                {activeTab !== 'deposit' && activeTab !== 'withdrawal' && <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Settled Value</th>}
                <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={activeTab !== 'deposit' && activeTab !== 'withdrawal' ? 7 : 6} style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📭</div>
                    No transactions matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx, idx) => {
                  const isCompleted = tx.status === 'Completed' || tx.status === 'Approved';
                  const isPending = tx.status === 'Pending';

                  return (
                    <tr 
                      key={`${tx.type}-${tx.id}-${idx}`}
                      style={{ 
                        background: 'rgba(255,255,255,0.01)', 
                        border: '1px solid rgba(255,255,255,0.03)',
                        borderRadius: '8px',
                        transition: 'transform 0.15s ease, background-color 0.15s ease',
                        cursor: 'default'
                      }}
                    >
                      <td style={{ padding: '16px', fontSize: '0.82rem', color: '#cbd5e1' }}>
                        {formatTxDate(tx.date)}
                      </td>

                      <td style={{ padding: '16px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '4px 10px',
                          borderRadius: '30px',
                          fontSize: '0.72rem',
                          fontWeight: '800',
                          letterSpacing: '0.3px',
                          background: tx.type === 'Exchange' 
                            ? 'rgba(139, 92, 246, 0.08)' 
                            : tx.type === 'Deposit'
                              ? 'rgba(34, 197, 94, 0.08)'
                              : 'rgba(239, 68, 68, 0.08)',
                          color: tx.type === 'Exchange' 
                            ? '#c084fc' 
                            : tx.type === 'Deposit'
                              ? '#4ade80'
                              : '#f87171',
                          border: `1px solid ${tx.type === 'Exchange' ? 'rgba(139, 92, 246, 0.15)' : tx.type === 'Deposit' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)'}`
                        }}>
                          {tx.type}
                        </span>
                      </td>

                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ 
                            fontWeight: '600', 
                            fontFamily: 'monospace', 
                            fontSize: '0.8rem', 
                            color: '#94a3b8',
                            maxWidth: '120px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {tx.txId || tx.id}
                          </span>
                          <button
                            onClick={(e) => handleCopyId(e, tx.txId || tx.id)}
                            style={{
                              background: 'rgba(255,255,255,0.04)',
                              border: 'none',
                              color: 'var(--text-muted)',
                              padding: '4px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <CopyIcon />
                          </button>
                        </div>
                      </td>

                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CoinIconLogo symbol={tx.coin?.replace(/\s*\(.*\)/, '')} size={18} />
                          <span style={{ fontWeight: '700', fontSize: '0.85rem', color: '#fff' }}>{tx.coin}</span>
                        </div>
                      </td>

                      <td style={{ padding: '16px', fontWeight: '700', fontSize: '0.85rem', color: '#f1f5f9' }}>
                        {tx.amount} {tx.coin?.replace(/\s*\(.*\)/, '')}
                      </td>

                      {activeTab !== 'deposit' && activeTab !== 'withdrawal' && (
                        <td style={{ 
                          padding: '16px', 
                          color: tx.type === 'Exchange' ? 'var(--color-primary)' : '#64748b', 
                          fontWeight: '800',
                          fontSize: '0.9rem'
                        }}>
                          {tx.type === 'Exchange' ? `${config.symbol}${tx.inr?.toLocaleString(config.locale) || '0'}` : '—'}
                        </td>
                      )}

                      <td style={{ padding: '16px' }}>
                        {(() => {
                          const createdAtMs = new Date(tx.date).getTime();
                          const timeElapsed = timeTick - createdAtMs;
                          const timeLeftMs = 1800000 - timeElapsed;
                          const isExpired = timeLeftMs <= 0;

                          return (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 12px',
                                borderRadius: '30px',
                                fontSize: '0.74rem',
                                fontWeight: '800',
                                background: 
                                  isCompleted ? 'rgba(16, 185, 129, 0.08)' :
                                  isPending ? 'rgba(245, 158, 11, 0.08)' :
                                  'rgba(239, 68, 68, 0.08)',
                                color: 
                                  isCompleted ? '#34d399' :
                                  isPending ? '#fbbf24' :
                                  '#f87171',
                                border: `1px solid ${
                                  isCompleted ? 'rgba(16, 185, 129, 0.15)' :
                                  isPending ? 'rgba(245, 158, 11, 0.15)' :
                                  'rgba(239, 68, 68, 0.15)'
                                }`
                              }}>
                                <span style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  background: 
                                    isCompleted ? '#10b981' :
                                    isPending ? '#f59e0b' :
                                    '#ef4444'
                                }} />
                                {tx.status}
                              </span>
                              {isPending && (
                                <span style={{ fontSize: '0.72rem', color: '#fbbf24', opacity: 0.95, fontFamily: 'monospace', fontWeight: '700', paddingLeft: '4px' }}>
                                  ⏱️ {isExpired ? '00:00' : formatRemainingTime(timeLeftMs)}
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Mobile Transaction Cards List */}
        <div className="mobile-only-list">
          {filteredTransactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>📭</div>
              No transactions matching your criteria.
            </div>
          ) : (
            filteredTransactions.map((tx, idx) => {
              const isCompleted = tx.status === 'Completed' || tx.status === 'Approved';
              const isPending = tx.status === 'Pending';
              const isRejected = tx.status === 'Rejected';

              return (
                <div 
                  key={`mobile-${tx.type}-${tx.id}-${idx}`}
                  style={{
                    background: 'rgba(255, 255, 255, 0.01)',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                    borderRadius: '12px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  {/* Top line: Coin Logo/Ticker + Type Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CoinIconLogo symbol={tx.coin?.replace(/\s*\(.*\)/, '')} size={20} />
                      <strong style={{ fontSize: '0.9rem', color: '#fff' }}>{tx.coin}</strong>
                    </div>
                    
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '30px',
                      fontSize: '0.68rem',
                      fontWeight: '800',
                      background: tx.type === 'Exchange' 
                        ? 'rgba(139, 92, 246, 0.08)' 
                        : tx.type === 'Deposit'
                          ? 'rgba(34, 197, 94, 0.08)'
                          : 'rgba(239, 68, 68, 0.08)',
                      color: tx.type === 'Exchange' 
                        ? '#c084fc' 
                        : tx.type === 'Deposit'
                          ? '#4ade80'
                          : '#f87171',
                      border: `1px solid ${tx.type === 'Exchange' ? 'rgba(139, 92, 246, 0.15)' : tx.type === 'Deposit' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)'}`
                    }}>
                      {tx.type}
                    </span>
                  </div>

                  {/* Middle Line: Amount details */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Amount: </span>
                      <strong style={{ fontSize: '0.95rem', color: '#f1f5f9' }}>
                        {tx.amount} {tx.coin?.replace(/\s*\(.*\)/, '')}
                      </strong>
                    </div>
                    {tx.type === 'Exchange' && tx.inr > 0 && (
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Settled: </span>
                        <strong style={{ fontSize: '0.95rem', color: 'var(--color-primary)' }}>
                          {config.symbol}{tx.inr?.toLocaleString(config.locale)}
                        </strong>
                      </div>
                    )}
                  </div>

                  {/* Divider */}
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.03)' }}></div>

                  {/* Bottom Line: Date/Status & Copy TxID */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatTxDate(tx.date)}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: '#94a3b8' }}>
                          {tx.txId || tx.id ? (tx.txId || tx.id).slice(0, 10) + '...' : ''}
                        </span>
                        <button
                          onClick={(e) => handleCopyId(e, tx.txId || tx.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            padding: '2px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <CopyIcon />
                        </button>
                      </div>
                    </div>

                    {(() => {
                      const createdAtMs = new Date(tx.date).getTime();
                      const timeElapsed = timeTick - createdAtMs;
                      const timeLeftMs = 1800000 - timeElapsed;
                      const isExpired = timeLeftMs <= 0;

                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '3px 10px',
                            borderRadius: '30px',
                            fontSize: '0.7rem',
                            fontWeight: '800',
                            background: 
                              isCompleted ? 'rgba(16, 185, 129, 0.08)' :
                              isPending ? 'rgba(245, 158, 11, 0.08)' :
                              'rgba(239, 68, 68, 0.08)',
                            color: 
                              isCompleted ? '#34d399' :
                              isPending ? '#fbbf24' :
                              '#f87171',
                            border: `1px solid ${
                              isCompleted ? 'rgba(16, 185, 129, 0.15)' :
                              isPending ? 'rgba(245, 158, 11, 0.15)' :
                              'rgba(239, 68, 68, 0.15)'
                            }`
                          }}>
                            <span style={{
                              width: '5px',
                              height: '5px',
                              borderRadius: '50%',
                              background: 
                                isCompleted ? '#10b981' :
                                isPending ? '#f59e0b' :
                                '#ef4444'
                            }} />
                            {tx.status}
                          </span>
                          {isPending && (
                            <span style={{ fontSize: '0.68rem', color: '#fbbf24', opacity: 0.95, fontFamily: 'monospace', fontWeight: '700' }}>
                              ⏱️ {isExpired ? '00:00' : formatRemainingTime(timeLeftMs)}
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}

export default UserTransactions;
