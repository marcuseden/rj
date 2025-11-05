'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, ChevronRight, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

interface Department {
  id: string;
  name: string;
  description: string;
  leadership: string[];
  employee_count: number;
  budget_millions: number;
  key_initiatives: string[];
  regions_covered: string[];
  parent_id?: string;
}

export default function OrgChartPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/worldbank-orgchart');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data.hierarchy || []);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dept.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const topLevelDepts = filteredDepartments.filter(d => !d.parent_id);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-900 mb-2">
            World Bank Organization Chart
          </h1>
          <p className="text-stone-600">
            Explore departments, leadership, and key initiatives
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search departments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 text-lg bg-white border-stone-200"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-stone-600" />
                <div>
                  <p className="text-sm text-stone-600">Total Departments</p>
                  <p className="text-2xl font-bold text-stone-900">{departments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-stone-600" />
                <div>
                  <p className="text-sm text-stone-600">Total Staff</p>
                  <p className="text-2xl font-bold text-stone-900">
                    {departments.reduce((sum, d) => sum + (d.employee_count || 0), 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-stone-600" />
                <div>
                  <p className="text-sm text-stone-600">Top-Level Units</p>
                  <p className="text-2xl font-bold text-stone-900">{topLevelDepts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Department Grid */}
        <div className="grid grid-cols-1 gap-4">
          {topLevelDepts.map((dept) => (
            <Link key={dept.id} href={`/department/${dept.id}`}>
              <Card className="hover:shadow-lg transition-all cursor-pointer border-stone-200 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-stone-900 mb-2">
                        {dept.name}
                      </h3>
                      <p className="text-stone-600 mb-4">{dept.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-stone-400 flex-shrink-0 ml-4" />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {dept.employee_count && (
                      <div>
                        <p className="text-sm text-stone-600">Staff</p>
                        <p className="font-semibold text-stone-900">{dept.employee_count.toLocaleString()}</p>
                      </div>
                    )}
                    {dept.budget_millions && (
                      <div>
                        <p className="text-sm text-stone-600">Budget</p>
                        <p className="font-semibold text-stone-900">${dept.budget_millions}M</p>
                      </div>
                    )}
                    {dept.regions_covered && dept.regions_covered.length > 0 && (
                      <div>
                        <p className="text-sm text-stone-600">Regions</p>
                        <p className="font-semibold text-stone-900">{dept.regions_covered.length}</p>
                      </div>
                    )}
                    {dept.key_initiatives && dept.key_initiatives.length > 0 && (
                      <div>
                        <p className="text-sm text-stone-600">Initiatives</p>
                        <p className="font-semibold text-stone-900">{dept.key_initiatives.length}</p>
                      </div>
                    )}
                  </div>

                  {dept.leadership && dept.leadership.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-stone-600 mb-2">Leadership</p>
                      <div className="flex flex-wrap gap-2">
                        {dept.leadership.slice(0, 3).map((leader, idx) => (
                          <Badge key={idx} variant="secondary" className="bg-stone-100 text-stone-700 border-stone-200">
                            {leader}
                          </Badge>
                        ))}
                        {dept.leadership.length > 3 && (
                          <Badge variant="secondary" className="bg-stone-100 text-stone-700 border-stone-200">
                            +{dept.leadership.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}

          {filteredDepartments.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Building2 className="h-16 w-16 mx-auto mb-4 text-stone-400" />
                <h3 className="text-lg font-semibold text-stone-900 mb-2">
                  No departments found
                </h3>
                <p className="text-stone-600">
                  Try adjusting your search query
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

