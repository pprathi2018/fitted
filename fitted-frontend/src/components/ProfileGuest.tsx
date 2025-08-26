import Link from 'next/link';
import { User, LogIn, UserPlus } from 'lucide-react';

export default function ProfileGuest() {
  return (
    <div className="profile-guest">
      <div className="guest-card">
        <div className="guest-header">
          <User className="guest-icon" />
          <h2 className="guest-title">Welcome to Fitted</h2>
          <p className="guest-subtitle">Log in to access your virtual wardrobe</p>
        </div>

        <div className="guest-actions">
          <Link href="/login" className="guest-action-btn primary">
            <LogIn className="action-icon" />
            <span>Log In</span>
          </Link>
          
          <Link href="/signup" className="guest-action-btn secondary">
            <UserPlus className="action-icon" />
            <span>Create Account</span>
          </Link>
        </div>

        <div className="guest-info">
          <h3 className="info-title">Why create an account?</h3>
          <ul className="info-list">
            <li>Save your clothing items permanently</li>
            <li>Create and manage multiple outfits</li>
            <li>Access your wardrobe from any device</li>
            <li>Share outfits with friends</li>
          </ul>
        </div>
      </div>
    </div>
  );
}