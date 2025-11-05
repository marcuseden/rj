'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, Calendar, User, Building2, Globe, Briefcase, Target } from 'lucide-react';

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
    authors?: string[];
    priority?: string;
    departments?: string[];
  };
  sourceReference?: {
    originalUrl: string;
    scrapedFrom?: string;
  };
  metadata?: {
    readingTime?: number;
  };
}

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [document, setDocument] = useState<WorldBankDocument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocument();
  }, [params.id]);

  const loadDocument = async () => {
    try {
      const response = await fetch('/data/worldbank-strategy/ajay-banga-documents-verified.json');
      if (response.ok) {
        const data = await response.json();
        const doc = data.find((d: WorldBankDocument) => d.id === params.id);
        setDocument(doc || null);
      }
    } catch (error) {
      console.error('Error loading document:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900"></div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold text-stone-900 mb-4">Document Not Found</h2>
          <Button onClick={() => router.back()} className="bg-stone-900 hover:bg-stone-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-6 py-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-stone-600 hover:text-stone-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Documents
        </Button>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Title and Meta */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {document.tags?.documentType && (
              <Badge className="bg-[#0071bc] text-white border-0">
                {document.tags.documentType}
              </Badge>
            )}
            {document.tags?.priority && (
              <Badge className={
                document.tags.priority === 'high' 
                  ? 'bg-red-100 text-red-700 border-red-200' 
                  : document.tags.priority === 'medium'
                  ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                  : 'bg-green-100 text-green-700 border-green-200'
              }>
                {document.tags.priority} Priority
              </Badge>
            )}
            <Badge variant="outline" className="border-stone-300">
              <Calendar className="w-3 h-3 mr-1" />
              {document.date}
            </Badge>
            {document.metadata?.readingTime && (
              <Badge variant="outline" className="border-stone-300">
                {document.metadata.readingTime} min read
              </Badge>
            )}
          </div>

          <h1 className="text-4xl font-bold text-stone-900 mb-4">
            {document.title}
          </h1>

          <p className="text-lg text-stone-600 leading-relaxed">
            {document.summary}
          </p>
        </div>

        {/* Details Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Sectors */}
          {document.tags?.sectors && document.tags.sectors.length > 0 && (
            <Card className="bg-white border-stone-200 p-6">
              <h2 className="font-semibold text-stone-900 mb-3 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-[#0071bc]" />
                Sectors
              </h2>
              <div className="flex flex-wrap gap-2">
                {document.tags.sectors.map((sector, idx) => (
                  <Badge key={idx} className="bg-blue-50 text-[#0071bc] border-blue-200">
                    {sector}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Regions */}
          {document.tags?.regions && document.tags.regions.length > 0 && (
            <Card className="bg-white border-stone-200 p-6">
              <h2 className="font-semibold text-stone-900 mb-3 flex items-center">
                <Globe className="w-5 h-5 mr-2 text-[#0071bc]" />
                Regions
              </h2>
              <div className="flex flex-wrap gap-2">
                {document.tags.regions.map((region, idx) => (
                  <Badge key={idx} className="bg-blue-50 text-[#0071bc] border-blue-200">
                    {region}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Initiatives */}
          {document.tags?.initiatives && document.tags.initiatives.length > 0 && (
            <Card className="bg-white border-stone-200 p-6">
              <h2 className="font-semibold text-stone-900 mb-3 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-[#0071bc]" />
                Key Initiatives
              </h2>
              <div className="flex flex-wrap gap-2">
                {document.tags.initiatives.map((initiative, idx) => (
                  <Badge key={idx} className="bg-blue-50 text-[#0071bc] border-blue-200">
                    {initiative}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Authors */}
          {document.tags?.authors && document.tags.authors.length > 0 && (
            <Card className="bg-white border-stone-200 p-6">
              <h2 className="font-semibold text-stone-900 mb-3 flex items-center">
                <User className="w-5 h-5 mr-2 text-[#0071bc]" />
                Authors
              </h2>
              <div className="flex flex-wrap gap-2">
                {document.tags.authors.map((author, idx) => (
                  <Badge key={idx} className="bg-stone-100 text-stone-700 border-stone-200">
                    {author}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* View Full Document */}
        {(document.sourceReference?.originalUrl || document.url) && (
          <Card className="bg-gradient-to-br from-[#0071bc] to-[#005a99] border-0 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Read Full Document
                </h3>
                <p className="text-blue-100">
                  Access the complete document on World Bank website
                </p>
              </div>
              <a
                href={document.sourceReference?.originalUrl || document.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white text-[#0071bc] hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Open Document
                <ExternalLink className="h-5 w-5" />
              </a>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

