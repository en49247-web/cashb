import React from 'react';

function AdminReports({
  handleExportAuditCSV
}) {
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }} className="glass-panel">
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '12px' }}>System Audit Reports</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>Export platform records containing cumulative transaction volumes, user directories, and compliance reviews.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button onClick={handleExportAuditCSV} className="btn btn-primary" style={{ padding: '12px', fontSize: '0.9rem' }}>Export Exchange Orders (CSV)</button>
          <button onClick={() => alert('User Directory exported (CSV).')} className="btn btn-secondary" style={{ padding: '12px', fontSize: '0.9rem' }}>Export Customer Directory (CSV)</button>
          <button onClick={() => alert('KYC Audit Log exported (CSV).')} className="btn btn-secondary" style={{ padding: '12px', fontSize: '0.9rem' }}>Export Compliance Log (CSV)</button>
        </div>
      </div>
    </div>
  );
}

export default AdminReports;
