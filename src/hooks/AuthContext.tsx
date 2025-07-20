/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, ReactNode } from 'react';
import { UserService } from '../lib/database';
import { User as DatabaseUser, CreateUserData } from '../types/user';

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
  databaseUser: DatabaseUser | null;
  signIn: (userData: AppleSignInData) => Promise<void>;
  signOut: () => void;
  isAuthenticated: boolean;
  isAuthorized: boolean;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to check if email is in whitelist
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const isEmailAuthorized = (_email?: string): boolean => {
  // TEMPORARY: Bypass whitelist for testing
  console.log('WHITELIST TEMPORARILY DISABLED - Remove this before production!');
  return true;
  
  /* Commented out for temporary bypass
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
  */
};

// Helper function to create or retrieve user from database
const createOrRetrieveUser = async (userData: AppleSignInData): Promise<DatabaseUser> => {
  const email = typeof userData.user === 'object' ? userData.user?.email : undefined;
  const firstName = typeof userData.user === 'object' && userData.user?.name ? userData.user.name.firstName : undefined;
  const lastName = typeof userData.user === 'object' && userData.user?.name ? userData.user.name.lastName : undefined;
  const appleIdToken = userData.authorization?.id_token;
  
  // Determine provider based on the data
  const provider = appleIdToken ? 'apple' : 'dev';
  
  try {
    // For dev user, always return the existing dev user from database
    if (provider === 'dev' && email === 'dev@example.com') {
      const devUser = await UserService.getUserByEmail('dev@example.com');
      if (devUser) {
        console.log('Found existing dev user:', devUser);
        return devUser;
      } else {
        throw new Error('Dev user not found in database. Please run database migration.');
      }
    }
    
    // For Apple users, try to find existing user by email
    if (email) {
      const existingUser = await UserService.getUserByEmail(email);
      if (existingUser) {
        console.log('Found existing user by email:', existingUser);
        
        // Update user with latest Apple ID token if available
        if (appleIdToken && existingUser.apple_id_token !== appleIdToken) {
          const updatedUser = await UserService.updateUser(existingUser.id, {
            apple_id_token: appleIdToken,
            first_name: firstName || existingUser.first_name,
            last_name: lastName || existingUser.last_name,
            provider: provider
          });
          return updatedUser;
        }
        
        return existingUser;
      }
    }
    
    // If no user found by email, try by Apple ID token
    if (appleIdToken) {
      const existingUser = await UserService.getUserByAppleIdToken(appleIdToken);
      if (existingUser) {
        console.log('Found existing user by Apple ID token:', existingUser);
        return existingUser;
      }
    }
    
    // Create new user if none exists (only for Apple users)
    const newUserData: CreateUserData = {
      email,
      provider,
      apple_id_token: appleIdToken,
      first_name: firstName,
      last_name: lastName
    };
    
    console.log('Creating new user:', newUserData);
    const newUser = await UserService.createUser(newUserData);
    console.log('Created new user:', newUser);
    return newUser;
    
  } catch (error) {
    console.error('Error creating/retrieving user:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to create or retrieve user from database: ${error.message}`);
    } else {
      throw new Error('Failed to create or retrieve user from database');
    }
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [databaseUser, setDatabaseUser] = useState<DatabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth data on mount
    const storedUser = localStorage.getItem('drawscale_user');
    const storedDatabaseUser = localStorage.getItem('drawscale_database_user');
    
    if (storedUser && storedDatabaseUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const parsedDatabaseUser = JSON.parse(storedDatabaseUser);
        setUser(parsedUser);
        setDatabaseUser(parsedDatabaseUser);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('drawscale_user');
        localStorage.removeItem('drawscale_database_user');
      }
    }
    setIsLoading(false);
  }, []);

  const signIn = async (userData: AppleSignInData) => {
    try {
      // Create or retrieve user from database
      const dbUser = await createOrRetrieveUser(userData);
      
      // Create the auth user object
      const authUser: User = {
        id: dbUser.id, // Use the database ID as the auth ID
        email: dbUser.email ?? undefined,
        name: (dbUser.first_name && dbUser.last_name ? 
          `${dbUser.first_name} ${dbUser.last_name}`.trim() : 
          (dbUser.first_name ?? dbUser.last_name ?? undefined))
      };
      
      // Only set user if they're authorized
      if (isEmailAuthorized(authUser.email)) {
        setUser(authUser);
        setDatabaseUser(dbUser);
        localStorage.setItem('drawscale_user', JSON.stringify(authUser));
        localStorage.setItem('drawscale_database_user', JSON.stringify(dbUser));
        console.log('User signed in successfully:', { authUser, dbUser });
      } else {
        // Clear any existing auth data for unauthorized users
        setUser(null);
        setDatabaseUser(null);
        localStorage.removeItem('drawscale_user');
        localStorage.removeItem('drawscale_database_user');
        throw new Error('Access denied: Your email is not authorized to use this service.');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = () => {
    setUser(null);
    setDatabaseUser(null);
    localStorage.removeItem('drawscale_user');
    localStorage.removeItem('drawscale_database_user');
  };

  const value = {
    user,
    databaseUser,
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

