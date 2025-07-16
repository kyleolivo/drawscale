import React from 'react';
import { User } from '../types/problem';
import './AppHeader.css';

interface AppHeaderProps {
  user?: User;
  onSignOut?: () => void;
  onBackToProblems?: () => void;
  showBackButton?: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  user,
  onSignOut,
  onBackToProblems,
  showBackButton = false
}) => {
  const getUserInitials = (user: User): string => {
    if (user.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="app-header">
      <div className="app-title">
        {showBackButton && onBackToProblems && (
          <button 
            className="back-button-header" 
            onClick={onBackToProblems}
            aria-label="Back to problems list"
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 16 16" 
              fill="none"
            >
              <path 
                d="M10 12L6 8L10 4" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
        <h1>DrawScale</h1>
      </div>
      {user && (
        <div className="user-section">
          <div className="user-avatar">
            {getUserInitials(user)}
          </div>
          {onSignOut && (
            <button onClick={onSignOut} className="logout-button" title="Sign Out">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16,17 21,12 16,7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AppHeader; 