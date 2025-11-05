'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AppLayout } from '@/components/app-layout';
import {
  Upload,
  FileText,
  Sparkles,
  TrendingUp,
  Target,
  Lightbulb,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertTriangle,
  File
} from 'lucide-react';

interface AlignmentResult {
  overallScore: number;
  styleScore: number;
  visionScore: number;
  feedback: string;
  improvementTips: string[];
  analytics: {
    wordCount: number;
    charCount: number;
    readingTime: number;
    matchedKeywords: string[];
    missingKeywords: string[];
    toneAnalysis: string;
    structureScore: number;
  };
}

export default function RJAgentPage() {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AlignmentResult | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      // Use the enhanced API response directly
      const enhancedResult: AlignmentResult = {
        overallScore: data.overallScore,
        styleScore: data.scores?.coreAlignment || Math.round(data.overallScore * 0.8),
        visionScore: data.scores?.missionAlignment || Math.round(data.overallScore * 0.9),
        feedback: data.feedback,
        improvementTips: generateImprovementTips(data.overallScore, data.matchedKeywords || []),
        analytics: {
          wordCount: data.wordCount,
          charCount: data.charCount,
          readingTime: Math.ceil(data.wordCount / 200), // Assume 200 words per minute
          matchedKeywords: data.matchedKeywords || [],
          missingKeywords: getMissingKeywords(data.matchedKeywords || []),
          toneAnalysis: getToneAnalysis(data.overallScore),
          structureScore: data.scores?.secondaryAlignment || Math.round(data.overallScore * 0.85)
        }
      };

      setResult(enhancedResult);
    } catch (error) {
      console.error('Error analyzing text:', error);
      alert('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getMissingKeywords = (matched: string[]) => {
    const allKeywords = [
      'partnership', 'innovation', 'results', 'poverty', 'development',
      'sustainability', 'equity', 'accountability', 'impact', 'climate',
      'growth', 'jobs', 'reform', 'investment', 'collaboration',
      'transformation', 'inclusion', 'resilience', 'empowerment'
    ];
    return allKeywords.filter(keyword => !matched.includes(keyword));
  };

  const generateImprovementTips = (score: number, matched: string[]) => {
    const tips = [];

    if (score < 70) {
      tips.push('Focus on measurable outcomes and specific results rather than general statements');
      tips.push('Incorporate more data-driven examples and concrete achievements');
      tips.push('Emphasize partnership and collaboration approaches');
      tips.push('Include forward-looking vision with clear action plans');
    } else if (score < 85) {
      tips.push('Add more specific metrics and quantifiable impact statements');
      tips.push('Strengthen the call-to-action with clear next steps');
      tips.push('Incorporate more diverse stakeholder perspectives');
    } else {
      tips.push('Your content already shows strong alignment with Ajay Banga\'s style');
      tips.push('Consider adding even more specific data points for enhanced credibility');
    }

    return tips;
  };

  const getToneAnalysis = (score: number) => {
    if (score >= 85) return 'Authoritative and visionary with strong leadership presence';
    if (score >= 70) return 'Professional and results-oriented with good strategic focus';
    return 'Functional but could benefit from more inspirational and outcome-focused language';
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setInputText(text);
    };
    reader.readAsText(file);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 85) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (score >= 70) return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Avatar className="w-24 h-24 ring-4 ring-stone-300">
                <AvatarImage
                  src="/ajay-banga.svg"
                  onError={(e) => e.currentTarget.style.display = 'none'}
                />
                <AvatarFallback className="bg-gradient-to-br from-green-500 to-green-600 text-white text-2xl font-bold">
                  AB
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-stone-900 mb-2">
            Text Alignment Analysis
          </h1>
          <p className="text-stone-600 text-lg">
            Check alignment with Ajay Banga's vision and communication style
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-stone-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Input Text
            </h2>

            {/* File Upload */}
            <div className="mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.doc,.docx,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {fileName ? `File: ${fileName}` : 'Upload Document'}
              </Button>
            </div>

            {/* Text Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Or paste your text here:
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste your document text here to analyze alignment with Ajay Banga's vision and style..."
                className="w-full min-h-[300px] p-3 border border-stone-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={15}
              />
            </div>

            {/* Analyze Button */}
            <Button
              onClick={analyzeText}
              disabled={loading || !inputText.trim()}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze Alignment
                </>
              )}
            </Button>
          </Card>

          {/* Results Section */}
          <div className="space-y-6">
            {result && (
              <>
                {/* Overall Score */}
                <Card className="p-6">
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {getScoreIcon(result.overallScore)}
                      <h3 className="text-2xl font-bold text-stone-900">Alignment Score</h3>
                    </div>
                    <div className={`text-6xl font-bold ${getScoreColor(result.overallScore)}`}>
                      {result.overallScore}%
                    </div>
                    <p className="text-stone-600 mt-2">{result.feedback}</p>
                  </div>

                  {/* Score Breakdown */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(result.styleScore)}`}>
                        {result.styleScore}%
                      </div>
                      <div className="text-sm text-stone-600">Style Match</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(result.visionScore)}`}>
                        {result.visionScore}%
                      </div>
                      <div className="text-sm text-stone-600">Vision Match</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(result.analytics.structureScore)}`}>
                        {result.analytics.structureScore}%
                      </div>
                      <div className="text-sm text-stone-600">Structure</div>
                    </div>
                  </div>
                </Card>

                {/* Analytics */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-stone-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Analytics
                  </h3>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-stone-50 rounded-lg">
                      <div className="text-2xl font-bold text-stone-900">{result.analytics.wordCount}</div>
                      <div className="text-sm text-stone-600">Words</div>
                    </div>
                    <div className="text-center p-3 bg-stone-50 rounded-lg">
                      <div className="text-2xl font-bold text-stone-900">{result.analytics.readingTime}</div>
                      <div className="text-sm text-stone-600">Min Read</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm font-medium text-stone-700 mb-2">Tone Analysis:</div>
                    <div className="text-sm text-stone-600 bg-stone-50 p-3 rounded-lg">
                      {result.analytics.toneAnalysis}
                    </div>
                  </div>

                  {/* Keywords */}
                  <div className="mb-4">
                    <div className="text-sm font-medium text-stone-700 mb-2 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Matched Keywords ({result.analytics.matchedKeywords.length}):
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {result.analytics.matchedKeywords.map((keyword, index) => (
                        <Badge key={index} className="bg-green-100 text-green-800">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm font-medium text-stone-700 mb-2 flex items-center gap-1">
                      <XCircle className="w-4 h-4 text-red-600" />
                      Missing Keywords ({result.analytics.missingKeywords.length}):
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {result.analytics.missingKeywords.slice(0, 8).map((keyword, index) => (
                        <Badge key={index} variant="outline" className="border-red-200 text-red-700">
                          {keyword}
                        </Badge>
                      ))}
                      {result.analytics.missingKeywords.length > 8 && (
                        <Badge variant="outline" className="border-stone-200 text-stone-600">
                          +{result.analytics.missingKeywords.length - 8} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Improvement Tips */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-stone-900 mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Improvement Tips
                  </h3>

                  <div className="space-y-3">
                    {result.improvementTips.map((tip, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <Target className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-stone-700">{tip}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            )}

            {!result && !loading && (
              <Card className="p-6">
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-stone-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-stone-900 mb-2">
                    Ready to Analyze
                  </h3>
                  <p className="text-stone-600 text-sm">
                    Upload a document or paste text to get alignment analysis with Ajay Banga's vision and style.
                  </p>
                </div>
              </Card>
            )}

            {loading && (
              <Card className="p-6">
                <div className="text-center py-12">
                  <div className="w-16 h-16 border-4 border-stone-200 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold text-stone-900 mb-2">
                    Analyzing Your Text
                  </h3>
                  <p className="text-stone-600 text-sm">
                    Checking alignment with Ajay Banga's vision and communication style...
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
