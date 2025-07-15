import React from 'react';
import { SystemDesignProblem } from '../types/problem';
import { DifficultyBadge } from './ProblemRenderer';
import './ProblemPicker.css';

interface ProblemPickerProps {
  problems: SystemDesignProblem[];
  onProblemSelect: (problem: SystemDesignProblem) => void;
}

const ProblemPicker: React.FC<ProblemPickerProps> = ({
  problems,
  onProblemSelect
}) => {
  return (
    <div className="problem-picker">
      <h2 className="problem-picker-title">Choose a System Design Problem</h2>
      <div className="problem-cards">
        {problems.map((problem) => (
          <div
            key={problem.id}
            className="problem-card"
            onClick={() => onProblemSelect(problem)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onProblemSelect(problem);
              }
            }}
          >
            <div className="problem-card-header">
              <h3 className="problem-card-title">{problem.title}</h3>
              <DifficultyBadge difficulty={problem.difficulty} />
            </div>
            <p className="problem-card-description">{problem.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProblemPicker; 