import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import ProblemAnalysis from '../../../src/components/ProblemAnalysis';

// Mock react-markdown
vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => <div data-testid="markdown-content">{children}</div>
}));

describe('ProblemAnalysis', () => {
  const mockAnalysisResult = {
    transcription: 'This is a test transcription of the user\'s commentary',
    analysis: 'This is the AI analysis of the system design diagram',
    timestamp: new Date('2024-01-01T12:00:00Z')
  };

  it('renders analysis section with all components', () => {
    render(
      <ProblemAnalysis
        analysisResult={mockAnalysisResult}
      />
    );

    expect(screen.getByText('Analysis Complete')).toBeInTheDocument();
    expect(screen.getByText('Your Commentary')).toBeInTheDocument();
    expect(screen.getByText('AI Feedback')).toBeInTheDocument();
  });

  it('displays transcription text with proper formatting', () => {
    render(
      <ProblemAnalysis
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
      <ProblemAnalysis
        analysisResult={mockAnalysisResult}
      />
    );

    const analysisContent = screen.getAllByTestId('markdown-content');
    // Should have at least 1 markdown content for the analysis
    expect(analysisContent.length).toBeGreaterThanOrEqual(1);
    
    // Check that analysis text is rendered
    expect(screen.getByText('This is the AI analysis of the system design diagram')).toBeInTheDocument();
  });

  it('displays formatted timestamp', () => {
    render(
      <ProblemAnalysis
        analysisResult={mockAnalysisResult}
      />
    );

    // The timestamp should be formatted as locale time
    const timestamp = mockAnalysisResult.timestamp.toLocaleTimeString();
    expect(screen.getByText(timestamp)).toBeInTheDocument();
  });

  it('applies correct CSS classes to analysis sections', () => {
    const { container } = render(
      <ProblemAnalysis
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
      <ProblemAnalysis
        analysisResult={mockAnalysisResult}
      />
    );

    const analysisHeader = container.querySelector('.analysis-header');
    expect(analysisHeader).toBeInTheDocument();
    
    // Should contain both the title and timestamp
    expect(analysisHeader).toContainElement(screen.getByText('Analysis Complete'));
    expect(analysisHeader).toContainElement(screen.getByText(mockAnalysisResult.timestamp.toLocaleTimeString()));
  });

  it('handles empty transcription gracefully', () => {
    const emptyAnalysisResult = {
      ...mockAnalysisResult,
      transcription: ''
    };

    render(
      <ProblemAnalysis
        analysisResult={emptyAnalysisResult}
      />
    );

    expect(screen.getByText('Your Commentary')).toBeInTheDocument();
    
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
      <ProblemAnalysis
        analysisResult={emptyAnalysisResult}
      />
    );

    expect(screen.getByText('AI Feedback')).toBeInTheDocument();
    // Empty analysis should still render the section
    const analysisSection = screen.getByText('AI Feedback').closest('.ai-analysis-section');
    expect(analysisSection).toBeInTheDocument();
  });

  it('updates when analysisResult changes', () => {
    const { rerender } = render(
      <ProblemAnalysis
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
      <ProblemAnalysis
        analysisResult={updatedAnalysisResult}
      />
    );

    expect(screen.getByText(/Updated transcription text/)).toBeInTheDocument();
    expect(screen.getByText('Updated analysis text')).toBeInTheDocument();
  });

  it('displays transcription with proper quotation marks', () => {
    render(
      <ProblemAnalysis
        analysisResult={mockAnalysisResult}
      />
    );

    const transcriptionText = document.querySelector('.transcription-text');
    expect(transcriptionText).toHaveTextContent(mockAnalysisResult.transcription);
    // Check that quote marks are present as decorative elements
    const quoteMarks = document.querySelectorAll('.quote-mark');
    expect(quoteMarks).toHaveLength(2);
  });
}); 