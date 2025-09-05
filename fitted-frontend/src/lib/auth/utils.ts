import { headers } from 'next/headers';

export async function checkAuthentication(): Promise<boolean> {
  try {
    const headersList = headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    
    const response = await fetch(`${protocol}://${host}/api/auth/validate`, {
      headers: {
        cookie: headersList.get('cookie') || '',
      },
      cache: 'no-store',
    });
    
    const data = await response.json();
    return data.valid === true;
  } catch {
    return false;
  }
}