import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

const VALID_URL = 'https://buy.stripe.com/test_123';

async function renderWithConfig(config: any) {
  vi.resetModules();
  vi.doMock('../../../src/config/stripe', () => ({
    STRIPE_CONFIG: config,
  }), { virtual: true });

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

  it('hides when no valid links are configured', async () => {
    const config = {
      paymentLinks: {
        small: { amount: 1.99, label: 'Small', url: 'https://buy.stripe.com/YOUR_SMALL' },
        medium: { amount: 4.99, label: 'Medium', url: 'https://buy.stripe.com/YOUR_MEDIUM' },
        large: { amount: 9.99, label: 'Large', url: 'https://buy.stripe.com/YOUR_LARGE' },
      },
    };

    const { container } = await renderWithConfig(config);
    expect(container).toBeEmptyDOMElement();
  });

  it('opens a single link directly when only one tier is valid', async () => {
    const config = {
      paymentLinks: {
        small: { amount: 4.99, label: 'Tip', url: VALID_URL },
        medium: { amount: 4.99, label: 'Tip', url: 'https://buy.stripe.com/YOUR_MEDIUM' },
        large: { amount: 9.99, label: 'Large', url: 'https://buy.stripe.com/YOUR_LARGE' },
      },
    };

    await renderWithConfig(config);

    const button = screen.getByRole('button', { name: /support with \$4\.99/i });
    fireEvent.click(button);

    expect(openSpy).toHaveBeenCalledWith(VALID_URL, '_blank', 'noopener,noreferrer');
  });

  it('shows a menu and opens selected tier when multiple are valid', async () => {
    const config = {
      paymentLinks: {
        small: { amount: 1.99, label: 'Small', url: VALID_URL + '_small' },
        medium: { amount: 4.99, label: 'Medium', url: VALID_URL + '_medium' },
        large: { amount: 9.99, label: 'Large', url: 'https://buy.stripe.com/YOUR_LARGE' },
      },
    };

    await renderWithConfig(config);

    const main = screen.getByRole('button', { name: /support drawscale/i });
    fireEvent.click(main);

    const option = screen.getByRole('menuitem', { name: /medium/i });
    fireEvent.click(option);

    expect(openSpy).toHaveBeenCalledWith(VALID_URL + '_medium', '_blank', 'noopener,noreferrer');
  });
});
