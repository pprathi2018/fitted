'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { authApi } from '@/lib/api/auth-api-client';
import GlobalLoader from '@/components/GlobalLoader';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ 
  children, 
  fallback = <GlobalLoader />
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isInitialized, isLoading } = useAuthStore();

  useEffect(() => {
    if (isInitialized && !isLoading && !isAuthenticated) {
      authApi.setReturnUrl(pathname);
      const loginUrl = `/login?returnUrl=${encodeURIComponent(pathname)}`;
      router.replace(loginUrl);
    }
  }, [isAuthenticated, isInitialized, isLoading, pathname, router]);

  if (!isInitialized || isLoading) {
    return <>{fallback}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}