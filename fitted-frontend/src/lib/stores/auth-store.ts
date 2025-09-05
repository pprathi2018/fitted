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
  checkAuth: () => Promise<boolean>;
  initializeAuth: () => Promise<void>;
  silentLogout: () => Promise<void>;
  clearAuth: (errorMessage: string | null, isInitialized?: boolean) => Promise<void>;
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
      await get().clearAuth(error instanceof Error ? error.message : 'Login failed');
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
      await get().clearAuth(error instanceof Error ? error.message : 'Signup failed', true);
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
      await get().clearAuth(null, true);
      window.location.href = '/';
    }
  },

  checkAuth: async () => {
    if (get().isLoading) return false;
    
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
        return true;
      } else {
        await get().clearAuth(null, true);
        return false;
      }
    } catch (error) {
      await get().clearAuth(null, true);
      return false;
    }
  },

  silentLogout: async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Silent logout failed:', error);
    }
    await get().clearAuth(null, true);
  },

  initializeAuth: async () => {
    const state = get();
    if (state.isInitialized || state.isLoading) {
      console.log('initializeAuth: Already initialized or loading, skipping');
      return;
    }

    console.log('initializeAuth: Starting initialization...');
    set({ isLoading: true });
    
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
      
      try {
        const user = await authApi.getCurrentUser();
        console.log('initializeAuth: Fetched user:', user ? user.email : 'null');
        
        set({
          user: user,
          isAuthenticated: !!user,
          isLoading: false,
          isInitialized: true,
        });
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

  clearAuth: async (errorMessage: string | null, isInitialized?: boolean) => {
    authApi.clearUser();
    set({
      error: errorMessage,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: isInitialized ?? get().isInitialized,
    });
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
        isInitialized: true,
      });
    } else {
      authApi.clearUser();
      set({
        user: null,
        isAuthenticated: false,
        isInitialized: true,
      });
    }
  },
}));