import React from 'react';
import { Shield, Zap, TrendingUp, PhoneCall, Bank } from './Icons';

function WhyChooseUs() {
  const benefits = [
    {
      title: 'Bank-Level Security',
      description: 'Your assets are protected by enterprise-grade cold vaults, multi-signature authentication, and fully encrypted transactions.',
      icon: <Shield style={{ width: '24px', height: '24px' }} />
    },
    {
      title: 'Fast Settlements',
      description: 'Enjoy instant automated bank credits. 95% of our payouts are settled via IMPS/UPI in less than 2 minutes of blockchain validation.',
      icon: <Zap style={{ width: '24px', height: '24px' }} />
    },
    {
      title: 'Competitive Rates',
      description: 'Our smart order router sweeps liquidity across top exchanges to ensure you receive the absolute best INR payout rates.',
      icon: <TrendingUp style={{ width: '24px', height: '24px' }} />
    },
    {
      title: '24/7 Support',
      description: 'Got questions? Talk to real people. Our dedicated customer success agents are online 24/7/365 to resolve your queries.',
      icon: <PhoneCall style={{ width: '24px', height: '24px' }} />
    },
    {
      title: 'INR Bank Transfers',
      description: 'Support for all major Indian banks. Withdraw via UPI, IMPS, or standard bank transfer seamlessly without any extra cost.',
      icon: <Bank style={{ width: '24px', height: '24px' }} />
    }
  ];

  return (
    <section id="benefits" style={{ background: 'rgba(255, 255, 255, 0.005)', borderTop: '1px solid var(--border-color)' }}>
      <div className="container">
        <div className="section-header">
          <h2>Why Choose Us</h2>
          <p>The simplest, safest, and fastest way to off-ramp your cryptocurrencies into Indian Rupees.</p>
        </div>

        <div className="benefits-grid">
          {benefits.map((benefit, index) => (
            <div key={index} className="glass-panel benefit-card">
              <div className="benefit-icon">
                {benefit.icon}
              </div>
              <div className="benefit-info">
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUs;
