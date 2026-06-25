import React from 'react';
import { Star } from './Icons';

function Reviews() {
  const reviews = [
    {
      text: "Received INR within minutes. I was initially hesitant about converting my Ethereum, but cashXcrypto made the payout process completely transparent. The money was in my HDFC account before I knew it!",
      author: "Rahul Sharma",
      role: "Crypto Day Trader",
      location: "Bangalore, IN",
      initials: "RS"
    },
    {
      text: "Simple, secure, and extremely trustworthy platform. The rate I saw on the calculator was exactly what I got in my bank account. The live status tracker kept me updated at every block confirmation.",
      author: "Priya Patel",
      role: "DeFi Yield Investor",
      location: "Mumbai, IN",
      initials: "PP"
    }
  ];

  return (
    <section id="reviews" style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', background: 'rgba(255, 255, 255, 0.005)' }}>
      <div className="container">
        <div className="section-header">
          <h2>Customer Reviews</h2>
          <p>Read what our community has to say about their instant conversion experiences.</p>
        </div>

        <div className="reviews-grid">
          {reviews.map((review, index) => (
            <div key={index} className="glass-panel review-card">
              <div className="review-stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} />
                ))}
              </div>
              <p className="review-text">"{review.text}"</p>

              <div className="review-author">
                <div className="review-avatar">
                  {review.initials}
                </div>
                <div className="review-author-info">
                  <h4>{review.author}</h4>
                  <p>{review.role} &bull; {review.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Reviews;
