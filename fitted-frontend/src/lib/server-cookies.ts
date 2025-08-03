import { cookies } from 'next/headers';

export const getAccessToken = (): string | undefined => {
  const cookieStore = cookies();
  return cookieStore.get('accessToken')?.value;
};

export const getRefreshToken = (): string | undefined => {
  const cookieStore = cookies();
  return cookieStore.get('refreshToken')?.value;
};