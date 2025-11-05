'use client';

import React, { useState, useEffect } from 'react';
import { AppSidebar } from './app-sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true); // Default to open for desktop

  return (
    <div className="relative min-h-screen bg-stone-50">
      <div className="flex">
        {/* Mobile menu button - slides in with sidebar */}
        <div
          className={`fixed top-4 z-50 md:hidden transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-64' : 'translate-x-0'
          }`}
        >
          <button
            className="p-2 hover:bg-stone-100/50 rounded transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5 text-stone-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 transition-all duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
