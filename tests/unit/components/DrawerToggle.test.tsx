import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { DrawerToggle } from '../../../src/components/ProblemDrawer';

describe('DrawerToggle Component', () => {
  const mockOnToggle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders toggle button with correct aria-label when open', () => {
    render(
      <DrawerToggle
        isOpen={true}
        onToggle={mockOnToggle}
        isMobile={false}
      />
    );

    const button = screen.getByRole('button', { name: 'Hide instructions' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('drawer-toggle');
  });

  it('renders toggle button with correct aria-label when closed', () => {
    render(
      <DrawerToggle
        isOpen={false}
        onToggle={mockOnToggle}
        isMobile={false}
      />
    );

    const button = screen.getByRole('button', { name: 'Show instructions' });
    expect(button).toBeInTheDocument();
  });

  it('calls onToggle when clicked on desktop', () => {
    render(
      <DrawerToggle
        isOpen={true}
        onToggle={mockOnToggle}
        isMobile={false}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  it('does not call onToggle when clicked on mobile', () => {
    render(
      <DrawerToggle
        isOpen={true}
        onToggle={mockOnToggle}
        isMobile={true}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnToggle).not.toHaveBeenCalled();
  });

  it('is disabled on mobile', () => {
    render(
      <DrawerToggle
        isOpen={true}
        onToggle={mockOnToggle}
        isMobile={true}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('is enabled on desktop', () => {
    render(
      <DrawerToggle
        isOpen={true}
        onToggle={mockOnToggle}
        isMobile={false}
      />
    );

    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
  });

  it('applies correct CSS classes based on mobile state', () => {
    const { rerender } = render(
      <DrawerToggle
        isOpen={true}
        onToggle={mockOnToggle}
        isMobile={false}
      />
    );

    let button = screen.getByRole('button');
    expect(button).toHaveClass('drawer-toggle');
    expect(button).not.toHaveClass('hide-mobile');

    rerender(
      <DrawerToggle
        isOpen={true}
        onToggle={mockOnToggle}
        isMobile={true}
      />
    );

    button = screen.getByRole('button');
    expect(button).toHaveClass('drawer-toggle', 'hide-mobile');
  });

  it('renders SVG arrow icon', () => {
    render(
      <DrawerToggle
        isOpen={true}
        onToggle={mockOnToggle}
        isMobile={false}
      />
    );

    const svg = screen.getByRole('button').querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '16');
    expect(svg).toHaveAttribute('height', '16');
    expect(svg).toHaveAttribute('viewBox', '0 0 16 16');
  });

  it('applies correct CSS class to SVG based on open state', () => {
    const { rerender } = render(
      <DrawerToggle
        isOpen={true}
        onToggle={mockOnToggle}
        isMobile={false}
      />
    );

    let svg = screen.getByRole('button').querySelector('svg');
    expect(svg).toHaveClass('toggle-arrow', 'open');

    rerender(
      <DrawerToggle
        isOpen={false}
        onToggle={mockOnToggle}
        isMobile={false}
      />
    );

    svg = screen.getByRole('button').querySelector('svg');
    expect(svg).toHaveClass('toggle-arrow');
    expect(svg).not.toHaveClass('open');
  });

  it('renders SVG path with correct attributes', () => {
    render(
      <DrawerToggle
        isOpen={true}
        onToggle={mockOnToggle}
        isMobile={false}
      />
    );

    const path = screen.getByRole('button').querySelector('path');
    expect(path).toBeInTheDocument();
    expect(path).toHaveAttribute('d', 'M6 12L10 8L6 4');
    expect(path).toHaveAttribute('stroke', 'currentColor');
    expect(path).toHaveAttribute('stroke-width', '2');
    expect(path).toHaveAttribute('stroke-linecap', 'round');
    expect(path).toHaveAttribute('stroke-linejoin', 'round');
  });

  it('defaults isMobile to false when not provided', () => {
    render(
      <DrawerToggle
        isOpen={true}
        onToggle={mockOnToggle}
      />
    );

    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
    expect(button).not.toHaveClass('hide-mobile');
  });
}); 