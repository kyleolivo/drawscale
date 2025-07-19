import React from 'react';
import { useAuth } from '../hooks/useAuth';

export function AuthTest() {
  const { user, databaseUser, isAuthenticated, signOut } = useAuth();

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Auth Integration Test</h2>
      
      {isAuthenticated ? (
        <div>
          <h3>✅ User is authenticated!</h3>
          
          <div style={{ marginBottom: '20px' }}>
            <h4>Auth User:</h4>
            <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <h4>Database User:</h4>
            <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
              {JSON.stringify(databaseUser, null, 2)}
            </pre>
          </div>
          
          <button 
            onClick={signOut}
            style={{
              background: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div>
          <h3>❌ User is not authenticated</h3>
          <p>Please sign in to see the user data.</p>
        </div>
      )}
    </div>
  );
} 