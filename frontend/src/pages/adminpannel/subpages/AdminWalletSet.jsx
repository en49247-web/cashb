import React, { useState, useEffect } from 'react';
import { fetchDepositWalletsManage, saveDepositWalletsManageApi } from '../../../services/admin';

const COIN_META = {
  USDT_TRC20: {
    label: 'USDT — TRC20',
    fullName: 'Tether USD (TRON Network)',
    network: 'TRC20',
    color: '#26a17b',
    glow: 'rgba(38,161,123,0.2)',
    border: 'rgba(38,161,123,0.25)',
    bg: 'rgba(38,161,123,0.06)',
    icon: '₮',
    placeholder: 'T... (TRC20 address, starts with T)'
  },
  USDT_BEP20: {
    label: 'USDT — BEP20',
    fullName: 'Tether USD (BNB Smart Chain)',
    network: 'BEP20',
    color: '#f3ba2f',
    glow: 'rgba(243,186,47,0.2)',
    border: 'rgba(243,186,47,0.25)',
    bg: 'rgba(243,186,47,0.06)',
    icon: '₮',
    placeholder: '0x... (BEP20 address, starts with 0x)'
  },
  BTC: {
    label: 'Bitcoin',
    fullName: 'Bitcoin (BTC Network)',
    network: 'Bitcoin',
    color: '#f7931a',
    glow: 'rgba(247,147,26,0.2)',
    border: 'rgba(247,147,26,0.25)',
    bg: 'rgba(247,147,26,0.06)',
    icon: '₿',
    placeholder: 'bc1... or 1... or 3... (BTC address)'
  },
  ETH: {
    label: 'Ethereum',
    fullName: 'Ethereum (ERC20 Network)',
    network: 'ERC20',
    color: '#627eea',
    glow: 'rgba(98,126,234,0.2)',
    border: 'rgba(98,126,234,0.25)',
    bg: 'rgba(98,126,234,0.06)',
    icon: 'Ξ',
    placeholder: '0x... (ERC20 address, starts with 0x)'
  },
  USDC: {
    label: 'USD Coin',
    fullName: 'USD Coin (Multi-chain)',
    network: 'ERC20 / BEP20',
    color: '#2775ca',
    glow: 'rgba(39,117,202,0.2)',
    border: 'rgba(39,117,202,0.25)',
    bg: 'rgba(39,117,202,0.06)',
    icon: '$',
    placeholder: '0x... (USDC address, starts with 0x)'
  },
  TRX: {
    label: 'Tron',
    fullName: 'Tron (TRX TRC20)',
    network: 'TRC20',
    color: '#ec0623',
    glow: 'rgba(236,6,35,0.2)',
    border: 'rgba(236,6,35,0.25)',
    bg: 'rgba(236,6,35,0.06)',
    icon: 'T',
    placeholder: 'T... (TRX address, starts with T)'
  }
};

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}

function AdminWalletSet() {
  const [wallets, setWallets] = useState({
    USDT_TRC20: [], USDT_BEP20: [], BTC: [], ETH: [], USDC: [], TRX: []
  });
  const [newAddresses, setNewAddresses] = useState({
    USDT_TRC20: '', USDT_BEP20: '', BTC: '', ETH: '', USDC: '', TRX: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copiedAddr, setCopiedAddr] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadWallets = async () => {
      try {
        const addr = await fetchDepositWalletsManage();
        if (addr) {
          const normalise = (v) =>
            Array.isArray(v) ? v : v ? [v] : [];
          setWallets({
            USDT_TRC20: normalise(addr.USDT_TRC20),
            USDT_BEP20: normalise(addr.USDT_BEP20),
            BTC: normalise(addr.BTC),
            ETH: normalise(addr.ETH),
            USDC: normalise(addr.USDC),
            TRX: normalise(addr.TRX)
          });
        }
      } catch (err) {
        console.error('Failed to load deposit wallets:', err);
      } finally {
        setLoading(false);
      }
    };
    loadWallets();
  }, []);

  const handleAdd = (coinKey) => {
    const addr = newAddresses[coinKey]?.trim();
    if (!addr) {
      setErrors(p => ({ ...p, [coinKey]: 'Please enter a wallet address.' }));
      return;
    }
    if (wallets[coinKey].includes(addr)) {
      setErrors(p => ({ ...p, [coinKey]: 'This address is already added.' }));
      return;
    }
    setWallets(p => ({ ...p, [coinKey]: [...p[coinKey], addr] }));
    setNewAddresses(p => ({ ...p, [coinKey]: '' }));
    setErrors(p => ({ ...p, [coinKey]: null }));
  };

  const handleDelete = (coinKey, idx) => {
    setWallets(p => ({ ...p, [coinKey]: p[coinKey].filter((_, i) => i !== idx) }));
  };

  const handleCopy = (addr) => {
    navigator.clipboard.writeText(addr);
    setCopiedAddr(addr);
    setTimeout(() => setCopiedAddr(null), 2000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const emptyKeys = Object.keys(COIN_META).filter(k => wallets[k].length === 0);
    if (emptyKeys.length > 0) {
      if (!window.confirm(
        `Warning: No addresses configured for:\n${emptyKeys.join(', ')}\n\nUsers won't see a payment address for these coins. Save anyway?`
      )) return;
    }
    setSaving(true);
    try {
      await saveDepositWalletsManageApi(wallets);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(`Error saving wallets: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const totalAddresses = Object.values(wallets).reduce((s, a) => s + a.length, 0);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Loading wallet configurations...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .wallet-card {
          animation: fadeSlideIn 0.3s ease both;
          transition: box-shadow 0.2s;
        }
        .wallet-card:hover {
          box-shadow: 0 4px 32px rgba(0,0,0,0.3);
        }
        .addr-row {
          transition: background 0.15s;
        }
        .addr-row:hover {
          background: rgba(255,255,255,0.04) !important;
        }
        .add-input {
          flex: 1;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          color: #fff;
          font-size: 0.82rem;
          padding: 10px 14px;
          outline: none;
          font-family: 'SF Mono', monospace;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .add-input:focus {
          border-color: var(--coin-color);
          box-shadow: 0 0 0 2px var(--coin-glow);
        }
        .add-input::placeholder { opacity: 0.35; }
        .add-btn {
          display: flex; align-items: center; gap: 6px;
          background: var(--coin-bg);
          border: 1px solid var(--coin-border);
          color: var(--coin-color);
          border-radius: 8px;
          padding: 10px 18px;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s, transform 0.15s;
          white-space: nowrap;
        }
        .add-btn:hover {
          background: var(--coin-color);
          color: #000;
          transform: translateY(-1px);
        }
        .delete-btn {
          background: none;
          border: none;
          color: rgba(239,68,68,0.5);
          cursor: pointer;
          padding: 5px 8px;
          border-radius: 6px;
          display: flex; align-items: center; gap: 5px;
          font-size: 0.75rem; font-weight: 600;
          transition: all 0.15s;
        }
        .delete-btn:hover {
          color: #ef4444;
          background: rgba(239,68,68,0.1);
        }
        .copy-btn {
          background: none;
          border: none;
          color: rgba(255,255,255,0.3);
          cursor: pointer;
          padding: 3px 6px;
          border-radius: 4px;
          display: inline-flex; align-items: center;
          transition: all 0.15s;
        }
        .copy-btn:hover { color: #fff; background: rgba(255,255,255,0.06); }
      `}</style>

      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: '900', margin: 0, letterSpacing: '-0.5px' }}>
            Deposit Wallet Rotation
          </h3>
          <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginTop: '6px', maxWidth: '520px' }}>
            Configure multiple receiving addresses per coin. The system round-robins them for each user deposit, preventing address reuse.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* Stats pill */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px', padding: '10px 18px', fontSize: '0.8rem'
            }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Total Addresses</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#fff' }}>{totalAddresses}</div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px', padding: '10px 18px', fontSize: '0.8rem'
            }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Coin Types</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#fff' }}>
                {Object.values(wallets).filter(a => a.length > 0).length}/{Object.keys(COIN_META).length}
              </div>
            </div>
          </div>

          {/* Top Save button */}
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '12px 24px',
              background: saved
                ? 'linear-gradient(135deg, #059669, #10b981)'
                : 'linear-gradient(135deg, var(--danger), #ff6b6b)',
              border: 'none', borderRadius: '10px', color: '#fff',
              fontSize: '0.88rem', fontWeight: '800', cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              opacity: saving ? 0.8 : 1,
              transition: 'all 0.2s',
              boxShadow: saved ? '0 4px 16px rgba(16,185,129,0.2)' : '0 4px 16px rgba(255,23,68,0.2)',
              whiteSpace: 'nowrap'
            }}
          >
            {saving ? (
              <>
                <div style={{
                  width: '14px', height: '14px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff', borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite'
                }} />
                Saving...
              </>
            ) : saved ? (
              <>✓ Saved!</>
            ) : (
              <>💾 Save Configuration</>
            )}
          </button>
        </div>
      </div>

      {/* Missing address alert */}
      {Object.keys(COIN_META).some(k => wallets[k].length === 0) && (
        <div style={{
          background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '10px', padding: '12px 18px', fontSize: '0.8rem', color: '#ef4444',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <span style={{ fontSize: '1.2rem' }}>⚠️</span>
          <span>
            <strong>Missing addresses:</strong>{' '}
            {Object.keys(COIN_META).filter(k => wallets[k].length === 0).join(', ')} — users won't see a deposit address for these coins.
          </span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {Object.keys(COIN_META).map((coinKey, i) => {
          const meta = COIN_META[coinKey];
          const addresses = wallets[coinKey] || [];
          const configured = addresses.length > 0;

          return (
            <div
              key={coinKey}
              className="wallet-card"
              style={{
                '--coin-color': meta.color,
                '--coin-glow': meta.glow,
                '--coin-border': meta.border,
                '--coin-bg': meta.bg,
                background: meta.bg,
                border: `1px solid ${configured ? meta.border : 'rgba(239,68,68,0.2)'}`,
                borderRadius: '16px',
                overflow: 'hidden',
                animationDelay: `${i * 0.07}s`
              }}
            >
              {/* Card top accent */}
              <div style={{
                height: '3px',
                background: configured
                  ? `linear-gradient(90deg, ${meta.color}, transparent)`
                  : 'linear-gradient(90deg, #ef4444, transparent)'
              }} />

              {/* Card header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '16px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                background: 'rgba(0,0,0,0.15)'
              }}>
                {/* Icon badge */}
                <div style={{
                  width: '42px', height: '42px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `rgba(0,0,0,0.4)`,
                  border: `2px solid ${meta.border}`,
                  fontSize: '1.1rem', fontWeight: '900', color: meta.color,
                  boxShadow: `0 0 14px ${meta.glow}`,
                  fontFamily: 'monospace', flexShrink: 0
                }}>
                  {meta.icon}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '800', fontSize: '0.98rem', color: '#fff' }}>{meta.label}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>{meta.fullName}</div>
                </div>

                {/* Network badge */}
                <span style={{
                  background: `rgba(0,0,0,0.3)`,
                  border: `1px solid ${meta.border}`,
                  color: meta.color,
                  fontSize: '0.68rem', fontWeight: '700',
                  padding: '3px 10px', borderRadius: '20px',
                  textTransform: 'uppercase', letterSpacing: '0.5px'
                }}>
                  {meta.network}
                </span>

                {/* Address count pill */}
                <span style={{
                  background: configured ? `rgba(0,0,0,0.3)` : 'rgba(239,68,68,0.1)',
                  border: `1px solid ${configured ? meta.border : 'rgba(239,68,68,0.3)'}`,
                  color: configured ? meta.color : '#ef4444',
                  fontSize: '0.75rem', fontWeight: '800',
                  padding: '4px 12px', borderRadius: '20px',
                  minWidth: '80px', textAlign: 'center'
                }}>
                  {addresses.length === 0 ? 'No address' : `${addresses.length} address${addresses.length > 1 ? 'es' : ''}`}
                </span>
              </div>

              {/* Address list */}
              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

                {addresses.length === 0 ? (
                  <div style={{
                    background: 'rgba(239,68,68,0.04)', border: '1px dashed rgba(239,68,68,0.2)',
                    borderRadius: '8px', padding: '14px',
                    textAlign: 'center', fontSize: '0.82rem', color: 'rgba(239,68,68,0.7)'
                  }}>
                    No addresses configured. Add one below ↓
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {addresses.map((addr, idx) => (
                      <div
                        key={idx}
                        className="addr-row"
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          background: 'rgba(0,0,0,0.2)',
                          border: '1px solid rgba(255,255,255,0.04)',
                          borderRadius: '8px', padding: '10px 14px'
                        }}
                      >
                        {/* Rotation index badge */}
                        <span style={{
                          background: meta.bg, border: `1px solid ${meta.border}`,
                          color: meta.color, borderRadius: '6px',
                          fontSize: '0.68rem', fontWeight: '800',
                          padding: '2px 8px', flexShrink: 0
                        }}>
                          #{idx + 1}
                        </span>

                        {/* Address text */}
                        <span style={{
                          flex: 1, fontFamily: 'monospace', fontSize: '0.78rem',
                          color: '#e0e0e0', wordBreak: 'break-all'
                        }}>
                          {addr}
                        </span>

                        {/* Copy */}
                        <button
                          type="button"
                          className="copy-btn"
                          onClick={() => handleCopy(addr)}
                          title="Copy address"
                        >
                          {copiedAddr === addr ? (
                            <span style={{ color: '#10b981', fontSize: '0.7rem', fontWeight: '700' }}>✓</span>
                          ) : (
                            <CopyIcon />
                          )}
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          className="delete-btn"
                          onClick={() => handleDelete(coinKey, idx)}
                          title="Remove address"
                        >
                          <TrashIcon />
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new address row */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                    <input
                      type="text"
                      className="add-input"
                      placeholder={meta.placeholder}
                      value={newAddresses[coinKey]}
                      onChange={(e) => {
                        setNewAddresses(p => ({ ...p, [coinKey]: e.target.value }));
                        if (errors[coinKey]) setErrors(p => ({ ...p, [coinKey]: null }));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); handleAdd(coinKey); }
                      }}
                      style={{ '--coin-color': meta.color, '--coin-glow': meta.glow }}
                    />
                    <button
                      type="button"
                      className="add-btn"
                      onClick={() => handleAdd(coinKey)}
                    >
                      <PlusIcon />
                      Add
                    </button>
                  </div>
                  {errors[coinKey] && (
                    <span style={{ fontSize: '0.74rem', color: '#ef4444', paddingLeft: '4px' }}>
                      ⚠ {errors[coinKey]}
                    </span>
                  )}
                </div>

              </div>
            </div>
          );
        })}

        {/* How rotation works info */}
        <div style={{
          background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: '10px', padding: '14px 18px',
          display: 'flex', gap: '14px', alignItems: 'flex-start'
        }}>
          <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>🔄</span>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            <strong style={{ color: '#a5b4fc' }}>Round-Robin Rotation:</strong> When a user initiates a deposit, the system cycles through your configured addresses in order (#1 → #2 → #3...). This distributes funds across multiple wallets and prevents address tracking.
          </div>
        </div>

      </div>

    </form>
  );
}

export default AdminWalletSet;
