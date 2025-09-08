import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './styles/globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import ClientLayout from '@/components/ClientLayout';

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
          <ClientLayout>
            {children}
          </ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}