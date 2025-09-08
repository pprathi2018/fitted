'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { apiClient } from '@/lib/api/api-client';
import { authApi } from '@/lib/api/auth-api-client';
import AuthFailedModal from '@/components/AuthFailedModal';
import { usePathname, useSearchParams } from 'next/navigation';
import { AUTH_ROUTES, PUBLIC_ROUTES } from '@/lib/auth/constants';

interface AuthContextType {
  showAuthFailedModal: boolean;
  triggerAuthFailure: () => void;
}

const AuthContext = createContext<AuthContextType>({
  showAuthFailedModal: false,
  triggerAuthFailure: () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [showAuthFailedModal, setShowAuthFailedModal] = useState(false);
  const { initializeAuth, clearAuth } = useAuthStore();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    initializeAuth();
  }, []);

  const triggerAuthFailure = useCallback(() => {
    clearAuth();
    
    const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));
    
    if (!isAuthRoute) {
      setShowAuthFailedModal(true);
    }
  }, [clearAuth, pathname]);

  useEffect(() => {
    apiClient.setAuthFailureCallback(triggerAuthFailure);
  }, [triggerAuthFailure]);

  useEffect(() => {
    const returnUrl = searchParams.get('returnUrl');
    
    if (pathname === '/login' && returnUrl) {
      authApi.setReturnUrl(returnUrl);
    }
    else if (pathname === '/login' && !returnUrl) {
      authApi.clearReturnUrl();
    }
    else if (previousPathname.current === '/login' && pathname !== '/login') {
      authApi.clearReturnUrl();
    }
    
    previousPathname.current = pathname;
  }, [pathname, searchParams]);

  return (
    <AuthContext.Provider value={{ showAuthFailedModal, triggerAuthFailure }}>
      {children}
      <AuthFailedModal 
        isOpen={showAuthFailedModal} 
        setShowAuthFailedModal={setShowAuthFailedModal}
        message="Your session has expired. Please log in again to continue."
      />
    </AuthContext.Provider>
  );
}