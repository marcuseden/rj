// Skeleton loading UI for search results

import { Card, CardContent } from '@/components/ui/card';

interface SearchSkeletonProps {
  count?: number;
}

export function SearchSkeleton({ count = 5 }: SearchSkeletonProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <Card key={idx} className="bg-white border-stone-200 animate-pulse">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <div className="h-5 w-20 bg-stone-200 rounded"></div>
                  <div className="h-5 w-24 bg-stone-200 rounded"></div>
                  <div className="h-4 w-16 bg-stone-200 rounded"></div>
                </div>
                
                {/* Title */}
                <div className="h-6 bg-stone-200 rounded mb-2 w-3/4"></div>
                
                {/* Summary */}
                <div className="space-y-2 mb-3">
                  <div className="h-4 bg-stone-200 rounded w-full"></div>
                  <div className="h-4 bg-stone-200 rounded w-5/6"></div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  <div className="h-5 w-24 bg-stone-200 rounded"></div>
                  <div className="h-5 w-20 bg-stone-200 rounded"></div>
                  <div className="h-5 w-28 bg-stone-200 rounded"></div>
                </div>
              </div>

              {/* Reading time */}
              <div className="flex flex-col items-end gap-1">
                <div className="h-4 w-12 bg-stone-200 rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function SearchHeaderSkeleton() {
  return (
    <div className="bg-white border-b border-stone-200 px-4 md:px-6 py-6 animate-pulse">
      <div className="h-8 bg-stone-200 rounded w-64 mb-2"></div>
      <div className="h-4 bg-stone-200 rounded w-48"></div>
    </div>
  );
}

export function OrgChartSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <Card key={idx} className="bg-white border-stone-200 animate-pulse">
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="w-16 h-16 bg-stone-200 rounded-full mb-3"></div>
              
              {/* Name */}
              <div className="h-4 bg-stone-200 rounded w-24 mb-2"></div>
              
              {/* Position */}
              <div className="h-3 bg-stone-200 rounded w-32 mb-2"></div>
              
              {/* Badge */}
              <div className="h-5 bg-stone-200 rounded w-20 mb-2"></div>
              
              {/* Reports */}
              <div className="h-3 bg-stone-200 rounded w-16"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}







