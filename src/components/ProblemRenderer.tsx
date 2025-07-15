import React from 'react';
import ReactMarkdown from 'react-markdown';
import { SystemDesignProblem, DifficultyLevel } from '../types/problem';
import './ProblemRenderer.css';

interface DifficultyBadgeProps {
  difficulty: DifficultyLevel;
}

export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({ difficulty }) => {
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
    <div 
      className="difficulty-badge"
      style={{ backgroundColor: getDifficultyColor(difficulty) }}
    >
      {getDifficultyText(difficulty)}
    </div>
  );
};

interface ProblemRendererProps {
  problem: SystemDesignProblem;
}

const ProblemRenderer: React.FC<ProblemRendererProps> = ({
  problem
}) => {
  return (
    <div className="problem-renderer">
      <div className="problem-header-section">
        <div className="problem-header-content">
          <h2 className="problem-title">{problem.title}</h2>
          <DifficultyBadge difficulty={problem.difficulty} />
        </div>
        <p className="problem-description">{problem.description}</p>
      </div>
      <div className="problem-content">
        <ReactMarkdown>{problem.content}</ReactMarkdown>
      </div>
    </div>
  );
};

export default ProblemRenderer; 