'use client';

import { useDraggable } from '@dnd-kit/core';
import { ClothingItem as ClothingItemType } from '@/types/clothing';
import { cn } from '@/lib/utils';

interface ClothingItemSidePanelProps {
  item: ClothingItemType;
  inOutfit?: boolean;
}

const ClothingItemSidePanel = ({ item, inOutfit = false }: ClothingItemSidePanelProps) => {
  const {attributes, listeners, setNodeRef, isDragging} = useDraggable({
    id: item.id,
    disabled: inOutfit,
  });

  return (
    <div
      ref={setNodeRef}
      {...(!inOutfit ? listeners : {})}
      {...(!inOutfit ? attributes : {})}
      className={cn(
        "w-32 h-40 bg-white rounded-lg border-2 transition-all shrink-0",
        inOutfit ? "opacity-50 cursor-not-allowed border-fitted-gray-200" : "cursor-move hover:border-fitted-blue-sky border-transparent",
        isDragging && "opacity-30 border-fitted-blue-accent"
      )}
    >
      <div className="h-full flex items-center justify-center">
        <img
          src={item.image}
          alt={item.name}
          className={cn("max-w-full max-h-full object-contain", inOutfit && "opacity-50")}
          draggable={false}
        />
      </div>
    </div>
  );
};

export default ClothingItemSidePanel;