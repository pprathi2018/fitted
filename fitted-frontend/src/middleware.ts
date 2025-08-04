import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/upload', '/closet', '/outfit'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (!isProtectedRoute) {
    return NextResponse.next();
  }
  
  // For protected routes, check auth cookies
  const accessToken = request.cookies.get('accessToken');
  const refreshToken = request.cookies.get('refreshToken');
  
  // Check if we have valid auth cookies
  const hasValidAuth = (accessToken && accessToken.value) || (refreshToken && refreshToken.value);
  
  if (!hasValidAuth) {
    // Create redirect URL
    console.log("Not valid auth");
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('returnUrl', pathname);
    
    return NextResponse.redirect(url);
  }
  
  // Add headers to prevent caching of protected pages
  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'no-store, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
};