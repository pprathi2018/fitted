'use client';

import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FilterButtonProps {
  onClick: () => void;
  activeFilterCount?: number;
  className?: string;
}

export default function FilterButton({ 
  onClick, 
  activeFilterCount = 0,
  className 
}: FilterButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      className={cn(
        "h-11 px-4 gap-2 border-fitted-gray-200 hover:bg-fitted-gray-50 transition-all",
        activeFilterCount > 0 && "border-fitted-blue-accent bg-fitted-blue-accent/5",
        className
      )}
    >
      <SlidersHorizontal className="h-5 w-5" />
      <span className="font-medium">Filters</span>
      {activeFilterCount > 0 && (
        <span className="ml-1 px-2 py-0.5 text-xs font-semibold bg-fitted-blue-accent text-white rounded-full">
          {activeFilterCount}
        </span>
      )}
    </Button>
  );
}