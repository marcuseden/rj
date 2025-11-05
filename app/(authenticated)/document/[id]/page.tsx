'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, Calendar, Share2, Youtube, FileText, Download } from 'lucide-react';

interface Document {
  id: string;
  title: string;
  summary: string;
  date: string;
  full_text?: string;
  transcript?: string;
  youtube_url?: string;
  pdf_url?: string;
  url?: string;
  tags?: {
    documentType?: string;
    sectors?: string[];
    regions?: string[];
    initiatives?: string[];
    authors?: string[];
    priority?: string;
  };
  sourceReference?: {
    originalUrl?: string;
  };
  metadata?: {
    readingTime?: number;
    wordCount?: number;
  };
}

export default function DocumentPage() {
  const params = useParams();
  const router = useRouter();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocument();
  }, [params.id]);

  const loadDocument = async () => {
    try {
      // Try multiple sources
      const sources = [
        '/data/worldbank-strategy/ajay-banga-documents-verified.json',
        '/data/worldbank-strategy/documents.json',
        '/speeches_database.json'
      ];

      for (const source of sources) {
        const res = await fetch(source);
        if (res.ok) {
          let data = await res.json();
          
          // Handle speeches database structure
          if (data.speeches) {
            data = data.speeches.map((s: any) => ({
              ...s,
              id: s.id || `speech-${s.title}`,
              tags: {
                documentType: 'speech',
                authors: ['Ajay Banga'],
                ...s.tags
              }
            }));
          }

          const doc = Array.isArray(data) ? data.find((d: Document) => d.id === params.id) : null;
          if (doc) {
            setDocument(doc);
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error loading document:', error);
    } finally {
      setLoading(false);
    }
  };

  const shareDocument = async () => {
    try {
      await navigator.share({
        title: document?.title,
        text: document?.summary,
        url: window.location.href
      });
    } catch (error) {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
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
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <Card className="p-8 text-center">
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
      <div className="bg-white border-b border-stone-200 px-4 md:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-stone-600 hover:text-stone-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <Button
            variant="outline"
            onClick={shareDocument}
            className="text-stone-600 hover:text-stone-900"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
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
                  : 'bg-stone-100 text-stone-600 border-stone-200'
              }>
                {document.tags.priority}
              </Badge>
            )}
            <Badge variant="outline" className="border-stone-300">
              <Calendar className="w-3 h-3 mr-1" />
              {document.date}
            </Badge>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">
            {document.title}
          </h1>

          <p className="text-lg text-stone-600 leading-relaxed mb-6">
            {document.summary}
          </p>

          {/* Media Links */}
          <div className="flex flex-wrap gap-3 mb-6">
            {document.youtube_url && (
              <a
                href={document.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <Youtube className="h-4 w-4" />
                Watch on YouTube
              </a>
            )}
            {document.pdf_url && (
              <a
                href={document.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#0071bc] hover:bg-[#005a99] text-white rounded-lg transition-colors"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </a>
            )}
            {(document.sourceReference?.originalUrl || document.url) && (
              <a
                href={document.sourceReference?.originalUrl || document.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 rounded-lg transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                View Original
              </a>
            )}
          </div>
        </div>

        {/* Transcript/Full Text */}
        {(document.transcript || document.full_text) && (
          <Card className="bg-white border-stone-200 mb-8">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6">
                <FileText className="h-5 w-5 text-[#0071bc]" />
                <h2 className="text-2xl font-semibold text-stone-900">
                  Full Transcript
                </h2>
              </div>
              
              <div className="prose prose-stone max-w-none">
                <div className="text-stone-800 leading-relaxed whitespace-pre-wrap text-base">
                  {document.transcript || document.full_text}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tags */}
        {document.tags && (
          <div className="grid md:grid-cols-2 gap-6">
            {document.tags.authors && document.tags.authors.length > 0 && (
              <Card className="bg-white border-stone-200 p-6">
                <h3 className="font-semibold text-stone-900 mb-3">Authors</h3>
                <div className="flex flex-wrap gap-2">
                  {document.tags.authors.map((author, idx) => (
                    <Badge key={idx} className="bg-blue-50 text-[#0071bc] border-blue-200">
                      {author}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            {document.tags.sectors && document.tags.sectors.length > 0 && (
              <Card className="bg-white border-stone-200 p-6">
                <h3 className="font-semibold text-stone-900 mb-3">Sectors</h3>
                <div className="flex flex-wrap gap-2">
                  {document.tags.sectors.map((sector, idx) => (
                    <Badge key={idx} className="bg-stone-100 text-stone-700 border-stone-200">
                      {sector}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            {document.tags.regions && document.tags.regions.length > 0 && (
              <Card className="bg-white border-stone-200 p-6">
                <h3 className="font-semibold text-stone-900 mb-3">Regions</h3>
                <div className="flex flex-wrap gap-2">
                  {document.tags.regions.map((region, idx) => (
                    <Badge key={idx} className="bg-stone-100 text-stone-700 border-stone-200">
                      {region}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            {document.tags.initiatives && document.tags.initiatives.length > 0 && (
              <Card className="bg-white border-stone-200 p-6">
                <h3 className="font-semibold text-stone-900 mb-3">Initiatives</h3>
                <div className="flex flex-wrap gap-2">
                  {document.tags.initiatives.map((initiative, idx) => (
                    <Badge key={idx} className="bg-blue-50 text-[#0071bc] border-blue-200">
                      {initiative}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
