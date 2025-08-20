const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface RequestConfig extends RequestInit {
  skipAuth?: boolean;
  skipReRoute?: boolean;
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

  removeUserFromLocal() {
    localStorage.removeItem('user');
  }

  async request<T = any>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const { skipAuth = false, skipReRoute = false, ...fetchConfig } = config;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(config.headers as Record<string, string>),
    };

    let response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchConfig,
      credentials: 'include', // send cookies
      headers,
    });

    // refresh token on 401 errors
    if (response.status === 401 && !skipAuth) {
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
          
          // retry original request
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
        this.removeUserFromLocal();
        
        // redirect to login
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
}

export const apiClient = new ApiClient();