import React, { useState } from 'react';
import { CoinIconLogo, ChevronDown, X } from './Icons';
import siteLogo from '../assets/logo.png';

function Header({ prices, onExchangeClick, onViewRatesClick, onLoginClick, onRegisterClick, currentUser, onDashboardClick }) {
  const allCoins = ['BTC', 'ETH', 'USDT', 'BNB', 'USDC', 'XRP'];
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeFolder, setActiveFolder] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleFolder = (folderName) => {
    setActiveFolder(activeFolder === folderName ? null : folderName);
  };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100 }}>
      {/* 1. Slim Top Ticker Bar */}
      {prices && Object.keys(prices).length > 0 && (
        <div className="top-bar">
          <div className="top-bar-container">
            <div className="top-bar-ticker">
              <div className="ticker-track">
                <div className="ticker-scroll-content">
                  {allCoins.map(symbol => {
                    const data = prices[symbol];
                    if (!data) return null;
                    const isUp = data.usd_24h_change >= 0;
                    return (
                      <div key={symbol} className="ticker-item">
                        <CoinIconLogo symbol={symbol} size={14} />
                        <span style={{ color: 'var(--text-secondary)' }}>{symbol}:</span>
                        <span style={{ color: '#fff' }}>${data.usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <span style={{ color: isUp ? 'var(--success)' : 'var(--danger)', fontSize: '0.72rem' }}>
                          {isUp ? '▲' : '▼'}{Math.abs(data.usd_24h_change).toFixed(1)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
                {/* Secondary copy for infinite loop */}
                <div className="ticker-scroll-content" aria-hidden="true">
                  {allCoins.map(symbol => {
                    const data = prices[symbol];
                    if (!data) return null;
                    const isUp = data.usd_24h_change >= 0;
                    return (
                      <div key={`${symbol}-copy`} className="ticker-item">
                        <CoinIconLogo symbol={symbol} size={14} />
                        <span style={{ color: 'var(--text-secondary)' }}>{symbol}:</span>
                        <span style={{ color: '#fff' }}>${data.usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <span style={{ color: isUp ? 'var(--success)' : 'var(--danger)', fontSize: '0.72rem' }}>
                          {isUp ? '▲' : '▼'}{Math.abs(data.usd_24h_change).toFixed(1)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Navigation Bar */}
      <nav className={`navbar ${isScrolled ? 'scrolled-island' : ''}`}>
        <div className="container nav-container">
          {/* Logo */}
          <a href="/" className="logo" style={{ display: 'flex', alignItems: 'center' }}>
            <img src={siteLogo} alt="Logo" style={{ width: '38px', height: '38px', borderRadius: '6px', objectFit: 'cover', marginRight: '10px' }} />
            <span>CASH<span className="gradient-text">XCRYPTO</span></span>
          </a>

          {/* Desktop Links with Dropdowns */}
          <ul className="nav-links-wrapper">

            {/* Products Dropdown */}
            <li className="nav-dropdown">
              <button className="nav-dropdown-trigger">
                Products <ChevronDown />
              </button>
              <div className="nav-dropdown-menu">
                <a href="#calculator" onClick={(e) => { e.preventDefault(); onExchangeClick(); }} className="dropdown-link">
                  <span className="dropdown-link-title">Instant Off-Ramp</span>
                  <span className="dropdown-link-desc">Convert cryptocurrencies to INR in under 2 minutes.</span>
                </a>
                <a href="#supported-coins" className="dropdown-link">
                  <span className="dropdown-link-title">Supported Assets</span>
                  <span className="dropdown-link-desc">View details for BTC, ETH, USDT, BNB, USDC, & XRP.</span>
                </a>
                <a href="#calculator" onClick={(e) => { e.preventDefault(); onExchangeClick(); }} className="dropdown-link">
                  <span className="dropdown-link-title">OTC Payout Desk</span>
                  <span className="dropdown-link-desc">Dedicated liquidity rails for volumes over ₹10 Lakhs.</span>
                </a>
              </div>
            </li>

            {/* Resources Dropdown */}
            <li className="nav-dropdown">
              <button className="nav-dropdown-trigger">
                Resources <ChevronDown />
              </button>
              <div className="nav-dropdown-menu">
                <a href="#faqs" className="dropdown-link">
                  <span className="dropdown-link-title">FAQ Center</span>
                  <span className="dropdown-link-desc">Common questions on fees, speed, and safety.</span>
                </a>
                <a href="#how-it-works" className="dropdown-link">
                  <span className="dropdown-link-title">Process Workflow</span>
                  <span className="dropdown-link-desc">Learn how our automated escrows confirm transactions.</span>
                </a>
                <a href="#compliance" onClick={(e) => e.preventDefault()} className="dropdown-link">
                  <span className="dropdown-link-title">KYC & AML Guide</span>
                  <span className="dropdown-link-desc">FIU guidelines for Indian virtual digital assets.</span>
                </a>
              </div>
            </li>

            {/* Company Dropdown */}
            <li className="nav-dropdown">
              <button className="nav-dropdown-trigger">
                Company <ChevronDown />
              </button>
              <div className="nav-dropdown-menu" style={{ width: '240px' }}>
                <a href="#benefits" className="dropdown-link">
                  <span className="dropdown-link-title">About Us</span>
                  <span className="dropdown-link-desc">cashXcrypto mission and team parameters.</span>
                </a>
                <a href="#security" onClick={(e) => e.preventDefault()} className="dropdown-link">
                  <span className="dropdown-link-title">Security & Escrows</span>
                  <span className="dropdown-link-desc">Cold storage and multi-signature design.</span>
                </a>
                <a href="https://wa.me/#" target="_blank" rel="noreferrer" className="dropdown-link">
                  <span className="dropdown-link-title">Contact Support</span>
                  <span className="dropdown-link-desc">Direct WhatsApp and help desk link.</span>
                </a>
              </div>
            </li>

            {/* Static Rate link */}
            <li>
              <a
                href="#rates"
                onClick={(e) => { e.preventDefault(); onViewRatesClick(); }}
                className="nav-static-link"
              >
                Rates
              </a>
            </li>
          </ul>

          {/* Desktop Right Actions (Login & Register or Dashboard) */}
          <div className="nav-actions">
            {currentUser ? (
              <button
                className="btn btn-primary"
                onClick={onDashboardClick}
                style={{ padding: '9px 22px', fontSize: '0.85rem' }}
              >
                Dashboard
              </button>
            ) : (
              <>
                <button
                  className="btn btn-secondary"
                  onClick={onLoginClick}
                  style={{ padding: '8px 20px', fontSize: '0.85rem', background: 'transparent', border: 'none' }}
                >
                  Sign In
                </button>
                <button
                  className="btn btn-primary"
                  onClick={onRegisterClick}
                  style={{ padding: '9px 22px', fontSize: '0.85rem' }}
                >
                  Register
                </button>
              </>
            )}
          </div>

          {/* Mobile Hamburger Trigger */}
          <button className="hamburger-btn" onClick={() => setIsMobileOpen(true)} aria-label="Toggle Mobile Menu">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </nav>

      {/* 3. Mobile Navigation Side Drawer */}
      <div
        className={`mobile-drawer-overlay ${isMobileOpen ? 'open' : ''}`}
        onClick={() => setIsMobileOpen(false)}
      >
        <div
          className={`mobile-drawer ${isMobileOpen ? 'open' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drawer Top */}
          <div className="drawer-header">
            <a href="/" className="logo" onClick={() => setIsMobileOpen(false)} style={{ display: 'flex', alignItems: 'center' }}>
              <img src={siteLogo} alt="Logo" style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover', marginRight: '10px' }} />
              <span style={{ fontSize: '1.2rem' }}>CASH<span className="gradient-text">XCRYPTO</span></span>
            </a>
            <button
              className="modal-close-btn"
              style={{ position: 'static', padding: '6px' }}
              onClick={() => setIsMobileOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body Links Accordion */}
          <div className="drawer-body">

            {/* Products Accordion */}
            <div className="mobile-drawer-accordion">
              <button
                className={`accordion-title-btn ${activeFolder === 'products' ? 'active' : ''}`}
                onClick={() => toggleFolder('products')}
              >
                <span>Products</span>
                <ChevronDown style={{ width: '16px', height: '16px' }} />
              </button>
              <div className={`accordion-content-list ${activeFolder === 'products' ? 'open' : ''}`}>
                <a href="#calculator" onClick={(e) => { e.preventDefault(); setIsMobileOpen(false); onExchangeClick(); }}>
                  Instant Off-Ramp
                </a>
                <a href="#supported-coins" onClick={() => setIsMobileOpen(false)}>
                  Supported Assets
                </a>
                <a href="#calculator" onClick={(e) => { e.preventDefault(); setIsMobileOpen(false); onExchangeClick(); }}>
                  OTC Payout Desk
                </a>
              </div>
            </div>

            {/* Resources Accordion */}
            <div className="mobile-drawer-accordion">
              <button
                className={`accordion-title-btn ${activeFolder === 'resources' ? 'active' : ''}`}
                onClick={() => toggleFolder('resources')}
              >
                <span>Resources</span>
                <ChevronDown style={{ width: '16px', height: '16px' }} />
              </button>
              <div className={`accordion-content-list ${activeFolder === 'resources' ? 'open' : ''}`}>
                <a href="#faqs" onClick={() => setIsMobileOpen(false)}>
                  FAQ Center
                </a>
                <a href="#how-it-works" onClick={() => setIsMobileOpen(false)}>
                  Process Workflow
                </a>
                <a href="#compliance" onClick={(e) => { e.preventDefault(); setIsMobileOpen(false); }}>
                  KYC & AML Guide
                </a>
              </div>
            </div>

            {/* Company Accordion */}
            <div className="mobile-drawer-accordion">
              <button
                className={`accordion-title-btn ${activeFolder === 'company' ? 'active' : ''}`}
                onClick={() => toggleFolder('company')}
              >
                <span>Company</span>
                <ChevronDown style={{ width: '16px', height: '16px' }} />
              </button>
              <div className={`accordion-content-list ${activeFolder === 'company' ? 'open' : ''}`}>
                <a href="#benefits" onClick={() => setIsMobileOpen(false)}>
                  About Us
                </a>
                <a href="#security" onClick={(e) => { e.preventDefault(); setIsMobileOpen(false); }}>
                  Security & Escrows
                </a>
                <a href="https://wa.me/#" target="_blank" rel="noreferrer" onClick={() => setIsMobileOpen(false)}>
                  Contact Support
                </a>
              </div>
            </div>

            {/* Static Rate link */}
            <a
              href="#rates"
              className="mobile-static-link"
              onClick={(e) => {
                e.preventDefault();
                setIsMobileOpen(false);
                onViewRatesClick();
              }}
            >
              Rates
            </a>
          </div>

          {/* Drawer Actions */}
          <div className="drawer-footer">
            {currentUser ? (
              <button
                className="btn btn-primary"
                onClick={() => { setIsMobileOpen(false); onDashboardClick(); }}
                style={{ width: '100%', padding: '12px' }}
              >
                Dashboard
              </button>
            ) : (
              <>
                <button
                  className="btn btn-secondary"
                  onClick={() => { setIsMobileOpen(false); onLoginClick(); }}
                  style={{ width: '100%', padding: '12px', marginBottom: '8px' }}
                >
                  Sign In
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => { setIsMobileOpen(false); onRegisterClick(); }}
                  style={{ width: '100%', padding: '12px' }}
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
