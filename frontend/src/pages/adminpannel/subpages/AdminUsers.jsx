import React, { useState } from 'react';

// Map country codes to friendly names
const getCountryName = (code) => {
  if (!code) return 'India';
  const c = code.trim();
  if (c === '+91') return 'India';
  if (c === '+1') return 'USA';
  if (c === '+44') return 'UK';
  if (c === '+92') return 'Pakistan';
  return c;
};

function AdminUsers({ users, onToggleStatus, onDeleteUser }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [kycFilter, setKycFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Filter & Search Logic
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.includes(searchTerm)) ||
      (user.cxId && user.cxId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      String(user.id).toLowerCase().includes(searchTerm.toLowerCase());

    const matchesKyc = kycFilter === 'All' || user.kyc === kycFilter;
    const matchesStatus = statusFilter === 'All' || user.status === statusFilter;

    return matchesSearch && matchesKyc && matchesStatus;
  });

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>Registered Customers Directory</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Manage user accounts, view KYC verification states, and adjust platform access.
          </p>
        </div>
        <div style={{ background: 'rgba(255, 23, 68, 0.08)', color: 'var(--danger)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', border: '1px solid rgba(255, 23, 68, 0.15)' }}>
          Total Users: {users.length}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by name, email, phone, ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="modal-input"
          style={{ flex: 1, minWidth: '240px', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#fff' }}
        />
        
        <select
          value={kycFilter}
          onChange={(e) => setKycFilter(e.target.value)}
          className="modal-input"
          style={{ width: '160px', padding: '10px', background: 'rgba(11, 14, 26, 0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#fff' }}
        >
          <option value="All">All KYC States</option>
          <option value="Verified">Verified</option>
          <option value="Pending">Pending</option>
          <option value="Unverified">Unverified</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="modal-input"
          style={{ width: '160px', padding: '10px', background: 'rgba(11, 14, 26, 0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', color: '#fff' }}
        >
          <option value="All">All Account States</option>
          <option value="Active">Active</option>
          <option value="Blocked">Blocked</option>
        </select>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="rates-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>User ID</th>
              <th style={{ textAlign: 'left' }}>Full Name</th>
              <th style={{ textAlign: 'left' }}>Email Address</th>
              <th style={{ textAlign: 'left' }}>Country</th>
              <th style={{ textAlign: 'left' }}>Phone Number</th>
              <th style={{ textAlign: 'left' }}>KYC Status</th>
              <th style={{ textAlign: 'left' }}>Account Status</th>
              <th style={{ textAlign: 'left', minWidth: '130px' }}>Wallet Balances</th>
              <th style={{ textAlign: 'left' }}>Exchange Volume</th>
              <th style={{ textAlign: 'left' }}>Reg Date</th>
              <th style={{ textAlign: 'left', width: '160px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="11" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No users found matching the search criteria.
                </td>
              </tr>
            ) : (
              filteredUsers.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: '700', fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--color-primary)' }}>
                    {u.cxId ? u.cxId.toUpperCase() : `#${String(u.id).substring(0, 8).toUpperCase()}`}
                  </td>
                  <td style={{ fontWeight: '700' }}>{u.name}</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td>
                    <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                      {getCountryName(u.countryCode)}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>
                    {u.phone ? `${u.countryCode || ''} ${u.phone}` : '-'}
                  </td>
                  <td>
                    <span className={`badge ${u.kyc === 'Verified' ? 'badge-success' : u.kyc === 'Pending' ? 'badge-warning' : 'badge-danger'}`}>
                      {u.kyc}
                    </span>
                  </td>
                  <td>
                    <span 
                      className="badge" 
                      style={{ 
                        background: u.status === 'Active' ? 'rgba(74, 222, 128, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: u.status === 'Active' ? '#4ade80' : '#ef4444'
                      }}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.78rem', padding: '4px 8px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '1px' }}>
                        <span style={{ color: '#22c55e', fontWeight: '700' }}>USDT:</span>
                        <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>{u.balances?.USDT ?? 0}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '1px' }}>
                        <span style={{ color: '#3b82f6', fontWeight: '700' }}>USDC:</span>
                        <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>{u.balances?.USDC ?? 0}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '1px' }}>
                        <span style={{ color: '#f59e0b', fontWeight: '700' }}>BTC:</span>
                        <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>{u.balances?.BTC ?? 0}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                        <span style={{ color: '#a855f7', fontWeight: '700' }}>ETH:</span>
                        <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>{u.balances?.ETH ?? 0}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: '600' }}>₹{u.volume.toLocaleString('en-IN')}</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{u.date}</td>
                  <td>
                    {u.role !== 'admin' ? (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                          onClick={() => onToggleStatus(u.id, u.status)}
                          className="btn btn-secondary" 
                          style={{ 
                            padding: '6px 10px', 
                            fontSize: '0.72rem', 
                            flex: 1,
                            color: u.status === 'Active' ? 'var(--danger)' : 'var(--success)',
                            borderColor: u.status === 'Active' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(74, 222, 128, 0.2)',
                            background: 'transparent',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {u.status === 'Active' ? 'Block' : 'Unblock'}
                        </button>
                        <button 
                          onClick={() => onDeleteUser(u.id)}
                          className="btn btn-secondary" 
                          style={{ 
                            padding: '6px 10px', 
                            fontSize: '0.72rem', 
                            color: '#ff4d4d',
                            borderColor: 'rgba(255, 77, 77, 0.2)',
                            background: 'rgba(255, 77, 77, 0.05)',
                            cursor: 'pointer'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    ) : (
                      <span 
                        style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: '700', 
                          color: 'var(--danger)',
                          background: 'rgba(255, 23, 68, 0.08)',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          display: 'inline-block',
                          textAlign: 'center',
                          width: '100%',
                          border: '1px solid rgba(255, 23, 68, 0.15)'
                        }}
                      >
                        Protected
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminUsers;
