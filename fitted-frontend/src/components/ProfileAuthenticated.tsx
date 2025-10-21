'use client';

import { useRouter } from 'next/navigation';
import { User } from '@/lib/auth/types';
import { Mail, LogOut, Shirt, Calendar } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Button } from '@/components/ui/button';
import { fittedButton } from '@/lib/styles';
import { cn } from '@/lib/utils';
import image from '@/app/closet-image.png';

interface ProfileAuthenticatedProps {
  user: User;
}

export default function ProfileAuthenticated({ user }: ProfileAuthenticatedProps) {
  const { logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleGoToCloset = () => {
    router.push('/closet');
  };

  const getInitials = () => {
    const firstInitial = user.firstName.charAt(0).toUpperCase();
    const lastInitial = user.lastName.charAt(0).toUpperCase();
    return `${firstInitial}${lastInitial}`;
  };

  const getMemberSinceDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long'
    });
  };

  return (
    <div className="min-h-screen bg-fitted-gradient flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src={image.src}
          alt="Closet background"
          className="w-full h-full object-cover opacity-[0.08] blur-[1.25px]"
        />
        <div className="absolute inset-0 bg-fitted-blue-pale" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="glass-card rounded-[2rem] shadow-lg p-8">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-fitted-blue-accent to-blue-700 flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold text-white">
                {getInitials()}
              </span>
            </div>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-fitted-gray-900 mb-2">
              {user.firstName} {user.lastName}
            </h1>
            <div className="flex items-center justify-center gap-2 text-fitted-gray-600 mb-3">
              <Mail className="size-4" />
              <span className="text-sm">{user.email}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-fitted-gray-500">
              <Calendar className="size-4" />
              <span className="text-sm">Member since {getMemberSinceDate()}</span>
            </div>
          </div>

          <div className="border-t border-fitted-gray-200 my-6" />

          <div className="space-y-3">
            <Button
              onClick={handleGoToCloset}
              className={cn(fittedButton({ variant: "primary", size: "full" }))}
            >
              <Shirt className="size-5 mr-2" />
              My Closet
            </Button>
            <Button 
              onClick={handleLogout} 
              className={cn(fittedButton({ variant: "danger", size: "full" }))}
            >
              <LogOut className="size-5 mr-2" />
              Log Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}