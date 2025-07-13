import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ProblemDrawerProps, DifficultyLevel } from '../types/problem';
import './ProblemDrawer.css';

const ProblemDrawer: React.FC<ProblemDrawerProps> = ({
  problem,
  isOpen = true
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
      </div>
    </div>
  );
};

export default ProblemDrawer; 