'use client';

import { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  className?: string;
}

export default function TagInput({
  tags,
  onTagsChange,
  placeholder = 'Add tags...',
  maxTags = 10,
  className,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      
      const newTag = inputValue.trim();
      
      if (tags.some(tag => tag.toLowerCase() === newTag.toLowerCase())) {
        setInputValue('');
        return;
      }
      
      if (tags.length >= maxTags) {
        setInputValue('');
        return;
      }
      
      onTagsChange([...tags, newTag]);
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className={cn('space-y-3', className)}>
      <Input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="h-10"
        maxLength={50}
      />
      
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <div
              key={tag}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-fitted-blue-accent/10 text-fitted-blue-accent rounded-full text-sm font-medium border border-fitted-blue-accent/20"
            >
              <span>{tag}</span>
              <button
                onClick={() => removeTag(tag)}
                className="hover:bg-fitted-blue-accent/20 rounded-full p-0.5 transition-colors"
                aria-label={`Remove ${tag} tag`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}