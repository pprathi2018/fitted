'use client';

import { Trash2, Edit, Tag as TagIcon } from 'lucide-react';
import { OutfitResponse } from '@/lib/api/outfit-api-client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { fittedButton } from '@/lib/styles';
import { cn } from '@/lib/utils';

interface OutfitModalProps {
  outfit: OutfitResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (outfitId: string) => void;
  onEdit: (outfit: OutfitResponse) => void;
}

const OutfitModal = ({ outfit, isOpen, onClose, onDelete, onEdit }: OutfitModalProps) => {
  if (!outfit) return null;

  const handleDeleteClick = () => {
    onDelete(outfit.id);
    onClose();
  };

  const handleEditClick = () => {
    onEdit(outfit);
    onClose();
  };

  const clothingItemCount = outfit.clothingItems?.length || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Outfit Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="h-[26rem] bg-fitted-gray-50 rounded-lg flex items-center justify-center p-1">
            <img
              src={outfit.outfit_image_url}
              alt="Outfit"
              className="max-w-full max-h-full object-contain"
            />
          </div>
          
          <div className="space-y-4">
            <div className="pt-4 border-t space-y-3">
              <InfoRow 
                label="Created" 
                value={new Date(outfit.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })} 
              />
              <InfoRow 
                label="Items" 
                value={`${clothingItemCount} clothing ${clothingItemCount === 1 ? 'item' : 'items'}`} 
              />
            </div>
            
            {outfit.tags && outfit.tags.length > 0 && (
              <div className="pt-3 border-t">
                <div className="flex items-center gap-2 mb-3">
                  <TagIcon className="h-4 w-4 text-fitted-gray-500" />
                  <span className="text-sm font-medium text-fitted-gray-500">Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {outfit.tags.map((tag) => (
                    <div
                      key={tag}
                      className="inline-flex items-center px-3 py-1 bg-fitted-blue-accent/10 text-fitted-blue-accent rounded-full text-sm font-medium border border-fitted-blue-accent/20"
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleEditClick}
                className={cn(fittedButton({ variant: "primary", size: "full" }))}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Outfit
              </Button>
              
              <Button
                onClick={handleDeleteClick}
                className={cn(fittedButton({ variant: "danger", size: "full" }))}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Outfit
              </Button>
            </div>
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

export default OutfitModal;