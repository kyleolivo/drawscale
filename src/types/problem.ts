export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

export interface SystemDesignProblem {
  id: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  content: string; // markdown content
}

export interface ProblemDrawerProps {
  problem: SystemDesignProblem;
  isOpen?: boolean;
  onToggle?: () => void;
} 