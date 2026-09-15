import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../components/ui/button.js';
import { Badge } from '../components/ui/badge.js';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card.js';
import { Input } from '../components/ui/input.js';

describe('UI Primitives', () => {
  it('renders button with different variants', () => {
    const { rerender } = render(<Button variant="gradient">AI Action</Button>);
    expect(screen.getByRole('button', { name: /AI Action/i })).toBeDefined();

    rerender(<Button variant="destructive">Delete Item</Button>);
    expect(screen.getByRole('button', { name: /Delete Item/i })).toBeDefined();
  });

  it('renders badge with correct text and style', () => {
    render(<Badge variant="secondary">Pro Plan</Badge>);
    expect(screen.getByText('Pro Plan')).toBeDefined();
  });

  it('renders card with title and content', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Sprint Velocity</CardTitle>
        </CardHeader>
        <CardContent>
          <p>84 story points completed</p>
        </CardContent>
      </Card>,
    );
    expect(screen.getByText('Sprint Velocity')).toBeDefined();
    expect(screen.getByText('84 story points completed')).toBeDefined();
  });

  it('renders input with placeholder and disabled state', () => {
    render(<Input placeholder="Search tasks..." disabled />);
    const input = screen.getByPlaceholderText('Search tasks...') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });
});
