'use client';

import Link from 'next/link';
import { Upload, Palette, Shirt } from 'lucide-react';
import image from './closet-image.png';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Button } from '@/components/ui/button';
import { fittedButton } from '@/lib/styles';
import { cn } from '@/lib/utils';

export default function Home() {
  const { user, isAuthenticated } = useAuthStore();

  return (
    <main className="min-h-screen bg-fitted-gradient flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src={image.src}
          alt="Modern closet"
          className="w-full h-full object-cover opacity-[0.08] blur-[1.25px]"
        />
        <div className="absolute inset-0 bg-fitted-blue-pale" />
      </div>
      
      <div className="relative z-10 w-[90%] max-w-4xl p-8 glass-card rounded-[2rem] shadow-lg">
        <h1 className="fitted-logo text-fitted-title text-center leading-tight">
          Fitted
        </h1>
        
        {isAuthenticated && user && (
          <p className="text-xl font-medium text-blue-700 mb-3 tracking-wide text-center animate-fadeIn">
            Welcome back, {user.firstName}!
          </p>
        )}
        
        <p className="text-[1.375rem] font-light text-fitted-gray-700 mb-12 tracking-wide text-center">
          Your Virtual Wardrobe, Styled to Perfection
        </p>
        
        <div className="flex gap-6 justify-center">
          <Button asChild className={cn(fittedButton())}>
            <Link href="/upload" className="flex items-center justify-center gap-3">
              <Upload size={24} strokeWidth={1.5} className="text-blue-500" />
              <span className="text-[1.1rem] font-medium">Upload Clothes</span>
            </Link>
          </Button>
          
          <Button asChild className={cn(fittedButton())}>
            <Link href="/closet" className="flex items-center justify-center gap-3">
              <Shirt size={24} strokeWidth={1.5} className="text-blue-500" />
              <span className="text-[1.1rem] font-medium">View Closet</span>
            </Link>
          </Button>
          
          <Button asChild className={cn(fittedButton())}>
            <Link href="/outfit" className="flex items-center justify-center gap-3">
              <Palette size={24} strokeWidth={1.5} className="text-blue-500" />
              <span className="text-[1.1rem] font-medium">Build Outfit</span>
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}