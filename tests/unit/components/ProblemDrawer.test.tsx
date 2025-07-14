import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import ProblemDrawer from '../../../src/components/ProblemDrawer';
import { DEFAULT_PROBLEM } from '../../../src/constants/problems';

// Mock react-markdown
vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => <div data-testid="markdown-content">{children}</div>
}));

describe('ProblemDrawer', () => {
  it('renders problem title and description', () => {
    render(
      <ProblemDrawer
        problem={DEFAULT_PROBLEM}
        isOpen={true}
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
      />
    );

    expect(screen.getByTestId('markdown-content')).toBeInTheDocument();
  });

  it('applies correct CSS classes based on open state', () => {
    const { rerender } = render(
      <ProblemDrawer
        problem={DEFAULT_PROBLEM}
        isOpen={true}
      />
    );

    const drawer = screen.getByText('Test System Design Problem').closest('.problem-drawer');
    expect(drawer).toHaveClass('open');
    expect(drawer).not.toHaveClass('closed');

    rerender(
      <ProblemDrawer
        problem={DEFAULT_PROBLEM}
        isOpen={false}
      />
    );

    const closedDrawer = screen.getByText('Test System Design Problem').closest('.problem-drawer');
    expect(closedDrawer).toHaveClass('closed');
    expect(closedDrawer).not.toHaveClass('open');
  });

  it('defaults to open state when isOpen prop is not provided', () => {
    render(
      <ProblemDrawer
        problem={DEFAULT_PROBLEM}
      />
    );

    expect(screen.getByText('Test System Design Problem')).toBeInTheDocument();
  });
}); 