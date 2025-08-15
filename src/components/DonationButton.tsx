import React from 'react';
import { STRIPE_CONFIG } from '../config/stripe';
import './DonationButton.css';

const DonationButton: React.FC = () => {
  const handleClick = () => {
    if (STRIPE_CONFIG?.paymentLink) {
      window.open(STRIPE_CONFIG.paymentLink, '_blank', 'noopener,noreferrer');
    }
  };

  // Don't render if no payment link is configured
  if (!STRIPE_CONFIG?.paymentLink) {
    return null;
  }

  return (
    <div className="donation-container">
      <button
        className="donation-button"
        onClick={handleClick}
        aria-label="Support DrawScale"
        title="Support DrawScale"
      >
        <svg
          className="donation-icon"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 21s-6.716-4.584-9.428-7.296C.86 12.992 0 11.62 0 10.095 0 7.718 1.933 6 4.22 6c1.3 0 2.53.584 3.333 1.556L12 12l4.447-4.444C17.251 6.584 18.481 6 19.78 6 22.067 6 24 7.718 24 10.095c0 1.525-.86 2.897-2.572 3.609C18.716 16.416 12 21 12 21z" />
        </svg>
        <span className="donation-text">Tip</span>
      </button>
    </div>
  );
};

export default DonationButton;
