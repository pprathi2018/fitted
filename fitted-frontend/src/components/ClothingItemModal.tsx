'use client';

import { Trash2 } from 'lucide-react';
import { ClothingItemResponse } from '@/lib/api/clothing-item-api-client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { fittedButton } from '@/lib/styles';
import { cn } from '@/lib/utils';

interface ClothingItemModalProps {
  item: ClothingItemResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (itemId: string) => void;
}

const ClothingItemModal = ({ item, isOpen, onClose, onDelete }: ClothingItemModalProps) => {
  if (!item) return null;

  const handleDeleteClick = () => {
    onDelete(item.id);
    onClose();
  };

  const categoryLabels: Record<string, string> = {
    top: 'Top',
    bottom: 'Bottom',
    dress: 'Dress',
    outerwear: 'Outerwear',
    shoes: 'Shoes',
    accessory: 'Accessory',
  };

  const imageUrl = item.modified_image_url || item.original_image_url;
  const categoryLabel = categoryLabels[item.type.toLowerCase()] || item.type;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{item.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="h-96 bg-fitted-gray-50 rounded-lg flex items-center justify-center p-8">
            <img
              src={imageUrl}
              alt={item.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          
          <div className="space-y-4">
            <p className="text-lg text-fitted-gray-600 capitalize">
              {categoryLabel}
            </p>
            
            <div className="pt-4 border-t space-y-3">
              <InfoRow label="Type" value={categoryLabel} />
              <InfoRow 
                label="Added" 
                value={new Date(item.created_at).toLocaleDateString()} 
              />
              {item.color && <InfoRow label="Color" value={item.color} />}
            </div>
            
            <Button
              onClick={handleDeleteClick}
              className={cn(fittedButton({ variant: "danger", size: "full" }))}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Item
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium text-fitted-gray-500">{label}:</span>
      <span className="text-sm font-semibold text-fitted-gray-900">{value}</span>
    </div>
  );
}

export default ClothingItemModal;