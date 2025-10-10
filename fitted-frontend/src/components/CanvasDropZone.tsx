'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { ClothingItemResponse } from '@/lib/api/clothing-item-api-client';
import CanvasImage from './CanvasImage';
import { cn } from '@/lib/utils';

interface OutfitItem {
  id: string;
  clothingId: string;
  clothingItem: ClothingItemResponse;
  x: number;
  y: number;
  zIndex: number;
  width?: number;
  height?: number;
}

interface CanvasDropZoneProps {
  outfitItems: OutfitItem[];
  selectedItemId: string | null;
  onItemSelect: (itemId: string | null) => void;
  onItemDragStop: (itemId: string, x: number, y: number) => void;
  onItemResizeStop: (itemId: string, width: number, height: number) => void;
  onCanvasClick: (e: React.MouseEvent) => void;
}

const CanvasDropZone = ({
  outfitItems,
  selectedItemId,
  onItemSelect,
  onItemDragStop,
  onItemResizeStop,
  onCanvasClick
}: CanvasDropZoneProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas',
  });

  return (
    <div
      ref={setNodeRef}
      id="canvas"
      className={cn(
        "relative w-full h-full bg-white rounded-lg border-2 border-dashed transition-all",
        isOver ? "border-fitted-blue-accent bg-fitted-blue-light" : "border-fitted-gray-300"
      )}
      onClick={onCanvasClick}
    >
      {outfitItems.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-fitted-gray-400 text-lg">
            Drag clothing items here to create your outfit
          </p>
        </div>
      )}
      
      {outfitItems.map((outfitItem) => (
        <CanvasImage
          key={outfitItem.id}
          item={outfitItem.clothingItem}
          outfitItemId={outfitItem.id}
          isSelected={selectedItemId === outfitItem.id}
          position={{ x: outfitItem.x, y: outfitItem.y }}
          size={{ width: outfitItem.width || 128, height: outfitItem.height || 160 }}
          zIndex={outfitItem.zIndex}
          onSelect={onItemSelect}
          onDragStop={onItemDragStop}
          onResizeStop={onItemResizeStop}
        />
      ))}
    </div>
  );
};

export default CanvasDropZone;