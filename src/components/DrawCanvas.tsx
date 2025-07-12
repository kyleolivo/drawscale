import { Excalidraw } from "@excalidraw/excalidraw";
import { useAuth } from '../hooks/useAuth';
import './DrawCanvas.css';

function DrawCanvas(): JSX.Element {
  const { user, signOut } = useAuth();

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
      <div className="excalidraw-wrapper">
        <Excalidraw />
      </div>
    </div>
  );
}

export default DrawCanvas;