'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { authApi } from '@/lib/api/auth-api-client';
import LoginForm from '@/components/LoginForm';
import Link from 'next/link';
import GlobalLoader from '@/components/GlobalLoader';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isInitialized } = useAuthStore();
  const returnUrl = searchParams.get('returnUrl');

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.replace(returnUrl || '/');
    }
  }, [isAuthenticated, isInitialized, returnUrl, router]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href) {
        const url = new URL(link.href);
        const protectedRoutes = ['/closet', '/outfit', '/upload'];
        
        if (protectedRoutes.some(route => url.pathname.startsWith(route))) {
          e.preventDefault();
          authApi.setReturnUrl(url.pathname);
          router.replace(`/login?returnUrl=${encodeURIComponent(url.pathname)}`);
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [router]);

  if (!isInitialized) {
    return <GlobalLoader />;
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-fitted-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="fitted-logo text-6xl">Fitted</h1>
          <p className="mt-2 text-fitted-gray-600">Welcome back to your virtual wardrobe</p>
        </div>

        <div className="glass-card rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-semibold text-fitted-gray-800 mb-6">Log In</h2>
          <LoginForm />
          
          <div className="mt-6 text-center">
            <p className="text-sm text-fitted-gray-600">
              Don't have an account?{' '}
              <Link href="/signup" className="font-medium text-fitted-blue-accent hover:text-blue-700 transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="text-sm text-white/80 hover:text-white transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}