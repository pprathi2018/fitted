import { create } from 'zustand';
import { authApi } from '@/lib/api/auth-api-client';
import { 
  User, 
  LoginCredentials, 
  SignupCredentials,
  AuthState 
} from '@/lib/auth/types';

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,

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
      if (returnUrl) {
        authApi.clearReturnUrl();
        window.location.href = returnUrl;
      } else {
        window.location.href = '/';
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Login failed',
        isLoading: false,
        isAuthenticated: false,
        user: null,
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
      if (returnUrl) {
        authApi.clearReturnUrl();
        window.location.href = returnUrl;
      } else {
        window.location.href = '/';
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Signup failed',
        isLoading: false,
        isAuthenticated: false,
        user: null,
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      authApi.clearUser();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
      
      window.location.href = '/';
    }
  },

  checkAuth: async () => {
    if (get().isLoading || get().isInitialized) return;
    
    set({ isLoading: true });
    
    try {
      const user = await authApi.getCurrentUser();
      
      if (user) {
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
        });
      }
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
    }
  },

  initializeAuth: async () => {
    if (get().isInitialized || get().isLoading) return;

    console.log('initializeAuth: Starting initialization...');
    
    const storedUser = authApi.getStoredUser();
    console.log('initializeAuth: Has stored user:', !!storedUser);
    
    if (storedUser) {
      console.log('initializeAuth: Using stored user:', storedUser.email);
      set({
        user: storedUser,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
      });
      
      authApi.getCurrentUser().then(serverUser => {
        if (!serverUser) {
          console.log('initializeAuth: User no longer authenticated, clearing state');
          set({
            user: null,
            isAuthenticated: false,
          });
          authApi.clearUser();
        } else if (serverUser.id !== storedUser.id) {
          console.log('initializeAuth: Server user different, updating');
          set({
            user: serverUser,
            isAuthenticated: true,
          });
        }
      }).catch(() => {
        console.debug('initializeAuth: Background verification failed - keeping current state');
      });
    } else {
      console.log('initializeAuth: No stored user, attempting to fetch from server...');
      set({ isLoading: true });
      
      try {
        const user = await authApi.getCurrentUser();
        console.log('initializeAuth: Fetched user:', user ? user.email : 'null');
        
        if (user) {
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true,
          });
        } else {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            isInitialized: true,
          });
        }
      } catch (error) {
        console.error('initializeAuth: Failed to fetch user:', error);
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
        });
      }
    }
  },

  clearError: () => {
    set({ error: null });
  },

  setUser: (user: User | null) => {
    if (user) {
      authApi.storeUser(user);
      set({
        user,
        isAuthenticated: true,
        error: null,
      });
    } else {
      authApi.clearUser();
      set({
        user: null,
        isAuthenticated: false,
      });
    }
  },
}));