'use client';

import { useState, useEffect } from 'react';
import { Search, Globe, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';

interface Country {
  id: string;
  name: string;
  iso2_code: string;
  region: string;
  capital_city?: string;
  active_projects?: number;
}

export default function CountriesMobilePage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCountries();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCountries(countries);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = countries.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.region.toLowerCase().includes(query) ||
      c.capital_city?.toLowerCase().includes(query)
    );
    setFilteredCountries(filtered);
  }, [searchQuery, countries]);

  const loadCountries = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('worldbank_countries')
        .select('id, name, iso2_code, region, capital_city')
        .order('name', { ascending: true });

      if (error) throw error;
      
      if (data) {
        setCountries(data);
        setFilteredCountries(data);
      }
    } catch (error) {
      console.error('Error loading countries:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
              placeholder="Search countries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-lg bg-stone-50 text-base focus:outline-none focus:ring-2 focus:ring-[#0071bc] focus:border-[#0071bc]"
            />
          </div>
          <p className="text-xs text-stone-500 mt-2">
            {filteredCountries.length} {filteredCountries.length === 1 ? 'country' : 'countries'}
          </p>
        </div>
      </div>

      {/* iPhone-Style Country List */}
      <div className="divide-y divide-stone-200 bg-white">
        {filteredCountries.map((country) => (
          <Link key={country.id} href={`/country/${encodeURIComponent(country.name)}`}>
            <div className="flex items-center gap-3 p-4 active:bg-stone-50">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#0071bc] to-[#005a99] flex items-center justify-center flex-shrink-0">
                <Globe className="h-6 w-6 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-stone-900 text-base truncate">
                  {country.name}
                </h3>
                <p className="text-sm text-stone-600 truncate">
                  {country.capital_city || country.region}
                </p>
              </div>
              
              {country.active_projects && country.active_projects > 0 && (
                <Badge className="bg-blue-50 text-[#0071bc] border-blue-200 text-xs flex-shrink-0">
                  {country.active_projects}
                </Badge>
              )}
              
              <ChevronRight className="h-6 w-6 text-stone-400 flex-shrink-0" />
            </div>
          </Link>
        ))}
      </div>

      {filteredCountries.length === 0 && (
        <div className="p-12 text-center">
          <p className="text-stone-600">No countries found</p>
          <p className="text-sm text-stone-500 mt-1">Try a different search</p>
        </div>
      )}
    </div>
  );
}

