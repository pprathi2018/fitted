import { useState, useEffect, useCallback, useRef } from 'react';
import {
  outfitApi,
  SearchOutfitsRequest,
  OutfitResponse,
} from '@/lib/api/outfit-api-client';

interface UseOutfitsReturn {
  items: OutfitResponse[];
  displayedItems: OutfitResponse[];
  isInitialLoading: boolean;
  isFilterLoading: boolean;
  hasMore: boolean;
  error: string | null;
  
  currentRequest: SearchOutfitsRequest;
  
  search: (request: Partial<SearchOutfitsRequest>) => Promise<void>;
  loadMore: () => void;
  deleteItem: (outfitId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const INITIAL_DISPLAY_COUNT = 25;
const ITEMS_PER_PAGE = 50;
const LOAD_MORE_THRESHOLD = 5;

export function useOutfits(): UseOutfitsReturn {
  const [items, setItems] = useState<OutfitResponse[]>([]);
  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY_COUNT);
  const [hasMore, setHasMore] = useState(true);
  
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const nextPageRef = useRef(1);
  
  const [currentRequest, setCurrentRequest] = useState<SearchOutfitsRequest>({
    page: 0,
    maxSize: ITEMS_PER_PAGE,
    sort: {
      sortBy: 'createdAt',
      sortOrder: 'DESCENDING'
    }
  });

  const fetchItems = useCallback(async (request: SearchOutfitsRequest, append = false) => {
    try {
      const response = await outfitApi.searchOutfits(request);
      
      if (append) {
        setItems(prev => [...prev, ...response.items]);
      } else {
        setItems(response.items);
        setDisplayCount(INITIAL_DISPLAY_COUNT);
        nextPageRef.current = 1;
      }
      
      setHasMore(response.hasNext);
      setError(null);
      
      return response;
    } catch (err) {
      console.error('Failed to fetch outfits:', err);
      setError('Failed to load outfits. Please try again.');
      throw err;
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    
    const loadInitial = async () => {
      if (!mounted) return;
      setIsInitialLoading(true);
      
      try {
        const response = await fetchItems(currentRequest);
        
        if (mounted && response.hasNext) {
          fetchItems({ ...currentRequest, page: 1 }, true).catch(console.error);
        }
      } catch (err) {
      } finally {
        if (mounted) {
          setIsInitialLoading(false);
        }
      }
    };
    
    loadInitial();
    
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const search = useCallback(async (partialRequest: Partial<SearchOutfitsRequest>) => {
    const newRequest: SearchOutfitsRequest = {
      ...currentRequest,
      ...partialRequest,
      page: 0,
      maxSize: ITEMS_PER_PAGE,
    };
    
    if (partialRequest.search !== undefined) {
      newRequest.search = partialRequest.search;
    }
    if (partialRequest.filter !== undefined) {
      newRequest.filter = partialRequest.filter;
    }
    if (partialRequest.sort !== undefined) {
      newRequest.sort = { ...currentRequest.sort, ...partialRequest.sort };
    }
    
    setCurrentRequest(newRequest);
    setIsFilterLoading(true);
    nextPageRef.current = 1;
    
    try {
      const response = await fetchItems(newRequest);
      
      if (response.hasNext) {
        fetchItems({ ...newRequest, page: 1 }, true).catch(console.error);
      }
    } catch (err) {
    } finally {
      setIsFilterLoading(false);
    }
  }, [currentRequest, fetchItems]);

  const loadMore = useCallback(() => {
    const currentDisplayCount = displayCount;
    const totalLoaded = items.length;
    
    if (currentDisplayCount < totalLoaded) {
      const newDisplayCount = Math.min(currentDisplayCount + INITIAL_DISPLAY_COUNT, totalLoaded);
      setDisplayCount(newDisplayCount);
      
      if (totalLoaded - newDisplayCount <= LOAD_MORE_THRESHOLD && hasMore) {
        const nextRequest = { ...currentRequest, page: nextPageRef.current };
        fetchItems(nextRequest, true).then(() => {
          nextPageRef.current += 1;
        }).catch(console.error);
      }
    } else if (hasMore) {
      const nextRequest = { ...currentRequest, page: nextPageRef.current };
      fetchItems(nextRequest, true).then(() => {
        nextPageRef.current += 1;
        setDisplayCount(prev => prev + INITIAL_DISPLAY_COUNT);
      }).catch(console.error);
    }
  }, [displayCount, items.length, hasMore, fetchItems, currentRequest]);

  const deleteItem = useCallback(async (outfitId: string) => {
    try {
      await outfitApi.deleteOutfit(outfitId);
      setItems(prev => prev.filter(item => item.id !== outfitId));
    } catch (err) {
      console.error('Failed to delete outfit:', err);
      setError('Failed to delete outfit. Please try again.');
      throw err;
    }
  }, []);

  const refresh = useCallback(async () => {
    setIsFilterLoading(true);
    try {
      await fetchItems(currentRequest);
    } catch (err) {
    } finally {
      setIsFilterLoading(false);
    }
  }, [fetchItems, currentRequest]);

  return {
    items,
    displayedItems: items.slice(0, displayCount),
    isInitialLoading,
    isFilterLoading,
    hasMore: displayCount < items.length || hasMore,
    error,
    currentRequest,
    search,
    loadMore,
    deleteItem,
    refresh,
  };
}