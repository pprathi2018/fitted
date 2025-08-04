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

  async request<T = any>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const { skipAuth = false, ...fetchConfig } = config;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(config.headers as Record<string, string>),
    };

    let response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchConfig,
      credentials: 'include', // send cookies
      headers,
    });

    // Handle 401 errors for token refresh
    if (response.status === 401 && !skipAuth && !endpoint.includes('/api/auth/')) {
      if (this.isRefreshing) {
        return new Promise((resolve, reject) => {
          this.failedQueue.push({ resolve, reject });
        }).then(() => this.request<T>(endpoint, config));
      }

      this.isRefreshing = true;

      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (refreshResponse.ok) {
          this.processQueue(null);
          
          // Retry the original request
          response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...fetchConfig,
            credentials: 'include',
            headers,
          });
          
          if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
          }
        } else {
          throw new Error('Token refresh failed');
        }
      } catch (refreshError) {
        this.processQueue(refreshError as Error);
        this.removeUser();
        
        // Only redirect to login if not on auth endpoints
        if (typeof window !== 'undefined' && !endpoint.includes('/api/auth/')) {
          window.location.href = '/login';
        }
        
        throw refreshError;
      } finally {
        this.isRefreshing = false;
      }
    } else if (!response.ok) {
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

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/api/auth/login', data, { skipAuth: true });
    this.setUser(response.user);
    return response;
  }

  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/api/auth/signup', data, { skipAuth: true });
    this.setUser(response.user);
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.post('/api/auth/logout', {});
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      this.removeUser();
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const user = await this.get<User>('/api/auth/me');
      console.log(`Retrieved user from backend: ${user}`)
      return user;
    } catch (error) {
      console.log('getCurrentUser failed, likely not authenticated');
      return null;
    }
  }
}

export const apiClient = new ApiClient();

// Types
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