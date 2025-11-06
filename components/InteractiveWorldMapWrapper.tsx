'use client';

import dynamic from 'next/dynamic';

// Dynamically import the map component to avoid SSR issues on Vercel
const InteractiveWorldMap = dynamic(
  () => import('./InteractiveWorldMap').then(mod => ({ default: mod.InteractiveWorldMap })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[450px] sm:h-[500px] lg:h-[600px] rounded-lg bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-stone-600">Loading interactive map...</p>
        </div>
      </div>
    )
  }
);

export { InteractiveWorldMap };

