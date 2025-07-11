'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Upload, Shirt, Palette } from 'lucide-react';

const Navigation = () => {
  const pathname = usePathname();

  return (
    <nav className="bg-navy-dark border-b-4 border-black">
      <div className="flex items-center justify-between h-[60px] px-[3vw]">
        <div className="flex items-center">
          <span className="nav-brand">Fitted</span>
          
          <Link 
            href="/" 
            className={`nav-icon ${pathname === '/' ? 'active' : ''}`}
          >
            <Home size={36} />
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            href="/upload" 
            className={`nav-icon ${pathname === '/upload' ? 'active' : ''}`}
          >
            <Upload size={36} />
          </Link>
          
          <Link 
            href="/closet" 
            className={`nav-icon ${pathname === '/closet' ? 'active' : ''}`}
          >
            <Shirt size={36} />
          </Link>
          
          <Link 
            href="/outfit" 
            className={`nav-icon ${pathname === '/outfit' ? 'active' : ''}`}
          >
            <Palette size={36} />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;