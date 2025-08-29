import { redirect } from 'next/navigation';
import { hasValidAuth } from '@/lib/auth/server';
import LoginForm from '@/components/LoginForm';
import Link from 'next/link';

export default async function LoginPage() {
  const isAuthenticated = await hasValidAuth();
  
  if (isAuthenticated) {
    redirect('/');
  }

  return (
    <main className="min-h-screen bg-fitted-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="fitted-logo text-6xl">Fitted</h1>
          <p className="mt-2 text-fitted-gray-600">Welcome back to your virtual wardrobe</p>
        </div>

        {/* Form Card */}
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