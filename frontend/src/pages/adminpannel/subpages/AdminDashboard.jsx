import React from 'react';

function AdminDashboard({
  totalVolume,
  totalUsersCount,
  kycRequests,
  tickets
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Stats overview */}
      <div className="dashboard-overview-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '20px', borderLeft: '3px solid var(--danger)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Total Volume Exchanged</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff' }}>₹{totalVolume.toLocaleString('en-IN')}</div>
        </div>
        <div className="glass-panel" style={{ padding: '20px', borderLeft: '3px solid var(--color-primary)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Registered Customers</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff' }}>{totalUsersCount.toLocaleString()}</div>
        </div>
        <div className="glass-panel" style={{ padding: '20px', borderLeft: '3px solid var(--color-accent)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>KYC Review Requests</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--color-accent)' }}>{kycRequests.length}</div>
        </div>
        <div className="glass-panel" style={{ padding: '20px', borderLeft: '3px solid var(--success)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Active Open Tickets</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--success)' }}>{tickets.filter(t => t.status === 'Open').length}</div>
        </div>
      </div>

      {/* Node status indicators */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px' }}>Network Escrow & Gateway Node Status</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>USDT Cold Escrow</span>
              <span style={{ color: 'var(--success)', fontSize: '0.75rem' }}>● Online</span>
            </div>
            <strong>1,520,000 USDT</strong>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>BTC Custody Pool</span>
              <span style={{ color: 'var(--success)', fontSize: '0.75rem' }}>● Online</span>
            </div>
            <strong>14.28 BTC</strong>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>INR Payout Rails</span>
              <span style={{ color: 'var(--success)', fontSize: '0.75rem' }}>● UPI/IMPS OK</span>
            </div>
            <strong>₹85,00,000 Pool</strong>
          </div>
        </div>
      </div>

    </div>
  );
}

export default AdminDashboard;
