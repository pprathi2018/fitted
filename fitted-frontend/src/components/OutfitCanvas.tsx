// src/components/OutfitCanvas.tsx
'use client';

import { useState, useCallback, useMemo } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, pointerWithin } from '@dnd-kit/core';
import { Trash2, MoveUp, MoveDown, ChevronDown, ChevronUp } from 'lucide-react';
import { ClothingItem as ClothingItemType, OutfitItem } from '@/types/clothing';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import ClothingItemSidePanel from './ClothingItemSidePanel';
import CanvasDropZone from './CanvasDropZone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const OutfitCanvas = () => {
  const [clothingItems] = useLocalStorage<ClothingItemType[]>('clothing-items', []);
  const [outfitItems, setOutfitItems] = useState<OutfitItem[]>([]);
  const [nextZIndex, setNextZIndex] = useState(1);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [activeId, setActiveId] = useState<string | null>(null);


  const groupedItems = useMemo(() => {
    return clothingItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, ClothingItemType[]>);
  }, [clothingItems]);

  const selectedItemZInfo = useMemo(() => {
    if (!selectedItemId || outfitItems.length === 0) return { isHighest: false, isLowest: false };
    
    const selectedItem = outfitItems.find(item => item.id === selectedItemId);
    if (!selectedItem) return { isHighest: false, isLowest: false };
    
    const zIndexes = outfitItems.map(item => item.zIndex);
    const maxZ = Math.max(...zIndexes);
    const minZ = Math.min(...zIndexes);
    
    return {
      isHighest: selectedItem.zIndex === maxZ,
      isLowest: selectedItem.zIndex === minZ
    };
  }, [selectedItemId, outfitItems]);

  const outfitContainsClothingItem = (clothingItemId: string) => {
    return outfitItems.some(outfitItem => outfitItem.clothingId === clothingItemId);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && over.id === 'canvas') {
      const draggedItem = clothingItems.find(item => item.id === active.id);
      
      if (draggedItem && !outfitContainsClothingItem(draggedItem.id)) {
        // Use the final translated position from the drag
        const finalX = event.active.rect.current.translated?.left;
        const finalY = event.active.rect.current.translated?.top;
        
        if (finalX !== undefined && finalY !== undefined && over.rect) {
          // Calculate position relative to canvas
          const x = Math.max(0, Math.min(finalX - over.rect.left, over.rect.width - 128));
          const y = Math.max(0, Math.min(finalY - over.rect.top, over.rect.height - 160));
          
          const newOutfitItem: OutfitItem = {
            id: `${draggedItem.id}-${Date.now()}`,
            clothingId: draggedItem.id,
            x,
            y,
            zIndex: nextZIndex,
            width: 128,
            height: 160
          };
          
          setOutfitItems(prev => [...prev, newOutfitItem]);
          setNextZIndex(prev => prev + 1);
          setSelectedItemId(newOutfitItem.id);
        }
      }
    }
    
    setActiveId(null);
  };

  const deleteSelectedItem = useCallback(() => {
    if (!selectedItemId) return;
    setOutfitItems(prev => prev.filter(item => item.id !== selectedItemId));
    setSelectedItemId(null);
  }, [selectedItemId]);

  const moveSelectedToFront = useCallback(() => {
    if (!selectedItemId || selectedItemZInfo.isHighest) return;
    
    setOutfitItems(prev => prev.map(item => 
      item.id === selectedItemId 
        ? { ...item, zIndex: nextZIndex }
        : item
    ));
    setNextZIndex(prev => prev + 1);
  }, [selectedItemId, nextZIndex, selectedItemZInfo.isHighest]);

  const moveSelectedToBack = useCallback(() => {
    if (!selectedItemId || selectedItemZInfo.isLowest) return;
    
    const minZIndex = Math.min(...outfitItems.map(item => item.zIndex));
    setOutfitItems(prev => prev.map(item => 
      item.id === selectedItemId 
        ? { ...item, zIndex: minZIndex - 1 }
        : item
    ));
  }, [selectedItemId, outfitItems, selectedItemZInfo.isLowest]);

  const toggleSection = useCallback((category: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  }, []);

  const clearOutfit = useCallback(() => {
    setOutfitItems([]);
    setNextZIndex(1);
    setSelectedItemId(null);
  }, []);

  const categoryLabels: Record<string, string> = {
    top: 'Tops',
    bottom: 'Bottoms',
    dress: 'Dresses',
    outerwear: 'Outerwear',
    shoes: 'Shoes',
    accessory: 'Accessories',
  };

  const activeDragItem = activeId ? clothingItems.find(item => item.id === activeId) : null;

  return (
    <DndContext 
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd}
      collisionDetection={pointerWithin}
      autoScroll={false}
    >
      <div className="h-screen flex">
        <div className="w-96 bg-white shadow-lg flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold text-fitted-gray-900">Your Closet</h2>
            <p className="text-sm text-fitted-gray-500">{clothingItems.length} items</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {clothingItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-fitted-gray-600">No clothing items yet.</p>
                <p className="text-sm text-fitted-gray-500 mt-1">
                  Go to the upload page to add some clothes!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {Object.entries(groupedItems).map(([category, items]) => (
                  <Card key={category} className="overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between p-3 hover:bg-fitted-gray-50 transition-colors"
                      onClick={() => toggleSection(category)}
                    >
                      <h3 className="text-sm font-medium text-fitted-gray-700 capitalize">
                        {categoryLabels[category]} ({items.length})
                      </h3>
                      {collapsedSections[category] ? 
                        <ChevronDown className="h-5 w-5 text-fitted-gray-400" /> : 
                        <ChevronUp className="h-5 w-5 text-fitted-gray-400" />
                      }
                    </button>
                    {!collapsedSections[category] && (
                      <CardContent className="p-3 pt-0">
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                          {items.map((item) => (
                            <ClothingItemSidePanel 
                              key={item.id} 
                              item={item} 
                              inOutfit={outfitContainsClothingItem(item.id)} 
                            />
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-fitted-gray-50">
          <div className="bg-white shadow-sm p-4 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-fitted-gray-900">Outfit Canvas</h1>
            
            <div className="flex items-center gap-4">
              <div className="flex gap-2 p-1 bg-fitted-gray-100 rounded-lg">
                <Button
                  onClick={deleteSelectedItem}
                  disabled={!selectedItemId}
                  size="sm"
                  variant="destructive"
                  className="h-8 w-8 p-0"
                >
                  <Trash2 size={16} />
                </Button>
                <Button
                  onClick={moveSelectedToFront}
                  disabled={!selectedItemId || selectedItemZInfo.isHighest}
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                >
                  <MoveUp size={16} />
                </Button>
                <Button
                  onClick={moveSelectedToBack}
                  disabled={!selectedItemId || selectedItemZInfo.isLowest}
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                >
                  <MoveDown size={16} />
                </Button>
              </div>
              
              <Button
                onClick={clearOutfit}
                disabled={outfitItems.length === 0}
                variant="destructive"
                size="sm"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Outfit
              </Button>
            </div>
          </div>
          
          <div className="flex-1 p-6">
            <CanvasDropZone
              outfitItems={outfitItems}
              clothingItems={clothingItems}
              selectedItemId={selectedItemId}
              onItemSelect={setSelectedItemId}
              onItemUpdate={setOutfitItems}
              onZIndexUpdate={setNextZIndex}
            />
          </div>
          
          <div className="bg-white border-t px-4 py-3 flex justify-between text-sm text-fitted-gray-600">
            <span>{outfitItems.length} items in current outfit</span>
            <span>
              {selectedItemId 
                ? 'Item selected - use buttons above to manage it' 
                : 'Click on items to select them, drag to move'
              }
            </span>
          </div>
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeDragItem && (
          <div className="pointer-events-none">
            <div className="w-32 h-40 bg-white rounded-lg border-2 border-fitted-blue-accent shadow-lg flex items-center justify-center">
              <img 
                src={activeDragItem.image} 
                alt={activeDragItem.name}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};

export default OutfitCanvas;