import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import ProblemRenderer from '../../../src/components/ProblemRenderer';
import { DEFAULT_PROBLEM } from '../../../src/constants/problems';

// Mock react-markdown
vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => <div data-testid="markdown-content">{children}</div>
}));

describe('ProblemRenderer', () => {
  it('renders problem title and description', () => {
    render(
      <ProblemRenderer
        problem={DEFAULT_PROBLEM}
      />
    );

    expect(screen.getByText('Design Bitly')).toBeInTheDocument();
    expect(screen.getByText('A simple test problem for the system design tool')).toBeInTheDocument();
  });

  it('renders difficulty badge with correct color and text', () => {
    render(
      <ProblemRenderer
        problem={DEFAULT_PROBLEM}
      />
    );

    const badge = screen.getByText('Medium');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveStyle({ backgroundColor: '#f59e0b' });
  });

  it('renders markdown content', () => {
    render(
      <ProblemRenderer
        problem={DEFAULT_PROBLEM}
      />
    );

    expect(screen.getByTestId('markdown-content')).toBeInTheDocument();
  });
}); 