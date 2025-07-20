import { useState } from 'react';
import { supabase } from '../lib/supabase';
import './LoginPage.css';

interface LoginPageProps {
  /** Force development or production mode for testing purposes */
  forceMode?: 'development' | 'production';
}

function LoginPage({ forceMode }: LoginPageProps = {}): JSX.Element {
  const isDevelopment = forceMode ? forceMode === 'development' : import.meta.env.DEV;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOAuthSignIn = async (provider: 'apple' | 'google') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) {
        throw error;
      }

      // Clear loading state for testing purposes
      // In production, the user will be redirected to the OAuth provider
      setIsLoading(false);
      
      // The user will be redirected to the OAuth provider
      // The callback will handle the successful authentication
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign in failed';
      setError(errorMessage);
      console.error('OAuth sign in error:', err);
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = () => handleOAuthSignIn('apple');
  const handleGoogleSignIn = () => handleOAuthSignIn('google');

  const handleDevSignIn = async () => {
    // For development, we'll use email/password auth with a test user
    setIsLoading(true);
    setError(null);
    
    try {
      // Try to sign in with test user
      const { error } = await supabase.auth.signInWithPassword({
        email: 'dev@example.com',
        password: 'devpassword123'
      });

      if (error) {
        // If sign in fails, try to create the user first
        console.log('Dev user not found, creating...');
        const { error: signUpError } = await supabase.auth.signUp({
          email: 'dev@example.com',
          password: 'devpassword123',
          options: {
            data: {
              first_name: 'Dev',
              last_name: 'User',
              full_name: 'Dev User'
            }
          }
        });

        if (signUpError) {
          throw signUpError;
        }

        // After signup, try to sign in again
        const { error: retryError } = await supabase.auth.signInWithPassword({
          email: 'dev@example.com',
          password: 'devpassword123'
        });

        if (retryError) {
          throw retryError;
        }
      }

      console.log('Dev sign in successful');
      // The AuthContext will handle the session change automatically
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Dev sign in failed';
      setError(errorMessage);
      console.error('Dev sign in error:', err);
    } finally {
      setIsLoading(false);
    }
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
            <>
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
              
              <div className="signin-divider">or</div>
              
              <button 
                className="google-signin-button"
                onClick={handleGoogleSignIn}
                type="button"
                disabled={isLoading}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  style={{ marginRight: '8px' }}
                >
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {isLoading ? 'Signing In...' : 'Sign in with Google'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;