// src/contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApiClient } from '@/lib/auth-api-client';
import { LoginRequest, SignupRequest, User } from '@/lib/auth-api-client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
  clearUser: () => void;
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

  useEffect(() => {
    const initializeAuth = async () => {
      if (authInitialized) {
        const storedUser = authApiClient.getUserFromLocal();
        if (storedUser) {
          setUser(storedUser);
          setIsLoading(false);
          return;
        }
      }

      try {
        setIsLoading(true);
        const currentUser = await authApiClient.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          authApiClient.setUserInLocal(currentUser);
          authInitialized = true;
        } else {
          setUser(null);
          authApiClient.removeUserFromLocal();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
        authApiClient.removeUserFromLocal();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearUser = useCallback(() => {
    setUser(null);
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    try {
      setError(null);
      
      const response = await authApiClient.login(data);
      
      setUser(response.user);
      authApiClient.setUserInLocal(response.user);

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
      
      const response = await authApiClient.signup(data);
      
      setUser(response.user);
      authApiClient.setUserInLocal(response.user);
      
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
      await authApiClient.logout();
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      router.refresh();
    } finally {
      setUser(null);
      authApiClient.removeUserFromLocal()
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
    clearUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const AuthProvider = AuthProviderWithRouter;