import React from 'react';

function AdminDeposits({
  ledgerMovements,
  handleApproveMovement
}) {
  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '16px' }}>Ledger Deposit & Withdrawal Audits</h3>
      <div style={{ overflowX: 'auto' }}>
        <table className="rates-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>TX ID</th>
              <th>Type</th>
              <th>Customer</th>
              <th>Crypto Volume</th>
              <th>INR Estimate</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {ledgerMovements.map(m => (
              <tr key={m.id}>
                <td style={{ fontFamily: 'monospace' }}>{m.id}</td>
                <td style={{ color: m.type === 'Deposit' ? 'var(--success)' : 'var(--danger)', fontWeight: '700' }}>{m.type}</td>
                <td>{m.userName}</td>
                <td>{m.amount}</td>
                <td>₹{m.valueINR.toLocaleString('en-IN')}</td>
                <td>
                  <span className={`badge ${m.status === 'Completed' ? 'badge-success' : m.status === 'Pending' ? 'badge-warning' : 'badge-info'}`}>
                    {m.status}
                  </span>
                </td>
                <td>
                  {m.status === 'Pending' ? (
                    <button 
                      onClick={() => handleApproveMovement(m.id)}
                      className="btn btn-primary" 
                      style={{ padding: '4px 10px', fontSize: '0.75rem', background: 'var(--success)' }}
                    >
                      Approve Payout
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Audit Confirmed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDeposits;
