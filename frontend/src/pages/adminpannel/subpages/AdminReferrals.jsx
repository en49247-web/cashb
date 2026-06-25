import React, { useState, useEffect } from 'react';
import { fetchReferralConfig, saveReferralConfig, fetchAllReferrals, manualCreditReferral } from '../../../services/auth';

function AdminReferrals() {
  const [commissionPct, setCommissionPct] = useState('0.1');
  const [kycReward, setKycReward] = useState('10.0');
  const [userKycReward, setUserKycReward] = useState('5.0');
  const [minKycRewardDeposit, setMinKycRewardDeposit] = useState('100.0');
  const [minTransferAmount, setMinTransferAmount] = useState('50');
  const [referrals, setReferrals] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadConfig = async () => {
    try {
      setLoading(true);
      const res = await fetchReferralConfig();
      if (res.config) {
        setCommissionPct(String(res.config.commissionPercentage ?? '0.1'));
        setKycReward(String(res.config.kycReward ?? '10.0'));
        setUserKycReward(String(res.config.userKycReward ?? '5.0'));
        setMinKycRewardDeposit(String(res.config.minKycRewardDeposit ?? '100.0'));
        setMinTransferAmount(String(res.config.minTransferAmount ?? '50'));
      }
      
      const resRefs = await fetchAllReferrals();
      if (resRefs && resRefs.referrals) {
        setReferrals(resRefs.referrals);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch referral configurations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await saveReferralConfig({
        commissionPercentage: Number(commissionPct),
        kycReward: Number(kycReward),
        userKycReward: Number(userKycReward),
        minKycRewardDeposit: Number(minKycRewardDeposit),
        minTransferAmount: Number(minTransferAmount)
      });
      setSuccess(res.message || 'Referral configuration saved successfully.');
      
      // Reload referrals to reflect any changes
      const resRefs = await fetchAllReferrals();
      if (resRefs && resRefs.referrals) {
        setReferrals(resRefs.referrals);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to update referral configurations.');
    } finally {
      setSaving(false);
    }
  };

  const handleManualCredit = async (refId) => {
    if (!window.confirm('Are you sure you want to manually credit the referral KYC reward for this account?')) {
      return;
    }
    
    setError('');
    setSuccess('');
    try {
      const res = await manualCreditReferral(refId);
      setSuccess(res.message || 'KYC reward credited successfully!');
      
      // Reload referrals list
      const resRefs = await fetchAllReferrals();
      if (resRefs && resRefs.referrals) {
        setReferrals(resRefs.referrals);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to credit referral reward.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <div className="status-spinner" style={{ width: '30px', height: '30px' }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3 style={{ fontSize: '1.35rem', fontWeight: '900', letterSpacing: '-0.5px', margin: 0 }}>
        Referral System Configuration & Control
      </h3>
      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '-8px' }}>
        Configure the commission percentage for trade transactions, the flat bonus reward when referred users verify their KYC, and transfer limits.
      </p>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '10px',
          padding: '12px 16px',
          fontSize: '0.8rem',
          color: '#ef4444'
        }}>
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: '10px',
          padding: '12px 16px',
          fontSize: '0.8rem',
          color: '#10b981'
        }}>
          ✓ {success}
        </div>
      )}

      <div className="glass-panel" style={{ padding: '28px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label className="input-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Base Referral Commission (%)
            </label>
            <input 
              type="number" 
              className="step-input" 
              value={commissionPct} 
              onChange={(e) => setCommissionPct(e.target.value)} 
              step="any"
              min="0"
              required 
              placeholder="e.g. 0.1"
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
              Percentage reward given to referrers based on transaction values completed by their referrals.
            </span>
          </div>

          <div>
            <label className="input-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              KYC Completion Reward (USDT)
            </label>
            <input 
              type="number" 
              className="step-input" 
              value={kycReward} 
              onChange={(e) => setKycReward(e.target.value)} 
              step="any"
              min="0"
              required 
              placeholder="e.g. 10"
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
              One-time flat bonus credited in USDT to the referrer when a referred user is KYC Verified.
            </span>
          </div>

          <div>
            <label className="input-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              KYC Verified User Reward (USDT)
            </label>
            <input 
              type="number" 
              className="step-input" 
              value={userKycReward} 
              onChange={(e) => setUserKycReward(e.target.value)} 
              step="any"
              min="0"
              required 
              placeholder="e.g. 5"
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
              One-time flat bonus credited directly to the user's USDT wallet balance when they complete their own KYC verification.
            </span>
          </div>

          <div>
            <label className="input-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Minimum Deposit for KYC Reward (USDT)
            </label>
            <input 
              type="number" 
              className="step-input" 
              value={minKycRewardDeposit} 
              onChange={(e) => setMinKycRewardDeposit(e.target.value)} 
              step="any"
              min="0"
              required 
              placeholder="e.g. 100"
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
              Minimum total completed deposits in USDT required from the referred user before the KYC rewards (both Referrer and Self) are automatically credited.
            </span>
          </div>

          <div>
            <label className="input-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Minimum USDT to Transfer to Wallet
            </label>
            <input 
              type="number" 
              className="step-input" 
              value={minTransferAmount} 
              onChange={(e) => setMinTransferAmount(e.target.value)} 
              step="any"
              min="0.01"
              required 
              placeholder="e.g. 50"
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
              Minimum referral wallet balance required before a user can transfer earnings to their main USDT wallet.
            </span>
          </div>

          <button 
            type="submit" 
            disabled={saving}
            className="btn btn-primary" 
            style={{ 
              padding: '14px', 
              fontSize: '0.9rem', 
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, var(--danger), #ff6b6b)'
            }}
          >
            {saving ? (
              <>
                <div className="status-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                Saving settings...
              </>
            ) : (
              'Save Configuration'
            )}
          </button>
        </form>
      </div>

      {/* Referred Accounts control ledger */}
      <div className="glass-panel" style={{ padding: '28px', marginTop: '12px' }}>
        <h4 style={{ fontSize: '1.05rem', fontWeight: '800', marginBottom: '16px', color: 'var(--color-primary)' }}>
          👥 Referred Accounts & Rewards Directory ({referrals.length})
        </h4>
        
        {referrals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No referral relations recorded in the system yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="rates-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '650px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Referred User</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Referrer (Inviter)</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>KYC Status</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Reward Status</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((ref) => (
                  <tr key={ref._id || ref.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff' }}>{ref.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{ref.email}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontFamily: 'monospace', fontWeight: '700', marginTop: '2px' }}>
                        {ref.cxId ? ref.cxId.toUpperCase() : 'N/A'}
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {ref.referredBy ? (
                        <>
                          <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff' }}>{ref.referredBy.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{ref.referredBy.email}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontFamily: 'monospace', fontWeight: '700', marginTop: '2px' }}>
                            {ref.referredBy.cxId ? ref.referredBy.cxId.toUpperCase() : 'N/A'}
                          </div>
                        </>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Direct Signup</span>
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        fontSize: '0.7rem', 
                        fontWeight: '800', 
                        padding: '3px 8px', 
                        borderRadius: '20px', 
                        textTransform: 'uppercase',
                        border: '1px solid',
                        background: ref.kycStatus === 'Verified' ? 'rgba(16, 185, 129, 0.08)' : ref.kycStatus === 'Pending' ? 'rgba(251, 191, 36, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                        borderColor: ref.kycStatus === 'Verified' ? '#10b981' : ref.kycStatus === 'Pending' ? '#fbbf24' : '#ef4444',
                        color: ref.kycStatus === 'Verified' ? '#34d399' : ref.kycStatus === 'Pending' ? '#fbbf24' : '#f87171'
                      }}>
                        {ref.kycStatus}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {ref.kycRewardClaimed ? (
                        <span style={{ color: '#10b981', fontWeight: '700', fontSize: '0.85rem' }}>✓ Credited</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Unpaid</span>
                      )}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {ref.kycRewardClaimed ? (
                        <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '700' }}>Claimed</span>
                      ) : ref.kycStatus === 'Verified' ? (
                        <button
                          onClick={() => handleManualCredit(ref._id || ref.id)}
                          className="btn btn-primary"
                          style={{ padding: '5px 10px', fontSize: '0.7rem', fontWeight: '800', borderRadius: '6px' }}
                        >
                          💸 Pay Reward
                        </button>
                      ) : (
                        <button
                          disabled
                          className="btn btn-secondary"
                          style={{ padding: '5px 10px', fontSize: '0.7rem', fontWeight: '700', borderRadius: '6px', opacity: 0.5, cursor: 'not-allowed' }}
                        >
                          Awaiting KYC
                        </button>
                      )}
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

export default AdminReferrals;
