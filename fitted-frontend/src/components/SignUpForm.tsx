'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, AlertCircle, Eye, EyeOff, Check } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/form-input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { fittedButton } from '@/lib/styles';
import { cn } from '@/lib/utils';

export default function SignupForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    passwordConfirmation: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  
  const { signup, isLoading, error, clearError } = useAuthStore();

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
      const redirectUrl = await signup(formData);
      router.push(redirectUrl);
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            id="firstName"
            name="firstName"
            type="text"
            label="First Name"
            icon={User}
            value={formData.firstName}
            onChange={handleChange}
            required
            disabled={isLoading}
            placeholder="John"
          />

          <FormInput
            id="lastName"
            name="lastName"
            type="text"
            label="Last Name"
            icon={User}
            value={formData.lastName}
            onChange={handleChange}
            required
            disabled={isLoading}
            placeholder="Doe"
          />
        </div>

        <FormInput
          id="email"
          name="email"
          type="email"
          label="Email"
          icon={Mail}
          value={formData.email}
          onChange={handleChange}
          required
          autoComplete="email"
          disabled={isLoading}
          placeholder="john.doe@example.com"
        />

        <FormInput
          id="password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          label="Password"
          icon={Lock}
          value={formData.password}
          onChange={handleChange}
          required
          autoComplete="new-password"
          disabled={isLoading}
          placeholder="Min. 8 characters"
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-fitted-gray-400 hover:text-fitted-gray-600 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          }
        />

        <div className="space-y-2">
          <FormInput
            id="passwordConfirmation"
            name="passwordConfirmation"
            type={showPasswordConfirmation ? 'text' : 'password'}
            label="Confirm Password"
            icon={Lock}
            value={formData.passwordConfirmation}
            onChange={handleChange}
            required
            autoComplete="new-password"
            disabled={isLoading}
            placeholder="Re-enter password"
            error={passwordsDontMatch ? "Passwords do not match" : undefined}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                className="text-fitted-gray-400 hover:text-fitted-gray-600 transition-colors"
                aria-label={showPasswordConfirmation ? 'Hide password' : 'Show password'}
              >
                {showPasswordConfirmation ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            }
          />
          {passwordsMatch && (
            <p className="flex items-center gap-1 text-xs text-green-600">
              <Check className="h-3 w-3" /> Passwords match
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading || !passwordsMatch}
          className={cn(fittedButton({ variant: "primary", size: "full" }), "disabled:opacity-50")}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-3">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Creating account...
            </span>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>
    </>
  );
}