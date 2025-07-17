import React from 'react';
import ReactMarkdown from 'react-markdown';
import { AnalysisResult } from '../types/problem';
import './ProblemAnalysis.css';

interface ProblemAnalysisProps {
  analysisResult: AnalysisResult;
}

const ProblemAnalysis: React.FC<ProblemAnalysisProps> = ({
  analysisResult
}) => {
  return (
    <div className="analysis-section">
      <div className="analysis-header">
        <div className="analysis-title">
          <div className="analysis-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4"/>
              <path d="M21 12c.552 0 1-.448 1-1s-.448-1-1-1"/>
              <path d="M3 12c-.552 0-1-.448-1-1s.448-1 1-1"/>
              <path d="M12 21c0 .552-.448 1-1 1s-1-.448-1-1"/>
              <path d="M12 3c0-.552-.448-1-1-1s1-.448 1-1"/>
            </svg>
          </div>
          <h3>Analysis Complete</h3>
        </div>
        <span className="analysis-timestamp">
          {analysisResult.timestamp.toLocaleTimeString()}
        </span>
      </div>
      
      <div className="analysis-content">
        <div className="transcription-section">
          <div className="section-header">
            <div className="section-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
            </div>
            <h4>Your Commentary</h4>
          </div>
          <div className="transcription-content">
            <div className="quote-mark">&ldquo;</div>
            <p className="transcription-text">{analysisResult.transcription}</p>
            <div className="quote-mark closing">&rdquo;</div>
          </div>
        </div>
        
        <div className="ai-analysis-section">
          <div className="section-header">
            <div className="section-icon ai-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6"/>
                <path d="m21 12-6-3-6 3-6-3"/>
              </svg>
            </div>
            <h4>AI Feedback</h4>
          </div>
          <div className="analysis-text">
            <ReactMarkdown>{analysisResult.analysis}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemAnalysis; 