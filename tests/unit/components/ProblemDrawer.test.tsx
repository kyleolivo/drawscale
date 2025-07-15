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
    // There may be multiple 'Design Bitly' headings (title and markdown)
    expect(screen.getAllByText('Design Bitly').length).toBeGreaterThanOrEqual(1);
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
}); 