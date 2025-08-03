import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/upload', '/closet', '/outfit'];
const authRoutes = ['/login', '/signup'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  
  const hasAuthCookie = request.cookies.has('accessToken');

  console.log(`Middleware: ${pathname}, hasAuthCookie: ${hasAuthCookie}, isProtected: ${isProtectedRoute}`);
  
  if (isProtectedRoute && !hasAuthCookie) {
    console.log(`Redirecting to login from ${pathname}`);
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(url);
  }
  
  if (isAuthRoute && hasAuthCookie) {
    console.log(`Redirecting authenticated user from ${pathname}`);
    console.log("YES");
    const returnUrl = request.nextUrl.searchParams.get('returnUrl') || '/';
    const url = request.nextUrl.clone();
    url.pathname = returnUrl;
    url.searchParams.delete('returnUrl');
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
};