'use client';

import { useAuthStore } from '@/lib/stores/auth-store';
import GlobalLoader from '@/components/GlobalLoader';
import Navigation from '@/components/Navigation';
import { Toaster } from 'react-hot-toast';

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
      <Toaster 
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#363636',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
}