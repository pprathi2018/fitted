export const AUTH_ROUTES = ['/login', '/signup'] as const;

export const PUBLIC_ROUTES = ['/', '/about', '/contact', '/profile'] as const;

export const PROTECTED_ROUTES = [
  '/closet',
  '/outfit', 
  '/upload',
  '/settings'
] as const;

export const AUTH_TOKENS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
} as const;

export const AUTH_STORAGE_KEYS = {
  USER: 'fitted-user',
  RETURN_URL: 'fitted-return-url',
} as const;

export const AUTH_ERROR_MESSAGES = {
  UNAUTHORIZED: 'Your session has expired. Please log in again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  TOKEN_REFRESH_FAILED: 'Failed to refresh authentication. Please log in again.',
} as const;

export const API_ENDPOINTS = {
  LOGIN: '/api/v1/auth/login',
  SIGNUP: '/api/v1/auth/signup',
  LOGOUT: '/api/v1/auth/logout',
  REFRESH: '/api/v1/auth/refresh',
  ME: '/api/v1/auth/me',
} as const;