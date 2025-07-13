import { SystemDesignProblem, DifficultyLevel } from '../types/problem';

export const DEFAULT_PROBLEM: SystemDesignProblem = {
  id: 'twitter-design',
  title: 'Test System Design Problem',
  description: 'A simple test problem for the system design tool',
  difficulty: DifficultyLevel.MEDIUM,
  content: `# Test System Design Problem

1. Design Twitter.
2. ??
3. Profit!`
}; 