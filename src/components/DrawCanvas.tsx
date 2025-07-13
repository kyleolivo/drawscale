import { useState } from 'react';
import { Excalidraw } from "@excalidraw/excalidraw";
import { useAuth } from '../hooks/useAuth';
import ProblemDrawer from './ProblemDrawer';
import { DEFAULT_PROBLEM } from '../constants/problems';
import './DrawCanvas.css';

function DrawCanvas(): JSX.Element {
  const { user, signOut } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  const handleDrawerToggle = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <div className="header-title">
            <h1>DrawScale</h1>
            <p>System Design Interview Prep Tool</p>
          </div>
          <div className="header-user">
            <span>Welcome, {user?.name || user?.email || 'User'}</span>
            <button onClick={signOut} className="logout-button">
              Sign Out
            </button>
          </div>
        </div>
      </header>
      <div className="canvas-container">
        <ProblemDrawer
          problem={DEFAULT_PROBLEM}
          isOpen={isDrawerOpen}
          onToggle={handleDrawerToggle}
        />
        <div className={`excalidraw-wrapper ${isDrawerOpen ? 'with-drawer' : ''}`}>
          <Excalidraw />
        </div>
      </div>
    </div>
  );
}

export default DrawCanvas;