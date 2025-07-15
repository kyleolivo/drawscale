import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import LoginPage from './components/LoginPage';
import DrawCanvas from './components/DrawCanvas';
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
    <Routes>
      <Route path="/" element={<DrawCanvas />} />
    </Routes>
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