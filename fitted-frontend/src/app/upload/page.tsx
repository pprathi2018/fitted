'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import ImageUpload from '@/components/ImageUpload';

export default function UploadPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-fitted-gray-50 py-8">
        <ImageUpload />
      </div>
    </ProtectedRoute>
  );
}