'use client';

import { User } from '@/lib/auth/types';
import { Mail, LogOut } from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';

interface ProfileAuthenticatedProps {
  user: User;
}

export default function ProfileAuthenticated({ user }: ProfileAuthenticatedProps) {
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="profile-authenticated">
      <div className="profile-card">
        <div className="profile-header">
          <h2 className="profile-name">
            {user.firstName} {user.lastName}
          </h2>
          <p className="profile-email">
            <Mail className="email-icon" />
            {user.email}
          </p>
        </div>

        <div className="profile-info">
          <div className="info-section">
            <h3 className="section-title">Account Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">User ID</span>
                <span className="info-value">{user.id}</span>
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
          <button onClick={handleLogout} className="logout-btn">
            <LogOut className="logout-icon" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}