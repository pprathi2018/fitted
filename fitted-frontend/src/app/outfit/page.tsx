'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import OutfitCanvas from '@/components/OutfitCanvas';

export default function OutfitPage() {
  return (
    <ProtectedRoute>
      <OutfitCanvas />
    </ProtectedRoute>
  );
}