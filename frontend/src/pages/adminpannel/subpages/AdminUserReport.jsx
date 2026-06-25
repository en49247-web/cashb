import React, { useState, useEffect } from 'react';
import { fetchUserReport } from '../../../services/admin';

function AdminUserReport({ users = [] }) {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'deposits', 'withdrawals', 'referrals'

  useEffect(() => {
    if (selectedUserId) {
      loadUserReport(selectedUserId);
    } else {
      setReport(null);
    }
  }, [selectedUserId]);

  const loadUserReport = async (id) => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchUserReport(id);
      setReport(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load user report history.');
    } finally {
      setLoading(false);
    }
  };

  // Filter out admins and apply search query
  const customerUsers = users.filter(u => u.role !== 'admin');
  const filteredUsers = customerUsers.filter(u => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.cxId && u.cxId.toLowerCase().includes(q)) ||
      (u.id && u.id.toLowerCase().includes(q))
    );
  }).slice(0, 100);

  const activeTabContent = () => {
    if (!report) return null;

    switch (activeTab) {
      case 'orders':
        return (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', height: '40px' }}>
                  <th style={thStyle}>Order ID</th>
                  <th style={thStyle}>Asset</th>
                  <th style={thStyle}>Amount</th>
                  <th style={thStyle}>INR Value</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Date</th>
                </tr>
              </thead>
              <tbody>
                {report.orders.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={noDataStyle}>No exchange orders found for this user.</td>
                  </tr>
                ) : (
                  report.orders.map((o, idx) => (
                    <tr key={idx} style={trStyle}>
                      <td style={tdStyle} className="font-monospace text-primary">#{o._id.toString().slice(-4).toUpperCase()}</td>
                      <td style={tdStyle}>{o.coin}</td>
                      <td style={tdStyle}>{o.amount}</td>
                      <td style={tdStyle}>₹{Number(o.inr).toLocaleString('en-IN')}</td>
                      <td style={tdStyle}>
                        <span className={`status-badge ${o.status.toLowerCase()}`}>{o.status}</span>
                      </td>
                      <td style={tdStyle}>{new Date(o.createdAt).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        );
      case 'deposits':
        return (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', height: '40px' }}>
                  <th style={thStyle}>Asset</th>
                  <th style={thStyle}>Amount</th>
                  <th style={thStyle}>Transaction ID</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Date</th>
                </tr>
              </thead>
              <tbody>
                {report.deposits.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={noDataStyle}>No deposit transactions found.</td>
                  </tr>
                ) : (
                  report.deposits.map((d, idx) => (
                    <tr key={idx} style={trStyle}>
                      <td style={tdStyle}>{d.coin}</td>
                      <td style={tdStyle}>{d.amount}</td>
                      <td style={tdStyle} className="font-monospace">{d.txId}</td>
                      <td style={tdStyle}>
                        <span className={`status-badge ${d.status.toLowerCase()}`}>{d.status}</span>
                      </td>
                      <td style={tdStyle}>{new Date(d.createdAt).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        );
      case 'withdrawals':
        return (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', height: '40px' }}>
                  <th style={thStyle}>Asset</th>
                  <th style={thStyle}>Amount</th>
                  <th style={thStyle}>Destination Address</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Date</th>
                </tr>
              </thead>
              <tbody>
                {report.withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={noDataStyle}>No withdrawal transactions found.</td>
                  </tr>
                ) : (
                  report.withdrawals.map((w, idx) => (
                    <tr key={idx} style={trStyle}>
                      <td style={tdStyle}>{w.coin}</td>
                      <td style={tdStyle}>{w.amount}</td>
                      <td style={tdStyle} className="font-monospace" title={w.address}>
                        {w.address ? `${w.address.slice(0, 10)}...${w.address.slice(-6)}` : 'N/A'}
                      </td>
                      <td style={tdStyle}>
                        <span className={`status-badge ${w.status.toLowerCase()}`}>{w.status}</span>
                      </td>
                      <td style={tdStyle}>{new Date(w.createdAt).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        );
      case 'referrals':
        return (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', height: '40px' }}>
                  <th style={thStyle}>CX ID</th>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>KYC Status</th>
                  <th style={thStyle}>Date Joined</th>
                </tr>
              </thead>
              <tbody>
                {report.referrals.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={noDataStyle}>This user has not referred any signups yet.</td>
                  </tr>
                ) : (
                  report.referrals.map((r, idx) => (
                    <tr key={idx} style={trStyle}>
                      <td style={tdStyle} className="font-monospace text-primary">{r.cxId || 'N/A'}</td>
                      <td style={tdStyle}>{r.name}</td>
                      <td style={tdStyle}>{r.email}</td>
                      <td style={tdStyle}>
                        <span className={`status-badge ${r.kycStatus.toLowerCase()}`}>{r.kycStatus}</span>
                      </td>
                      <td style={tdStyle}>{new Date(r.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <style>{`
        .status-badge {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .status-badge.verified, .status-badge.completed, .status-badge.active {
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: #10b981;
        }
        .status-badge.pending {
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.2);
          color: #f59e0b;
        }
        .status-badge.unverified, .status-badge.rejected, .status-badge.blocked {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }
        .report-tab-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          padding: 10px 16px;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }
        .report-tab-btn.active {
          color: var(--danger);
          border-bottom-color: var(--danger);
        }
        .user-select-row {
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .user-select-row:hover {
          background-color: rgba(255, 255, 255, 0.04) !important;
        }
        .user-select-row.selected {
          background-color: rgba(255, 23, 68, 0.06) !important;
          border-left: 3px solid var(--danger);
        }
      `}</style>

      {/* Search & Direct User List Panel */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '8px' }}>User Activity & Audit Reports</h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
          Select a customer account to inspect their comprehensive transaction ledger, deposit/withdrawal history, wallet allocations, referral statuses, and live exchange limits.
        </p>

        {/* Search Input */}
        <div style={{ marginBottom: '18px' }}>
          <input
            type="text"
            className="step-input"
            placeholder="Search by Name, Email, CX ID or User ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: '#fff', padding: '12px 16px', fontSize: '0.85rem' }}
          />
        </div>

        {/* User List Table */}
        <div style={{ overflowX: 'auto', maxHeight: '320px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', height: '40px', background: 'rgba(0,0,0,0.2)' }}>
                <th style={{ ...thStyle, paddingLeft: '16px' }}>CX ID</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>KYC Status</th>
                <th style={{ ...thStyle, textAlign: 'right', paddingRight: '16px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={noDataStyle}>No registered customers match your search criteria.</td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className={`user-select-row ${selectedUserId === u.id ? 'selected' : ''}`}
                    onClick={() => setSelectedUserId(u.id)}
                    style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.02)' }}
                  >
                    <td style={{ ...tdStyle, paddingLeft: '16px' }} className="font-monospace text-primary">{u.cxId || 'N/A'}</td>
                    <td style={tdStyle}>{u.name}</td>
                    <td style={tdStyle} className="font-monospace">{u.email}</td>
                    <td style={tdStyle}>
                      <span className={`status-badge ${u.status.toLowerCase()}`}>{u.status}</span>
                    </td>
                    <td style={tdStyle}>
                      <span className={`status-badge ${u.kyc.toLowerCase()}`}>{u.kyc}</span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right', paddingRight: '16px' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '6px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUserId(u.id);
                        }}
                      >
                        {selectedUserId === u.id ? 'Viewing Report' : 'View Report'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '10px', textAlign: 'right' }}>
          Showing {filteredUsers.length} of {customerUsers.length} users.
        </div>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '10px',
          padding: '12px 16px',
          fontSize: '0.82rem',
          color: '#ef4444'
        }}>
          ⚠️ {error}
        </div>
      )}

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
          <div className="status-spinner" style={{ width: '40px', height: '40px', borderColor: 'var(--danger) transparent transparent transparent' }} />
        </div>
      )}

      {report && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* User Profile, Wallet & Limits Summary Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            
            {/* Account Profile Card */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '16px', color: 'var(--danger)' }}>Account Profile</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                <div style={infoRowStyle}>
                  <span style={{ color: 'var(--text-muted)' }}>Full Name:</span>
                  <span style={{ fontWeight: '700' }}>{report.user.name}</span>
                </div>
                <div style={infoRowStyle}>
                  <span style={{ color: 'var(--text-muted)' }}>Email Address:</span>
                  <span style={{ fontWeight: '600' }} className="font-monospace">{report.user.email}</span>
                </div>
                <div style={infoRowStyle}>
                  <span style={{ color: 'var(--text-muted)' }}>Phone Number:</span>
                  <span>{report.user.countryCode} {report.user.phone}</span>
                </div>
                <div style={infoRowStyle}>
                  <span style={{ color: 'var(--text-muted)' }}>Unique CX ID:</span>
                  <span style={{ fontWeight: '800', color: 'var(--danger)' }} className="font-monospace">{report.user.cxId}</span>
                </div>
                <div style={infoRowStyle}>
                  <span style={{ color: 'var(--text-muted)' }}>KYC Status:</span>
                  <span className={`status-badge ${report.user.kycStatus.toLowerCase()}`}>{report.user.kycStatus}</span>
                </div>
                <div style={infoRowStyle}>
                  <span style={{ color: 'var(--text-muted)' }}>Joined Date:</span>
                  <span>{new Date(report.user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Wallet & Referral Stats Card */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '16px', color: 'var(--danger)' }}>Wallet & Referrals</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                <div style={infoRowStyle}>
                  <span style={{ color: 'var(--text-muted)' }}>Main USDT Balance:</span>
                  <span style={{ fontWeight: '800', color: '#fff', fontFamily: 'monospace' }}>
                    {(report.user.balances?.USDT ?? 0).toFixed(4)} USDT
                  </span>
                </div>
                <div style={infoRowStyle}>
                  <span style={{ color: 'var(--text-muted)' }}>Referral Wallet Balance:</span>
                  <span style={{ fontWeight: '800', color: 'var(--danger)', fontFamily: 'monospace' }}>
                    {(report.user.referralWallet ?? 0).toFixed(4)} USDT
                  </span>
                </div>
                <div style={infoRowStyle}>
                  <span style={{ color: 'var(--text-muted)' }}>Total Referral Earnings:</span>
                  <span style={{ fontWeight: '700', fontFamily: 'monospace' }}>
                    {(report.user.referralEarnings ?? 0).toFixed(4)} USDT
                  </span>
                </div>
                <div style={infoRowStyle}>
                  <span style={{ color: 'var(--text-muted)' }}>Referral Code:</span>
                  <span style={{ fontWeight: '800', letterSpacing: '0.5px' }} className="font-monospace text-primary">{report.user.referralCode}</span>
                </div>
                <div style={infoRowStyle}>
                  <span style={{ color: 'var(--text-muted)' }}>Referred By:</span>
                  <span className="font-monospace">{report.user.referredBy ? 'Linked' : 'None'}</span>
                </div>
              </div>
            </div>

            {/* Exchange Limits Card */}
            {report.limits && (
              <div className="glass-panel" style={{ padding: '24px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '16px', color: 'var(--danger)' }}>Exchange Limits</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                  <div style={infoRowStyle}>
                    <span style={{ color: 'var(--text-muted)' }}>Daily Exchange Limit:</span>
                    <span style={{ fontWeight: '800', color: '#fff' }}>{report.limits.userLimit} USDT</span>
                  </div>
                  {/* Progress bar */}
                  <div style={{ marginBottom: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      <span>Used Today</span>
                      <span>{report.limits.dailyTotal} / {report.limits.userLimit} USDT</span>
                    </div>
                    <div style={{ height: '6px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        borderRadius: '4px',
                        width: `${Math.min(100, (report.limits.dailyTotal / report.limits.userLimit) * 100)}%`,
                        background: report.limits.remainingLimit <= 0 ? '#ef4444' : (report.limits.dailyTotal / report.limits.userLimit > 0.75 ? '#f59e0b' : 'var(--color-primary, #ff1744)'),
                        transition: 'width 0.4s ease'
                      }} />
                    </div>
                  </div>
                  <div style={infoRowStyle}>
                    <span style={{ color: 'var(--text-muted)' }}>Remaining Limit:</span>
                    <span style={{ fontWeight: '800', color: report.limits.remainingLimit <= 0 ? '#ef4444' : '#10b981' }}>
                      {report.limits.remainingLimit} USDT
                    </span>
                  </div>
                  <div style={infoRowStyle}>
                    <span style={{ color: 'var(--text-muted)' }}>Fiat Rate (USDT):</span>
                    <span style={{ fontWeight: '700' }}>{report.limits.usdtRate} per USDT</span>
                  </div>
                  <div style={infoRowStyle}>
                    <span style={{ color: 'var(--text-muted)' }}>System Bounds (Unverified / Verified):</span>
                    <span style={{ opacity: 0.8, fontSize: '0.78rem' }}>{report.limits.unverifiedLimit} / {report.limits.verifiedDailyLimit} USDT</span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* User History Logs Ledger Tabs */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '20px', gap: '8px', flexWrap: 'wrap' }}>
              <button
                className={`report-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                Exchange Orders ({report.orders.length})
              </button>
              <button
                className={`report-tab-btn ${activeTab === 'deposits' ? 'active' : ''}`}
                onClick={() => setActiveTab('deposits')}
              >
                Crypto Deposits ({report.deposits.length})
              </button>
              <button
                className={`report-tab-btn ${activeTab === 'withdrawals' ? 'active' : ''}`}
                onClick={() => setActiveTab('withdrawals')}
              >
                Withdrawal History ({report.withdrawals.length})
              </button>
              <button
                className={`report-tab-btn ${activeTab === 'referrals' ? 'active' : ''}`}
                onClick={() => setActiveTab('referrals')}
              >
                Referral Signups ({report.referrals.length})
              </button>
            </div>

            {activeTabContent()}
          </div>

        </div>
      )}
    </div>
  );
}

// Styling Constants
const infoRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingBottom: '8px',
  borderBottom: '1px solid rgba(255, 255, 255, 0.02)'
};

const thStyle = {
  padding: '10px',
  fontSize: '0.75rem',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  fontWeight: '700'
};

const tdStyle = {
  padding: '12px 10px',
  fontSize: '0.82rem',
  borderBottom: '1px solid rgba(255, 255, 255, 0.02)',
  verticalAlign: 'middle'
};

const trStyle = {
  height: '48px'
};

const noDataStyle = {
  padding: '32px',
  textAlign: 'center',
  color: 'var(--text-muted)',
  fontSize: '0.85rem'
};

export default AdminUserReport;
