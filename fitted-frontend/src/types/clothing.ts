export interface ClothingItem {
  id: string;
  name: string;
  image: string; // base64 encoded image
  category: 'top' | 'bottom' | 'shoes' | 'accessory' | 'dress' | 'outerwear';
  uploadedAt: Date;
}

export interface OutfitItem {
  id: string;
  clothingId: string;
  x: number;
  y: number;
  zIndex: number;
  width?: number;  // Optional, defaults to 128px
  height?: number; // Optional, defaults to 160px
}

export interface Outfit {
  id: string;
  name: string;
  items: OutfitItem[];
  createdAt: Date;
}