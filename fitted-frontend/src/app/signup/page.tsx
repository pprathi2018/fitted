import { redirect } from 'next/navigation';
import { hasValidAuth } from '@/lib/auth/server';
import SignupForm from '@/components/SignUpForm';
import Link from 'next/link';

export default async function SignupPage() {
  const isAuthenticated = await hasValidAuth();
  
  if (isAuthenticated) {
    redirect('/');
  }

  return (
    <main className="auth-page">
      <div className="signup-container">
        <div className="signup-header">
          <h1 className="fitted-title">Fitted</h1>
          <p className="signup-subtitle">Create your virtual wardrobe</p>
        </div>

        <div className="signup-form-card">
          <h2 className="signup-form-title">Create Account</h2>
          <SignupForm />
          
          <div className="form-footer">
            <p className="footer-text">
              Already have an account?{' '}
              <Link href="/login" className="footer-link">
                Log in
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