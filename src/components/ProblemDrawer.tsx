import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ProblemDrawerProps, DifficultyLevel } from '../types/problem';
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
          d="M6 12L10 8L6 4" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

const ProblemDrawer: React.FC<ProblemDrawerProps> = ({
  problem,
  isOpen = true,
  analysisResult
}) => {
  const getDifficultyColor = (difficulty: DifficultyLevel): string => {
    switch (difficulty) {
      case DifficultyLevel.EASY:
        return '#10b981'; // green
      case DifficultyLevel.MEDIUM:
        return '#f59e0b'; // amber
      case DifficultyLevel.HARD:
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  const getDifficultyText = (difficulty: DifficultyLevel): string => {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  return (
    <div className={`problem-drawer ${isOpen ? 'open' : 'closed'}`}>
      <div className="drawer-header">
        <div className="header-content">
          <h2 className="problem-title">{problem.title}</h2>
          <div 
            className="difficulty-badge"
            style={{ backgroundColor: getDifficultyColor(problem.difficulty) }}
          >
            {getDifficultyText(problem.difficulty)}
          </div>
        </div>
        <p className="problem-description">{problem.description}</p>
      </div>
      
      <div className="drawer-content">
        <div className="problem-content">
          <ReactMarkdown>{problem.content}</ReactMarkdown>
        </div>
        
        {analysisResult && (
          <div className="analysis-section">
            <div className="analysis-header">
              <h3>🎙️ AI Analysis</h3>
              <span className="analysis-timestamp">
                {analysisResult.timestamp.toLocaleTimeString()}
              </span>
            </div>
            
            <div className="analysis-content">
              <div className="transcription-section">
                <h4>📝 Your Commentary:</h4>
                <p className="transcription-text">&ldquo;{analysisResult.transcription}&rdquo;</p>
              </div>
              
              <div className="ai-analysis-section">
                <h4>🤖 AI Feedback:</h4>
                <div className="analysis-text">
                  <ReactMarkdown>{analysisResult.analysis}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemDrawer; 