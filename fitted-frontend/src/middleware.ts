import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/'];
const AUTH_ROUTES = ['/login', '/signup'];
const PROTECTED_ROUTES = ['/closet', '/outfit', '/upload'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const refreshToken = request.cookies.get('refreshToken');

  const hasValidAuth = !!refreshToken?.value;
  
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  if (isAuthRoute && hasValidAuth) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  if (isProtectedRoute && !hasValidAuth) {
    const loginUrl = new URL('/login', request.url);
    
    loginUrl.searchParams.set('returnUrl', pathname);
    
    return NextResponse.redirect(loginUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
};