// src/components/Profile.tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { User, Mail, LogOut, UserPlus, LogIn } from 'lucide-react';

const Profile = () => {
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  console.log(`IsAuthenticated: ${isAuthenticated}`)

  if (!isAuthenticated) {
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

  return (
    <div className="profile-authenticated">
      <div className="profile-card">
        <div className="profile-header">
          <h2 className="profile-name">
            {user?.firstName} {user?.lastName}
          </h2>
          <p className="profile-email">
            <Mail className="email-icon" />
            {user?.email}
          </p>
        </div>

        <div className="profile-info">
          <div className="info-section">
            <h3 className="section-title">Account Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">User ID</span>
                <span className="info-value">{user?.id}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Member Since</span>
                <span className="info-value">
                  {new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button onClick={logout} className="logout-btn">
            <LogOut className="logout-icon" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;