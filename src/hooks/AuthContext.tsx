/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email?: string;
  name?: string;
}

interface AppleSignInData {
  authorization?: {
    id_token?: string;
  };
  user?: string | {
    email?: string;
    name?: {
      firstName?: string;
      lastName?: string;
    };
  };
}

interface AuthContextType {
  user: User | null;
  signIn: (userData: AppleSignInData) => void;
  signOut: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth data on mount
    const storedUser = localStorage.getItem('drawscale_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('drawscale_user');
      }
    }
    setIsLoading(false);
  }, []);

  const signIn = (userData: AppleSignInData) => {
    const user: User = {
      id: userData.authorization?.id_token || (typeof userData.user === 'string' ? userData.user : 'apple_user'),
      email: typeof userData.user === 'object' ? userData.user?.email : undefined,
      name: typeof userData.user === 'object' && userData.user?.name ? 
        `${userData.user.name.firstName || ''} ${userData.user.name.lastName || ''}`.trim() : undefined
    };
    
    setUser(user);
    localStorage.setItem('drawscale_user', JSON.stringify(user));
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('drawscale_user');
  };

  const value = {
    user,
    signIn,
    signOut,
    isAuthenticated: !!user,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

