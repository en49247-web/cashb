import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateUserProfile } from '../../../services/auth';

// SVG Icons for the Binance-style Account Info Page
const BackArrowIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
);
const AddUserIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="17" y1="11" x2="23" y2="11"></line></svg>
);
const EditPencilIcon = () => (
  <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
);
const CopyIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
);
const EyeIcon = ({ visible }) => (
  visible ? (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
  ) : (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
  )
);
const ChevronRightIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}><polyline points="9 18 15 12 9 6"></polyline></svg>
);

// Menu Specific Icons
const UserBadgeIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);
const ShieldLockIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
);
const BankCardIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
);
const ReferShareIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
);

function UserSettings({
  profileName,
  profileEmail,
  profilePhone,
  currentUser,
  setCurrentUser,
  onLogout
}) {
  const navigate = useNavigate();
  const [emailVisible, setEmailVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [updatingCurrency, setUpdatingCurrency] = useState(false);

  const handleCountryChange = async (newCode) => {
    setUpdatingCurrency(true);
    try {
      const updated = await updateUserProfile({ countryCode: newCode });
      if (updated) {
        if (typeof setCurrentUser === 'function') {
          setCurrentUser(updated);
        }
        localStorage.setItem('cashXcrypto_user', JSON.stringify(updated));

        const currencies = {
          '+91': 'INR (₹)',
          '+1': 'USD ($)',
          '+44': 'GBP (£)',
          '+92': 'PKR (₨)',
          '+971': 'AED (د.إ)',
          '+61': 'AUD ($)',
          '+49': 'EUR (€)',
          '+65': 'SGD ($)',
          '+966': 'SAR (﷼)',
          '+880': 'BDT (৳)',
          '+977': 'NPR (₨)',
          '+94': 'LKR (₨)'
        };
        showToast(`Currency updated to ${currencies[newCode] || newCode} globally!`);
      }
    } catch (err) {
      showToast(err.message || 'Failed to update currency settings.');
    } finally {
      setUpdatingCurrency(false);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    showToast(`${type} copied successfully!`);
  };

  const getMaskedEmail = (email) => {
    if (!email) return '';
    if (emailVisible) return email;
    const parts = email.split('@');
    if (parts.length < 2) return email;
    const name = parts[0];
    const domain = parts[1];
    if (name.length <= 3) return `***@${domain}`;
    return `${name.slice(0, 3)}***@${domain}`;
  };

  const getCountryName = (code) => {
    if (!code) return 'Not Specified';
    const cleanCode = code.trim();
    if (cleanCode === '+91') return 'India';
    if (cleanCode === '+44') return 'United Kingdom';
    if (cleanCode === '+61') return 'Australia';
    if (cleanCode === '+49') return 'Germany';
    if (cleanCode === '+92') return 'Pakistan';
    if (cleanCode === '+971') return 'UAE';
    if (cleanCode === '+966') return 'Saudi Arabia';
    if (cleanCode === '+65') return 'Singapore';
    if (cleanCode === '+880') return 'Bangladesh';
    if (cleanCode === '+977') return 'Nepal';
    if (cleanCode === '+94') return 'Sri Lanka';
    return cleanCode;
  };

  // Unique 9-digit CX ID or default simulated UID
  const displayUid = currentUser?.cxId
    ? currentUser.cxId.toUpperCase()
    : 'CX' + String(currentUser?._id || '428624620').substring(0, 7).toUpperCase();

  const kycStatus = currentUser?.kycStatus || 'Unverified';

  return (
    <div style={{
      maxWidth: '480px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      fontFamily: 'var(--font-sans)',
      color: '#fff',
      padding: '8px 16px 40px 16px'
    }}>

      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(30, 35, 47, 0.95)',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '10px 20px',
          borderRadius: '8px',
          color: '#fff',
          fontSize: '0.82rem',
          fontWeight: '600',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ color: '#f3ba2f' }}>✓</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. Header Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 0',
        marginBottom: '4px'
      }}>
        <button
          onClick={() => navigate('/user/dashboard')}
          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }}
        >
          <BackArrowIcon />
        </button>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: 0 }}>Account Info</h3>
        <button
          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.8, padding: 4 }}
          onClick={() => showToast('Profile actions coming soon')}
        >
          <AddUserIcon />
        </button>
      </div>

      {/* 2. Main Account Info Card */}
      <div style={{
        background: '#1e232f',
        borderRadius: '16px',
        padding: '20px',
        position: 'relative',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        border: '1px solid rgba(255,255,255,0.03)'
      }}>
        {/* Regular Account Badge */}
        <span style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          background: 'rgba(255,255,255,0.08)',
          color: 'rgba(255,255,255,0.7)',
          padding: '3px 8px',
          borderRadius: '4px',
          fontSize: '0.65rem',
          fontWeight: '700'
        }}>
          Regular
        </span>

        {/* User Identity Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          {/* Avatar with edit circle overlay */}
          <div style={{ position: 'relative', cursor: 'pointer' }}>
            {currentUser?.kycDetails?.selfieBase64 ? (
              <img
                src={currentUser.kycDetails.selfieBase64}
                alt="Profile"
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #f3ba2f',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}
              />
            ) : (
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#f3ba2f', // Binance Gold/Yellow
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '900',
                fontSize: '1.4rem',
                color: '#1e232f'
              }}>
                {/* Person silhouette avatar representation */}
                <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg>
              </div>
            )}
            {/* Small Pencil Overlay */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: 'rgba(30, 35, 47, 0.9)',
              border: '1.5px solid #fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <EditPencilIcon />
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0, color: '#fff' }}>
              {profileName || 'Rahulvermaindia'}
            </h4>
          </div>
        </div>

        {/* Detail Info Row: UID */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.8rem',
          padding: '8px 0',
          borderBottom: '1px solid rgba(255, 255, 255, 0.04)'
        }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>cashXcrypto ID (UID)</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => handleCopy(displayUid, 'UID')}>
            <span style={{ fontWeight: '700', fontFamily: 'monospace' }}>{displayUid}</span>
            <span style={{ color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center' }}><CopyIcon /></span>
          </div>
        </div>

        {/* Detail Info Row: Reg.Info */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.8rem',
          padding: '8px 0',
          borderBottom: '1px solid rgba(255, 255, 255, 0.04)'
        }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>Reg.Info</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: '700', color: '#fff' }}>{getMaskedEmail(profileEmail)}</span>
            <button
              onClick={() => setEmailVisible(!emailVisible)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
            >
              <EyeIcon visible={emailVisible} />
            </button>
          </div>
        </div>

        {/* Detail Info Row: Mobile Number */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.8rem',
          padding: '8px 0',
          borderBottom: '1px solid rgba(255, 255, 255, 0.04)'
        }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>Mobile Number</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => handleCopy(currentUser?.phone || profilePhone, 'Phone number')}>
            <span style={{ fontWeight: '700' }}>{currentUser?.phone || profilePhone || 'Not Set'}</span>
            <span style={{ color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center' }}><CopyIcon /></span>
          </div>
        </div>

        {/* Detail Info Row: Country */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.8rem',
          padding: '8px 0',
          marginBottom: '20px'
        }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>Display Currency</span>
          <select
            value={currentUser?.countryCode || '+91'}
            onChange={(e) => handleCountryChange(e.target.value)}
            disabled={updatingCurrency}
            style={{
              background: '#2b313f',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: '8px',
              fontWeight: '700',
              cursor: 'pointer',
              outline: 'none',
              fontSize: '0.8rem'
            }}
          >
            <option value="+91">India (₹ INR)</option>
            <option value="+1">USA / Canada ($ USD)</option>
            <option value="+44">UK (£ GBP)</option>
            <option value="+92">Pakistan (₨ PKR)</option>
            <option value="+971">UAE (د.إ AED)</option>
            <option value="+61">Australia ($ AUD)</option>
            <option value="+49">Germany (€ EUR)</option>
            <option value="+65">Singapore ($ SGD)</option>
            <option value="+966">Saudi Arabia (﷼ SAR)</option>
            <option value="+880">Bangladesh (৳ BDT)</option>
            <option value="+977">Nepal (₨ NPR)</option>
            <option value="+94">Sri Lanka (₨ LKR)</option>
          </select>
        </div>

      </div>

      {/* 3. Account Menu Options List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        marginTop: '8px'
      }}>
        {/* Row 1: Verifications */}
        <div
          onClick={() => navigate('/user/kyc')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 8px',
            cursor: 'pointer',
            borderBottom: '1px solid rgba(255,255,255,0.03)'
          }}
          className="settings-menu-item"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center' }}><UserBadgeIcon /></span>
            <span style={{ fontSize: '0.88rem', fontWeight: '700' }}>Verifications</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '0.8rem',
              color: kycStatus === 'Verified' ? '#34d399' : '#a3a3a3',
              fontWeight: '700'
            }}>
              {kycStatus}
            </span>
            <ChevronRightIcon />
          </div>
        </div>

        {/* Row 2: Security */}
        <div
          onClick={() => navigate('/user/security')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 8px',
            cursor: 'pointer',
            borderBottom: '1px solid rgba(255,255,255,0.03)'
          }}
          className="settings-menu-item"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center' }}><ShieldLockIcon /></span>
            <span style={{ fontSize: '0.88rem', fontWeight: '700' }}>Security</span>
          </div>
          <ChevronRightIcon />
        </div>

        {/* Row 3: Bank Accounts */}
        <div
          onClick={() => navigate('/user/banks')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 8px',
            cursor: 'pointer',
            borderBottom: '1px solid rgba(255,255,255,0.03)'
          }}
          className="settings-menu-item"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center' }}><BankCardIcon /></span>
            <span style={{ fontSize: '0.88rem', fontWeight: '700' }}>Bank Accounts</span>
          </div>
          <ChevronRightIcon />
        </div>

        {/* Row 4: Referrals */}
        <div
          onClick={() => navigate('/user/referrals')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 8px',
            cursor: 'pointer',
            borderBottom: '1px solid rgba(255,255,255,0.03)'
          }}
          className="settings-menu-item"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center' }}><ReferShareIcon /></span>
            <span style={{ fontSize: '0.88rem', fontWeight: '700' }}>Referrals</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: '#f3ba2f', fontWeight: '700' }}>Invite Friends</span>
            <ChevronRightIcon />
          </div>
        </div>
      </div>

      {/* 4. Bottom Logout Button */}
      {onLogout && (
        <button
          onClick={onLogout}
          style={{
            marginTop: '36px',
            background: '#2b313f',
            border: 'none',
            color: '#fff',
            padding: '14px',
            borderRadius: '10px',
            fontSize: '0.88rem',
            fontWeight: '700',
            cursor: 'pointer',
            width: '100%',
            transition: 'background-color 0.2s',
            outline: 'none'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#383e4c'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2b313f'}
        >
          Log Out
        </button>
      )}

      {/* Global Row Hover Style */}
      <style>{`
        .settings-menu-item {
          transition: background-color 0.15s ease;
          border-radius: 8px;
        }
        .settings-menu-item:active {
          background-color: rgba(255,255,255,0.03) !important;
        }
        @media (min-width: 992px) {
          .settings-menu-item:hover {
            background-color: rgba(255,255,255,0.02);
            padding-left: 12px !important;
            padding-right: 12px !important;
          }
        }
      `}</style>

    </div>
  );
}

export default UserSettings;
