'use client';

import React from 'react';
import { useDrag } from 'react-dnd';
import { ClothingItem as ClothingItemType } from '@/types/clothing';

interface CanvasImageProps {
  item: ClothingItemType;
  outfitItemId: string;
  isSelected: boolean;
  onSelect: (itemId: string) => void;
}

const CanvasImage = ({ item, outfitItemId, isSelected, onSelect }: CanvasImageProps) => {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: 'clothing-item',
    item: (monitor) => {
      const draggedElement = document.getElementById(`canvas-item-${outfitItemId}`);
      const offset = monitor.getInitialClientOffset();
      if (draggedElement && offset) {
        const rect = draggedElement.getBoundingClientRect();
        return {
          ...item,
          fromCanvas: true,
          dragOffsetX: offset.x - rect.left,
          dragOffsetY: offset.y - rect.top
        };
      }
      return { ...item, fromCanvas: true };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(outfitItemId);
  };

  return (
    <div
      ref={dragRef as any}
      id={`canvas-item-${outfitItemId}`}
      onClick={handleClick}
      style={{
        cursor: 'pointer',
        border: isSelected ? '3px solid #3b82f6' : '3px solid transparent',
        borderRadius: '0.375rem',
        transition: 'border-color 0.2s ease',
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <img
        src={item.image}
        alt={item.name}
        style={{
          width: '8rem',
          height: '10rem',
          objectFit: 'contain',
          display: 'block',
          borderRadius: '0.25rem',
        }}
        draggable={false}
      />
    </div>
  );
};

export default CanvasImage;