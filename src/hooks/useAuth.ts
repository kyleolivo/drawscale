import { useContext } from 'react';
import { AuthContext } from './AuthContext';
import { User as DatabaseUser } from '../types/user';

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export the database user type for convenience
export type { DatabaseUser };

export { AuthProvider } from './AuthContext';