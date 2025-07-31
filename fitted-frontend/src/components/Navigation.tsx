'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Upload, Shirt, Palette, User } from 'lucide-react';

const Navigation = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/upload', icon: Upload, label: 'Upload' },
    { href: '/closet', icon: Shirt, label: 'Closet' },
    { href: '/outfit', icon: Palette, label: 'Outfit' },
  ];

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-left">
          <p className="nav-brand">Fitted</p>
          
          <div className="nav-center">
            {navItems.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className={`nav-link ${pathname === href ? 'active' : ''}`}
              >
                <Icon className="nav-link-icon" strokeWidth={1.5} />
                <span className="nav-link-text">{label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="nav-right">
          <Link
            href="/profile"
            className={`profile-button ${pathname === '/profile' ? 'active' : ''}`}
            aria-label="User Profile"
          >
            <User className="profile-icon" strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;