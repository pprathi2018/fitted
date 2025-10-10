'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, pointerWithin } from '@dnd-kit/core';
import { Trash2, MoveUp, MoveDown, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { ClothingItemResponse } from '@/lib/api/clothing-item-api-client';
import { useClothingItemsByType } from '@/hooks/useClothingItemsByType';
import ClothingItemSidePanel from './ClothingItemSidePanel';
import CanvasDropZone from './CanvasDropZone';
import SectionLoader from './SectionLoader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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

const OutfitCanvas = () => {
  const { sections, isInitialLoading, loadMoreForType, retryForType, getItemById } = useClothingItemsByType();
  const [outfitItems, setOutfitItems] = useState<OutfitItem[]>([]);
  const [nextZIndex, setNextZIndex] = useState(1);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const observerRefs = useRef<Map<string, IntersectionObserver>>(new Map());

  useEffect(() => {
    sections.forEach(section => {
      const observerKey = section.type;
      
      if (observerRefs.current.has(observerKey)) {
        observerRefs.current.get(observerKey)?.disconnect();
      }

      if (section.hasMore && !section.isLoadingMore) {
        const prefetchIndex = Math.max(0, section.items.length - 3);
        const prefetchElement = document.querySelector(`#item-${section.type}-${prefetchIndex}`);

        if (prefetchElement) {
          const observer = new IntersectionObserver(
            (entries) => {
              if (entries[0].isIntersecting) {
                loadMoreForType(section.type);
              }
            },
            { 
              threshold: 0.01,
              rootMargin: '100px'
            }
          );

          observer.observe(prefetchElement);
          observerRefs.current.set(observerKey, observer);
        }
      }
    });

    return () => {
      observerRefs.current.forEach(observer => observer.disconnect());
    };
  }, [sections, loadMoreForType]);

  const categoryLabels: Record<string, string> = {
    top: 'Tops',
    bottom: 'Bottoms',
    dress: 'Dresses',
    outerwear: 'Outerwear',
    shoes: 'Shoes',
    accessory: 'Accessories',
  };

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
      const draggedItemId = active.id as string;
      const draggedItem = getItemById(draggedItemId);
      
      if (draggedItem && !outfitContainsClothingItem(draggedItem.id)) {
        const finalX = event.active.rect.current.translated?.left;
        const finalY = event.active.rect.current.translated?.top;
        
        if (finalX !== undefined && finalY !== undefined && over.rect) {
          const x = Math.max(0, Math.min(finalX - over.rect.left, over.rect.width - 128));
          const y = Math.max(0, Math.min(finalY - over.rect.top, over.rect.height - 160));
          
          const newOutfitItem: OutfitItem = {
            id: `outfit-${draggedItem.id}-${Date.now()}`,
            clothingId: draggedItem.id,
            clothingItem: draggedItem,
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

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedItemId(null);
    }
  }, []);

  const handleItemDragStop = useCallback((itemId: string, x: number, y: number) => {
    setOutfitItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, x, y } : item
    ));
    setNextZIndex(prev => prev + 1);
    setSelectedItemId(itemId);
  }, []);

  const handleItemResizeStop = useCallback((itemId: string, width: number, height: number) => {
    setOutfitItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, width, height } : item
    ));
  }, []);

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

  const activeDragItem = activeId ? getItemById(activeId) : null;

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
            {!isInitialLoading && (
              <p className="text-sm text-fitted-gray-500">
                {sections.reduce((total, section) => total + section.totalCount, 0)} items
              </p>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {isInitialLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="p-3">
                      <Skeleton className="h-4 w-24 mb-3" />
                      <SectionLoader />
                    </div>
                  </Card>
                ))}
              </div>
            ) : sections.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-fitted-gray-600">No clothing items yet.</p>
                <p className="text-sm text-fitted-gray-500 mt-1">
                  Go to the upload page to add some clothes!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {sections.map((section) => (
                  <Card key={section.type} className="overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between p-3 hover:bg-fitted-gray-50 transition-colors"
                      onClick={() => toggleSection(section.type)}
                    >
                      <h3 className="text-sm font-medium text-fitted-gray-700">
                        {categoryLabels[section.type]} ({section.totalCount})
                      </h3>
                      {collapsedSections[section.type] ? 
                        <ChevronDown className="h-5 w-5 text-fitted-gray-400" /> : 
                        <ChevronUp className="h-5 w-5 text-fitted-gray-400" />
                      }
                    </button>
                    {!collapsedSections[section.type] && (
                      <CardContent className="p-3 pt-0">
                        {section.error ? (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="flex items-center justify-between">
                              <span>{section.error}</span>
                              <Button
                                onClick={() => retryForType(section.type)}
                                size="sm"
                                variant="outline"
                                className="ml-2"
                              >
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Retry
                              </Button>
                            </AlertDescription>
                          </Alert>
                        ) : (
                          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                            {section.items.map((item, index) => (
                              <div key={item.id} id={`item-${section.type}-${index}`}>
                                <ClothingItemSidePanel
                                  item={item}
                                  inOutfit={outfitContainsClothingItem(item.id)}
                                />
                              </div>
                            ))}
                            {section.isLoadingMore && section.hasMore && (
                              <div className="w-32 h-40 shrink-0 flex items-center justify-center">
                                <div className="flex flex-col items-center gap-2">
                                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-fitted-gray-300 border-t-fitted-blue-accent" />
                                  <span className="text-xs text-fitted-gray-500">Loading...</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
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
              selectedItemId={selectedItemId}
              onItemSelect={setSelectedItemId}
              onItemDragStop={handleItemDragStop}
              onItemResizeStop={handleItemResizeStop}
              onCanvasClick={handleCanvasClick}
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
                src={activeDragItem.modified_image_url || activeDragItem.original_image_url} 
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