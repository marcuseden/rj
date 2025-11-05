'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RJWritingAssistantPage() {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const router = useRouter();

  const analyzeText = async () => {
    if (!inputText.trim()) {
      alert('Please enter some text to analyze');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/rj-writing-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText })
      });

      if (!response.ok) throw new Error('Analysis failed');

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error analyzing text:', error);
      alert('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Content Alignment Checker</h1>
                <p className="text-xs text-slate-400">Check alignment with CEO values & style</p>
              </div>
            </div>
            
            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              ← Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-12">
        <Card className="bg-slate-900/50 border-slate-700 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              Analyze Your Content
            </h2>
            <p className="text-slate-400">
              Paste your text below to check how well it aligns with Ajay Banga's communication style and values.
            </p>
          </div>

          {/* Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Your Text
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your content here..."
              rows={12}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="text-sm text-slate-500 mt-2">
              {inputText.length} characters • {inputText.trim().split(/\s+/).filter(Boolean).length} words
            </p>
          </div>

          {/* Analyze Button */}
          <Button
            onClick={analyzeText}
            disabled={loading || !inputText.trim()}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-6 text-lg"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Analyze Content
              </>
            )}
          </Button>
        </Card>

        {/* Results */}
        {result && (
          <Card className="bg-slate-900/50 border-slate-700 p-8 mt-6">
            <h3 className="text-2xl font-bold text-white mb-4">
              Analysis Results
            </h3>
            
            {/* Score */}
            <div className="mb-6 p-6 bg-slate-950 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Alignment Score</span>
                <span className="text-4xl font-bold text-blue-400">
                  {result.overallScore || 0}%
                </span>
              </div>
            </div>

            {/* Improved Text */}
            {result.improvedText && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-white mb-3">
                  Improved Version
                </h4>
                <div className="bg-slate-950 border border-slate-700 rounded-lg p-6">
                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {result.improvedText}
                  </p>
                </div>
              </div>
            )}

            {/* Feedback */}
            {result.feedback && (
              <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-300">{result.feedback}</p>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Instructions */}
        {!result && (
          <Card className="bg-slate-900/50 border-slate-700 p-8 mt-6">
            <h3 className="text-xl font-bold text-white mb-4">
              How It Works
            </h3>
            <div className="space-y-3 text-slate-400">
              <p>
                1. <strong className="text-white">Paste your content</strong> - speeches, articles, or any written material
              </p>
              <p>
                2. <strong className="text-white">Click Analyze</strong> - our AI will compare it to Ajay Banga's communication style
              </p>
              <p>
                3. <strong className="text-white">Get insights</strong> - receive an alignment score and improved version
              </p>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}







