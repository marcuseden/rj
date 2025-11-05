'use client';

import { useState, useEffect } from 'react';
import { Search, FileText, Calendar, ExternalLink, Building2, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface WorldBankDocument {
  id: string;
  title: string;
  url?: string;
  summary: string;
  date: string;
  tags?: {
    documentType?: string;
    sectors?: string[];
    regions?: string[];
    initiatives?: string[];
    priority?: string;
  };
  sourceReference?: {
    originalUrl: string;
  };
  metadata?: {
    readingTime?: number;
  };
}

export default function WorldBankDocsPage() {
  const [allDocuments, setAllDocuments] = useState<WorldBankDocument[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<WorldBankDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      // Filter documents
      const query = searchQuery.toLowerCase();
      const filtered = allDocuments.filter(doc =>
        doc.title.toLowerCase().includes(query) ||
        doc.summary.toLowerCase().includes(query) ||
        doc.tags?.sectors?.some(s => s.toLowerCase().includes(query)) ||
        doc.tags?.regions?.some(r => r.toLowerCase().includes(query)) ||
        doc.tags?.initiatives?.some(i => i.toLowerCase().includes(query))
      );
      setFilteredDocs(filtered);

      // Generate autocomplete suggestions
      const titleSuggestions = allDocuments
        .filter(doc => doc.title.toLowerCase().includes(query))
        .slice(0, 5)
        .map(doc => doc.title);
      setSuggestions(titleSuggestions);
      setShowSuggestions(true);
    } else {
      setFilteredDocs(allDocuments);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, allDocuments]);

  const loadDocuments = async () => {
    try {
      const response = await fetch('/data/worldbank-strategy/ajay-banga-documents-verified.json');
      if (response.ok) {
        const data = await response.json();
        setAllDocuments(data);
        setFilteredDocs(data);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
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
      <div className="bg-white border-b border-stone-200 px-6 py-6">
        <h1 className="text-3xl font-bold text-stone-900 mb-2">
          World Bank Documents
        </h1>
        <p className="text-stone-600">
          {allDocuments.length} strategy documents and publications
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search with Autocomplete */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-stone-400 h-5 w-5 z-10" />
            <Input
              type="text"
              placeholder="Search documents... (e.g., 'climate', 'mexico', 'agriculture')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="pl-12 pr-4 py-6 text-lg bg-white border-stone-200 focus:ring-2 focus:ring-[#0071bc]"
            />
            
            {/* Autocomplete Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <Card className="absolute top-full mt-2 w-full z-20 bg-white border-stone-200 shadow-lg">
                <CardContent className="p-2">
                  {suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectSuggestion(suggestion)}
                      className="w-full text-left px-4 py-3 hover:bg-stone-50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-stone-400" />
                        <span className="text-sm text-stone-900">{suggestion}</span>
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-stone-600">
          Showing {filteredDocs.length} of {allDocuments.length} documents
        </div>

        {/* Document List */}
        <div className="space-y-4">
          {filteredDocs.map((doc) => (
            <Link key={doc.id} href={`/document/${doc.id}`}>
              <Card className="bg-white border-stone-200 hover:shadow-lg hover:border-[#0071bc] transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {doc.tags?.documentType && (
                          <Badge className="bg-stone-100 text-stone-700 border-stone-200">
                            {doc.tags.documentType}
                          </Badge>
                        )}
                        {doc.tags?.priority && (
                          <Badge className={
                            doc.tags.priority === 'high' 
                              ? 'bg-red-100 text-red-700 border-red-200' 
                              : doc.tags.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                              : 'bg-green-100 text-green-700 border-green-200'
                          }>
                            {doc.tags.priority}
                          </Badge>
                        )}
                        <span className="text-sm text-stone-500">{doc.date}</span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-stone-900 mb-2 hover:text-[#0071bc] transition-colors">
                        {doc.title}
                      </h3>
                      
                      <p className="text-stone-600 mb-4 line-clamp-3">
                        {doc.summary}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {doc.tags?.sectors?.slice(0, 3).map((sector, idx) => (
                          <Badge key={idx} variant="secondary" className="bg-stone-50 text-stone-600 border-stone-200 text-xs">
                            <Building2 className="w-3 h-3 mr-1" />
                            {sector}
                          </Badge>
                        ))}
                        {doc.tags?.regions?.slice(0, 2).map((region, idx) => (
                          <Badge key={idx} variant="secondary" className="bg-stone-50 text-stone-600 border-stone-200 text-xs">
                            <Globe className="w-3 h-3 mr-1" />
                            {region}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {doc.metadata?.readingTime && (
                        <span className="text-sm text-stone-500">
                          {doc.metadata.readingTime} min read
                        </span>
                      )}
                      {(doc.sourceReference?.originalUrl || doc.url) && (
                        <ExternalLink className="h-5 w-5 text-stone-400" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

          {filteredDocs.length === 0 && (
            <Card className="bg-white border-stone-200 p-12 text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-stone-400" />
              <h3 className="text-lg font-semibold text-stone-900 mb-2">
                No documents found
              </h3>
              <p className="text-stone-600 mb-4">
                {searchQuery ? 'Try a different search term' : 'No documents available'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-[#0071bc] hover:text-[#005a99]"
                >
                  Clear search
                </button>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
