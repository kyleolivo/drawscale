import React from 'react';
import { ProblemDrawerProps } from '../types/problem';
import { ApplicationState } from '../types/appState';
import ProblemRenderer from './ProblemRenderer';
import ProblemAnalysis from './ProblemAnalysis';
import ProblemPicker from './ProblemPicker';
import AppHeader from './AppHeader';
import ProcessingIndicator from './ProcessingIndicator';
import { PROBLEMS } from '../constants/problems';
import './ProblemDrawer.css';

interface DrawerToggleProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

export const DrawerToggle: React.FC<DrawerToggleProps> = ({ 
  isOpen, 
  onToggle, 
  isMobile = false 
}) => {
  const handleToggle = () => {
    if (!isMobile) {
      onToggle();
    }
  };

  return (
    <button 
      className={`drawer-toggle${isMobile ? ' hide-mobile' : ''}`}
      onClick={handleToggle}
      aria-label={isOpen ? 'Hide instructions' : 'Show instructions'}
      disabled={isMobile}
    >
      <svg 
        className={`toggle-arrow ${isOpen ? 'open' : ''}`}
        width="16" 
        height="16" 
        viewBox="0 0 16 16" 
        fill="none"
      >
        <path 
          d="M10 12L6 8L10 4" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

const ProblemDrawer: React.FC<ProblemDrawerProps & { 
  style?: React.CSSProperties; 
  onBackToProblems?: () => void;
  isProcessingSubmission?: boolean;
}> = ({
  appState,
  isOpen = true,
  user,
  onSignOut,
  onProblemSelect,
  onBackToProblems,
  isProcessingSubmission = false,
  style
}) => {
  return (
    <div className={`problem-drawer ${isOpen ? 'open' : 'closed'}`} style={style}>
      <div className="drawer-header">
        <AppHeader 
          user={user} 
          onSignOut={onSignOut}
          onBackToProblems={onBackToProblems}
          showBackButton={appState.currentState === ApplicationState.PROBLEM_PRESENTATION}
        />
      </div>
      
      <div className="drawer-content">
        {/* Show processing indicator when submission is being processed */}
        {isProcessingSubmission && (
          <ProcessingIndicator message="Analyzing your design solution..." />
        )}
        
        {appState.currentState === ApplicationState.PROBLEM_PRESENTATION && (
          <>
            <ProblemRenderer 
              problem={appState.currentProblem}
            />
            
            {appState.analysisResult && (
              <ProblemAnalysis analysisResult={appState.analysisResult} />
            )}
          </>
        )}
        
        {appState.currentState === ApplicationState.PROBLEMS_DIRECTORY && (
          <ProblemPicker 
            problems={PROBLEMS}
            onProblemSelect={onProblemSelect || (() => {})}
          />
        )}
      </div>
    </div>
  );
};

export default ProblemDrawer; 