'use client';

import { AppFooter } from './app-footer';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <main className="flex-1">
        {children}
      </main>
      <AppFooter />
    </div>
  );
}

