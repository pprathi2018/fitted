// src/contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { apiClient, AuthResponse, LoginRequest, SignupRequest } from '@/lib/api-client';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

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
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = apiClient.getUser();
        const isAuthenticated = apiClient.isAuthenticated();
        
        if (storedUser && isAuthenticated) {
          setUser(storedUser);
        } else {
          // Clear any partial state
          setUser(null);
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.removeItem('user');
        setUser(null);
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
      setIsLoading(true);
      
      const response = await apiClient.login(data);
      apiClient.setUser(response.user);
      setUser(response.user);
      
      // Get return URL from current URL params
      const searchParams = new URLSearchParams(window.location.search);
      const returnUrl = searchParams.get('returnUrl') || '/';
      
      // Use window.location for a full page refresh to ensure cookies are recognized
      // This also cleans up the URL
      window.location.href = returnUrl;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      setError(message);
      setIsLoading(false);
      throw error;
    }
  }, []);

  const signup = useCallback(async (data: SignupRequest) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const response = await apiClient.signup(data);
      apiClient.setUser(response.user);
      setUser(response.user);
      
      // Use window.location for consistency
      window.location.href = '/';
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Signup failed';
      setError(message);
      setIsLoading(false);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Clear local state immediately
      setUser(null);
      localStorage.removeItem('user');
      
      // Call logout API to clear httpOnly cookies on server
      await apiClient.logout();
      
      // Use window.location for hard navigation to ensure middleware runs
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API fails, ensure we're logged out locally
      window.location.href = '/';
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