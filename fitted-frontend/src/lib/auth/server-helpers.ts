import { cookies } from 'next/headers';
import { User } from '@/lib/auth/types';
import { API_ENDPOINTS } from '@/lib/auth/constants';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function getServerAuthStatus(): Promise<{
  isAuthenticated: boolean;
  user: User | null;
}> {
  try {
    const cookieStore = cookies();
    const refreshToken = cookieStore.get('refreshToken');

    if (!refreshToken?.value) {
      return { isAuthenticated: false, user: null };
    }

    const response = await fetch(`${API_URL}${API_ENDPOINTS.ME}`, {
      headers: {
        'Cookie': cookieStore.toString(),
      },
      cache: 'no-store',
    });

    if (response.ok) {
      const user = await response.json();
      return { isAuthenticated: true, user };
    }

    if (response.status === 401) {
      const refreshResponse = await fetch(`${API_URL}${API_ENDPOINTS.REFRESH}`, {
        method: 'POST',
        headers: {
          'Cookie': cookieStore.toString(),
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (refreshResponse.ok) {
        const retryResponse = await fetch(`${API_URL}${API_ENDPOINTS.ME}`, {
          headers: {
            'Cookie': cookieStore.toString(),
          },
          cache: 'no-store',
        });

        if (retryResponse.ok) {
          const user = await retryResponse.json();
          return { isAuthenticated: true, user };
        }
      }
    }

    return { isAuthenticated: false, user: null };
  } catch (error) {
    console.error('Server auth check failed:', error);
    return { isAuthenticated: false, user: null };
  }
}