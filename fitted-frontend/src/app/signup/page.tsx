'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import SignupForm from '@/components/SignUpForm';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useAuthStore();

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, isInitialized, router]);

  if (!isInitialized) {
    return null;
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-fitted-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="fitted-logo text-6xl">Fitted</h1>
          <p className="mt-2 text-fitted-gray-600">Create your virtual wardrobe</p>
        </div>

        <div className="glass-card rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-semibold text-fitted-gray-800 mb-6">Create Account</h2>
          <SignupForm />
          
          <div className="mt-6 text-center">
            <p className="text-sm text-fitted-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-fitted-blue-accent hover:text-blue-700 transition-colors">
                Log in
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