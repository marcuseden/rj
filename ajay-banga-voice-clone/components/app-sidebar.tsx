'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  BookOpen,
  Target,
  LogOut,
  Home,
  Menu,
  X,
  Phone,
  UserCheck,
  Users,
  Globe
} from 'lucide-react';
import Link from 'next/link';

interface AppSidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export function AppSidebar({ isOpen: externalIsOpen, onToggle }: AppSidebarProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  // Use external state if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = onToggle || setInternalIsOpen;

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const navigation = [
    {
      name: 'Home',
      href: '/dashboard',
      icon: Home,
    },
    {
      name: 'Call to Agent',
      href: '/voice-call',
      icon: Phone,
      description: 'Voice interaction'
    },
    {
      name: 'Text Alignment',
      href: '/rj-agent',
      icon: UserCheck,
  Users,
      description: 'Analyze with RJ Banga style'
    },
    {
      name: 'Browse CEO Speeches',
      href: '/rj-faq',
      icon: BookOpen,
      description: '14 speeches • 19,904 words'
    },
    {
      name: 'CEO Vision & Values',
      href: '/vision',
      icon: Target,
      description: 'Strategic Focus'
    },
    {
      name: 'World Bank Knowledge Base',
      href: '/worldbank-search',
      icon: Globe,
      description: '1000+ articles (2024-2025)'
    },
    {
      name: 'World Bank Leadership',
      href: '/worldbank-org-chart',
      icon: Users,
      description: 'Leadership team & org chart'
    },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
    <aside
      className={`h-full w-64 bg-stone-50 border-r border-stone-200 flex flex-col transition-all duration-300 ${
        isOpen
          ? 'translate-x-0'  // Show sidebar
          : '-translate-x-full'  // Hide sidebar
      } ${
        isOpen
          ? 'relative z-auto'  // Normal flow when open
          : 'absolute md:relative -z-10 md:z-auto'  // Behind content when closed, normal on desktop
      }`}
    >
      {/* Top section - fixed at top */}
      <div className="flex-shrink-0">
        {/* Logo/Header */}
        <div className="p-6 border-b border-stone-200">
          <Link href="/dashboard" className="block">
            <h1 className="text-lg font-semibold text-stone-900">CEO Alignment Checker</h1>
            <p className="text-xs text-stone-500 mt-1">World Bank Group</p>
          </Link>
        </div>

        {/* CEO Profile */}
        <div className="p-6 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 ring-2 ring-stone-200">
              <AvatarImage
                src="/ajay-banga.svg"
                onError={(e) => e.currentTarget.style.display = 'none'}
              />
              <AvatarFallback className="bg-stone-200 text-stone-700 text-sm font-semibold">
                AB
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-stone-900 truncate">Ajay Banga</h3>
              <p className="text-xs text-stone-500 truncate">President, World Bank</p>
            </div>
          </div>
        </div>
      </div>

      {/* Middle section - navigation, grows to fill space */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link key={item.name} href={item.href}>
              <div
                className={`flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  active
                    ? 'bg-stone-200 text-stone-900'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${active ? 'text-stone-900' : ''}`}>
                    {item.name}
                  </p>
                  {item.description && (
                    <p className="text-xs text-stone-500 mt-0.5">{item.description}</p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section - user info, fixed at bottom */}
      <div className="flex-shrink-0">
        {/* User Info & Sign Out */}
        {user && (
          <div className="p-4 border-t border-stone-200">
            <div className="px-3 py-2 mb-2 rounded-lg bg-stone-100">
              <p className="text-xs font-medium text-stone-900 truncate">
                {user?.email?.split('@')[0]}
              </p>
              <p className="text-xs text-stone-500 truncate mt-0.5">{user?.email}</p>
            </div>
            <Button
              onClick={handleSignOut}
              variant="ghost"
              className="w-full justify-start text-stone-600 hover:text-stone-900 hover:bg-stone-100"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        )}

        {/* Demo Notice */}
        {!user && (
          <div className="p-4 border-t border-stone-200">
            <div className="px-3 py-2 rounded-lg bg-stone-100">
              <p className="text-xs font-medium text-stone-700">Demo Mode</p>
              <p className="text-xs text-stone-500 mt-0.5">Limited features available</p>
            </div>
          </div>
        )}
      </div>
      </aside>
    </>
  );
}

