
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

class ClothingApiService {
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

  convertToClothingItem(response: ClothingItemResponse): ClothingItem {
    return {
      id: response.id,
      name: response.name,
      image: response.modified_image_url!,
      category: response.type.toLowerCase() as ClothingItem['category'],
      uploadedAt: new Date(response.created_at),
    };
  }
}

export const clothingApi = new ClothingApiService();