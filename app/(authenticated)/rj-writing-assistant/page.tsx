'use client';

import { useState } from 'react';
import { Sparkles, Copy, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RJWritingAssistantPage() {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const analyzeText = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    // TODO: Implement analysis
    setTimeout(() => setLoading(false), 1000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <div className="bg-white border-b border-stone-200 px-6 py-4">
        <h1 className="text-2xl font-semibold text-stone-900">RJ Banga Writing Assistant</h1>
        <p className="text-sm text-stone-600 mt-1">Align your text with RJ Banga's strategic communication style</p>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 pb-24">
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-3 mb-6">
              <Sparkles className="h-5 w-5 text-stone-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 text-sm text-stone-700">
                <p className="mb-1">
                  <strong className="text-stone-900">AI-Powered Analysis</strong> compares your text against RJ Banga's speeches
                </p>
                <p className="text-stone-600">
                  Uses OpenAI + World Bank database
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Your Text
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste your speech, statement, or document here for analysis..."
                  className="w-full h-64 px-4 py-3 border border-stone-300 rounded-lg resize-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900 text-sm"
                />
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-stone-500">
                    {inputText.split(/\s+/).filter(w => w).length} words
                  </span>
                  <Button
                    onClick={analyzeText}
                    disabled={!inputText.trim() || loading}
                    className="bg-stone-900 hover:bg-stone-800 text-white"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Analyze Text
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-12 text-center">
            <Sparkles className="h-16 w-16 mx-auto mb-4 text-stone-400" />
            <h3 className="text-lg font-semibold text-stone-900 mb-2">
              Ready to Analyze
            </h3>
            <p className="text-stone-600 mb-4">
              Enter your text and click "Analyze" to get detailed feedback
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

