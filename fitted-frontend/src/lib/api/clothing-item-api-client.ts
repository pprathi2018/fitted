import { apiClient } from './api-client';
import { ClothingItem } from '@/types/clothing';

export interface CreateClothingItemRequest {
  name: string;
  type: 'top' | 'bottom' | 'shoes' | 'accessory' | 'dress' | 'outerwear';
  originalImageFile: File;
  modifiedImageFile?: File;
  color?: string;
}

export interface ClothingItemResponse {
  id: string;
  name: string;
  type: string;
  original_image_url: string;
  modified_image_url?: string;
  color?: string;
  created_at: string;
  userId: string;
}

export interface SearchClothingItemsRequest {
  search?: {
    searchText?: string;
    searchIn?: string[];
  };
  filter?: {
    filters?: Array<{
      attribute: string;
      valueList?: string[];
      value?: string;
    }>;
  };
  sort?: {
    sortBy: 'createdAt' | 'name';
    sortOrder: 'ASCENDING' | 'DESCENDING';
  };
  page: number;
  maxSize: number;
}

export interface SearchClothingItemsResponse {
  items: ClothingItemResponse[];
  totalCount: number;
  hasNext: boolean;
}

export type ClothingType = 'top' | 'bottom' | 'shoes' | 'accessory' | 'dress' | 'outerwear';

export const CLOTHING_TYPES: ClothingType[] = ['top', 'bottom', 'dress', 'outerwear', 'shoes', 'accessory'];

export const CLOTHING_TYPE_LABELS: Record<ClothingType, string> = {
  top: 'Tops',
  bottom: 'Bottoms',
  dress: 'Dresses',
  outerwear: 'Outerwear',
  shoes: 'Shoes',
  accessory: 'Accessories',
};

export class ClothingApiService {
  async createClothingItem(request: CreateClothingItemRequest): Promise<ClothingItemResponse> {
    const formData = new FormData();
    formData.append('name', request.name);
    formData.append('type', request.type.toUpperCase());
    formData.append('originalImageFile', request.originalImageFile);
    
    if (request.modifiedImageFile) {
      formData.append('modifiedImageFile', request.modifiedImageFile);
    }
    
    if (request.color) {
      formData.append('color', request.color);
    }

    const response = await apiClient.request<ClothingItemResponse>(
      '/api/v1/clothing-items',
      {
        method: 'POST',
        body: formData,
        headers: {
        },
      }
    );

    return response;
  }

  async searchClothingItems(request: SearchClothingItemsRequest): Promise<SearchClothingItemsResponse> {
    const response = await apiClient.post<SearchClothingItemsResponse>(
      '/api/v1/clothing-items/search',
      request
    );
    return response;
  }

  async getClothingItem(clothingItemId: string): Promise<ClothingItemResponse> {
    const response = await apiClient.get<ClothingItemResponse>(
      `/api/v1/clothing-items?clothingItemId=${clothingItemId}`
    );
    return response;
  }

  async deleteClothingItem(clothingItemId: string): Promise<void> {
    await apiClient.delete(`/api/v1/clothing-items?clothingItemId=${clothingItemId}`);
  }

  convertToClothingItem(response: ClothingItemResponse): ClothingItem {
    return {
      id: response.id,
      name: response.name,
      image: response.modified_image_url || response.original_image_url,
      category: response.type.toLowerCase() as ClothingItem['category'],
      uploadedAt: new Date(response.created_at),
    };
  }
}

export const clothingApi = new ClothingApiService();