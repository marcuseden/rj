'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, MapPin, FileText, ExternalLink, Youtube, File } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/app-layout';
import { formatNumber } from '@/lib/utils';

// Helper functions for sample media links
function getSampleYouTubeUrl(speechId: number): string | undefined {
  // Sample YouTube links for demonstration (replace with real links when available)
  const sampleLinks: Record<number, string> = {
    1: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Mission 300 Africa Energy Summit
    3: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // China Development Forum
    5: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Annual Meetings 2024
  };
  return sampleLinks[speechId];
}

function getSamplePdfUrl(speechId: number): string | undefined {
  // Sample PDF links for demonstration (replace with real links when available)
  const sampleLinks: Record<number, string> = {
    1: "/data/worldbank-strategy/downloads/aHR0cHM6Ly93d3cud29ybGRiYW5rLm9y.html", // Mission 300 Africa Energy Summit
    2: "/data/worldbank-strategy/downloads/aHR0cHM6Ly93d3cud29ybGRiYW5rLm9y.pdf", // G20 Finance Ministers
    4: "/data/worldbank-strategy/downloads/aHR0cHM6Ly9wcm9qZWN0cy53b3JsZGJh.html", // IDA for Africa Summit
  };
  return sampleLinks[speechId];
}

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
  content?: string;
  youtube_url?: string;
  pdf_url?: string;
}

export default function SpeechDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [speech, setSpeech] = useState<Speech | null>(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    if (params.id) {
      loadSpeech(params.id as string);
    }
  }, [params.id]);

  const loadSpeech = async (speechId: string) => {
    try {
      setLoading(true);

      // Load speech metadata from database
      const response = await fetch('/speeches_database.json');
      const data = await response.json();

      // Find the speech by ID
      const speechData = (data.speeches || []).find((s: any) => s.id.toString() === speechId);

      if (!speechData) {
        console.error('Speech not found:', speechId);
        return;
      }

      // Transform to our interface
      const speech: Speech = {
        id: speechData.id.toString(),
        title: speechData.title || 'Untitled Speech',
        date: speechData.date_prefix || 'Unknown Date',
        location: 'World Bank Group',
        url: `/data/speeches/${speechData.filename.replace('.pdf', '.txt')}`,
        summary: speechData.text ? speechData.text.substring(0, 300) + '...' : 'No summary available',
        key_themes: ['Development', 'Economic Growth', 'Global Cooperation'],
        word_count: speechData.word_count || 0,
        // Add sample YouTube and PDF links based on speech ID (you can enhance this with real data)
        youtube_url: getSampleYouTubeUrl(speechData.id),
        pdf_url: getSamplePdfUrl(speechData.id)
      };

      setSpeech(speech);

      // Load the full speech content
      try {
        const contentResponse = await fetch(speech.url);
        if (contentResponse.ok) {
          const textContent = await contentResponse.text();
          setContent(textContent);
        }
      } catch (error) {
        console.error('Error loading speech content:', error);
      }

    } catch (error) {
      console.error('Error loading speech:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseContent = (rawContent: string) => {
    const lines = rawContent.split('\n');
    let title = '';
    let meta = '';
    let contentBody = '';

    let inContent = false;
    for (const line of lines) {
      if (line.startsWith('TITLE: ')) {
        title = line.replace('TITLE: ', '');
      } else if (line.startsWith('META: ')) {
        meta = line.replace('META: ', '');
      } else if (line.startsWith('CONTENT:')) {
        inContent = true;
      } else if (inContent && line.trim()) {
        contentBody += line + '\n';
      }
    }

    return { title, meta, contentBody: contentBody.trim() };
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-stone-50">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-stone-200 rounded mb-4"></div>
              <div className="h-4 bg-stone-200 rounded mb-2"></div>
              <div className="h-4 bg-stone-200 rounded mb-8"></div>
              <div className="space-y-3">
                <div className="h-4 bg-stone-200 rounded"></div>
                <div className="h-4 bg-stone-200 rounded"></div>
                <div className="h-4 bg-stone-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!speech) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-stone-50">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-stone-900 mb-4">Speech Not Found</h1>
              <Button onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const parsedContent = parseContent(content);

  return (
    <AppLayout>
      <div className="min-h-screen bg-stone-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Back Button */}
          <Button
            onClick={() => router.back()}
            className="mb-6 bg-white text-stone-900 border border-stone-200 hover:bg-stone-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Speeches
          </Button>

          {/* Speech Header */}
          <Card className="bg-white border-stone-200 mb-8">
            <div className="p-8">
              {/* Metadata */}
              <div className="flex items-center gap-4 text-sm text-stone-600 mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{speech.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{speech.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>{formatNumber(speech.word_count)} words</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-stone-900 mb-4 leading-tight">
                {parsedContent.title || speech.title}
              </h1>

              {/* Meta */}
              {parsedContent.meta && (
                <p className="text-lg text-stone-700 mb-6 italic">
                  {parsedContent.meta}
                </p>
              )}

              {/* Themes */}
              {speech.key_themes && speech.key_themes.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {speech.key_themes.map((theme, index) => (
                    <Badge
                      key={index}
                      className="bg-stone-100 text-stone-700 border-stone-200"
                    >
                      {theme}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Source Links */}
              <div className="flex flex-wrap gap-3">
                {speech.youtube_url && (
                  <a
                    href={speech.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Youtube className="h-4 w-4 mr-2" />
                    Watch on YouTube
                  </a>
                )}
                {speech.pdf_url && (
                  <a
                    href={speech.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-900 transition-colors"
                  >
                    <File className="h-4 w-4 mr-2" />
                    View PDF
                  </a>
                )}
                <a
                  href={speech.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition-colors"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Raw Text
                </a>
              </div>
            </div>
          </Card>

          {/* Speech Content */}
          <Card className="bg-white border-stone-200">
            <div className="p-8">
              <h2 className="text-xl font-semibold text-stone-900 mb-6">Full Speech Transcript</h2>

              {parsedContent.contentBody ? (
                <div className="prose prose-stone max-w-none">
                  {parsedContent.contentBody.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-stone-800 leading-relaxed">
                      {paragraph.trim()}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-stone-400 mx-auto mb-4" />
                  <p className="text-stone-600">Speech content is being loaded...</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
