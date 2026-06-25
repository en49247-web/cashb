import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { fetchAdminDeposits, updateDepositStatusApi, fetchAdminWithdrawals, updateWithdrawalStatusApi } from '../../../services/admin';

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);

const CopyIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
);

const FilterIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
);

function AdminNewDeposits({ mode }) {
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [activeTab, setActiveTab] = useState(mode || 'deposits'); // 'deposits' or 'withdrawals'
  const [loading, setLoading] = useState(true);
  const [selectedProof, setSelectedProof] = useState(null);
  
  // Advanced Filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [assetFilter, setAssetFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [copyToast, setCopyToast] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const loadData = async () => {
    try {
      const deps = await fetchAdminDeposits();
      setDeposits(deps || []);
      const withs = await fetchAdminWithdrawals();
      setWithdrawals(withs || []);
    } catch (err) {
      console.error('Failed to load admin deposits/withdrawals data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (mode) {
      setActiveTab(mode);
    }
  }, [mode]);

  const handleUpdateStatus = async (itemId, status) => {
    const isWithdrawal = activeTab === 'withdrawals';
    const itemType = isWithdrawal ? 'withdrawal' : 'deposit';
    if (!window.confirm(`Are you sure you want to mark this ${itemType} request as ${status}?`)) {
      return;
    }
    
    setProcessingId(itemId);
    try {
      if (isWithdrawal) {
        await updateWithdrawalStatusApi(itemId, status);
      } else {
        await updateDepositStatusApi(itemId, status);
      }
      alert(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} request successfully ${status.toLowerCase()}!`);
      // Reload list
      await loadData();
    } catch (err) {
      alert(`Error updating ${itemType} status: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopyToast(activeTab === 'withdrawals' ? 'Address copied to clipboard!' : 'Transaction hash copied to clipboard!');
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
  const currentList = activeTab === 'deposits' ? deposits : withdrawals;
  const totalCount = currentList.length;
  const pendingCount = currentList.filter(d => d.status === 'Pending').length;
  const completedCount = currentList.filter(d => d.status === 'Completed').length;
  const rejectedCount = currentList.filter(d => d.status === 'Rejected').length;

  // Filtered Items
  const filteredItems = currentList.filter(d => {
    const term = search.toLowerCase();
    const matchesSearch = 
      d.userName?.toLowerCase().includes(term) ||
      (activeTab === 'deposits' ? d.txId?.toLowerCase().includes(term) : d.address?.toLowerCase().includes(term)) ||
      d.coin?.toLowerCase().includes(term);
      
    const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
    const matchesAsset = assetFilter === 'All' || d.coin?.toUpperCase().includes(assetFilter.toUpperCase());
    
    // Date filter
    let matchesDate = true;
    if (d.createdAt) {
      const orderTime = new Date(d.createdAt).getTime();
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

  if (loading) {
    return <div style={{ color: '#fff', textAlign: 'center', padding: '40px' }}>Loading queue data...</div>;
  }

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

      {/* Tab Switcher: Deposits vs Withdrawals */}
      {!mode && (
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          background: 'rgba(255,255,255,0.02)', 
          borderRadius: '10px', 
          padding: '6px', 
          border: '1px solid rgba(255,255,255,0.04)',
          maxWidth: '420px'
        }}>
          {[
            { key: 'deposits', label: '📥 Deposits Proofs', count: deposits.filter(d => d.status === 'Pending').length },
            { key: 'withdrawals', label: '📤 Withdrawal Requests', count: withdrawals.filter(w => w.status === 'Pending').length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setStatusFilter('All');
                setAssetFilter('All');
                setSearch('');
              }}
              style={{
                flex: 1,
                padding: '10px 16px',
                fontSize: '0.82rem',
                fontWeight: activeTab === tab.key ? '700' : '600',
                background: activeTab === tab.key ? 'var(--color-primary)' : 'transparent',
                color: activeTab === tab.key ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span style={{
                  background: activeTab === tab.key ? 'rgba(255,255,255,0.22)' : 'rgba(255, 23, 68, 0.2)',
                  color: activeTab === tab.key ? '#fff' : 'var(--color-primary)',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.7rem',
                  fontWeight: '800'
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Stats Cards Section */}
      <div className="admin-stats-grid">
        
        {/* Total Deposits */}
        <div className="glass-panel stats-card">
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #3b82f6, #2563eb)' }}></div>
          <span className="stats-card-title" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Total Requests</span>
          <div className="stats-card-value" style={{ fontSize: '1.6rem', fontWeight: '800', color: '#3b82f6' }}>{totalCount}</div>
          <span className="stats-card-sub" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {activeTab === 'deposits' ? 'Global deposit submissions' : 'Global withdrawal requests'}
          </span>
        </div>

        {/* Pending Requests */}
        <div className="glass-panel stats-card">
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #fbbf24, #f59e0b)' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stats-card-title" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Pending Verification</span>
            {pendingCount > 0 && (
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#fbbf24', boxShadow: '0 0 8px #fbbf24', animation: 'pulse 1.5s infinite' }}></span>
            )}
          </div>
          <div className="stats-card-value" style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fbbf24' }}>{pendingCount}</div>
          <span className="stats-card-sub" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {activeTab === 'deposits' ? 'Awaiting balance credit' : 'Awaiting review & release'}
          </span>
        </div>

        {/* Completed Count */}
        <div className="glass-panel stats-card">
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #10b981, #059669)' }}></div>
          <span className="stats-card-title" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Approved / Credited</span>
          <div className="stats-card-value" style={{ fontSize: '1.6rem', fontWeight: '800', color: '#10b981' }}>{completedCount}</div>
          <span className="stats-card-sub" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {activeTab === 'deposits' ? 'Successfully added to wallets' : 'Successfully sent to user'}
          </span>
        </div>

        {/* Rejected Count */}
        <div className="glass-panel stats-card">
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #ef4444, #dc2626)' }}></div>
          <span className="stats-card-title" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Rejected Requests</span>
          <div className="stats-card-value" style={{ fontSize: '1.6rem', fontWeight: '800', color: '#ef4444' }}>{rejectedCount}</div>
          <span className="stats-card-sub" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {activeTab === 'deposits' ? 'Invalid hash or mock screenshot' : 'Insufficient balance or rejected'}
          </span>
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
            placeholder="Search by customer name, hash, coin..." 
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
          📋 {activeTab === 'deposits' ? 'Crypto Deposits' : 'Crypto Withdrawals'} Queue ({filteredItems.length})
        </h3>
        
        <div style={{ overflowX: 'auto' }}>
          <table className="rates-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Date</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Customer</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Crypto Asset</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Amount</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                  {activeTab === 'deposits' ? 'TXID / Hash' : 'Destination Address'}
                </th>
                {activeTab === 'deposits' && <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Proof Screenshot</th>}
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((d) => (
                <tr 
                  key={d._id} 
                  style={{ 
                    cursor: 'pointer',
                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                    transition: 'background 0.2s'
                  }} 
                  onClick={() => setSelectedProof(d)}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 16px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{formatDateTime(d.createdAt)}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#fff' }}>{d.userName}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '2px', wordBreak: 'break-all' }}>{d.user?.email || 'N/A'}</div>
                    {d.user?.cxId && (
                      <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--color-primary)', fontFamily: 'monospace', marginTop: '2px' }}>
                        {d.user.cxId.toUpperCase()}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '0.85rem' }}>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: '800', 
                      padding: '2px 8px', 
                      borderRadius: '4px',
                      background: 'rgba(255,255,255,0.05)',
                      color: '#fff',
                      border: '1px solid rgba(255,255,255,0.08)'
                    }}>
                      {d.coin}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--color-primary)', fontWeight: '800', fontSize: '0.88rem' }}>{d.amount}</td>
                  
                  <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '0.8rem' }} onClick={(e) => e.stopPropagation()}>
                    {activeTab === 'deposits' ? (
                      d.txId ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ opacity: 0.8 }} title={d.txId}>{d.txId.length > 12 ? `${d.txId.slice(0, 12)}...` : d.txId}</span>
                          <button 
                            onClick={() => copyToClipboard(d.txId)}
                            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: '2px', display: 'inline-flex', alignItems: 'center', opacity: 0.7 }}
                            title="Copy Transaction Hash"
                          >
                            <CopyIcon />
                          </button>
                        </div>
                      ) : (
                        <span style={{ opacity: 0.4 }}>N/A</span>
                      )
                    ) : (
                      d.address ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ opacity: 0.8 }} title={d.address}>{d.address.length > 12 ? `${d.address.slice(0, 12)}...` : d.address}</span>
                          <button 
                            onClick={() => copyToClipboard(d.address)}
                            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: '2px', display: 'inline-flex', alignItems: 'center', opacity: 0.7 }}
                            title="Copy Destination Address"
                          >
                            <CopyIcon />
                          </button>
                        </div>
                      ) : (
                        <span style={{ opacity: 0.4 }}>N/A</span>
                      )
                    )}
                  </td>
 
                  {activeTab === 'deposits' && (
                    <td style={{ padding: '14px 16px' }} onClick={(e) => e.stopPropagation()}>
                      {d.screenshot ? (
                        <button
                          onClick={() => setSelectedProof(d)}
                          className="btn btn-secondary"
                          style={{ padding: '5px 10px', fontSize: '0.72rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                          📸 View Proof
                        </button>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>No Proof</span>
                      )}
                    </td>
                  )}
 
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      fontWeight: '800', 
                      padding: '4px 10px', 
                      borderRadius: '20px', 
                      textTransform: 'uppercase',
                      display: 'inline-block',
                      border: '1px solid',
                      background: d.status === 'Completed' ? 'rgba(16, 185, 129, 0.08)' : d.status === 'Pending' ? 'rgba(251, 191, 36, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                      borderColor: d.status === 'Completed' ? '#10b981' : d.status === 'Pending' ? '#fbbf24' : '#ef4444',
                      color: d.status === 'Completed' ? '#34d399' : d.status === 'Pending' ? '#fbbf24' : '#f87171',
                      boxShadow: d.status === 'Pending' ? '0 0 10px rgba(251, 191, 36, 0.1)' : 'none'
                    }}>
                      {d.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                    {d.status === 'Pending' ? (
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleUpdateStatus(d._id, 'Completed')}
                          disabled={processingId !== null}
                          className="btn btn-primary"
                          style={{ padding: '5px 10px', fontSize: '0.72rem', background: '#10b981', borderColor: '#10b981', color: '#fff', fontWeight: '700', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(d._id, 'Rejected')}
                          disabled={processingId !== null}
                          className="btn btn-secondary"
                          style={{ padding: '5px 10px', fontSize: '0.72rem', background: '#ef4444', borderColor: '#ef4444', color: '#fff', fontWeight: '700', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Processed</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={activeTab === 'deposits' ? "8" : "7"} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🔍</div>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#fff' }}>No {activeTab === 'deposits' ? 'Deposit' : 'Withdrawal'} Requests Found</div>
                    <div style={{ fontSize: '0.78rem', marginTop: '4px' }}>Try adjusting your search query, status filters, or date range.</div>
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

      {/* Proof/Details Modal Overlay */}
      {selectedProof && createPortal(
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(5, 7, 16, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '550px',
            padding: '24px',
            borderRadius: '12px',
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'linear-gradient(135deg, rgba(13, 18, 39, 0.95) 0%, rgba(6, 9, 20, 0.98) 100%)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.65)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
              <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: 'var(--color-primary)' }}>
                {selectedProof.txId ? 'Deposit Details' : 'Withdrawal Details'}: {selectedProof.userName} ({selectedProof.coin})
              </h4>
              <button 
                onClick={() => setSelectedProof(null)}
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer', opacity: 0.7 }}
              >
                &times;
              </button>
            </div>

            <div style={{ marginBottom: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', textAlign: 'left', fontSize: '0.85rem' }}>
              <div>
                <span style={{ opacity: 0.6 }}>Customer Name:</span>
                <div style={{ fontWeight: '700', color: '#fff' }}>{selectedProof.userName}</div>
              </div>
              <div>
                <span style={{ opacity: 0.6 }}>User ID:</span>
                <div style={{ fontWeight: '700', color: 'var(--color-primary)', fontFamily: 'monospace' }}>
                  {selectedProof.user?.cxId ? selectedProof.user.cxId.toUpperCase() : 'N/A'}
                </div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ opacity: 0.6 }}>Email Address:</span>
                <div style={{ fontWeight: '700', color: '#fff', wordBreak: 'break-all' }}>{selectedProof.user?.email || 'N/A'}</div>
              </div>
              <div>
                <span style={{ opacity: 0.6 }}>Amount:</span>
                <div style={{ fontWeight: '800', color: '#10b981', fontSize: '1.05rem' }}>{selectedProof.amount} {selectedProof.coin}</div>
              </div>
              <div>
                <span style={{ opacity: 0.6 }}>Date Requested:</span>
                <div style={{ fontWeight: '700', color: '#fff' }}>{formatDateTime(selectedProof.createdAt)}</div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ opacity: 0.6 }}>{selectedProof.txId ? 'Transaction Hash:' : 'Destination Wallet Address:'}</span>
                <div style={{ 
                  fontWeight: '700', 
                  wordBreak: 'break-all', 
                  fontFamily: 'monospace', 
                  color: 'var(--color-primary)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  marginTop: '4px',
                  background: 'rgba(0,0,0,0.2)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.04)'
                }}>
                  <span style={{ flex: 1 }}>{selectedProof.txId || selectedProof.address}</span>
                  <button 
                    onClick={() => copyToClipboard(selectedProof.txId || selectedProof.address)}
                    style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                    title="Copy Address"
                  >
                    <CopyIcon />
                  </button>
                </div>
              </div>
            </div>

            {selectedProof.screenshot && (
              <div style={{ background: '#000', borderRadius: '8px', padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '16px' }}>
                <img
                  src={selectedProof.screenshot}
                  alt="Deposit Screenshot Proof"
                  style={{ maxWidth: '100%', maxHeight: '320px', borderRadius: '4px', objectFit: 'contain' }}
                />
              </div>
            )}

            {!selectedProof.screenshot && (
              <div style={{ 
                background: 'rgba(255,255,255,0.01)', 
                borderRadius: '8px', 
                padding: '24px', 
                textAlign: 'center', 
                border: '1px dashed rgba(255,255,255,0.1)', 
                color: 'var(--text-secondary)',
                fontSize: '0.82rem',
                marginBottom: '16px'
              }}>
                ℹ️ Direct chain payout request. Verify the destination address on your terminal before approval.
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedProof(null)}
                className="btn btn-secondary"
                style={{ padding: '8px 16px', fontSize: '0.82rem', fontWeight: '700', borderRadius: '6px', cursor: 'pointer' }}
              >
                Close
              </button>
              {selectedProof.status === 'Pending' && (
                <>
                  <button
                    onClick={() => { handleUpdateStatus(selectedProof._id, 'Completed'); setSelectedProof(null); }}
                    className="btn btn-primary"
                    style={{ padding: '8px 16px', fontSize: '0.82rem', background: '#10b981', borderColor: '#10b981', color: '#fff', fontWeight: '700', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => { handleUpdateStatus(selectedProof._id, 'Rejected'); setSelectedProof(null); }}
                    className="btn btn-secondary"
                    style={{ padding: '8px 16px', fontSize: '0.82rem', background: '#ef4444', borderColor: '#ef4444', color: '#fff', fontWeight: '700', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default AdminNewDeposits;
