import React from 'react';
import './ProcessingIndicator.css';

interface ProcessingIndicatorProps {
  message?: string;
}

const ProcessingIndicator: React.FC<ProcessingIndicatorProps> = ({ 
  message = "Processing your submission..." 
}) => {
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