'use client';

import { Trash2 } from 'lucide-react';
import { OutfitResponse } from '@/lib/api/outfit-api-client';
import { Button } from '@/components/ui/button';

interface OutfitCardProps {
  outfit: OutfitResponse;
  onDelete: (outfitId: string) => void;
  onClick: (outfit: OutfitResponse) => void;
}

const OutfitCard = ({ outfit, onDelete, onClick }: OutfitCardProps) => {
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(outfit.id);
  };

  return (
    <div 
      className="group relative bg-white rounded-lg border-2 border-transparent hover:border-fitted-blue-sky transition-all cursor-pointer hover:-translate-y-1 hover:shadow-lg"
      onClick={() => onClick(outfit)}
    >
      <div className="relative h-48 bg-fitted-gray-50 rounded-t-lg flex items-center justify-center p-1">
        <img
          src={outfit.outfit_image_url}
          alt="Outfit"
          className="max-w-full max-h-full object-contain"
          loading="lazy"
        />
        <Button
          onClick={handleDeleteClick}
          size="sm"
          variant="destructive"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="p-4">
        <p className="text-sm text-fitted-gray-500">
          {new Date(outfit.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default OutfitCard;