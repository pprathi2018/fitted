'use client';

import { Trash2 } from 'lucide-react';
import { ClothingItem } from '@/types/clothing';

interface ClosetItemCardProps {
  item: ClothingItem;
  onDelete: (itemId: string) => void;
  onClick: (item: ClothingItem) => void;
}

const ClosetItemCard = ({ item, onDelete, onClick }: ClosetItemCardProps) => {
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(item.id);
  };

  const handleCardClick = () => {
    onClick(item);
  };

  return (
    <div className="closet-item-card" onClick={handleCardClick}>
      <div className="closet-item-image-container">
        <img
          src={item.image}
          alt={item.name}
          className="closet-item-image"
        />
        <button
          onClick={handleDeleteClick}
          className="closet-item-delete-btn"
          title="Delete item"
        >
          <Trash2 className="delete-icon" />
        </button>
      </div>
      
      <div className="closet-item-info">
        <p className="closet-item-name">{item.name}</p>
      </div>
    </div>
  );
};

export default ClosetItemCard;