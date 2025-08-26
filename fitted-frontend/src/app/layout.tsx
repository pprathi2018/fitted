import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import './styles/globals.css';
import Navigation from '@/components/Navigation';
import AuthProvider from '@/components/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Fitted - Virtual Closet',
  description: 'Create and visualize outfits with your virtual closet',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Suspense fallback={null}>
          <AuthProvider>
            <Navigation />
            <main>{children}</main>
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  );
}