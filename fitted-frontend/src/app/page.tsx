// src/app/page.tsx
'use client';

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Upload, Palette, Shirt } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import image from './closet-image.png';

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  const handleProtectedRoute = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!isAuthenticated) {
      e.preventDefault();
      // Store the intended destination
      sessionStorage.setItem('returnUrl', href);
      router.push('/login');
    }
  };

  return (
    <main className="min-h-screen bg-fitted-blue flex items-center justify-center">
      <div className="home-container">
        {/* Background Image Layer */}
        <div className="background-image-container">
          <img 
            src={image.src}
            alt="Modern closet"
            className="background-image"
          />
          <div className="background-overlay"></div>
        </div>
        
        {/* Content Layer */}
        <div className="content-wrapper">
          <h1 className="fitted-title">Fitted</h1>
          {/* { isAuthenticated && (<p className="fitted-tagline">Welcome, {user?.firstName}!</p>) } */}
          <p className="fitted-tagline">Your Virtual Wardrobe, Styled to Perfection</p>
          
          <div className="button-container">
            <Link 
              href="/upload" 
              className="fitted-btn"
              onClick={(e) => handleProtectedRoute(e, '/upload')}
            >
              <Upload size={24} strokeWidth={1.5} />
              <span>Upload Clothes</span>
            </Link>
            
            <Link 
              href="/closet" 
              className="fitted-btn"
              onClick={(e) => handleProtectedRoute(e, '/closet')}
            >
              <Shirt size={24} strokeWidth={1.5} />
              <span>View Closet</span>
            </Link>
            
            <Link 
              href="/outfit" 
              className="fitted-btn"
              onClick={(e) => handleProtectedRoute(e, '/outfit')}
            >
              <Palette size={24} strokeWidth={1.5} />
              <span>Build Outfit</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}