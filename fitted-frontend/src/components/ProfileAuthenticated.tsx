'use client';

import { useRouter } from 'next/navigation';
import { User } from '@/lib/auth/types';
import { Mail, LogOut } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { fittedButton } from '@/lib/styles';
import { cn } from '@/lib/utils';

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

  return (
    <Card className="shadow-xl overflow-hidden">
      <CardHeader className="bg-fitted-blue-gradient text-white text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">
          {user.firstName} {user.lastName}
        </h2>
        <p className="flex items-center justify-center gap-2 text-white/90">
          <Mail className="size-4" />
          {user.email}
        </p>
      </CardHeader>

      <CardContent className="p-8 space-y-6">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-fitted-gray-500 mb-4">
            Account Information
          </h3>
          <div className="space-y-3">
            <InfoRow label="User ID" value={user.id} />
            <InfoRow 
              label="Member Since" 
              value={new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} 
            />
          </div>
        </div>

        <Button 
          onClick={handleLogout} 
          className={cn(fittedButton({ variant: "danger", size: "full" }))}
        >
          <LogOut className="size-5 mr-2" />
          Log Out
        </Button>
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-fitted-gray-100 last:border-0">
      <span className="text-sm text-fitted-gray-600">{label}</span>
      <span className="text-sm font-medium text-fitted-gray-900 font-mono">{value}</span>
    </div>
  );
}