'use client';

import { useState, useEffect } from 'react';
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
  Globe,
  Menu,
  X
} from 'lucide-react';
import { Button } from './ui/button';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const navItems = [
  { href: '/vision', icon: Eye, label: 'Vision', mobileHidden: false },
  { href: '/rj-agent', icon: Phone, label: 'AI Banga', mobileHidden: false },
  { href: '/worldbank-search', icon: BookOpen, label: 'Knowledge Base', mobileHidden: true }, // Hidden on mobile
  { href: '/rj-writing-assistant', icon: FileEdit, label: 'Writing Assistant', mobileHidden: false },
  { href: '/worldbank-orgchart', icon: Building2, label: 'Leadership Directory', mobileHidden: false },
  { href: '/countries', icon: Globe, label: 'Countries', mobileHidden: false },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <>
      {/* Mobile Header with Hamburger */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-stone-200 z-[90] flex items-center justify-between px-4 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-stone-900">Strategic Alignment</h2>
          <p className="text-xs text-stone-600">World Bank</p>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6 text-stone-900" />
          ) : (
            <Menu className="h-6 w-6 text-stone-900" />
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sliding Menu */}
      <aside className={`md:hidden fixed top-16 right-0 bottom-0 w-64 bg-white border-l border-stone-200 flex flex-col transition-transform duration-300 ease-in-out z-[110] shadow-2xl ${
        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {navItems
              .filter(item => !item.mobileHidden) // Filter out mobile-hidden items
              .map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[#0071bc] text-white font-medium'
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
            <LogOut className="h-5 w-5" />
            <span className="text-sm ml-3">Logout</span>
          </Button>
        </div>
      </aside>

      {/* Desktop Sidebar - Hidden on Mobile */}
      <aside className={`hidden md:flex ${isCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-stone-200 flex-col h-screen fixed left-0 top-0 transition-all duration-300 ease-in-out z-50`}>
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

      {/* Spacer to prevent content from going under sidebar - Only on Desktop */}
      <div className={`hidden md:block ${isCollapsed ? 'w-20' : 'w-64'} flex-shrink-0 transition-all duration-300`} />
      
      {/* Mobile spacer for top header */}
      <div className="md:hidden h-16" />
    </>
  );
}

