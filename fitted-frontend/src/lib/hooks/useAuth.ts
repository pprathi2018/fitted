// lib/hooks/useAuth.ts

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';

/**
 * Custom hook for authentication
 * Provides auth state and methods with automatic initialization
 */
export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    error,
    login,
    signup,
    logout,
    checkAuth,
    initializeAuth,
    clearError,
  } = useAuthStore();

  // Initialize auth on mount
  useEffect(() => {
    if (!isInitialized) {
      initializeAuth();
    }
  }, [isInitialized, initializeAuth]);

  return {
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    error,
    login,
    signup,
    logout,
    checkAuth,
    clearError,
  };
}

/**
 * Hook to require authentication
 * Redirects to login if not authenticated
 */
export function useRequireAuth() {
  const { isAuthenticated, isInitialized, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isInitialized || isLoading) return;

    if (!isAuthenticated) {
      // Store return URL
      if (typeof window !== 'undefined') {
        localStorage.setItem('fitted-return-url', pathname);
      }
      router.push('/login');
    }
  }, [isAuthenticated, isInitialized, isLoading, pathname, router]);

  return { isAuthenticated, isLoading: !isInitialized || isLoading };
}

/**
 * Hook to redirect if authenticated
 * Useful for login/signup pages
 */
export function useRedirectIfAuthenticated(redirectTo: string = '/') {
  const { isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isInitialized, router, redirectTo]);
}