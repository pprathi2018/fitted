'use client';

import { useState, useCallback, useEffect } from 'react';
import { Upload, X, Check, AlertCircle, RefreshCw, Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { ClothingItem } from '@/types/clothing';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { fittedButton } from '@/lib/styles';
import { cn } from '@/lib/utils';

const CLOTHING_CATEGORIES = [
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'dress', label: 'Dress' },
  { value: 'outerwear', label: 'Outerwear' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'accessory', label: 'Accessory' },
] as const;

const ImageUpload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ClothingItem['category']>('top');
  const [itemName, setItemName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [clothingItems, setClothingItems] = useLocalStorage<ClothingItem[]>('clothing-items', []);
  
  const [processingError, setProcessingError] = useState(false);
  const [lastFailedFile, setLastFailedFile] = useState<File | null>(null);

  useEffect(() => {
    const warmupAPI = async () => {
      try {
        await fetch('https://ncti3zqpfjz7ds3ug5sorxgffy0wcjhb.lambda-url.us-east-1.on.aws/warmup')
      } catch (error) {
        console.warn(`Error while warming up API: ${error}`)
      }
    }

    warmupAPI();
  }, []);

  const removeBackground = async (file: File) : Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('https://ncti3zqpfjz7ds3ug5sorxgffy0wcjhb.lambda-url.us-east-1.on.aws/api/remove-background', {
        method: 'POST',
        body: formData,
        mode: 'cors',
        credentials: 'omit',
      });

      if (!response.ok) {
        throw new Error(`Background removal API failed. Error status: ${response.status}`);
      }

      const blob = await response.blob();
      return blobToBase64(blob);
    } catch (error) {
      throw error;
    }
  }

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const processImage = useCallback((file: File) => {
    setIsProcessing(true);
    setProcessingError(false);

    removeBackground(file)
    .then((url) => {
      setUploadedImage(url);
      setProcessingError(false);
      setLastFailedFile(null);
    })
    .catch((error) => {
      setUploadedImage(null);
      setProcessingError(true);
      setLastFailedFile(file);
      console.error(error);
    })
    .finally(() => {
      setIsProcessing(false);
    })
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        processImage(file);
      }
    }
  }, [processImage]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        processImage(file);
      }
    }
  }, [processImage]);

  const handleRetry = () => {
    if (lastFailedFile) {
      processImage(lastFailedFile);
    }
  };

  const handleUploadNew = () => {
    setProcessingError(false);
    setLastFailedFile(null);
    setUploadedImage(null);
  };

  const saveToCloset = () => {
    if (!uploadedImage || !itemName.trim()) return;

    const newItem: ClothingItem = {
      id: uuidv4(),
      name: itemName.trim(),
      image: uploadedImage,
      category: selectedCategory,
      uploadedAt: new Date(),
    };

    setClothingItems([...clothingItems, newItem]);
    resetForm();
  };

  const resetForm = () => {
    setUploadedImage(null);
    setItemName('');
    setProcessingError(false);
    setLastFailedFile(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-fitted-gray-900 mb-8 text-center">
        Upload Clothing Item
      </h1>

      {!uploadedImage && !processingError ? (
        <div
          className={cn(
            "relative border-2 border-dashed rounded-lg p-12 text-center transition-all bg-fitted-gray-50",
            dragActive ? "border-fitted-blue-accent bg-blue-50" : "border-fitted-gray-300 hover:border-fitted-gray-400",
            isProcessing && "pointer-events-none opacity-60"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isProcessing}
          />
          
          {isProcessing ? (
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 animate-spin rounded-full border-2 border-fitted-blue-accent border-t-transparent mb-4" />
              <p className="text-lg text-fitted-gray-600">Processing image...</p>
              <p className="text-sm text-fitted-gray-500 mt-1">Removing background</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="h-12 w-12 text-fitted-gray-400 mb-4" />
              <p className="text-lg text-fitted-gray-600 mb-1">
                Drag and drop an image here, or click to select
              </p>
              <p className="text-sm text-fitted-gray-500">
                Upload photos from clothing websites or pictures of your own clothes
              </p>
            </div>
          )}
        </div>
      ) : processingError ? (
        <Card className="border-2 border-red-200 bg-red-50">
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-lg font-semibold text-red-900 mb-2">
              Image Processing Failed
            </p>
            <p className="text-sm text-red-700 mb-6">
              Failed to process image. Please try again.
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={handleRetry} 
                className={cn(fittedButton({ variant: "primary", size: "md" }))}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button 
                onClick={handleUploadNew}
                className={cn(fittedButton({ variant: "secondary", size: "md" }))}
              >
                <Plus className="h-4 w-4 mr-2" />
                Upload New Image
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-center mb-6">
              <img
                src={uploadedImage ?? undefined}
                alt="Uploaded clothing item"
                className="max-w-full max-h-64 object-contain rounded-lg"
              />
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="item-name">Item Name</Label>
                <Input
                  id="item-name"
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g., Blue Denim Jacket"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as ClothingItem['category'])}>
                  <SelectTrigger id="category" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CLOTHING_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  onClick={resetForm}
                  className={cn(fittedButton({ variant: "danger", size: "md" }), "flex-1")}
                >
                  <X className="h-4 w-4 mr-2" />
                  Reset Form
                </Button>
                
                <Button
                  onClick={saveToCloset}
                  disabled={!itemName.trim()}
                  className={cn(fittedButton({ variant: "primary", size: "md" }), "flex-1")}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Save to Closet
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImageUpload;