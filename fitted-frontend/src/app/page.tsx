'use client';

import Link from 'next/link';
import { Upload, Palette, Shirt } from 'lucide-react';
import image from './closet-image.png';

export default function Home() {

  return (
    <main className="min-h-screen bg-fitted-blue flex items-center justify-center">
      <div className="home-container">
        <div className="background-image-container">
          <img 
            src={image.src}
            alt="Modern closet"
            className="background-image"
          />
          <div className="background-overlay"></div>
        </div>
        
        <div className="content-wrapper">
          <h1 className="fitted-title">Fitted</h1>
          <p className="fitted-tagline">Your Virtual Wardrobe, Styled to Perfection</p>
          
          <div className="button-container">
            <Link href="/upload" className="fitted-btn">
              <Upload size={24} strokeWidth={1.5} />
              <span>Upload Clothes</span>
            </Link>
            
            <Link href="/closet" className="fitted-btn">
              <Shirt size={24} strokeWidth={1.5} />
              <span>View Closet</span>
            </Link>
            
            <Link href="/outfit" className="fitted-btn">
              <Palette size={24} strokeWidth={1.5} />
              <span>Build Outfit</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}