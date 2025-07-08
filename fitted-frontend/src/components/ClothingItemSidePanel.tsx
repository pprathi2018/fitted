'use client';

import { useDrag } from 'react-dnd';
import { ClothingItem as ClothingItemType } from '@/types/clothing';

interface ClothingItemSidePanelProps {
  item: ClothingItemType;
  inOutfit?: boolean;
}

const ClothingItemSidePanel = ({ item, inOutfit = false }: ClothingItemSidePanelProps) => {
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: 'clothing-item',
    item: { 
      ...item, 
      fromCanvas: false
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={inOutfit ? null : dragRef as any}
      className={`clothing-item ${isDragging ? 'dragging' : ''} sidebar-item ${inOutfit ? 'in-outfit' : ''}`}
    >
      <div className="clothing-item-content">
        <div className="clothing-item-image-container">
          <img
            src={item.image}
            alt={item.name}
            className={inOutfit ? 'clothing-item-image-in-outfit' : 'clothing-item-image'}
            draggable={false}
          />
        </div>
        <div className="clothing-item-info">
          <p className="clothing-item-name">{item.name}</p>
        </div>
      </div>
    </div>
  );
};

export default ClothingItemSidePanel;