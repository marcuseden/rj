'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { AppLayout } from '@/components/app-layout';

interface WorldBankDocument {
  id: string;
  title: string;
  url: string;
  summary: string;
  date: string;
}

export default function WorldBankSearchPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<WorldBankDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const response = await fetch('/data/worldbank-strategy/documents.json');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading documents:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading World Bank documents...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          World Bank Knowledge Base
        </h1>

        <div className="space-y-4">
          {documents.map((doc) => (
            <Card key={doc.id} className="p-4">
              <h3
                className="font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer"
                onClick={() => router.push(`/worldbank-search/${doc.id}`)}
              >
                {doc.title}
              </h3>
              <p className="text-sm text-gray-600">{doc.summary}</p>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}



