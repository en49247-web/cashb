import React, { useState, useEffect } from 'react';
import { Copy } from '../../../components/Icons';
import { fetchUserReferrals, transferReferralEarnings } from '../../../services/auth';

function UserReferrals() {
  const [data, setData] = useState({
    referralCode: '',
    referralWallet: 0,
    referralEarnings: 0,
    minTransferAmount: 50,
    minKycRewardDeposit: 100.0,
    kycReward: 10.0,
    userKycReward: 5.0,
    commissionPercentage: 0.1,
    referredUsers: []
  });

  const [loading, setLoading] = useState(true);
  const [transferring, setTransferring] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);

  const loadReferrals = async () => {
    try {
      setLoading(true);
      const res = await fetchUserReferrals();
      setData(res);
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load referral details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReferrals();
  }, []);

  const handleCopy = () => {
    const referralLink = `${window.location.origin}/?ref=${data.referralCode}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTransfer = async () => {
    const minLimit = data.minTransferAmount || 50;
    if (data.referralWallet < minLimit) {
      alert(`Minimum amount to transfer is ${minLimit} USDT. Your current balance is ${data.referralWallet.toFixed(4)} USDT.`);
      setError(`Minimum amount to transfer is ${minLimit} USDT.`);
      return;
    }

    setTransferring(true);
    setError('');
    setSuccess('');
    try {
      const res = await transferReferralEarnings();
      setSuccess(res.message || 'Referral earnings successfully transferred to your main wallet.');
      // Refresh referrals data
      await loadReferrals();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to transfer referral earnings. Please try again.');
    } finally {
      setTransferring(false);
    }
  };

  const referralLink = data.referralCode ? `${window.location.origin}/?ref=${data.referralCode}` : 'Loading...';

  if (loading && !data.referralCode) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <div className="status-spinner" style={{ width: '40px', height: '40px', borderColor: 'var(--color-primary) transparent transparent transparent' }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .referral-container {
          animation: fadeInUp 0.35s ease both;
        }
        .referral-stat-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 24px;
          border-radius: 16px;
          text-align: center;
          transition: border-color 0.25s, transform 0.2s;
        }
        .referral-stat-card:hover {
          border-color: rgba(189, 52, 254, 0.2);
          transform: translateY(-2px);
        }
        .status-badge {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .status-badge.verified {
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: #10b981;
        }
        .status-badge.pending {
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.2);
          color: #f59e0b;
        }
        .status-badge.unverified {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }
        .status-badge.rejected {
          background: rgba(107, 114, 128, 0.08);
          border: 1px solid rgba(107, 114, 128, 0.2);
          color: #9ca3af;
        }
      `}</style>

      <div className="referral-container">
        <h3 style={{ fontSize: '1.4rem', fontWeight: '900', marginBottom: '8px', letterSpacing: '-0.5px' }}>
          cashXcrypto Referral Center
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          Earn ongoing rewards when users sign up with your code. Receive a flat one-time bonus of <strong style={{ color: 'var(--color-primary)' }}>{data.kycReward || 10} USDT</strong> when they complete KYC verification and make deposits, plus commission on all of their trade transaction fees.
        </p>
      </div>

      {/* Status Banners */}
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '12px',
          padding: '14px 18px',
          fontSize: '0.85rem',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '1.1rem' }}>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: '12px',
          padding: '14px 18px',
          fontSize: '0.85rem',
          color: '#10b981',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '1.1rem' }}>✓</span>
          <span>{success}</span>
        </div>
      )}

      {/* Referral Link Card (Placed on top!) */}
      <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(189, 52, 254, 0.04) 0%, rgba(6, 9, 20, 0.45) 100%)', marginBottom: '20px' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: '900', marginBottom: '14px', color: '#fff', letterSpacing: '-0.3px' }}>Share Referral Invitation</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="input-label" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Your Custom Invite Link</label>
            <div className="address-copy-container" style={{
              width: '100%',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '12px 16px',
              borderRadius: '10px',
              gap: '10px',
              marginTop: '6px'
            }}>
              <span className="address-text" style={{
                fontFamily: 'monospace',
                fontSize: '0.82rem',
                color: 'var(--text-primary)',
                wordBreak: 'break-all',
                flex: 1,
                textAlign: 'left',
                lineHeight: '1.4'
              }}>
                {referralLink}
              </span>
              <button className="btn-copy" onClick={handleCopy} style={{ flexShrink: 0, padding: '6px' }} title="Copy Link">
                {copied ? <span style={{ fontSize: '0.72rem', color: 'var(--success)', fontWeight: '700' }}>Copied!</span> : <Copy />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px'
      }}>
        {/* Total Earned */}
        <div className="referral-stat-card">
          <div style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Total Commission Earned
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff', fontFamily: 'monospace' }}>
            {data.referralEarnings.toFixed(4)} <span style={{ fontSize: '1rem', color: 'var(--color-primary)', fontWeight: '700' }}>USDT</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            Lifetime referral rewards
          </div>
        </div>

        {/* Current Balance */}
        <div className="referral-stat-card" style={{ background: 'rgba(189, 52, 254, 0.03)', borderColor: 'rgba(189, 52, 254, 0.15)' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--color-primary)', marginBottom: '8px' }}>
            Available Wallet Balance
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--color-primary)', fontFamily: 'monospace' }}>
            {data.referralWallet.toFixed(4)} <span style={{ fontSize: '1rem', color: '#fff', fontWeight: '700' }}>USDT</span>
          </div>
          <button
            onClick={handleTransfer}
            disabled={transferring}
            className="btn btn-primary"
            style={{
              marginTop: '12px',
              padding: '8px 16px',
              fontSize: '0.78rem',
              fontWeight: '800',
              borderRadius: '8px',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            {transferring ? (
              <>
                <div className="status-spinner" style={{ width: '12px', height: '12px', borderWidth: '1.5px' }} />
                Transferring...
              </>
            ) : (
              'Transfer to Main USDT Balance'
            )}
          </button>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px', fontWeight: '600' }}>
            Min Transfer Limit: {data.minTransferAmount ?? 50} USDT
          </div>
        </div>

        {/* Active Signups Count */}
        <div className="referral-stat-card">
          <div style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Referred Signups
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff' }}>
            {data.referredUsers.length} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: '700' }}>Users</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '12px' }}>
            Successfully joined cashXcrypto
          </div>
        </div>
      </div>



      {/* Visual How to Earn Guide */}
      <div className="glass-panel" style={{ padding: '28px', background: 'linear-gradient(135deg, rgba(189, 52, 254, 0.02) 0%, rgba(6, 9, 20, 0.4) 100%)' }}>
        <h4 style={{ fontSize: '1.05rem', fontWeight: '900', marginBottom: '20px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>💡</span> How You Can Earn Rewards
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '24px'
        }}>
          {/* Step 1 */}
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(189, 52, 254, 0.1)',
              border: '1px solid rgba(189, 52, 254, 0.3)',
              color: 'var(--color-primary)',
              fontWeight: '900',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              1
            </div>
            <div>
              <h5 style={{ fontSize: '0.88rem', fontWeight: '800', margin: '0 0 6px 0', color: '#fff' }}>Share Invitation Link</h5>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
                Copy your custom invite link above and send it to your friends, family, or share it on social media platforms.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(251, 191, 36, 0.1)',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              color: '#fbbf24',
              fontWeight: '900',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              2
            </div>
            <div>
              <h5 style={{ fontSize: '0.88rem', fontWeight: '800', margin: '0 0 6px 0', color: '#fff' }}>Get KYC Rewards</h5>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
                When your referred friend completes verification and has deposited a total of <strong style={{ color: '#fbbf24' }}>{data.minKycRewardDeposit || 100}+ USDT</strong>, they receive a <strong style={{ color: '#fbbf24' }}>{data.userKycReward || 5} USDT</strong> bonus and you receive a <strong style={{ color: '#fbbf24' }}>{data.kycReward || 10} USDT</strong> bonus!
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10b981',
              fontWeight: '900',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              3
            </div>
            <div>
              <h5 style={{ fontSize: '0.88rem', fontWeight: '800', margin: '0 0 6px 0', color: '#fff' }}>Earn Trade Commission</h5>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
                You also receive a recurring lifetime commission of <strong style={{ color: '#10b981' }}>{(Number(data.commissionPercentage) || 0.1).toFixed(1)}%</strong> on all exchange transaction values completed by your referrals.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Referred Users Table */}
      <div className="glass-panel" style={{ padding: '24px', overflow: 'hidden' }}>
        <h4 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '16px' }}>Referred Users Directory</h4>
        {data.referredUsers.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            No users have signed up with your referral code yet. Invite friends to start earning rewards!
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '550px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '12px' }}>
                  <th style={{ padding: '12px 10px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>User</th>
                  <th style={{ padding: '12px 10px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Joined Date</th>
                  <th style={{ padding: '12px 10px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>KYC Status</th>
                </tr>
              </thead>
              <tbody>
                {data.referredUsers.map((user, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)', height: '52px' }}>
                    <td style={{ padding: '10px', verticalAlign: 'middle' }}>
                      <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#fff' }}>{user.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'monospace' }}>{user.email}</div>
                    </td>
                    <td style={{ padding: '10px', fontSize: '0.83rem', color: 'var(--text-secondary)', verticalAlign: 'middle' }}>
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td style={{ padding: '10px', verticalAlign: 'middle' }}>
                      <span className={`status-badge ${user.kycStatus.toLowerCase()}`}>
                        {user.kycStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserReferrals;
