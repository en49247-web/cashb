import React, { useState, useEffect } from 'react';
import { fetchExchangeLimits, saveExchangeLimitsApi, fetchSwapConfig, saveSwapConfigApi, fetchTelegramConfig, saveTelegramConfigApi } from '../../../services/admin';

function AdminSettings() {
  const [unverifiedLimit, setUnverifiedLimit] = useState('120');
  const [verifiedDailyLimit, setVerifiedDailyLimit] = useState('1200');
  const [minExchangeUsdt, setMinExchangeUsdt] = useState('100');
  const [swapFeePercent, setSwapFeePercent] = useState('0.5');

  // Telegram Config state
  const [botToken, setBotToken] = useState('');
  const [chatIds, setChatIds] = useState('');
  const [telegramEnabled, setTelegramEnabled] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const limitsRes = await fetchExchangeLimits();
        if (limitsRes.config) {
          setUnverifiedLimit(String(limitsRes.config.unverifiedLimit ?? '120'));
          setVerifiedDailyLimit(String(limitsRes.config.verifiedDailyLimit ?? '1200'));
          setMinExchangeUsdt(String(limitsRes.config.minExchangeUsdt ?? '100'));
        }
        
        const swapRes = await fetchSwapConfig();
        if (swapRes.config) {
          setSwapFeePercent(String(swapRes.config.swapFeePercent ?? '0.5'));
        }

        const telegramRes = await fetchTelegramConfig();
        if (telegramRes) {
          setBotToken(telegramRes.botToken || '');
          setChatIds(Array.isArray(telegramRes.chatIds) ? telegramRes.chatIds.join(', ') : '');
          setTelegramEnabled(!!telegramRes.enabled);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch platform configurations.');
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      // Save limits
      await saveExchangeLimitsApi({
        unverifiedLimit: Number(unverifiedLimit),
        verifiedDailyLimit: Number(verifiedDailyLimit),
        minExchangeUsdt: Number(minExchangeUsdt)
      });
      
      // Save swap config
      await saveSwapConfigApi({
        swapFeePercent: Number(swapFeePercent)
      });

      // Save Telegram Config
      await saveTelegramConfigApi({
        botToken,
        chatIds: chatIds.split(',').map(id => id.trim()).filter(Boolean),
        enabled: telegramEnabled
      });
      
      setSuccess('Platform settings, swap fee, and Telegram bot configurations updated successfully.');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
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
    <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3 style={{ fontSize: '1.35rem', fontWeight: '900', letterSpacing: '-0.5px', margin: 0 }}>
        Platform Settings & Limits
      </h3>
      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '-8px' }}>
        Configure transaction limits for users and adjust internal crypto swap fees.
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
              Unverified KYC Exchange Limit (USDT)
            </label>
            <input 
              type="number" 
              className="step-input" 
              value={unverifiedLimit} 
              onChange={(e) => setUnverifiedLimit(e.target.value)} 
              min="0"
              required 
              placeholder="e.g. 120"
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
              The maximum daily amount in USDT equivalent that an unverified user (or pending KYC) is allowed to exchange.
            </span>
          </div>

          <div>
            <label className="input-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Verified KYC Daily Exchange Limit (USDT)
            </label>
            <input 
              type="number" 
              className="step-input" 
              value={verifiedDailyLimit} 
              onChange={(e) => setVerifiedDailyLimit(e.target.value)} 
              min="0"
              required 
              placeholder="e.g. 1200"
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
              The maximum cumulative daily exchange volume in USDT equivalent allowed for KYC Verified users.
            </span>
          </div>

          <div>
            <label className="input-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Minimum Exchange Amount (USDT)
            </label>
            <input 
              type="number" 
              className="step-input" 
              value={minExchangeUsdt} 
              onChange={(e) => setMinExchangeUsdt(e.target.value)} 
              min="0"
              required 
              placeholder="e.g. 100"
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
              The minimum amount of USDT that a user is allowed to exchange/sell in a single order (default is 100 USDT).
            </span>
          </div>

          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '20px' }}>
            <label className="input-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Crypto Swap Fee Percentage (%)
            </label>
            <input 
              type="number" 
              className="step-input" 
              value={swapFeePercent} 
              onChange={(e) => setSwapFeePercent(e.target.value)} 
              min="0"
              max="100"
              step="any"
              required 
              placeholder="e.g. 0.5"
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
              The platform fee percentage charged for internal crypto-to-crypto swaps (e.g., 0.5% or 0.01%).
            </span>
          </div>

          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '20px' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '850', marginBottom: '8px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>📢</span> Telegram Notification Bot Config
            </h4>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Configure your custom Telegram Bot credentials to receive automated alerts for new user signups, deposit proof uploads, and completed exchange order transactions.
            </p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <input 
                type="checkbox" 
                id="telegramEnabled"
                checked={telegramEnabled}
                onChange={(e) => setTelegramEnabled(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#10b981' }}
              />
              <label htmlFor="telegramEnabled" style={{ fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', color: '#fff' }}>
                Enable Telegram Bot Notifications
              </label>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', opacity: telegramEnabled ? 1 : 0.5, pointerEvents: telegramEnabled ? 'auto' : 'none', transition: 'all 0.2s' }}>
              <div>
                <label className="input-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Telegram Bot Token
                </label>
                <input 
                  type="text" 
                  className="step-input" 
                  value={botToken} 
                  onChange={(e) => setBotToken(e.target.value)} 
                  required={telegramEnabled}
                  placeholder="e.g. 1234567890:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                />
              </div>

              <div>
                <label className="input-label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Admin Chat IDs (Comma-separated for multiple admins)
                </label>
                <input 
                  type="text" 
                  className="step-input" 
                  value={chatIds} 
                  onChange={(e) => setChatIds(e.target.value)} 
                  required={telegramEnabled}
                  placeholder="e.g. 987654321, -100123456789"
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                  Enter Telegram User IDs or group Chat IDs. Separate multiple entries with commas.
                </span>
              </div>
            </div>
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
              'Save Configurations'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminSettings;
