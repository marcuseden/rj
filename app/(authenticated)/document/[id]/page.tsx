'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, Calendar, Share2, FileText, Globe, Tag } from 'lucide-react';
import { createClient } from '@/lib/supabase';

interface Document {
  id: string;
  title: string;
  content?: string;
  summary?: string;
  url?: string;
  date?: string;
  type?: string;
  file_type?: string;
  topics?: string[];
  keywords?: string[];
  regions?: string[];
  sectors?: string[];
  initiatives?: string[];
  tags?: any;
  source_reference?: any;
  metadata?: any;
  scraped_at?: string;
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
    console.log('🔍 Loading document:', params.id);
    
    try {
      const supabase = createClient();
      
      // Extract just the numeric ID or the full slug
      const docId = params.id as string;
      
      // Try to fetch by ID or by searching in content/title
      const { data, error } = await supabase
        .from('worldbank_documents')
        .select('*')
        .or(`id.eq.${docId},title.ilike.%${docId}%`)
        .limit(1)
        .single();

      if (error) {
        console.error('❌ Error loading document:', error);
        setLoading(false);
        return;
      }

      if (data) {
        console.log('✅ Document loaded:', data.title);
        setDocument(data);
      } else {
        console.warn('⚠️ No document found with ID:', docId);
      }
    } catch (error) {
      console.error('❌ Error:', error);
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
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-stone-200 px-4 md:px-6 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-stone-600 hover:text-stone-900 hover:bg-stone-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <Button
            variant="outline"
            onClick={shareDocument}
            className="text-stone-600 hover:text-stone-900 hover:bg-stone-100"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        {/* Document Header Card */}
        <Card className="bg-white/90 backdrop-blur border-stone-200 shadow-lg mb-6">
          <CardContent className="p-8">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              {document.type && (
                <Badge className="bg-[#0071bc] text-white border-0 text-sm px-3 py-1">
                  <FileText className="w-3 h-3 mr-1" />
                  {document.type}
                </Badge>
              )}
              {document.date && (
                <Badge variant="outline" className="border-stone-300 text-sm px-3 py-1">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(document.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Badge>
              )}
              {document.file_type && (
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {document.file_type.toUpperCase()}
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-bold text-stone-900 mb-6 leading-tight">
              {document.title}
            </h1>

            {/* Summary */}
            {document.summary && (
              <div className="bg-blue-50/50 border-l-4 border-[#0071bc] p-6 rounded-r-lg mb-6">
                <p className="text-lg text-stone-700 leading-relaxed">
                  {document.summary}
                </p>
              </div>
            )}

            {/* Action Links */}
            {document.url && !document.url.includes('999999') && !document.url.includes('placeholder') && (
              <div className="flex flex-wrap gap-3">
                <a
                  href={document.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#0071bc] hover:bg-[#005a99] text-white rounded-lg transition-all shadow-md hover:shadow-lg font-medium"
                  onClick={(e) => {
                    // Warn user if URL might be broken
                    if (!document.url?.startsWith('http')) {
                      e.preventDefault();
                      alert('This document URL appears to be invalid. The content is displayed below.');
                    }
                  }}
                >
                  <Globe className="h-5 w-5" />
                  View Original Source
                </a>
              </div>
            )}
            
            {/* Show notice if URL is invalid */}
            {(document.url?.includes('999999') || document.url?.includes('placeholder') || !document.url) && (
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-amber-800 mb-1">Original Source Unavailable</h4>
                    <p className="text-sm text-amber-700">
                      The original World Bank document link is no longer available or was not properly captured. 
                      The full content from our database is displayed below.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content */}
        {document.content && (
          <Card className="bg-white/90 backdrop-blur border-stone-200 shadow-lg mb-6">
            <CardContent className="p-8 md:p-12">
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-stone-200">
                <FileText className="h-6 w-6 text-[#0071bc]" />
                <h2 className="text-2xl font-bold text-stone-900">
                  Full Document
                </h2>
              </div>
              
              <div className="prose prose-lg prose-stone max-w-none">
                <div 
                  className="text-stone-800 leading-relaxed space-y-4"
                  style={{ 
                    fontSize: '1.125rem',
                    lineHeight: '1.8',
                    fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif'
                  }}
                >
                  {document.content.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="mb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metadata Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Regions */}
          {document.regions && document.regions.length > 0 && (
            <Card className="bg-white/90 backdrop-blur border-stone-200 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="h-5 w-5 text-[#0071bc]" />
                  <h3 className="font-bold text-stone-900">Regions</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {document.regions.map((region, idx) => (
                    <Badge key={idx} variant="secondary" className="text-sm px-3 py-1">
                      {region}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Keywords */}
          {document.keywords && document.keywords.length > 0 && (
            <Card className="bg-white/90 backdrop-blur border-stone-200 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="h-5 w-5 text-[#0071bc]" />
                  <h3 className="font-bold text-stone-900">Keywords</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {document.keywords.slice(0, 10).map((keyword, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs px-2 py-1">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Topics */}
          {document.topics && document.topics.length > 0 && (
            <Card className="bg-white/90 backdrop-blur border-stone-200 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-[#0071bc]" />
                  <h3 className="font-bold text-stone-900">Topics</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {document.topics.map((topic, idx) => (
                    <Badge key={idx} className="bg-blue-100 text-[#0071bc] border-0 text-sm px-3 py-1">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Document Info */}
          {document.metadata && (
            <Card className="bg-white/90 backdrop-blur border-stone-200 shadow-md">
              <CardContent className="p-6">
                <h3 className="font-bold text-stone-900 mb-4">Document Information</h3>
                <div className="space-y-2 text-sm text-stone-600">
                  {document.metadata.wordCount && (
                    <div className="flex justify-between">
                      <span>Word Count:</span>
                      <span className="font-medium text-stone-900">{document.metadata.wordCount.toLocaleString()}</span>
                    </div>
                  )}
                  {document.metadata.readingTime && (
                    <div className="flex justify-between">
                      <span>Reading Time:</span>
                      <span className="font-medium text-stone-900">{document.metadata.readingTime} min</span>
                    </div>
                  )}
                  {document.metadata.language && (
                    <div className="flex justify-between">
                      <span>Language:</span>
                      <span className="font-medium text-stone-900">{document.metadata.language}</span>
                    </div>
                  )}
                  {document.metadata.publicationYear && (
                    <div className="flex justify-between">
                      <span>Publication Year:</span>
                      <span className="font-medium text-stone-900">{document.metadata.publicationYear}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
