import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/upload', '/closet', '/outfit'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (!isProtectedRoute) {
    return NextResponse.next();
  }
  
  const accessToken = request.cookies.get('accessToken');
  const refreshToken = request.cookies.get('refreshToken');
  
  const hasAccessToken = accessToken && accessToken.value && accessToken.value.length > 0;
  const hasRefreshToken = refreshToken && refreshToken.value && refreshToken.value.length > 0;
  
  if (!hasAccessToken || !hasRefreshToken) {
    console.log("No valid auth tokens found");
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('reDirect', 'true')
    
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next();
  
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
};