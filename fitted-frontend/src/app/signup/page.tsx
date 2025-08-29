import { redirect } from 'next/navigation';
import { hasValidAuth } from '@/lib/auth/server';
import SignupForm from '@/components/SignUpForm';
import Link from 'next/link';
import { authPageLayout, pageContainer, glassCard } from '@/lib/styles';

export default async function SignupPage() {
  const isAuthenticated = await hasValidAuth();
  
  if (isAuthenticated) {
    redirect('/');
  }

  return (
    <main className={authPageLayout}>
      <div className={pageContainer}>
        <div className="text-center">
          <h1 className="fitted-logo text-6xl">Fitted</h1>
          <p className="mt-2 text-fitted-gray-600">Create your virtual wardrobe</p>
        </div>

        <div className={glassCard}>
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