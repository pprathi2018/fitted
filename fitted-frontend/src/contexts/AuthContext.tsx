// src/contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, LoginRequest, SignupRequest, User } from '@/lib/api-client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProviderWithRouter: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  let authInitialized = false;

  // Inside AuthProvider
  useEffect(() => {
    const initializeAuth = async () => {
      if (authInitialized) {
        const storedUser = apiClient.getUser();
        if (storedUser) {
          setUser(storedUser);
          setIsLoading(false);
          return;
        }
      }

      try {
        setIsLoading(true);
        const currentUser = await apiClient.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          apiClient.setUser(currentUser);
          authInitialized = true;
        } else {
          setUser(null);
          apiClient.removeUser();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
        apiClient.removeUser();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    try {
      setError(null);
      
      const response = await apiClient.login(data);
      
      setUser(response.user);

      setTimeout(() => {
        window.location.href = '/';
      }, 100);
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      setError(message);
      throw error;
    }
  }, []);

  const signup = useCallback(async (data: SignupRequest) => {
    try {
      setError(null);
      
      const response = await apiClient.signup(data);
      
      setUser(response.user);
      
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Signup failed';
      setError(message);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.logout();
      setUser(null);
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      apiClient.removeUser();
      router.refresh();
    }
  }, [router]);

  const value = {
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    login,
    signup,
    logout,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const AuthProvider = AuthProviderWithRouter;