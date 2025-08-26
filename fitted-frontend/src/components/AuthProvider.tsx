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
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const setUser = useAuthStore((state) => state.setUser);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialized = useRef(false);
  const previousPathname = useRef(pathname);

  useEffect(() => {
    if (initialUser && !initialized.current) {
      setUser(initialUser);
      initialized.current = true;
    }
  }, [initialUser, setUser]);

  useEffect(() => {
    if (!initialized.current) {
      initializeAuth();
      initialized.current = true;
    }
  }, [initializeAuth]);

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