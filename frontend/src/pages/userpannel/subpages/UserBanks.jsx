import React, { useState } from 'react';
import { getBankFieldsByCountry } from '../UserPanel';

// Custom inline SVG icons for premium look
const BankIcon = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M6 22V11"></path><path d="M10 22V11"></path><path d="M14 22V11"></path><path d="M18 22V11"></path></svg>
);
const EditIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
);
const TrashIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
);

function UserBanks({
  bankAccounts,
  setIsBankModalOpen,
  handleVerifyBank,
  handleUpdateBank,
  handleDeleteBank,
  currentUser
}) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  // Edit form states
  const [editBankName, setEditBankName] = useState('');
  const [editAccountNumber, setEditAccountNumber] = useState('');
  const [editIfsc, setEditIfsc] = useState('');

  const openEditModal = (acc) => {
    setEditingAccount(acc);
    setEditBankName(acc.name || '');
    setEditAccountNumber(acc.number || '');
    setEditIfsc(acc.ifsc || '');
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingAccount(null);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editBankName || !editAccountNumber || !editIfsc) return;

    if (handleUpdateBank) {
      handleUpdateBank({
        id: editingAccount._id || editingAccount.id,
        name: editBankName,
        number: editAccountNumber,
        ifsc: editIfsc,
        verified: true
      });
    }

    closeEditModal();
  };

  // Helper to space out account number like credit cards
  const formatAccountNumber = (num) => {
    if (!num) return '';
    // Format: group in 4 digits with space
    return num.toString().replace(/(\d{4})/g, '$1 ').trim();
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Dynamic CSS styles for responsiveness and animations */}
      <style>{`
        .bank-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }
        .bank-card {
          background: linear-gradient(135deg, #0d111e 0%, #171b2d 50%, #221331 100%) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          border-radius: 20px !important;
          padding: 28px !important;
          position: relative;
          overflow: hidden;
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.08) !important;
          display: flex;
          flex-direction: column;
          gap: 22px;
          min-height: 220px;
          transition: transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1), box-shadow 0.4s ease !important;
        }
        .bank-card:hover {
          transform: translateY(-6px) scale(1.01) !important;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.6), 0 0 20px rgba(139, 92, 246, 0.12), inset 0 1px 0 rgba(255,255,255,0.15) !important;
        }
        
        /* Shimmer sweep animation */
        .bank-card::after {
          content: "";
          position: absolute;
          top: 0;
          left: -150%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.08) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: skewX(-25deg);
          animation: cardShine 7s infinite ease-in-out;
        }
        .bank-card:hover::after {
          left: 150%;
          transition: left 0.6s ease-out;
          animation: none;
        }
        @keyframes cardShine {
          0%, 80% { left: -150%; }
          100% { left: 150%; }
        }

        .bank-card-chip {
          width: 44px;
          height: 34px;
          border-radius: 6px;
          background: linear-gradient(135deg, #ffd15c 0%, #b8860b 100%);
          position: relative;
          box-shadow: inset 0 1px 1px rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.3);
          border: 1px solid rgba(0,0,0,0.15);
        }
        .bank-card-chip::before {
          content: "";
          position: absolute;
          top: 6px; left: 8px; right: 8px; bottom: 6px;
          border: 1px solid rgba(0,0,0,0.25);
          border-radius: 3px;
        }
        .bank-card-title {
          font-weight: 800; 
          font-size: 1.25rem; 
          color: #fff; 
          margin-top: 4px;
          letter-spacing: 0.5px;
        }
        .bank-card-number {
          font-size: 1.45rem; 
          font-weight: 700; 
          color: #f8fafc; 
          font-family: 'Courier New', Courier, monospace; 
          letter-spacing: 2px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.4);
          word-break: break-all;
        }
        
        @media (max-width: 580px) {
          .bank-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .bank-card {
            padding: 22px !important;
            gap: 16px;
            min-height: 200px;
          }
          .bank-card-title {
            font-size: 1.1rem;
          }
          .bank-card-number {
            font-size: 1.25rem;
            letter-spacing: 1px;
          }
        }
      `}</style>

      {/* 1. Header block */}
      <div className="bank-header">
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: '#fff' }}>Linked Bank Payouts</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Manage the bank account details where your INR proceeds are sent.</p>
        </div>

        {bankAccounts.length > 0 && (
          <span style={{
            fontSize: '0.74rem',
            color: 'var(--text-muted)',
            fontWeight: '700',
            padding: '6px 12px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.05)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            🔒 Max limit reached
          </span>
        )}
      </div>

      {/* 2. Content block */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {bankAccounts.length === 0 ? (
          /* Empty state */
          <div className="glass-panel text-center" style={{ padding: '48px 32px', borderRadius: '16px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(var(--color-primary-rgb), 0.06)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px'
            }}>
              <BankIcon />
            </div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>No Bank Account Linked</h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 24px', lineHeight: '1.5' }}>
              You must link an active bank account to withdraw funds or receive Indian Rupee (INR) payouts instantly from crypto sales.
            </p>
            <button
              onClick={() => setIsBankModalOpen(true)}
              className="btn btn-primary"
              style={{ padding: '12px 28px', fontSize: '0.9rem', fontWeight: '700', borderRadius: '8px' }}
            >
              ➕ Link Bank Account
            </button>
          </div>
        ) : (
          /* Mock credit card design */
          bankAccounts.map((acc) => {
            const isVerified = acc.verified;
            const countryBankConfig = getBankFieldsByCountry(currentUser?.countryCode);
            const numField = countryBankConfig.fields.find(f => f.key === 'number') || { label: 'Account Number' };
            const codeField = countryBankConfig.fields.find(f => f.key === 'ifsc') || { label: 'IFSC Code' };

            return (
              <div key={acc.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="bank-card">
                  {/* Glassmorphic card overlay details */}
                  <div style={{
                    position: 'absolute',
                    top: '-40px',
                    right: '-40px',
                    width: '180px',
                    height: '180px',
                    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.14) 0%, transparent 70%)',
                    pointerEvents: 'none',
                    zIndex: 1
                  }} />

                  {/* Top card block */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
                    {/* Realistic Gold EMV Chip contacts */}
                    <div className="bank-card-chip">
                      <div style={{ position: 'absolute', top: 0, bottom: 0, left: '33%', width: '1px', background: 'rgba(0,0,0,0.22)' }} />
                      <div style={{ position: 'absolute', top: 0, bottom: 0, left: '66%', width: '1px', background: 'rgba(0,0,0,0.22)' }} />
                      <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: '1px', background: 'rgba(0,0,0,0.22)' }} />
                      <div style={{ position: 'absolute', top: '20%', bottom: '20%', left: '15%', right: '15%', border: '1px solid rgba(0,0,0,0.22)', borderRadius: '2px' }} />
                    </div>

                    {/* Branding cashXcrypto */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        background: '#8b5cf6',
                        transform: 'rotate(45deg)',
                        borderRadius: '2.5px',
                        boxShadow: '0 0 10px rgba(139, 92, 246, 0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <div style={{ width: '4px', height: '4px', background: '#0d111e', borderRadius: '50%' }} />
                      </div>

                      <span style={{
                        fontSize: '0.88rem',
                        fontWeight: '900',
                        letterSpacing: '1.5px',
                        color: '#fff',
                        fontFamily: 'var(--font-sans)',
                        textShadow: '0 0 10px rgba(139, 92, 246, 0.15)'
                      }}>
                        cash<span style={{ color: '#f3ba2f' }}>Xcrypto</span>
                      </span>
                    </div>
                  </div>

                  {/* Payout Bank Name block */}
                  <div style={{ zIndex: 2 }}>
                    <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800' }}>Active Payout Bank ({countryBankConfig.countryName})</div>
                    <div className="bank-card-title" style={{ color: '#fff', fontWeight: '800' }}>{acc.name.toUpperCase()}</div>
                  </div>

                  {/* Card Number block */}
                  <div style={{ zIndex: 2 }}>
                    <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', fontWeight: '800' }}>{numField.label}</div>
                    <div className="bank-card-number">
                      {formatAccountNumber(acc.number)}
                    </div>
                  </div>

                  {/* Bottom details block */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '12px', marginTop: 'auto', zIndex: 2, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>{codeField.label}</div>
                      <div style={{ fontSize: '0.85rem', color: '#e2e8f0', fontFamily: 'monospace', fontWeight: '700', marginTop: '2px' }}>
                        {acc.ifsc.toUpperCase()}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 12px',
                      borderRadius: '30px',
                      fontSize: '0.72rem',
                      fontWeight: '800',
                      background: isVerified ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                      color: isVerified ? '#34d399' : '#fbbf24',
                      border: `1px solid ${isVerified ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)'}`
                    }}>
                      <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: isVerified ? '#10b981' : '#f59e0b',
                        boxShadow: `0 0 8px ${isVerified ? '#10b981' : '#f59e0b'}`
                      }} />
                      {isVerified ? 'Active & Verified' : 'Pending Verification'}
                    </span>
                  </div>
                </div>

                {/* Operations Toolbar - Edit & Verify only */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isVerified ? '1fr' : '1fr 1fr',
                  gap: '8px',
                  marginTop: '4px'
                }}>
                  {!isVerified && (
                    <button
                      onClick={() => handleVerifyBank(acc._id || acc.id)}
                      className="btn btn-accent"
                      style={{
                        padding: '11px 0',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      Verify Account
                    </button>
                  )}

                  <button
                    onClick={() => openEditModal(acc)}
                    style={{
                      padding: '11px 0',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      color: '#fff',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'; }}
                  >
                    <EditIcon />
                    Edit Details
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* POPUP MODAL: Edit Bank Account */}
      {isEditModalOpen && (() => {
        const countryBankConfig = getBankFieldsByCountry(currentUser?.countryCode);
        return (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(6, 9, 20, 0.88)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}>
            <div className="glass-panel" style={{
              width: '100%',
              maxWidth: '400px',
              padding: '28px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: '#fff' }}>
                  Edit Bank Details ({countryBankConfig.countryName})
                </h3>
                <button
                  onClick={closeEditModal}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '1.25rem'
                  }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {countryBankConfig.fields.map((field) => {
                  let val = '';
                  let setVal = null;
                  if (field.key === 'name') {
                    val = editBankName;
                    setVal = setEditBankName;
                  } else if (field.key === 'number') {
                    val = editAccountNumber;
                    setVal = setEditAccountNumber;
                  } else if (field.key === 'ifsc') {
                    val = editIfsc;
                    setVal = setEditIfsc;
                  }

                  return (
                    <div key={field.key}>
                      <label className="input-label" style={{ display: 'block', marginBottom: '8px', fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
                        {field.label}
                      </label>
                      <input
                        type="text"
                        className="step-input"
                        placeholder={field.placeholder}
                        value={val}
                        onChange={(e) => setVal(field.key === 'ifsc' ? e.target.value.toUpperCase() : e.target.value)}
                        style={{ width: '100%', boxSizing: 'border-box' }}
                        required={field.required}
                        pattern={field.pattern}
                        title={field.title}
                      />
                    </div>
                  );
                })}
                <div style={{ display: 'flex', gap: '12px', marginTop: '14px' }}>
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '12px', cursor: 'pointer', fontWeight: '700' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '12px', cursor: 'pointer', fontWeight: '700' }}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default UserBanks;
