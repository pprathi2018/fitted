import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
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