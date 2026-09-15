import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from '../app/page.js';

describe('HomePage', () => {
  it('renders heading and platform description', () => {
    render(<HomePage />);
    expect(
      screen.getByRole('heading', { level: 1, name: /Intelligent Project Management/i }),
    ).toBeDefined();
    expect(screen.getAllByText(/Gemini AI/i).length).toBeGreaterThan(0);
  });
});
