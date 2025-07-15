import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import ProblemDrawer from '../../../src/components/ProblemDrawer';
import { DEFAULT_PROBLEM } from '../../../src/constants/problems';

// Mock react-markdown
vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => <div data-testid="markdown-content">{children}</div>
}));

describe('ProblemDrawer', () => {
  it('renders problem title and description', () => {
    render(
      <ProblemDrawer
        problem={DEFAULT_PROBLEM}
        isOpen={true}
      />
    );

    expect(screen.getByText('Design Twitter')).toBeInTheDocument();
    expect(screen.getByText('A simple test problem for the system design tool')).toBeInTheDocument();
  });

  it('renders difficulty badge with correct color and text', () => {
    render(
      <ProblemDrawer
        problem={DEFAULT_PROBLEM}
        isOpen={true}
      />
    );

    const badge = screen.getByText('Medium');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveStyle({ backgroundColor: '#f59e0b' });
  });

  it('renders markdown content', () => {
    render(
      <ProblemDrawer
        problem={DEFAULT_PROBLEM}
        isOpen={true}
      />
    );

    expect(screen.getByTestId('markdown-content')).toBeInTheDocument();
  });

  it('applies correct CSS classes based on open state', () => {
    const { rerender } = render(
      <ProblemDrawer
        problem={DEFAULT_PROBLEM}
        isOpen={true}
      />
    );

    const drawer = screen.getByText('Design Twitter').closest('.problem-drawer');
    expect(drawer).toHaveClass('open');
    expect(drawer).not.toHaveClass('closed');

    rerender(
      <ProblemDrawer
        problem={DEFAULT_PROBLEM}
        isOpen={false}
      />
    );

    const closedDrawer = screen.getByText('Design Twitter').closest('.problem-drawer');
    expect(closedDrawer).toHaveClass('closed');
    expect(closedDrawer).not.toHaveClass('open');
  });

  it('defaults to open state when isOpen prop is not provided', () => {
    render(
      <ProblemDrawer
        problem={DEFAULT_PROBLEM}
      />
    );

    expect(screen.getByText('Design Twitter')).toBeInTheDocument();
  });

  describe('Analysis Results Display', () => {
    const mockAnalysisResult = {
      transcription: 'This is a test transcription of the user\'s commentary',
      analysis: 'This is the AI analysis of the system design diagram',
      timestamp: new Date('2024-01-01T12:00:00Z')
    };

    it('renders analysis section when analysisResult is provided', () => {
      render(
        <ProblemDrawer
          problem={DEFAULT_PROBLEM}
          isOpen={true}
          analysisResult={mockAnalysisResult}
        />
      );

      expect(screen.getByText('🎙️ AI Analysis')).toBeInTheDocument();
      expect(screen.getByText('📝 Your Commentary:')).toBeInTheDocument();
      expect(screen.getByText('🤖 AI Feedback:')).toBeInTheDocument();
    });

    it('displays transcription text with proper formatting', () => {
      render(
        <ProblemDrawer
          problem={DEFAULT_PROBLEM}
          isOpen={true}
          analysisResult={mockAnalysisResult}
        />
      );

      // The text might be split across elements, so check for the main content
      expect(screen.getByText(/This is a test transcription of the user's commentary/)).toBeInTheDocument();
      
      // Check that the transcription section exists with the right class
      const transcriptionSection = document.querySelector('.transcription-text');
      expect(transcriptionSection).toBeInTheDocument();
    });

    it('displays AI analysis with markdown rendering', () => {
      render(
        <ProblemDrawer
          problem={DEFAULT_PROBLEM}
          isOpen={true}
          analysisResult={mockAnalysisResult}
        />
      );

      const analysisContent = screen.getAllByTestId('markdown-content');
      // Should have at least 2 markdown contents: problem content + analysis
      expect(analysisContent.length).toBeGreaterThanOrEqual(2);
      
      // Check that analysis text is rendered
      expect(screen.getByText('This is the AI analysis of the system design diagram')).toBeInTheDocument();
    });

    it('displays formatted timestamp', () => {
      render(
        <ProblemDrawer
          problem={DEFAULT_PROBLEM}
          isOpen={true}
          analysisResult={mockAnalysisResult}
        />
      );

      // The timestamp should be formatted as locale time
      const timestamp = mockAnalysisResult.timestamp.toLocaleTimeString();
      expect(screen.getByText(timestamp)).toBeInTheDocument();
    });

    it('does not render analysis section when analysisResult is not provided', () => {
      render(
        <ProblemDrawer
          problem={DEFAULT_PROBLEM}
          isOpen={true}
        />
      );

      expect(screen.queryByText('🎙️ AI Analysis')).not.toBeInTheDocument();
      expect(screen.queryByText('📝 Your Commentary:')).not.toBeInTheDocument();
      expect(screen.queryByText('🤖 AI Feedback:')).not.toBeInTheDocument();
    });

    it('applies correct CSS classes to analysis sections', () => {
      const { container } = render(
        <ProblemDrawer
          problem={DEFAULT_PROBLEM}
          isOpen={true}
          analysisResult={mockAnalysisResult}
        />
      );

      const analysisSection = container.querySelector('.analysis-section');
      const transcriptionSection = container.querySelector('.transcription-section');
      const aiAnalysisSection = container.querySelector('.ai-analysis-section');

      expect(analysisSection).toBeInTheDocument();
      expect(transcriptionSection).toBeInTheDocument();
      expect(aiAnalysisSection).toBeInTheDocument();
    });

    it('renders analysis header with correct structure', () => {
      const { container } = render(
        <ProblemDrawer
          problem={DEFAULT_PROBLEM}
          isOpen={true}
          analysisResult={mockAnalysisResult}
        />
      );

      const analysisHeader = container.querySelector('.analysis-header');
      expect(analysisHeader).toBeInTheDocument();
      
      // Should contain both the title and timestamp
      expect(analysisHeader).toContainElement(screen.getByText('🎙️ AI Analysis'));
      expect(analysisHeader).toContainElement(screen.getByText(mockAnalysisResult.timestamp.toLocaleTimeString()));
    });

    it('handles empty transcription gracefully', () => {
      const emptyAnalysisResult = {
        ...mockAnalysisResult,
        transcription: ''
      };

      render(
        <ProblemDrawer
          problem={DEFAULT_PROBLEM}
          isOpen={true}
          analysisResult={emptyAnalysisResult}
        />
      );

      expect(screen.getByText('📝 Your Commentary:')).toBeInTheDocument();
      
      // Check that the transcription section exists even with empty content
      const transcriptionSection = document.querySelector('.transcription-text');
      expect(transcriptionSection).toBeInTheDocument();
    });

    it('handles empty analysis gracefully', () => {
      const emptyAnalysisResult = {
        ...mockAnalysisResult,
        analysis: ''
      };

      render(
        <ProblemDrawer
          problem={DEFAULT_PROBLEM}
          isOpen={true}
          analysisResult={emptyAnalysisResult}
        />
      );

      expect(screen.getByText('🤖 AI Feedback:')).toBeInTheDocument();
      // Empty analysis should still render the section
      const analysisSection = screen.getByText('🤖 AI Feedback:').closest('.ai-analysis-section');
      expect(analysisSection).toBeInTheDocument();
    });

    it('updates when analysisResult changes', () => {
      const { rerender } = render(
        <ProblemDrawer
          problem={DEFAULT_PROBLEM}
          isOpen={true}
          analysisResult={mockAnalysisResult}
        />
      );

      expect(screen.getByText(/This is a test transcription of the user's commentary/)).toBeInTheDocument();

      const updatedAnalysisResult = {
        ...mockAnalysisResult,
        transcription: 'Updated transcription text',
        analysis: 'Updated analysis text'
      };

      rerender(
        <ProblemDrawer
          problem={DEFAULT_PROBLEM}
          isOpen={true}
          analysisResult={updatedAnalysisResult}
        />
      );

      expect(screen.getByText(/Updated transcription text/)).toBeInTheDocument();
      expect(screen.getByText('Updated analysis text')).toBeInTheDocument();
    });
  });
}); 