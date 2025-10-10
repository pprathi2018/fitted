'use client';

import React from 'react';
import { Rnd } from 'react-rnd';
import { ClothingItemResponse } from '@/lib/api/clothing-item-api-client';
import { cn } from '@/lib/utils';

interface CanvasImageProps {
  item: ClothingItemResponse;
  outfitItemId: string;
  isSelected: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  onSelect: (itemId: string) => void;
  onDragStop: (itemId: string, x: number, y: number) => void;
  onResizeStop: (itemId: string, width: number, height: number) => void;
}

const CanvasImage = ({
  item,
  outfitItemId,
  isSelected,
  position,
  size,
  zIndex,
  onSelect,
  onDragStop,
  onResizeStop
}: CanvasImageProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(outfitItemId);
  };

  const handleDragStop = (e: any, d: any) => {
    onDragStop(outfitItemId, d.x, d.y);
  };

  const handleResizeStop = (
    e: any,
    direction: any,
    ref: HTMLElement
  ) => {
    const width = parseInt(ref.style.width, 10);
    const height = parseInt(ref.style.height, 10);
    onResizeStop(outfitItemId, width, height);
  };

  const imageUrl = item.modified_image_url || item.original_image_url;

  return (
    <Rnd
      size={{ width: size.width, height: size.height }}
      position={{ x: position.x, y: position.y }}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      minWidth={40}
      minHeight={50}
      maxWidth={400}
      maxHeight={500}
      lockAspectRatio={true}
      bounds="parent"
      enableResizing={{
        top: false,
        right: false,
        bottom: false,
        left: false,
        topRight: true,
        bottomRight: true,
        bottomLeft: true,
        topLeft: true
      }}
      style={{ zIndex }}
      className={cn(
        "group cursor-move border-[3px] rounded-md transition-colors",
        isSelected ? "border-fitted-blue-accent rnd-item-selected" : "border-transparent hover:border-blue-200"
      )}
      onClick={handleClick}
    >
      <img
        src={imageUrl}
        alt={item.name}
        className="w-full h-full object-contain rounded select-none"
        draggable={false}
      />
    </Rnd>
  );
};

export default CanvasImage;