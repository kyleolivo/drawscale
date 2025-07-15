import { DrawCanvasAppState } from './appState';

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
  judgementCriteria: string; // markdown content
}

export interface AnalysisResult {
  transcription: string;
  analysis: string;
  timestamp: Date;
}

export interface User {
  id: string;
  email?: string;
  name?: string;
}

export interface ProblemDrawerProps {
  appState: DrawCanvasAppState;
  isOpen?: boolean;
  onToggle?: () => void;
  user?: User;
  onSignOut?: () => void;
  onProblemSelect?: (problem: SystemDesignProblem) => void;
} 