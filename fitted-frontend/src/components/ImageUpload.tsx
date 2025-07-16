'use client';

import { useState, useCallback, useEffect } from 'react';
import { Upload, X, Check } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { ClothingItem } from '@/types/clothing';
import { useLocalStorage } from '@/hooks/useLocalStorage';

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

  // API Warmup
  useEffect(() => {
    const warmupAPI = async () => {
      try {
        const response = await fetch('https://ncti3zqpfjz7ds3ug5sorxgffy0wcjhb.lambda-url.us-east-1.on.aws/warmup')
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

      const url = URL.createObjectURL(blob);
      return url;
    } catch (error) {
      throw error;
    }
  }

  const processImage = useCallback((file: File) => {
    setIsProcessing(true);
    
    // const reader = new FileReader();
    // reader.onload = (e) => {
    //   const result = e.target?.result as string;
      
    //   // Simulate background removal processing
    //   setTimeout(() => {
    //     setUploadedImage(result);
    //     setIsProcessing(false);
    //   }, 1500);
    // };
    // reader.readAsDataURL(file);

    removeBackground(file)
    .then((url) => {
      setUploadedImage(url);
    })
    .catch((error) => {
      setUploadedImage(null);
      console.error(error);
      alert(error);
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
  };

  return (
    <div className="upload-container">
      <h1 className="upload-title">Upload Clothing Item</h1>

      {!uploadedImage ? (
        <div
          className={`upload-dropzone ${dragActive ? 'active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="upload-input"
            disabled={isProcessing}
          />
          
          {isProcessing ? (
            <div className="upload-processing">
              <div className="processing-spinner"></div>
              <p className="processing-text">Processing image...</p>
              <p className="processing-subtext">Removing background</p>
            </div>
          ) : (
            <div className="upload-content">
              <Upload className="upload-icon" />
              <p className="upload-text">
                Drag and drop an image here, or click to select
              </p>
              <p className="upload-subtext">
                Upload photos from clothing websites or pictures of your own clothes
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="upload-form">
          <div className="form-image-preview">
            <img
              src={uploadedImage}
              alt="Uploaded clothing item"
              className="preview-image"
            />
          </div>
          
          <div className="form-field">
            <label className="form-label">Item Name</label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g., Blue Denim Jacket"
              className="item-name-input"
            />
          </div>
          
          <div className="form-field">
            <label className="form-label">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as ClothingItem['category'])}
              className="form-input"
            >
              {CLOTHING_CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-buttons">
            <button onClick={resetForm} className="reset-button">
              <X className="reset-icon" />
              <span>Reset Form</span>
            </button>
            
            <button
              onClick={saveToCloset}
              disabled={!itemName.trim()}
              className="save-button"
            >
              <Check className="save-icon" />
              <span>Save to Closet</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;