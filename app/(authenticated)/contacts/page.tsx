'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Phone, Search, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';
import { fetchOrgChart } from '@/lib/search-api';
import { OrgMember } from '@/lib/search-types';

export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: topLevels, isLoading } = useSWR(
    'orgchart-contacts',
    () => fetchOrgChart(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000
    }
  );

  const hierarchy = topLevels?.hierarchy || [];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Filter and sort contacts
  const filteredContacts = hierarchy
    .filter((member: OrgMember) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        member.name.toLowerCase().includes(query) ||
        member.position.toLowerCase().includes(query) ||
        member.department?.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      if (a.id === 'ajay-banga') return -1;
      if (b.id === 'ajay-banga') return 1;
      return a.name.localeCompare(b.name);
    });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Search Header */}
      <div className="bg-white border-b border-stone-200 sticky top-16 z-10">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-lg bg-stone-50 text-base focus:outline-none focus:ring-2 focus:ring-[#0071bc] focus:border-[#0071bc]"
            />
          </div>
          <p className="text-xs text-stone-500 mt-2">
            {filteredContacts.length} {filteredContacts.length === 1 ? 'contact' : 'contacts'}
          </p>
        </div>
      </div>

      {/* iPhone-Style Contact List */}
      <div className="divide-y divide-stone-200 bg-white">
        {filteredContacts.map((member) => {
          const hasAIAgent = member.id === 'ajay-banga';
          const isIndividual = !member.children_count || member.children_count === 0;
          
          return (
            <div key={member.id} className="flex items-center gap-3 p-4 active:bg-stone-50">
              <Link href={`/department/${member.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar className="w-11 h-11 flex-shrink-0">
                  <AvatarImage src={member.avatar_url} alt={member.name} />
                  <AvatarFallback className="bg-gradient-to-br from-[#0071bc] to-[#005a99] text-white font-semibold text-sm">
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-stone-900 text-base truncate">
                    {member.name}
                  </h3>
                  <p className="text-sm text-stone-600 truncate">
                    {member.position}
                  </p>
                </div>
              </Link>
              
              {/* Call Button - iPhone Style */}
              {isIndividual && hasAIAgent ? (
                <Link href="/rj-agent">
                  <button 
                    className="w-10 h-10 rounded-full bg-green-500 active:bg-green-600 flex items-center justify-center shadow-md active:scale-95 transition-transform"
                    aria-label="Call AI Agent"
                  >
                    <Phone className="h-5 w-5 text-white fill-white" />
                  </button>
                </Link>
              ) : isIndividual ? (
                <button 
                  disabled 
                  className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center opacity-40"
                  aria-label="Coming soon"
                >
                  <Phone className="h-5 w-5 text-stone-500" />
                </button>
              ) : (
                <Link href={`/department/${member.id}`}>
                  <ChevronRight className="h-6 w-6 text-stone-400" />
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {filteredContacts.length === 0 && (
        <div className="p-12 text-center">
          <p className="text-stone-600">No contacts found</p>
          <p className="text-sm text-stone-500 mt-1">Try a different search</p>
        </div>
      )}
    </div>
  );
}


