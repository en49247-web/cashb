import React, { useState } from 'react';
import { createPortal } from 'react-dom';

// Map country codes to friendly names
const getCountryName = (code) => {
  if (!code) return 'India';
  const c = code.trim();
  if (c === '+91' || c === 'IN' || c === 'INDIA') return 'India';
  if (c === '+1' || c === 'US' || c === 'USA') return 'USA';
  if (c === 'CA' || c === 'CAN') return 'Canada';
  if (c === '+44' || c === 'GB' || c === 'UK') return 'UK';
  if (c === '+92' || c === 'PK' || c === 'PAK') return 'Pakistan';
  if (c === '+971' || c === 'AE' || c === 'ARE') return 'UAE';
  if (c === '+61' || c === 'AU' || c === 'AUS') return 'Australia';
  if (c === '+49' || c === 'DE' || c === 'DEU') return 'Germany';
  if (c === '+65' || c === 'SG' || c === 'SGP') return 'Singapore';
  if (c === '+966' || c === 'SA' || c === 'SAU') return 'Saudi Arabia';
  if (c === '+880' || c === 'BD' || c === 'BGD') return 'Bangladesh';
  if (c === '+977' || c === 'NP' || c === 'NPL') return 'Nepal';
  if (c === '+94' || c === 'LK' || c === 'LKA') return 'Sri Lanka';
  return c;
};

// Map country codes to flag emojis
const getCountryFlag = (code) => {
  if (!code) return '🇮🇳';
  const c = code.trim();
  if (c === '+91' || c === 'IN' || c === 'INDIA') return '🇮🇳';
  if (c === '+1' || c === 'US' || c === 'USA') return '🇺🇸';
  if (c === 'CA' || c === 'CAN') return '🇨🇦';
  if (c === '+44' || c === 'GB' || c === 'UK') return '🇬🇧';
  if (c === '+92' || c === 'PK' || c === 'PAK') return '🇵🇰';
  if (c === '+971' || c === 'AE' || c === 'ARE') return '🇦🇪';
  if (c === '+61' || c === 'AU' || c === 'AUS') return '🇦🇺';
  if (c === '+49' || c === 'DE' || c === 'DEU') return '🇩🇪';
  if (c === '+65' || c === 'SG' || c === 'SGP') return '🇸🇬';
  if (c === '+966' || c === 'SA' || c === 'SAU') return '🇸🇦';
  if (c === '+880' || c === 'BD' || c === 'BGD') return '🇧🇩';
  if (c === '+977' || c === 'NP' || c === 'NPL') return '🇳🇵';
  if (c === '+94' || c === 'LK' || c === 'LKA') return '🇱🇰';
  return '🌐';
};

function AdminKyc({
  kycRequests,
  handleKycApprove,
  handleKycReject,
  onRefresh
}) {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filterTab, setFilterTab] = useState('Pending');
  const [copiedField, setCopiedField] = useState(null);

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const handleModalClose = () => {
    setSelectedRequest(null);
  };

  const handleApproveFromModal = async (id, userId) => {
    await handleKycApprove(id, userId);
    setSelectedRequest(null);
  };

  const handleRejectFromModal = async (id, userId) => {
    await handleKycReject(id, userId);
    setSelectedRequest(null);
  };

  const pendingCount = kycRequests.filter(r => (r.kycStatus || 'Pending') === 'Pending').length;
  const rejectedCount = kycRequests.filter(r => (r.kycStatus || '') === 'Rejected').length;

  const filteredRequests = kycRequests.filter(r => {
    const status = r.kycStatus || 'Pending';
    return status.toLowerCase() === filterTab.toLowerCase();
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. Header controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, letterSpacing: '-0.3px' }}>
            Compliance Verification Queue
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Review and confirm identity documents submitted by international customers.
          </p>
        </div>
        <button 
          onClick={onRefresh}
          className="btn btn-secondary"
          style={{ 
            padding: '8px 16px', 
            fontSize: '0.8rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            cursor: 'pointer' 
          }}
        >
          <span>🔄</span>
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* 2. Filters / Segment tabs */}
      <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '4px' }}>
        <button
          onClick={() => setFilterTab('Pending')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: filterTab === 'Pending' ? '3px solid var(--danger)' : '3px solid transparent',
            color: filterTab === 'Pending' ? '#fff' : 'var(--text-muted)',
            padding: '8px 16px 12px 16px',
            fontSize: '0.85rem',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          ⏳ Pending verifications
          <span style={{
            background: 'rgba(255,170,0,0.15)',
            color: '#ffaa00',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '0.72rem',
            fontWeight: '800'
          }}>{pendingCount}</span>
        </button>

        <button
          onClick={() => setFilterTab('Rejected')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: filterTab === 'Rejected' ? '3px solid #ef4444' : '3px solid transparent',
            color: filterTab === 'Rejected' ? '#fff' : 'var(--text-muted)',
            padding: '8px 16px 12px 16px',
            fontSize: '0.85rem',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          ❌ Rejected / Resubmit Required
          <span style={{
            background: 'rgba(239,68,68,0.15)',
            color: '#ef4444',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '0.72rem',
            fontWeight: '800'
          }}>{rejectedCount}</span>
        </button>
      </div>

      {/* 3. Main Ledger */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
        {filteredRequests.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.1)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>{filterTab === 'Pending' ? '🎉' : '📂'}</div>
            <span style={{ fontSize: '0.88rem', fontWeight: '600', color: '#fff' }}>
              {filterTab === 'Pending' ? 'Compliance queue is clear' : 'No rejected KYC submissions'}
            </span>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              {filterTab === 'Pending' ? 'No pending user verifications require approval.' : 'No users currently sit in rejected compliance status.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="rates-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Date</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>User Profile</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Region</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Document Identity Details</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', width: '220px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map(r => {
                  const details = r.kycDetails || {};
                  const keys = Object.keys(details).filter(k => k !== 'country' && k !== 'selfieBase64' && k !== 'selfieName');
                  const country = details.country || getCountryName(r.countryCode);
                  const flag = getCountryFlag(r.countryCode);

                  return (
                    <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background-color 0.2s' }}>
                      <td style={{ padding: '16px 8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>{r.date}</td>
                      <td style={{ padding: '16px 8px' }}>
                        <div style={{ fontWeight: '700', color: '#fff', fontSize: '0.9rem' }}>{r.userName}</div>
                        {r.email && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>{r.email}</div>}
                        <div style={{ fontSize: '0.68rem', color: 'var(--color-primary)', marginTop: '1px' }}>CX ID: {r.cxId || r.userId}</div>
                      </td>
                      <td style={{ padding: '16px 8px' }}>
                        <span style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '6px', 
                          fontSize: '0.75rem', 
                          color: 'var(--text-secondary)',
                          background: 'rgba(255,255,255,0.03)',
                          padding: '4px 8px',
                          borderRadius: '20px',
                          border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                          <span>{flag}</span>
                          <span>{country}</span>
                        </span>
                      </td>
                      <td style={{ padding: '16px 8px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: '800',
                          textTransform: 'uppercase',
                          background: r.kycStatus === 'Pending' ? 'rgba(255, 170, 0, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: r.kycStatus === 'Pending' ? '#ffaa00' : '#ef4444'
                        }}>
                          {r.kycStatus || 'Pending'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 8px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {keys.length > 0 ? (
                            keys.map(k => (
                              <div key={k} style={{ fontSize: '0.8rem' }}>
                                <span style={{ textTransform: 'uppercase', fontWeight: '700', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{k}: </span>
                                <span style={{ fontFamily: 'monospace', color: '#e0e0e0' }}>{details[k]}</span>
                              </div>
                            ))
                          ) : (
                            <>
                              {r.pan && (
                                <div style={{ fontSize: '0.8rem' }}>
                                  <span style={{ fontWeight: '700', fontSize: '0.7rem', color: 'var(--text-muted)' }}>PAN: </span>
                                  <span style={{ fontFamily: 'monospace', color: '#e0e0e0' }}>{r.pan}</span>
                                </div>
                              )}
                              {r.aadhaar && (
                                <div style={{ fontSize: '0.8rem' }}>
                                  <span style={{ fontWeight: '700', fontSize: '0.7rem', color: 'var(--text-muted)' }}>AADHAAR: </span>
                                  <span style={{ fontFamily: 'monospace', color: '#e0e0e0' }}>{r.aadhaar}</span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '16px 8px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button 
                            onClick={() => setSelectedRequest(r)}
                            className="btn btn-secondary" 
                            style={{ 
                              padding: '6px 12px', 
                              fontSize: '0.72rem', 
                              fontWeight: '700',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                          >
                            👁️ View Details
                          </button>
                          
                          {r.kycStatus !== 'Verified' && (
                            <button 
                              onClick={() => handleKycApprove(r.id, r.userId)}
                              className="btn btn-primary" 
                              style={{ 
                                padding: '6px 12px', 
                                fontSize: '0.72rem', 
                                background: 'var(--success)', 
                                borderColor: 'transparent',
                                fontWeight: '700',
                                borderRadius: '6px',
                                cursor: 'pointer'
                              }}
                            >
                              Approve
                            </button>
                          )}

                          {r.kycStatus === 'Pending' && (
                            <button 
                              onClick={() => handleKycReject(r.id, r.userId)}
                              className="btn btn-primary" 
                              style={{ 
                                padding: '6px 12px', 
                                fontSize: '0.72rem', 
                                background: '#ef4444', 
                                borderColor: 'transparent',
                                fontWeight: '700',
                                borderRadius: '6px',
                                cursor: 'pointer'
                              }}
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. Detailed Review Modal */}
      {selectedRequest && createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(6, 9, 20, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '650px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '90vh'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#fff' }}>
                  KYC Verification Review
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Request ID: {selectedRequest.id}
                </span>
              </div>
              <button 
                onClick={handleModalClose}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '1.25rem',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Profile Card */}
              <div style={{ 
                background: 'rgba(255,255,255,0.02)', 
                border: '1px solid rgba(255,255,255,0.04)', 
                borderRadius: '12px', 
                padding: '16px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px'
              }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Customer Name</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                    <span style={{ fontWeight: '700', color: '#fff', fontSize: '0.92rem' }}>{selectedRequest.userName}</span>
                    <button 
                      onClick={() => handleCopy(selectedRequest.userName, 'name')}
                      style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: copiedField === 'name' ? '#10b981' : 'var(--text-muted)', cursor: 'pointer', padding: '2px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '600' }}
                    >
                      {copiedField === 'name' ? '✓ Copied' : '📋 Copy'}
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: '600' }}>CX ID: {selectedRequest.cxId || selectedRequest.userId}</span>
                    <button 
                      onClick={() => handleCopy(selectedRequest.cxId || selectedRequest.userId, 'cxId')}
                      style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: copiedField === 'cxId' ? '#10b981' : 'var(--text-muted)', cursor: 'pointer', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '600' }}
                    >
                      {copiedField === 'cxId' ? '✓ Copied' : '📋 Copy'}
                    </button>
                  </div>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Region</span>
                  <span style={{ fontWeight: '700', color: '#fff', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <span>{getCountryFlag(selectedRequest.countryCode)}</span>
                    <span>{selectedRequest.kycDetails?.country || getCountryName(selectedRequest.countryCode)}</span>
                  </span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Email Address</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{selectedRequest.email || 'N/A'}</span>
                    {selectedRequest.email && (
                      <button 
                        onClick={() => handleCopy(selectedRequest.email, 'email')}
                        style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: copiedField === 'email' ? '#10b981' : 'var(--text-muted)', cursor: 'pointer', padding: '2px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '600' }}
                      >
                        {copiedField === 'email' ? '✓ Copied' : '📋 Copy'}
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Phone Number</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{selectedRequest.phone ? `${selectedRequest.countryCode} ${selectedRequest.phone}` : 'N/A'}</span>
                    {selectedRequest.phone && (
                      <button 
                        onClick={() => handleCopy(`${selectedRequest.countryCode}${selectedRequest.phone}`, 'phone')}
                        style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: copiedField === 'phone' ? '#10b981' : 'var(--text-muted)', cursor: 'pointer', padding: '2px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '600' }}
                      >
                        {copiedField === 'phone' ? '✓ Copied' : '📋 Copy'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Submitted Document details */}
              <div>
                <h5 style={{ margin: '0 0 10px 0', fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                  Submitted Identity Documents
                </h5>
                <div style={{ 
                  background: 'rgba(0,0,0,0.2)', 
                  borderRadius: '10px', 
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  border: '1px solid rgba(255,255,255,0.03)'
                }}>
                  {Object.keys(selectedRequest.kycDetails || {}).filter(k => k !== 'country' && k !== 'selfieBase64' && k !== 'selfieName').length > 0 ? (
                    Object.keys(selectedRequest.kycDetails).filter(k => k !== 'country' && k !== 'selfieBase64' && k !== 'selfieName').map(k => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px', alignItems: 'center' }}>
                        <span style={{ textTransform: 'uppercase', fontWeight: '700', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{k}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontFamily: 'monospace', color: '#fff', fontSize: '0.88rem' }}>{selectedRequest.kycDetails[k]}</span>
                          <button
                            onClick={() => handleCopy(selectedRequest.kycDetails[k], k)}
                            style={{
                              background: 'rgba(255,255,255,0.05)',
                              border: 'none',
                              color: copiedField === k ? '#10b981' : 'var(--text-muted)',
                              cursor: 'pointer',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.7rem',
                              fontWeight: '600'
                            }}
                          >
                            {copiedField === k ? '✓ Copied' : '📋 Copy'}
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <>
                      {selectedRequest.pan && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px', alignItems: 'center' }}>
                          <span style={{ fontWeight: '700', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>PAN CARD</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontFamily: 'monospace', color: '#fff', fontSize: '0.88rem' }}>{selectedRequest.pan}</span>
                            <button
                              onClick={() => handleCopy(selectedRequest.pan, 'pan')}
                              style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: 'none',
                                color: copiedField === 'pan' ? '#10b981' : 'var(--text-muted)',
                                cursor: 'pointer',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: '600'
                              }}
                            >
                              {copiedField === 'pan' ? '✓ Copied' : '📋 Copy'}
                            </button>
                          </div>
                        </div>
                      )}
                      {selectedRequest.aadhaar && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: '700', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>AADHAAR CARD</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontFamily: 'monospace', color: '#fff', fontSize: '0.88rem' }}>{selectedRequest.aadhaar}</span>
                            <button
                              onClick={() => handleCopy(selectedRequest.aadhaar, 'aadhaar')}
                              style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: 'none',
                                color: copiedField === 'aadhaar' ? '#10b981' : 'var(--text-muted)',
                                cursor: 'pointer',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: '600'
                              }}
                            >
                              {copiedField === 'aadhaar' ? '✓ Copied' : '📋 Copy'}
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Selfie Image Preview */}
              <div>
                <h5 style={{ margin: '0 0 10px 0', fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                  Verification Selfie Document File
                </h5>
                
                {/* Beautiful Mock Selfie Box */}
                <div style={{
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  background: 'rgba(0,0,0,0.3)',
                  padding: '24px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  {selectedRequest.kycDetails?.selfieBase64 ? (
                    <div style={{ width: '100%', maxWidth: '360px', margin: '0 auto' }}>
                      <img 
                        src={selectedRequest.kycDetails.selfieBase64} 
                        alt="User Verification Selfie" 
                        style={{ 
                          width: '100%', 
                          maxHeight: '260px', 
                          objectFit: 'contain', 
                          borderRadius: '8px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                        }} 
                      />
                    </div>
                  ) : (
                    <div style={{
                      display: 'flex',
                      gap: '16px',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      padding: '20px',
                      borderRadius: '8px',
                      width: '100%',
                      maxWidth: '320px'
                    }}>
                      {/* User Silhouette Face */}
                      <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: 'rgba(189, 52, 254, 0.1)',
                        border: '1px solid rgba(189, 52, 254, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.8rem'
                      }}>
                        👤
                      </div>
                      {/* Document Icon */}
                      <div style={{
                        width: '80px',
                        height: '56px',
                        borderRadius: '6px',
                        background: 'rgba(74, 222, 128, 0.1)',
                        border: '1px solid rgba(74, 222, 128, 0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.6rem',
                        fontWeight: '800',
                        color: '#4ade80'
                      }}>
                        <span>📄 ID CARD</span>
                        <span style={{ fontSize: '0.45rem', opacity: 0.8, marginTop: '2px' }}>VERIFIED REGION</span>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <span style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#fff' }}>
                      {selectedRequest.kycDetails?.selfieName || selectedRequest.docUploaded || 'Selfie_Verification_Note.png'}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                      Status: {selectedRequest.kycDetails?.selfieBase64 ? 'Live Verification Photo Uploaded' : 'High Resolution Image Attached'}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Actions Footer */}
            <div style={{
              padding: '20px 24px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(0,0,0,0.15)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button 
                onClick={handleModalClose}
                className="btn btn-secondary"
                style={{ padding: '8px 16px', fontSize: '0.8rem', borderRadius: '6px', cursor: 'pointer' }}
              >
                Close
              </button>
              <button 
                onClick={() => handleRejectFromModal(selectedRequest.id, selectedRequest.userId)}
                className="btn btn-secondary"
                style={{ 
                  padding: '8px 16px', 
                  fontSize: '0.8rem', 
                  borderRadius: '6px', 
                  color: 'var(--danger)',
                  borderColor: 'rgba(239, 68, 68, 0.2)',
                  background: 'rgba(239, 68, 68, 0.05)',
                  cursor: 'pointer' 
                }}
              >
                Reject Verification
              </button>
              <button 
                onClick={() => handleApproveFromModal(selectedRequest.id, selectedRequest.userId)}
                className="btn btn-primary"
                style={{ 
                  padding: '8px 18px', 
                  fontSize: '0.8rem', 
                  borderRadius: '6px', 
                  background: 'var(--success)', 
                  borderColor: 'transparent',
                  cursor: 'pointer' 
                }}
              >
                Approve KYC
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}

export default AdminKyc;
