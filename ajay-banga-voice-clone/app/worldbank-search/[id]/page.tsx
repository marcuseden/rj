'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/app-layout';
import { ContentFormatter } from '@/components/content-formatter';

interface WorldBankDocument {
  id: string;
  title: string;
  url: string;
  summary: string;
  content: string;
  date: string;
  topics: string[];
  keywords: string[];
  type: string;
}

export default function WorldBankDocumentPage() {
  const params = useParams();
  const router = useRouter();
  const [document, setDocument] = useState<WorldBankDocument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocument();
  }, [params.id]);

  const loadDocument = async () => {
    try {
      // Try to get document from database first
      const response = await fetch(`/api/worldbank-search?id=${params.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.document) {
          setDocument(data.document);
          return;
        }
      }

      // Fallback: Load from local JSON file
      const fallbackResponse = await fetch('/data/worldbank-strategy/documents.json');
      if (fallbackResponse.ok) {
        const rawData = await fallbackResponse.json();
        const foundDoc = rawData.find((doc: any) => doc.id === params.id);
        setDocument(foundDoc || null);
      }
    } catch (error) {
      console.error('Error loading document:', error);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading document...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!document) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Document Not Found</h1>
            <p className="text-gray-600 mb-6">The requested document could not be found.</p>
            <Button onClick={() => router.push('/worldbank-search')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Search
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => router.push('/worldbank-search')}
            variant="ghost"
            className="mb-4 hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </Button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{document.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {document.date}
                </div>
              </div>
            </div>

            {document.url && (
              <Button asChild className="ml-4">
                <a href={document.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Original
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Summary */}
        {document.summary && (
          <Card className="mb-8 p-6 bg-blue-50 border-blue-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Summary</h2>
            <p className="text-gray-700 leading-relaxed">{document.summary}</p>
          </Card>
        )}

        {/* Full Content */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Full Document Content</h2>
          <ContentFormatter content={document.content || document.summary} />
        </Card>
      </div>
    </AppLayout>
  );
}
