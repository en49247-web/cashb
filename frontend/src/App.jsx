import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import RatesTable from './components/RatesTable';
import HowItWorks from './components/HowItWorks';
import CoinsGrid from './components/CoinsGrid';
import WhyChooseUs from './components/WhyChooseUs';
import TrustStats from './components/TrustStats';
import Reviews from './components/Reviews';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import ExchangeModal from './components/ExchangeModal';
import AuthModal from './components/AuthModal';
import HeroVisual from './components/HeroVisual';
import UserPanel from './pages/userpannel/UserPanel';
import AdminPanel from './pages/adminpannel/AdminPanel';
import { fetchLivePrices, fluctuatePrices } from './services/api';
import { fetchUserProfile } from './services/auth';
import { ArrowRight } from './components/Icons';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [prices, setPrices] = useState({});
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('cashXcrypto_user');
    const token = localStorage.getItem('cashXcrypto_token');
    if (savedUser && token) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exchangeData, setExchangeData] = useState(null);

  // Auth modal states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'



  // 1. Fetch live prices on mount
  useEffect(() => {
    const loadPrices = async () => {
      const liveData = await fetchLivePrices();
      setPrices(liveData);
    };

    loadPrices();

    // Background sync with API every 30 seconds
    const apiInterval = setInterval(loadPrices, 30000);
    return () => clearInterval(apiInterval);
  }, []);

  // Refresh user profile from backend on mount so countryCode/fields are always fresh
  useEffect(() => {
    const token = localStorage.getItem('cashXcrypto_token');
    if (!token || !currentUser) return;

    const syncProfile = async () => {
      try {
        const freshUser = await fetchUserProfile();
        if (freshUser) {
          setCurrentUser(freshUser);
          localStorage.setItem('cashXcrypto_user', JSON.stringify(freshUser));
        }
      } catch (err) {
        console.warn('Could not sync user profile from backend:', err.message);
      }
    };

    syncProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Simulate live fluctuations every 4 seconds to make the tickers feel dynamic
  useEffect(() => {
    if (Object.keys(prices).length === 0) return;

    const fluctuationInterval = setInterval(() => {
      setPrices(currentPrices => fluctuatePrices(currentPrices));
    }, 4000);

    return () => clearInterval(fluctuationInterval);
  }, [prices]);

  // Scroll window to top when changing views
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Capture referral code from URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref');
    if (ref) {
      sessionStorage.setItem('cashXcrypto_referral_code', ref);
      setAuthMode('register');
      setIsAuthModalOpen(true);
    }
  }, [location]);

  // Smooth scroll functions
  const scrollToRates = () => {
    document.getElementById('rates-section-title')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Callback when user clicks convert next to a coin card
  const handleCoinActionClick = (symbol) => {
    const rate = prices && prices[symbol] ? prices[symbol].inr : 100;
    const defaultAmount = symbol === 'BTC' ? 0.05 : symbol === 'ETH' ? 0.5 : symbol === 'USDT' ? 500 : symbol === 'BNB' ? 2 : symbol === 'USDC' ? 500 : 200;

    handleExchangeStart({
      coin: symbol,
      amount: defaultAmount,
      inrAmount: Math.round(defaultAmount * rate),
      paymentMethod: 'UPI'
    });
  };

  // Modal handlers
  const handleExchangeStart = (data) => {
    setExchangeData(data);
    setIsModalOpen(true);
  };

  const handleExchangeStartDefault = () => {
    if (prices && prices.BTC) {
      handleExchangeStart({
        coin: 'BTC',
        amount: 0.05,
        inrAmount: Math.round(0.05 * prices.BTC.inr),
        paymentMethod: 'UPI'
      });
    } else {
      handleExchangeStart({
        coin: 'BTC',
        amount: 0.05,
        inrAmount: 292500,
        paymentMethod: 'UPI'
      });
    }
  };

  const handleLoginClick = () => {
    setAuthMode('login');
    setIsAuthModalOpen(true);
  };

  const handleRegisterClick = () => {
    setAuthMode('register');
    setIsAuthModalOpen(true);
  };

  // Helper to detect current active panel
  const getActiveView = () => {
    if (location.pathname.startsWith('/admin')) return 'admin';
    if (location.pathname.startsWith('/user')) return 'user';
    return 'landing';
  };

  // Handle auto-login trigger on redirection
  useEffect(() => {
    if (location.state && location.state.openLogin) {
      setAuthMode('login');
      setIsAuthModalOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);


  const handleLogout = () => {
    localStorage.removeItem('cashXcrypto_token');
    localStorage.removeItem('cashXcrypto_user');
    sessionStorage.removeItem('cashXcrypto_kyc_dismissed');
    setCurrentUser(null);
  };

  return (
    <Routes>
      {/* User Dashboard Routes */}
      <Route path="/user/*" element={
        currentUser ? (
          currentUser.role === 'user' ? (
            <div className="app-container">
              <UserPanel prices={prices} onLogout={() => { handleLogout(); navigate('/'); }} currentUser={currentUser} setCurrentUser={setCurrentUser} />
            </div>
          ) : (
            <Navigate to="/admin/dashboard" replace />
          )
        ) : (
          <Navigate to="/" replace state={{ openLogin: true }} />
        )
      } />

      {/* Admin Dashboard Routes */}
      <Route path="/admin/*" element={
        currentUser ? (
          currentUser.role === 'admin' ? (
            <div className="app-container">
              <AdminPanel prices={prices} onLogout={() => { handleLogout(); navigate('/'); }} currentUser={currentUser} />
            </div>
          ) : (
            <Navigate to="/user/dashboard" replace />
          )
        ) : (
          <Navigate to="/" replace state={{ openLogin: true }} />
        )
      } />

      {/* Public Routes */}
      <Route path="*" element={
        <div className="app-container">
          {/* 1. Header Navigation */}
          <Header
            prices={prices}
            onExchangeClick={handleExchangeStartDefault}
            onViewRatesClick={scrollToRates}
            onLoginClick={handleLoginClick}
            onRegisterClick={handleRegisterClick}
            currentUser={currentUser}
            onDashboardClick={() => navigate(currentUser?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard')}
          />


          <main>
            {/* 2. Hero Section (Above the fold) */}
            <section id="hero-section" style={{ padding: '70px 0' }}>
              <div className="container hero-wrapper">

                {/* Center Hero content (full width after calculator removal) */}
                <div className="hero-content">
                  <div className="hero-badge">
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)' }}></span>
                    FIU-Compliant Instant Off-Ramp
                  </div>
                  <h1>Convert Cryptocurrency <span className="gradient-text">Instantly in Bank Account in 10 Min</span></h1>
                  <p>
                    Fast, Secure & Reliable Crypto Exchange Platform for Indian Users.
                    Transfer your Bitcoin, Ethereum, or Stablecoins directly to your UPI ID or bank account in minutes.
                  </p>

                  <div className="hero-buttons">
                    <button className="btn btn-primary" onClick={handleExchangeStartDefault}>
                      Exchange Now <ArrowRight />
                    </button>
                    <button className="btn btn-secondary" onClick={scrollToRates}>
                      View Rates
                    </button>
                  </div>

                  {/* Trust badges */}
                  <div className="hero-trust-badges">
                    <div className="trust-badge-item">
                      <span>₹50Cr+</span>
                      <span>Exchanged</span>
                    </div>
                    <div className="trust-badge-item" style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '30px' }}>
                      <span>10,000+</span>
                      <span>Active Users</span>
                    </div>
                    <div className="trust-badge-item" style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '30px' }}>
                      <span>&lt; 5m</span>
                      <span>Settlements</span>
                    </div>
                  </div>
                </div>

                <HeroVisual />

              </div>
            </section>

            {/* 3. Live Exchange Rates Table */}
            <section id="rates-section" style={{ padding: '60px 0', background: 'rgba(255,255,255,0.003)' }}>
              <div className="container">
                <div className="section-header" id="rates-section-title">
                  <h2>Live Exchange Rates</h2>
                  <p>Track live conversion rates of major crypto assets in USDT. Prices update in real-time.</p>
                </div>
                <RatesTable
                  prices={prices}
                  onActionClick={handleCoinActionClick}
                />
              </div>
            </section>

            {/* 4. How It Works Section */}
            <HowItWorks />

            {/* 5. Supported Cryptocurrencies Grid */}
            <CoinsGrid
              prices={prices}
              onActionClick={handleCoinActionClick}
            />

            {/* 6. Why Choose Us Section */}
            <WhyChooseUs />

            {/* 7. Platform Statistics Section */}
            <TrustStats />

            {/* 8. Verified Customer Reviews */}
            <Reviews />

            {/* 9. Frequently Asked Questions */}
            <FAQ />
          </main>

          {/* 10. Final CTA & Footer */}
          <Footer onExchangeStartClick={handleExchangeStartDefault} />

          {/* 11. Transaction Wizard Modal (renders conditionally) */}
          <ExchangeModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            exchangeData={exchangeData}
            prices={prices}
          />

          {/* 12. Auth Modal (Sign In / Register) */}
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            initialMode={authMode}
            onAuthSuccess={(user) => {
              sessionStorage.removeItem('cashXcrypto_kyc_dismissed');
              setCurrentUser(user);
              navigate(user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
            }}
          />
        </div>
      } />
    </Routes>
  );
}

export default App;
