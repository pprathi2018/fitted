import { create } from 'zustand';
import { authApi } from '@/lib/api/auth-api-client';
import { 
  User, 
  LoginCredentials, 
  SignupCredentials,
  AuthState 
} from '@/lib/auth/types';

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<string>;
  signup: (credentials: SignupCredentials) => Promise<string>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  clearAuth: () => void;
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
  error: null,

  initializeAuth: async () => {
    const state = get();
    
    if (state.isInitialized) {
      return;
    }

    set({ isLoading: true, error: null });
    
    try {
      const user = await authApi.getCurrentUser(true);
      
      if (user) {
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
          error: null
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
          error: null
        });
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      
      try {
        await authApi.clearAuthCookies();
      } catch {
      }
      
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: null
      });
      
    }
  },

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await authApi.login(credentials);
      
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
  
      const returnUrl = authApi.getReturnUrl();
      authApi.clearReturnUrl();
      
      return returnUrl || '/';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage
      });
      throw error;
    }
  },

  signup: async (credentials: SignupCredentials) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await authApi.signup(credentials);
      
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
  
      const returnUrl = authApi.getReturnUrl();
      authApi.clearReturnUrl();
      
      return returnUrl || '/';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed';
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
      
      authApi.clearUser();
      
    }
  },

  clearAuth: () => {
    authApi.clearUser();
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  },

  setUser: (user: User | null) => {
    if (user) {
      authApi.storeUser(user);
      set({
        user,
        isAuthenticated: true,
        error: null
      });
    } else {
      authApi.clearUser();
      set({
        user: null,
        isAuthenticated: false
      });
    }
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  }
}));