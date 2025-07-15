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

export interface AnalysisResult {
  transcription: string;
  analysis: string;
  timestamp: Date;
}

export interface ProblemDrawerProps {
  problem: SystemDesignProblem;
  isOpen?: boolean;
  onToggle?: () => void;
  analysisResult?: AnalysisResult;
} 