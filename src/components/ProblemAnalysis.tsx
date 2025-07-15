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
        <h3>🎙️ AI Analysis</h3>
        <span className="analysis-timestamp">
          {analysisResult.timestamp.toLocaleTimeString()}
        </span>
      </div>
      
      <div className="analysis-content">
        <div className="transcription-section">
          <h4>📝 Your Commentary:</h4>
          <p className="transcription-text">&ldquo;{analysisResult.transcription}&rdquo;</p>
        </div>
        
        <div className="ai-analysis-section">
          <h4>🤖 AI Feedback:</h4>
          <div className="analysis-text">
            <ReactMarkdown>{analysisResult.analysis}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemAnalysis; 