import { apiClient } from './api-client';

class AuthApiClient {

  getUserFromLocal() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  setUserInLocal(user: any) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  removeUserFromLocal() {
    localStorage.removeItem('user');
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', data, { skipAuth: true });
    return response;
  }

  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/signup', data, { skipAuth: true });
    return response;
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/api/auth/logout', {});
    } catch (error) {
      console.error('Logout API call failed:', error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const user = await apiClient.get<User>('/api/auth/me');
      console.log(`Retrieved user from backend: ${user}`)
      return user;
    } catch (error) {
      console.log('getCurrentUser failed, likely not authenticated');
      return null;
    }
  }
}

export const authApiClient = new AuthApiClient();

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  passwordConfirmation: string;
}