'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, AlertCircle, Eye, EyeOff, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const SignUp = () => {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    passwordConfirmation: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup, error, clearError, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [formData]);

  const passwordsMatch = formData.password && formData.passwordConfirmation && 
    formData.password === formData.passwordConfirmation;

  const passwordsDontMatch = formData.password && formData.passwordConfirmation && 
    formData.password !== formData.passwordConfirmation;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordsMatch) {
      return;
    }

    try {
      setIsSubmitting(true);
      await signup(formData);
    } catch (error) {
      console.error('Signup failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return (
      <div className="signup-container">
        <div className="signup-form-card">
          <div className="flex justify-center items-center py-8">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="signup-container">
      <div className="signup-header">
        <h1 className="fitted-title">Fitted</h1>
        <p className="signup-subtitle">Create your virtual wardrobe</p>
      </div>

      <div className="signup-form-card">
        <h2 className="signup-form-title">Create Account</h2>
        
        {error && (
          <div className="error-alert">
            <AlertCircle className="error-icon" />
            <p className="error-text">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="name-fields-row">
            <div className="form-field">
              <label htmlFor="firstName" className="form-label">
                First Name
              </label>
              <div className="input-wrapper">
                <User className="input-icon" />
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="form-input with-icon"
                  required
                />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="lastName" className="form-label">
                Last Name
              </label>
              <div className="input-wrapper">
                <User className="input-icon" />
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="form-input with-icon"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <div className="input-wrapper">
              <Mail className="input-icon" />
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
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
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                className="form-input with-icon with-toggle"
                required
                autoComplete="new-password"
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

          <div className="form-field">
            <label htmlFor="passwordConfirmation" className="form-label">
              Confirm Password
            </label>
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input
                id="passwordConfirmation"
                name="passwordConfirmation"
                type={showPasswordConfirmation ? 'text' : 'password'}
                value={formData.passwordConfirmation}
                onChange={handleChange}
                className={`form-input with-icon with-toggle ${passwordsDontMatch ? 'error' : ''}`}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                className="password-toggle"
                aria-label={showPasswordConfirmation ? 'Hide password' : 'Show password'}
              >
                {showPasswordConfirmation ? (
                  <EyeOff className="toggle-icon" />
                ) : (
                  <Eye className="toggle-icon" />
                )}
              </button>
            </div>
            {passwordsMatch && (
              <p className="field-success">
                <Check className="success-icon" /> Passwords match
              </p>
            )}
            {passwordsDontMatch && (
              <p className="field-error">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !passwordsMatch}
            className="submit-button"
          >
            {isSubmitting ? (
              <span className="button-loading">
                <span className="spinner"></span>
                Creating account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

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
  );
};

export default SignUp;