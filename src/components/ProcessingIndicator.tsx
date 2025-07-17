import React from 'react';
import './ProcessingIndicator.css';

interface ProcessingIndicatorProps {
  message?: string;
  variant?: 'full' | 'compact';
}

const ProcessingIndicator: React.FC<ProcessingIndicatorProps> = ({ 
  message = "Processing your submission...",
  variant = 'full'
}) => {
  if (variant === 'compact') {
    return (
      <div className="processing-indicator-compact">
        <div className="processing-spinner-compact">
          <div className="spinner-ring-compact">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
        <div className="processing-text-compact">
          Processing...
        </div>
      </div>
    );
  }

  return (
    <div className="processing-indicator">
      <div className="processing-spinner">
        <div className="spinner-ring">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
      <div className="processing-message">
        {message}
      </div>
      <div className="processing-details">
        Analyzing your design and commentary...
      </div>
    </div>
  );
};

export default ProcessingIndicator;