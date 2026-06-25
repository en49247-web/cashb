import React, { useState } from 'react';
import { changePassword, changeTwoFactorPin } from '../../../services/auth';

// Custom SVG Icons for Premium UI
const LockIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-primary)' }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
);
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-primary)' }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
);
const EyeIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);
const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
);
const ActivityIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-primary)' }}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
);
const SuccessIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#34d399' }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);
const ErrorIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#f87171' }}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
);

function UserSecurity({
  security2FA,
  setSecurity2FA
}) {
  const [activeTab, setActiveTab] = useState('password'); // 'password' or '2fa'
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Password Visibility states
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Status Banners
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 2FA Form State
  const [passwordFor2fa, setPasswordFor2fa] = useState('');
  const [new2fa, setNew2fa] = useState('');
  const [confirmNew2fa, setConfirmNew2fa] = useState('');
  const [showPasswordFor2fa, setShowPasswordFor2fa] = useState(false);
  
  const [errorMsg2fa, setErrorMsg2fa] = useState('');
  const [successMsg2fa, setSuccessMsg2fa] = useState('');
  const [submitting2fa, setSubmitting2fa] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your new password.');
      return;
    }

    setSubmitting(true);
    try {
      await changePassword({ oldPassword, newPassword });
      setSuccessMsg('Your password has been successfully updated.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred while updating password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handle2faSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg2fa('');
    setSuccessMsg2fa('');

    if (new2fa.length !== 6) {
      setErrorMsg2fa('New 2FA PIN must be exactly 6 digits.');
      return;
    }

    if (new2fa !== confirmNew2fa) {
      setErrorMsg2fa('2FA PINs do not match. Please verify your new PIN.');
      return;
    }

    setSubmitting2fa(true);
    try {
      await changeTwoFactorPin({ password: passwordFor2fa, new2fa });
      setSuccessMsg2fa('Your Two-Factor PIN (2FA) has been successfully updated.');
      setPasswordFor2fa('');
      setNew2fa('');
      setConfirmNew2fa('');
    } catch (err) {
      setErrorMsg2fa(err.message || 'An error occurred while updating 2FA PIN.');
    } finally {
      setSubmitting2fa(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Tab Selector Menu */}
      <div style={{
        display: 'flex',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        padding: '6px',
        gap: '6px'
      }}>
        <button
          onClick={() => setActiveTab('password')}
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'password' ? 'linear-gradient(135deg, #a855f7, #6366f1)' : 'none',
            color: activeTab === 'password' ? '#fff' : 'rgba(255,255,255,0.6)',
            fontWeight: '700',
            fontSize: '0.88rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          🔐 Change Password
        </button>
        <button
          onClick={() => setActiveTab('2fa')}
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === '2fa' ? 'linear-gradient(135deg, #a855f7, #6366f1)' : 'none',
            color: activeTab === '2fa' ? '#fff' : 'rgba(255,255,255,0.6)',
            fontWeight: '700',
            fontSize: '0.88rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          🛡️ Two-Factor PIN (2FA)
        </button>
      </div>

      {/* 2. Change Password Card */}
      {activeTab === 'password' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <LockIcon />
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#fff', margin: 0 }}>Change Account Password</h3>
          </div>

          {/* Embedded Status Notifications */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: (errorMsg || successMsg) ? '20px' : '0px' }}>
            {errorMsg && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                borderRadius: '8px',
                color: '#fca5a5',
                fontSize: '0.82rem',
                fontWeight: '600'
              }}>
                <ErrorIcon />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.15)',
                borderRadius: '8px',
                color: '#a7f3d0',
                fontSize: '0.82rem',
                fontWeight: '600'
              }}>
                <SuccessIcon />
                <span>{successMsg}</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Current Password */}
            <div>
              <label className="input-label" style={{ display: 'block', marginBottom: '8px', fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Current Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showOld ? "text" : "password"} 
                  className="step-input" 
                  style={{ width: '100%', paddingRight: '40px', boxSizing: 'border-box' }}
                  placeholder="Enter current password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowOld(!showOld)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                >
                  {showOld ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="input-label" style={{ display: 'block', marginBottom: '8px', fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)' }}>New Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showNew ? "text" : "password"} 
                  className="step-input" 
                  style={{ width: '100%', paddingRight: '40px', boxSizing: 'border-box' }}
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                >
                  {showNew ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="input-label" style={{ display: 'block', marginBottom: '8px', fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showConfirm ? "text" : "password"} 
                  className="step-input" 
                  style={{ width: '100%', paddingRight: '40px', boxSizing: 'border-box' }}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                >
                  {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={submitting}
              style={{ 
                padding: '12px 24px', 
                alignSelf: 'flex-start', 
                fontSize: '0.85rem', 
                fontWeight: '700', 
                borderRadius: '8px',
                marginTop: '6px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1
              }}
            >
              {submitting ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}

      {/* 3. Update Two-Factor PIN (2FA) Card */}
      {activeTab === '2fa' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <ShieldIcon />
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#fff', margin: 0 }}>Update Two-Factor PIN (2FA)</h3>
          </div>

          {/* Embedded Status Notifications */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: (errorMsg2fa || successMsg2fa) ? '20px' : '0px' }}>
            {errorMsg2fa && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                borderRadius: '8px',
                color: '#fca5a5',
                fontSize: '0.82rem',
                fontWeight: '600'
              }}>
                <ErrorIcon />
                <span>{errorMsg2fa}</span>
              </div>
            )}

            {successMsg2fa && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.15)',
                borderRadius: '8px',
                color: '#a7f3d0',
                fontSize: '0.82rem',
                fontWeight: '600'
              }}>
                <SuccessIcon />
                <span>{successMsg2fa}</span>
              </div>
            )}
          </div>

          <form onSubmit={handle2faSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Account Password */}
            <div>
              <label className="input-label" style={{ display: 'block', marginBottom: '8px', fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Account Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPasswordFor2fa ? "text" : "password"} 
                  className="step-input" 
                  style={{ width: '100%', paddingRight: '40px', boxSizing: 'border-box' }}
                  placeholder="Enter account password for verification"
                  value={passwordFor2fa}
                  onChange={(e) => {
                    setPasswordFor2fa(e.target.value);
                    setErrorMsg2fa('');
                  }}
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordFor2fa(!showPasswordFor2fa)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                >
                  {showPasswordFor2fa ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* New 2FA Code */}
            <div>
              <label className="input-label" style={{ display: 'block', marginBottom: '8px', fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)' }}>New 6-Digit Two-Factor PIN (2FA)</label>
              <input 
                type="text" 
                className="step-input" 
                style={{ width: '100%', boxSizing: 'border-box' }}
                placeholder="Enter new 6-digit numeric security PIN"
                value={new2fa}
                maxLength={6}
                onChange={(e) => {
                  setNew2fa(e.target.value.replace(/\D/g, ''));
                  setErrorMsg2fa('');
                }}
                required 
              />
            </div>

            {/* Confirm New 2FA Code */}
            <div>
              <label className="input-label" style={{ display: 'block', marginBottom: '8px', fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Confirm New 6-Digit Two-Factor PIN (2FA)</label>
              <input 
                type="text" 
                className="step-input" 
                style={{ width: '100%', boxSizing: 'border-box' }}
                placeholder="Confirm new 6-digit numeric security PIN"
                value={confirmNew2fa}
                maxLength={6}
                onChange={(e) => {
                  setConfirmNew2fa(e.target.value.replace(/\D/g, ''));
                  setErrorMsg2fa('');
                }}
                required 
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={submitting2fa}
              style={{ 
                padding: '12px 24px', 
                alignSelf: 'flex-start', 
                fontSize: '0.85rem', 
                fontWeight: '700', 
                borderRadius: '8px',
                marginTop: '6px',
                cursor: submitting2fa ? 'not-allowed' : 'pointer',
                opacity: submitting2fa ? 0.7 : 1
              }}
            >
              {submitting2fa ? 'Updating 2FA PIN...' : 'Update 2FA PIN'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default UserSecurity;
