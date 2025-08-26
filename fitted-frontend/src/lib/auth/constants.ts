export const AUTH_ROUTES = ['/login', '/signup'] as const;

export const PUBLIC_ROUTES = ['/', '/about', '/contact'] as const;

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
  LOGIN: '/api/auth/login',
  SIGNUP: '/api/auth/signup',
  LOGOUT: '/api/auth/logout',
  REFRESH: '/api/auth/refresh',
  ME: '/api/auth/me',
} as const;