'use client';

import { useState, useEffect } from 'react';
import { Search, FileText, Calendar, ExternalLink, User, Building2, Globe, Briefcase, Filter, ChevronDown, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface WorldBankDocument {
  id: string;
  title: string;
  url: string;
  summary: string;
  date: string;
  type: string;
  tags: {
    documentType: string;
    sectors: string[];
    regions: string[];
    initiatives: string[];
    authors: string[];
    priority: string;
    departments?: string[];
  };
  sourceReference: {
    originalUrl: string;
    scrapedFrom: string;
  };
  metadata: {
    wordCount: number;
    readingTime: number;
  };
}

export default function WorldBankSearchPage() {
  const [documents, setDocuments] = useState<WorldBankDocument[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<WorldBankDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<WorldBankDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [selectedDocType, setSelectedDocType] = useState<string>('all');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  // Unique values for filters
  const [docTypes, setDocTypes] = useState<string[]>([]);
  const [sectors, setSectors] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedDocType, selectedSector, selectedRegion, selectedPriority, documents]);

  const loadDocuments = async () => {
    try {
      const response = await fetch('/data/worldbank-strategy/documents.json');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
        extractFilterOptions(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading documents:', error);
      setLoading(false);
    }
  };

  const extractFilterOptions = (docs: WorldBankDocument[]) => {
    const types = new Set<string>();
    const secs = new Set<string>();
    const regs = new Set<string>();

    docs.forEach(doc => {
      types.add(doc.tags.documentType);
      doc.tags.sectors.forEach(s => secs.add(s));
      doc.tags.regions.forEach(r => regs.add(r));
    });

    setDocTypes(Array.from(types).sort());
    setSectors(Array.from(secs).sort());
    setRegions(Array.from(regs).sort());
  };

  const applyFilters = () => {
    let filtered = documents;

    // Text search
    if (searchQuery.trim()) {
      const queryLower = searchQuery.toLowerCase();
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(queryLower) ||
        doc.summary.toLowerCase().includes(queryLower) ||
        doc.tags.sectors.some(s => s.toLowerCase().includes(queryLower)) ||
        doc.tags.initiatives.some(i => i.toLowerCase().includes(queryLower)) ||
        doc.tags.authors.some(a => a.toLowerCase().includes(queryLower)) ||
        doc.tags.regions.some(r => r.toLowerCase().includes(queryLower)) ||
        doc.tags.documentType.toLowerCase().includes(queryLower)
      );
    }

    // Tag filters
    if (selectedDocType !== 'all') {
      filtered = filtered.filter(doc => doc.tags.documentType === selectedDocType);
    }

    if (selectedSector !== 'all') {
      filtered = filtered.filter(doc => doc.tags.sectors.includes(selectedSector));
    }

    if (selectedRegion !== 'all') {
      filtered = filtered.filter(doc => doc.tags.regions.includes(selectedRegion));
    }

    if (selectedPriority !== 'all') {
      filtered = filtered.filter(doc => doc.tags.priority === selectedPriority);
    }

    setFilteredDocs(filtered);
  };

  const clearFilters = () => {
    setSelectedDocType('all');
    setSelectedSector('all');
    setSelectedRegion('all');
    setSelectedPriority('all');
    setSearchQuery('');
  };

  const activeFiltersCount =
    (selectedDocType !== 'all' ? 1 : 0) +
    (selectedSector !== 'all' ? 1 : 0) +
    (selectedRegion !== 'all' ? 1 : 0) +
    (selectedPriority !== 'all' ? 1 : 0);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'speech': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'strategy': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'article': 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
      'report': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      'initiative': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading World Bank documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            RJ Banga Knowledge Base
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            World Bank Strategy Documents & Speeches
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            {documents.length} documents from 2024+ • Search and explore
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Big Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
            <Input
              type="text"
              placeholder="Search by topic, initiative, author, sector, region... (e.g., 'climate', 'Africa', 'Ajay Banga')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-16 pr-6 py-8 text-xl w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"
            />
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="mb-6">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge className="bg-blue-500">{activeFiltersCount}</Badge>
            )}
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <Card className="mb-8 p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Document Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Document Type
                </label>
                <select
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                >
                  <option value="all">All Types</option>
                  {docTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Sector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sector
                </label>
                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                >
                  <option value="all">All Sectors</option>
                  {sectors.map(sector => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
              </div>

              {/* Region */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Region
                </label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                >
                  <option value="all">All Regions</option>
                  {regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            {activeFiltersCount > 0 && (
              <div className="mt-6 flex items-center gap-4">
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  size="sm"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear all filters
                </Button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
                </span>
              </div>
            )}
          </Card>
        )}

        {/* Results Count */}
        <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredDocs.length} of {documents.length} documents
          {searchQuery && ` for "${searchQuery}"`}
        </div>

        {/* Search Results */}
        <div className="grid grid-cols-1 gap-6">
          {filteredDocs.map((doc) => (
            <Card key={doc.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedDoc(doc)}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={getTypeColor(doc.tags.documentType)}>
                        {doc.tags.documentType}
                      </Badge>
                      <Badge className={getPriorityColor(doc.tags.priority)}>
                        {doc.tags.priority}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        {doc.date}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      {doc.title}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                      {doc.summary}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-3 mb-4">
                  {doc.tags.authors.length > 0 && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{doc.tags.authors.join(', ')}</span>
                    </div>
                  )}

                  {doc.tags.sectors.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Building2 className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div className="flex flex-wrap gap-1">
                        {doc.tags.sectors.map((sector, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {sector}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {doc.tags.regions.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Globe className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div className="flex flex-wrap gap-1">
                        {doc.tags.regions.map((region, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {region}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {doc.tags.initiatives.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Briefcase className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div className="flex flex-wrap gap-1">
                        {doc.tags.initiatives.map((initiative, idx) => (
                          <Badge key={idx} className="bg-blue-100 text-blue-800 text-xs">
                            {initiative}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {doc.metadata.readingTime} min read
                  </span>
                  <Button variant="outline" size="sm">
                    Read Full Document →
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredDocs.length === 0 && (
            <Card className="p-12 text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No documents found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Try adjusting your search terms or filters
              </p>
              <Button onClick={clearFilters} variant="outline">
                Clear all filters
              </Button>
            </Card>
          )}
        </div>

        {/* Quick Search Tags */}
        <div className="mt-12">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Quick Search Topics
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              'Ajay Banga',
              'Climate Change',
              'Evolution Roadmap',
              'Africa Development',
              'Agriculture',
              'Poverty Reduction',
              'Sustainable Development',
              'Economic Growth'
            ].map((topic) => (
              <Button
                key={topic}
                onClick={() => setSearchQuery(topic)}
                variant="outline"
                size="sm"
                className="rounded-full"
              >
                {topic}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Document Detail Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedDoc(null)}>
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    {selectedDoc.title}
                  </h2>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className={getTypeColor(selectedDoc.tags.documentType)}>
                      {selectedDoc.tags.documentType}
                    </Badge>
                    <Badge className={getPriorityColor(selectedDoc.tags.priority)}>
                      {selectedDoc.tags.priority}
                    </Badge>
                    <Badge variant="outline">{selectedDoc.date}</Badge>
                  </div>
                </div>
                <Button
                  onClick={() => setSelectedDoc(null)}
                  variant="ghost"
                  size="sm"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="prose max-w-none mb-6">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                  {selectedDoc.summary}
                </p>
              </div>

              {/* All Tags */}
              <div className="space-y-4 mb-6">
                {selectedDoc.tags.authors.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Authors</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedDoc.tags.authors.map((author, idx) => (
                        <Badge key={idx} variant="secondary">{author}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedDoc.tags.sectors.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Sectors</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedDoc.tags.sectors.map((sector, idx) => (
                        <Badge key={idx} variant="secondary">{sector}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedDoc.tags.regions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Regions</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedDoc.tags.regions.map((region, idx) => (
                        <Badge key={idx} variant="secondary">{region}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedDoc.tags.initiatives.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Initiatives & Projects</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedDoc.tags.initiatives.map((initiative, idx) => (
                        <Badge key={idx} className="bg-blue-100 text-blue-800">{initiative}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedDoc.metadata.wordCount.toLocaleString()} words • {selectedDoc.metadata.readingTime} min read
                </span>
                <a
                  href={selectedDoc.sourceReference.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Read Full Document
                </a>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

