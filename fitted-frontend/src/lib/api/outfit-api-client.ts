import { apiClient } from './api-client';

export interface OutfitClothingItemDTO {
  clothingItemId: string;
  positionXPercent: number;
  positionYPercent: number;
  widthPercent: number;
  heightPercent: number;
  zIndex: number;
  modifiedImageUrl?: string;
}

export interface CreateOutfitRequest {
  outfitImageFile: File;
  clothingItems: OutfitClothingItemDTO[];
  tags?: string[];
}

export interface UpdateOutfitRequest {
  outfitId: string;
  outfitImageFile: File;
  clothingItems: OutfitClothingItemDTO[];
  tags?: string[];
}

export interface OutfitResponse {
  id: string;
  outfit_image_url: string;
  clothingItems?: OutfitClothingItemDTO[];
  createdAt: string;
  userId: string;
  tags?: string[];
}

export interface SearchOutfitsRequest {
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

export interface SearchOutfitsResponse {
  items: OutfitResponse[];
  totalCount: number;
  hasNext: boolean;
}

export class OutfitApiService {
  async createOutfit(request: CreateOutfitRequest): Promise<OutfitResponse> {
    const formData = new FormData();
    formData.append('outfitImageFile', request.outfitImageFile);
    formData.append('clothingItems', JSON.stringify(request.clothingItems));
    
    if (request.tags && request.tags.length > 0) {
      request.tags.forEach(tag => formData.append('tags', tag));
    }
  
    const response = await apiClient.request<OutfitResponse>(
      '/api/v1/outfits',
      {
        method: 'POST',
        body: formData,
        headers: {},
      }
    );
  
    return response;
  }

  async updateOutfit(request: UpdateOutfitRequest): Promise<OutfitResponse> {
    const formData = new FormData();
    formData.append('outfitImageFile', request.outfitImageFile);
    formData.append('clothingItems', JSON.stringify(request.clothingItems));
    
    if (request.tags && request.tags.length > 0) {
      request.tags.forEach(tag => formData.append('tags', tag));
    }
  
    const response = await apiClient.request<OutfitResponse>(
      `/api/v1/outfits?outfitId=${request.outfitId}`,
      {
        method: 'PUT',
        body: formData,
        headers: {},
      }
    );
  
    return response;
  }

  async searchOutfits(request: SearchOutfitsRequest): Promise<SearchOutfitsResponse> {
    const response = await apiClient.post<SearchOutfitsResponse>(
      '/api/v1/outfits/search',
      request
    );
    return response;
  }

  async getOutfit(outfitId: string): Promise<OutfitResponse> {
    const response = await apiClient.get<OutfitResponse>(
      `/api/v1/outfits?outfitId=${outfitId}`
    );
    return response;
  }

  async deleteOutfit(outfitId: string): Promise<void> {
    await apiClient.delete(`/api/v1/outfits?outfitId=${outfitId}`);
  }
}

export const outfitApi = new OutfitApiService();