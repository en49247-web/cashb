import React, { useState } from 'react';
import { ChevronDown } from './Icons';

function FAQ() {
  const faqs = [
    {
      question: 'How long does withdrawal take?',
      answer: 'Typically, payouts are completed within 2 to 5 minutes. As soon as your cryptocurrency deposit receives the required network confirmations on the blockchain (e.g. 1 confirmation for BTC, near-instant speeds for USDC, and 12 confirmations for ETH/USDT ERC20), our system automatically executes the IMPS bank transfer or UPI transfer.'
    },
    {
      question: 'Which cryptocurrencies are supported?',
      answer: 'We support six major high-liquidity cryptocurrencies for conversion to INR: Bitcoin (BTC), Ethereum (ETH), Tether (USDT - TRC20/ERC20 networks), Binance Coin (BNB - BEP20/BEP2 networks), USD Coin (USDC), and Ripple (XRP).'
    },
    {
      question: 'Are KYC documents required?',
      answer: 'For transactions up to ₹50,000 per day, no formal KYC documents are required; you only need to provide valid Indian bank details or UPI ID. For daily transactions exceeding ₹50,000, basic PAN and Aadhaar verification is required to comply with Financial Intelligence Unit (FIU-IND) and AML guidelines.'
    },
    {
      question: 'What are the fees?',
      answer: 'We believe in absolute transparency. There are zero deposit fees and zero hidden charges. The rate shown on the calculator is the final rate you receive. A standard 0.2% fee is already factored into the exchange rate to cover blockchain gas/miner fees.'
    }
  ];

  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section id="faqs">
      <div className="container">
        <div className="section-header">
          <h2>Frequently Asked Questions</h2>
          <p>Everything you need to know about converting your crypto to INR on cashXcrypto.</p>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => {
            const isActive = activeIndex === index;
            return (
              <div
                key={index}
                className={`faq-item ${isActive ? 'active' : ''}`}
              >
                <div
                  className="faq-question"
                  onClick={() => toggleAccordion(index)}
                >
                  <span>{faq.question}</span>
                  <ChevronDown />
                </div>
                <div
                  className="faq-answer"
                  style={{
                    maxHeight: isActive ? '300px' : '0',
                    paddingBottom: isActive ? '20px' : '0'
                  }}
                >
                  {faq.answer}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FAQ;
