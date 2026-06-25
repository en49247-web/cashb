import React from 'react';
import siteLogo from '../assets/logo.png';

function Footer({ onExchangeStartClick }) {
  return (
    <footer className="footer">
      <div className="container">

        {/* Final CTA Box integrated at the top of the footer area */}
        <div className="cta-section" style={{ marginBottom: '80px' }}>
          <div className="cta-box">
            <h2>Ready to Convert Crypto to INR?</h2>
            <p>Experience the fastest settlements, best market conversion rates, and robust security. Start your exchange now.</p>
            <button
              className="btn btn-primary"
              onClick={onExchangeStartClick}
              style={{ padding: '14px 40px', fontSize: '1rem' }}
            >
              Start Exchange
            </button>
          </div>
        </div>

        <div className="footer-grid">
          {/* Column 1: Logo & Info */}
          <div className="footer-logo-desc">
            <a href="/" className="logo" style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
              <img src={siteLogo} alt="Logo" style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover', marginRight: '10px' }} />
              <span>CASH<span className="gradient-text">XCRYPTO</span></span>
            </a>
            <p>
              cashXcrypto is India's premium crypto-to-INR instant off-ramp portal.
              We bridge the gap between blockchain assets and traditional banking systems.
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Registered with FIU-IND compliance standards.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#supported-coins">Supported Coins</a></li>
              <li><a href="#benefits">Why Choose Us</a></li>
              <li><a href="#rates">Live Rates</a></li>
            </ul>
          </div>

          {/* Column 3: Legal & Regulatory */}
          <div className="footer-col">
            <h4>Policies & Legal</h4>
            <ul>
              <li><a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a></li>
              <li><a href="#terms" onClick={(e) => e.preventDefault()}>Terms & Conditions</a></li>
              <li><a href="#aml" onClick={(e) => e.preventDefault()}>AML Policy</a></li>
              <li><a href="#kyc" onClick={(e) => e.preventDefault()}>KYC Policy</a></li>
            </ul>
          </div>

          {/* Column 4: Support */}
          <div className="footer-col">
            <h4>Support & Contact</h4>
            <p style={{ fontSize: '0.9rem', marginBottom: '10px' }}>
              Have questions? Reach out to our 24/7 technical desk.
            </p>
            <ul style={{ gap: '8px' }}>
              <li><span style={{ fontSize: '0.9rem', color: '#fff' }}>Email: </span><a href="mailto:support@cashXcrypto.com">support@cashXcrypto.com</a></li>
              <li><span style={{ fontSize: '0.9rem', color: '#fff' }}>WhatsApp: </span><a href="https://wa.me/#" target="_blank" rel="noreferrer">+91 98765 43210</a></li>
              <li><a href="#faqs">FAQ Help Desk</a></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div>
            &copy; {new Date().getFullYear()} cashXcrypto. All rights reserved.
          </div>

          {/* Crypto Risk Warning for Indian audience (Premium compliance touch) */}
          <div style={{ maxWidth: '600px', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4', textAlign: 'right' }}>
            Disclaimer: Crypto products and NFTs are unregulated and can be highly risky. There may be no regulatory recourse for any loss from such transactions. cashXcrypto operates strictly as a virtual digital asset conversion utility.
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
