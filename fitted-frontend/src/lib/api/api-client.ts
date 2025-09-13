import { API_ENDPOINTS, AUTH_ERROR_MESSAGES } from '@/lib/auth/constants';
import { ApiRequestConfig } from '@/lib/auth/types';

type AuthFailureCallback = () => void;

class ApiClient {
  private baseURL: string;
  private refreshPromise: Promise<boolean> | null = null;
  private maxRetries = 1;
  private authFailureCallback: AuthFailureCallback | null = null;
  
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  }

  setAuthFailureCallback(callback: AuthFailureCallback) {
    this.authFailureCallback = callback;
  }

  async request<T = any>(
    endpoint: string,
    config: ApiRequestConfig = {}
  ): Promise<T> {
    const { skipAuth = false, skipRetry = false, skipAuthFailureCallback = false, _retryCount = 0, ...fetchConfig } = config;

    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;

    const isFormData = fetchConfig.body instanceof FormData;

    const headers: HeadersInit = {
      ...fetchConfig.headers,
    };

    if (!isFormData) {
      (headers as any)['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(url, {
        ...fetchConfig,
        headers,
        credentials: 'include',
        cache: 'no-store',
      });

      if (response.status === 401 && !skipAuth && !skipRetry && _retryCount < this.maxRetries) {
        if (!this.refreshPromise) {
          this.refreshPromise = this.refreshToken();
        }

        const refreshSuccess = await this.refreshPromise;
        this.refreshPromise = null;

        if (refreshSuccess) {
          return this.request<T>(endpoint, {
            ...config,
            _retryCount: _retryCount + 1,
          });
        } else {
          if (!skipAuthFailureCallback) {
            this.handleAuthFailure();
          }
          throw new Error(AUTH_ERROR_MESSAGES.TOKEN_REFRESH_FAILED);
        }
      }

      if (response.status === 401 && !skipAuth && !skipAuthFailureCallback) {
        this.handleAuthFailure();
        throw new Error(AUTH_ERROR_MESSAGES.UNAUTHORIZED);
      }

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage: string;
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorText;
        } catch {
          errorMessage = errorText || `Request failed with status ${response.status}`;
        }
        
        throw new Error(errorMessage);
      }

      const text = await response.text();
      if (!text) return {} as T;
      
      try {
        return JSON.parse(text) as T;
      } catch {
        return text as unknown as T;
      }
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error(AUTH_ERROR_MESSAGES.NETWORK_ERROR);
      }
      throw error;
    }
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.REFRESH}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      return response.ok;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  private handleAuthFailure(): void {
    if (this.authFailureCallback) {
      this.authFailureCallback();
    }
  }

  async get<T = any>(endpoint: string, config?: ApiRequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any, config?: ApiRequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(endpoint: string, data?: any, config?: ApiRequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string, config?: ApiRequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();