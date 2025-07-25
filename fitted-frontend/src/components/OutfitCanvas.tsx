'use client';

import { useState, useCallback, useMemo } from 'react';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Trash2, MoveUp, MoveDown, ChevronDown, ChevronUp } from 'lucide-react';
import { ClothingItem as ClothingItemType, OutfitItem } from '@/types/clothing';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import ClothingItemSidePanel from './ClothingItemSidePanel';
import CanvasImage from './CanvasImage';

const OutfitCanvas = () => {
  const [clothingItems] = useLocalStorage<ClothingItemType[]>('clothing-items', []);
  const [outfitItems, setOutfitItems] = useState<OutfitItem[]>([]);
  const [nextZIndex, setNextZIndex] = useState(1);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const groupedItems = useMemo(() => {
    return clothingItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, ClothingItemType[]>);
  }, [clothingItems]);

  function outfitContainsClothingItem(clothingItemId: string) {
    return outfitItems.some(outfitItem => outfitItem.clothingId === clothingItemId);
  }

  const handleItemSelect = useCallback((itemId: string) => {
    setSelectedItemId(prevSelected => prevSelected === itemId ? null : itemId);
  }, []);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isCanvasBackground = target.classList.contains('canvas-dropzone') || 
                              target.classList.contains('canvas-placeholder') ||
                              target.classList.contains('canvas-placeholder-text');
    
    if (isCanvasBackground) {
      setSelectedItemId(null);
    }
  }, []);

  const handleItemDragStop = useCallback((itemId: string, x: number, y: number) => {
    setOutfitItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, x, y, zIndex: nextZIndex }
        : item
    ));
    setNextZIndex(prev => prev + 1);
    setSelectedItemId(itemId);
  }, [nextZIndex]);

  const handleItemResizeStop = useCallback((itemId: string, width: number, height: number) => {
    setOutfitItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, width, height }
        : item
    ));
  }, []);

  const deleteSelectedItem = useCallback(() => {
    if (!selectedItemId) return;
    
    setOutfitItems(prev => prev.filter(item => item.id !== selectedItemId));
    setSelectedItemId(null);
  }, [selectedItemId]);

  const moveSelectedToFront = useCallback(() => {
    if (!selectedItemId) return;
    
    setOutfitItems(prev => prev.map(item => 
      item.id === selectedItemId 
        ? { ...item, zIndex: nextZIndex }
        : item
    ));
    setNextZIndex(prev => prev + 1);
  }, [selectedItemId, nextZIndex]);

  const moveSelectedToBack = useCallback(() => {
    if (!selectedItemId) return;
    
    const minZIndex = Math.min(...outfitItems.map(item => item.zIndex));
    setOutfitItems(prev => prev.map(item => 
      item.id === selectedItemId 
        ? { ...item, zIndex: minZIndex - 1 }
        : item
    ));
  }, [selectedItemId, outfitItems]);

  const toggleSection = useCallback((category: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  }, []);

  const CanvasDropZone = () => {
    const [{ isOver }, drop] = useDrop(() => ({
      accept: 'clothing-item',
      drop: (draggedItem: any, monitor) => {
        const offset = monitor.getClientOffset();
        const canvasRect = document.getElementById('canvas')?.getBoundingClientRect();
        
        if (offset && canvasRect && !draggedItem.fromCanvas) {
          if (!outfitContainsClothingItem(draggedItem.id)) {
            const x = offset.x - canvasRect.left - 64;
            const y = offset.y - canvasRect.top - 80;
            const constrainedX = Math.max(0, Math.min(x, canvasRect.width - 128));
            const constrainedY = Math.max(0, Math.min(y, canvasRect.height - 160));
            
            const newOutfitItem: OutfitItem = {
              id: `${draggedItem.id}-${Date.now()}`,
              clothingId: draggedItem.id,
              x: constrainedX,
              y: constrainedY,
              zIndex: nextZIndex,
              width: 128,
              height: 160
            };
            setOutfitItems(prev => [...prev, newOutfitItem]);
            setNextZIndex(prev => prev + 1);
            setSelectedItemId(newOutfitItem.id);
          }
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    }));

    return (
      <div
        ref={drop as any}
        id="canvas"
        className={`canvas-dropzone ${isOver ? 'drag-over' : ''}`}
        onClick={handleCanvasClick}
      >
        <div className="canvas-placeholder" onClick={handleCanvasClick}>
          {outfitItems.length === 0 ? (
            <p className="canvas-placeholder-text" onClick={handleCanvasClick}>
              Drag clothing items here to create your outfit
            </p>
          ) : null}
        </div>
        
        {outfitItems.map((outfitItem) => {
          const clothingItem = clothingItems.find(item => item.id === outfitItem.clothingId);
          if (!clothingItem) return null;
          
          return (
            <CanvasImage
              key={outfitItem.id}
              item={clothingItem}
              outfitItemId={outfitItem.id}
              isSelected={selectedItemId === outfitItem.id}
              position={{ x: outfitItem.x, y: outfitItem.y }}
              size={{ width: outfitItem.width || 128, height: outfitItem.height || 160 }}
              zIndex={outfitItem.zIndex}
              onSelect={handleItemSelect}
              onDragStop={handleItemDragStop}
              onResizeStop={handleItemResizeStop}
            />
          );
        })}
      </div>
    );
  };

  const clearOutfit = useCallback(() => {
    setOutfitItems([]);
    setNextZIndex(1);
    setSelectedItemId(null);
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="outfit-page flex">
        {/* Sidebar */}
        <div className="outfit-sidebar">
          <div className="sidebar-header">
            <h2 className="sidebar-title">Your Closet</h2>
            <p className="sidebar-subtitle">{clothingItems.length} items</p>
          </div>
          
          <div className="sidebar-content">
            {clothingItems.length === 0 ? (
              <div className="empty-closet">
                <p className="empty-closet-text">No clothing items yet.</p>
                <p className="empty-closet-subtext">
                  Go to the upload page to add some clothes!
                </p>
              </div>
            ) : (
              <div className="categories-container">
                {Object.entries(groupedItems).map(([category, items]) => (
                  <div key={category} className="category-section">
                    <button
                      className="category-header"
                      onClick={() => toggleSection(category)}
                    >
                      <h3 className="category-title">
                        {category} ({items.length})
                      </h3>
                      {collapsedSections[category] ? (
                        <ChevronDown className="category-chevron" />
                      ) : (
                        <ChevronUp className="category-chevron" />
                      )}
                    </button>
                    {!collapsedSections[category] && (
                      <div className="category-items-wrapper">
                        <div className="category-items-scroll">
                          {items.map((item) => (
                            <div key={item.id} className="category-item-container">
                              <ClothingItemSidePanel item={item} inOutfit={outfitContainsClothingItem(item.id)} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="canvas-area">
          <div className="canvas-header">
            <h1 className="canvas-title">Outfit Canvas</h1>
            <div className="canvas-header-right">
              <div className="canvas-actions-container">
                <button
                  onClick={deleteSelectedItem}
                  disabled={!selectedItemId}
                  className="canvas-action-btn canvas-action-delete"
                  title="Delete item"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={moveSelectedToFront}
                  disabled={!selectedItemId}
                  className="canvas-action-btn canvas-action-front"
                  title="Move to front"
                >
                  <MoveUp size={16} />
                </button>
                <button
                  onClick={moveSelectedToBack}
                  disabled={!selectedItemId}
                  className="canvas-action-btn canvas-action-back"
                  title="Move to back"
                >
                  <MoveDown size={16} />
                </button>
              </div>
              <button
                onClick={clearOutfit}
                disabled={outfitItems.length === 0}
                className="clear-button"
              >
                <Trash2 className="clear-icon" />
                <span>Clear Outfit</span>
              </button>
            </div>
          </div>
          
          <div className="canvas-container">
            <CanvasDropZone />
          </div>
          
          <div className="canvas-footer">
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
    </DndProvider>
  );
};

export default OutfitCanvas;