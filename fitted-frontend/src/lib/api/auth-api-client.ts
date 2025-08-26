import { apiClient } from './api-client';
import { API_ENDPOINTS, AUTH_STORAGE_KEYS } from '@/lib/auth/constants';
import { 
  AuthResponse, 
  LoginCredentials, 
  SignupCredentials, 
  User 
} from '@/lib/auth/types';

class AuthApiService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.LOGIN,
      credentials,
      { skipAuth: true, skipRetry: true }
    );

    if (response.user) {
      this.storeUser(response.user);
    }

    return response;
  }

  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.SIGNUP,
      credentials,
      { skipAuth: true, skipRetry: true }
    );

    if (response.user) {
      this.storeUser(response.user);
    }

    return response;
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.LOGOUT, {}, { skipRetry: true });
    } finally {
      this.clearUser();
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      console.log('getCurrentUser: Fetching user from API...');
      
      const user = await apiClient.get<User>(API_ENDPOINTS.ME, { skipRetry: false });
      
      if (user && user.id) {
        console.log('getCurrentUser: User fetched successfully:', user.email);
        this.storeUser(user);
        return user;
      }
      
      console.log('getCurrentUser: No user returned from API');
      this.clearUser();
      return null;
    } catch (error) {
      console.error('getCurrentUser: Failed to fetch user:', error);
      this.clearUser();
      return null;
    }
  }

  storeUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
    }
  }

  getStoredUser(): User | null {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const userStr = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  clearUser(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
    }
  }

  getReturnUrl(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem(AUTH_STORAGE_KEYS.RETURN_URL);
  }

  clearReturnUrl(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEYS.RETURN_URL);
    }
  }
}

export const authApi = new AuthApiService();