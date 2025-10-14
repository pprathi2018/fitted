'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, pointerWithin } from '@dnd-kit/core';
import { Trash2, MoveUp, MoveDown, ChevronDown, ChevronUp, RefreshCw, Save, Loader2, AlertCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
import { ClothingItemResponse } from '@/lib/api/clothing-item-api-client';
import { useClothingItemsByType } from '@/hooks/useClothingItemsByType';
import { outfitApi, OutfitClothingItemDTO, OutfitResponse } from '@/lib/api/outfit-api-client';
import ClothingItemSidePanel from './ClothingItemSidePanel';
import CanvasDropZone from './CanvasDropZone';
import SectionLoader from './SectionLoader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import toast from 'react-hot-toast';

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const outfitId = searchParams.get('outfitId');
  
  const { sections, isInitialLoading, loadMoreForType, retryForType, getItemById } = useClothingItemsByType();
  const [outfitItems, setOutfitItems] = useState<OutfitItem[]>([]);
  const [nextZIndex, setNextZIndex] = useState(1);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingOutfit, setIsLoadingOutfit] = useState(false);
  const [editingOutfit, setEditingOutfit] = useState<OutfitResponse | null>(null);
  const observerRefs = useRef<Map<string, IntersectionObserver>>(new Map());
  const hasLoadedOutfit = useRef(false);
  const canvasReadyRef = useRef(false);

  const categoryLabels: Record<string, string> = {
    top: 'Tops',
    bottom: 'Bottoms',
    dress: 'Dresses',
    outerwear: 'Outerwear',
    shoes: 'Shoes',
    accessory: 'Accessories',
  };

  useEffect(() => {
    const checkCanvas = () => {
      const canvasElement = document.getElementById('canvas');
      if (canvasElement && canvasElement.clientWidth > 0 && canvasElement.clientHeight > 0) {
        canvasReadyRef.current = true;
      }
    };

    checkCanvas();
    const timer = setTimeout(checkCanvas, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (outfitId && !hasLoadedOutfit.current && !isInitialLoading && canvasReadyRef.current) {
      loadOutfitData(outfitId);
      hasLoadedOutfit.current = true;
    }
  }, [outfitId, isInitialLoading, canvasReadyRef.current]);

  const loadOutfitData = async (id: string) => {
    setIsLoadingOutfit(true);
    
    try {
      let outfit: OutfitResponse | null = null;
      
      if (typeof window !== 'undefined') {
        const storedOutfit = sessionStorage.getItem('editingOutfit');
        if (storedOutfit) {
          outfit = JSON.parse(storedOutfit);
          sessionStorage.removeItem('editingOutfit');
        }
      }
      
      if (!outfit) {
        outfit = await outfitApi.getOutfit(id);
      }
      
      if (!outfit || !outfit.clothingItems || outfit.clothingItems.length === 0) {
        toast.error('Unable to load outfit data');
        return;
      }
      
      setEditingOutfit(outfit);
      
      const canvasElement = document.getElementById('canvas');
      if (!canvasElement || canvasElement.clientWidth === 0 || canvasElement.clientHeight === 0) {
        toast.error('Canvas not ready');
        return;
      }
      
      const canvasWidth = canvasElement.clientWidth;
      const canvasHeight = canvasElement.clientHeight;
      
      const loadedItems: OutfitItem[] = [];
      let maxZ = 0;
      
      for (const item of outfit.clothingItems) {
        const clothingItem = getItemById(item.clothingItemId);
        
        if (clothingItem) {
          const outfitItem: OutfitItem = {
            id: `outfit-${item.clothingItemId}-${Date.now()}-${Math.random()}`,
            clothingId: item.clothingItemId,
            clothingItem: clothingItem,
            x: (item.positionXPercent / 100) * canvasWidth,
            y: (item.positionYPercent / 100) * canvasHeight,
            width: (item.widthPercent / 100) * canvasWidth,
            height: (item.heightPercent / 100) * canvasHeight,
            zIndex: item.zIndex,
          };
          
          loadedItems.push(outfitItem);
          maxZ = Math.max(maxZ, item.zIndex);
        }
      }
      
      setOutfitItems(loadedItems);
      setNextZIndex(maxZ + 1);
      
      toast.success('Outfit loaded successfully!');
    } catch (error) {
      console.error('Error loading outfit:', error);
      toast.error('Failed to load outfit');
    } finally {
      setIsLoadingOutfit(false);
    }
  };

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
            { threshold: 0.01, rootMargin: '100px' }
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

  const outfitContainsClothingItem = useCallback((clothingItemId: string) => {
    return outfitItems.some(outfitItem => outfitItem.clothingId === clothingItemId);
  }, [outfitItems]);

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
      item.id === selectedItemId ? { ...item, zIndex: nextZIndex } : item
    ));
    setNextZIndex(prev => prev + 1);
  }, [selectedItemId, nextZIndex, selectedItemZInfo.isHighest]);

  const moveSelectedToBack = useCallback(() => {
    if (!selectedItemId || selectedItemZInfo.isLowest) return;
    
    const minZIndex = Math.min(...outfitItems.map(item => item.zIndex));
    setOutfitItems(prev => prev.map(item => 
      item.id === selectedItemId ? { ...item, zIndex: minZIndex - 1 } : item
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
    setEditingOutfit(null);
    
    router.push('/outfit');
  }, [router]);

  const captureCanvasAsImage = async (): Promise<Blob> => {
    const canvasElement = document.getElementById('canvas');
    if (!canvasElement) {
      throw new Error('Canvas element not found');
    }

    if (outfitItems.length === 0) {
      throw new Error('No items on canvas');
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    outfitItems.forEach(item => {
      const left = item.x;
      const top = item.y;
      const right = left + (item.width || 128);
      const bottom = top + (item.height || 160);
      
      minX = Math.min(minX, left);
      minY = Math.min(minY, top);
      maxX = Math.max(maxX, right);
      maxY = Math.max(maxY, bottom);
    });

    const padding = 20;
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(canvasElement.clientWidth, maxX + padding);
    maxY = Math.min(canvasElement.clientHeight, maxY + padding);

    const canvas = await html2canvas(canvasElement, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      imageTimeout: 0,
      removeContainer: true,
    });

    const croppedCanvas = document.createElement('canvas');
    const width = maxX - minX;
    const height = maxY - minY;
    
    croppedCanvas.width = width * 2;
    croppedCanvas.height = height * 2;
    
    const ctx = croppedCanvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    ctx.drawImage(
      canvas,
      minX * 2,
      minY * 2,
      width * 2,
      height * 2,
      0,
      0,
      width * 2,
      height * 2
    );

    return new Promise((resolve, reject) => {
      croppedCanvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      }, 'image/png', 1.0);
    });
  };

  const saveOutfit = async () => {
    if (outfitItems.length === 0 || isSaving) return;

    setIsSaving(true);
    
    const previousSelectedItem = selectedItemId;
    setSelectedItemId(null);

    await new Promise(resolve => setTimeout(resolve, 150));

    try {
      const imageBlob = await captureCanvasAsImage();
      const outfitImageFile = new File([imageBlob], 'outfit.png', { type: 'image/png' });

      const canvasElement = document.getElementById('canvas');
      if (!canvasElement) {
        throw new Error('Canvas element not found');
      }

      const canvasWidth = canvasElement.clientWidth;
      const canvasHeight = canvasElement.clientHeight;

      const clothingItemsData: OutfitClothingItemDTO[] = outfitItems.map(item => ({
        clothingItemId: item.clothingId,
        positionXPercent: (item.x / canvasWidth) * 100,
        positionYPercent: (item.y / canvasHeight) * 100,
        widthPercent: ((item.width || 128) / canvasWidth) * 100,
        heightPercent: ((item.height || 160) / canvasHeight) * 100,
        zIndex: item.zIndex,
      }));

      if (editingOutfit && outfitId) {
        await outfitApi.updateOutfit({
          outfitId: outfitId,
          outfitImageFile,
          clothingItems: clothingItemsData,
        });
        toast.success('Outfit updated successfully!');
      } else {
        await outfitApi.createOutfit({
          outfitImageFile,
          clothingItems: clothingItemsData,
        });
        toast.success('Outfit saved successfully!');
      }
      
      clearOutfit();
    } catch (error) {
      console.error('Error saving outfit:', error);
      toast.error(`Failed to ${editingOutfit ? 'update' : 'save'} outfit. Please try again.`);
      setSelectedItemId(previousSelectedItem);
    } finally {
      setIsSaving(false);
    }
  };

  const activeDragItem = activeId ? getItemById(activeId) : null;
  const isEditMode = !!editingOutfit && !!outfitId;

  if (isLoadingOutfit) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-fitted-blue-accent" />
          <p className="text-lg text-fitted-gray-600">Loading outfit...</p>
        </div>
      </div>
    );
  }

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
            {isEditMode && (
              <div className="mt-2 px-3 py-1.5 bg-fitted-blue-accent/10 text-fitted-blue-accent rounded-md text-sm font-medium">
                Editing Outfit
              </div>
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
            <h1 className="text-2xl font-semibold text-fitted-gray-900">
              {isEditMode ? 'Edit Outfit' : 'Outfit Canvas'}
            </h1>
            
            <div className="flex items-center gap-4">
              <div className="flex gap-2 p-1 bg-fitted-gray-100 rounded-lg">
                <Button
                  onClick={deleteSelectedItem}
                  disabled={!selectedItemId}
                  size="sm"
                  variant="destructive"
                  className="h-8 w-8 p-0"
                  title="Delete selected item"
                >
                  <Trash2 size={16} />
                </Button>
                <Button
                  onClick={moveSelectedToFront}
                  disabled={!selectedItemId || selectedItemZInfo.isHighest}
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                  title="Move to front"
                >
                  <MoveUp size={16} />
                </Button>
                <Button
                  onClick={moveSelectedToBack}
                  disabled={!selectedItemId || selectedItemZInfo.isLowest}
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                  title="Move to back"
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

              <Button
                onClick={saveOutfit}
                disabled={outfitItems.length === 0 || isSaving}
                variant="default"
                size="sm"
                className="bg-fitted-blue-accent hover:bg-blue-700 text-white"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isEditMode ? 'Updating...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditMode ? 'Update Outfit' : 'Save Outfit'}
                  </>
                )}
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