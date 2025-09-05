import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  
  if (!cookieStore.has('refreshToken')) {
    return NextResponse.json({ valid: false });
  }
  
  try {
    const meResponse = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        'Cookie': cookieStore.toString(),
      },
      cache: 'no-store',
    });
    
    if (meResponse.ok) {
      return NextResponse.json({ valid: true });
    }
    
    if (meResponse.status === 401) {
      const refreshResponse = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Cookie': cookieStore.toString(),
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });
      
      if (refreshResponse.ok) {
        const response = NextResponse.json({ valid: true });
        
        const setCookieHeaders = refreshResponse.headers.getSetCookie();
        setCookieHeaders.forEach(cookie => {
          response.headers.append('Set-Cookie', cookie);
        });
        
        return response;
      }
    }
    
    const response = NextResponse.json({ valid: false });
    response.cookies.set('accessToken', '', { 
      maxAge: 0,
      path: '/',
      httpOnly: true 
    });
    response.cookies.set('refreshToken', '', { 
      maxAge: 0,
      path: '/',
      httpOnly: true 
    });
    return response;
    
  } catch (error) {
    console.error('Auth validation error:', error);
    const response = NextResponse.json({ valid: false });
    response.cookies.set('accessToken', '', { 
      maxAge: 0,
      path: '/',
      httpOnly: true 
    });
    response.cookies.set('refreshToken', '', { 
      maxAge: 0,
      path: '/',
      httpOnly: true 
    });
    return response;
  }
}