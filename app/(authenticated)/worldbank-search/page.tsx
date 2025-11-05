'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, ChevronDown, MapPin, Building2, FileText, Briefcase, Globe, Share2 } from 'lucide-react';
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

type QuickFilterType = 'all' | 'rj-banga' | 'strategy' | 'departments' | 'geographic' | 'countries' | 'people' | 'projects';

export default function WorldBankSearchPage() {
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
      const cached = getCachedFilters();
      if (cached) return cached;
      
      const data = await fetchSearchFilters();
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
  const { data: searchResponse, isLoading: resultsLoading, error } = useSWR(
    cacheKey,
    () => fetchSearchResults(searchParams),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
      keepPreviousData: true
    }
  );

  const results = searchResponse?.results || [];
  const pagination = searchResponse?.pagination;
  const isLoading = resultsLoading && !searchResponse;

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
        <h1 className="text-2xl md:text-3xl font-bold text-stone-900 mb-2">
          World Bank Knowledge Base
        </h1>
        <p className="text-stone-600">
          {pagination ? `${pagination.total} items` : 'Loading...'} • Articles, strategies, people, countries, projects, and departments
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Search Bar */}
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

            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className={`px-4 py-6 border-stone-300 hover:bg-stone-50 transition-all shadow-sm hover:shadow-md ${
                showFilters ? 'bg-stone-100 border-stone-400' : 'bg-white'
              }`}
            >
              <Filter className="h-5 w-5 mr-2" />
              <span className="hidden md:inline">Filters</span>
              <ChevronDown className={`h-4 w-4 ml-2 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Quick Filter Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Documents', icon: null },
              { key: 'rj-banga', label: 'RJ Banga', icon: FileText },
              { key: 'strategy', label: 'Strategy Docs', icon: Briefcase },
              { key: 'departments', label: 'Departments', icon: Building2 },
              { key: 'geographic', label: 'Geographic', icon: MapPin },
              { key: 'countries', label: 'Countries', icon: Globe },
              { key: 'people', label: 'People', icon: Share2 },
              { key: 'projects', label: 'Projects', icon: Briefcase }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setQuickFilter(key as QuickFilterType)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                  quickFilter === key
                    ? 'bg-[#0071bc] text-white shadow-md'
                    : 'bg-white text-stone-700 border border-stone-300 hover:border-stone-400 hover:shadow-sm'
                }`}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && filters && (
          <div className="mb-6 animate-in slide-in-from-top-2 duration-200">
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

        {/* Results */}
        {pagination && (
          <div className="mb-4 text-sm text-stone-600">
            Showing {results.length} of {pagination.total} items
            {page > 1 && ` (page ${page} of ${pagination.pages})`}
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
            <div className="grid grid-cols-1 gap-4">
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
      </div>
    </div>
  );
}

// Document Card Component
function DocumentCard({ doc }: { doc: SearchDocument }) {
  // Smart routing based on source type
  const getLink = () => {
    if (doc.sourceType === 'country') return `/country/${encodeURIComponent(doc.title)}`;
    if (doc.sourceType === 'person') return `/worldbank-orgchart#${doc.id}`;
    if (doc.sourceType === 'project') return `/project/${doc.id}`;
    return `/document/${doc.id}`;
  };
  
  return (
    <Link href={getLink()}>
      <Card className="bg-white border-stone-200 hover:shadow-lg hover:border-[#0071bc] transition-all cursor-pointer group">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {/* Source Type Badge */}
                <Badge className={`text-xs font-medium ${
                  doc.sourceType === 'speech' 
                    ? 'bg-blue-100 text-blue-700 border-blue-200'
                    : doc.sourceType === 'strategy'
                    ? 'bg-purple-100 text-purple-700 border-purple-200'
                    : doc.sourceType === 'department'
                    ? 'bg-green-100 text-green-700 border-green-200'
                    : doc.sourceType === 'geographic'
                    ? 'bg-orange-100 text-orange-700 border-orange-200'
                    : doc.sourceType === 'country'
                    ? 'bg-teal-100 text-teal-700 border-teal-200'
                    : doc.sourceType === 'person'
                    ? 'bg-pink-100 text-pink-700 border-pink-200'
                    : doc.sourceType === 'project'
                    ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                    : 'bg-stone-100 text-stone-700 border-stone-200'
                }`}>
                  {getSourceIcon(doc.sourceType)}
                  {doc.sourceType}
                </Badge>
                
                {doc.tags?.documentType && (
                  <Badge className="bg-stone-100 text-stone-700 border-stone-200 text-xs">
                    {doc.tags.documentType}
                  </Badge>
                )}
                
                {doc.tags?.priority && (
                  <Badge className={
                    doc.tags.priority === 'high' 
                      ? 'bg-red-100 text-red-700 border-red-200 text-xs font-medium' 
                      : 'bg-stone-100 text-stone-600 border-stone-200 text-xs'
                  }>
                    {doc.tags.priority}
                  </Badge>
                )}
                
                <span className="text-xs text-stone-500">{doc.date}</span>
              </div>
              
              <h3 className="text-base md:text-lg font-semibold text-stone-900 mb-2 group-hover:text-[#0071bc] transition-colors">
                {doc.title}
              </h3>
              
              <p className="text-sm text-stone-600 line-clamp-2 md:line-clamp-3 mb-3">
                {doc.summary}
              </p>

              {/* Tags Row */}
              <div className="flex flex-wrap gap-2">
                {doc.tags?.authors?.map((author, idx) => (
                  <Badge key={`author-${idx}`} variant="secondary" className="bg-blue-50 text-[#0071bc] border-blue-200 text-xs">
                    {author}
                  </Badge>
                ))}
                
                {doc.tags?.regions?.slice(0, 2).map((region, idx) => (
                  <Badge key={`region-${idx}`} variant="outline" className="text-xs">
                    <MapPin className="h-3 w-3 mr-1" />
                    {region}
                  </Badge>
                ))}
                
                {doc.tags?.departments?.slice(0, 2).map((dept, idx) => (
                  <Badge key={`dept-${idx}`} variant="outline" className="text-xs">
                    <Building2 className="h-3 w-3 mr-1" />
                    {dept}
                  </Badge>
                ))}
                
                {doc.tags?.sectors?.slice(0, 2).map((sector, idx) => (
                  <Badge key={`sector-${idx}`} variant="outline" className="text-xs text-stone-600">
                    {sector}
                  </Badge>
                ))}
              </div>
            </div>

            {doc.metadata?.readingTime && (
              <div className="flex flex-col items-end gap-1">
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
