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
  isAuthorized: boolean;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to check if email is in whitelist
const isEmailAuthorized = (email?: string): boolean => {
  // In development mode, allow any email
  // Only consider it development if explicitly set to development mode
  const isDev = import.meta.env.MODE === 'development';
  
  if (isDev) {
    console.log('Development mode detected, allowing any email');
    return true;
  }
  
  if (!email) {
    console.log('No email provided for authorization check');
    return false;
  }
  
  const allowedEmails = import.meta.env.VITE_ALLOWED_EMAILS?.split(',') || [];
  const isAuthorized = allowedEmails.map((e: string) => e.trim().toLowerCase()).includes(email.toLowerCase());
  
  console.log('Production mode authorization check:', {
    email,
    allowedEmails,
    isAuthorized,
    envMode: import.meta.env.MODE,
    envProd: import.meta.env.PROD,
    envDev: import.meta.env.DEV
  });
  
  return isAuthorized;
};

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
    
    // Only set user if they're authorized
    if (isEmailAuthorized(user.email)) {
      setUser(user);
      localStorage.setItem('drawscale_user', JSON.stringify(user));
    } else {
      // Clear any existing auth data for unauthorized users
      setUser(null);
      localStorage.removeItem('drawscale_user');
      throw new Error('Access denied: Your email is not authorized to use this service.');
    }
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
    isAuthorized: !!user && isEmailAuthorized(user.email),
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

