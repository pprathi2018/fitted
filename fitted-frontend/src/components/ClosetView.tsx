'use client';

import { useMemo, useState } from 'react';
import { ClothingItem } from '@/types/clothing';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import ClosetItemCard from './ClosetItemCard';
import ClothingItemModal from './ClothingItemModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <div className="max-w-7xl mx-auto px-8">
      <h1 className="text-4xl font-bold text-fitted-gray-900 text-center mb-8">
        Your Closet
      </h1>
      
      {clothingItems.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl text-fitted-gray-600 mb-2">Your closet is empty.</p>
          <p className="text-fitted-gray-500">
            Start by uploading some clothing items to build your wardrobe!
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedItems).map(([category, items]) => (
            <Card key={category} className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl capitalize">
                  {categoryLabels[category] || category} ({items.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  {items.map((item) => (
                    <ClosetItemCard
                      key={item.id}
                      item={item}
                      onDelete={handleDeleteItem}
                      onClick={handleItemClick}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
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