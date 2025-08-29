import { getServerAuth } from '@/lib/auth/server';
import ProfileAuthenticated from '@/components/ProfileAuthenticated';
import ProfileGuest from '@/components/ProfileGuest';

export default async function ProfilePage() {
  const { user, isAuthenticated } = await getServerAuth();

  return (
    <main className="min-h-screen bg-fitted-gray-50 flex items-center justify-center p-8">
      <div className="w-full max-w-xl">
        {isAuthenticated && user ? (
          <ProfileAuthenticated user={user} />
        ) : (
          <ProfileGuest />
        )}
      </div>
    </main>
  );
}