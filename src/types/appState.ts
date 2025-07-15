import { SystemDesignProblem, AnalysisResult } from './problem';

export enum ApplicationState {
  PROBLEMS_DIRECTORY = 'problems_directory',
  PROBLEM_PRESENTATION = 'problem_presentation'
}

export interface DrawCanvasAppState {
  currentState: ApplicationState;
  currentProblem: SystemDesignProblem;
  analysisResult?: AnalysisResult;
}
