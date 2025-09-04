import { cookies } from 'next/headers';
import ProfileWrapper from '@/components/ProfileWrapper';

export default async function ProfilePage() {
  const cookieStore = cookies();
  const hasRefreshToken = cookieStore.has('refreshToken');
  
  return (
    <main className="min-h-screen bg-fitted-gray-50 flex items-center justify-center p-8">
      <div className="w-full max-w-xl">
        <ProfileWrapper hasRefreshToken={hasRefreshToken} />
      </div>
    </main>
  );
}