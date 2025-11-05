'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
}

export function AppHeader({ title, subtitle, showBack = true }: AppHeaderProps) {
  const router = useRouter();

  return (
    <div className="bg-white border-b border-stone-200">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-stone-600 hover:text-stone-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back</span>
          </button>
        )}
        <h1 className="text-3xl font-bold text-stone-900">{title}</h1>
        {subtitle && (
          <p className="mt-2 text-stone-600">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

