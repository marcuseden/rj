'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  MessageSquare, 
  BookOpen, 
  Search, 
  FileEdit,
  Building2,
  Eye,
  LogOut
} from 'lucide-react';
import { Button } from './ui/button';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/rj-agent', icon: MessageSquare, label: 'AI Agent' },
  { href: '/rj-faq', icon: BookOpen, label: 'Knowledge Base' },
  { href: '/worldbank-search', icon: Search, label: 'Document Search' },
  { href: '/rj-writing-assistant', icon: FileEdit, label: 'Writing Assistant' },
  { href: '/worldbank-orgchart', icon: Building2, label: 'Organization Chart' },
  { href: '/vision', icon: Eye, label: 'Vision' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <aside className="w-64 bg-white border-r border-stone-200 flex flex-col h-screen fixed left-0 top-0">
      {/* Header */}
      <div className="p-6 border-b border-stone-200">
        <h2 className="text-xl font-bold text-stone-900">RJ Banga</h2>
        <p className="text-xs text-stone-600 mt-1">World Bank Assistant</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-stone-100 text-stone-900 font-medium'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-stone-200">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-stone-600 hover:text-stone-900 hover:bg-stone-50"
        >
          <LogOut className="h-5 w-5 mr-3" />
          <span className="text-sm">Logout</span>
        </Button>
      </div>
    </aside>
  );
}

