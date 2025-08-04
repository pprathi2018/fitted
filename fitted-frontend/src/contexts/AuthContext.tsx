// src/contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient, AuthResponse, LoginRequest, SignupRequest, User } from '@/lib/api-client';

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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // First, try to get user from localStorage for immediate UI update
        const storedUser = apiClient.getUser();
        if (storedUser) {
          setUser(storedUser);
        }

        // Then verify with backend (this will use httpOnly cookies)
        const currentUser = await apiClient.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        } else {
          // No valid session, clear everything
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
      
      // Set user in state
      setUser(response.user);
      
      // Get return URL from current URL params
      const searchParams = new URLSearchParams(window.location.search);
      const returnUrl = searchParams.get('returnUrl') || '/';
      
      // Navigate after a small delay to ensure state is saved
      setTimeout(() => {
        window.location.href = returnUrl;
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
      
      // Set user in state
      setUser(response.user);
      
      // Navigate after a small delay to ensure state is saved
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
      
      // Call logout API to clear httpOnly cookies
      await apiClient.logout();

      setUser(null);
      
      // // Redirect to home
      // window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // // Even if API fails, ensure we're logged out locally
      window.location.href = '/profile';
    }
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};