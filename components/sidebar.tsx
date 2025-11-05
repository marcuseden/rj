'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Phone, 
  BookOpen, 
  FileEdit,
  Building2,
  Eye,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Globe
} from 'lucide-react';
import { Button } from './ui/button';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const navItems = [
  { href: '/vision', icon: Eye, label: 'Vision' },
  { href: '/rj-agent', icon: Phone, label: 'AI Banga' },
  { href: '/rj-faq', icon: BookOpen, label: 'Knowledge Base' },
  { href: '/rj-writing-assistant', icon: FileEdit, label: 'Writing Assistant' },
  { href: '/worldbank-orgchart', icon: Building2, label: 'Organization Chart' },
  { href: '/countries', icon: Globe, label: 'Countries' },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <>
      <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-stone-200 flex flex-col h-screen fixed left-0 top-0 transition-all duration-300 ease-in-out z-50`}>
        {/* Header */}
        <div className="p-6 border-b border-stone-200 flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-bold text-stone-900">Strategic Alignment</h2>
              <p className="text-xs text-stone-600 mt-1">World Bank Platform</p>
            </div>
          )}
          {isCollapsed && (
            <div className="text-xl font-bold text-stone-900 mx-auto">SA</div>
          )}
        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-24 w-6 h-6 bg-white border border-stone-200 rounded-full flex items-center justify-center hover:bg-stone-50 transition-colors shadow-sm"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-stone-600" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-stone-600" />
          )}
        </button>

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
                  className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-stone-100 text-stone-900 font-medium'
                      : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                  }`}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span className="text-sm">{item.label}</span>}
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
            className={`w-full ${isCollapsed ? 'justify-center px-2' : 'justify-start'} text-stone-600 hover:text-stone-900 hover:bg-stone-50`}
            title={isCollapsed ? 'Logout' : ''}
          >
            <LogOut className="h-5 w-5" />
            {!isCollapsed && <span className="text-sm ml-3">Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Spacer to prevent content from going under sidebar */}
      <div className={`${isCollapsed ? 'w-20' : 'w-64'} flex-shrink-0 transition-all duration-300`} />
    </>
  );
}

