'use client';

import { Sidebar } from '@/components/sidebar';
import { useEffect } from 'react';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auto-update leadership once per hour on login
  useEffect(() => {
    const lastUpdate = sessionStorage.getItem('leadership_updated');
    const oneHour = 60 * 60 * 1000;
    const now = Date.now();
    
    if (!lastUpdate || (now - parseInt(lastUpdate)) > oneHour) {
      fetch('/api/update-leadership')
        .then(res => res.json())
        .then(data => {
          console.log('✅ Leadership updated:', data);
          sessionStorage.setItem('leadership_updated', now.toString());
        })
        .catch(() => {}); // Fail silently
    }
  }, []);
  
  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar />
      <main className="flex-1 pt-16 md:pt-0">
        {children}
      </main>
    </div>
  );
}

