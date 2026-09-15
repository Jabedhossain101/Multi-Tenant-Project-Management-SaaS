import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PricingPage from '../app/pricing/page.js';

describe('PricingPage', () => {
  it('renders all pricing tiers and FAQs', () => {
    render(<PricingPage />);

    expect(screen.getByText('Free')).toBeDefined();
    expect(screen.getByText('Pro')).toBeDefined();
    expect(screen.getByText('Enterprise')).toBeDefined();

    expect(screen.getByText('Frequently Asked Questions')).toBeDefined();
    expect(screen.getByText(/Can I change or cancel my plan at any time\?/i)).toBeDefined();
  });
});
