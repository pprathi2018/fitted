import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  clothingApi, 
  ClothingItemResponse,
  ClothingType,
  CLOTHING_TYPES
} from '@/lib/api/clothing-item-api-client';

interface ClothingTypeSection {
  type: ClothingType;
  items: ClothingItemResponse[];
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  page: number;
  error?: string;
  totalCount: number;
}

interface UseClothingItemsByTypeReturn {
  sections: ClothingTypeSection[];
  isInitialLoading: boolean;
  loadMoreForType: (type: ClothingType) => Promise<void>;
  retryForType: (type: ClothingType) => Promise<void>;
  getItemById: (id: string) => ClothingItemResponse | undefined;
}

const ITEMS_PER_PAGE = 20;

export function useClothingItemsByType(): UseClothingItemsByTypeReturn {
  const [sections, setSections] = useState<ClothingTypeSection[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const loadingRef = useRef<Set<ClothingType>>(new Set());
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    loadInitialData();
    
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadInitialData = async () => {
    setIsInitialLoading(true);

    const promises = CLOTHING_TYPES.map(type => 
      fetchItemsForType(type, 0).then(result => ({
        type,
        result
      }))
    );

    const results = await Promise.allSettled(promises);

    if (!mountedRef.current) return;

    const newSections: ClothingTypeSection[] = [];

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        const { type, result: fetchResult } = result.value;
        
        if (fetchResult.success && fetchResult.data) {
          if (fetchResult.data.items.length > 0) {
            newSections.push({
              type,
              items: fetchResult.data.items,
              hasMore: fetchResult.data.hasNext,
              isLoading: false,
              isLoadingMore: false,
              page: 0,
              totalCount: fetchResult.data.totalCount
            });
          }
        } else if (fetchResult.error) {
          newSections.push({
            type,
            items: [],
            hasMore: false,
            isLoading: false,
            isLoadingMore: false,
            page: 0,
            error: fetchResult.error,
            totalCount: 0
          });
        }
      }
    });

    const typeOrder = ['top', 'bottom', 'dress', 'outerwear', 'shoes', 'accessory'];
    newSections.sort((a, b) => 
      typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type)
    );

    setSections(newSections);
    setIsInitialLoading(false);
  };

  const fetchItemsForType = async (
    type: ClothingType, 
    page: number
  ): Promise<{ 
    success: boolean; 
    data?: { items: ClothingItemResponse[]; hasNext: boolean; totalCount: number };
    error?: string;
  }> => {
    try {
      const response = await clothingApi.searchClothingItems({
        filter: {
          filters: [{
            attribute: 'type',
            valueList: [type.toUpperCase()]
          }]
        },
        sort: {
          sortBy: 'createdAt',
          sortOrder: 'DESCENDING'
        },
        page,
        maxSize: ITEMS_PER_PAGE
      });

      return {
        success: true,
        data: {
          items: response.items,
          hasNext: response.hasNext,
          totalCount: response.totalCount
        }
      };
    } catch (error) {
      console.error(`Failed to fetch ${type} items:`, error);
      return {
        success: false,
        error: `Failed to load ${type} items`
      };
    }
  };

  const loadMoreForType = useCallback(async (type: ClothingType) => {
    if (loadingRef.current.has(type)) return;
    
    const section = sections.find(s => s.type === type);
    if (!section || !section.hasMore || section.isLoadingMore) return;

    loadingRef.current.add(type);

    setSections(prev => prev.map(s => 
      s.type === type 
        ? { ...s, isLoadingMore: true, error: undefined }
        : s
    ));

    try {
      const nextPage = section.page + 1;
      const result = await fetchItemsForType(type, nextPage);

      if (!mountedRef.current) return;

      if (result.success && result.data) {
        setSections(prev => prev.map(s => 
          s.type === type 
            ? {
                ...s,
                items: [...s.items, ...result.data!.items],
                hasMore: result.data!.hasNext,
                isLoadingMore: false,
                page: nextPage,
                totalCount: result.data!.totalCount
              }
            : s
        ));
      } else {
        setSections(prev => prev.map(s => 
          s.type === type 
            ? { ...s, isLoadingMore: false, error: result.error }
            : s
        ));
      }
    } finally {
      loadingRef.current.delete(type);
    }
  }, [sections]);

  const retryForType = useCallback(async (type: ClothingType) => {
    const section = sections.find(s => s.type === type);
    if (!section) return;

    setSections(prev => prev.map(s => 
      s.type === type 
        ? { ...s, isLoading: true, error: undefined }
        : s
    ));

    const result = await fetchItemsForType(type, section.page);

    if (!mountedRef.current) return;

    if (result.success && result.data) {
      setSections(prev => prev.map(s => 
        s.type === type 
          ? {
              ...s,
              items: section.page === 0 
                ? result.data!.items 
                : [...s.items, ...result.data!.items],
              hasMore: result.data!.hasNext,
              isLoading: false,
              totalCount: result.data!.totalCount
            }
          : s
      ));
    } else {
      setSections(prev => prev.map(s => 
        s.type === type 
          ? { ...s, isLoading: false, error: result.error }
          : s
      ));
    }
  }, [sections]);

  const getItemById = useCallback((id: string): ClothingItemResponse | undefined => {
    for (const section of sections) {
      const item = section.items.find(item => item.id === id);
      if (item) return item;
    }
    return undefined;
  }, [sections]);

  return {
    sections,
    isInitialLoading,
    loadMoreForType,
    retryForType,
    getItemById
  };
}