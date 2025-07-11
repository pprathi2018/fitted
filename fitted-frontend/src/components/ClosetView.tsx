'use client';

import { useMemo, useState } from 'react';
import { ClothingItem } from '@/types/clothing';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import ClosetItemCard from './ClosetItemCard';
import ClothingItemModal from './ClothingItemModal';

const ClosetView = () => {
  const [clothingItems, setClothingItems] = useLocalStorage<ClothingItem[]>('clothing-items', []);
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const groupedItems = useMemo(() => {
    return clothingItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, ClothingItem[]>);
  }, [clothingItems]);

  const handleDeleteItem = (itemId: string) => {
    setClothingItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const handleItemClick = (item: ClothingItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Delay clearing selected item to prevent flicker during close animation
    setTimeout(() => setSelectedItem(null), 300);
  };

  const categoryLabels: Record<string, string> = {
    top: 'Tops',
    bottom: 'Bottoms',
    dress: 'Dresses',
    outerwear: 'Outerwear',
    shoes: 'Shoes',
    accessory: 'Accessories',
  };

  return (
    <div className="closet-container">
      <h1 className="closet-page-title">Your Closet</h1>
      
      {clothingItems.length === 0 ? (
        <div className="empty-closet-page">
          <p className="empty-closet-page-text">Your closet is empty.</p>
          <p className="empty-closet-page-subtext">
            Start by uploading some clothing items to build your wardrobe!
          </p>
        </div>
      ) : (
        <div className="closet-categories">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} className="closet-category-section">
              <h2 className="closet-category-title">
                {categoryLabels[category] || category} ({items.length})
              </h2>
              <div className="closet-items-grid">
                {items.map((item) => (
                  <ClosetItemCard
                    key={item.id}
                    item={item}
                    onDelete={handleDeleteItem}
                    onClick={handleItemClick}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <ClothingItemModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onDelete={handleDeleteItem}
      />
    </div>
  );
};

export default ClosetView;