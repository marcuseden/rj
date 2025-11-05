'use client';

import { useState } from 'react';
import { Sparkles, Copy, Check, AlertCircle, CheckCircle2, XCircle, FileText, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';

interface AlignmentIssue {
  type: 'misaligned' | 'needs-improvement' | 'aligned';
  category: 'tone' | 'vocabulary' | 'focus' | 'structure' | 'impact';
  issue: string;
  suggestion: string;
  reference: {
    documentTitle: string;
    documentUrl: string;
    quote: string;
    reason: string;
  };
}

interface AnalysisResult {
  overallScore: number;
  alignedPoints: AlignmentIssue[];
  improvements: AlignmentIssue[];
  misalignments: AlignmentIssue[];
  improvedText: string;
  keyDifferences: string[];
}

export default function RJWritingAssistantPage() {
  const [inputText, setInputText] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'analysis' | 'improved'>('analysis');

  const analyzeText = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setAnalysis(null);

    try {
      // Call API endpoint that uses OpenAI + World Bank DB
      const response = await fetch('/api/rj-writing-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText })
      });

      if (!response.ok) throw new Error('Analysis failed');

      const result = await response.json();
      setAnalysis(result);
      setActiveTab('analysis');
    } catch (error) {
      console.error('Error analyzing text:', error);
      // Show error or fallback
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Claude-style minimal header */}
      <div className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <h1 className="text-xl font-medium text-gray-900">RJ Banga Writing Assistant</h1>
          <p className="text-sm text-gray-600 mt-1">Align your text with RJ Banga's strategic communication style</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 pb-24">
        {/* Claude-style info banner */}
        <div className="mb-8 px-4 py-3 bg-blue-50 border border-blue-100 rounded-lg">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 text-sm text-gray-700">
              <p className="mb-1">
                <strong className="text-gray-900">AI-Powered Analysis</strong> compares your text against RJ Banga's speeches and strategic communications
              </p>
              <p className="text-gray-600">
                Uses OpenAI + World Bank database • Provides specific references • Shows exact improvements
              </p>
            </div>
          </div>
        </div>

        {/* Claude-style single column layout */}
        <div className="space-y-6">
          {/* Input Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Text
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your speech, statement, or document here for analysis...

Example: 'Our organization is working on renewable energy projects to address climate change and create sustainable growth opportunities.'"
              className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
            />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {inputText.split(/\s+/).filter(w => w).length} words • {inputText.length} characters
              </span>
              <Button
                onClick={analyzeText}
                disabled={!inputText.trim() || loading}
                className="bg-gray-900 hover:bg-gray-800 text-white shadow-sm"
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

          {/* Analysis Results - Claude style */}
          {analysis ? (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
              {/* Score Card - Minimal */}
              <div className={`px-6 py-4 rounded-xl border-2 ${getScoreBg(analysis.overallScore)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-600 mb-1">Alignment Score</div>
                    <div className="text-xs text-gray-500">vs. RJ Banga's communication style</div>
                  </div>
                  <div className={`text-5xl font-semibold ${getScoreColor(analysis.overallScore)}`}>
                    {analysis.overallScore}
                  </div>
                </div>
              </div>

              {/* Claude-style tabs */}
              <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => setActiveTab('analysis')}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'analysis'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Detailed Analysis
                </button>
                <button
                  onClick={() => setActiveTab('improved')}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'improved'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Improved Version
                </button>
              </div>

                  {/* Analysis Tab */}
                  {activeTab === 'analysis' && (
                    <div className="space-y-6 max-h-[500px] overflow-y-auto">
              {/* What's Aligned - Claude style */}
              {analysis.alignedPoints.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <h4 className="text-sm font-semibold text-gray-900">
                      Well Aligned ({analysis.alignedPoints.length})
                    </h4>
                  </div>
                  <div className="space-y-3">
                    {analysis.alignedPoints.map((point, idx) => (
                      <div key={idx} className="pl-7 border-l-2 border-green-500 py-2">
                        <p className="text-sm text-gray-900 mb-3">
                          {point.issue}
                        </p>
                        <div className="bg-gray-50 px-3 py-2 rounded-md text-xs">
                          <div className="flex items-start justify-between mb-1">
                            <span className="font-medium text-gray-700">{point.reference.documentTitle}</span>
                            <a href={point.reference.documentUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 text-gray-400 hover:text-blue-600" />
                            </a>
                          </div>
                          <p className="text-gray-600 italic mb-1">"{point.reference.quote}"</p>
                          <p className="text-gray-500">{point.reference.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Needs Improvement - Claude style */}
              {analysis.improvements.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    <h4 className="text-sm font-semibold text-gray-900">
                      Suggested Improvements ({analysis.improvements.length})
                    </h4>
                  </div>
                  <div className="space-y-4">
                    {analysis.improvements.map((item, idx) => (
                      <div key={idx} className="pl-7 border-l-2 border-amber-400">
                        <div className="mb-2">
                          <Badge variant="secondary" className="text-xs mb-2">{item.category}</Badge>
                          <p className="text-sm text-gray-900 font-medium mb-1">
                            {item.issue}
                          </p>
                          <p className="text-sm text-blue-700 mb-3">
                            → {item.suggestion}
                          </p>
                        </div>
                        <div className="bg-gray-50 px-3 py-2 rounded-md text-xs space-y-2">
                          <div className="flex items-start justify-between">
                            <span className="font-medium text-gray-700">{item.reference.documentTitle}</span>
                            <a
                              href={item.reference.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-blue-600"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                          <p className="text-gray-600 italic border-l-2 border-gray-300 pl-2">
                            "{item.reference.quote}"
                          </p>
                          <p className="text-gray-700">
                            <span className="font-medium">Why this matters:</span> {item.reference.reason}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

                      {/* Misaligned */}
                      {analysis.misalignments.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                            <XCircle className="h-5 w-5" />
                            Not Aligned ({analysis.misalignments.length})
                          </h4>
                          <div className="space-y-3">
                            {analysis.misalignments.map((item, idx) => (
                              <Card key={idx} className="border-red-200 bg-red-50/50">
                                <CardContent className="p-4">
                                  <div className="flex items-start gap-2 mb-2">
                                    <Badge variant="outline" className="text-xs bg-red-100">
                                      {item.category}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-900 mb-2">
                                    <strong>Problem:</strong> {item.issue}
                                  </p>
                                  <p className="text-sm text-blue-900 mb-3">
                                    <strong>Fix:</strong> {item.suggestion}
                                  </p>
                                  <div className="bg-white p-3 rounded border border-red-200">
                                    <div className="flex items-start justify-between mb-2">
                                      <p className="text-xs font-semibold text-gray-700">
                                        {item.reference.documentTitle}
                                      </p>
                                      <a
                                        href={item.reference.documentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800"
                                      >
                                        <ExternalLink className="h-3 w-3" />
                                      </a>
                                    </div>
                                    <p className="text-xs text-gray-600 italic mb-2">
                                      "{item.reference.quote}"
                                    </p>
                                    <p className="text-xs text-gray-700">
                                      <strong>Why this matters:</strong> {item.reference.reason}
                                    </p>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

              {/* Improved Version Tab - Claude style */}
              {activeTab === 'improved' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">
                      RJ-Aligned Version
                    </h4>
                    <button
                      onClick={() => copyToClipboard(analysis.improvedText)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 text-green-600" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-gray-50 px-6 py-4 rounded-lg border border-gray-200">
                    <p className="text-gray-900 whitespace-pre-wrap leading-relaxed font-serif">
                      {analysis.improvedText}
                    </p>
                  </div>

                  {/* Key Changes - Minimal */}
                  <div className="space-y-3">
                    <h5 className="text-sm font-medium text-gray-900">
                      Changes Applied
                    </h5>
                    <div className="space-y-2">
                      {analysis.keyDifferences.map((diff, idx) => (
                        <div key={idx} className="flex items-start gap-3 text-sm text-gray-700">
                          <span className="text-blue-600 font-bold">•</span>
                          <span>{diff}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
                </div>
              </CardContent>
            </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Sparkles className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Ready to Analyze
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Enter your text and click "Analyze" to get detailed feedback
                  </p>
                  <div className="text-sm text-gray-500">
                    <p className="mb-2">The AI will check for:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Badge variant="outline">Impact Focus</Badge>
                      <Badge variant="outline">Action-Oriented Language</Badge>
                      <Badge variant="outline">Partnership Emphasis</Badge>
                      <Badge variant="outline">Human Outcomes</Badge>
                      <Badge variant="outline">Concrete Examples</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* How It Works */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">How It Works</h3>
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mb-3">
                  1
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Query Database</h4>
                <p className="text-sm text-gray-600">
                  Searches RJ Banga's speeches and documents for relevant examples
                </p>
              </div>
              <div>
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mb-3">
                  2
                </div>
                <h4 className="font-medium text-gray-900 mb-2">AI Analysis</h4>
                <p className="text-sm text-gray-600">
                  OpenAI compares your text to RJ's style, tone, and strategic focus
                </p>
              </div>
              <div>
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mb-3">
                  3
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Reference Matching</h4>
                <p className="text-sm text-gray-600">
                  Each feedback point links to specific documents with quotes
                </p>
              </div>
              <div>
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mb-3">
                  4
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Improved Version</h4>
                <p className="text-sm text-gray-600">
                  Get a rewritten version that matches RJ's impact-driven style
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AppFooter />
    </div>
  );
}
