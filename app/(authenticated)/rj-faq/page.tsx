'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, FileText, Calendar, User, Building2, Globe, Briefcase, ExternalLink, ChevronDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';

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
    departments: string[];
  };
  sourceReference: {
    originalUrl: string;
  };
  metadata: {
    readingTime: number;
  };
}

export default function RJFAQPage() {
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
        doc.tags.initiatives.some(i => i.toLowerCase().includes(queryLower))
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <AppHeader 
        title="RJ Banga FAQ & Knowledge Base"
        subtitle={`${documents.length} World Bank strategy documents`}
      />

      <div className="max-w-7xl mx-auto px-4 py-6 pb-24">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search documents, initiatives, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-6 text-lg"
            />
          </div>
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 mb-4 px-4 py-2 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge className="bg-blue-500">{activeFiltersCount}</Badge>
          )}
          <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {/* Filter Panel */}
        {showFilters && (
          <Card className="mb-6 p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Document Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Type
                </label>
                <select
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Types</option>
                  {docTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Sector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sector
                </label>
                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Sectors</option>
                  {sectors.map(sector => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
              </div>

              {/* Region */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Region
                </label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Regions</option>
                  {regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            {activeFiltersCount > 0 && (
              <div className="mt-4">
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </Card>
        )}

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredDocs.length} of {documents.length} documents
        </div>

        {/* Document Grid */}
        <div className="grid grid-cols-1 gap-4">
          {filteredDocs.map((doc) => (
            <Card key={doc.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{doc.tags.documentType}</Badge>
                      <Badge className={
                        doc.tags.priority === 'high' ? 'bg-red-100 text-red-800' :
                        doc.tags.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }>
                        {doc.tags.priority}
                      </Badge>
                      <span className="text-sm text-gray-500">{doc.date}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {doc.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {doc.summary}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-3 mb-4">
                  {doc.tags.authors.length > 0 && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{doc.tags.authors.join(', ')}</span>
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
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="text-sm text-gray-500">
                    {doc.metadata.readingTime} min read
                  </span>
                  <button
                    onClick={() => setSelectedDoc(doc)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Read More →
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredDocs.length === 0 && (
            <Card className="p-12 text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No documents found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search or filters
              </p>
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-800"
              >
                Clear all filters
              </button>
            </Card>
          )}
        </div>
      </div>

      {/* Document Detail Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedDoc(null)}>
          <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedDoc.title}
                  </h2>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge>{selectedDoc.tags.documentType}</Badge>
                    <Badge className={
                      selectedDoc.tags.priority === 'high' ? 'bg-red-100 text-red-800' :
                      selectedDoc.tags.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }>
                      {selectedDoc.tags.priority}
                    </Badge>
                    <Badge variant="outline">{selectedDoc.date}</Badge>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="prose max-w-none mb-6">
                <p className="text-gray-700 leading-relaxed">{selectedDoc.summary}</p>
              </div>

              {/* All Tags */}
              <div className="space-y-4 mb-6">
                {selectedDoc.tags.authors.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Authors</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedDoc.tags.authors.map((author, idx) => (
                        <Badge key={idx} variant="secondary">{author}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedDoc.tags.sectors.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Sectors</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedDoc.tags.sectors.map((sector, idx) => (
                        <Badge key={idx} variant="secondary">{sector}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedDoc.tags.regions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Regions</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedDoc.tags.regions.map((region, idx) => (
                        <Badge key={idx} variant="secondary">{region}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedDoc.tags.initiatives.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Initiatives & Projects</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedDoc.tags.initiatives.map((initiative, idx) => (
                        <Badge key={idx} className="bg-blue-100 text-blue-800">{initiative}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200">
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

      <AppFooter />
    </div>
  );
}

