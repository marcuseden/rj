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
  { href: '/vision', icon: Eye, label: 'Vision', mobileHref: '/vision' },
  { href: '/rj-agent', icon: Phone, label: 'AI Banga', mobileHref: '/rj-agent' },
  { href: '/rj-writing-assistant', icon: FileEdit, label: 'Writing Assistant', mobileHref: '/rj-writing-assistant' },
  { href: '/worldbank-orgchart', icon: Building2, label: 'Leadership Directory', mobileHref: '/contacts' },
  { href: '/countries', icon: Globe, label: 'Countries', mobileHref: '/countries-mobile' },
];

const desktopOnlyItems = [
  { href: '/worldbank-search', icon: BookOpen, label: 'Knowledge Base' },
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
      {/* Mobile Fullscreen Menu */}
      <aside className={`md:hidden fixed inset-0 bg-white flex flex-col transition-all duration-300 ease-in-out z-[100] ${
        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Menu Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-stone-200 bg-white">
          <div>
            <h2 className="text-base font-bold text-stone-900">Strategic Alignment</h2>
            <p className="text-xs text-stone-600">World Bank</p>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="h-6 w-6 text-stone-900" />
          </button>
        </div>
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-6">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const mobileHref = item.mobileHref || item.href;
              const isActive = pathname === mobileHref || pathname?.startsWith(mobileHref + '/') ||
                              pathname === item.href || pathname?.startsWith(item.href + '/');
              
              return (
                <Link
                  key={item.href}
                  href={mobileHref}
                  className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-colors text-base ${
                    isActive
                      ? 'bg-[#0071bc] text-white font-medium shadow-md'
                      : 'text-stone-700 hover:bg-stone-100 active:bg-stone-200'
                  }`}
                >
                  <Icon className="h-6 w-6 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-stone-200 bg-white">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-4 rounded-xl text-base text-red-600 hover:bg-red-50 active:bg-red-100 w-full transition-colors"
          >
            <LogOut className="h-6 w-6" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
      
      {/* Mobile Header with Hamburger - Only shown when menu is closed */}
      {!isMobileMenuOpen && (
        <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-stone-200 z-[90] flex items-center justify-between px-4 shadow-sm">
          <div>
            <h2 className="text-base font-bold text-stone-900">Strategic Alignment</h2>
            <p className="text-xs text-stone-600">World Bank</p>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6 text-stone-900" />
          </button>
        </div>
      )}

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
            {desktopOnlyItems.map((item) => {
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

