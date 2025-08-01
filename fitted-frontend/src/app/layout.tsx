import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './styles/globals.css'
import Navigation from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Fitted - Virtual Closet',
  description: 'Create and visualize outfits with your virtual closet',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        {children}
      </body>
    </html>
  )
}