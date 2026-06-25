import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getBankFieldsByCountry } from '../../userpannel/UserPanel';

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);

const CopyIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
);

const FilterIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
);

function AdminOrders({
  orders,
  handleUpdateOrderStatus
}) {
  const [selectedOrder, setSelectedOrder] = useState(null);
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

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [assetFilter, setAssetFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [copyToast, setCopyToast] = useState('');

  const openDetails = (order) => {
    setSelectedOrder(order);
  };

  const closeDetails = () => {
    setSelectedOrder(null);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopyToast('Transaction hash copied to clipboard!');
    setTimeout(() => setCopyToast(''), 2000);
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      
      const pad = (num) => String(num).padStart(2, '0');
      
      const yyyy = d.getFullYear();
      const mm = pad(d.getMonth() + 1);
      const dd = pad(d.getDate());
      
      let hours = d.getHours();
      const minutes = pad(d.getMinutes());
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const strTime = pad(hours) + ':' + minutes + ' ' + ampm;
      
      return `${yyyy}-${mm}-${dd} ${strTime}`;
    } catch {
      return dateStr;
    }
  };

  // Dynamic Statistics
  const totalCount = orders.length;
  const pendingCount = orders.filter(o => o.status === 'Pending').length;
  const completedCount = orders.filter(o => o.status === 'Completed').length;
  const rejectedCount = orders.filter(o => o.status === 'Rejected').length;
  const totalPayoutVolume = orders.filter(o => o.status === 'Completed').reduce((sum, o) => sum + (o.inr || 0), 0);

  // Filtered Orders
  const filteredOrders = orders.filter(o => {
    const term = search.toLowerCase();
    const matchesSearch = 
      o.userName?.toLowerCase().includes(term) ||
      o.orderId?.toLowerCase().includes(term) ||
      (o.txId && o.txId.toLowerCase().includes(term));
      
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    const matchesAsset = assetFilter === 'All' || o.coin?.toUpperCase().includes(assetFilter.toUpperCase());
    
    // Date filter
    let matchesDate = true;
    if (o.date) {
      const orderTime = new Date(o.date).getTime();
      if (startDate) {
        const start = new Date(startDate + 'T00:00:00').getTime();
        if (orderTime < start) matchesDate = false;
      }
      if (endDate) {
        const end = new Date(endDate + 'T23:59:59').getTime();
        if (orderTime > end) matchesDate = false;
      }
    }
    
    return matchesSearch && matchesStatus && matchesAsset && matchesDate;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <style>{`
        .admin-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        .stats-card {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.06);
          background: linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%);
          border-radius: 12px;
        }
        @media (max-width: 768px) {
          .admin-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
          .stats-card {
            padding: 14px 16px !important;
            gap: 6px !important;
          }
          .stats-card-title {
            font-size: 0.75rem !important;
          }
          .stats-card-value {
            font-size: 1.35rem !important;
          }
          .stats-card-sub {
            font-size: 0.68rem !important;
          }
        }
      `}</style>

      {/* Stats Cards Section */}
      <div className="admin-stats-grid">
        
        {/* Total Volume */}
        <div className="glass-panel stats-card">
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #10b981, #059669)' }}></div>
          <span className="stats-card-title" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Total Approved Volume</span>
          <div className="stats-card-value" style={{ fontSize: '1.6rem', fontWeight: '800', color: '#10b981' }}>₹{totalPayoutVolume.toLocaleString('en-IN')}</div>
          <span className="stats-card-sub" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>From {completedCount} approved payouts</span>
        </div>

        {/* Pending Requests */}
        <div className="glass-panel stats-card">
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #fbbf24, #f59e0b)' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stats-card-title" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Pending Orders</span>
            {pendingCount > 0 && (
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#fbbf24', boxShadow: '0 0 8px #fbbf24', animation: 'pulse 1.5s infinite' }}></span>
            )}
          </div>
          <div className="stats-card-value" style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fbbf24' }}>{pendingCount}</div>
          <span className="stats-card-sub" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Awaiting compliance review</span>
        </div>

        {/* Approved Count */}
        <div className="glass-panel stats-card">
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #3b82f6, #2563eb)' }}></div>
          <span className="stats-card-title" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Completed Orders</span>
          <div className="stats-card-value" style={{ fontSize: '1.6rem', fontWeight: '800', color: '#3b82f6' }}>{completedCount}</div>
          <span className="stats-card-sub" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Released to customer bank</span>
        </div>

        {/* Rejected Count */}
        <div className="glass-panel stats-card">
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #ef4444, #dc2626)' }}></div>
          <span className="stats-card-title" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Rejected Orders</span>
          <div className="stats-card-value" style={{ fontSize: '1.6rem', fontWeight: '800', color: '#ef4444' }}>{rejectedCount}</div>
          <span className="stats-card-sub" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Returned to client balances</span>
        </div>

      </div>

      {/* Search and Filters Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)' }}>
        
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', flex: '1', minWidth: '280px', position: 'relative' }}>
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
            <SearchIcon />
          </span>
          <input 
            type="text" 
            placeholder="Search by Order ID, customer name, hash..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '10px 16px 10px 40px', 
              background: 'rgba(0,0,0,0.25)', 
              border: '1px solid rgba(255,255,255,0.08)', 
              borderRadius: '8px', 
              color: '#fff', 
              fontSize: '0.82rem',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
          />
        </div>
        
        {/* Status filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginRight: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FilterIcon /> Status:
          </span>
          {['All', 'Pending', 'Completed', 'Rejected'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                padding: '6px 12px',
                fontSize: '0.78rem',
                fontWeight: '700',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: statusFilter === status ? 'var(--color-primary)' : 'rgba(255,255,255,0.06)',
                background: statusFilter === status ? 'rgba(255, 23, 68, 0.12)' : 'rgba(255,255,255,0.02)',
                color: statusFilter === status ? 'var(--color-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Asset filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginRight: '6px' }}>Asset:</span>
          {['All', 'USDT', 'BTC', 'ETH', 'USDC', 'TRX'].map(asset => (
            <button
              key={asset}
              onClick={() => setAssetFilter(asset)}
              style={{
                padding: '6px 12px',
                fontSize: '0.78rem',
                fontWeight: '700',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: assetFilter === asset ? 'var(--color-primary)' : 'rgba(255,255,255,0.06)',
                background: assetFilter === asset ? 'rgba(255, 23, 68, 0.12)' : 'rgba(255,255,255,0.02)',
                color: assetFilter === asset ? 'var(--color-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {asset}
            </button>
          ))}
        </div>

        {/* Date Range filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            📅 Date Range:
          </span>
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ 
              background: 'rgba(0,0,0,0.25)', 
              border: '1px solid rgba(255,255,255,0.08)', 
              borderRadius: '6px', 
              color: '#fff', 
              fontSize: '0.78rem',
              padding: '5px 8px',
              colorScheme: 'dark',
              outline: 'none'
            }}
          />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>to</span>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ 
              background: 'rgba(0,0,0,0.25)', 
              border: '1px solid rgba(255,255,255,0.08)', 
              borderRadius: '6px', 
              color: '#fff', 
              fontSize: '0.78rem',
              padding: '5px 8px',
              colorScheme: 'dark',
              outline: 'none'
            }}
          />
          {(startDate || endDate) && (
            <button
              onClick={() => { setStartDate(''); setEndDate(''); }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-primary)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: '4px 8px'
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Main Table Container */}
      <div className="glass-panel" style={{ padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '800', marginBottom: '18px', textTransform: 'uppercase', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          📋 Global Exchange Orders ({filteredOrders.length})
        </h3>
        
        <div style={{ overflowX: 'auto' }}>
          <table className="rates-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Date</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Order ID</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Customer</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Asset</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>INR Value</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Payout Option</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>TxID / Hash</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(o => (
                <tr 
                  key={o.id} 
                  style={{ 
                    cursor: 'pointer',
                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                    transition: 'background 0.2s'
                  }} 
                  onClick={() => openDetails(o)}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 16px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{formatDateTime(o.date)}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontWeight: '800', color: 'var(--color-primary)', fontSize: '0.85rem' }}>
                    {o.orderId}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#fff' }}>{o.userName}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '2px', wordBreak: 'break-all' }}>{o.user?.email || 'N/A'}</div>
                    {o.user?.cxId && (
                      <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--color-primary)', fontFamily: 'monospace', marginTop: '2px' }}>
                        {o.user.cxId.toUpperCase()}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '0.85rem' }}>
                    <strong>{o.amount}</strong> <span style={{ opacity: 0.6, fontSize: '0.75rem' }}>{o.coin}</span>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#10b981', fontWeight: '800', fontSize: '0.88rem' }}>₹{o.inr.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ 
                      fontSize: '0.74rem', 
                      fontWeight: '800', 
                      padding: '4px 8px', 
                      borderRadius: '6px', 
                      textTransform: 'capitalize',
                      background: o.payoutOption === 'CDM deposit' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(168, 85, 247, 0.08)',
                      color: o.payoutOption === 'CDM deposit' ? '#fbbf24' : '#c084fc',
                      border: '1px solid',
                      borderColor: o.payoutOption === 'CDM deposit' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(168, 85, 247, 0.15)'
                    }}>
                      {o.payoutOption || 'wire transfer'}
                    </span>
                  </td>
                  
                  <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '0.8rem' }} onClick={(e) => e.stopPropagation()}>
                    {o.txId ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ opacity: 0.8 }} title={o.txId}>{o.txId.length > 12 ? `${o.txId.slice(0, 12)}...` : o.txId}</span>
                        <button 
                          onClick={() => copyToClipboard(o.txId)}
                          style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: '2px', display: 'inline-flex', alignItems: 'center', opacity: 0.7 }}
                          title="Copy Transaction Hash"
                        >
                          <CopyIcon />
                        </button>
                      </div>
                    ) : (
                      <span style={{ opacity: 0.4 }}>N/A</span>
                    )}
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                      <span style={{ 
                        fontSize: '0.7rem', 
                        fontWeight: '800', 
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        textTransform: 'uppercase',
                        display: 'inline-block',
                        border: '1px solid',
                        background: o.status === 'Completed' ? 'rgba(16, 185, 129, 0.08)' : o.status === 'Pending' ? 'rgba(251, 191, 36, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                        borderColor: o.status === 'Completed' ? '#10b981' : o.status === 'Pending' ? '#fbbf24' : '#ef4444',
                        color: o.status === 'Completed' ? '#34d399' : o.status === 'Pending' ? '#fbbf24' : '#f87171',
                        boxShadow: o.status === 'Pending' ? '0 0 10px rgba(251, 191, 36, 0.1)' : 'none'
                      }}>
                        {o.status}
                      </span>
                      {o.status === 'Pending' && (() => {
                        const createdAtMs = new Date(o.date).getTime();
                        const timeElapsed = timeTick - createdAtMs;
                        const timeLeftMs = 1800000 - timeElapsed;
                        const isExpired = timeLeftMs <= 0;

                        return (
                          <span style={{ fontSize: '0.68rem', color: '#fbbf24', opacity: 0.95, fontFamily: 'monospace', fontWeight: '700', paddingLeft: '4px' }}>
                            ⏱️ {isExpired ? '00:00' : formatRemainingTime(timeLeftMs)}
                          </span>
                        );
                      })()}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => openDetails(o)} 
                      className="btn btn-secondary" 
                      style={{ padding: '5px 10px', fontSize: '0.72rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      👁️ View Details
                    </button>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🔍</div>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#fff' }}>No Matching Orders Found</div>
                    <div style={{ fontSize: '0.78rem', marginTop: '4px' }}>Try adjusting your search query or status filters.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast notification */}
      {copyToast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'rgba(16, 185, 129, 0.95)',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '0.85rem',
          fontWeight: '700',
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
          zIndex: 1000000
        }}>
          {copyToast}
        </div>
      )}

      {/* Details & Proof Screenshot Modal */}
      {selectedOrder && createPortal(
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(5, 7, 16, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '880px',
            maxHeight: '92vh',
            overflowY: 'auto',
            padding: '28px',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'linear-gradient(135deg, rgba(13, 18, 39, 0.95) 0%, rgba(6, 9, 20, 0.98) 100%)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.65)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
              <h4 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: 'var(--color-primary)' }}>
                Order Details: {selectedOrder.orderId}
              </h4>
              <button 
                onClick={closeDetails} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#fff', 
                  fontSize: '1.6rem', 
                  cursor: 'pointer', 
                  opacity: 0.7,
                  lineHeight: 1
                }}
              >
                &times;
              </button>
            </div>

            {/* Split Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', 
              gap: '24px', 
              marginBottom: '24px' 
            }}>
              
              {/* Left Pane: Customer & Bank details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '16px', borderRadius: '10px' }}>
                  <div>
                    <label className="input-label" style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.5, marginBottom: '4px', display: 'block' }}>Customer Name</label>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#fff' }}>{selectedOrder.userName}</div>
                  </div>
                  <div>
                    <label className="input-label" style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.5, marginBottom: '4px', display: 'block' }}>User ID</label>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--color-primary)', fontFamily: 'monospace' }}>{selectedOrder.user?.cxId ? selectedOrder.user.cxId.toUpperCase() : 'N/A'}</div>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="input-label" style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.5, marginBottom: '4px', display: 'block' }}>Email Address</label>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#fff', wordBreak: 'break-all' }}>{selectedOrder.user?.email || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="input-label" style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.5, marginBottom: '4px', display: 'block' }}>Date Submitted</label>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#fff' }}>{selectedOrder.date}</div>
                  </div>
                  <div>
                    <label className="input-label" style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.5, marginBottom: '4px', display: 'block' }}>Asset Amount</label>
                    <div style={{ fontWeight: '800', fontSize: '0.95rem', color: 'var(--color-primary)' }}>
                      {selectedOrder.amount} {selectedOrder.coin}
                    </div>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="input-label" style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.5, marginBottom: '4px', display: 'block' }}>INR Payout</label>
                    <div style={{ fontWeight: '800', fontSize: '0.95rem', color: '#4ade80' }}>
                      ₹{selectedOrder.inr.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Target Payout Bank Account */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '16px', borderRadius: '10px' }}>
                  <h5 style={{ fontSize: '0.8rem', fontWeight: '800', margin: '0 0 12px 0', textTransform: 'uppercase', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    🏦 Target Payout Bank Account
                  </h5>
                  {selectedOrder.bankDetails ? (() => {
                    const countryBankConfig = getBankFieldsByCountry(selectedOrder.countryCode);
                    const numField = countryBankConfig.fields.find(f => f.key === 'number') || { label: 'Account Number' };
                    const codeField = countryBankConfig.fields.find(f => f.key === 'ifsc') || { label: 'IFSC Code' };
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '6px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Bank Name</span>
                          <strong style={{ color: '#fff' }}>{selectedOrder.bankDetails.name}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '6px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Region/Country</span>
                          <strong style={{ color: '#fff' }}>{countryBankConfig.countryName}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '6px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>{numField.label}</span>
                          <strong style={{ color: '#fff', fontFamily: 'monospace' }}>{selectedOrder.bankDetails.number}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '6px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>{codeField.label}</span>
                          <strong style={{ color: '#fff', fontFamily: 'monospace' }}>{selectedOrder.bankDetails.ifsc}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '2px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Payout Option</span>
                          <strong style={{ color: '#fbbf24', textTransform: 'capitalize' }}>{selectedOrder.payoutOption || 'wire transfer'}</strong>
                        </div>
                      </div>
                    );
                  })() : (
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No bank details provided.</div>
                  )}
                </div>
              </div>

              {/* Right Pane: Blockchain & Screenshot proof */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Blockchain details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label className="input-label" style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.5, display: 'block', marginBottom: '4px' }}>
                      Blockchain TxID / Reference ID
                    </label>
                    <div style={{ 
                      fontFamily: 'monospace', 
                      background: 'rgba(0,0,0,0.2)', 
                      padding: '8px 12px', 
                      borderRadius: '6px', 
                      fontSize: '0.78rem', 
                      wordBreak: 'break-all',
                      color: selectedOrder.txId === 'DIRECT_EXCHANGE' ? '#10b981' : 'var(--color-primary)',
                      fontWeight: selectedOrder.txId === 'DIRECT_EXCHANGE' ? '700' : 'normal',
                      border: '1px solid rgba(255,255,255,0.04)'
                    }}>
                      {selectedOrder.txId === 'DIRECT_EXCHANGE' ? '⚡ Internal Balance Deduction (Direct Exchange)' : (selectedOrder.txId || 'N/A')}
                    </div>
                  </div>

                  {selectedOrder.depositAddress && selectedOrder.depositAddress !== 'N/A' && (
                    <div>
                      <label className="input-label" style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.5, display: 'block', marginBottom: '4px' }}>
                        Assigned Deposit Wallet
                      </label>
                      <div style={{ 
                        fontFamily: 'monospace', 
                        background: 'rgba(0,0,0,0.2)', 
                        padding: '8px 12px', 
                        borderRadius: '6px', 
                        fontSize: '0.78rem', 
                        wordBreak: 'break-all',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.04)'
                      }}>
                        {selectedOrder.depositAddress}
                      </div>
                    </div>
                  )}
                </div>

                {/* Screenshot */}
                <div>
                  <label className="input-label" style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.5, display: 'block', marginBottom: '6px' }}>
                    Payment Proof Screenshot
                  </label>
                  <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.15)', borderRadius: '8px', padding: selectedOrder.screenshot === 'direct' ? '0' : '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    {selectedOrder.screenshot === 'direct' ? (
                      <div style={{ padding: '24px 16px', background: 'rgba(16, 185, 129, 0.04)', color: '#34d399', fontSize: '0.82rem', lineHeight: '1.5', textAlign: 'left', borderRadius: '8px' }}>
                        ⚡ <strong>Direct Balance Exchange Order</strong>
                        <div style={{ marginTop: '6px', color: 'rgba(255,255,255,0.6)', fontSize: '0.76rem' }}>
                          Customer paid by deducting their internal wallet balance directly. No proof screenshot upload is required.
                        </div>
                      </div>
                    ) : selectedOrder.screenshot ? (
                      <img 
                        src={selectedOrder.screenshot} 
                        alt="Transaction Proof" 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '190px', 
                          borderRadius: '6px', 
                          objectFit: 'contain',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
                        }} 
                      />
                    ) : (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', padding: '24px' }}>
                        No proof screenshot uploaded.
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Footer Actions */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              borderTop: '1px solid rgba(255,255,255,0.08)', 
              paddingTop: '20px',
              marginTop: 'auto',
              paddingBottom: '4px' 
            }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Status: <strong style={{ color: selectedOrder.status === 'Completed' ? '#34d399' : selectedOrder.status === 'Pending' ? '#fbbf24' : '#f87171' }}>{selectedOrder.status}</strong>
                {selectedOrder.status === 'Pending' && (() => {
                  const createdAtMs = new Date(selectedOrder.date).getTime();
                  const timeElapsed = timeTick - createdAtMs;
                  const timeLeftMs = 1800000 - timeElapsed;
                  const isExpired = timeLeftMs <= 0;

                  return (
                    <span style={{ fontSize: '0.78rem', color: '#fbbf24', fontFamily: 'monospace', fontWeight: '700' }}>
                      (⏱️ {isExpired ? '00:00' : formatRemainingTime(timeLeftMs)} remaining)
                    </span>
                  );
                })()}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {selectedOrder.status !== 'Pending' && (
                  <button 
                    onClick={() => {
                      handleUpdateOrderStatus(selectedOrder.id, 'Pending');
                      closeDetails();
                    }}
                    className="btn btn-warning" 
                    style={{ padding: '10px 18px', fontSize: '0.82rem', fontWeight: '700', borderRadius: '8px', background: '#fbbf24', borderColor: '#fbbf24', color: '#090d16', cursor: 'pointer' }}
                  >
                    Reset to Pending
                  </button>
                )}
                {selectedOrder.status !== 'Completed' && (
                  <button 
                    onClick={() => {
                      handleUpdateOrderStatus(selectedOrder.id, 'Completed');
                      closeDetails();
                    }}
                    className="btn btn-primary" 
                    style={{ padding: '10px 18px', fontSize: '0.82rem', fontWeight: '700', borderRadius: '8px', background: '#10b981', borderColor: '#10b981', color: '#fff', cursor: 'pointer' }}
                  >
                    Approve Order
                  </button>
                )}
                {selectedOrder.status !== 'Rejected' && (
                  <button 
                    onClick={() => {
                      handleUpdateOrderStatus(selectedOrder.id, 'Rejected');
                      closeDetails();
                    }}
                    className="btn btn-danger" 
                    style={{ padding: '10px 18px', fontSize: '0.82rem', fontWeight: '700', borderRadius: '8px', background: '#ef4444', borderColor: '#ef4444', color: '#fff', cursor: 'pointer' }}
                  >
                    Reject Order
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default AdminOrders;
