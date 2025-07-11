'use client';

import { useEffect } from 'react';
import { Trash2, X } from 'lucide-react';
import { ClothingItem } from '@/types/clothing';

interface ClothingItemModalProps {
  item: ClothingItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (itemId: string) => void;
}

const ClothingItemModal = ({ item, isOpen, onClose, onDelete }: ClothingItemModalProps) => {
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOpen) {
      onClose();
    }
    onDelete(item!.id);
  };

  // Handle body scroll lock when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const categoryLabels: Record<string, string> = {
    top: 'Top',
    bottom: 'Bottom',
    dress: 'Dress',
    outerwear: 'Outerwear',
    shoes: 'Shoes',
    accessory: 'Accessory',
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-btns flex flex-row gap-2">
          <button className="modal-delete-btn" onClick={handleDeleteClick}>
            <Trash2 className="delete-icon" />
          </button>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="modal-image-container">
            <img
              src={item.image}
              alt={item.name}
              className="modal-image"
            />
          </div>
          
          <div className="modal-info">
            <h2 className="modal-item-name">{item.name}</h2>
            <p className="modal-item-category">
              {categoryLabels[item.category] || item.category}
            </p>
            
            <div className="modal-metadata">
              <div className="metadata-item">
                <span className="metadata-label">Type:</span>
                <span className="metadata-value">{categoryLabels[item.category]}</span>
              </div>
              <div className="metadata-item">
                <span className="metadata-label">Added:</span>
                <span className="metadata-value">
                  {new Date(item.uploadedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClothingItemModal;