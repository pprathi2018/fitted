import { cookies } from 'next/headers';
import { User } from '@/lib/auth/types';
import { API_ENDPOINTS } from '@/lib/auth/constants';
import { authApi } from '../api/auth-api-client';

export async function getServerAuth(): Promise<{
  user: User | null;
  isAuthenticated: boolean;
}> {
  try {
    const cookieStore = cookies();
    const refreshToken = cookieStore.get('refreshToken');

    if (!refreshToken?.value) {
      return { user: null, isAuthenticated: false };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const response = await fetch(`${apiUrl}${API_ENDPOINTS.ME}`, {
      headers: {
        'Cookie': cookieStore.toString(),
      },
      cache: 'no-store',
    });

    if (response.ok) {
      const user = await response.json();
      authApi.storeUser(user);
      return { user, isAuthenticated: true };
    }

    authApi.clearUser();
    return { user: null, isAuthenticated: false };
  } catch (error) {
    console.error('Server auth check failed:', error);
    authApi.clearUser();
    return { user: null, isAuthenticated: false };
  }
}

export async function hasValidAuth(): Promise<boolean> {
  const cookieStore = cookies();
  const refreshToken = cookieStore.get('refreshToken');
  
  return !!(refreshToken?.value);
}