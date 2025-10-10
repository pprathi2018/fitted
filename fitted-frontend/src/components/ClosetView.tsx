'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useClothingItems } from '@/hooks/useClothingItems';
import { ClothingItemResponse, ClothingType } from '@/lib/api/clothing-item-api-client';
import ClothingItemCard from './ClothingItemCard';
import ClothingItemModal from './ClothingItemModal';
import SearchBar from './search/SearchBar';
import FilterButton from './search/FilterButton';
import FilterModal from './search/FilterModal';
import GlobalLoader from './GlobalLoader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ClosetView = () => {
  const {
    displayedItems,
    isInitialLoading,
    isFilterLoading,
    hasMore,
    error,
    currentRequest,
    search,
    loadMore,
    deleteItem,
    refresh,
  } = useClothingItems();

  const [selectedItem, setSelectedItem] = useState<ClothingItemResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  
  const observerTarget = useRef<HTMLDivElement>(null);

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

  const currentFilters = getCurrentFilters();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFilterLoading) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isFilterLoading, loadMore]);

  const handleSearch = (searchText: string) => {
    search({
      search: searchText ? { searchText } : undefined,
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

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteItem(itemId);
      if (selectedItem?.id === itemId) {
        handleCloseModal();
      }

      toast.success(`Clothing item deleted from your closet!`);

    } catch (err) {
    }
  };

  const handleItemClick = (item: ClothingItemResponse) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedItem(null), 300);
  };

  const activeFilterCount = 
    currentFilters.types.length + 
    (currentFilters.sortBy !== 'createdAt' || currentFilters.sortOrder !== 'DESCENDING' ? 1 : 0);

  if (isInitialLoading) {
    return <GlobalLoader />;
  }

  return (
    <div className="max-w-7xl mx-auto px-8">
      <h1 className="text-4xl font-bold text-fitted-gray-900 text-center mb-8">
        Your Closet
      </h1>
      
      <div className="flex gap-4 mb-8">
        <SearchBar
          initialValue={currentFilters.searchText}
          onSearch={handleSearch}
          className="flex-1"
        />
        <FilterButton
          onClick={() => setIsFilterModalOpen(true)}
          activeFilterCount={activeFilterCount}
        />
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {(currentFilters.types.length > 0 || currentFilters.searchText) && (
        <div className="flex flex-wrap gap-2 mb-6">
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

      {displayedItems.length === 0 ? (
        <div className="text-center py-16">
          {!isInitialLoading && (currentFilters.searchText || currentFilters.types.length > 0) ? (
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
            {displayedItems.map((item) => (
              <ClothingItemCard
                key={item.id}
                item={item}
                onDelete={handleDeleteItem}
                onClick={handleItemClick}
              />
            ))}
          </div>

          {hasMore && (
            <div ref={observerTarget} className="h-20 flex items-center justify-center">
            </div>
          )}
        </>
      )}

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
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onDelete={handleDeleteItem}
      />
    </div>
  );
};

export default ClosetView;