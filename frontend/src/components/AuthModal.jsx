import React, { useState } from 'react';
import { X, Check, Shield, Zap, TrendingUp } from './Icons';
import { registerUser, loginUser } from '../services/auth';
import siteLogo from '../assets/logo.png';

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);


const COUNTRIES = [
  { name: 'India', code: '+91' },
  { name: 'USA', code: '+1' },
  { name: 'UK', code: '+44' },
  { name: 'Pakistan', code: '+92' },
  { name: 'UAE', code: '+971' },
  { name: 'Canada', code: '+1' },
  { name: 'Australia', code: '+61' },
  { name: 'Germany', code: '+49' },
  { name: 'Singapore', code: '+65' },
  { name: 'Saudi Arabia', code: '+966' },
  { name: 'Bangladesh', code: '+880' },
  { name: 'Nepal', code: '+977' },
  { name: 'Sri Lanka', code: '+94' }
];

function AuthModal({ isOpen, onClose, initialMode = 'login', onAuthSuccess }) {
  if (!isOpen) return null;

  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [referralCode, setReferralCode] = useState(() => sessionStorage.getItem('cashXcrypto_referral_code') || '');
  const [agreed, setAgreed] = useState(false);

  // Submit API states
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!isLogin && password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    if (!isLogin && (!twoFactorCode || twoFactorCode.length !== 6)) {
      setErrorMessage('Two-Factor Code (2FA) must be exactly 6 digits');
      return;
    }

    if (!isLogin && !agreed) {
      setErrorMessage('You must agree to the Terms & Conditions');
      return;
    }

    setLoading(true);
    try {
      let data;
      if (isLogin) {
        data = await loginUser(email, password);
      } else {
        data = await registerUser(name, email, password, phone, countryCode, twoFactorCode, referralCode);
      }

      setLoading(false);
      setCompleted(true);

      // Save authenticated user & token to localStorage
      localStorage.setItem('cashXcrypto_token', data.token);
      localStorage.setItem('cashXcrypto_user', JSON.stringify({
        id: data._id,
        name: data.name,
        email: data.email,
        phone: `${data.countryCode} ${data.phone}`,
        countryCode: data.countryCode,
        role: data.role,
        kycStatus: data.kycStatus,
        cxId: data.cxId
      }));
    } catch (err) {
      setLoading(false);
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
    }
  };

  const handleModeToggle = () => {
    setIsLogin(!isLogin);
    setErrorMessage('');
    setCompleted(false);
    setPassword('');
    setConfirmPassword('');
    setPhone('');
    setName('');
    setTwoFactorCode('');
    setReferralCode('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="auth-modal-content">
        <button className="modal-close-btn" onClick={onClose} style={{ top: '22px', right: '22px', zIndex: 10 }}>
          <X className="w-5 h-5" />
        </button>

        {/* Left Side marketing/features panel (hidden on mobile) */}
        <div className="auth-modal-left" style={{ zIndex: 1 }}>
          <div>
            <div className="logo" style={{ marginBottom: '40px', display: 'flex', alignItems: 'center' }}>
              <img src={siteLogo} alt="Logo" style={{ width: '38px', height: '38px', borderRadius: '6px', objectFit: 'cover', marginRight: '10px' }} />
              <span style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.5px' }}>CASH<span className="gradient-text">XCRYPTO</span></span>
            </div>

            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', lineHeight: '1.3', marginBottom: '24px', background: 'linear-gradient(135deg, #fff 0%, var(--text-secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Start Exchanging Crypto <span className="gradient-text">Instantly & Securely</span>
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(189, 52, 254, 0.1)', border: '1px solid rgba(189, 52, 254, 0.2)', padding: '8px', borderRadius: '8px', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap style={{ width: '18px', height: '18px' }} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: '700', marginBottom: '3px', color: 'var(--text-primary)' }}>Instant Settlements in minutes</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Transfer BTC, ETH, stablecoins directly to your UPI ID or bank account.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(189, 52, 254, 0.1)', border: '1px solid rgba(189, 52, 254, 0.2)', padding: '8px', borderRadius: '8px', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Shield style={{ width: '18px', height: '18px' }} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: '700', marginBottom: '3px', color: 'var(--text-primary)' }}>FIU Compliant & Secure</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Fully compliant with Indian regulations, ensuring clean and audited funds.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(189, 52, 254, 0.1)', border: '1px solid rgba(189, 52, 254, 0.2)', padding: '8px', borderRadius: '8px', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp style={{ width: '18px', height: '18px' }} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: '700', marginBottom: '3px', color: 'var(--text-primary)' }}>Best OTC Rates</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>Live institutional exchange rates with zero hidden markups or gas fee surprises.</p>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '30px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '20px', marginTop: '30px' }}>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>₹50Cr+</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Volume Exchanged</div>
            </div>
            <div style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.05)', paddingLeft: '30px' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>10,000+</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active Users</div>
            </div>
          </div>
        </div>

        {/* Right Side Form Panel */}
        <div className="auth-modal-right">
          {!completed ? (
            <>
              {/* Modal Heading & Auth Switcher Tabs */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '14px' }}>
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </h3>
                <div
                  style={{
                    display: 'inline-flex',
                    background: 'var(--bg-tertiary)',
                    padding: '4px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => { setIsLogin(true); setErrorMessage(''); }}
                    style={{
                      border: 'none',
                      background: isLogin ? 'rgba(189, 52, 254, 0.1)' : 'transparent',
                      color: isLogin ? 'var(--color-primary)' : 'var(--text-secondary)',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                      padding: '6px 16px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsLogin(false); setErrorMessage(''); }}
                    style={{
                      border: 'none',
                      background: !isLogin ? 'rgba(189, 52, 254, 0.1)' : 'transparent',
                      color: !isLogin ? 'var(--color-primary)' : 'var(--text-secondary)',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                      padding: '6px 16px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    Register
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div
                  style={{
                    padding: '10px 14px',
                    background: 'rgba(255, 23, 68, 0.1)',
                    border: '1px solid var(--danger)',
                    color: 'var(--danger)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    marginBottom: '16px'
                  }}
                >
                  ⚠️ {errorMessage}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {!isLogin && (
                  <div className="step-form-group">
                    <label className="input-label">Full Name</label>
                    <input
                      type="text"
                      className="step-input"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="step-form-group">
                  <label className="input-label">Email Address</label>
                  <input
                    type="email"
                    className="step-input"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {!isLogin && (
                  <div className="step-form-group">
                    <label className="input-label">Phone Number</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '10px' }}>
                      <select
                        className="step-input"
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        style={{ background: 'var(--bg-secondary)', padding: '10px', fontSize: '0.82rem' }}
                      >
                        {COUNTRIES.map((c, idx) => (
                          <option key={idx} value={c.code}>
                            {c.name} ({c.code})
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        className="step-input"
                        placeholder="9876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        pattern="^[0-9]{7,15}$"
                        title="Enter a valid phone number (digits only)"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="step-form-group">
                  <label className="input-label">Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="step-input"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={6}
                      required
                      style={{ paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0
                      }}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>


                {!isLogin && (
                  <>
                    <div className="step-form-group">
                      <label className="input-label">Confirm Password</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          className="step-input"
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          minLength={6}
                          required
                          style={{ paddingRight: '40px' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0
                          }}
                        >
                          {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                      </div>
                    </div>

                    <div className="step-form-group">
                      <label className="input-label">Set 6-Digit Two-Factor PIN (2FA)</label>
                      <input
                        type="text"
                        pattern="[0-9]{6}"
                        maxLength={6}
                        className="step-input"
                        placeholder="e.g. 123456"
                        value={twoFactorCode}
                        onChange={(e) => {
                          const clean = e.target.value.replace(/\D/g, '');
                          setTwoFactorCode(clean);
                        }}
                        required
                      />
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                        ⚠️ Memorize this PIN; it is required for all crypto withdrawals.
                      </span>
                    </div>

                    <div className="step-form-group">
                      <label className="input-label">Referral Code (Optional)</label>
                      <input
                        type="text"
                        className="step-input"
                        placeholder="e.g. REF-123456"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      />
                    </div>

                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.78rem', color: 'var(--text-secondary)', cursor: 'pointer', marginTop: '4px' }}>
                      <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        style={{ marginTop: '2px' }}
                      />
                      <span>
                        I agree to cashXcrypto's <a href="#terms" onClick={(e) => e.preventDefault()} style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>Terms of Service</a> & <a href="#privacy" onClick={(e) => e.preventDefault()} style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>Privacy Policy</a>.
                      </span>
                    </label>
                  </>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '10px' }}
                  disabled={loading}
                >
                  {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <div className="status-spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    isLogin ? 'Sign In' : 'Create Account'
                  )}
                </button>



                <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button
                    type="button"
                    onClick={handleModeToggle}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-primary)',
                      fontWeight: '600',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    {isLogin ? 'Sign Up' : 'Log In'}
                  </button>
                </div>

              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
              <div className="status-spinner-completed" style={{ margin: '0 auto 24px', width: '80px', height: '80px' }}>
                <Check style={{ width: '40px', height: '40px' }} />
              </div>

              <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '10px' }}>
                {isLogin ? 'Successfully Logged In!' : 'Registration Complete!'}
              </h3>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: '1.5' }}>
                {isLogin
                  ? 'Welcome back to cashXcrypto. You can now execute premium instant settlements.'
                  : 'Your virtual asset account is ready. Complete basic KYC inside the portal to start exchanging larger volumes.'}
              </p>

              <button
                className="btn btn-primary"
                onClick={() => {
                  onClose();
                  const userJson = localStorage.getItem('cashXcrypto_user');
                  const userObj = userJson ? JSON.parse(userJson) : null;
                  if (onAuthSuccess && userObj) {
                    onAuthSuccess(userObj);
                  }
                }}
                style={{ width: '100%', padding: '12px' }}
              >
                Enter Platform
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
