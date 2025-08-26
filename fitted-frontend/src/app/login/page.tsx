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
    <main className="auth-page">
      <div className="login-container">
        <div className="login-header">
          <h1 className="fitted-title">Fitted</h1>
          <p className="login-subtitle">Welcome back to your virtual wardrobe</p>
        </div>

        <div className="login-form-card">
          <h2 className="login-form-title">Log In</h2>
          <LoginForm />
          
          <div className="form-footer">
            <p className="footer-text">
              Don't have an account?{' '}
              <Link href="/signup" className="footer-link">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <div className="back-link-container">
          <Link href="/" className="back-link">
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}