'use client';

import { useState, useEffect } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { fittedButton } from '@/lib/styles';
import { cn } from '@/lib/utils';
import { 
  ClothingType, 
  CLOTHING_TYPES, 
  CLOTHING_TYPE_LABELS 
} from '@/lib/api/clothing-item-api-client';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: {
    types: ClothingType[];
    sortBy: 'createdAt' | 'name';
    sortOrder: 'ASCENDING' | 'DESCENDING';
  }) => void;
  currentFilters: {
    types: ClothingType[];
    sortBy: 'createdAt' | 'name';
    sortOrder: 'ASCENDING' | 'DESCENDING';
  };
}

export default function FilterModal({ 
  isOpen, 
  onClose, 
  onApply, 
  currentFilters 
}: FilterModalProps) {
  const [selectedTypes, setSelectedTypes] = useState<ClothingType[]>(currentFilters.types);
  const [sortBy, setSortBy] = useState<'createdAt' | 'name'>(currentFilters.sortBy);
  const [sortOrder, setSortOrder] = useState<'ASCENDING' | 'DESCENDING'>(currentFilters.sortOrder);

  useEffect(() => {
    if (isOpen) {
      setSelectedTypes(currentFilters.types);
      setSortBy(currentFilters.sortBy);
      setSortOrder(currentFilters.sortOrder);
    }
  }, [isOpen, currentFilters]);

  const toggleType = (type: ClothingType) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleApply = () => {
    onApply({
      types: selectedTypes,
      sortBy,
      sortOrder,
    });
    onClose();
  };

  const handleClearAll = () => {
    setSelectedTypes([]);
    setSortBy('createdAt');
    setSortOrder('DESCENDING');
  };

  const hasChanges = 
    JSON.stringify(selectedTypes) !== JSON.stringify(currentFilters.types) ||
    sortBy !== currentFilters.sortBy ||
    sortOrder !== currentFilters.sortOrder;

  const hasFilters = selectedTypes.length > 0 || sortBy !== 'createdAt' || sortOrder !== 'DESCENDING';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <SlidersHorizontal className="h-5 w-5" />
            Filter & Sort
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label className="text-base font-semibold">Clothing Type</Label>
            <div className="grid grid-cols-3 gap-2">
              {CLOTHING_TYPES.map((type) => (
                <Button
                  key={type}
                  type="button"
                  onClick={() => toggleType(type)}
                  variant="outline"
                  className={cn(
                    "h-10 text-sm font-medium transition-all",
                    selectedTypes.includes(type)
                      ? "bg-fitted-blue-accent text-white border-fitted-blue-accent hover:bg-blue-700 hover:border-blue-700"
                      : "bg-white text-fitted-gray-700 border-fitted-gray-200 hover:bg-fitted-gray-50 hover:border-fitted-gray-300"
                  )}
                >
                  {CLOTHING_TYPE_LABELS[type]}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold">Sort By</Label>
            <div className="grid grid-cols-2 gap-3">
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'createdAt' | 'name')}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Date Added</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as 'ASCENDING' | 'DESCENDING')}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DESCENDING">Descending</SelectItem>
                  <SelectItem value="ASCENDING">Ascending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClearAll}
            disabled={!hasFilters}
            className="text-fitted-gray-600 hover:text-fitted-gray-900"
          >
            Clear All
          </Button>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="min-w-[100px]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleApply}
              disabled={!hasChanges}
              className={cn(fittedButton({ variant: "primary", size: "md" }))}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}