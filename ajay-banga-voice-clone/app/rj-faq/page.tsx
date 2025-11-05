'use client';

import { useState, useEffect } from 'react';
import { Search, Calendar, Tag } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AppLayout } from '@/components/app-layout';
import { formatNumber } from '@/lib/utils';
// Import speeches database
const speechesDatabase = {
  total_speeches: 14,
  total_words: 19904,
  speeches: []
};

interface Speech {
  id: string;
  title: string;
  date: string;
  location: string;
  url: string;
  summary: string;
  key_themes: string[];
  word_count: number;
  transcript?: string;
}

export default function RJFAQPage() {
  const [speeches, setSpeeches] = useState<Speech[]>([]);
  const [filteredSpeeches, setFilteredSpeeches] = useState<Speech[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<string>('all');
  const [allThemes, setAllThemes] = useState<string[]>([]);

  const [statsLoaded, setStatsLoaded] = useState(false);
  const [stats, setStats] = useState({ total_speeches: 14, total_words: 19904 });

  useEffect(() => {
    loadSpeeches();
    // Load stats
    fetch('/speeches_database.json')
      .then(res => res.json())
      .then(data => {
        setStats({ total_speeches: data.total_speeches, total_words: data.total_words });
        setStatsLoaded(true);
      })
      .catch(err => console.error('Error loading stats:', err));
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedTheme, speeches]);

  const loadSpeeches = async () => {
    try {
      const response = await fetch('/speeches_database.json');
      const data = await response.json();

      // Transform the data to match the expected Speech interface
      const speechData: Speech[] = (data.speeches || []).map((speech: any) => ({
        id: speech.id.toString(),
        title: speech.title || 'Untitled Speech',
        date: speech.date_prefix || 'Unknown Date',
        location: 'World Bank Group', // Default location since not in JSON
        url: `/speeches/${speech.id}`, // Link to the speech detail page
        summary: speech.text ? speech.text.substring(0, 300) + '...' : 'No summary available',
        key_themes: ['Development', 'Economic Growth', 'Global Cooperation'], // Default themes
        word_count: speech.word_count || 0
      }));
      setSpeeches(speechData);

      // Extract unique themes (using default themes for now)
      const themes = new Set<string>();
      speechData.forEach(speech => {
        speech.key_themes?.forEach((theme: string) => themes.add(theme));
      });
      setAllThemes(Array.from(themes).sort());
    } catch (error) {
      console.error('Error loading speeches:', error);
    }
  };

  const applyFilters = () => {
    let filtered = speeches;

    // Text search
    if (searchQuery.trim()) {
      const queryLower = searchQuery.toLowerCase();
      filtered = filtered.filter(speech =>
        speech.title.toLowerCase().includes(queryLower) ||
        (speech.summary && speech.summary.toLowerCase().includes(queryLower)) ||
        speech.location.toLowerCase().includes(queryLower) ||
        speech.key_themes.some(theme => theme.toLowerCase().includes(queryLower))
      );
    }

    // Theme filter
    if (selectedTheme !== 'all') {
      filtered = filtered.filter(speech =>
        speech.key_themes.includes(selectedTheme)
      );
    }

    setFilteredSpeeches(filtered);
  };

  const clearFilters = () => {
    setSelectedTheme('all');
    setSearchQuery('');
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-6 py-12">
          {/* Page Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-semibold text-stone-900 mb-3">
              Browse CEO Speeches
            </h1>
            <p className="text-lg text-stone-600">
              Search and filter through {stats.total_speeches} speeches with {formatNumber(stats.total_words)} words analyzed
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search speeches, topics, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-base border-stone-200 bg-white focus:border-stone-400 focus:ring-stone-400"
              />
            </div>
          </div>

          {/* Filter Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Filter by Theme
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTheme('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedTheme === 'all'
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                All Themes
              </button>
              {allThemes.map(theme => (
                <button
                  key={theme}
                  onClick={() => setSelectedTheme(theme)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedTheme === theme
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>
            {(selectedTheme !== 'all' || searchQuery) && (
              <button
                onClick={clearFilters}
                className="mt-3 text-sm text-stone-600 hover:text-stone-900"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Results Count */}
          <div className="mb-6 text-sm text-stone-600">
            Showing {filteredSpeeches.length} of {speeches.length} speeches
          </div>

          {/* Speeches Grid */}
          <div className="space-y-4">
            {filteredSpeeches.map((speech) => (
              <Card key={speech.id} className="bg-white border-stone-200 hover:border-stone-300 hover:shadow-sm transition-all">
                <div className="p-6">
                  {/* Header with date and metadata */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm text-stone-500">
                      <Calendar className="h-4 w-4" />
                      <span>{speech.date}</span>
                      <span className="text-stone-300">•</span>
                      <span>{formatNumber(speech.word_count)} words</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold text-stone-900 mb-2 leading-tight">
                    {speech.title}
                  </h3>

                  {/* Location */}
                  <p className="text-sm text-stone-600 mb-3">
                    {speech.location}
                  </p>

                  {/* Summary */}
                  <p className="text-stone-700 leading-relaxed mb-4">
                    {speech.summary}
                  </p>

                  {/* Themes */}
                  {speech.key_themes && speech.key_themes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {speech.key_themes.map((theme, index) => (
                        <Badge
                          key={index}
                          className="bg-stone-100 text-stone-700 border-stone-200"
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Read more link */}
                  {speech.url && (
                    <a
                      href={speech.url}
                      className="inline-flex items-center text-sm font-medium text-stone-900 hover:text-stone-700 transition-colors"
                    >
                      Read full speech
                      <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* No results message */}
          {filteredSpeeches.length === 0 && (
            <Card className="bg-white border-stone-200 p-12 text-center">
              <p className="text-stone-600 mb-2">No speeches found matching your criteria</p>
              <button
                onClick={clearFilters}
                className="text-sm text-stone-900 hover:text-stone-700 font-medium"
              >
                Clear filters
              </button>
            </Card>
          )}
      </div>
    </AppLayout>
  );
}
