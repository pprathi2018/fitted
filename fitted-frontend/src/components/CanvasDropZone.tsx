'use client';

import { useDroppable } from '@dnd-kit/core';
import { ClothingItem as ClothingItemType, OutfitItem } from '@/types/clothing';
import CanvasImage from './CanvasImage';
import { cn } from '@/lib/utils';

interface CanvasDropZoneProps {
  outfitItems: OutfitItem[];
  clothingItems: ClothingItemType[];
  selectedItemId: string | null;
  onItemSelect: (id: string | null) => void;
  onItemUpdate: React.Dispatch<React.SetStateAction<OutfitItem[]>>;
  onZIndexUpdate: React.Dispatch<React.SetStateAction<number>>;
}

const CanvasDropZone = ({
  outfitItems,
  clothingItems,
  selectedItemId,
  onItemSelect,
  onItemUpdate,
  onZIndexUpdate,
}: CanvasDropZoneProps) => {
  const {setNodeRef, isOver} = useDroppable({
    id: 'canvas',
  });

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onItemSelect(null);
    }
  };

  const handleItemDragStop = (itemId: string, x: number, y: number) => {
    onItemUpdate(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, x, y }
        : item
    ));
    onZIndexUpdate(prev => prev + 1);
    onItemSelect(itemId);
  };

  const handleItemResizeStop = (itemId: string, width: number, height: number) => {
    onItemUpdate(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, width, height }
        : item
    ));
  };

  return (
    <div
      ref={setNodeRef}
      id="canvas"
      className={cn(
        "relative w-full h-full bg-white rounded-lg border-2 border-dashed transition-all",
        isOver ? "border-fitted-blue-accent bg-blue-50" : "border-fitted-gray-300"
      )}
      onClick={handleCanvasClick}
    >
      {outfitItems.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-fitted-gray-400 text-lg">
            Drag clothing items here to create your outfit
          </p>
        </div>
      )}
      
      {outfitItems.map((outfitItem) => {
        const clothingItem = clothingItems.find(item => item.id === outfitItem.clothingId);
        if (!clothingItem) return null;
        
        return (
          <CanvasImage
            key={outfitItem.id}
            item={clothingItem}
            outfitItemId={outfitItem.id}
            isSelected={selectedItemId === outfitItem.id}
            position={{ x: outfitItem.x, y: outfitItem.y }}
            size={{ width: outfitItem.width || 128, height: outfitItem.height || 160 }}
            zIndex={outfitItem.zIndex}
            onSelect={onItemSelect}
            onDragStop={handleItemDragStop}
            onResizeStop={handleItemResizeStop}
          />
        );
      })}
    </div>
  );
};

export default CanvasDropZone;