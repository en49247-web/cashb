import React from 'react';
import { Send, Shield, Bank } from './Icons';

function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Send Crypto',
      description: 'Choose your desired cryptocurrency, input details, and transfer to our secure wallet. We support BTC, ETH, USDT, USDC, BNB & XRP.',
      icon: <Send style={{ width: '36px', height: '36px' }} />
    },
    {
      number: '2',
      title: 'Confirm Transaction',
      description: 'Our automated validation engine monitors the blockchain network. You get real-time status updates at every stage of the transfer.',
      icon: <Shield style={{ width: '36px', height: '36px' }} />
    },
    {
      number: '3',
      title: 'Receive INR in Bank',
      description: 'Within minutes of verification, INR is instantly credited to your bank account via UPI or IMPS. Best rates, zero delays.',
      icon: <Bank style={{ width: '36px', height: '36px' }} />
    }
  ];

  return (
    <section id="how-it-works" style={{ background: 'rgba(255, 255, 255, 0.01)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
      <div className="container">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Convert your crypto portfolio to hard cash in three simple steps.</p>
        </div>

        <div className="steps-grid">
          {steps.map((step, index) => (
            <div key={index} className="glass-panel step-card">
              <div className="step-number-badge">{step.number}</div>
              <div className="step-icon-wrapper">
                {step.icon}
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
