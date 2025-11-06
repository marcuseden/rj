'use client';

import { useState, useEffect } from 'react';
import { Search, Globe, MapPin, TrendingUp, Users, DollarSign, Briefcase, BarChart3, ChevronDown, Target, Filter, Building2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';
import { InteractiveWorldMap } from '@/components/InteractiveWorldMapWrapper';

interface Country {
  id: string;
  name: string;
  iso2_code: string;
  iso3_code: string;
  region: string;
  income_level?: string;
  capital_city?: string;
  active_projects?: number;
  portfolio_value_formatted?: string;
  sector_focus?: string[];
  regional_vp_name?: string;
  latitude?: string;
  longitude?: string;
  
  // Demographics & Development Indicators
  population?: string;
  life_expectancy?: number;
  infant_mortality?: number;
  literacy_rate?: number;
  unemployment_rate?: number;
  gdp_growth_rate?: number;
  access_electricity_pct?: number;
  access_water_pct?: number;
  poverty_rate?: string;
  gdp_per_capita?: string;
  
  // Economic Structure
  primary_sector?: string;
  natural_resources?: string[];
  agriculture_pct_gdp?: number;
  industry_pct_gdp?: number;
  services_pct_gdp?: number;
  mineral_rents_pct?: number;
  oil_rents_pct?: number;
  exports_pct_gdp?: number;
  imports_pct_gdp?: number;
}

export default function CountriesPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [displayedCountries, setDisplayedCountries] = useState<Country[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<Country[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 30;
  const [showKpiDropdown, setShowKpiDropdown] = useState(false);

  // Region colors
  const regionColors: Record<string, string> = {
    'Africa': '#e74c3c',
    'East Asia & Pacific': '#3498db',
    'Europe & Central Asia': '#9b59b6',
    'Latin America & Caribbean': '#f39c12',
    'Middle East & North Africa': '#e67e22',
    'South Asia': '#1abc9c',
    'North America': '#34495e',
  };

  const [totalProjectsCount, setTotalProjectsCount] = useState(0);

  useEffect(() => {
    loadCountries();
    loadProjectsCount();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedRegion, countries]);

  useEffect(() => {
    // Paginate filtered results
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    setDisplayedCountries(filteredCountries.slice(start, end));
  }, [filteredCountries, page]);

  const loadProjectsCount = async () => {
    try {
      const supabase = createClient();
      const { count, error } = await supabase
        .from('worldbank_projects')
        .select('*', { count: 'exact', head: true });
      
      if (!error && count !== null) {
        setTotalProjectsCount(count);
        console.log(`✅ Total projects count: ${count}`);
      }
    } catch (error) {
      console.error('❌ Error loading projects count:', error);
    }
  };

  const loadCountries = async () => {
    console.log('🌍 Loading countries...');
    
    try {
      // Check cache first
      const cacheKey = 'worldbank_countries_cache';
      const cacheTimeKey = 'worldbank_countries_cache_time';
      const cacheValidityMs = 30 * 60 * 1000; // 30 minutes
      
      const cached = localStorage.getItem(cacheKey);
      const cacheTime = localStorage.getItem(cacheTimeKey);
      
      if (cached && cacheTime) {
        const age = Date.now() - parseInt(cacheTime);
        if (age < cacheValidityMs) {
          console.log('✅ Using cached data (age: ' + Math.round(age / 1000) + 's)');
          const cachedData = JSON.parse(cached);
          setCountries(cachedData);
          setFilteredCountries(cachedData);
          setLoading(false);
          return;
        }
      }
      
      // Fetch from Supabase
      console.log('📡 Fetching from Supabase...');
      console.log('🔌 Creating Supabase client...');
      const supabase = createClient();
      console.log('✅ Client created');
      
      console.log('🔍 Starting query to worldbank_countries...');
      const { data, error } = await supabase
        .from('worldbank_countries')
        .select('*');
      
      console.log('📊 Query complete. Data:', data?.length, 'Error:', error);

      if (error) {
        console.error('❌ Supabase error:', error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        setLoading(false);
        return;
      }
      
      if (data && data.length > 0) {
        console.log(`✅ Loaded ${data.length} countries from database`);
        
        // Cache the data
        console.log('💾 Caching data to localStorage...');
        localStorage.setItem(cacheKey, JSON.stringify(data));
        localStorage.setItem(cacheTimeKey, Date.now().toString());
        console.log('✅ Data cached');
        
        console.log('📝 Setting state with countries...');
        setCountries(data);
        setFilteredCountries(data);
        console.log('✅ State updated');
      } else {
        console.warn('⚠️ No countries returned');
      }
      
    } catch (error: any) {
      console.error('❌ Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = countries;

    if (selectedRegion !== 'all') {
      filtered = filtered.filter(c => c.region === selectedRegion);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.iso2_code.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q) ||
        c.capital_city?.toLowerCase().includes(q)
      );
    }

    setFilteredCountries(filtered);
    setPage(1); // Reset to first page when filters change
  };

  const updateSuggestions = (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const q = query.toLowerCase();
    const matches = countries
      .filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.iso2_code.toLowerCase().includes(q) ||
        c.capital_city?.toLowerCase().includes(q)
      )
      .slice(0, 8);

    setSuggestions(matches);
    setShowSuggestions(matches.length > 0);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    updateSuggestions(value);
  };

  const selectCountry = (country: Country) => {
    setSearchQuery(country.name);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const getRegionColor = (region: string, opacity: number = 1) => {
    const color = regionColors[region] || '#95a5a6';
    if (opacity === 1) return color;
    // Convert hex to rgba
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const uniqueRegions = Array.from(new Set(countries.map(c => c.region))).filter(Boolean).sort();

  const stats = {
    totalCountries: countries.length,
    totalProjects: totalProjectsCount,
    regions: uniqueRegions.length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-4 md:px-6 py-4 md:py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 md:gap-3 mb-2">
                <Globe className="h-6 w-6 md:h-8 md:w-8 text-[#0071bc]" />
                <h1 className="text-xl md:text-3xl font-bold text-stone-900">
                  Countries
                </h1>
              </div>
              <p className="text-sm md:text-base text-stone-600">
                {stats.totalCountries} countries
                <span className="hidden md:inline"> across {stats.regions} regions with {stats.totalProjects.toLocaleString()} active projects</span>
              </p>
            </div>
            
            {/* Analytics & Views Dropdown - Hidden on Mobile */}
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
                      <Link href="/worldbank-search" onClick={() => setShowKpiDropdown(false)}>
                        <button className="w-full text-left px-3 py-2 text-sm text-stone-700 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors flex items-center gap-2">
                          <TrendingUp className="h-3.5 w-3.5" />
                          Knowledge Base Search
                        </button>
                      </Link>
                      <button 
                        onClick={() => {
                          setSelectedRegion('all');
                          setShowKpiDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-stone-700 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors flex items-center gap-2"
                      >
                        <Globe className="h-3.5 w-3.5" />
                        View All Countries
                      </button>
                      <button 
                        onClick={() => {
                          setShowKpiDropdown(false);
                          document.getElementById('region-filter')?.focus();
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-stone-700 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors flex items-center gap-2"
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        Filter by Region
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
                      <Link href="/worldbank-search?type=projects" onClick={() => setShowKpiDropdown(false)}>
                        <button className="w-full text-left px-3 py-2 text-sm text-stone-700 hover:bg-purple-50 hover:text-purple-700 rounded-md transition-colors flex items-center gap-2">
                          <Target className="h-3.5 w-3.5" />
                          View All Projects
                        </button>
                      </Link>
                      <Link href="/worldbank-search" onClick={() => setShowKpiDropdown(false)}>
                        <button className="w-full text-left px-3 py-2 text-sm text-stone-700 hover:bg-purple-50 hover:text-purple-700 rounded-md transition-colors flex items-center gap-2">
                          <Filter className="h-3.5 w-3.5" />
                          Advanced Search & Filters
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8">
        {/* Stats Cards - Hidden on Mobile */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white border-stone-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-stone-600 mb-1">Total Countries</p>
                  <p className="text-3xl font-bold text-stone-900">{stats.totalCountries}</p>
                </div>
                <Globe className="h-12 w-12 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Link href="/worldbank-search?type=projects">
            <Card className="bg-white border-stone-200 hover:shadow-lg hover:border-[#0071bc] transition-all cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-stone-600 mb-1 group-hover:text-[#0071bc] transition-colors">Active Projects</p>
                    <p className="text-3xl font-bold text-stone-900 group-hover:text-[#0071bc] transition-colors">{stats.totalProjects.toLocaleString()}</p>
                  </div>
                  <Briefcase className="h-12 w-12 text-purple-500 opacity-20 group-hover:opacity-40 transition-opacity" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card className="bg-white border-stone-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-stone-600 mb-1">Global Regions</p>
                  <p className="text-3xl font-bold text-stone-900">{stats.regions}</p>
                </div>
                <MapPin className="h-12 w-12 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Full Width Interactive World Map Section - Hidden on Mobile */}
      <div className="hidden md:block bg-white border-y border-stone-200 mb-8 overflow-hidden">
        <div className="max-w-[1600px] mx-auto">
          <div className="px-4 md:px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-stone-900 mb-1">Interactive World Map</h2>
                <p className="text-sm text-stone-600">Click on any country to view details</p>
              </div>
              <Badge className="bg-blue-50 text-[#0071bc] border-blue-200 text-sm px-4 py-2">
                <Globe className="w-4 h-4 mr-2 inline" />
                {countries.length} Countries
              </Badge>
            </div>
            
            {/* Interactive Map */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-50 via-teal-50 to-blue-50 rounded-xl border-2 border-stone-200 shadow-lg overflow-hidden">
                <InteractiveWorldMap
                  countries={countries}
                  onCountryHover={setHoveredCountry}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Search Section */}
        <Card className="bg-white border-stone-200 mb-6 md:mb-8">
          <CardContent className="p-4 md:p-6">
            <div className="relative">
              <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-stone-400 h-4 w-4 md:h-5 md:w-5 z-10" />
              <Input
                type="text"
                placeholder="Search countries..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => searchQuery && updateSuggestions(searchQuery)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="pl-10 md:pl-12 pr-4 py-4 md:py-6 text-base md:text-lg bg-white border-stone-300 focus:ring-2 focus:ring-[#0071bc] focus:border-[#0071bc] transition-all shadow-sm hover:shadow-md"
              />

              {/* Autocomplete Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200 rounded-lg shadow-xl z-50 overflow-hidden max-h-96 overflow-y-auto">
                  {suggestions.map((country) => (
                    <Link
                      key={country.id}
                      href={`/country/${encodeURIComponent(country.name)}`}
                      className="block w-full text-left px-4 py-3 hover:bg-stone-50 transition-colors border-b border-stone-100 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-stone-900">{country.name}</p>
                          <p className="text-xs text-stone-500 mt-0.5">
                            {country.capital_city && `${country.capital_city} • `}
                            {country.region}
                          </p>
                        </div>
                        {country.active_projects && country.active_projects > 0 && (
                          <Badge className="bg-blue-50 text-[#0071bc] border-blue-200 text-xs ml-3">
                            {country.active_projects} projects
                          </Badge>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-3 md:mt-4 text-xs md:text-sm text-stone-600">
              Showing {displayedCountries.length} of {filteredCountries.length} countries
              <span className="hidden md:inline">
                {filteredCountries.length < countries.length && ` (filtered from ${countries.length} total)`}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Country List - Simplified on Mobile, Grid on Desktop */}
        <div className="space-y-2 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4">
          {displayedCountries.map((country) => (
            <Link key={country.id} href={`/country/${encodeURIComponent(country.name)}`}>
              {/* Mobile: Simple List Cards */}
              <Card className="md:hidden bg-white border-stone-200 hover:shadow-md hover:border-[#0071bc] transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Globe className="w-5 h-5 text-[#0071bc] flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-stone-900 text-base truncate">
                          {country.name}
                        </h3>
                        <p className="text-xs text-stone-600 truncate">{country.region}</p>
                      </div>
                    </div>
                    {country.active_projects && country.active_projects > 0 && (
                      <Badge className="bg-blue-50 text-[#0071bc] border-blue-200 text-xs flex-shrink-0">
                        {country.active_projects}
                      </Badge>
                    )}
                    <ChevronRight className="w-5 h-5 text-stone-400 flex-shrink-0 ml-2" />
                  </div>
                </CardContent>
              </Card>
              
              {/* Desktop: Detailed Grid Cards */}
              <Card className="hidden md:block bg-white border-stone-200 hover:shadow-lg hover:border-[#0071bc] transition-all cursor-pointer group h-full">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#0071bc]" />
                      <h3 className="font-semibold text-stone-900 group-hover:text-[#0071bc] transition-colors">
                        {country.name}
                      </h3>
                    </div>
                    {country.iso2_code && (
                      <Badge variant="outline" className="text-xs">
                        {country.iso2_code}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    {country.capital_city && (
                      <div className="flex items-center gap-2 text-stone-600">
                        <MapPin className="h-4 w-4" />
                        <span>{country.capital_city}</span>
                      </div>
                    )}

                    {country.income_level && (
                      <div className="flex items-center gap-2 text-stone-600">
                        <TrendingUp className="h-4 w-4" />
                        <span>{country.income_level}</span>
                      </div>
                    )}

                    {country.population && (
                      <div className="flex items-center gap-2 text-stone-600">
                        <Users className="h-4 w-4" />
                        <span>{country.population}</span>
                      </div>
                    )}

                    {country.active_projects !== undefined && country.active_projects > 0 && (
                      <div className="flex items-center gap-2 text-stone-600">
                        <Briefcase className="h-4 w-4" />
                        <span>{country.active_projects} Active Projects</span>
                      </div>
                    )}
                  </div>

                  {country.sector_focus && country.sector_focus.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {country.sector_focus.slice(0, 3).map((sector, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {sector}
                        </Badge>
                      ))}
                      {country.sector_focus.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{country.sector_focus.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-stone-100">
                    <span className="text-xs text-stone-500">{country.region}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {filteredCountries.length > itemsPerPage && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              variant="outline"
              className="text-stone-600"
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, Math.ceil(filteredCountries.length / itemsPerPage)) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    variant={page === pageNum ? 'default' : 'outline'}
                    className={page === pageNum ? 'bg-[#0071bc] text-white' : 'text-stone-600'}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              {Math.ceil(filteredCountries.length / itemsPerPage) > 5 && (
                <span className="text-stone-500">...</span>
              )}
            </div>

            <Button
              onClick={() => setPage(p => Math.min(Math.ceil(filteredCountries.length / itemsPerPage), p + 1))}
              disabled={page >= Math.ceil(filteredCountries.length / itemsPerPage)}
              variant="outline"
              className="text-stone-600"
            >
              Next
            </Button>
          </div>
        )}

        {filteredCountries.length === 0 && (
          <Card className="bg-white border-stone-200 p-12 text-center">
            <Globe className="h-16 w-16 text-stone-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-stone-900 mb-2">No countries found</h3>
            <p className="text-stone-600">Try adjusting your search or filters</p>
          </Card>
        )}
      </div>
    </div>
  );
}

