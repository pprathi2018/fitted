'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { usePathname, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api/auth-api-client';

interface AuthProviderProps {
  children: React.ReactNode;
  initialUser?: any;
}

export default function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const { initializeAuth, setUser, isInitialized } = useAuthStore();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasInitialized = useRef(false);
  const previousPathname = useRef(pathname);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      console.log('AuthProvider: Initializing auth...');
      
      if (initialUser) {
        console.log('AuthProvider: Setting initial user');
        setUser(initialUser);
      } else {
        console.log('AuthProvider: No initial user, calling initializeAuth');
        initializeAuth();
      }
    }
  }, []);

  useEffect(() => {
    const returnUrl = searchParams.get('returnUrl');
    
    if (pathname === '/login' && returnUrl) {
      if (returnUrl !== '/') {
        localStorage.setItem('fitted-return-url', returnUrl);
      }
    }
    
    if (previousPathname.current === '/login' && pathname !== '/login' && pathname !== '/') {
      authApi.clearReturnUrl();
    }
    
    if (pathname === '/login' && !returnUrl) {
      authApi.clearReturnUrl();
    }
    
    previousPathname.current = pathname;
  }, [pathname, searchParams]);

  return <>{children}</>;
}