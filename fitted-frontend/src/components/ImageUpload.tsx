'use client';

import { useState, useCallback, useEffect } from 'react';
import { Upload, X, Check, AlertCircle, RefreshCw, Plus, Sparkles } from 'lucide-react';
import { ClothingItem } from '@/types/clothing';
import { clothingApi } from '@/lib/api/clothing-item-api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { fittedButton } from '@/lib/styles';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

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
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [processedImageBlob, setProcessedImageBlob] = useState<Blob | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ClothingItem['category']>('top');
  const [itemName, setItemName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [processingError, setProcessingError] = useState(false);
  const [savingError, setSavingError] = useState<string | null>(null);
  const [lastFailedFile, setLastFailedFile] = useState<File | null>(null);
  const [hasTriedAlternativeModel, setHasTriedAlternativeModel] = useState(false);
  const [currentModelUsed, setCurrentModelUsed] = useState<'general' | 'cloth_seg'>('general');

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

  const removeBackground = async (file: File, useClothSeg: boolean = false) : Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('use_cloth_seg', useClothSeg.toString());

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
      setProcessedImageBlob(blob);
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

  const processImage = useCallback((file: File, useClothSeg: boolean = false) => {
    setIsProcessing(true);
    setProcessingError(false);
    setSavingError(null);

    setOriginalFile(file);
    setCurrentModelUsed(useClothSeg ? 'cloth_seg' : 'general');

    removeBackground(file, useClothSeg)
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

  const handleTryAlternativeModel = () => {
    if (originalFile) {
      setHasTriedAlternativeModel(true);
      processImage(originalFile, true);
    }
  };

  const handleUploadNew = () => {
    setProcessingError(false);
    setLastFailedFile(null);
    setUploadedImage(null);
    setOriginalFile(null);
    setProcessedImageBlob(null);
    setSavingError(null);
    setHasTriedAlternativeModel(false);
    setCurrentModelUsed('general');
  };

  const saveToCloset = async () => {
    if (!uploadedImage || !itemName.trim() || !originalFile || !processedImageBlob) return;

    setIsSaving(true);
    setSavingError(null);

    try {
      const processedFile = new File(
        [processedImageBlob], 
        `processed_${originalFile.name}`,
        { type: processedImageBlob.type || 'image/png' }
      );

      const response = await clothingApi.createClothingItem({
        name: itemName.trim(),
        type: selectedCategory,
        originalImageFile: originalFile,
        modifiedImageFile: processedFile,
        color: undefined,
      });

      console.log('Clothing item saved successfully:', response);
      
      toast.success(`${itemName} saved to your closet!`);
      
      resetForm();
    } catch (error) {
      console.error('Failed to save clothing item:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save clothing item';
      setSavingError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setUploadedImage(null);
    setOriginalFile(null);
    setProcessedImageBlob(null);
    setItemName('');
    setProcessingError(false);
    setLastFailedFile(null);
    setSavingError(null);
    setHasTriedAlternativeModel(false);
    setCurrentModelUsed('general');
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
              <p className="text-sm text-fitted-gray-500 mt-1">
                {hasTriedAlternativeModel ? 'Trying alternative model...' : 'Removing background'}
              </p>
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
          <CardContent className="p-6 relative">
            {isProcessing && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-lg z-10 flex flex-col items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-2 border-fitted-blue-accent border-t-transparent mb-4" />
                <p className="text-lg text-fitted-gray-600">Processing image...</p>
                <p className="text-sm text-fitted-gray-500 mt-1">
                  Trying alternative model...
                </p>
              </div>
            )}
            
            <div className="flex justify-center mb-6">
              <img
                src={uploadedImage ?? undefined}
                alt="Uploaded clothing item"
                className="max-w-full max-h-64 object-contain rounded-lg"
              />
            </div>
            
            {savingError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{savingError}</AlertDescription>
              </Alert>
            )}
            
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
                  disabled={isSaving}
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={selectedCategory} 
                  onValueChange={(value) => setSelectedCategory(value as ClothingItem['category'])}
                  disabled={isSaving}
                >
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
                  disabled={isSaving}
                  className={cn(fittedButton({ variant: "danger", size: "md" }), "flex-1")}
                >
                  <X className="h-4 w-4 mr-2" />
                  Reset Form
                </Button>
                
                <Button
                  onClick={saveToCloset}
                  disabled={!itemName.trim() || isSaving}
                  className={cn(fittedButton({ variant: "primary", size: "md" }), "flex-1")}
                >
                  {isSaving ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Save to Closet
                    </>
                  )}
                </Button>
              </div>
              
              {/* Comment below out if w want to remove the option to try another model */}
              {!hasTriedAlternativeModel && (
                <div className="pt-2">
                  <Button
                    onClick={handleTryAlternativeModel}
                    disabled={isSaving || isProcessing}
                    className={cn(fittedButton({ variant: "secondary", size: "full" }))}
                  >
                    Not satisfied with the result? Try another model!
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImageUpload;