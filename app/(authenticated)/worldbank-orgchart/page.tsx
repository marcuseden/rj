'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, ChevronRight, Phone } from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';

import { fetchOrgChart } from '@/lib/search-api';
import { OrgMember } from '@/lib/search-types';
import { OrgChartSkeleton } from '@/components/SearchSkeleton';

export default function OrgChartPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Load top 2 levels immediately
  const { data: topLevels, isLoading: topLoading } = useSWR(
    'orgchart-top',
    () => fetchOrgChart(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000 // 5 minutes
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

  const getLevelMembers = (level: number) => {
    return hierarchy.filter(m => m.level === level);
  };

  // Determine if a member is a department (has direct reports)
  const isDepartment = (member: OrgMember) => {
    return member.children_count && member.children_count > 0;
  };
  
  // Filter contacts based on search and sort with RJ Banga at the top
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
      // Always put Ajay Banga (RJ) at the top
      if (a.id === 'ajay-banga') return -1;
      if (b.id === 'ajay-banga') return 1;
      // Then sort alphabetically by name
      return a.name.localeCompare(b.name);
    });

  if (topLoading) {
    return (
      <div className="min-h-screen bg-stone-50 p-6">
        <div className="mb-8 text-center">
          <div className="h-8 bg-stone-200 rounded w-96 mx-auto mb-2 animate-pulse"></div>
          <div className="h-4 bg-stone-200 rounded w-64 mx-auto animate-pulse"></div>
        </div>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center mb-12">
            <OrgChartSkeleton count={1} />
          </div>
          <OrgChartSkeleton count={4} />
        </div>
      </div>
    );
  }

  const president = hierarchy.find(m => m.level === 1);
  const executiveTeam = getLevelMembers(2);

  return (
    <div className="min-h-screen bg-stone-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        {/* Mobile: Show search and title */}
        <div className="md:hidden">
          <h1 className="text-2xl font-bold text-stone-900 mb-4">
            Leadership Directory
          </h1>
          <div className="relative mb-4">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by name, position, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-[#0071bc] focus:border-[#0071bc]"
            />
          </div>
          <p className="text-sm text-stone-600 mb-2">
            {filteredContacts.length} {filteredContacts.length === 1 ? 'contact' : 'contacts'}
          </p>
        </div>
        
        {/* Desktop: Traditional header */}
        <div className="hidden md:block text-center">
          <h1 className="text-3xl font-bold text-stone-900 mb-2">
            World Bank Group Organization
          </h1>
          <p className="text-stone-600">
            Interactive organization chart with {hierarchy.length} leadership positions
          </p>
        </div>
      </div>

      {/* Mobile Contact List */}
      <div className="md:hidden space-y-3">
        {filteredContacts.length === 0 ? (
          <Card className="bg-white border-stone-200 p-8 text-center">
            <Users className="h-12 w-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-stone-900 mb-1">No contacts found</h3>
            <p className="text-sm text-stone-600">Try adjusting your search</p>
          </Card>
        ) : (
          filteredContacts.map((member) => {
            const hasAIAgent = member.id === 'ajay-banga';
            const isIndividual = !member.children_count || member.children_count === 0;
            
            return (
              <Card key={member.id} className="bg-white border-stone-200 hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Link href={`/department/${member.id}`}>
                      <Avatar className="w-14 h-14 ring-2 ring-stone-200 flex-shrink-0">
                        <AvatarImage src={member.avatar_url} alt={member.name} />
                        <AvatarFallback className="bg-[#0071bc] text-white font-bold text-sm">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    
                    <div className="flex-1 min-w-0">
                      <Link href={`/department/${member.id}`}>
                        <h3 className="font-semibold text-stone-900 text-base mb-1 line-clamp-2 hover:text-[#0071bc]">
                          {member.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-stone-600 mb-2 line-clamp-2">
                        {member.position}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge className="bg-stone-100 text-stone-700 border-stone-200 text-xs px-2 py-0.5">
                          <Building2 className="h-3 w-3 mr-1" />
                          {member.department}
                        </Badge>
                        {member.children_count && member.children_count > 0 && (
                          <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-2 py-0.5">
                            <Users className="h-3 w-3 mr-1" />
                            {member.children_count} reports
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Apple-style round call button */}
                    {isIndividual && hasAIAgent ? (
                      <Link href="/rj-agent">
                        <button className="w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 active:bg-green-700 flex items-center justify-center shadow-lg transition-all active:scale-95">
                          <Phone className="h-5 w-5 text-white" />
                        </button>
                      </Link>
                    ) : isIndividual ? (
                      <button 
                        disabled 
                        className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center cursor-not-allowed opacity-50"
                      >
                        <Phone className="h-5 w-5 text-stone-400" />
                      </button>
                    ) : (
                      <Link href={`/department/${member.id}`}>
                        <button className="w-12 h-12 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-all active:scale-95">
                          <ChevronRight className="h-5 w-5 text-stone-600" />
                        </button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Desktop Org Chart - Node Based Design */}
      <div className="hidden md:block max-w-7xl mx-auto">
        {/* Level 1 - President (Department Card Style) */}
        {president && (
          <div className="flex justify-center mb-12">
            <Link href={`/department/${president.id}`}>
              <Card className="bg-gradient-to-br from-[#0071bc] to-[#005a99] border-0 hover:shadow-2xl transition-all cursor-pointer w-96 group">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    {/* Department Icon */}
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                    
                    {/* Department Name */}
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {president.department || 'Office of the President'}
                    </h2>
                    <p className="text-sm text-blue-100 mb-4">
                      {president.position}
                    </p>

                    {/* Divider */}
                    <div className="w-full h-px bg-white/20 my-4"></div>

                    {/* Department Head - Smaller */}
                    <div className="flex items-center gap-3 w-full bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <Avatar className="w-12 h-12 ring-2 ring-white/30">
                        <AvatarImage src={president.avatar_url} alt={president.name} />
                        <AvatarFallback className="bg-white/20 text-white font-bold">
                          {getInitials(president.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-white">
                          {president.name}
                        </p>
                        <p className="text-xs text-blue-100">
                          Department Head
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>

                    {/* Team Size */}
                    {president.children_count && president.children_count > 0 && (
                      <div className="mt-4 flex items-center gap-2 text-white/80">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">
                        {president.children_count} direct reports
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        )}

        {/* Connecting Line - hide on mobile */}
        {president && executiveTeam.length > 0 && (
          <div className="hidden md:flex justify-center mb-6">
            <div className="w-0.5 h-12 bg-stone-300"></div>
          </div>
        )}

        {/* Level 2 - Executive Team (Department Cards) */}
        {executiveTeam.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12 relative">
              {/* Horizontal connecting line - hide on mobile */}
              <div className="hidden md:block absolute top-0 left-[12.5%] right-[12.5%] h-0.5 bg-stone-300 -translate-y-6"></div>
              
              {executiveTeam.map((member) => {
                const hasDepartment = isDepartment(member);
                
                return (
                <div key={member.id} className="relative">
                  {/* Vertical line to member - hide on mobile */}
                  <div className="hidden md:block absolute top-0 left-1/2 w-0.5 h-6 bg-stone-300 -translate-y-6 -translate-x-1/2"></div>
                  
                  <Link href={`/department/${member.id}`}>
                      {hasDepartment ? (
                        // DEPARTMENT CARD - Focus on department with head shown smaller
                        <Card className="bg-white border-2 border-stone-200 hover:border-[#0071bc] hover:shadow-lg transition-all cursor-pointer h-full group">
                          <CardContent className="p-4">
                            <div className="flex flex-col items-center text-center">
                              {/* Department Icon */}
                              <div className="w-12 h-12 rounded-lg bg-stone-100 group-hover:bg-[#0071bc]/10 flex items-center justify-center mb-3 transition-colors">
                                <Building2 className="w-6 h-6 text-stone-600 group-hover:text-[#0071bc] transition-colors" />
                              </div>
                              
                              {/* Department Name */}
                              <Badge className="bg-stone-900 text-white text-xs mb-2 px-3 py-1">
                                {member.department}
                              </Badge>
                              <p className="text-xs text-stone-600 mb-3 line-clamp-2 min-h-[2.5rem]">
                                {member.position}
                              </p>

                              {/* Divider */}
                              <div className="w-full h-px bg-stone-200 my-2"></div>

                              {/* Department Head - Compact */}
                              <div className="flex items-center gap-2 w-full bg-stone-50 rounded-lg p-2 mt-2">
                                <Avatar className="w-8 h-8 ring-2 ring-stone-200">
                                  <AvatarImage src={member.avatar_url} alt={member.name} />
                                  <AvatarFallback className="bg-stone-200 text-stone-700 text-xs font-semibold">
                                    {getInitials(member.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 text-left min-w-0">
                                  <p className="text-xs font-semibold text-stone-900 truncate">
                                    {member.name}
                                  </p>
                                  <p className="text-xs text-stone-500">
                                    Head
                                  </p>
                                </div>
                              </div>

                              {/* Team Size */}
                              {member.children_count && member.children_count > 0 && (
                                <div className="mt-3 flex items-center gap-1.5 text-stone-600 bg-stone-50 rounded-full px-3 py-1.5">
                                  <Users className="w-3.5 h-3.5" />
                                  <span className="text-xs font-medium">
                                    {member.children_count} members
                                  </span>
                                </div>
                              )}

                              {/* Click to view indicator */}
                              <div className="mt-2 text-xs text-[#0071bc] font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                View Team
                                <ChevronRight className="w-3 h-3" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        // PERSON CARD - Focus on individual
                        <Card className="bg-white border border-stone-200 hover:shadow-lg transition-all cursor-pointer h-full">
                      <CardContent className="p-4">
                        <div className="flex flex-col items-center text-center">
                          <Avatar className="w-16 h-16 mb-3 ring-2 ring-stone-200">
                            <AvatarImage src={member.avatar_url} alt={member.name} />
                            <AvatarFallback className="bg-stone-100 text-stone-700 font-bold">
                              {getInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          <h4 className="font-semibold text-stone-900 text-sm mb-1 line-clamp-2">
                            {member.name}
                          </h4>
                          <p className="text-xs text-stone-600 mb-2 line-clamp-2">
                            {member.position}
                          </p>
                              <Badge className="bg-stone-100 text-stone-700 border-stone-200 text-xs">
                            {member.department}
                          </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                      </Link>
                </div>
              );
            })}
            </div>

          </>
        )}

        {hierarchy.length === 0 && (
          <Card className="bg-white border-stone-200 p-12 text-center">
            <p className="text-stone-600">No organization data available</p>
          </Card>
        )}
      </div>
    </div>
  );
}
