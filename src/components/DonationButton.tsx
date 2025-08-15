import React, { useMemo, useState } from 'react';
import { STRIPE_CONFIG } from '../config/stripe';
import './DonationButton.css';

type TierKey = 'small' | 'medium' | 'large';

interface PaymentLink {
  amount: number;
  label: string;
  description?: string;
  url: string;
}

interface DonationTier extends PaymentLink {
  key: TierKey;
}

function isValidStripeLink(url: string | undefined): boolean {
  if (!url) return false;
  // Avoid using placeholder links that include "YOUR_"
  if (/YOUR_/i.test(url)) return false;
  return /^https:\/\/buy\.stripe\.com\//.test(url);
}

const tierOrder: TierKey[] = ['small', 'medium', 'large'];

const DonationButton: React.FC = () => {
  const tiers = useMemo<DonationTier[]>(() => {
    const links = STRIPE_CONFIG?.paymentLinks as Record<string, PaymentLink> | undefined;
    if (!links) return [];

    return tierOrder
      .map((key) => {
        const link = links[key];
        if (!link) return undefined;
        return { key, ...link } as DonationTier;
      })
      .filter((t): t is DonationTier => !!t && isValidStripeLink(t.url));
  }, []);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (tiers.length === 0) {
    // Fallback: single custom-amount link via medium tier, if present even as placeholder
    const fallbackUrl = (STRIPE_CONFIG as any)?.paymentLinks?.medium?.url as string | undefined;
    if (!isValidStripeLink(fallbackUrl)) return null;
    const handleClick = () => {
      window.open(fallbackUrl!, '_blank', 'noopener,noreferrer');
    };
    return (
      <div className="donation-container">
        <button
          className="donation-button"
          onClick={handleClick}
          aria-label={`Support DrawScale`}
          title={`Support DrawScale`}
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
  }

  const handleMainClick = () => {
    if (tiers.length === 1) {
      window.open(tiers[0].url, '_blank', 'noopener,noreferrer');
      return;
    }
    setIsMenuOpen((prev) => !prev);
  };

  const handleTierClick = (tier: DonationTier) => {
    window.open(tier.url, '_blank', 'noopener,noreferrer');
    setIsMenuOpen(false);
  };

  const mainTitle = tiers.length === 1
    ? `Support with $${tiers[0].amount.toFixed(2)}`
    : 'Support DrawScale';

  return (
    <div className={`donation-container${isMenuOpen ? ' open' : ''}`}> 
      {isMenuOpen && tiers.length > 1 && (
        <div className="donation-menu" role="menu" aria-label="Donation options">
          {tiers.map((tier) => (
            <button
              key={tier.key}
              className="donation-option"
              onClick={() => handleTierClick(tier)}
              role="menuitem"
              aria-label={`${tier.label} - $${tier.amount.toFixed(2)}`}
              title={`${tier.label} — $${tier.amount.toFixed(2)}`}
            >
              <span className="option-label">{tier.label}</span>
              <span className="option-amount">${tier.amount.toFixed(2)}</span>
            </button>
          ))}
        </div>
      )}

      <button
        className="donation-button"
        onClick={handleMainClick}
        aria-haspopup={tiers.length > 1 ? 'menu' : undefined}
        aria-expanded={tiers.length > 1 ? isMenuOpen : undefined}
        aria-label={mainTitle}
        title={mainTitle}
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
