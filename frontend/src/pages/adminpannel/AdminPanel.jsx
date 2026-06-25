import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { CoinIconLogo } from '../../components/Icons';
import siteLogo from '../../assets/logo.png';
import { fetchAllUsers, updateUserStatus as apiUpdateUserStatus, updateUserKyc as apiUpdateUserKyc, deleteUser as apiDeleteUser, saveUsdtRate, fetchUsdtRate, saveExchangeRates, fetchExchangeRates, toggleAdminBankVerify, fetchAllOrders, updateOrderStatusApi } from '../../services/admin';

// Import Subpages
import AdminDashboard from './subpages/AdminDashboard';
import AdminUsers from './subpages/AdminUsers';
import AdminKyc from './subpages/AdminKyc';
import AdminKycComplete from './subpages/AdminKycComplete';
import AdminOrders from './subpages/AdminOrders';
import AdminDeposits from './subpages/AdminDeposits';
import AdminBanks from './subpages/AdminBanks';
import AdminReferrals from './subpages/AdminReferrals';
import AdminRates from './subpages/AdminRates';
import AdminTickets from './subpages/AdminTickets';
import AdminReports from './subpages/AdminReports';
import AdminSettings from './subpages/AdminSettings';
import AdminWalletSet from './subpages/AdminWalletSet';
import AdminNewDeposits from './subpages/AdminNewDeposits';
import AdminUserReport from './subpages/AdminUserReport';


const UserReportIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><circle cx="10" cy="13" r="2"></circle><path d="M14 17a3 3 0 0 0-6 0"></path></svg>
);
const DashboardIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
);
const UsersIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
);
const ShieldCheckIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 11 11 13 15 9"></polyline></svg>
);
const SwapIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 8 16 13"></polyline><line x1="21" y1="8" x2="9" y2="8"></line><polyline points="8 21 3 16 8 11"></polyline><line x1="3" y1="16" x2="15" y2="16"></line></svg>
);
const DepositIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
);
const WithdrawalIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
);
const BankIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 22h18M6 18v-7M10 18v-7M14 18v-7M18 18v-7M12 2L2 7h20L12 2z"></path></svg>
);
const GiftIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>
);
const TrendingIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
);
const SupportIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
);
const FileTextIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
);
const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
);
const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
);
const XIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
const WalletIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h14v4"></path><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"></path><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"></path></svg>
);
const ChevronLeftIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
);
const ChevronRightIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
);

function AdminPanel({ prices, onLogout, currentUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname.split('/').pop() || 'dashboard';

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('admin_sidebar_collapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('admin_sidebar_collapsed', isSidebarCollapsed);
  }, [isSidebarCollapsed]);

  // System Stats
  const [totalVolume, setTotalVolume] = useState(12500000);
  const [totalUsersCount, setTotalUsersCount] = useState(10480);

  // Custom Overrides for Market Rates
  const [customUSDT, setCustomUSDT] = useState('85');
  const [customBTC, setCustomBTC] = useState('8540000');
  const [customETH, setCustomETH] = useState('210000');
  const [customUSDC, setCustomUSDC] = useState('88');

  // Load saved rates from database on mount
  useEffect(() => {
    const loadSavedRates = async () => {
      try {
        const data = await fetchExchangeRates();
        if (data && data.rates) {
          setCustomUSDT(String(data.rates.USDT ?? '85'));
          setCustomBTC(String(data.rates.BTC ?? '8540000'));
          setCustomETH(String(data.rates.ETH ?? '210000'));
          setCustomUSDC(String(data.rates.USDC ?? '88'));
        }
      } catch (err) {
        console.warn('Could not load saved exchange rates:', err.message);
      }
    };
    loadSavedRates();
  }, []);

  // Simulated & Connected Users Database
  const [users, setUsers] = useState([]);

  // Load registered users from API
  const loadUsers = async (quiet = false) => {
    try {
      const dbUsers = await fetchAllUsers();
      // Format the database users to match the local keys:
      const formatted = dbUsers.map((u, i) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        countryCode: u.countryCode,
        kyc: u.kycStatus || 'Unverified',
        kycDetails: u.kycDetails || {},
        volume: u.role === 'admin' ? 12500000 : 25000 * (i + 1), // custom default mock volume
        date: new Date(u.createdAt).toISOString().split('T')[0],
        status: u.status || 'Active',
        role: u.role || 'user',
        balances: u.balances || { BTC: 0, ETH: 0, USDT: 0, USDC: 0 },
        cxId: u.cxId
      }));

      const pendingKyc = dbUsers
        .filter(u => u.kycStatus === 'Pending' || u.kycStatus === 'Rejected')
        .map(u => ({
          id: `KYC-${u._id.toString().slice(-4).toUpperCase()}`,
          userId: u._id,
          userName: u.name,
          email: u.email,
          phone: u.phone,
          countryCode: u.countryCode,
          kycStatus: u.kycStatus || 'Pending',
          kycDetails: u.kycDetails || {},
          docUploaded: 'Selfie Photo',
          date: new Date(u.createdAt).toISOString().split('T')[0],
          cxId: u.cxId
        }));

      setUsers(formatted);
      setKycRequests(pendingKyc);

      // Collect bank accounts dynamically
      const allBanks = [];
      dbUsers.forEach(u => {
        if (u.bankAccounts && Array.isArray(u.bankAccounts)) {
          u.bankAccounts.forEach(bank => {
            allBanks.push({
              id: bank._id || bank.id,
              userId: u._id,
              userName: u.name,
              email: u.email,
              cxId: u.cxId,
              countryCode: u.countryCode || '+91',
              bankName: bank.name,
              accountNumber: bank.number,
              ifsc: bank.ifsc,
              verified: bank.verified
            });
          });
        }
      });
      setBanks(allBanks);

      setTotalUsersCount(dbUsers.length);
      if (!quiet) {
        alert('KYC compliance queue refreshed from database.');
      }
    } catch (err) {
      console.warn('Could not sync with MongoDB admin endpoints:', err.message);
    }
  };

  // Load real user orders from database
  const loadOrders = async () => {
    try {
      const dbOrders = await fetchAllOrders();
      // Format orders for the table:
      const formatted = dbOrders.map(o => ({
        id: o._id, // Raw mongodb ID for database operations
        orderId: `#${o._id.toString().slice(-4).toUpperCase()}`,
        userName: o.userName,
        countryCode: o.user?.countryCode || '+91',
        coin: o.coin,
        amount: o.amount,
        inr: o.inr,
        bankDetails: o.bankDetails,
        txId: o.txId,
        screenshot: o.screenshot,
        status: o.status,
        date: o.createdAt || new Date().toISOString(),
        user: o.user,
        payoutOption: o.payoutOption
      }));
      setOrders(formatted);
    } catch (err) {
      console.warn('Could not load exchange orders:', err.message);
    }
  };

  useEffect(() => {
    loadUsers(true);
    loadOrders();
  }, []);

  // KYC Requests Ledger
  const [kycRequests, setKycRequests] = useState([]);

  // Exchange Orders Ledger
  const [orders, setOrders] = useState([]);

  // Ledger Movements (Deposits & Withdrawals)
  const [ledgerMovements, setLedgerMovements] = useState([]);

  // User Bank Links
  const [banks, setBanks] = useState([]);

  // Support Tickets
  const [tickets, setTickets] = useState([]);

  // Block/Unblock status toggle handler
  const handleToggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Blocked' : 'Active';
    try {
      if (userId && typeof userId === 'string' && userId.length === 24) {
        await apiUpdateUserStatus(userId, newStatus);
      }
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      alert(`User account status updated to ${newStatus}`);
    } catch (err) {
      alert(`Error updating status: ${err.message}`);
    }
  };

  // Delete user account handler
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user account? This action cannot be undone.')) {
      return;
    }
    try {
      const isMongoId = /^[0-9a-fA-F]{24}$/.test(String(userId));
      if (isMongoId) {
        await apiDeleteUser(userId);
      }
      setUsers(prev => prev.filter(u => u.id !== userId));
      alert('User account deleted successfully.');
    } catch (err) {
      alert(`Error deleting user: ${err.message}`);
    }
  };

  // KYC Handlers
  const handleKycApprove = async (id, userId) => {
    try {
      if (userId && typeof userId === 'string' && userId.length === 24) {
        await apiUpdateUserKyc(userId, 'Verified');
      }
      setKycRequests(prev => prev.filter(r => r.id !== id));
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, kyc: 'Verified' } : u));
      alert(`KYC approved for User ID ${userId}`);
    } catch (err) {
      alert(`Error approving KYC: ${err.message}`);
    }
  };

  const handleKycReject = async (id, userId) => {
    try {
      if (userId && typeof userId === 'string' && userId.length === 24) {
        await apiUpdateUserKyc(userId, 'Rejected');
      }
      setKycRequests(prev => prev.filter(r => r.id !== id));
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, kyc: 'Rejected' } : u));
      alert(`KYC rejected for User ID ${userId}`);
    } catch (err) {
      alert(`Error rejecting KYC: ${err.message}`);
    }
  };

  const handleCancelKyc = async (userId) => {
    try {
      if (userId && typeof userId === 'string' && userId.length === 24) {
        await apiUpdateUserKyc(userId, 'Unverified');
      }
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, kyc: 'Unverified' } : u));
      // Re-load users to ensure local states sync with backend
      loadUsers(true);
      alert(`KYC verification has been cancelled. User ID ${userId} is now Unverified.`);
    } catch (err) {
      alert(`Error cancelling KYC: ${err.message}`);
    }
  };

  // Order status adjusters
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatusApi(orderId, newStatus);
      loadOrders();
      alert(`Order updated to ${newStatus}`);
    } catch (err) {
      alert(`Error updating order status: ${err.message}`);
    }
  };

  // Deposit/Withdrawal Approval
  const handleApproveMovement = (id) => {
    setLedgerMovements(prev => prev.map(m => m.id === id ? { ...m, status: 'Completed' } : m));
    alert(`Transaction ${id} approved successfully!`);
  };

  // Bank verification toggle
  const handleToggleBankVerify = async (bankId) => {
    const bankItem = banks.find(b => b.id === bankId);
    if (!bankItem || !bankItem.userId) {
      alert('Could not find user associated with this bank account');
      return;
    }
    try {
      await toggleAdminBankVerify(bankItem.userId, bankId);
      loadUsers(true);
      alert(`Bank account verification status updated`);
    } catch (err) {
      alert(`Error updating bank verification: ${err.message}`);
    }
  };

  // Rates Override Save
  const handleSaveOverrides = async (e) => {
    e.preventDefault();
    try {
      await saveExchangeRates({
        USDT: Number(customUSDT),
        BTC: Number(customBTC),
        ETH: Number(customETH),
        USDC: Number(customUSDC)
      });
      alert(`All exchange rates saved to database successfully!`);
    } catch (err) {
      alert(`Error saving rates: ${err.message}`);
    }
  };

  // Export Audit CSV
  const handleExportAuditCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + [["Order ID", "User", "Coin", "Amount", "INR Value", "Status", "Date"],
      ...orders.map(o => [o.id, o.userName, o.coin, o.amount, o.inr, o.status, o.date])
      ].map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "cashXcrypto_admin_orders.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="dashboard-root" style={{ background: '#04060d', minHeight: '100vh', color: '#fff', display: 'flex', fontFamily: 'var(--font-sans)' }}>

      {/* Admin Sidebar Navigation */}
      <aside className={`dashboard-sidebar ${isMobileSidebarOpen ? 'open' : ''} ${isSidebarCollapsed ? 'collapsed' : ''}`} style={{ borderRight: '1px solid rgba(255,23,68,0.1)' }}>
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
            {!isSidebarCollapsed && <span style={{ fontSize: '1.25rem' }}>CAS<span className="gradient-text" style={{ background: 'linear-gradient(135deg, var(--danger), #ff8a00)' }}>ADMIN</span></span>}
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

        <nav className="sidebar-nav-menu" style={{ padding: isSidebarCollapsed ? '16px 8px' : '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[
            { id: 'dashboard', name: 'Dashboard', icon: <DashboardIcon /> },
            { id: 'users', name: 'Users', icon: <UsersIcon /> },
            { id: 'kyc', name: 'KYC Requests', icon: <ShieldCheckIcon /> },
            { id: 'kyccomplete', name: 'KYC Done / Complete', icon: <ShieldCheckIcon /> },
            { id: 'orders', name: 'Exchange Orders', icon: <SwapIcon /> },
            { id: 'deposits', name: 'Deposits', icon: <DepositIcon /> },
            { id: 'withdrawals', name: 'Withdrawals', icon: <WithdrawalIcon /> },
            { id: 'banks', name: 'Bank Accounts', icon: <BankIcon /> },
            { id: 'referrals', name: 'Referral System', icon: <GiftIcon /> },
            { id: 'rates', name: 'Rates Management', icon: <TrendingIcon /> },
            { id: 'walletset', name: 'Wallet Settings', icon: <WalletIcon /> },
            { id: 'tickets', name: 'Support Tickets', icon: <SupportIcon /> },
            { id: 'reports', name: 'Reports', icon: <FileTextIcon /> },
            { id: 'userreport', name: 'User Report', icon: <UserReportIcon /> },
            { id: 'settings', name: 'Settings', icon: <SettingsIcon /> }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => { navigate(`/admin/${item.id}`); setIsMobileSidebarOpen(false); }}
              className={`sidebar-nav-item ${activeTab === item.id ? 'active' : ''}`}
              style={{
                background: activeTab === item.id ? 'rgba(255, 23, 68, 0.08)' : '',
                borderColor: activeTab === item.id ? 'var(--danger)' : '',
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
            title={isSidebarCollapsed ? 'Exit Admin' : undefined}
          >
            <LogoutIcon />
            {!isSidebarCollapsed && <span>Exit Admin</span>}
          </button>
        </nav>
      </aside>

      {/* Main Panel Content Area */}
      <div className="dashboard-main-area" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative', zIndex: 105 }}>

        {/* Top Navbar */}
        <header className="dashboard-navbar" style={{ background: 'rgba(6, 9, 20, 0.85)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 90, backdropFilter: 'blur(10px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="sidebar-toggle-btn"
              onClick={() => setIsMobileSidebarOpen(true)}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'none' }}
            >
              <MenuIcon />
            </button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', textTransform: 'capitalize', color: 'var(--danger)' }}>Admin: {activeTab}</h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span className="badge badge-error" style={{ background: 'rgba(255,23,68,0.15)', color: 'var(--danger)', fontWeight: '700' }}>SYS OWNER ROLE</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.85rem' }}>
                AD
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: '600' }} className="profile-name-nav">Admin Dashboard</span>
            </div>
          </div>
        </header>

        <main className="dashboard-content-pane" style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
          <Routes>
            <Route path="dashboard" element={
              <AdminDashboard
                totalVolume={totalVolume}
                totalUsersCount={totalUsersCount}
                kycRequests={kycRequests}
                tickets={tickets}
              />
            } />

            <Route path="users" element={
              <AdminUsers
                users={users}
                onToggleStatus={handleToggleUserStatus}
                onDeleteUser={handleDeleteUser}
              />
            } />

            <Route path="kyc" element={
              <AdminKyc
                kycRequests={kycRequests}
                handleKycApprove={handleKycApprove}
                handleKycReject={handleKycReject}
                onRefresh={() => loadUsers(false)}
              />
            } />

            <Route path="kyccomplete" element={
              <AdminKycComplete
                verifiedUsers={users.filter(u => u.kyc === 'Verified')}
                handleCancelKyc={handleCancelKyc}
                onRefresh={() => loadUsers(false)}
              />
            } />

            <Route path="orders" element={
              <AdminOrders
                orders={orders}
                handleUpdateOrderStatus={handleUpdateOrderStatus}
              />
            } />

            <Route path="deposits" element={
              <AdminNewDeposits mode="deposits" />
            } />

            <Route path="newdeposits" element={
              <AdminNewDeposits mode="deposits" />
            } />

            <Route path="withdrawals" element={
              <AdminNewDeposits mode="withdrawals" />
            } />

            <Route path="banks" element={
              <AdminBanks
                banks={banks}
                handleToggleBankVerify={handleToggleBankVerify}
              />
            } />

            <Route path="referrals" element={
              <AdminReferrals />
            } />

            <Route path="rates" element={
              <AdminRates />
            } />

            <Route path="tickets" element={
              <AdminTickets
                tickets={tickets}
                setTickets={setTickets}
              />
            } />

            <Route path="reports" element={
              <AdminReports
                handleExportAuditCSV={handleExportAuditCSV}
              />
            } />

            <Route path="userreport" element={
              <AdminUserReport users={users} />
            } />

            <Route path="settings" element={
              <AdminSettings />
            } />

            <Route path="walletset" element={
              <AdminWalletSet />
            } />

            <Route path="" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>
      </div>

    </div>
  );
}

// Small helper icons
const MenuIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
);

export default AdminPanel;
