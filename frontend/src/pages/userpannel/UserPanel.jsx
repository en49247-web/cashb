import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { CoinIconLogo, Copy } from '../../components/Icons';
import siteLogo from '../../assets/logo.png';

// Import Subpages
import UserDashboard from './subpages/UserDashboard';
import UserExchange from './subpages/UserExchange';
import UserWallets from './subpages/UserWallets';
import UserBanks from './subpages/UserBanks';
import UserTransactions from './subpages/UserTransactions';
import UserReferrals from './subpages/UserReferrals';
import UserSecurity from './subpages/UserSecurity';
import UserKyc from './subpages/UserKyc';
import UserSupport from './subpages/UserSupport';
import UserSettings from './subpages/UserSettings';
import { fetchUserProfile, addBankAccount, updateBankAccount, verifyBankAccount, deleteBankAccount as deleteBankAccountApi, fetchUserOrders, submitDepositProof, fetchUserDeposits, submitWithdrawalRequest, fetchUserWithdrawals } from '../../services/auth';
import { fetchUsdtRate, fetchDepositWallets, fetchExchangeRates } from '../../services/admin';

// Inline Icons for Dashboard Sidebar & Navigation
const DashboardIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
);
const SwapIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 8 16 13"></polyline><line x1="21" y1="8" x2="9" y2="8"></line><polyline points="8 21 3 16 8 11"></polyline><line x1="3" y1="16" x2="15" y2="16"></line></svg>
);
const WalletIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h14v4"></path><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"></path><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"></path></svg>
);
const BankIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 22h18M6 18v-7M10 18v-7M14 18v-7M18 18v-7M12 2L2 7h20L12 2z"></path></svg>
);
const ListIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
);
const TrendingIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
);
const UsersIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
);
const SecurityIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
);
const ShieldCheckIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 11 11 13 15 9"></polyline></svg>
);
const SupportIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
);
const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
);
const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
);
const BellIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
);
const ChevronDownIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
);

// Map country codes to bank details fields
export const getBankFieldsByCountry = (countryCode) => {
  const code = countryCode ? countryCode.trim() : '+91';

  if (code === '+1') {
    return {
      countryName: 'USA / Canada',
      fields: [
        { key: 'name', label: 'Bank Name', placeholder: 'e.g. Chase Bank, TD Bank', required: true },
        { key: 'number', label: 'Account Number', placeholder: 'e.g. 1234567890', required: true },
        { key: 'ifsc', label: 'Routing / Transit Number', placeholder: 'e.g. 021000021', required: true, pattern: '^[0-9A-Za-z-]{9,15}$', title: 'Enter a valid routing/transit number (9-15 alphanumeric characters)' }
      ],
      codeLabel: 'Routing / Transit Number'
    };
  } else if (code === '+44') {
    return {
      countryName: 'United Kingdom',
      fields: [
        { key: 'name', label: 'Bank Name', placeholder: 'e.g. Barclays Bank', required: true },
        { key: 'number', label: 'Account Number', placeholder: 'e.g. 12345678', required: true },
        { key: 'ifsc', label: 'Sort Code', placeholder: 'e.g. 20-30-40', required: true, pattern: '^[0-9A-Za-z-]{6,8}$', title: 'Enter a valid sort code (6-8 characters)' }
      ],
      codeLabel: 'Sort Code'
    };
  } else if (code === '+49') {
    return {
      countryName: 'Germany / Europe',
      fields: [
        { key: 'name', label: 'Bank Name', placeholder: 'e.g. Deutsche Bank', required: true },
        { key: 'number', label: 'IBAN', placeholder: 'e.g. DE89370400440532013000', required: true, pattern: '^[A-Z0-9\\s]{15,34}$', title: 'Enter a valid IBAN' },
        { key: 'ifsc', label: 'BIC / SWIFT Code', placeholder: 'e.g. DEUTDEDDFXX', required: true, pattern: '^[A-Z0-9]{8,11}$', title: 'Enter a valid 8 or 11 character BIC/SWIFT code' }
      ],
      codeLabel: 'BIC / SWIFT Code'
    };
  } else if (code === '+61') {
    return {
      countryName: 'Australia',
      fields: [
        { key: 'name', label: 'Bank Name', placeholder: 'e.g. Commonwealth Bank', required: true },
        { key: 'number', label: 'Account Number', placeholder: 'e.g. 123456789', required: true },
        { key: 'ifsc', label: 'BSB Number', placeholder: 'e.g. 062-900', required: true, pattern: '^[0-9-]{6,7}$', title: 'Enter a valid 6-digit BSB number' }
      ],
      codeLabel: 'BSB Number'
    };
  } else if (code === '+91') {
    return {
      countryName: 'India',
      fields: [
        { key: 'name', label: 'Bank Name', placeholder: 'e.g. HDFC Bank', required: true },
        { key: 'number', label: 'Account Number', placeholder: 'e.g. 50100234857492', required: true },
        { key: 'ifsc', label: 'IFSC Code', placeholder: 'e.g. HDFC0000120', required: true, pattern: '^[A-Z]{4}0[A-Z0-9]{6}$', title: 'Enter a valid 11-digit IFSC code' }
      ],
      codeLabel: 'IFSC Code'
    };
  } else {
    // Default / other international countries (+92 Pakistan, +971 UAE, +966 Saudi Arabia, +65 Singapore, +880 Bangladesh, +977 Nepal, +94 Sri Lanka)
    let countryLabel = 'International';
    if (code === '+92') countryLabel = 'Pakistan';
    else if (code === '+971') countryLabel = 'UAE';
    else if (code === '+966') countryLabel = 'Saudi Arabia';
    else if (code === '+65') countryLabel = 'Singapore';
    else if (code === '+880') countryLabel = 'Bangladesh';
    else if (code === '+977') countryLabel = 'Nepal';
    else if (code === '+94') countryLabel = 'Sri Lanka';

    return {
      countryName: countryLabel,
      fields: [
        { key: 'name', label: 'Bank Name', placeholder: 'e.g. Standard Chartered', required: true },
        { key: 'number', label: 'IBAN / Account Number', placeholder: 'e.g. PK73UNIL0000001234567', required: true },
        { key: 'ifsc', label: 'SWIFT / BIC Code', placeholder: 'e.g. UNILPKKAXXX', required: true, pattern: '^[A-Z0-9]{8,11}$', title: 'Enter a valid 8 or 11 character SWIFT/BIC code' }
      ],
      codeLabel: 'SWIFT / BIC Code'
    };
  }
};

function UserPanel({ prices, onLogout, currentUser, setCurrentUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname.split('/').pop() || 'dashboard';

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('user_sidebar_collapsed') === 'true';
  });

  const [exchangeStep, setExchangeStep] = useState(1);

  useEffect(() => {
    localStorage.setItem('user_sidebar_collapsed', isSidebarCollapsed);
  }, [isSidebarCollapsed]);

  // Live Rates inside Dashboard state
  const [rateUSDT, setRateUSDT] = useState(85);
  const [rateBTC, setRateBTC] = useState(8540000);
  const [rateETH, setRateETH] = useState(210000);
  const [rateUSDC, setRateUSDC] = useState(88);
  const [rateTRX, setRateTRX] = useState(10);

  // Toast Notification state
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch and sync all custom rates from database
  useEffect(() => {
    const loadSavedRates = async () => {
      try {
        const data = await fetchExchangeRates(currentUser?.countryCode);
        if (data && data.rates) {
          setRateUSDT(data.rates.USDT ?? 85);
          setRateBTC(data.rates.BTC ?? 8540000);
          setRateETH(data.rates.ETH ?? 210000);
          setRateUSDC(data.rates.USDC ?? 88);
          setRateTRX(data.rates.TRX ?? 10);
        }
      } catch (err) {
        console.warn('Could not load custom exchange rates:', err.message);
      }
    };
    loadSavedRates();
  }, [currentUser?.countryCode]);

  // Real-time USDT rate and User notifications via WebSocket
  useEffect(() => {
    let ws = null;
    let reconnectTimer = null;

    const connect = () => {
      ws = new WebSocket('ws://localhost:5000/ws');

      ws.onopen = () => {
        console.log('[WS] Connected to rate feed');
        const userId = currentUser?._id || currentUser?.id;
        if (userId) {
          ws.send(JSON.stringify({
            type: 'SUBSCRIBE_USER',
            userId: String(userId)
          }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          const countryCode = currentUser?.countryCode || '+91';
          if (msg.type === 'RATE_UPDATE' && msg.data && msg.data.rate) {
            if (countryCode === '+91') {
              setRateUSDT(msg.data.rate);
            }
          } else if (msg.type === 'RATES_UPDATE' && msg.data && msg.data.rates) {
            const r = msg.data.rates[countryCode] || msg.data.rates;
            if (r) {
              setRateUSDT(r.USDT ?? 85);
              setRateBTC(r.BTC ?? 8540000);
              setRateETH(r.ETH ?? 210000);
              setRateUSDC(r.USDC ?? 88);
              setRateTRX(r.TRX ?? 10);
            }
          } else if (msg.type === 'KYC_UPDATE' && msg.data && msg.data.kycStatus) {
            setKycStatus(msg.data.kycStatus);
            // Sync with localStorage session
            const storedUser = localStorage.getItem('cashXcrypto_user');
            if (storedUser) {
              const parsed = JSON.parse(storedUser);
              parsed.kycStatus = msg.data.kycStatus;
              localStorage.setItem('cashXcrypto_user', JSON.stringify(parsed));
            }
            if (msg.data.kycStatus === 'Verified') {
              showToast('🎉 Congratulations! Your KYC has been approved by the compliance team.', 'success');
            } else if (msg.data.kycStatus === 'Rejected') {
              showToast('❌ Your KYC submission was rejected. Please review details and resubmit.', 'error');
            } else {
              showToast(`ℹ️ Your KYC status is now: ${msg.data.kycStatus}`, 'info');
            }
          } else if (msg.type === 'STATUS_UPDATE' && msg.data && msg.data.status) {
            if (msg.data.status === 'Blocked') {
              alert('Compliance Warning: Your account has been suspended by an administrator.');
              onLogout();
            } else {
              showToast(`🛡️ Your account status is now: ${msg.data.status}`, 'success');
            }
          }
        } catch (err) {
          console.warn('[WS] Failed to parse message:', err);
        }
      };

      ws.onclose = () => {
        console.log('[WS] Disconnected. Reconnecting in 3s...');
        reconnectTimer = setTimeout(connect, 3000);
      };

      ws.onerror = (err) => {
        console.warn('[WS] Error:', err);
        ws.close();
      };
    };

    // Also fetch once via HTTP as fallback (only for +91, non-+91 fetch via loadSavedRates hook)
    const loadInitialRate = async () => {
      try {
        const countryCode = currentUser?.countryCode || '+91';
        if (countryCode === '+91') {
          const data = await fetchUsdtRate();
          if (data && data.rate) {
            setRateUSDT(data.rate);
          }
        }
      } catch (err) {
        console.warn('Could not load USDT rate from database:', err.message);
      }
    };

    loadInitialRate();
    connect();

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws) {
        ws.onclose = null; // prevent reconnect on cleanup
        ws.close();
      }
    };
  }, [currentUser]);

  const [balances, setBalances] = useState({
    BTC: 0,
    ETH: 0,
    USDT: 0,
    USDC: 0,
    TRX: 0
  });

  // Bank accounts state
  const [bankAccounts, setBankAccounts] = useState([]);

  // KYC state
  const [kycStatus, setKycStatus] = useState(currentUser?.kycStatus || 'Unverified'); // Verified, Pending, Unverified
  const [showKycPromoModal, setShowKycPromoModal] = useState(false);

  useEffect(() => {
    if (kycStatus && kycStatus !== 'Verified' && activeTab !== 'kyc') {
      const dismissed = sessionStorage.getItem('cashXcrypto_kyc_dismissed');
      if (!dismissed) {
        setShowKycPromoModal(true);
      }
    }
  }, [kycStatus, activeTab]);

  // Sync user profile status on mount, tab changes, and periodically
  useEffect(() => {
    const syncProfile = async () => {
      try {
        const profile = await fetchUserProfile();
        if (profile) {
          setKycStatus(profile.kycStatus || 'Unverified');
          setBankAccounts(profile.bankAccounts || []);
          if (profile.balances) {
            setBalances({
              BTC: profile.balances.BTC ?? 0,
              ETH: profile.balances.ETH ?? 0,
              USDT: profile.balances.USDT ?? 0,
              USDC: profile.balances.USDC ?? 0,
              TRX: profile.balances.TRX ?? 0
            });
          }
          // Update parent state
          if (typeof setCurrentUser === 'function') {
            setCurrentUser(profile);
          }
          // Update localStorage
          localStorage.setItem('cashXcrypto_user', JSON.stringify(profile));
        }
      } catch (err) {
        console.warn('Could not sync user profile with database:', err.message);
      }
    };
    syncProfile();
    loadUserOrders();
    loadUserDeposits();
    loadUserWithdrawals();

    const interval = setInterval(() => {
      syncProfile();
      loadUserOrders();
      loadUserDeposits();
      loadUserWithdrawals();
    }, 10000);

    return () => clearInterval(interval);
  }, [activeTab]);

  // Transactions ledger state
  const [transactions, setTransactions] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);

  // Quick exchange widget form state
  const [exchangeCoin, setExchangeCoin] = useState('USDT');
  const [exchangeAmount, setExchangeAmount] = useState('100');
  const getExchangeRate = (coinSymbol = exchangeCoin) => {
    if (coinSymbol === 'USDT') return rateUSDT;
    if (coinSymbol === 'BTC') return rateBTC;
    if (coinSymbol === 'ETH') return rateETH;
    if (coinSymbol === 'USDC') return rateUSDC;
    if (coinSymbol === 'TRX') return rateTRX;
    return 100;
  };

  const getCurrencyConfig = () => {
    const CURRENCIES = {
      '+91': { symbol: '₹', code: 'INR', locale: 'en-IN' },
      '+1': { symbol: '$', code: 'USD', locale: 'en-US' },
      '+44': { symbol: '£', code: 'GBP', locale: 'en-GB' },
      '+92': { symbol: '₨', code: 'PKR', locale: 'en-PK' },
      '+971': { symbol: 'د.إ', code: 'AED', locale: 'ar-AE' },
      '+61': { symbol: '$', code: 'AUD', locale: 'en-AU' },
      '+49': { symbol: '€', code: 'EUR', locale: 'de-DE' },
      '+65': { symbol: '$', code: 'SGD', locale: 'en-SG' },
      '+966': { symbol: '﷼', code: 'SAR', locale: 'ar-SA' },
      '+880': { symbol: '৳', code: 'BDT', locale: 'bn-BD' },
      '+977': { symbol: '₨', code: 'NPR', locale: 'ne-NP' },
      '+94': { symbol: '₨', code: 'LKR', locale: 'si-LK' }
    };
    const code = currentUser?.countryCode || '+91';
    return CURRENCIES[code] || { symbol: '₹', code: 'INR', locale: 'en-IN' };
  };

  const formatUserCurrency = (val) => {
    const config = getCurrencyConfig();
    return `${config.symbol}${Number(val || 0).toLocaleString(config.locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })}`;
  };
  const exchangeRate = getExchangeRate();
  const receiveAmount = (parseFloat(exchangeAmount) || 0) * exchangeRate;

  // Add Bank Modal state
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [newBankName, setNewBankName] = useState('');
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [newIfsc, setNewIfsc] = useState('');

  // Deposit/Withdraw modals state
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [selectedTxCoin, setSelectedTxCoin] = useState('USDT');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdraw2fa, setWithdraw2fa] = useState('');
  const [withdrawError, setWithdrawError] = useState('');
  const [depositStep, setDepositStep] = useState(1);

  useEffect(() => {
    if (!isWithdrawModalOpen) {
      setWithdrawError('');
      setWithdraw2fa('');
      setWithdrawAmount('');
      setWithdrawAddress('');
    }
  }, [isWithdrawModalOpen]);

  const [depositTimeLeft, setDepositTimeLeft] = useState(900); // 15 minutes = 900 seconds
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const formatTimeLeft = (sec) => {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!isDepositModalOpen) {
      if (window.cashXcryptoDepositRedirectTimer) {
        clearTimeout(window.cashXcryptoDepositRedirectTimer);
        window.cashXcryptoDepositRedirectTimer = null;
      }
      setDepositStep(1);
      setDepositAmount('');
      setDepositTxId('');
      setDepositScreenshot('');
      setDepositFileName('');
      setDepositTimeLeft(900);
      setShowCancelConfirm(false);
    }
  }, [isDepositModalOpen]);

  useEffect(() => {
    let timerInterval = null;
    if (isDepositModalOpen && depositStep === 2 && depositTimeLeft > 0 && !showCancelConfirm) {
      timerInterval = setInterval(() => {
        setDepositTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerInterval);
            alert('Payment session expired. Please start a new deposit.');
            setIsDepositModalOpen(false);
            return 900;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [isDepositModalOpen, depositStep, depositTimeLeft, showCancelConfirm]);

  // Deposit Proof States
  const [depositAmount, setDepositAmount] = useState('');
  const [depositTxId, setDepositTxId] = useState('');
  const [depositScreenshot, setDepositScreenshot] = useState('');
  const [depositFileName, setDepositFileName] = useState('');
  const [submittingDeposit, setSubmittingDeposit] = useState(false);
  const [depositUsdtNetwork, setDepositUsdtNetwork] = useState('TRC20');
  const [walletAddresses, setWalletAddresses] = useState({
    USDT_TRC20: '',
    USDT_BEP20: '',
    BTC: '',
    ETH: '',
    USDC: '',
    TRX: ''
  });

  useEffect(() => {
    const loadWallets = async () => {
      try {
        const addr = await fetchDepositWallets();
        if (addr) {
          setWalletAddresses(addr);
        }
      } catch (err) {
        console.warn('Failed to load dynamic wallet addresses:', err.message);
      }
    };
    loadWallets();
  }, [isDepositModalOpen]);

  const handleDepositScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setDepositFileName(file.name);

    const reader = new FileReader();
    reader.onloadend = () => {
      setDepositScreenshot(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    if (!depositAmount || Number(depositAmount) <= 0) {
      alert('Please enter a valid deposit amount.');
      return;
    }
    if (!depositTxId.trim()) {
      alert('Please enter the transaction ID/hash.');
      return;
    }
    if (!depositScreenshot) {
      alert('Please upload a screenshot of your payment proof.');
      return;
    }

    setSubmittingDeposit(true);
    try {
      await submitDepositProof({
        coin: selectedTxCoin === 'USDT' ? `USDT (${depositUsdtNetwork})` : selectedTxCoin,
        amount: Number(depositAmount),
        txId: depositTxId,
        screenshot: depositScreenshot
      });
      // Transition to beautiful green success screen
      setDepositStep(3);
      if (typeof syncProfile === 'function') {
        syncProfile();
      }
      loadUserDeposits();

      // Auto redirect to transaction page after 4 seconds
      const autoRedirectTimer = setTimeout(() => {
        setIsDepositModalOpen(false);
        navigate('/user/transactions');
      }, 4000);

      // Store timer so we can clear if needed on manual click
      window.cashXcryptoDepositRedirectTimer = autoRedirectTimer;
    } catch (err) {
      alert(`Error submitting deposit proof: ${err.message}`);
    } finally {
      setSubmittingDeposit(false);
    }
  };

  const getDepositModalAddress = () => {
    if (selectedTxCoin === 'USDT') {
      return depositUsdtNetwork === 'TRC20'
        ? (walletAddresses.USDT_TRC20 || '')
        : (walletAddresses.USDT_BEP20 || '');
    }
    return walletAddresses[selectedTxCoin] || '';
  };

  // Support section state
  const [tickets, setTickets] = useState([]);
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Hi Ashok, how can I help you today? Please choose an option or type a question.' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Settings state
  const [profileName, setProfileName] = useState(currentUser?.name || 'Ashok Kumar');
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || 'ashok.kumar@example.com');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '+91 98765 43210');

  useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name);
      setProfileEmail(currentUser.email);
      setProfilePhone(currentUser.phone);
      setKycStatus(currentUser.kycStatus || 'Unverified');
    }
  }, [currentUser]);
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    sms: false,
    payout: true
  });
  const [security2FA, setSecurity2FA] = useState(false);

  // Search & Filter state for History
  const [historyFilter, setHistoryFilter] = useState('All');
  const [historyCoin, setHistoryCoin] = useState('All');

  // Load real user orders from database
  const loadUserOrders = async () => {
    try {
      const orders = await fetchUserOrders();
      const formatted = orders.map(o => ({
        id: `#${o._id.toString().slice(-4).toUpperCase()}`,
        coin: o.coin,
        amount: o.amount,
        inr: o.inr,
        status: o.status,
        type: 'Exchange',
        date: o.createdAt
      }));
      setTransactions(formatted);
    } catch (err) {
      console.warn('Could not load user transactions:', err.message);
    }
  };

  const getPendingExchangeAmount = (symbol) => {
    if (!transactions || !Array.isArray(transactions)) return 0;
    return transactions
      .filter(t => t.type === 'Exchange' && t.status === 'Pending' && t.coin && t.coin.toUpperCase().startsWith(symbol.toUpperCase()))
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  };

  const loadUserDeposits = async () => {
    try {
      const deps = await fetchUserDeposits();
      const formatted = deps.map(d => ({
        id: `#${d._id.toString().slice(-4).toUpperCase()}`,
        coin: d.coin,
        amount: d.amount,
        inr: 0,
        status: d.status,
        type: 'Deposit',
        txId: d.txId,
        date: d.createdAt
      }));
      setDeposits(formatted);
    } catch (err) {
      console.warn('Could not load user deposits:', err.message);
    }
  };

  const loadUserWithdrawals = async () => {
    try {
      const withs = await fetchUserWithdrawals();
      const formatted = withs.map(w => ({
        id: `#${w._id.toString().slice(-4).toUpperCase()}`,
        coin: w.coin,
        amount: w.amount,
        inr: 0,
        status: w.status,
        type: 'Withdrawal',
        txId: w.address,
        date: w.createdAt
      }));
      setWithdrawals(formatted);
    } catch (err) {
      console.warn('Could not load user withdrawals:', err.message);
    }
  };

  // Redirect dashboard quick exchange widget to full wizard route
  const handleQuickExchange = (e) => {
    e.preventDefault();

    // Check if bank account is linked before proceeding
    if (!bankAccounts || bankAccounts.length === 0) {
      alert('Please link a bank account to proceed with the exchange.');
      navigate('/user/banks');
      return;
    }

    // Check balance
    const amt = parseFloat(exchangeAmount);
    const balance = balances[exchangeCoin] ?? 0;
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
    if (amt > balance) {
      alert(`Insufficient balance! Your current ${exchangeCoin} wallet balance is ${balance} ${exchangeCoin}.`);
      return;
    }

    setExchangeStep(2);
    navigate('/user/exchange');
  };

  // Add bank account handler
  const handleAddBank = async (e) => {
    e.preventDefault();
    if (!newBankName || !newAccountNumber || !newIfsc) return;
    if (bankAccounts.length >= 1) {
      alert('You can only link a maximum of 1 bank account.');
      return;
    }
    try {
      const updatedAccounts = await addBankAccount({
        name: newBankName,
        number: newAccountNumber,
        ifsc: newIfsc
      });
      setBankAccounts(updatedAccounts || []);
      setIsBankModalOpen(false);
      setNewBankName('');
      setNewAccountNumber('');
      setNewIfsc('');
      alert('Bank account added! Verification under progress (takes up to 5 minutes).');
    } catch (err) {
      alert(`Error linking bank account: ${err.message}`);
    }
  };

  // Update bank account handler
  const handleUpdateBank = async (updatedAcc) => {
    try {
      const updatedAccounts = await updateBankAccount(updatedAcc.id, {
        name: updatedAcc.name,
        number: updatedAcc.number,
        ifsc: updatedAcc.ifsc
      });
      setBankAccounts(updatedAccounts || []);
    } catch (err) {
      alert(`Error updating bank details: ${err.message}`);
    }
  };

  // Verify bank account simulator
  const handleVerifyBank = async (id) => {
    try {
      const updatedAccounts = await verifyBankAccount(id);
      setBankAccounts(updatedAccounts || []);
      alert('Bank account successfully verified! Active for payouts.');
    } catch (err) {
      alert(`Error verifying bank account: ${err.message}`);
    }
  };

  // Delete bank account handler
  const handleDeleteBank = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bank account?')) return;
    try {
      const updatedAccounts = await deleteBankAccountApi(id);
      setBankAccounts(updatedAccounts || []);
      alert('Bank account deleted successfully!');
    } catch (err) {
      alert(`Error deleting bank account: ${err.message}`);
    }
  };

  // Handle Withdraw crypto
  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    setWithdrawError('');
    const balance = balances[selectedTxCoin] || 0;
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      setWithdrawError('Please enter a valid positive withdrawal amount.');
      return;
    }
    if (amt > balance) {
      setWithdrawError('Insufficient available balance.');
      return;
    }
    if (!withdrawAddress.trim()) {
      setWithdrawError('Please enter a valid destination address.');
      return;
    }
    if (!withdraw2fa.trim() || withdraw2fa.trim().length !== 6) {
      setWithdrawError('Please enter a valid 6-digit Two-Factor Code (2FA).');
      return;
    }

    try {
      const res = await submitWithdrawalRequest({
        coin: selectedTxCoin,
        amount: amt,
        address: withdrawAddress,
        twoFactorCode: withdraw2fa
      });

      alert(res.message || 'Withdrawal transaction submitted successfully.');
      setIsWithdrawModalOpen(false);
      setWithdrawAmount('');
      setWithdrawAddress('');
      setWithdraw2fa('');
      setWithdrawError('');

      // Update balance
      if (res.balances) {
        setBalances(res.balances);
      } else {
        setBalances(prev => ({
          ...prev,
          [selectedTxCoin]: Number((balance - amt).toFixed(8))
        }));
      }

      loadUserWithdrawals();
      navigate('/user/transactions');
    } catch (err) {
      const errMsg = err.message || (typeof err === 'string' ? err : 'Unknown error');
      if (errMsg.toLowerCase().includes('2fa') || errMsg.toLowerCase().includes('two-factor')) {
        setWithdrawError('Invalid Two-Factor Code (2FA). Please enter your correct 6-digit security PIN.');
      } else {
        setWithdrawError(errMsg);
      }
    }
  };

  // Handle Chat Input message
  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput) return;
    const userMsg = { sender: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');

    // Mock replies
    setTimeout(() => {
      let botText = "Thank you for contacting cashXcrypto support. A live support manager has been assigned. What is your transaction ID?";
      if (chatInput.toLowerCase().includes('payout') || chatInput.toLowerCase().includes('pending')) {
        botText = "Our IMPS/UPI gateways are currently running smoothly. Most transactions are processed in under 2 minutes. Please check your Transactions tab to verify the blockchain confirmation count.";
      }
      setChatMessages(prev => [...prev, { sender: 'bot', text: botText }]);
    }, 1500);
  };

  // Export CSV simulation
  const handleExportCSV = () => {
    const csvRows = [
      ['Transaction ID', 'Coin', 'Amount', 'INR Value', 'Status', 'Date'],
      ...transactions.map(tx => [tx.id, tx.coin, tx.amount, tx.inr, tx.status, tx.date])
    ];
    const csvContent = "data:text/csv;charset=utf-8,"
      + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "cashXcrypto_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy Referral link
  const handleCopyReferral = () => {
    navigator.clipboard.writeText("https://cashXcrypto.com/ref/ASHOK25");
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="dashboard-root" style={{ background: '#060914', minHeight: '100vh', color: '#fff', display: 'flex', fontFamily: 'var(--font-sans)' }}>
      <style>{`
        .mobile-bottom-nav {
          display: none;
        }
        @media (max-width: 992px) {
          .dashboard-root {
            height: 100vh !important;
            overflow: hidden !important;
          }
          .dashboard-main-area {
            height: 100vh !important;
            overflow: hidden !important;
          }
          .dashboard-sidebar {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            height: 100vh !important;
            height: -webkit-fill-available !important;
            z-index: 10000 !important;
            transform: translateX(-100%);
            transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
            overflow-y: auto !important;
            -webkit-overflow-scrolling: touch;
            box-shadow: 10px 0 40px rgba(0, 0, 0, 0.75) !important;
          }
          .dashboard-sidebar.open {
            transform: translateX(0) !important;
          }
          .mobile-bottom-nav {
            display: flex;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 64px;
            background: rgba(13, 20, 39, 0.95);
            backdrop-filter: blur(20px);
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            padding: 4px 4px 8px 4px;
            justify-content: space-around;
            align-items: center;
            z-index: 990;
            box-shadow: 0 -4px 25px rgba(0, 0, 0, 0.5);
            overflow: visible;
          }
          .dashboard-content-pane {
            padding-bottom: 90px !important;
            overflow-y: auto !important;
            -webkit-overflow-scrolling: touch;
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      {/* Sidebar Overlay Backdrop for Mobile */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(3px)',
            zIndex: 995,
            animation: 'fadeIn 0.2s ease-out'
          }}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`dashboard-sidebar ${isMobileSidebarOpen ? 'open' : ''} ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div
          className="sidebar-brand-wrapper"
          style={{
            padding: isSidebarCollapsed ? '24px 12px' : '24px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
            alignItems: 'center'
          }}
        >
          <div className="logo" style={{ pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', width: isSidebarCollapsed ? 'auto' : '100%' }}>
            <img src={siteLogo} alt="Logo" style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover', marginRight: isSidebarCollapsed ? '0' : '10px' }} />
            {!isSidebarCollapsed && <span style={{ fontSize: '1.25rem' }}>CASH<span className="gradient-text">XCRYPTO</span></span>}
          </div>
          {!isSidebarCollapsed && (
            <button className="mobile-close-sidebar" onClick={() => setIsMobileSidebarOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', display: 'none', cursor: 'pointer' }}>
              <XIcon />
            </button>
          )}

          {/* Desktop Collapse Toggle Button */}
          <button
            className="desktop-collapse-btn"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </button>
        </div>

        {/* User profile card badge */}
        <div style={{
          padding: isSidebarCollapsed ? '12px 6px' : '12px 14px',
          margin: isSidebarCollapsed ? '12px 8px' : '12px 14px',
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', gap: isSidebarCollapsed ? '0' : '10px' }}>
            {currentUser?.kycDetails?.selfieBase64 ? (
              <img
                src={currentUser.kycDetails.selfieBase64}
                alt="Profile"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                }}
              />
            ) : (
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.92rem', border: '2px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)' }}>
                {profileName ? profileName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
              </div>
            )}
            {!isSidebarCollapsed && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profileName}</span>
                  {kycStatus === 'Verified' && (
                    <svg viewBox="0 0 24 24" width="14" height="14" style={{ marginLeft: '6px', verticalAlign: 'middle', display: 'inline-block', flexShrink: 0 }} title="Verified Profile">
                      <path fill="#1d9bf0" d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.99-3.818-3.99-.48 0-.94.1-1.348.27C14.825 2.515 13.512 1.5 12 1.5s-2.825 1.015-3.422 2.28c-.407-.17-.867-.27-1.348-.27-2.108 0-3.818 1.78-3.818 3.99 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.71 3.99 3.818 3.99.48 0 .94-.1 1.348-.27.597 1.265 1.91 2.27 3.422 2.27s2.825-1.005 3.422-2.27c.407.17.868.27 1.348.27 2.108 0 3.818-1.78 3.818-3.99 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6z" />
                      <path fill="#ffffff" d="M10.707 15.121l-3.535-3.535 1.414-1.414 2.121 2.121 5.657-5.657 1.414 1.414z" />
                    </svg>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <nav className="sidebar-nav-menu" style={{ padding: isSidebarCollapsed ? '16px 8px' : '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[
            { id: 'dashboard', name: 'Dashboard', icon: <DashboardIcon /> },
            { id: 'exchange', name: 'Exchange', icon: <SwapIcon /> },
            { id: 'wallets', name: 'Wallets', icon: <WalletIcon /> },
            { id: 'banks', name: 'Bank Accounts', icon: <BankIcon /> },
            { id: 'transactions', name: 'Transactions', icon: <ListIcon /> },
            { id: 'referrals', name: 'Referrals', icon: <UsersIcon /> },
            { id: 'security', name: 'Security', icon: <SecurityIcon /> },
            { id: 'kyc', name: 'KYC Verification', icon: <ShieldCheckIcon /> },
            { id: 'support', name: 'Support', icon: <SupportIcon /> },
            { id: 'settings', name: 'Settings', icon: <SettingsIcon /> }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'exchange') {
                  setExchangeStep(1);
                }
                navigate(`/user/${item.id}`);
                setIsMobileSidebarOpen(false);
              }}
              className={`sidebar-nav-item ${activeTab === item.id ? 'active' : ''}`}
              style={{
                padding: isSidebarCollapsed ? '12px' : '12px 20px',
                justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                gap: isSidebarCollapsed ? '0' : '12px'
              }}
              title={isSidebarCollapsed ? item.name : undefined}
            >
              {item.icon}
              {!isSidebarCollapsed && <span>{item.name}</span>}
            </button>
          ))}
          <button
            onClick={onLogout}
            className="sidebar-nav-item"
            style={{
              marginTop: '20px',
              color: 'var(--danger)',
              padding: isSidebarCollapsed ? '12px' : '12px 20px',
              justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
              gap: isSidebarCollapsed ? '0' : '12px'
            }}
            title={isSidebarCollapsed ? 'Logout' : undefined}
          >
            <LogoutIcon />
            {!isSidebarCollapsed && <span>Logout</span>}
          </button>
        </nav>
      </aside>

      {/* Main Panel Content Area */}
      <div className="dashboard-main-area" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative', zIndex: 105 }}>

        {/* Top Navbar */}
        <header className="dashboard-navbar" style={{ background: 'rgba(13, 18, 39, 0.4)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 90, backdropFilter: 'blur(10px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="sidebar-toggle-btn"
              onClick={() => setIsMobileSidebarOpen(true)}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'none' }}
            >
              <MenuIcon />
            </button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', textTransform: 'capitalize' }}>{activeTab}</h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Notification Badge */}
            <div style={{ position: 'relative', cursor: 'pointer' }} className="nav-icon-badge" title="Notifications">
              <BellIcon />
              <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '8px', height: '8px', background: 'var(--danger)', borderRadius: '50%' }}></span>
            </div>

            {/* Support shortcut */}
            <div style={{ cursor: 'pointer' }} className="nav-icon-badge" onClick={() => navigate('/user/support')} title="Live Support Chat">
              <SupportIcon />
            </div>

            {/* User Profile dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '4px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '30px' }} onClick={() => navigate('/user/settings')}>
              {currentUser?.kycDetails?.selfieBase64 ? (
                <img
                  src={currentUser.kycDetails.selfieBase64}
                  alt="Profile"
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.85rem' }}>
                  {profileName.split(' ').map(n => n[0]).join('')}
                </div>
              )}
              <span style={{ fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center' }} className="profile-name-nav">
                {profileName}
                {kycStatus === 'Verified' && (
                  <svg viewBox="0 0 24 24" width="13" height="13" style={{ marginLeft: '4px', verticalAlign: 'middle', display: 'inline-block', flexShrink: 0 }} title="Verified Profile">
                    <path fill="#1d9bf0" d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.99-3.818-3.99-.48 0-.94.1-1.348.27C14.825 2.515 13.512 1.5 12 1.5s-2.825 1.015-3.422 2.28c-.407-.17-.867-.27-1.348-.27-2.108 0-3.818 1.78-3.818 3.99 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.71 3.99 3.818 3.99.48 0 .94-.1 1.348-.27.597 1.265 1.91 2.27 3.422 2.27s2.825-1.005 3.422-2.27c.407.17.868.27 1.348.27 2.108 0 3.818-1.78 3.818-3.99 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6z" />
                    <path fill="#ffffff" d="M10.707 15.121l-3.535-3.535 1.414-1.414 2.121 2.121 5.657-5.657 1.414 1.414z" />
                  </svg>
                )}
              </span>
              <ChevronDownIcon />
            </div>
          </div>
        </header>

        {/* Content Pane */}
        <main className="dashboard-content-pane" style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
          <Routes>
            <Route path="dashboard" element={
              <UserDashboard
                balances={balances}
                bankAccounts={bankAccounts}
                kycStatus={kycStatus}
                transactions={transactions}
                deposits={deposits}
                withdrawals={withdrawals}
                exchangeCoin={exchangeCoin}
                setExchangeCoin={setExchangeCoin}
                exchangeAmount={exchangeAmount}
                setExchangeAmount={setExchangeAmount}
                exchangeRate={exchangeRate}
                receiveAmount={receiveAmount}
                handleQuickExchange={handleQuickExchange}
                setActiveTab={(tab) => navigate(`/user/${tab}`)}
                getPendingExchangeAmount={getPendingExchangeAmount}
                getExchangeRate={getExchangeRate}
                getCurrencyConfig={getCurrencyConfig}
                formatUserCurrency={formatUserCurrency}
                prices={prices}
              />
            } />

            <Route path="exchange" element={
              <UserExchange
                exchangeCoin={exchangeCoin}
                setExchangeCoin={setExchangeCoin}
                exchangeAmount={exchangeAmount}
                setExchangeAmount={setExchangeAmount}
                balances={balances}
                exchangeRate={exchangeRate}
                receiveAmount={receiveAmount}
                setActiveTab={(tab) => navigate(`/user/${tab}`)}
                bankAccounts={bankAccounts}
                loadTransactions={loadUserOrders}
                getPendingExchangeAmount={getPendingExchangeAmount}
                getExchangeRate={getExchangeRate}
                getCurrencyConfig={getCurrencyConfig}
                formatUserCurrency={formatUserCurrency}
                step={exchangeStep}
                setStep={setExchangeStep}
                transactions={transactions}
                deposits={deposits}
                withdrawals={withdrawals}
              />
            } />

            <Route path="wallets" element={
              <UserWallets
                balances={balances}
                prices={prices}
                getExchangeRate={getExchangeRate}
                setSelectedTxCoin={setSelectedTxCoin}
                setIsDepositModalOpen={setIsDepositModalOpen}
                setIsWithdrawModalOpen={setIsWithdrawModalOpen}
                getPendingExchangeAmount={getPendingExchangeAmount}
                onBalanceUpdate={(newBals) => setBalances({
                  BTC: newBals.BTC ?? 0,
                  ETH: newBals.ETH ?? 0,
                  USDT: newBals.USDT ?? 0,
                  USDC: newBals.USDC ?? 0,
                  TRX: newBals.TRX ?? 0
                })}
              />
            } />

            <Route path="banks" element={
              <UserBanks
                bankAccounts={bankAccounts}
                setIsBankModalOpen={setIsBankModalOpen}
                handleVerifyBank={handleVerifyBank}
                handleUpdateBank={handleUpdateBank}
                handleDeleteBank={handleDeleteBank}
                currentUser={currentUser}
              />
            } />

            <Route path="transactions" element={
              <UserTransactions
                transactions={transactions}
                deposits={deposits}
                withdrawals={withdrawals}
                historyFilter={historyFilter}
                setHistoryFilter={setHistoryFilter}
                historyCoin={historyCoin}
                setHistoryCoin={setHistoryCoin}
                handleExportCSV={handleExportCSV}
                getCurrencyConfig={getCurrencyConfig}
                formatUserCurrency={formatUserCurrency}
              />
            } />

            <Route path="rates" element={<Navigate to="dashboard" replace />} />

            <Route path="referrals" element={
              <UserReferrals
                copiedText={copiedText}
                handleCopyReferral={handleCopyReferral}
              />
            } />

            <Route path="security" element={
              <UserSecurity
                security2FA={security2FA}
                setSecurity2FA={setSecurity2FA}
              />
            } />

            <Route path="kyc" element={
              <UserKyc
                kycStatus={kycStatus}
                setKycStatus={setKycStatus}
                currentUser={currentUser}
              />
            } />

            <Route path="support" element={
              <UserSupport
                tickets={tickets}
                setTickets={setTickets}
                setShowLiveChat={setShowLiveChat}
              />
            } />

            <Route path="settings" element={
              <UserSettings
                profileName={profileName}
                setProfileName={setProfileName}
                profileEmail={profileEmail}
                setProfileEmail={setProfileEmail}
                profilePhone={profilePhone}
                setProfilePhone={setProfilePhone}
                notificationSettings={notificationSettings}
                setNotificationSettings={setNotificationSettings}
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
                onLogout={onLogout}
              />
            } />

            <Route path="" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>
      </div>

      {/* POPUP MODAL: Add Bank Account */}
      {isBankModalOpen && (() => {
        const countryBankConfig = getBankFieldsByCountry(currentUser?.countryCode);
        return (
          <div className="modal-overlay" style={{ zIndex: 11000 }}>
            <div className="glass-panel modal-content" style={{ maxWidth: '420px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>
                  Add Bank Account ({countryBankConfig.countryName})
                </h3>
                <button onClick={() => setIsBankModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                  <XIcon />
                </button>
              </div>
              <form onSubmit={handleAddBank} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {countryBankConfig.fields.map((field) => {
                  let val = '';
                  let setVal = null;
                  if (field.key === 'name') {
                    val = newBankName;
                    setVal = setNewBankName;
                  } else if (field.key === 'number') {
                    val = newAccountNumber;
                    setVal = setNewAccountNumber;
                  } else if (field.key === 'ifsc') {
                    val = newIfsc;
                    setVal = (v) => setNewIfsc(v);
                  }

                  return (
                    <div key={field.key}>
                      <label className="input-label">{field.label}</label>
                      <input
                        type="text"
                        className="step-input"
                        placeholder={field.placeholder}
                        value={val}
                        onChange={(e) => setVal(field.key === 'ifsc' ? e.target.value.toUpperCase() : e.target.value)}
                        required={field.required}
                        pattern={field.pattern}
                        title={field.title}
                        style={{ width: '100%', boxSizing: 'border-box' }}
                      />
                    </div>
                  );
                })}
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '10px' }}>
                  Link Account
                </button>
              </form>
            </div>
          </div>
        );
      })()}

      {/* POPUP MODAL: Deposit Crypto */}
      {isDepositModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 11000 }}>
          <div className="glass-panel modal-content" style={{ width: '100%', maxWidth: '480px', padding: '28px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <style>{`
              @keyframes gatewayPulse {
                0% { opacity: 1; }
                50% { opacity: 0.7; }
                100% { opacity: 1; }
              }
            `}</style>

            {/* Secured Badge & Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1rem' }}>🔒</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#fff', margin: 0 }}>Secure Checkout</h3>
              </div>
              <button
                onClick={() => {
                  if (depositStep === 2) {
                    setShowCancelConfirm(true);
                  } else {
                    setIsDepositModalOpen(false);
                  }
                }}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.25rem', opacity: 0.7 }}
              >
                &times;
              </button>
            </div>

            {/* Cancel Payment Confirmation Overlay */}
            {showCancelConfirm && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(11, 8, 20, 0.96)',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '24px',
                boxSizing: 'border-box'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>⚠️</div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>Cancel Payment?</h4>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.5', marginBottom: '24px', maxWidth: '320px' }}>
                  Are you sure you want to cancel this payment? If you have already sent the funds, cancelling now may delay your deposit credit.
                </p>
                <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '300px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDepositModalOpen(false);
                    }}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '8px',
                      background: '#ef4444',
                      color: '#fff',
                      border: 'none',
                      fontWeight: '700',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    Yes, Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCancelConfirm(false)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: '#fff',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      fontWeight: '700',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    No, Resume
                  </button>
                </div>
              </div>
            )}

            {depositStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                <div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: '1.4' }}>
                    Select network and enter deposit amount. We will generate a secure deposit address for your transaction.
                  </p>
                  {selectedTxCoin === 'USDT' && (
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px', marginBottom: '14px' }}>
                      <button
                        type="button"
                        onClick={() => setDepositUsdtNetwork('TRC20')}
                        className={`btn ${depositUsdtNetwork === 'TRC20' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '4px 10px', fontSize: '0.7rem', height: '28px', minWidth: 'auto' }}
                      >
                        TRC20
                      </button>
                      <button
                        type="button"
                        onClick={() => setDepositUsdtNetwork('BEP20')}
                        className={`btn ${depositUsdtNetwork === 'BEP20' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '4px 10px', fontSize: '0.7rem', height: '28px', minWidth: 'auto' }}
                      >
                        BEP20
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="input-label" style={{ fontSize: '0.75rem', marginBottom: '6px' }}>Deposit Amount ({selectedTxCoin === 'USDT' ? `USDT-${depositUsdtNetwork}` : selectedTxCoin}) <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="number"
                    step="any"
                    className="step-input"
                    placeholder={`Enter amount of ${selectedTxCoin} to deposit`}
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    required
                    style={{ margin: 0, height: '40px', fontSize: '0.85rem', background: 'rgba(255,255,255,0.02)' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setIsDepositModalOpen(false)}
                    className="btn btn-secondary"
                    style={{ padding: '12px', fontSize: '0.88rem', fontWeight: '700', borderRadius: '8px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!depositAmount || Number(depositAmount) <= 0) {
                        alert('Please enter a valid deposit amount.');
                        return;
                      }
                      setDepositStep(2);
                    }}
                    className="btn btn-primary"
                    style={{ padding: '12px', fontSize: '0.88rem', fontWeight: '700', borderRadius: '8px' }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {depositStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>

                {/* Gateway Order Summary Block */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  marginBottom: '6px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                    <span>Merchant</span>
                    <span style={{ fontWeight: '600', color: '#fff' }}>cashXcrypto</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
                    <span>Amount to Send</span>
                    <span style={{ fontWeight: '700', color: 'var(--color-primary)' }}>{depositAmount} {selectedTxCoin === 'USDT' ? `USDT (${depositUsdtNetwork})` : selectedTxCoin}</span>
                  </div>
                </div>

                {/* Pulsating Timer and QR Code section */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', margin: '8px 0' }}>
                  {/* Timer */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: depositTimeLeft < 180 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    border: depositTimeLeft < 180 ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '20px',
                    padding: '6px 14px',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    color: depositTimeLeft < 180 ? '#ef4444' : '#fff',
                    animation: 'gatewayPulse 1.5s infinite'
                  }}>
                    <span>🕒</span>
                    <span>Payment Window Expires In: {formatTimeLeft(depositTimeLeft)}</span>
                  </div>

                  {/* QR Code Container */}
                  {getDepositModalAddress() && (
                    <div style={{
                      background: '#fff',
                      padding: '10px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                      border: '2px solid rgba(255,255,255,0.1)'
                    }}>
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(getDepositModalAddress())}`}
                        alt="Deposit QR Code"
                        style={{ width: '120px', height: '120px', display: 'block' }}
                      />
                    </div>
                  )}
                </div>

                {/* Deposit Address Box */}
                <div>
                  <label className="input-label" style={{ fontSize: '0.75rem', marginBottom: '6px' }}>Copy {selectedTxCoin} Payment Address</label>
                  <div className="address-copy-container" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                    {getDepositModalAddress() ? (
                      <>
                        <span className="address-text" style={{ fontSize: '0.72rem', wordBreak: 'break-all', fontFamily: 'monospace', color: 'rgba(255,255,255,0.85)', flex: 1 }}>
                          {getDepositModalAddress()}
                        </span>
                        <button
                          type="button"
                          className="btn-copy"
                          style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', cursor: 'pointer', padding: '6px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          onClick={() => {
                            navigator.clipboard.writeText(getDepositModalAddress());
                            alert(`${selectedTxCoin} deposit address copied!`);
                          }}
                        >
                          <Copy />
                        </button>
                      </>
                    ) : (
                      <div style={{ color: '#ef4444', fontSize: '0.78rem', fontWeight: '700', textAlign: 'center', width: '100%' }}>
                        ⚠️ No deposit address configured by administrator. Please contact support.
                      </div>
                    )}
                  </div>
                </div>

                {/* Submissions form for TxHash and proof */}
                <form onSubmit={handleDepositSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label className="input-label" style={{ fontSize: '0.75rem', marginBottom: '6px' }}>Transaction ID / Hash <span style={{ color: 'red' }}>*</span></label>
                    <input
                      type="text"
                      className="step-input"
                      placeholder="Paste transaction TXID or hash reference"
                      value={depositTxId}
                      onChange={(e) => setDepositTxId(e.target.value)}
                      required
                      disabled={!getDepositModalAddress()}
                      style={{ margin: 0, height: '40px', fontSize: '0.85rem', background: 'rgba(255,255,255,0.02)', opacity: !getDepositModalAddress() ? 0.5 : 1 }}
                    />
                  </div>

                  <div>
                    <label className="input-label" style={{ fontSize: '0.75rem', marginBottom: '6px' }}>Upload Payment Screenshot <span style={{ color: 'red' }}>*</span></label>
                    <div style={{
                      border: '2px dashed rgba(255,255,255,0.12)',
                      borderRadius: '8px',
                      padding: '14px',
                      textAlign: 'center',
                      background: 'rgba(255,255,255,0.01)',
                      position: 'relative',
                      cursor: !getDepositModalAddress() ? 'not-allowed' : 'pointer',
                      opacity: !getDepositModalAddress() ? 0.5 : 1
                    }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleDepositScreenshotChange}
                        required
                        disabled={!getDepositModalAddress()}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          opacity: 0,
                          cursor: !getDepositModalAddress() ? 'not-allowed' : 'pointer'
                        }}
                      />
                      <div style={{ fontSize: '1.3rem', marginBottom: '4px' }}>📸</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#fff' }}>
                        {depositFileName ? depositFileName : 'Choose payment proof screenshot'}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        PNG, JPG, or JPEG supported
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setShowCancelConfirm(true)}
                      className="btn btn-secondary"
                      disabled={submittingDeposit}
                      style={{ padding: '12px', fontSize: '0.88rem', fontWeight: '700', borderRadius: '8px' }}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={submittingDeposit || !depositAmount || !depositTxId || !depositScreenshot || !getDepositModalAddress()}
                      style={{ padding: '12px', fontSize: '0.88rem', fontWeight: '700', borderRadius: '8px', opacity: (submittingDeposit || !depositAmount || !depositTxId || !depositScreenshot || !getDepositModalAddress()) ? 0.5 : 1 }}
                    >
                      {submittingDeposit ? 'Submitting...' : 'Submit Deposit'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {depositStep === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '20px', padding: '15px 0 5px' }}>
                <div style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: 'rgba(74, 222, 128, 0.1)',
                  border: '2px solid rgba(74, 222, 128, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 20px rgba(74, 222, 128, 0.25)',
                  animation: 'gatewayPulse 2s infinite'
                }}>
                  <svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <h4 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#4ade80', margin: 0 }}>
                    Deposit Proof Submitted!
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5', maxWidth: '340px', margin: '0 auto' }}>
                    Your deposit request has been logged successfully. Admin will review the txn hash and credit your account shortly.
                  </p>
                </div>

                {/* Tx details box */}
                <div style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  boxSizing: 'border-box',
                  textAlign: 'left'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Status</span>
                    <span style={{ fontWeight: '700', color: '#ffaa00', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="status-dot-pending" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ffaa00', display: 'inline-block' }}></span>
                      Pending Verification
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Asset / Network</span>
                    <span style={{ fontWeight: '600', color: '#fff' }}>{selectedTxCoin === 'USDT' ? `USDT (${depositUsdtNetwork})` : selectedTxCoin}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Deposit Amount</span>
                    <span style={{ fontWeight: '700', color: '#fff' }}>{depositAmount} {selectedTxCoin}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>TxID / Hash</span>
                    <span style={{ fontWeight: '600', color: 'rgba(255,255,255,0.85)', fontFamily: 'monospace', fontSize: '0.72rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }} title={depositTxId}>
                      {depositTxId}
                    </span>
                  </div>
                </div>

                <div style={{ width: '100%', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.cashXcryptoDepositRedirectTimer) {
                        clearTimeout(window.cashXcryptoDepositRedirectTimer);
                        window.cashXcryptoDepositRedirectTimer = null;
                      }
                      setIsDepositModalOpen(false);
                      navigate('/user/transactions');
                    }}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '12px', fontSize: '0.88rem', fontWeight: '700', borderRadius: '8px' }}
                  >
                    View Transactions
                  </button>
                  <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                    Auto-redirecting to history page in 3 seconds...
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* POPUP MODAL: Withdraw Crypto */}
      {isWithdrawModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 11000 }}>
          <div className="glass-panel modal-content" style={{ maxWidth: '420px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Withdraw {selectedTxCoin}</h3>
              <button onClick={() => setIsWithdrawModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <XIcon />
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="input-label">Destination Address</label>
                <input
                  type="text"
                  className="step-input"
                  placeholder={`Enter ${selectedTxCoin} address`}
                  value={withdrawAddress}
                  onChange={(e) => {
                    setWithdrawAddress(e.target.value);
                    setWithdrawError('');
                  }}
                  required
                />
              </div>
              <div>
                <label className="input-label">Withdrawal Amount</label>
                <input
                  type="number"
                  step="any"
                  className="step-input"
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={(e) => {
                    setWithdrawAmount(e.target.value);
                    setWithdrawError('');
                  }}
                  required
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                  Available: {balances[selectedTxCoin]} {selectedTxCoin}
                </span>
              </div>
              <div>
                <label className="input-label">Two-Factor Code (2FA)</label>
                <input
                  type="text"
                  className="step-input"
                  placeholder="6-digit code"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  value={withdraw2fa}
                  onChange={(e) => {
                    setWithdraw2fa(e.target.value.replace(/\D/g, ''));
                    setWithdrawError('');
                  }}
                  required
                />
              </div>
              {withdrawError && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  padding: '12px',
                  borderRadius: '8px',
                  color: '#fca5a5',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  lineHeight: '1.4'
                }}>
                  <span style={{ fontSize: '1rem', color: '#f87171' }}>⚠️</span>
                  <div>
                    {withdrawError}
                  </div>
                </div>
              )}
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                Confirm Withdrawal
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FLOATING CHAT WIDGET */}
      {showLiveChat && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', width: '350px', height: '450px', background: '#0b0e1a', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', zIndex: 11000, display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '14px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%' }}></div>
              <strong style={{ fontSize: '0.85rem' }}>cashXcrypto Help Desk</strong>
            </div>
            <button onClick={() => setShowLiveChat(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <XIcon />
            </button>
          </div>

          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {chatMessages.map((msg, i) => (
              <div key={i} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', background: msg.sender === 'user' ? 'var(--color-primary)' : 'rgba(255,255,255,0.03)', color: msg.sender === 'user' ? '#060914' : '#fff', fontWeight: msg.sender === 'user' ? '600' : 'normal' }}>
                {msg.text}
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChatMessage} style={{ borderTop: '1px solid var(--border-color)', padding: '10px', display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="step-input"
              placeholder="Type message..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem' }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>Send</button>
          </form>
        </div>
      )}

      {/* FLOATING TOAST NOTIFICATION */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '24px',
            background: toast.type === 'success' ? '#10b981' : toast.type === 'error' ? '#ef4444' : toast.type === 'warning' ? '#f59e0b' : '#3b82f6',
            color: '#fff',
            padding: '16px 20px',
            borderRadius: '10px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            maxWidth: '350px',
            animation: 'slideIn 0.3s ease-out',
            fontSize: '0.88rem',
            fontWeight: '600',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <style>{`
            @keyframes slideIn {
              from { transform: translateY(100px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}</style>
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '1.2rem',
              marginLeft: 'auto',
              padding: '0 4px',
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* KYC PROMOTION MODAL POPUP */}
      {showKycPromoModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(6, 9, 20, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '480px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 170, 0, 0.25)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
            padding: '30px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(255, 170, 0, 0.03) 0%, rgba(6, 9, 20, 0.95) 100%)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            position: 'relative',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <style>{`
              @keyframes fadeIn {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
              }
            `}</style>

            {/* Close Button */}
            <button
              onClick={() => {
                setShowKycPromoModal(false);
                sessionStorage.setItem('cashXcrypto_kyc_dismissed', 'true');
              }}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '1.2rem',
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
            >
              ✕
            </button>

            {/* Shield / Warning Icon */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(255, 170, 0, 0.1)',
              border: '2px solid rgba(255, 170, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              boxShadow: '0 0 25px rgba(255, 170, 0, 0.2)'
            }}>
              <svg viewBox="0 0 24 24" width="42" height="42" fill="none" stroke="#ffaa00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: 'auto' }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <path d="M12 8v4"></path>
                <path d="M12 16h.01"></path>
              </svg>
            </div>

            {/* Title */}
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.35rem', fontWeight: '800', color: '#ffaa00', letterSpacing: '-0.3px' }}>
                Verify Your Identity
              </h3>
              <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Unlock high-volume conversions and secure your wallet.
              </p>
            </div>

            {/* Limit Banner */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Unverified Limit:</span>
                <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: '700' }}>Limited Features</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Verified Limit:</span>
                <span style={{ fontSize: '0.85rem', color: '#4ade80', fontWeight: '800' }}>100,000 USDT / Day</span>
              </div>
            </div>

            {/* Prompt */}
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              Identity verification (KYC) takes less than 5 minutes to complete and is processed automatically by our compliance engine.
            </p>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button
                onClick={() => {
                  setShowKycPromoModal(false);
                  sessionStorage.setItem('cashXcrypto_kyc_dismissed', 'true');
                }}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '12px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer' }}
              >
                Later
              </button>
              <button
                onClick={() => {
                  setShowKycPromoModal(false);
                  sessionStorage.setItem('cashXcrypto_kyc_dismissed', 'true');
                  navigate('/user/kyc');
                }}
                className="btn btn-primary"
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #ffaa00, #ff8a00)',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Verify Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Sticky Navigation Bar */}
      <div className="mobile-bottom-nav">
        {[
          { id: 'dashboard', name: 'Home', icon: <DashboardIcon /> },
          { id: 'wallets', name: 'Wallets', icon: <WalletIcon /> },
          { id: 'exchange', name: 'Cash out ', icon: <SwapIcon /> },
          { id: 'referrals', name: 'Referral', icon: <UsersIcon /> },
          { id: 'settings', name: 'Profile', icon: <ProfileIcon /> }
        ].map((item) => {
          const isActive = activeTab === item.id;

          const handleClick = () => {
            if (item.id === 'exchange') {
              setExchangeStep(1);
            }
            navigate(`/user/${item.id}`);
            setIsMobileSidebarOpen(false);
          };

          if (item.id === 'exchange') {
            return (
              <div key={item.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative', height: '100%', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleClick}
                  style={{
                    position: 'absolute',
                    top: '-28px',
                    width: '52px',
                    height: '52px',
                    background: '#ffffff',
                    color: '#0d101d',
                    border: 'none',
                    borderRadius: '16px',
                    transform: 'rotate(45deg)',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4), 0 0 12px rgba(255, 255, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    outline: 'none',
                    zIndex: 10,
                    transition: 'transform 0.2s, background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'rotate(45deg) scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'rotate(45deg) scale(1)';
                  }}
                >
                  <div style={{ transform: 'rotate(-45deg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0d101d' }}>
                    <SwapIcon />
                  </div>
                </button>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: '800',
                  color: isActive ? '#f3ba2f' : 'var(--text-secondary)',
                  letterSpacing: '0.2px',
                  marginBottom: '2px'
                }}>
                  {item.name}
                </span>
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={handleClick}
              style={{
                background: 'none',
                border: 'none',
                color: isActive ? '#f3ba2f' : 'var(--text-secondary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.68rem',
                fontWeight: '700',
                cursor: 'pointer',
                flex: 1,
                padding: '6px 0',
                transition: 'color 0.2s',
                outline: 'none'
              }}
            >
              <div style={{
                color: isActive ? '#f3ba2f' : 'var(--text-secondary)',
                transform: isActive ? 'scale(1.1)' : 'scale(1)',
                transition: 'transform 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '22px'
              }}>
                {item.icon}
              </div>
              <span style={{
                fontSize: '0.65rem',
                letterSpacing: '0.2px'
              }}>
                {item.name}
              </span>
            </button>
          );
        })}
      </div>

    </div>
  );
}

// Small helper icons
const MenuIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
);
const XIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
const ProfileIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);
const ChevronLeftIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
);
const ChevronRightIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
);

export default UserPanel;
