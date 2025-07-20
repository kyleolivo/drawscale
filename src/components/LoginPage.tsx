import { useEffect, useState } from 'react';
import './LoginPage.css';

interface AppleSignInConfig {
  clientId: string;
  scope: string;
  redirectURI: string;
  state: string;
  usePopup: boolean;
}

interface AppleSignInResponse {
  authorization?: {
    id_token?: string;
  };
  user?: {
    email?: string;
    name?: {
      firstName?: string;
      lastName?: string;
    };
  };
}

interface LoginPageProps {
  onSignIn: (user: AppleSignInResponse) => Promise<void>;
}

declare global {
  interface Window {
    AppleID: {
      auth: {
        init: (config: AppleSignInConfig) => void;
        signIn: (config?: Record<string, unknown>) => Promise<AppleSignInResponse>;
      };
    };
  }
}

// Type declaration for Vite environment variables
declare global {
  interface ImportMetaEnv {
    readonly VITE_APPLE_CLIENT_ID?: string;
    readonly VITE_APPLE_REDIRECT_URI?: string;
  }
}

function LoginPage({ onSignIn }: LoginPageProps): JSX.Element {
  const isDevelopment = import.meta.env.DEV;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only load Apple Sign-In SDK in production
    if (!isDevelopment) {
      const script = document.createElement('script');
      script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
      script.async = true;
      script.onload = () => {
        if (window.AppleID) {
          window.AppleID.auth.init({
            clientId: import.meta.env.VITE_APPLE_CLIENT_ID || 'your.app.bundle.id',
            scope: 'name email',
            redirectURI: import.meta.env.VITE_APPLE_REDIRECT_URI || window.location.origin + '/auth/callback',
            state: 'auth',
            usePopup: true
          });
        }
      };
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }
  }, [isDevelopment]);

  const handleSignIn = async (userData: AppleSignInResponse) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await onSignIn(userData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign in failed';
      setError(errorMessage);
      console.error('Sign in error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      if (window.AppleID) {
        console.log('Starting Apple Sign-In...');
        const response = await window.AppleID.auth.signIn();
        console.log('Apple Sign-In response:', response);
        await handleSignIn(response);
      }
    } catch (error) {
      console.error('Apple Sign-In error:', error);
      setError('Apple Sign-In failed. Please try again.');
    }
  };

  const handleDevSignIn = async () => {
    // Mock user for development
    await handleSignIn({
      authorization: { id_token: 'dev-token-' + Date.now() },
      user: {
        email: 'dev@example.com',
        name: { firstName: 'Dev', lastName: 'User' }
      }
    });
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>DrawScale</h1>
          <p>System Design Interview Prep Tool</p>
          <p className="login-subtitle">Sign in to access the drawing canvas</p>
        </div>
        
        <div className="login-content">
          {error && (
            <div className="error-message">
              {error}
              <button onClick={() => setError(null)}>X</button>
            </div>
          )}
          
          {isDevelopment ? (
            <button 
              className="apple-signin-button"
              onClick={handleDevSignIn}
              type="button"
              disabled={isLoading}
              style={{ backgroundColor: '#007AFF' }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                style={{ marginRight: '8px' }}
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              {isLoading ? 'Signing In...' : 'Dev Sign In (Local Only)'}
            </button>
          ) : (
            <button 
              className="apple-signin-button"
              onClick={handleAppleSignIn}
              type="button"
              disabled={isLoading}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                style={{ marginRight: '8px' }}
              >
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              {isLoading ? 'Signing In...' : 'Sign in with Apple'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;