'use client';

import { Trash2 } from 'lucide-react';
import { ClothingItemResponse } from '@/lib/api/clothing-item-api-client';
import { Button } from '@/components/ui/button';

interface ClothingItemCardProps {
  item: ClothingItemResponse;
  onDelete: (itemId: string) => void;
  onClick: (item: ClothingItemResponse) => void;
}

const ClothingItemCard = ({ item, onDelete, onClick }: ClothingItemCardProps) => {
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(item.id);
  };

  const imageUrl = item.modified_image_url || item.original_image_url;

  return (
    <div 
      className="group relative bg-white rounded-lg border-2 border-transparent hover:border-fitted-blue-sky transition-all cursor-pointer hover:-translate-y-1 hover:shadow-lg"
      onClick={() => onClick(item)}
    >
      <div className="relative h-48 bg-fitted-gray-50 rounded-t-lg flex items-center justify-center p-4">
        <img
          src={imageUrl}
          alt={item.name}
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
        <p className="font-semibold text-fitted-gray-900 truncate">{item.name}</p>
        <p className="text-sm text-fitted-gray-500 capitalize">{item.type.toLowerCase()}</p>
      </div>
    </div>
  );
};

export default ClothingItemCard;