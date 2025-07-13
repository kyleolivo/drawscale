import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import ProblemDrawer from '../../../src/components/ProblemDrawer';
import { DEFAULT_PROBLEM } from '../../../src/constants/problems';

// Mock react-markdown
vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => <div data-testid="markdown-content">{children}</div>
}));

describe('ProblemDrawer', () => {
  const mockOnToggle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders problem title and description', () => {
    render(
      <ProblemDrawer
        problem={DEFAULT_PROBLEM}
        isOpen={true}
        onToggle={mockOnToggle}
      />
    );

    expect(screen.getByText('Test System Design Problem')).toBeInTheDocument();
    expect(screen.getByText('A simple test problem for the system design tool')).toBeInTheDocument();
  });

  it('renders difficulty badge with correct color and text', () => {
    render(
      <ProblemDrawer
        problem={DEFAULT_PROBLEM}
        isOpen={true}
        onToggle={mockOnToggle}
      />
    );

    const badge = screen.getByText('Medium');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveStyle({ backgroundColor: '#f59e0b' });
  });

  it('renders markdown content', () => {
    render(
      <ProblemDrawer
        problem={DEFAULT_PROBLEM}
        isOpen={true}
        onToggle={mockOnToggle}
      />
    );

    expect(screen.getByTestId('markdown-content')).toBeInTheDocument();
  });

  it('shows toggle button with correct text when open', () => {
    render(
      <ProblemDrawer
        problem={DEFAULT_PROBLEM}
        isOpen={true}
        onToggle={mockOnToggle}
      />
    );

    expect(screen.getByText('Hide Instructions')).toBeInTheDocument();
    expect(screen.getByLabelText('Hide instructions')).toBeInTheDocument();
  });

  it('shows toggle button with correct text when closed', () => {
    render(
      <ProblemDrawer
        problem={DEFAULT_PROBLEM}
        isOpen={false}
        onToggle={mockOnToggle}
      />
    );

    expect(screen.getByText('Show Instructions')).toBeInTheDocument();
    expect(screen.getByLabelText('Show instructions')).toBeInTheDocument();
  });

  it('calls onToggle when toggle button is clicked', () => {
    render(
      <ProblemDrawer
        problem={DEFAULT_PROBLEM}
        isOpen={true}
        onToggle={mockOnToggle}
      />
    );

    const toggleButton = screen.getByRole('button', { name: /hide instructions/i });
    fireEvent.click(toggleButton);

    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  it('applies correct CSS classes based on open state', () => {
    const { rerender } = render(
      <ProblemDrawer
        problem={DEFAULT_PROBLEM}
        isOpen={true}
        onToggle={mockOnToggle}
      />
    );

    const drawer = screen.getByText('Test System Design Problem').closest('.problem-drawer');
    expect(drawer).toHaveClass('open');
    expect(drawer).not.toHaveClass('closed');

    rerender(
      <ProblemDrawer
        problem={DEFAULT_PROBLEM}
        isOpen={false}
        onToggle={mockOnToggle}
      />
    );

    const closedDrawer = screen.getByRole('button', { name: /show instructions/i }).closest('.problem-drawer');
    expect(closedDrawer).toHaveClass('closed');
    expect(closedDrawer).not.toHaveClass('open');
  });

  it('renders arrow icon that rotates based on state', () => {
    const { rerender } = render(
      <ProblemDrawer
        problem={DEFAULT_PROBLEM}
        isOpen={true}
        onToggle={mockOnToggle}
      />
    );

    const arrow = screen.getByRole('button').querySelector('.toggle-arrow');
    expect(arrow).toHaveClass('open');

    rerender(
      <ProblemDrawer
        problem={DEFAULT_PROBLEM}
        isOpen={false}
        onToggle={mockOnToggle}
      />
    );

    const closedArrow = screen.getByRole('button').querySelector('.toggle-arrow');
    expect(closedArrow).not.toHaveClass('open');
  });

  it('defaults to open state when isOpen prop is not provided', () => {
    render(
      <ProblemDrawer
        problem={DEFAULT_PROBLEM}
        onToggle={mockOnToggle}
      />
    );

    expect(screen.getByText('Hide Instructions')).toBeInTheDocument();
    expect(screen.getByText('Test System Design Problem')).toBeInTheDocument();
  });
}); 