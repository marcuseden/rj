'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface OrgMember {
  id: string;
  name: string;
  position: string;
  avatar_url?: string;
  bio: string;
  level: number;
  department: string;
  parent_id?: string;
  children_count?: number;
}

export default function OrgChartPage() {
  const [hierarchy, setHierarchy] = useState<OrgMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrgChart();
  }, []);

  const fetchOrgChart = async () => {
    try {
      const response = await fetch('/api/worldbank-orgchart');
      if (response.ok) {
        const data = await response.json();
        setHierarchy(data.hierarchy || []);
      }
    } catch (error) {
      console.error('Error fetching org chart:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const getChildrenOf = (parentId: string) => {
    return hierarchy.filter(m => m.parent_id === parentId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900"></div>
      </div>
    );
  }

  const president = hierarchy.find(m => m.level === 1);
  const executiveTeam = getLevelMembers(2);

  return (
    <div className="min-h-screen bg-stone-50 p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-stone-900 mb-2">
          World Bank Group Organization
        </h1>
        <p className="text-stone-600">
          Interactive organization chart with {hierarchy.length} leadership positions
        </p>
      </div>

      {/* Org Chart - Node Based Design */}
      <div className="max-w-7xl mx-auto">
        {/* Level 1 - President */}
        {president && (
          <div className="flex justify-center mb-12">
            <Link href={`/department/${president.id}`}>
              <Card className="bg-white border-stone-200 hover:shadow-xl transition-all cursor-pointer w-80">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="w-24 h-24 mb-4 ring-4 ring-[#0071bc]">
                      <AvatarImage src={president.avatar_url} alt={president.name} />
                      <AvatarFallback className="bg-[#0071bc] text-white text-2xl font-bold">
                        {getInitials(president.name)}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-bold text-stone-900 mb-1">
                      {president.name}
                    </h3>
                    <p className="text-sm text-[#0071bc] font-semibold mb-3">
                      {president.position}
                    </p>
                    <Badge className="bg-stone-100 text-stone-700 border-stone-200 mb-3">
                      {president.department}
                    </Badge>
                    <p className="text-xs text-stone-600 line-clamp-2">
                      {president.bio}
                    </p>
                    {president.children_count > 0 && (
                      <div className="mt-4 text-xs text-stone-500">
                        {president.children_count} direct reports
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        )}

        {/* Connecting Line */}
        {president && executiveTeam.length > 0 && (
          <div className="flex justify-center mb-6">
            <div className="w-0.5 h-12 bg-stone-300"></div>
          </div>
        )}

        {/* Level 2 - Executive Team */}
        {executiveTeam.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 relative">
              {/* Horizontal connecting line */}
              <div className="absolute top-0 left-[12.5%] right-[12.5%] h-0.5 bg-stone-300 -translate-y-6"></div>
              
              {executiveTeam.map((member, idx) => (
                <div key={member.id} className="relative">
                  {/* Vertical line to member */}
                  <div className="absolute top-0 left-1/2 w-0.5 h-6 bg-stone-300 -translate-y-6 -translate-x-1/2"></div>
                  
                  <Link href={`/department/${member.id}`}>
                    <Card className="bg-white border-stone-200 hover:shadow-lg transition-all cursor-pointer h-full">
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
                          {member.children_count > 0 && (
                            <div className="mt-2 text-xs text-stone-500">
                              {member.children_count} reports
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  {/* Line to children if any */}
                  {member.children_count > 0 && getChildrenOf(member.id).length > 0 && (
                    <div className="absolute bottom-0 left-1/2 w-0.5 h-6 bg-stone-300 translate-y-6 -translate-x-1/2"></div>
                  )}
                </div>
              ))}
            </div>

            {/* Level 3 - Direct Reports grouped by parent */}
            {executiveTeam.map((parent) => {
              const children = getChildrenOf(parent.id);
              if (children.length === 0) return null;

              return (
                <div key={parent.id} className="mb-12">
                  <h3 className="text-lg font-semibold text-stone-700 mb-4 text-center">
                    {parent.name}'s Team
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {children.map((member) => (
                      <Link key={member.id} href={`/department/${member.id}`}>
                        <Card className="bg-white border-stone-200 hover:shadow-lg transition-all cursor-pointer h-full">
                          <CardContent className="p-4">
                            <div className="flex flex-col items-center text-center">
                              <Avatar className="w-14 h-14 mb-2 ring-2 ring-stone-200">
                                <AvatarImage src={member.avatar_url} alt={member.name} />
                                <AvatarFallback className="bg-stone-50 text-stone-600 text-sm font-semibold">
                                  {getInitials(member.name)}
                                </AvatarFallback>
                              </Avatar>
                              <h4 className="font-semibold text-stone-900 text-xs mb-1 line-clamp-2">
                                {member.name}
                              </h4>
                              <p className="text-xs text-stone-600 line-clamp-2">
                                {member.position}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
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
