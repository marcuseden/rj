'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/app-layout';
import { Search, RefreshCw, ExternalLink, Zap, File, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';

interface WorldBankDocument {
  id: string;
  title: string;
  url: string;
  summary: string;
  date: string;
  content?: string;
  topics?: string[];
  keywords?: string[];
  type?: string;
}

interface SearchResponse {
  documents: WorldBankDocument[];
  total: number;
  cached: boolean;
  searchQuery: string;
  totalAvailable?: number;
}

export default function WorldBankSearchPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<WorldBankDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [lastSearchQuery, setLastSearchQuery] = useState('');
  const [currentLimit, setCurrentLimit] = useState(20);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadMoreDocuments = useCallback(async () => {
    if (loadingMore || !hasMore || documents.length >= totalAvailable) return;

    try {
      setLoadingMore(true);
      const newLimit = Math.min(currentLimit + 50, totalAvailable); // Load 50 more at a time, up to total available
      await loadDocuments(lastSearchQuery, newLimit, true); // append=true
    } catch (error) {
      console.error('Error loading more documents:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, documents.length, totalAvailable, currentLimit, lastSearchQuery]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMoreDocuments();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [loadMoreDocuments, hasMore, loadingMore]);

  const loadDocuments = async (query: string = '', limit: number = 20, append: boolean = false) => {
    try {
      setLoading(!append);
      const params = new URLSearchParams();
      if (query.trim()) {
        params.set('q', query.trim());
      }
      params.set('limit', limit.toString());

      const response = await fetch(`/api/worldbank-search?${params.toString()}`);
      if (response.ok) {
        const data: SearchResponse = await response.json();
        if (append) {
          // Append new documents to existing ones
          setDocuments(prev => [...prev, ...data.documents]);
        } else {
          // Replace documents for new search
          setDocuments(data.documents);
        }
        setTotalAvailable(data.totalAvailable || data.total);
        setLastSearchQuery(data.searchQuery);
        setCurrentLimit(limit);
        setHasMore(data.documents.length === limit && limit < (data.totalAvailable || data.total));
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading documents:', error);
      setLoading(false);
    }
  };


  const handleSearch = async () => {
    if (searchQuery.trim() !== lastSearchQuery) {
      setIsSearching(true);
      setHasMore(true); // Reset hasMore for new search
      await loadDocuments(searchQuery, 20); // Reset to 20 when searching
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/worldbank-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'refresh' }),
      });

      if (response.ok) {
        // Reload documents after refresh
        await loadDocuments(lastSearchQuery);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      setLoading(false);
    }
  };

  const populateDatabase = async () => {
    if (!confirm('This will save all 1000+ World Bank documents to the database. This may take a few minutes. Continue?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/worldbank-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'populate-database' }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`✅ Database populated successfully!\n\n${result.totalInserted} documents saved to database.\n\n⚠️ WARNING: ${result.warning || 'Data marked as UNVERIFIED. Manual quality checks required.'}`);
      } else {
        const error = await response.json();
        alert(`❌ Database population failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Error populating database:', error);
      alert('❌ Failed to populate database. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const verifyDataQuality = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/worldbank-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'verify-sample' }),
      });

      if (response.ok) {
        const result = await response.json();
        const qualityReport = `
🔍 DATA QUALITY VERIFICATION REPORT

✅ Passed: ${result.results.passedChecks}/${result.results.totalChecks} checks
📊 Sample Size: ${result.results.sampleSize} documents

📋 ISSUES FOUND:
${result.results.issues.map((issue: any) => `• ${issue}`).join('\n')}

💡 RECOMMENDATIONS:
${result.results.recommendations.map((rec: any) => `• ${rec}`).join('\n')}

🎯 FINAL VERDICT:
${result.recommendation}
        `;

        alert(qualityReport);
      } else {
        const error = await response.json();
        alert(`❌ Quality verification failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Error verifying data quality:', error);
      alert('❌ Failed to verify data quality. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const performWorldBankGeneralIntelligenceCleanup = async () => {
    const isConfirmed = confirm(`
🧠 WORLD BANK GENERAL INTELLIGENCE CLEANUP

This will perform rigorous validation of ALL documents in the database and DELETE any that don't meet World Bank standards:

✅ STRICT CRITERIA:
• Must be from worldbank.org domain ONLY
• Must be published in 2024-2025
• Must have substantial content (>500 chars)
• Must have meaningful titles
• Must be in English
• Must not contain spam/bot content

❌ WILL BE DELETED:
• Documents from non-World Bank sources
• Documents outside 2024-2025 date range
• Documents with insufficient content
• Documents with poor quality metadata

⚠️ This action cannot be undone. Continue?
    `);

    if (!isConfirmed) return;

    setLoading(true);
    try {
      const response = await fetch('/api/worldbank-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'worldbank-general-intelligence-cleanup' }),
      });

      if (response.ok) {
        const result = await response.json();

        const cleanupReport = `
🧠 WORLD BANK GENERAL INTELLIGENCE CLEANUP COMPLETE

📊 SUMMARY:
• Total Documents Analyzed: ${result.results.totalDocuments}
• Retained (Verified): ${result.results.retainedCount}
• Deleted (Unverified): ${result.results.deletedCount}
• Retention Rate: ${result.results.qualityMetrics.retentionRate}%

🎯 VALIDATION STANDARDS ENFORCED:
• World Bank domain only: ✅
• 2024-2025 date range: ✅
• Content quality verified: ✅

${result.results.deletedCount > 0 ? `⚠️ DELETED REASONS:\n${result.results.deletedReasons.map((reason: any) => `• ${reason}`).join('\n')}` : '✅ All documents met validation standards!'}

${result.status}
        `;

        alert(cleanupReport);

        // Refresh the page to show updated document count
        window.location.reload();
      } else {
        const error = await response.json();
        alert(`❌ Cleanup failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Error performing cleanup:', error);
      alert('❌ Failed to perform cleanup. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const generateStrategicExpansionPlan = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/worldbank-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'strategic-expansion-plan' }),
      });

      if (response.ok) {
        const result = await response.json();

        const planReport = `
📈 RJ BANGA STRATEGIC EXPANSION PLAN 2025

🎯 EXECUTIVE SUMMARY:
${result.plan.executiveSummary}

📊 CURRENT STATE:
• Speeches: ${result.implementation.currentDatabase}
• World Bank Documents: ${result.plan.currentState.worldBankDocs}
• Total Verified Content: ${result.plan.currentState.totalVerifiedContent}
• Quality Standard: ${result.plan.currentState.qualityStandard}

🎯 EXPANSION TARGET:
• Target: ${result.implementation.targetExpansion}
• Priority Initiatives: ${result.implementation.priorityInitiatives.join(', ')}

📅 IMPLEMENTATION PHASES:
1. Q1 2025: ${result.plan.strategicExpansion.phase1.name} (${result.plan.strategicExpansion.phase1.targetDocuments} documents)
2. Q2 2025: ${result.plan.strategicExpansion.phase2.name} (${result.plan.strategicExpansion.phase2.targetDocuments} documents)
3. Q3-Q4 2025: ${result.plan.strategicExpansion.phase3.name} (${result.plan.strategicExpansion.phase3.targetDocuments} documents)

💰 BUDGET: ${result.plan.budgetResources.total}

🎯 SUCCESS METRICS:
• Quantitative: ${result.plan.successMetrics.quantitative.targetDocuments} documents, ${result.plan.successMetrics.quantitative.qualityRetentionRate} retention
• Qualitative: Complete strategic vision mapping, actionable intelligence

🚀 READY TO IMPLEMENT?
        `;

        alert(planReport);
      } else {
        const error = await response.json();
        alert(`❌ Failed to generate plan: ${error.error}`);
      }
    } catch (error) {
      console.error('Error generating strategic plan:', error);
      alert('❌ Failed to generate strategic expansion plan. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const executeStrategicCollection = async () => {
    const isConfirmed = confirm(`
🚀 IMMEDIATE STRATEGIC DOCUMENT COLLECTION

This will execute the strategic expansion plan NOW and collect RJ Banga's change initiatives from World Bank sources:

🎯 TARGET STRATEGIC DOCUMENTS:
• Evolution Agenda Implementation Plan
• Private Sector Mobilization Strategy 2025-2030
• Human Capital Development Framework
• Digital Transformation Roadmap
• Climate Finance Scaling Strategy
• World Bank Strategy 2025
• Annual Meetings 2025 Progress Reports
• Mission 300 Implementation Updates

📊 EXPECTED RESULTS:
• 50-150+ strategic documents collected immediately
• All documents tagged with RJ Banga initiatives
• Strategic priority levels assigned
• Implementation timelines mapped

⚠️ This will take 2-3 minutes to process all sources. Continue?
    `);

    if (!isConfirmed) return;

    setLoading(true);
    try {
      const response = await fetch('/api/worldbank-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'execute-strategic-collection' }),
      });

      if (response.ok) {
        const result = await response.json();

        const collectionReport = `
🚀 STRATEGIC DOCUMENT COLLECTION COMPLETE!

📊 COLLECTION RESULTS:
• Sources Processed: ${result.results.sourcesProcessed}
• Documents Found: ${result.results.documentsFound}
• Documents Collected: ${result.results.totalCollected}
• Success Rate: ${result.results.documentsFound > 0 ? Math.round((result.results.totalCollected / result.results.documentsFound) * 100) : 0}%

📂 DOCUMENTS BY CATEGORY:
${Object.entries(result.results.collectionByCategory).map(([category, count]) => `• ${category}: ${count}`).join('\n')}

${result.results.errors.length > 0 ? `⚠️ ERRORS ENCOUNTERED:\n${result.results.errors.slice(0, 3).map(error => `• ${error}`).join('\n')}` : '✅ No errors encountered!'}

${result.status}
        `;

        alert(collectionReport);

        // Refresh the page to show updated document count
        window.location.reload();
      } else {
        const error = await response.json();
        alert(`❌ Strategic collection failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Error executing strategic collection:', error);
      alert('❌ Failed to execute strategic collection. Check console for details.');
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
            <p className="mt-4 text-gray-600">Loading World Bank documents...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              World Bank Knowledge Base
            </h1>
            <div className="flex gap-3">
              <Button
                onClick={refreshData}
                variant="outline"
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh API Data
              </Button>

              <Button
                onClick={populateDatabase}
                variant="default"
                disabled={loading}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <File className="w-4 h-4" />
                Save to Database
              </Button>

              <Button
                onClick={verifyDataQuality}
                variant="outline"
                disabled={loading}
                className="flex items-center gap-2 border-orange-500 text-orange-600 hover:bg-orange-50"
              >
                <CheckCircle className="w-4 h-4" />
                Verify Data Quality
              </Button>

              <Button
                onClick={performWorldBankGeneralIntelligenceCleanup}
                variant="outline"
                disabled={loading}
                className="flex items-center gap-2 border-red-500 text-red-600 hover:bg-red-50"
              >
                <AlertTriangle className="w-4 h-4" />
                🧠 World Bank General Intelligence Cleanup
              </Button>

              <Button
                onClick={generateStrategicExpansionPlan}
                variant="outline"
                disabled={loading}
                className="flex items-center gap-2 border-purple-500 text-purple-600 hover:bg-purple-50"
              >
                <TrendingUp className="w-4 h-4" />
                📈 Strategic Expansion Plan
              </Button>

              <Button
                onClick={executeStrategicCollection}
                variant="default"
                disabled={loading}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Zap className="w-4 h-4" />
                🚀 Execute Strategic Collection NOW
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search World Bank articles, speeches, and documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 pr-4 py-3 text-base"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isSearching || loading}
              className="px-8 py-3"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {/* Search Info */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              {lastSearchQuery ? (
                <span>
                  Showing {documents.length} of {totalAvailable} results for "{lastSearchQuery}"
                </span>
              ) : (
                <span>
                  Showing all {documents.length} documents
                </span>
              )}
            </div>

            {/* Infinite Scroll Trigger */}
            <div ref={observerRef} className="h-10 flex items-center justify-center">
              {loadingMore && (
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  <span>Loading more documents...</span>
                </div>
              )}
              {!hasMore && documents.length > 20 && (
                <div className="text-gray-500 text-sm">
                  You've reached the end of all {totalAvailable} documents
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <span>Powered by World Bank API • 2024-2025 Content</span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">
                {isSearching ? 'Searching documents...' : 'Loading World Bank articles...'}
              </p>
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && (
          <>
            {documents.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents found</h3>
                <p className="text-gray-600">
                  {lastSearchQuery
                    ? `No results found for "${lastSearchQuery}". Try a different search term.`
                    : 'No documents available. Try refreshing the data.'
                  }
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {documents.map((doc) => (
                  <Card key={doc.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col h-full">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <h3
                            className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer line-clamp-2 leading-tight"
                            onClick={() => router.push(`/worldbank-search/${doc.id}`)}
                          >
                            {doc.title}
                          </h3>
                          {doc.url && (
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-400 hover:text-blue-600 ml-2 flex-shrink-0"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                          {doc.summary}
                        </p>

                        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                          <span>{doc.date}</span>
                          {doc.type && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {doc.type}
                            </span>
                          )}
                        </div>
                      </div>

                      <Button
                        onClick={() => router.push(`/worldbank-search/${doc.id}`)}
                        variant="outline"
                        size="sm"
                        className="w-full mt-4"
                      >
                        Read More
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
