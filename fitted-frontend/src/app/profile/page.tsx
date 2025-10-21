'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { authApi } from '@/lib/api/auth-api-client';
import ProfileAuthenticated from '@/components/ProfileAuthenticated';
import ProfileGuest from '@/components/ProfileGuest';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfilePage() {
  const { user, isAuthenticated, setUser, clearAuth } = useAuthStore();
  const { triggerAuthFailure } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      verifyAuth();
    }
  }, []);

  const verifyAuth = async () => {
    try {
      const currentUser = await authApi.getCurrentUser();
      
      if (currentUser) {
        setUser(currentUser);
      } else {
        handleAuthFailure();
      }
    } catch (error) {
      handleAuthFailure();
    }
  };

  const handleAuthFailure = () => {
    triggerAuthFailure();
    clearAuth();
  };

  if (isAuthenticated && user) {
    return <ProfileAuthenticated user={user} />;
  }

  return (
    <main className="min-h-screen bg-fitted-gray-50 flex items-center justify-center p-8">
      <div className="w-full max-w-xl">
        <ProfileGuest />
      </div>
    </main>
  );
}