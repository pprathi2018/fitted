'use client';

import { useState, useEffect } from 'react';
import { Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, isLoading, error, clearError } = useAuthStore();

  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login({ email, password });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <>
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
              disabled={isLoading}
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
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              disabled={isLoading}
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
          disabled={isLoading}
          className="submit-button"
        >
          {isLoading ? (
            <span className="button-loading">
              <span className="spinner"></span>
              Logging in...
            </span>
          ) : (
            'Log In'
          )}
        </button>
      </form>
    </>
  );
}