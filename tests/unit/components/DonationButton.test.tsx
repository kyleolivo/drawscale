import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

const VALID_URL = 'https://buy.stripe.com/test_123';

type MockStripeConfig = {
  paymentLink?: string;
};

async function renderWithConfig(config: MockStripeConfig) {
  vi.resetModules();
  vi.doMock('../../../src/config/stripe', () => ({
    STRIPE_CONFIG: config,
  }));

  const { default: DonationButton } = await import('../../../src/components/DonationButton');
  return render(<DonationButton />);
}

describe('DonationButton', () => {
  const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

  beforeEach(() => {
    openSpy.mockClear();
  });

  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('hides when no payment link is configured', async () => {
    const config = {};

    const { container } = await renderWithConfig(config);
    expect(container).toBeEmptyDOMElement();
  });

  it('hides when payment link is undefined', async () => {
    const config = { paymentLink: undefined };

    const { container } = await renderWithConfig(config);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders button when payment link is configured', async () => {
    const config = { paymentLink: VALID_URL };

    await renderWithConfig(config);

    const button = screen.getByRole('button', { name: /support drawscale/i });
    expect(button).toBeInTheDocument();
  });

  it('opens payment link in new tab when clicked', async () => {
    const config = { paymentLink: VALID_URL };

    await renderWithConfig(config);

    const button = screen.getByRole('button', { name: /support drawscale/i });
    fireEvent.click(button);

    expect(openSpy).toHaveBeenCalledWith(VALID_URL, '_blank', 'noopener,noreferrer');
  });

  it('displays correct button text and icon', async () => {
    const config = { paymentLink: VALID_URL };

    await renderWithConfig(config);

    const button = screen.getByRole('button', { name: /support drawscale/i });
    expect(button).toHaveTextContent('Tip');
    
    const icon = button.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });
});
