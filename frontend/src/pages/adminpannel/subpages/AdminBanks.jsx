import React from 'react';
import { getBankFieldsByCountry } from '../../userpannel/UserPanel';

function AdminBanks({
  banks,
  handleToggleBankVerify
}) {
  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '16px' }}>User Bank Account List</h3>
      <div style={{ overflowX: 'auto' }}>
        <table className="rates-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>User</th>
              <th>Bank Name & Region</th>
              <th>Account Details</th>
              <th>Branch/Wire Identifier</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {banks.map(b => {
              const countryBankConfig = getBankFieldsByCountry(b.countryCode);
              const numField = countryBankConfig.fields.find(f => f.key === 'number') || { label: 'Account Number' };
              const codeField = countryBankConfig.fields.find(f => f.key === 'ifsc') || { label: 'IFSC Code' };

              return (
                <tr key={b.id}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: '700', color: '#fff', fontSize: '0.88rem' }}>{b.userName}</span>
                      {b.email && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.email}</span>}
                      <span style={{ fontSize: '0.68rem', color: 'var(--color-primary)', marginTop: '2px' }}>CX ID: {b.cxId || b.userId}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '700', color: '#fff' }}>{b.bankName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{countryBankConfig.countryName}</div>
                  </td>
                  <td style={{ fontFamily: 'monospace' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{numField.label}</div>
                    <div style={{ color: '#fff', fontSize: '0.88rem' }}>{b.accountNumber}</div>
                  </td>
                  <td style={{ fontFamily: 'monospace' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{codeField.label}</div>
                    <div style={{ color: '#fff', fontSize: '0.88rem' }}>{b.ifsc || 'N/A'}</div>
                  </td>
                  <td>
                    <span className={`badge ${b.verified ? 'badge-success' : 'badge-warning'}`}>
                      {b.verified ? 'Verified' : 'Pending Verification'}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleToggleBankVerify(b.id)}
                      className="btn btn-secondary" 
                      style={{ padding: '4px 8px', fontSize: '0.75rem', color: b.verified ? 'var(--danger)' : 'var(--success)' }}
                    >
                      {b.verified ? 'Revoke Verification' : 'Verify Account'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminBanks;
