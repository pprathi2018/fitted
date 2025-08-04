// src/components/Login.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, error, clearError, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/';

  useEffect(() => {
    // If user is authenticated and we're not loading, redirect
    if (!isLoading && isAuthenticated) {
      router.push(returnUrl);
    }
  }, [isAuthenticated, isLoading, router, returnUrl]);

  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      await login({ email, password });
      // Navigation happens in AuthContext via window.location
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading spinner while checking auth state
  if (isLoading) {
    return (
      <div className="login-container">
        <div className="login-form-card">
          <div className="flex justify-center items-center py-8">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  // If already authenticated, show redirect message
  if (isAuthenticated) {
    return (
      <div className="login-container">
        <div className="login-form-card">
          <div className="text-center py-8">
            <p className="text-gray-600">You are already logged in. Redirecting...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-header">
        <h1 className="fitted-title">Fitted</h1>
        <p className="login-subtitle">Welcome back to your virtual wardrobe</p>
      </div>

      <div className="login-form-card">
        <h2 className="login-form-title">Log In</h2>
        
        {error && (
          <div className="error-alert">
            <AlertCircle className="error-icon" />
            <p className="error-text">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-field">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <div className="input-wrapper">
              <Mail className="input-icon" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input with-icon"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input with-icon with-toggle"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="toggle-icon" />
                ) : (
                  <Eye className="toggle-icon" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="submit-button"
          >
            {isSubmitting ? (
              <span className="button-loading">
                <span className="spinner"></span>
                Logging in...
              </span>
            ) : (
              'Log In'
            )}
          </button>
        </form>

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
  );
};

export default Login;