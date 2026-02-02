import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  login: () => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session (simulated by checking API key availability)
  useEffect(() => {
    const checkSession = async () => {
      const win = window as any;
      if (win.aistudio && win.aistudio.hasSelectedApiKey) {
        const hasKey = await win.aistudio.hasSelectedApiKey();
        if (hasKey) {
          // Simulate fetching user profile
          setUser({
            name: "Pro User",
            email: "user@example.com",
            plan: 'Pro'
          });
        }
      }
      setIsLoading(false);
    };

    checkSession();
  }, []);

  const login = async () => {
    const win = window as any;
    if (win.aistudio && win.aistudio.openSelectKey) {
      try {
        await win.aistudio.openSelectKey();
        // Assume success if no error, create session
        setUser({
            name: "Pro User",
            email: "user@example.com",
            plan: 'Pro'
        });
      } catch (error) {
        console.error("Login failed:", error);
        throw error;
      }
    } else {
        console.warn("AI Studio Auth not available");
    }
  };

  const logout = () => {
    // We can't strictly "unset" the key in the window.aistudio wrapper easily 
    // without a disconnect method, but we can clear our app's user state.
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoading, 
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
