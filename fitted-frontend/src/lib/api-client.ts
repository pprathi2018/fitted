import { clientCookies } from './client-cookies';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface RequestConfig extends RequestInit {
  skipAuth?: boolean;
}

class ApiClient {
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];

  private processQueue(error: Error | null) {
    this.failedQueue.forEach(promise => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve(undefined);
      }
    });
    this.failedQueue = [];
  }

  private getTokens() {
    return {
      accessToken: clientCookies.get('accessToken'),
      refreshToken: clientCookies.get('refreshToken'),
    };
  }

  private setTokens(accessToken: string, refreshToken: string) {
    // localStorage.setItem('accessToken', accessToken);
    // localStorage.setItem('refreshToken', refreshToken);
    clientCookies.set('accessToken', accessToken, 7);
    clientCookies.set('refreshToken', refreshToken, 7);
  }

  private clearTokens() {
    clientCookies.remove('accessToken');
    clientCookies.remove('refreshToken');
  }

  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  setUser(user: any) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  removeUser() {
    localStorage.removeItem('user');
  }

  clearAuth() {
    this.clearTokens();
  }

  isAuthenticated() {
    return !!this.getTokens().accessToken;
  }

  private async refreshAccessToken(): Promise<{ accessToken: string; refreshToken: string }> {
    const { refreshToken } = this.getTokens();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      // body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    };
  }

  async request<T = any>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const { skipAuth = false, ...fetchConfig } = config;
    const { accessToken } = this.getTokens();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(config.headers as Record<string, string>),
    };

    // if (accessToken && !skipAuth) {
    //   headers['Authorization'] = `Bearer ${accessToken}`;
    // }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchConfig,
      credentials: 'include',
      headers,
    });

    if (response.status === 401 && !skipAuth) {
      if (this.isRefreshing) {
        return new Promise((resolve, reject) => {
          this.failedQueue.push({ resolve, reject });
        }).then(() => this.request<T>(endpoint, config));
      }

      this.isRefreshing = true;

      try {
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = 
          await this.refreshAccessToken();
        
        // this.setTokens(newAccessToken, newRefreshToken);
        this.processQueue(null);
        
        return this.request<T>(endpoint, config);
      } catch (refreshError) {
        this.processQueue(refreshError as Error);
        this.clearTokens();
        
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        
        throw refreshError;
      } finally {
        this.isRefreshing = false;
      }
    }

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage || `Request failed with status ${response.status}`);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : {} as T;
  }

  get<T = any>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  post<T = any>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put<T = any>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T = any>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  async uploadFile<T = any>(endpoint: string, formData: FormData, config?: RequestConfig): Promise<T> {
    const { accessToken } = this.getTokens();
    
    const headers: Record<string, string> = {
      ...(config?.headers as Record<string, string>),
    };
    
    delete headers['Content-Type'];
    
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      headers,
      body: formData,
    });
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/api/auth/login', data, { skipAuth: true });
    // this.setTokens(response.access_token, response.refresh_token);
    this.setUser(response.user);
    return response;
  }

  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/api/auth/signup', data, { skipAuth: true });
    // this.setTokens(response.access_token, response.refresh_token);
    this.setUser(response.user);
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.post('/api/auth/logout', {});
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      this.clearAuth();
    }
  }
}

export const apiClient = new ApiClient();

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
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