import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import ProblemDrawer from '../../../src/components/ProblemDrawer';
import { ApplicationState } from '../../../src/types/appState';
import { DEFAULT_PROBLEM } from '../../../src/constants/problems';

describe('ProblemDrawer', () => {
  const baseProps = {
    appState: {
      currentState: ApplicationState.PROBLEM_PRESENTATION,
      currentProblem: DEFAULT_PROBLEM,
    },
    isOpen: true,
    user: { id: '1', name: 'Alice' },
    onSignOut: () => {},
    onProblemSelect: () => {},
  };

  it('renders the problem when in PROBLEM_PRESENTATION state', () => {
    render(<ProblemDrawer {...baseProps} />);
    // There may be multiple 'Blog Platform' headings (title and markdown)
    expect(screen.getAllByText('Blog Platform').length).toBeGreaterThanOrEqual(1);
  });

  it('renders the problem picker when in PROBLEMS_DIRECTORY state', () => {
    render(
      <ProblemDrawer
        {...baseProps}
        appState={{ ...baseProps.appState, currentState: ApplicationState.PROBLEMS_DIRECTORY }}
      />
    );
    expect(screen.getByText('Choose a System Design Problem')).toBeInTheDocument();
  });

  it('shows processing indicator when isProcessingSubmission is true', () => {
    const { container } = render(
      <ProblemDrawer
        {...baseProps}
        isProcessingSubmission={true}
      />
    );

    expect(container.querySelector('.processing-indicator')).toBeInTheDocument();
    expect(screen.getByText('Analyzing your design solution...')).toBeInTheDocument();
    expect(screen.getByText('Analyzing your design and commentary...')).toBeInTheDocument();
  });

  it('hides processing indicator when isProcessingSubmission is false', () => {
    const { container } = render(
      <ProblemDrawer
        {...baseProps}
        isProcessingSubmission={false}
      />
    );

    expect(container.querySelector('.processing-indicator')).not.toBeInTheDocument();
  });

  it('shows processing indicator above other content', () => {
    const { container } = render(
      <ProblemDrawer
        {...baseProps}
        isProcessingSubmission={true}
      />
    );

    const drawerContent = container.querySelector('.drawer-content');
    const processingIndicator = container.querySelector('.processing-indicator');
    const problemRenderer = container.querySelector('.problem-renderer');

    expect(drawerContent).toBeInTheDocument();
    expect(processingIndicator).toBeInTheDocument();
    expect(problemRenderer).toBeInTheDocument();

    // Processing indicator should appear before problem renderer in DOM order
    expect(drawerContent?.children[0]).toBe(processingIndicator);
  });

  it('defaults to not showing processing indicator when prop is undefined', () => {
    const { container } = render(<ProblemDrawer {...baseProps} />);

    expect(container.querySelector('.processing-indicator')).not.toBeInTheDocument();
  });
}); 