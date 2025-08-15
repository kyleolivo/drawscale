// Stripe Payment Link Configuration
// Replace these URLs with your actual Stripe Payment Link URLs
// You can create these in your Stripe Dashboard under Payment Links

export const STRIPE_CONFIG = {
  paymentLinks: {
    // Update these to your Payment Links from Stripe Dashboard
    // Leave any URL as-is (with YOUR_) to hide that tier in the UI
    small: {
      amount: 1.99,
      label: 'Small tip',
      description: 'Buy me a small coffee',
      url: 'https://buy.stripe.com/YOUR_SMALL_DONATION_LINK', // Replace with your actual link
    },
    medium: {
      amount: 4.99,
      label: 'Medium tip',
      description: 'Buy me a coffee',
      url: 'https://buy.stripe.com/5kQcN599S1rEampeoy5sA00', // Custom-amount Payment Link
    },
    large: {
      amount: 9.99,
      label: 'Large tip',
      description: 'Buy me a large coffee',
      url: 'https://buy.stripe.com/YOUR_LARGE_DONATION_LINK', // Replace with your actual link
    },
  },
};

export type DonationTier = keyof typeof STRIPE_CONFIG.paymentLinks;

