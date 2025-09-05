'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import GlobalLoader from '@/components/GlobalLoader';
import Navigation from '@/components/Navigation';

interface ClientWrapperProps {
  children: React.ReactNode;
}

export default function ClientWrapper({ children }: ClientWrapperProps) {
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [isMounted, setIsMounted] = useState(false);
  const [minimumTimeElapsed, setMinimumTimeElapsed] = useState(false);
  const timerStarted = useRef(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !timerStarted.current) {
      timerStarted.current = true;
      console.log('Starting 2 second timer...');
      
      const timer = setTimeout(() => {
        console.log('Minimum time elapsed');
        setMinimumTimeElapsed(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isMounted]);

  useEffect(() => {
    console.log('ClientWrapper state:', { isInitialized, isLoading, isMounted, minimumTimeElapsed });
  }, [isInitialized, isLoading, isMounted, minimumTimeElapsed]);

  if (!isMounted) {
    return <GlobalLoader />;
  }

  if (!isInitialized || !minimumTimeElapsed) {
    return <GlobalLoader />;
  }

  return (
    <>
      <Navigation />
      <main>{children}</main>
    </>
  );
}