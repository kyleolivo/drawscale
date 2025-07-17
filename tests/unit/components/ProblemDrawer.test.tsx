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

  it('no longer shows processing indicator in drawer (moved to overlay)', () => {
    const { container } = render(
      <ProblemDrawer
        {...baseProps}
      />
    );

    // Processing indicator is no longer rendered in the drawer
    expect(container.querySelector('.processing-indicator')).not.toBeInTheDocument();
    expect(container.querySelector('.processing-indicator-compact')).not.toBeInTheDocument();
  });

  it('hides processing indicator (no longer used in drawer)', () => {
    const { container } = render(
      <ProblemDrawer
        {...baseProps}
      />
    );

    expect(container.querySelector('.processing-indicator')).not.toBeInTheDocument();
  });

  it('maintains clean drawer content without processing indicator', () => {
    const { container } = render(
      <ProblemDrawer
        {...baseProps}
      />
    );

    const drawerContent = container.querySelector('.drawer-content');
    const problemRenderer = container.querySelector('.problem-renderer');

    expect(drawerContent).toBeInTheDocument();
    expect(problemRenderer).toBeInTheDocument();
    
    // Processing indicator should not be in the drawer content
    expect(container.querySelector('.processing-indicator')).not.toBeInTheDocument();
    expect(container.querySelector('.processing-indicator-compact')).not.toBeInTheDocument();
  });

  it('defaults to not showing processing indicator when prop is undefined', () => {
    const { container } = render(<ProblemDrawer {...baseProps} />);

    expect(container.querySelector('.processing-indicator')).not.toBeInTheDocument();
  });
}); 