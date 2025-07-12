import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Navigation.css';

function Navigation(): JSX.Element {
  const { signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <Link to="/" className="brand-link">
          DrawScale
        </Link>
      </div>
      
      <div className="nav-links">
        <Link 
          to="/" 
          className={`nav-link ${isActive('/') ? 'active' : ''}`}
        >
          🎨 Canvas
        </Link>
        <Link 
          to="/voice-notes" 
          className={`nav-link ${isActive('/voice-notes') ? 'active' : ''}`}
        >
          🎤 Voice Notes
        </Link>
      </div>

      <div className="nav-actions">
        <button 
          className="sign-out-button" 
          onClick={signOut}
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}

export default Navigation;