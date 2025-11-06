'use client';

import { useState, useRef } from 'react';
import { Sparkles, Copy, Check, Upload, CheckCircle, AlertCircle, TrendingUp, Info, ChevronDown, FileText, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AnalysisResult {
  alignmentScore: number;
  aligned: Array<{
    point: string;
    reason: string;
  }>;
  improvements: Array<{
    issue: string;
    suggestion: string;
    why: string;
  }>;
  improvedText: string;
  keyChanges: string[];
}

export default function RJWritingAssistantPage() {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeText = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setAnalysis(null);

    try {
      const response = await fetch('/api/rj-writing-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText })
      });

      if (!response.ok) throw new Error('Analysis failed');

      const result = await response.json();
      setAnalysis(result);
    } catch (error) {
      console.error('Error analyzing text:', error);
      alert('Failed to analyze text. Please try again.');
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword', // .doc
      'text/plain'
    ];

    if (!validTypes.includes(file.type)) {
      alert('Please upload a PDF, Word document (.doc, .docx), or text file.');
      return;
    }

    setUploading(true);
    setUploadedFile(file);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/extract-text', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to extract text');

      const data = await response.json();
      setInputText(data.text);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to extract text from file. Please try again or paste the text manually.');
      setUploadedFile(null);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pt-16 md:pt-0">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-4 md:px-6 py-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl md:text-4xl font-bold text-stone-900 mb-2">RJ Banga Voice Alignment Tool</h1>
          <p className="text-sm md:text-base text-stone-600">Align your writing with President Ajay Banga's personal communication style and vision</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Info Banner - Collapsible on Mobile */}
        <div className="mb-6">
          {/* Info Icon Button - Mobile Only */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="md:hidden w-full flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg mb-2 active:bg-blue-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-[#0071bc]" />
              <span className="text-sm font-medium text-stone-900">
                About this tool
              </span>
            </div>
            <ChevronDown className={`h-5 w-5 text-stone-600 transition-transform ${showInfo ? 'rotate-180' : ''}`} />
          </button>
          
          {/* Info Content - Always visible on desktop, collapsible on mobile */}
          <Card className={`bg-blue-50 border-blue-200 ${showInfo ? 'block' : 'hidden md:block'}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="hidden md:block h-5 w-5 text-[#0071bc] mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-stone-900 font-semibold mb-1">
                    Align with CEO Ajay Banga's Personal Voice & Vision
                  </p>
                  <p className="text-stone-700">
                    Analyzes your text against President Banga's authentic speaking style from 13 speeches, 53 documents • Uses his personal communication patterns: specific numbers, concrete examples, urgency, signature phrases • Not generic institutional language - this is RJ's unique CEO voice
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Input Section */}
        <Card className="bg-white border-stone-200 mb-6">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-stone-700">
                Your Text or Document
              </label>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="text-xs"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-stone-600 mr-1"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-3 w-3 mr-1" />
                      Upload File
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Uploaded File Badge */}
            {uploadedFile && (
              <div className="mb-2 flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                <FileText className="h-4 w-4 text-[#0071bc]" />
                <span className="text-sm text-stone-700 flex-1 truncate">{uploadedFile.name}</span>
                <button
                  onClick={removeFile}
                  className="text-stone-500 hover:text-stone-700"
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your speech, statement, strategy document, or any text here...

Or click 'Upload File' to upload a PDF or Word document.

Example: 'Our organization is working on renewable energy projects to address climate change and create sustainable growth opportunities.'"
              className="w-full h-48 md:h-64 px-3 md:px-4 py-3 border border-stone-300 rounded-lg resize-none focus:ring-2 focus:ring-[#0071bc] focus:border-transparent text-sm"
            />
            <div className="mt-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
              <span className="text-xs md:text-sm text-stone-500">
                {inputText.split(/\s+/).filter(w => w).length} words • {inputText.length} characters
              </span>
              <Button
                onClick={analyzeText}
                disabled={!inputText.trim() || loading}
                className="w-full md:w-auto bg-[#0071bc] hover:bg-[#005a99] text-white"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analyze Alignment
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Alignment Score */}
            <Card className={`border-2 ${getScoreBg(analysis.alignmentScore)}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-stone-900 mb-1">Voice Alignment Score</h2>
                    <p className="text-sm text-stone-600">How closely your text matches President Banga's personal communication style</p>
                  </div>
                  <div className={`text-6xl font-bold ${getScoreColor(analysis.alignmentScore)}`}>
                    {analysis.alignmentScore}%
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* What's Aligned */}
            {analysis.aligned && analysis.aligned.length > 0 && (
              <Card className="bg-white border-stone-200">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-stone-900 mb-4 flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                    What's Already Good ({analysis.aligned.length})
                  </h2>
                  <div className="space-y-4">
                    {analysis.aligned.map((item, idx) => (
                      <div key={idx} className="border-l-4 border-green-500 pl-4 py-2 bg-green-50 rounded-r">
                        <p className="font-medium text-stone-900 mb-2">{item.point}</p>
                        <p className="text-sm text-stone-600">{item.reason}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Improvements Needed */}
            {analysis.improvements && analysis.improvements.length > 0 && (
              <Card className="bg-white border-stone-200">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-stone-900 mb-4 flex items-center">
                    <TrendingUp className="h-6 w-6 text-amber-600 mr-2" />
                    How to Improve ({analysis.improvements.length})
                  </h2>
                  <div className="space-y-4">
                    {analysis.improvements.map((item, idx) => (
                      <div key={idx} className="border-l-4 border-amber-400 pl-4 py-3 bg-amber-50 rounded-r">
                        <div className="flex items-start gap-2 mb-2">
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs">
                            Improvement {idx + 1}
                          </Badge>
                        </div>
                        <p className="font-medium text-stone-900 mb-2">
                          Issue: {item.issue}
                        </p>
                        <p className="text-sm text-[#0071bc] font-medium mb-2">
                          → Suggestion: {item.suggestion}
                        </p>
                        <p className="text-xs text-stone-600 bg-white p-2 rounded border border-amber-200">
                          Why this matters: {item.why}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Improved Version */}
            <Card className="bg-white border-stone-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-stone-900">
                    Rewritten in RJ Banga's Voice
                  </h2>
                  <Button
                    onClick={() => copyToClipboard(analysis.improvedText)}
                    variant="outline"
                    className="text-stone-600 hover:text-stone-900"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2 text-green-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Text
                      </>
                    )}
                  </Button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <p className="text-stone-900 whitespace-pre-wrap leading-relaxed">
                    {analysis.improvedText}
                  </p>
                </div>

                {/* Key Changes */}
                {analysis.keyChanges && analysis.keyChanges.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-stone-200">
                    <h3 className="font-semibold text-stone-900 mb-3">
                      Key Changes Applied
                    </h3>
                    <div className="space-y-2">
                      {analysis.keyChanges.map((change, idx) => (
                        <div key={idx} className="flex items-start gap-3 text-sm">
                          <span className="text-[#0071bc] font-bold mt-0.5">•</span>
                          <span className="text-stone-700">{change}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {!analysis && !loading && (
          <Card className="bg-white border-stone-200">
            <CardContent className="p-12 text-center">
              <Sparkles className="h-16 w-16 mx-auto mb-4 text-stone-400" />
              <h3 className="text-lg font-semibold text-stone-900 mb-2">
                Match President Banga's Communication Style
              </h3>
              <p className="text-stone-600 mb-6">
                Get AI-powered analysis comparing your text to RJ Banga's authentic CEO voice - not generic institutional language, but his personal way of communicating vision and driving action
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="outline">Specific Numbers</Badge>
                <Badge variant="outline">Concrete Examples</Badge>
                <Badge variant="outline">Urgency & Action</Badge>
                <Badge variant="outline">Signature Phrases</Badge>
                <Badge variant="outline">Data-Driven</Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
