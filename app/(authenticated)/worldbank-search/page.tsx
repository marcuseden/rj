'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, ChevronDown, MapPin, Building2, FileText, Briefcase, Globe, Share2, Target, Users, TrendingUp, BarChart3, ArrowLeft, ArrowUpDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import useSWR from 'swr';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

import { fetchSearchResults, fetchSearchFilters, buildSearchCacheKey, getCachedFilters, setCachedFilters } from '@/lib/search-api';
import { SearchDocument, SearchFilters, SearchParams } from '@/lib/search-types';
import { SearchSkeleton } from '@/components/SearchSkeleton';
import { createClient } from '@/lib/supabase';

type QuickFilterType = 'all' | 'rj-banga' | 'strategy' | 'departments' | 'geographic' | 'countries' | 'people' | 'projects';

export default function WorldBankSearchPage() {
  console.log('🎬 [Search Page] Component mounting/rendering');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  
  // Quick Filter Tabs
  const [quickFilter, setQuickFilter] = useState<QuickFilterType>('all');
  
  // Advanced Filters
  const [filterAuthor, setFilterAuthor] = useState('all');
  const [filterDocType, setFilterDocType] = useState('all');
  const [filterSector, setFilterSector] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  
  // KPI and Comparison View state
  const [showKpiDropdown, setShowKpiDropdown] = useState(false);
  const [viewMode, setViewMode] = useState<'search' | 'country-comparison' | 'country-region' | 'country-income' | 'country-projects' | 'project-comparison'>('search');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1); // Reset to first page on new search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Build search params
  const searchParams: SearchParams = useMemo(() => {
    const params: SearchParams = {
      q: debouncedQuery,
      page,
      limit: 20
    };

    // Apply quick filter as type filter
    if (quickFilter !== 'all') {
      if (quickFilter === 'rj-banga') {
        params.author = 'Ajay Banga';
      } else {
        params.type = quickFilter === 'geographic' ? 'geographic' : quickFilter.replace('-', '');
      }
    }

    // Apply advanced filters
    if (filterAuthor !== 'all') params.author = filterAuthor;
    if (filterRegion !== 'all') params.region = filterRegion;
    if (filterSector !== 'all') params.sector = filterSector;
    if (filterDepartment !== 'all') params.department = filterDepartment;

    return params;
  }, [debouncedQuery, quickFilter, filterAuthor, filterRegion, filterSector, filterDepartment, page]);

  // Fetch filters (cached)
  const { data: filters, isLoading: filtersLoading } = useSWR<SearchFilters>(
    'search-filters',
    async () => {
      console.log('🎛️ [Search Page] Fetching filters...');
      const cached = getCachedFilters();
      if (cached) {
        console.log('✅ [Search Page] Using cached filters');
        return cached;
      }
      
      console.log('📡 [Search Page] Fetching filters from API...');
      const data = await fetchSearchFilters();
      console.log('✅ [Search Page] Filters loaded:', Object.keys(data).length, 'keys');
      setCachedFilters(data);
      return data;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 900000 // 15 minutes
    }
  );

  // Fetch search results with SWR
  const cacheKey = buildSearchCacheKey(searchParams);
  console.log('🔍 [Search Page] Cache key:', cacheKey);
  console.log('🔍 [Search Page] Search params:', searchParams);
  
  const { data: searchResponse, isLoading: resultsLoading, error } = useSWR(
    cacheKey,
    async () => {
      console.log('📡 [Search Page] Fetching search results...');
      const results = await fetchSearchResults(searchParams);
      console.log('✅ [Search Page] Search results loaded:', results.results?.length || 0, 'items');
      return results;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
      keepPreviousData: true
    }
  );

  const results = searchResponse?.results || [];
  const pagination = searchResponse?.pagination;
  const isLoading = resultsLoading && !searchResponse;
  
  console.log('📊 [Search Page] Render state:', {
    isLoading,
    resultsLoading,
    hasResponse: !!searchResponse,
    resultsCount: results.length,
    error: error?.message
  });

  // Virtual scrolling setup
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: results.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 150, // Estimated height per item
    overscan: 5
  });

  const handleLoadMore = () => {
    if (pagination && page < pagination.pages) {
      setPage(p => p + 1);
    }
  };

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [quickFilter, filterAuthor, filterRegion, filterSector, filterDepartment]);

  if (error) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Card className="bg-white border-stone-200 p-8 text-center max-w-md">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Search</h3>
          <p className="text-stone-600">{error.message}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-4 md:px-6 py-6">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-stone-900 mb-2">
              Knowledge Base
            </h1>
            <p className="text-sm md:text-base text-stone-600">
              {pagination ? `${pagination.total} results` : 'Loading...'} • Search across 5,000+ projects, 211 countries, 53+ documents, and leadership
            </p>
          </div>
          
          {/* KPI & Comparison Views Dropdown - Hidden on Mobile */}
          <div className="hidden md:block relative">
            <Button
              onClick={() => setShowKpiDropdown(!showKpiDropdown)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md"
            >
              <BarChart3 className="h-5 w-5 mr-2" />
              Analytics & Views
              <ChevronDown className={`h-4 w-4 ml-2 transition-transform duration-200 ${showKpiDropdown ? 'rotate-180' : ''}`} />
            </Button>
            
            {showKpiDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-stone-200 z-50 animate-in slide-in-from-top-2 duration-200">
                <div className="p-3 border-b border-stone-200 bg-stone-50 rounded-t-lg">
                  <h3 className="font-semibold text-stone-900 text-sm">Analytics & Comparison Tools</h3>
                </div>
                
                {/* Country KPIs Section */}
                <div className="p-3 border-b border-stone-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-4 w-4 text-blue-600" />
                    <h4 className="font-semibold text-stone-900 text-xs uppercase tracking-wider">Country KPIs</h4>
                  </div>
                  <div className="space-y-1">
                    <button 
                      onClick={() => {
                        setViewMode('country-comparison');
                        setShowKpiDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-stone-700 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors flex items-center gap-2"
                    >
                      <TrendingUp className="h-3.5 w-3.5" />
                      Compare All Countries
                    </button>
                    <button 
                      onClick={() => {
                        setViewMode('country-region');
                        setShowKpiDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-stone-700 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors flex items-center gap-2"
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      View by Region
                    </button>
                    <button 
                      onClick={() => {
                        setViewMode('country-income');
                        setShowKpiDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-stone-700 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors flex items-center gap-2"
                    >
                      <BarChart3 className="h-3.5 w-3.5" />
                      View by Income Level
                    </button>
                    <button 
                      onClick={() => {
                        setViewMode('country-projects');
                        setShowKpiDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-stone-700 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors flex items-center gap-2"
                    >
                      <Briefcase className="h-3.5 w-3.5" />
                      Top Countries by Projects
                    </button>
                  </div>
                </div>
                
                {/* Project Comparisons Section */}
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="h-4 w-4 text-purple-600" />
                    <h4 className="font-semibold text-stone-900 text-xs uppercase tracking-wider">Project Comparisons</h4>
                  </div>
                  <div className="space-y-1">
                    <button 
                      onClick={() => {
                        setViewMode('project-comparison');
                        setShowKpiDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-stone-700 hover:bg-purple-50 hover:text-purple-700 rounded-md transition-colors flex items-center gap-2"
                    >
                      <Target className="h-3.5 w-3.5" />
                      View All Projects
                    </button>
                    <button 
                      onClick={() => {
                        setViewMode('project-comparison');
                        setFilterRegion('all');
                        setShowFilters(true);
                        setShowKpiDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-stone-700 hover:bg-purple-50 hover:text-purple-700 rounded-md transition-colors flex items-center gap-2"
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      Compare by Region
                    </button>
                    <button 
                      onClick={() => {
                        setViewMode('project-comparison');
                        setFilterSector('all');
                        setShowFilters(true);
                        setShowKpiDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-stone-700 hover:bg-purple-50 hover:text-purple-700 rounded-md transition-colors flex items-center gap-2"
                    >
                      <Filter className="h-3.5 w-3.5" />
                      Compare by Sector
                    </button>
                    <button 
                      onClick={() => {
                        setViewMode('project-comparison');
                        setShowFilters(true);
                        setShowKpiDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-stone-700 hover:bg-purple-50 hover:text-purple-700 rounded-md transition-colors flex items-center gap-2"
                    >
                      <Building2 className="h-3.5 w-3.5" />
                      Compare by Department
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Search Bar - Only show in search mode */}
        {viewMode === 'search' && (
          <>
            <div className="mb-6">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-400 h-5 w-5 z-10" />
                  <Input
                    type="text"
                    placeholder="Search articles, strategies, people, countries, projects, departments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-4 py-6 text-lg bg-white border-stone-300 focus:ring-2 focus:ring-[#0071bc] focus:border-[#0071bc] transition-all shadow-sm hover:shadow-md"
                  />
                </div>

                {/* Filters button - Hidden on mobile */}
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant="outline"
                  className={`hidden md:flex px-4 py-6 border-stone-300 hover:bg-stone-50 transition-all shadow-sm hover:shadow-md ${
                    showFilters ? 'bg-stone-100 border-stone-400' : 'bg-white'
                  }`}
                >
                  <Filter className="h-5 w-5 mr-2" />
                  <span>Filters</span>
                  <ChevronDown className={`h-4 w-4 ml-2 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Quick Filter Tabs - Simplified on Mobile */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'all', label: 'All', icon: null },
                  { key: 'rj-banga', label: 'RJ Banga', icon: FileText },
                  { key: 'countries', label: 'Countries', icon: Globe },
                  { key: 'people', label: 'People', icon: Share2 },
                  { key: 'projects', label: 'Projects', icon: Briefcase }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setQuickFilter(key as QuickFilterType)}
                    className={`px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all flex items-center gap-1.5 md:gap-2 ${
                      quickFilter === key
                        ? 'bg-[#0071bc] text-white shadow-md'
                        : 'bg-white text-stone-700 border border-stone-300 hover:border-stone-400 hover:shadow-sm'
                    }`}
                  >
                    {Icon && <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />}
                    <span className="hidden sm:inline">{label}</span>
                    <span className="sm:hidden">{label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Advanced Filters Panel - Hidden on Mobile, only show in search mode on desktop */}
        {viewMode === 'search' && showFilters && filters && (
          <div className="hidden md:block mb-6 animate-in slide-in-from-top-2 duration-200">
            <Card className="bg-white border-stone-200 p-4 md:p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-stone-900">Advanced Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilterAuthor('all');
                    setFilterDocType('all');
                    setFilterSector('all');
                    setFilterRegion('all');
                    setFilterDepartment('all');
                  }}
                  className="text-[#0071bc] hover:text-[#005a99]"
                >
                  Clear All
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Author</label>
                  <select
                    value={filterAuthor}
                    onChange={(e) => setFilterAuthor(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white text-sm hover:border-stone-400 focus:ring-2 focus:ring-[#0071bc] focus:border-[#0071bc] transition-all"
                  >
                    <option value="all">All Authors</option>
                    {filters.authors?.map(author => (
                      <option key={author} value={author}>{author}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Sector</label>
                  <select
                    value={filterSector}
                    onChange={(e) => setFilterSector(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white text-sm hover:border-stone-400 focus:ring-2 focus:ring-[#0071bc] focus:border-[#0071bc] transition-all"
                  >
                    <option value="all">All Sectors</option>
                    {filters.sectors?.map(sector => (
                      <option key={sector} value={sector}>{sector}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Region</label>
                  <select
                    value={filterRegion}
                    onChange={(e) => setFilterRegion(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white text-sm hover:border-stone-400 focus:ring-2 focus:ring-[#0071bc] focus:border-[#0071bc] transition-all"
                  >
                    <option value="all">All Regions</option>
                    {filters.regions?.map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Department</label>
                  <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white text-sm hover:border-stone-400 focus:ring-2 focus:ring-[#0071bc] focus:border-[#0071bc] transition-all"
                  >
                    <option value="all">All Departments</option>
                    {filters.departments?.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Back to Search Button (when in table view) */}
        {viewMode !== 'search' && (
          <div className="mb-4">
            <Button
              onClick={() => setViewMode('search')}
              variant="outline"
              className="border-stone-300 hover:bg-stone-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Button>
          </div>
        )}

        {/* Conditional Content Based on View Mode */}
        {viewMode === 'search' ? (
          <>
            {/* Results */}
            {pagination && (
              <div className="mb-4 text-xs md:text-sm text-stone-600">
                Showing {results.length} of {pagination.total} items
                {page > 1 && <span className="hidden sm:inline"> (page {page} of {pagination.pages})</span>}
              </div>
            )}

            {/* Document List with Virtual Scrolling */}
            {isLoading ? (
              <SearchSkeleton count={5} />
            ) : results.length === 0 ? (
              <Card className="bg-white border-stone-200 p-12 text-center">
                <h3 className="text-lg font-semibold text-stone-900 mb-2">No results found</h3>
                <p className="text-stone-600">Try adjusting your search or filters</p>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6">
                  {results.map((doc) => (
                    <DocumentCard key={doc.id} doc={doc} />
                  ))}
                </div>

                {/* Load More Button */}
                {pagination && page < pagination.pages && (
                  <div className="mt-8 text-center">
                    <Button
                      onClick={handleLoadMore}
                      disabled={resultsLoading}
                      className="bg-[#0071bc] hover:bg-[#005a99] text-white px-8 py-3"
                    >
                      {resultsLoading ? 'Loading...' : `Load More (${pagination.total - results.length} remaining)`}
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        ) : viewMode === 'country-comparison' ? (
          <CountryComparisonTable filterSector={filterSector} filterRegion={filterRegion} />
        ) : viewMode === 'country-region' ? (
          <CountryByRegionTable filterSector={filterSector} />
        ) : viewMode === 'country-income' ? (
          <CountryByIncomeTable filterSector={filterSector} filterRegion={filterRegion} />
        ) : viewMode === 'country-projects' ? (
          <CountriesByProjectsTable filterSector={filterSector} filterRegion={filterRegion} />
        ) : viewMode === 'project-comparison' ? (
          <ProjectComparisonTable filterSector={filterSector} filterRegion={filterRegion} filterDepartment={filterDepartment} />
        ) : null}
      </div>
    </div>
  );
}

// Document Card Component with Type-Specific Designs
function DocumentCard({ doc }: { doc: SearchDocument }) {
  // Smart routing based on source type
  const getLink = () => {
    if (doc.sourceType === 'country') return `/country/${encodeURIComponent(doc.title)}`;
    if (doc.sourceType === 'person') return `/worldbank-orgchart#${doc.id}`;
    if (doc.sourceType === 'project') return `/project/${doc.id}`;
    return `/document/${doc.id}`;
  };

  // Render different card styles based on type
  if (doc.sourceType === 'country') {
    return <CountryCard doc={doc} getLink={getLink} />;
  }
  
  if (doc.sourceType === 'project') {
    return <ProjectCard doc={doc} getLink={getLink} />;
  }
  
  if (doc.sourceType === 'person') {
    return <PersonCard doc={doc} getLink={getLink} />;
  }
  
  if (doc.sourceType === 'speech') {
    return <SpeechCard doc={doc} getLink={getLink} />;
  }
  
  if (doc.sourceType === 'strategy') {
    return <StrategyCard doc={doc} getLink={getLink} />;
  }
  
  if (doc.sourceType === 'department') {
    return <DepartmentCard doc={doc} getLink={getLink} />;
  }
  
  // Default card for other types
  return <DefaultCard doc={doc} getLink={getLink} />;
}

// Country Card - Geographic focus with region badge
function CountryCard({ doc, getLink }: { doc: SearchDocument; getLink: () => string }) {
  return (
    <Link href={getLink()}>
      <Card className="bg-gradient-to-r from-teal-50 to-white border-l-4 border-l-teal-500 border-stone-200 hover:shadow-lg hover:border-teal-400 transition-all cursor-pointer group">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center group-hover:bg-teal-200 transition-colors">
              <Globe className="h-6 w-6 text-teal-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <Badge className="bg-teal-100 text-teal-700 border-teal-300 text-xs font-semibold px-3 py-1">
                  COUNTRY
                </Badge>
                {doc.tags?.regions && doc.tags.regions[0] && (
                  <Badge variant="outline" className="text-xs px-3 py-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {doc.tags.regions[0]}
                  </Badge>
                )}
              </div>
              <h3 className="text-lg md:text-xl font-bold text-stone-900 mb-2 group-hover:text-teal-700 transition-colors">
                {doc.title}
              </h3>
              <p className="text-sm text-stone-700 mb-3">
                {doc.summary}
              </p>
              {doc.tags?.sectors && doc.tags.sectors.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {doc.tags.sectors.slice(0, 3).map((sector, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs bg-white px-2.5 py-1">
                      {sector}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Project Card - Financial focus with commitment amount
function ProjectCard({ doc, getLink }: { doc: SearchDocument; getLink: () => string }) {
  return (
    <Link href={getLink()}>
      <Card className="bg-gradient-to-r from-indigo-50 to-white border-l-4 border-l-indigo-500 border-stone-200 hover:shadow-lg hover:border-indigo-400 transition-all cursor-pointer group">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
              <Briefcase className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <Badge className="bg-indigo-100 text-indigo-700 border-indigo-300 text-xs font-semibold px-3 py-1">
                  PROJECT
                </Badge>
                {doc.tags?.regions && doc.tags.regions[0] && (
                  <Badge variant="outline" className="text-xs px-3 py-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {doc.tags.regions[0]}
                  </Badge>
                )}
                <span className="text-xs text-stone-500 ml-1">{doc.date}</span>
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2 group-hover:text-indigo-700 transition-colors">
                {doc.title}
              </h3>
              <p className="text-sm text-stone-700 mb-3 line-clamp-2">
                {doc.summary}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {doc.tags?.sectors?.slice(0, 2).map((sector, idx) => (
                  <Badge key={idx} className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs px-2.5 py-1">
                    {sector}
                  </Badge>
                ))}
                {doc.tags?.departments?.slice(0, 1).map((dept, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs px-2.5 py-1">
                    <Building2 className="h-3 w-3 mr-1" />
                    {dept}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Person Card - Profile focus with position
function PersonCard({ doc, getLink }: { doc: SearchDocument; getLink: () => string }) {
  return (
    <Link href={getLink()}>
      <Card className="bg-gradient-to-r from-pink-50 to-white border-l-4 border-l-pink-500 border-stone-200 hover:shadow-lg hover:border-pink-400 transition-all cursor-pointer group">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center group-hover:bg-pink-200 transition-colors">
              <Users className="h-6 w-6 text-pink-600" />
            </div>
            <div className="flex-1 min-w-0">
              <Badge className="bg-pink-100 text-pink-700 border-pink-300 text-xs font-semibold px-3 py-1 mb-3">
                LEADERSHIP
              </Badge>
              <h3 className="text-lg md:text-xl font-bold text-stone-900 mb-1 group-hover:text-pink-700 transition-colors">
                {doc.title}
              </h3>
              <p className="text-sm font-medium text-stone-700 mb-2">
                {doc.summary}
              </p>
              <div className="flex flex-wrap gap-2.5 mt-3">
                {doc.tags?.departments?.map((dept, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs px-2.5 py-1">
                    <Building2 className="h-3 w-3 mr-1" />
                    {dept}
                  </Badge>
                ))}
                {doc.tags?.regions?.slice(0, 2).map((region, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs px-2.5 py-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {region}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Speech Card - Document focus with author and reading time
function SpeechCard({ doc, getLink }: { doc: SearchDocument; getLink: () => string }) {
  return (
    <Link href={getLink()}>
      <Card className="bg-gradient-to-r from-blue-50 to-white border-l-4 border-l-blue-500 border-stone-200 hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer group">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs font-semibold px-3 py-1">
                  SPEECH
                </Badge>
                {doc.tags?.authors && doc.tags.authors[0] && (
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-3 py-1">
                    {doc.tags.authors[0]}
                  </Badge>
                )}
                <span className="text-xs text-stone-500 ml-1">{doc.date}</span>
              </div>
                <h3 className="text-base md:text-lg font-semibold text-stone-900 mb-2 group-hover:text-blue-700 transition-colors">
                  {doc.title}
                </h3>
                <p className="text-sm text-stone-600 line-clamp-2 mb-2">
                  {doc.summary}
                </p>
                <div className="flex flex-wrap gap-2.5 mt-3">
                  {doc.tags?.regions?.slice(0, 2).map((region, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs px-2.5 py-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {region}
                    </Badge>
                  ))}
                  {doc.tags?.sectors?.slice(0, 2).map((sector, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs px-2.5 py-1">
                      {sector}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            {doc.metadata?.readingTime && (
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <div className="text-xs text-stone-500 whitespace-nowrap">
                  {doc.metadata.readingTime} min
                </div>
                {doc.metadata?.wordCount && (
                  <div className="text-xs text-stone-400 whitespace-nowrap">
                    {doc.metadata.wordCount.toLocaleString()} words
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Strategy Card - Strategic document focus
function StrategyCard({ doc, getLink }: { doc: SearchDocument; getLink: () => string }) {
  return (
    <Link href={getLink()}>
      <Card className="bg-gradient-to-r from-purple-50 to-white border-l-4 border-l-purple-500 border-stone-200 hover:shadow-lg hover:border-purple-400 transition-all cursor-pointer group">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <Badge className="bg-purple-100 text-purple-700 border-purple-300 text-xs font-semibold px-3 py-1">
                    STRATEGY
                  </Badge>
                  {doc.tags?.priority && (
                    <Badge className={doc.tags.priority === 'high' 
                      ? 'bg-red-100 text-red-700 border-red-200 text-xs px-3 py-1'
                      : 'bg-stone-100 text-stone-600 border-stone-200 text-xs px-3 py-1'
                    }>
                      {doc.tags.priority.toUpperCase()}
                    </Badge>
                  )}
                  <span className="text-xs text-stone-500 ml-1">{doc.date}</span>
                </div>
                <h3 className="text-base md:text-lg font-semibold text-stone-900 mb-2 group-hover:text-purple-700 transition-colors">
                  {doc.title}
                </h3>
                <p className="text-sm text-stone-600 line-clamp-2 mb-2">
                  {doc.summary}
                </p>
                <div className="flex flex-wrap gap-2.5 mt-3">
                  {doc.tags?.departments?.slice(0, 2).map((dept, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs px-2.5 py-1">
                      <Building2 className="h-3 w-3 mr-1" />
                      {dept}
                    </Badge>
                  ))}
                  {doc.tags?.regions?.slice(0, 2).map((region, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs px-2.5 py-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {region}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            {doc.metadata?.readingTime && (
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <div className="text-xs text-stone-500 whitespace-nowrap">
                  {doc.metadata.readingTime} min
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Department Card - Organizational focus
function DepartmentCard({ doc, getLink }: { doc: SearchDocument; getLink: () => string }) {
  return (
    <Link href={getLink()}>
      <Card className="bg-gradient-to-r from-green-50 to-white border-l-4 border-l-green-500 border-stone-200 hover:shadow-lg hover:border-green-400 transition-all cursor-pointer group">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <Building2 className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <Badge className="bg-green-100 text-green-700 border-green-300 text-xs font-semibold px-3 py-1 mb-3">
                DEPARTMENT
              </Badge>
              <h3 className="text-lg md:text-xl font-bold text-stone-900 mb-2 group-hover:text-green-700 transition-colors">
                {doc.title}
              </h3>
              <p className="text-sm text-stone-700 mb-3">
                {doc.summary}
              </p>
              <div className="flex flex-wrap gap-2.5 mt-3">
                {doc.tags?.regions?.slice(0, 3).map((region, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs px-2.5 py-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {region}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Default Card - Fallback for other types
function DefaultCard({ doc, getLink }: { doc: SearchDocument; getLink: () => string }) {
  return (
    <Link href={getLink()}>
      <Card className="bg-white border-stone-200 hover:shadow-lg hover:border-[#0071bc] transition-all cursor-pointer group">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <Badge className="bg-stone-100 text-stone-700 border-stone-200 text-xs font-medium px-3 py-1">
                  {getSourceIcon(doc.sourceType)}
                  {doc.sourceType}
                </Badge>
                {doc.tags?.documentType && (
                  <Badge className="bg-stone-100 text-stone-700 border-stone-200 text-xs px-3 py-1">
                    {doc.tags.documentType}
                  </Badge>
                )}
                <span className="text-xs text-stone-500 ml-1">{doc.date}</span>
              </div>
              
              <h3 className="text-base md:text-lg font-semibold text-stone-900 mb-2 group-hover:text-[#0071bc] transition-colors">
                {doc.title}
              </h3>
              
              <p className="text-sm text-stone-600 line-clamp-2 md:line-clamp-3 mb-3">
                {doc.summary}
              </p>

              <div className="flex flex-wrap gap-2">
                {doc.tags?.regions?.slice(0, 2).map((region, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    <MapPin className="h-3 w-3 mr-1" />
                    {region}
                  </Badge>
                ))}
                {doc.tags?.sectors?.slice(0, 2).map((sector, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {sector}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function getSourceIcon(sourceType: string) {
  switch (sourceType) {
    case 'speech': return <FileText className="h-3 w-3 mr-1 inline" />;
    case 'strategy': return <Briefcase className="h-3 w-3 mr-1 inline" />;
    case 'department': return <Building2 className="h-3 w-3 mr-1 inline" />;
    case 'geographic': return <MapPin className="h-3 w-3 mr-1 inline" />;
    case 'country': return <Globe className="h-3 w-3 mr-1 inline" />;
    case 'person': return <Share2 className="h-3 w-3 mr-1 inline" />;
    case 'project': return <Briefcase className="h-3 w-3 mr-1 inline" />;
    default: return null;
  }
}

// Table View Components
function CountryComparisonTable({ filterSector, filterRegion }: { filterSector: string; filterRegion: string }) {
  const { data: countries, isLoading, error } = useSWR('countries-comparison-all', async () => {
    const supabase = createClient();
    
    console.log('🔍 Fetching countries for comparison...');
    
    // Get countries - only select columns that exist
    const { data: countriesData, error: countriesError } = await supabase
      .from('worldbank_countries')
      .select('name, iso2_code, iso3_code, region, income_level, sector_focus');
    
    if (countriesError) {
      console.error('❌ Countries error:', countriesError);
      throw countriesError;
    }
    
    if (!countriesData || countriesData.length === 0) {
      console.error('❌ No countries data returned');
      return [];
    }
    
    console.log('✅ Loaded', countriesData.length, 'countries');
    
    // Get project counts grouped by country in ONE query
    const { data: projectCounts, error: projectsError } = await supabase
      .from('worldbank_projects')
      .select('country_name');
    
    if (projectsError) {
      console.error('❌ Projects error:', projectsError);
    }
    
    console.log('✅ Loaded', projectCounts?.length || 0, 'project records');
    
    // Count projects per country
    const countMap: Record<string, number> = {};
    projectCounts?.forEach((p: any) => {
      countMap[p.country_name] = (countMap[p.country_name] || 0) + 1;
    });
    
    console.log('✅ Project count map has', Object.keys(countMap).length, 'countries');
    console.log('Sample counts:', Object.entries(countMap).slice(0, 5));
    
    // Merge counts with countries
    const countriesWithCounts = countriesData.map(country => ({
      ...country,
      active_projects: countMap[country.name] || 0
    }));
    
    console.log('✅ Final countries with counts:', countriesWithCounts.length);
    
    return countriesWithCounts.sort((a, b) => (b.active_projects || 0) - (a.active_projects || 0));
  });

  if (error) {
    console.error('❌ SWR Error:', error);
  }

  const [sortBy, setSortBy] = useState<'name' | 'projects' | 'region'>('projects');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredCountries = useMemo(() => {
    if (!countries) return [];
    let filtered = [...countries];

    if (filterRegion !== 'all') {
      filtered = filtered.filter(c => c.region === filterRegion);
    }

    if (filterSector !== 'all' && filterSector) {
      filtered = filtered.filter(c => 
        c.sector_focus?.includes(filterSector)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal, bVal;
      if (sortBy === 'name') {
        aVal = a.name;
        bVal = b.name;
      } else if (sortBy === 'projects') {
        aVal = a.active_projects || 0;
        bVal = b.active_projects || 0;
      } else if (sortBy === 'region') {
        aVal = a.region;
        bVal = b.region;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [countries, filterRegion, filterSector, sortBy, sortOrder]);

  const toggleSort = (column: 'name' | 'projects' | 'region') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white border-stone-200 p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-stone-600">Loading country data...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white border-stone-200 p-8 text-center">
        <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Countries</h3>
        <p className="text-stone-600 mb-4">{error.message}</p>
        <p className="text-xs text-stone-500">Check the browser console for details</p>
      </Card>
    );
  }

  if (!countries || countries.length === 0) {
    return (
      <Card className="bg-white border-stone-200 p-12 text-center">
        <Globe className="h-16 w-16 text-stone-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-stone-900 mb-2">No Countries Found</h3>
        <p className="text-stone-600">Unable to load country data</p>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-stone-200 shadow-sm">
      <div className="p-6 border-b border-stone-200">
        <h2 className="text-2xl font-bold text-stone-900 mb-2">Country Comparison</h2>
        <p className="text-stone-600">
          Showing {filteredCountries.length} of {countries.length} countries
          {filterRegion !== 'all' && ` in ${filterRegion}`}
          {filterSector !== 'all' && ` with ${filterSector} sector`}
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-bold text-stone-700 uppercase tracking-wider cursor-pointer hover:bg-stone-100 transition-colors"
                onClick={() => toggleSort('name')}
              >
                <div className="flex items-center gap-2">
                  Country
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-bold text-stone-700 uppercase tracking-wider cursor-pointer hover:bg-stone-100 transition-colors"
                onClick={() => toggleSort('region')}
              >
                <div className="flex items-center gap-2">
                  Region
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-stone-700 uppercase tracking-wider">
                Income Level
              </th>
              <th 
                className="px-6 py-3 text-right text-xs font-bold text-stone-700 uppercase tracking-wider cursor-pointer hover:bg-stone-100 transition-colors"
                onClick={() => toggleSort('projects')}
              >
                <div className="flex items-center gap-2 justify-end">
                  Active Projects
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-stone-700 uppercase tracking-wider">
                Key Sectors
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-stone-200">
            {filteredCountries.map((country) => (
              <tr key={country.iso2_code} className="hover:bg-stone-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link href={`/country/${encodeURIComponent(country.name)}`} className="text-blue-600 hover:text-blue-800 font-medium">
                    {country.name}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant="outline" className="text-xs">
                    {country.region}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className={
                    country.income_level === 'High income' ? 'bg-green-100 text-green-700 border-green-200' :
                    country.income_level === 'Upper middle income' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                    country.income_level === 'Lower middle income' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                    'bg-red-100 text-red-700 border-red-200'
                  }>
                    {country.income_level || 'N/A'}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="text-lg font-bold text-[#0071bc]">
                    {country.active_projects || 0}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {country.sector_focus?.slice(0, 3).map((sector: string, idx: number) => (
                      <Badge key={idx} className="bg-stone-100 text-stone-600 text-xs">
                        {sector}
                      </Badge>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function CountryByRegionTable({ filterSector }: { filterSector: string }) {
  const { data: countries, isLoading } = useSWR('countries-by-region-all', async () => {
    const supabase = createClient();
    
    // Get countries
    const { data: countriesData } = await supabase
      .from('worldbank_countries')
      .select('name, iso2_code, region, income_level, sector_focus')
      .order('region', { ascending: true });
    
    if (!countriesData) return [];
    
    // Get project counts grouped by country in ONE query
    const { data: projectCounts } = await supabase
      .from('worldbank_projects')
      .select('country_name');
    
    // Count projects per country
    const countMap: Record<string, number> = {};
    projectCounts?.forEach((p: any) => {
      countMap[p.country_name] = (countMap[p.country_name] || 0) + 1;
    });
    
    // Merge counts with countries
    const countriesWithCounts = countriesData.map(country => ({
      ...country,
      active_projects: countMap[country.name] || 0
    }));
    
    return countriesWithCounts;
  });

  const groupedByRegion = useMemo(() => {
    if (!countries) return {};
    
    let filtered = countries;
    if (filterSector !== 'all' && filterSector) {
      filtered = countries.filter((c: any) => c.sector_focus?.includes(filterSector));
    }

    return filtered.reduce((acc: any, country: any) => {
      const region = country.region || 'Other';
      if (!acc[region]) acc[region] = [];
      acc[region].push(country);
      return acc;
    }, {});
  }, [countries, filterSector]);

  if (isLoading) return <SearchSkeleton count={5} />;

  return (
    <div className="space-y-6">
      {Object.entries(groupedByRegion).map(([region, regionCountries]: [string, any]) => (
        <Card key={region} className="bg-white border-stone-200 shadow-sm">
          <div className="p-6 border-b border-stone-200 bg-gradient-to-r from-blue-50 to-white">
            <h3 className="text-xl font-bold text-stone-900 mb-1 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              {region}
            </h3>
            <p className="text-sm text-stone-600">{regionCountries.length} countries</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-stone-700 uppercase tracking-wider">Country</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-stone-700 uppercase tracking-wider">Income Level</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-stone-700 uppercase tracking-wider">Projects</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-stone-200">
                {regionCountries.map((country: any) => (
                  <tr key={country.iso2_code} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/country/${encodeURIComponent(country.name)}`} className="text-blue-600 hover:text-blue-800 font-medium">
                        {country.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className="text-xs">{country.income_level || 'N/A'}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-lg font-bold text-[#0071bc]">{country.active_projects || 0}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ))}
    </div>
  );
}

function CountryByIncomeTable({ filterSector, filterRegion }: { filterSector: string; filterRegion: string }) {
  const { data: countries, isLoading } = useSWR('countries-by-income-all', async () => {
    const supabase = createClient();
    
    // Get countries
    const { data: countriesData } = await supabase
      .from('worldbank_countries')
      .select('name, iso2_code, region, income_level, sector_focus')
      .order('name', { ascending: true });
    
    if (!countriesData) return [];
    
    // Get project counts grouped by country in ONE query
    const { data: projectCounts } = await supabase
      .from('worldbank_projects')
      .select('country_name');
    
    // Count projects per country
    const countMap: Record<string, number> = {};
    projectCounts?.forEach((p: any) => {
      countMap[p.country_name] = (countMap[p.country_name] || 0) + 1;
    });
    
    // Merge counts with countries
    const countriesWithCounts = countriesData.map(country => ({
      ...country,
      active_projects: countMap[country.name] || 0
    }));
    
    return countriesWithCounts;
  });

  const groupedByIncome = useMemo(() => {
    if (!countries) return {};
    
    let filtered = countries;
    if (filterSector !== 'all' && filterSector) {
      filtered = countries.filter((c: any) => c.sector_focus?.includes(filterSector));
    }
    if (filterRegion !== 'all') {
      filtered = filtered.filter((c: any) => c.region === filterRegion);
    }

    return filtered.reduce((acc: any, country: any) => {
      const income = country.income_level || 'Unclassified';
      if (!acc[income]) acc[income] = [];
      acc[income].push(country);
      return acc;
    }, {});
  }, [countries, filterSector, filterRegion]);

  const incomeOrder = ['High income', 'Upper middle income', 'Lower middle income', 'Low income', 'Unclassified'];

  if (isLoading) return <SearchSkeleton count={5} />;

  return (
    <div className="space-y-6">
      {incomeOrder.map((incomeLevel) => {
        const incomeCountries = groupedByIncome[incomeLevel];
        if (!incomeCountries || incomeCountries.length === 0) return null;

        return (
          <Card key={incomeLevel} className="bg-white border-stone-200 shadow-sm">
            <div className="p-6 border-b border-stone-200 bg-gradient-to-r from-purple-50 to-white">
              <h3 className="text-xl font-bold text-stone-900 mb-1">{incomeLevel}</h3>
              <p className="text-sm text-stone-600">{incomeCountries.length} countries</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-stone-700 uppercase tracking-wider">Country</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-stone-700 uppercase tracking-wider">Region</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-stone-700 uppercase tracking-wider">Projects</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-stone-200">
                  {incomeCountries.map((country: any) => (
                    <tr key={country.iso2_code} className="hover:bg-stone-50 transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/country/${encodeURIComponent(country.name)}`} className="text-blue-600 hover:text-blue-800 font-medium">
                          {country.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="text-xs">{country.region}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-lg font-bold text-[#0071bc]">{country.active_projects || 0}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function CountriesByProjectsTable({ filterSector, filterRegion }: { filterSector: string; filterRegion: string }) {
  const { data: countries, isLoading } = useSWR('countries-by-projects-top50', async () => {
    const supabase = createClient();
    
    // Get countries
    const { data: countriesData } = await supabase
      .from('worldbank_countries')
      .select('name, iso2_code, iso3_code, region, income_level, sector_focus');
    
    if (!countriesData) return [];
    
    // Get project counts grouped by country in ONE query
    const { data: projectCounts } = await supabase
      .from('worldbank_projects')
      .select('country_name');
    
    // Count projects per country
    const countMap: Record<string, number> = {};
    projectCounts?.forEach((p: any) => {
      countMap[p.country_name] = (countMap[p.country_name] || 0) + 1;
    });
    
    // Merge counts with countries
    const countriesWithCounts = countriesData.map(country => ({
      ...country,
      active_projects: countMap[country.name] || 0
    }));
    
    // Sort by project count and return top 50
    return countriesWithCounts
      .sort((a, b) => (b.active_projects || 0) - (a.active_projects || 0))
      .slice(0, 50);
  });

  const [sortBy, setSortBy] = useState<'name' | 'projects' | 'region' | 'income'>('projects');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchCountry, setSearchCountry] = useState('');

  const filteredCountries = useMemo(() => {
    if (!countries) return [];
    let filtered = countries;

    if (filterRegion !== 'all') {
      filtered = filtered.filter((c: any) => c.region === filterRegion);
    }
    if (filterSector !== 'all' && filterSector) {
      filtered = filtered.filter((c: any) => c.sector_focus?.includes(filterSector));
    }

    // Search filter
    if (searchCountry.trim()) {
      filtered = filtered.filter((c: any) => 
        c.name.toLowerCase().includes(searchCountry.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a: any, b: any) => {
      let aVal, bVal;
      if (sortBy === 'name') {
        aVal = a.name;
        bVal = b.name;
      } else if (sortBy === 'projects') {
        aVal = a.active_projects || 0;
        bVal = b.active_projects || 0;
      } else if (sortBy === 'region') {
        aVal = a.region;
        bVal = b.region;
      } else if (sortBy === 'income') {
        aVal = a.income_level;
        bVal = b.income_level;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [countries, filterSector, filterRegion, sortBy, sortOrder, searchCountry]);

  const toggleSort = (column: 'name' | 'projects' | 'region' | 'income') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  if (isLoading) return <SearchSkeleton count={10} />;

  return (
    <Card className="bg-white border-stone-200 shadow-sm">
      <div className="p-6 border-b border-stone-200">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-stone-900 mb-2">Top Countries by Active Projects</h2>
            <p className="text-stone-600">Ranked by number of active World Bank projects</p>
          </div>
          
          {/* Search Box */}
          <div className="relative w-80">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search country by name..."
                value={searchCountry}
                onChange={(e) => setSearchCountry(e.target.value)}
                className="pl-10 pr-10 py-2 border-stone-300 focus:ring-2 focus:ring-[#0071bc] focus:border-[#0071bc]"
              />
              {searchCountry && (
                <button
                  onClick={() => setSearchCountry('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  ✕
                </button>
              )}
            </div>
            {searchCountry && filteredCountries.length > 0 && (
              <div className="mt-2 text-xs text-stone-600">
                Found {filteredCountries.length} {filteredCountries.length === 1 ? 'country' : 'countries'}
              </div>
            )}
            {searchCountry && filteredCountries.length === 0 && (
              <div className="mt-2 text-xs text-red-600">
                No countries found matching "{searchCountry}"
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-stone-700 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  Rank
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-bold text-stone-700 uppercase tracking-wider cursor-pointer hover:bg-stone-100 transition-colors"
                onClick={() => toggleSort('name')}
              >
                <div className="flex items-center gap-2">
                  Country
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-bold text-stone-700 uppercase tracking-wider cursor-pointer hover:bg-stone-100 transition-colors"
                onClick={() => toggleSort('region')}
              >
                <div className="flex items-center gap-2">
                  Region
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-bold text-stone-700 uppercase tracking-wider cursor-pointer hover:bg-stone-100 transition-colors"
                onClick={() => toggleSort('income')}
              >
                <div className="flex items-center gap-2">
                  Income Level
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-right text-xs font-bold text-stone-700 uppercase tracking-wider cursor-pointer hover:bg-stone-100 transition-colors"
                onClick={() => toggleSort('projects')}
              >
                <div className="flex items-center gap-2 justify-end">
                  Active Projects
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-stone-200">
            {filteredCountries.map((country: any, idx: number) => {
              const isHighlighted = searchCountry.trim() && country.name.toLowerCase().includes(searchCountry.toLowerCase());
              return (
                <tr 
                  key={country.iso2_code} 
                  className={`transition-colors ${
                    isHighlighted 
                      ? 'bg-blue-50 hover:bg-blue-100 border-l-4 border-l-blue-500' 
                      : 'hover:bg-stone-50'
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                      isHighlighted 
                        ? 'bg-blue-500 text-white ring-2 ring-blue-300' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {idx + 1}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Link 
                      href={`/country/${encodeURIComponent(country.name)}`} 
                      className={`font-medium ${
                        isHighlighted 
                          ? 'text-blue-700 font-bold' 
                          : 'text-blue-600 hover:text-blue-800'
                      }`}
                    >
                      {country.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className="text-xs">{country.region}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className="text-xs">{country.income_level || 'N/A'}</Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-2xl font-bold ${
                      isHighlighted ? 'text-blue-700' : 'text-[#0071bc]'
                    }`}>
                      {country.active_projects || 0}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function ProjectComparisonTable({ filterSector, filterRegion, filterDepartment }: { filterSector: string; filterRegion: string; filterDepartment: string }) {
  const { data: projects, isLoading } = useSWR('projects-comparison-all-5000', async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('worldbank_projects')
      .select('id, project_name, country_name, region_name, total_commitment, total_amount_formatted, board_approval_date, sectors, tagged_departments')
      .order('board_approval_date', { ascending: false, nullsFirst: false })
      .limit(5000);
    return data || [];
  });

  const [sortBy, setSortBy] = useState<'name' | 'commitment' | 'date' | 'country'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    let filtered = projects;

    if (filterRegion !== 'all') {
      filtered = filtered.filter((p: any) => p.region_name === filterRegion);
    }
    if (filterSector !== 'all' && filterSector) {
      filtered = filtered.filter((p: any) => 
        p.sectors?.some((s: any) => 
          typeof s === 'string' ? s.includes(filterSector) : s.name?.includes(filterSector)
        )
      );
    }
    if (filterDepartment !== 'all' && filterDepartment) {
      filtered = filtered.filter((p: any) => p.tagged_departments?.includes(filterDepartment));
    }

    // Sort
    filtered.sort((a: any, b: any) => {
      let aVal, bVal;
      if (sortBy === 'name') {
        aVal = a.project_name;
        bVal = b.project_name;
      } else if (sortBy === 'commitment') {
        aVal = a.total_commitment || 0;
        bVal = b.total_commitment || 0;
      } else if (sortBy === 'date') {
        aVal = new Date(a.board_approval_date);
        bVal = new Date(b.board_approval_date);
      } else if (sortBy === 'country') {
        aVal = a.country_name;
        bVal = b.country_name;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [projects, filterRegion, filterSector, filterDepartment, sortBy, sortOrder]);

  const toggleSort = (column: 'name' | 'commitment' | 'date' | 'country') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  if (isLoading) return <SearchSkeleton count={10} />;

  return (
    <Card className="bg-white border-stone-200 shadow-sm">
      <div className="p-6 border-b border-stone-200">
        <h2 className="text-2xl font-bold text-stone-900 mb-2">Project Comparison</h2>
        <p className="text-stone-600">
          Showing {filteredProjects.length} projects
          {filterRegion !== 'all' && ` in ${filterRegion}`}
          {filterSector !== 'all' && ` in ${filterSector} sector`}
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-bold text-stone-700 uppercase tracking-wider cursor-pointer hover:bg-stone-100 transition-colors"
                onClick={() => toggleSort('name')}
              >
                <div className="flex items-center gap-2">
                  Project Name
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-bold text-stone-700 uppercase tracking-wider cursor-pointer hover:bg-stone-100 transition-colors"
                onClick={() => toggleSort('country')}
              >
                <div className="flex items-center gap-2">
                  Country
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-right text-xs font-bold text-stone-700 uppercase tracking-wider cursor-pointer hover:bg-stone-100 transition-colors"
                onClick={() => toggleSort('commitment')}
              >
                <div className="flex items-center gap-2 justify-end">
                  Commitment
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-bold text-stone-700 uppercase tracking-wider cursor-pointer hover:bg-stone-100 transition-colors"
                onClick={() => toggleSort('date')}
              >
                <div className="flex items-center gap-2">
                  Approval Date
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-stone-700 uppercase tracking-wider">Sectors</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-stone-200">
            {filteredProjects.map((project: any) => (
              <tr key={project.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-6 py-4">
                  <Link href={`/project/${project.id}`} className="text-blue-600 hover:text-blue-800 font-medium line-clamp-2">
                    {project.project_name}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link href={`/country/${encodeURIComponent(project.country_name)}`} className="text-stone-700 hover:text-blue-600">
                    {project.country_name}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="text-lg font-bold text-[#0071bc]">
                    {project.total_amount_formatted || `$${project.total_commitment}M`}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-600">
                  {new Date(project.board_approval_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {project.sectors?.slice(0, 2).map((sector: any, idx: number) => (
                      <Badge key={idx} className="bg-purple-100 text-purple-700 text-xs">
                        {typeof sector === 'string' ? sector : sector.name || 'N/A'}
                      </Badge>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
