'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useClothingItems } from '@/hooks/useClothingItems';
import { useOutfits } from '@/hooks/useOutfits';
import { ClothingItemResponse, ClothingType } from '@/lib/api/clothing-item-api-client';
import { OutfitResponse, outfitApi } from '@/lib/api/outfit-api-client';
import ClothingItemCard from './ClothingItemCard';
import ClothingItemModal from './ClothingItemModal';
import OutfitCard from './OutfitCard';
import OutfitModal from './OutfitModal';
import SearchBar from './search/SearchBar';
import FilterButton from './search/FilterButton';
import FilterModal from './search/FilterModal';
import GlobalLoader from './GlobalLoader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import toast from 'react-hot-toast';

const ClosetView = () => {
  const router = useRouter();
  
  const {
    displayedItems: clothingItems,
    isInitialLoading: isLoadingClothing,
    isFilterLoading,
    hasMore: hasMoreClothing,
    error: clothingError,
    currentRequest,
    search,
    loadMore: loadMoreClothing,
    deleteItem: deleteClothingItem,
  } = useClothingItems();

  const {
    displayedItems: outfits,
    isInitialLoading: isLoadingOutfits,
    hasMore: hasMoreOutfits,
    error: outfitError,
    currentRequest: outfitCurrentRequest,
    search: searchOutfits,
    loadMore: loadMoreOutfits,
    deleteItem: deleteOutfit,
  } = useOutfits();

  const [selectedClothingItem, setSelectedClothingItem] = useState<ClothingItemResponse | null>(null);
  const [isClothingModalOpen, setIsClothingModalOpen] = useState(false);
  const [selectedOutfit, setSelectedOutfit] = useState<OutfitResponse | null>(null);
  const [isOutfitModalOpen, setIsOutfitModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'clothing' | 'outfits'>('clothing');
  
  const clothingObserverTarget = useRef<HTMLDivElement>(null);
  const outfitObserverTarget = useRef<HTMLDivElement>(null);

  const getCurrentFilters = useCallback(() => {
    const typeFilter = currentRequest.filter?.filters?.find(f => f.attribute === 'type');
    const types = typeFilter?.valueList?.map(t => t.toLowerCase() as ClothingType) || [];
    
    return {
      types,
      sortBy: currentRequest.sort?.sortBy || 'createdAt',
      sortOrder: currentRequest.sort?.sortOrder || 'DESCENDING',
      searchText: currentRequest.search?.searchText || '',
    };
  }, [currentRequest]);

  const getCurrentOutfitSearch = useCallback(() => {
    return {
      searchText: outfitCurrentRequest.search?.searchText || '',
      sortBy: outfitCurrentRequest.sort?.sortBy || 'createdAt',
      sortOrder: outfitCurrentRequest.sort?.sortOrder || 'DESCENDING',
    };
  }, [outfitCurrentRequest]);

  const currentFilters = getCurrentFilters();
  const currentOutfitSearch = getCurrentOutfitSearch();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreClothing && !isFilterLoading && activeTab === 'clothing') {
          loadMoreClothing();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (clothingObserverTarget.current) {
      observer.observe(clothingObserverTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMoreClothing, isFilterLoading, loadMoreClothing, activeTab]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreOutfits && activeTab === 'outfits') {
          loadMoreOutfits();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (outfitObserverTarget.current) {
      observer.observe(outfitObserverTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMoreOutfits, loadMoreOutfits, activeTab]);

  const handleClothingSearch = (searchText: string) => {
    search({
      search: searchText ? { searchText } : undefined,
    });
  };

  const handleOutfitSearch = (searchText: string) => {
    searchOutfits({
      search: searchText ? { 
        searchText,
        searchIn: ['tags'] // Search in tags for outfits
      } : undefined,
    });
  };

  const handleApplyFilters = (filters: {
    types: ClothingType[];
    sortBy: 'createdAt' | 'name';
    sortOrder: 'ASCENDING' | 'DESCENDING';
  }) => {
    search({
      filter: filters.types.length > 0 ? {
        filters: [{
          attribute: 'type',
          valueList: filters.types.map(t => t.toUpperCase()),
        }],
      } : undefined,
      sort: {
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      },
    });
  };

  const handleDeleteClothingItem = async (itemId: string) => {
    try {
      await deleteClothingItem(itemId);
      if (selectedClothingItem?.id === itemId) {
        handleCloseClothingModal();
      }
      toast.success('Clothing item deleted from your closet!');
    } catch (err) {
      toast.error('Failed to delete clothing item. Please try again.');
    }
  };

  const handleClothingItemClick = (item: ClothingItemResponse) => {
    setSelectedClothingItem(item);
    setIsClothingModalOpen(true);
  };

  const handleCloseClothingModal = () => {
    setIsClothingModalOpen(false);
    setTimeout(() => setSelectedClothingItem(null), 300);
  };

  const handleOutfitClick = async (outfit: OutfitResponse) => {
    try {
      const fullOutfit = await outfitApi.getOutfit(outfit.id);
      setSelectedOutfit(fullOutfit);
      setIsOutfitModalOpen(true);
    } catch (err) {
      toast.error('Internal error while getting outfit');
    }
  };

  const handleCloseOutfitModal = () => {
    setIsOutfitModalOpen(false);
    setTimeout(() => setSelectedOutfit(null), 300);
  };

  const handleDeleteOutfit = async (outfitId: string) => {
    try {
      await deleteOutfit(outfitId);
      toast.success('Outfit deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete outfit. Please try again.');
    }
  };

  const handleEditOutfit = (outfit: OutfitResponse) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('editingOutfit', JSON.stringify(outfit));
    }
    router.push(`/outfit?outfitId=${outfit.id}`);
  };

  const activeFilterCount = 
    currentFilters.types.length + 
    (currentFilters.sortBy !== 'createdAt' || currentFilters.sortOrder !== 'DESCENDING' ? 1 : 0);

  if (isLoadingClothing || isLoadingOutfits) {
    return <GlobalLoader />;
  }

  return (
    <div className="max-w-7xl mx-auto px-8">
      <h1 className="text-4xl font-bold text-fitted-gray-900 text-center mb-8">
        Your Closet
      </h1>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'clothing' | 'outfits')} className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
          <TabsTrigger value="clothing">Clothing Items</TabsTrigger>
          <TabsTrigger value="outfits">Outfits</TabsTrigger>
        </TabsList>

        <TabsContent value="clothing" className="space-y-6">
          <div className="flex gap-4">
            <SearchBar
              initialValue={currentFilters.searchText}
              onSearch={handleClothingSearch}
              className="flex-1"
              placeholder="Search clothing items..."
            />
            <FilterButton
              onClick={() => setIsFilterModalOpen(true)}
              activeFilterCount={activeFilterCount}
            />
          </div>

          {clothingError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{clothingError}</AlertDescription>
            </Alert>
          )}

          {(currentFilters.types.length > 0 || currentFilters.searchText) && (
            <div className="flex flex-wrap gap-2">
              {currentFilters.searchText && (
                <div className="px-3 py-1 bg-fitted-blue-accent/10 text-fitted-blue-accent rounded-full text-sm font-medium">
                  Search: "{currentFilters.searchText}"
                </div>
              )}
              {currentFilters.types.map(type => (
                <div key={type} className="px-3 py-1 bg-fitted-blue-accent/10 text-fitted-blue-accent rounded-full text-sm font-medium capitalize">
                  {type}
                </div>
              ))}
            </div>
          )}

          {clothingItems.length === 0 ? (
            <div className="text-center py-16">
              {!isLoadingClothing && (currentFilters.searchText || currentFilters.types.length > 0) ? (
                <>
                  <p className="text-xl text-fitted-gray-600 mb-2">No items found</p>
                  <p className="text-fitted-gray-500">
                    Try adjusting your filters or search terms
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xl text-fitted-gray-600 mb-2">Your closet is empty.</p>
                  <p className="text-fitted-gray-500">
                    Start by uploading some clothing items to build your wardrobe!
                  </p>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {clothingItems.map((item) => (
                  <ClothingItemCard
                    key={item.id}
                    item={item}
                    onDelete={handleDeleteClothingItem}
                    onClick={handleClothingItemClick}
                  />
                ))}
              </div>

              {hasMoreClothing && (
                <div ref={clothingObserverTarget} className="h-20 flex items-center justify-center" />
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="outfits" className="space-y-6">
          <div className="flex gap-4">
            <SearchBar
              initialValue={currentOutfitSearch.searchText}
              onSearch={handleOutfitSearch}
              className="flex-1"
              placeholder="Search outfits by tags..."
            />
          </div>

          {outfitError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{outfitError}</AlertDescription>
            </Alert>
          )}

          {currentOutfitSearch.searchText && (
            <div className="flex flex-wrap gap-2">
              <div className="px-3 py-1 bg-fitted-blue-accent/10 text-fitted-blue-accent rounded-full text-sm font-medium">
                Searching tags: "{currentOutfitSearch.searchText}"
              </div>
            </div>
          )}

          {outfits.length === 0 ? (
            <div className="text-center py-16">
              {currentOutfitSearch.searchText ? (
                <>
                  <p className="text-xl text-fitted-gray-600 mb-2">No outfits found</p>
                  <p className="text-fitted-gray-500">
                    No outfits match the tag "{currentOutfitSearch.searchText}"
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xl text-fitted-gray-600 mb-2">No outfits yet.</p>
                  <p className="text-fitted-gray-500">
                    Start by creating outfits on the outfit canvas!
                  </p>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {outfits.map((outfit) => (
                  <OutfitCard
                    key={outfit.id}
                    outfit={outfit}
                    onDelete={handleDeleteOutfit}
                    onClick={handleOutfitClick}
                  />
                ))}
              </div>

              {hasMoreOutfits && (
                <div ref={outfitObserverTarget} className="h-20 flex items-center justify-center" />
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilters}
        currentFilters={{
          types: currentFilters.types,
          sortBy: currentFilters.sortBy as 'createdAt' | 'name',
          sortOrder: currentFilters.sortOrder as 'ASCENDING' | 'DESCENDING',
        }}
      />

      <ClothingItemModal
        item={selectedClothingItem}
        isOpen={isClothingModalOpen}
        onClose={handleCloseClothingModal}
        onDelete={handleDeleteClothingItem}
      />

      <OutfitModal
        outfit={selectedOutfit}
        isOpen={isOutfitModalOpen}
        onClose={handleCloseOutfitModal}
        onDelete={handleDeleteOutfit}
        onEdit={handleEditOutfit}
      />
    </div>
  );
};

export default ClosetView;