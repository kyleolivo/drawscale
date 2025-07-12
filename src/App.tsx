import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import LoginPage from './components/LoginPage';
import DrawCanvas from './components/DrawCanvas';
import VoiceNotesPage from './components/VoiceNotesPage';
import Navigation from './components/Navigation';
import './App.css';

function AppContent(): JSX.Element {
  const { isAuthenticated, isLoading, signIn } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onSignIn={signIn} />;
  }

  return (
    <div className="app-container">
      <Navigation />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<DrawCanvas />} />
          <Route path="/voice-notes" element={<VoiceNotesPage />} />
        </Routes>
      </main>
    </div>
  );
}

function App(): JSX.Element {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;