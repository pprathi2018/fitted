import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './styles/globals.css';
import AuthProvider from '@/components/AuthProvider';
import ClientWrapper from '@/components/ClientWrapper';

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
        <AuthProvider>
          <ClientWrapper>
            {children}
          </ClientWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}