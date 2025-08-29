'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Upload, Shirt, Palette, User } from 'lucide-react';
import { cva } from 'class-variance-authority';

const navLinkVariants = cva(
  "flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium tracking-wide transition-all",
  {
    variants: {
      active: {
        true: "bg-fitted-blue-accent/15 text-blue-700",
        false: "text-fitted-gray-600 hover:text-blue-700 hover:bg-fitted-blue-accent/10"
      }
    }
  }
);

const iconButtonVariants = cva(
  "size-11 rounded-full flex items-center justify-center transition-all border-[1.5px]",
  {
    variants: {
      active: {
        true: "bg-fitted-blue-accent/20 border-fitted-blue-accent/40 text-blue-700",
        false: "bg-fitted-blue-accent/10 border-fitted-blue-accent/20 text-fitted-blue-accent hover:bg-fitted-blue-accent/15 hover:border-fitted-blue-accent/30 hover:text-blue-700"
      }
    }
  }
);

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/upload', icon: Upload, label: 'Upload' },
    { href: '/closet', icon: Shirt, label: 'Closet' },
    { href: '/outfit', icon: Palette, label: 'Outfit' },
  ];

  return (
    <nav className="bg-fitted-blue-pale/20 backdrop-blur-[10px] border-b border-fitted-blue-accent/10 relative z-50">
      <div className="container flex items-center justify-between h-[72px]">
        <div className="flex items-center">
          <a className="fitted-logo text-4xl pr-20">
            Fitted
          </a>
          
          <div className="flex items-center gap-2 p-1.5 rounded-full bg-fitted-blue-accent/8 border border-fitted-blue-accent/10">
            {navItems.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className={navLinkVariants({ active: pathname === href })}
              >
                <Icon size={20} strokeWidth={1.5} className="opacity-80" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
          </div>
        </div>

        <Link
          href="/profile"
          className={iconButtonVariants({ active: pathname === '/profile' })}
          aria-label="User Profile"
        >
          <User size={20} strokeWidth={1.5} />
        </Link>
      </div>
    </nav>
  );
}