import { getServerAuth } from '@/lib/auth/server';
import ProfileAuthenticated from '@/components/ProfileAuthenticated';
import ProfileGuest from '@/components/ProfileGuest';

export default async function ProfilePage() {
  const { user, isAuthenticated } = await getServerAuth();

  return (
    <main className="profile-page">
      <div className="profile-content">
        {isAuthenticated && user ? (
          <ProfileAuthenticated user={user} />
        ) : (
          <ProfileGuest />
        )}
      </div>
    </main>
  );
}