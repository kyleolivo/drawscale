import React from 'react';
import { User } from '../types/problem';
import './AppHeader.css';

interface AppHeaderProps {
  user?: User;
  onSignOut?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  user,
  onSignOut
}) => {
  return (
    <div className="app-header">
      <div className="app-title">
        <h1>DrawScale</h1>
        <p>System Design Interview Prep Tool</p>
      </div>
      {user && (
        <div className="user-info">
          <span>Welcome, {user.name || user.email || 'User'}</span>
          {onSignOut && (
            <button onClick={onSignOut} className="logout-button">
              Sign Out
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AppHeader; 