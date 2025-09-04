'use client';

import { useAuthCheck } from '@/hooks/useAuthCheck';
import { useAuthStore } from '@/lib/stores/auth-store';
import ProfileAuthenticated from '@/components/ProfileAuthenticated';
import ProfileGuest from '@/components/ProfileGuest';
import AuthFailedModal from '@/components/AuthFailedModal';

interface ProfileWrapperProps {
  hasRefreshToken: boolean;
}

export default function ProfileWrapper({ hasRefreshToken }: ProfileWrapperProps) {
  const { user, isAuthenticated } = useAuthStore();
  const { showAuthModal } = useAuthCheck({});

  if (hasRefreshToken) {
    const displayUser = user || getCachedUser();
    
    if (displayUser) {
      return (
        <>
          <ProfileAuthenticated user={displayUser} />
          <AuthFailedModal isOpen={showAuthModal} />
        </>
      );
    }
  }

  if (isAuthenticated && user) {
    return (
      <>
        <ProfileAuthenticated user={user} />
        <AuthFailedModal isOpen={showAuthModal} />
      </>
    );
  }

  return <ProfileGuest />;
}

function getCachedUser() {
  if (typeof window !== 'undefined') {
    try {
      const cachedUser = localStorage.getItem('fitted-user');
      if (cachedUser) {
        return JSON.parse(cachedUser);
      }
    } catch (error) {
      console.error('Failed to parse cached user:', error);
    }
  }
  
  return null;
}