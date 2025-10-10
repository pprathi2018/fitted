'use client';

import { Skeleton } from '@/components/ui/skeleton';

interface SectionLoaderProps {
  itemCount?: number;
}

const SectionLoader = ({ itemCount = 3 }: SectionLoaderProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
      {Array.from({ length: itemCount }).map((_, index) => (
        <div key={index} className="w-32 h-40 shrink-0">
          <Skeleton className="w-full h-full rounded-lg" />
        </div>
      ))}
    </div>
  );
};

export default SectionLoader;