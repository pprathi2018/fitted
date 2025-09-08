'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import ClosetView from '@/components/ClosetView';

export default function ClosetPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-fitted-gray-50 py-8">
        <ClosetView />
      </div>
    </ProtectedRoute>
  );
}