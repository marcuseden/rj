'use client';

import { Home, MessageSquare, BookOpen, Search, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AppFooter() {
  const pathname = usePathname();

  const navItems = [
    { href: '/vision', icon: Home, label: 'Home' },
    { href: '/rj-agent', icon: MessageSquare, label: 'AI Agent' },
    { href: '/worldbank-search', icon: Search, label: 'Search' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 px-4 py-3 z-40">
      <nav className="max-w-4xl mx-auto flex justify-around">
        {navItems.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 transition-colors ${
                isActive
                  ? 'text-stone-900'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

