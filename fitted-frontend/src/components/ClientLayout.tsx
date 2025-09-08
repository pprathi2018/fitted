'use client';

import { useAuthStore } from '@/lib/stores/auth-store';
import GlobalLoader from '@/components/GlobalLoader';
import Navigation from '@/components/Navigation';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const { isInitialized, isLoading } = useAuthStore();

  if (!isInitialized && isLoading) {
    return <GlobalLoader />;
  }

  return (
    <>
      <Navigation />
      <main>{children}</main>
    </>
  );
}