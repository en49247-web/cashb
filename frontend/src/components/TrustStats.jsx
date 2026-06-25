import React from 'react';

function TrustStats() {
  const stats = [
    { number: '₹50Cr+', label: 'Volume Exchanged' },
    { number: '10,000+', label: 'Happy Users' },
    { number: '99.9%', label: 'Platform Uptime' },
    { number: '24/7', label: 'Customer Support' }
  ];

  return (
    <section className="stats-section">
      <div className="container">
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TrustStats;
