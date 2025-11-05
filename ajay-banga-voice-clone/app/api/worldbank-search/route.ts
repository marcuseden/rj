import { NextRequest, NextResponse } from 'next/server';
import { WorldBankKnowledgeBase, WorldBankDocument } from '@/lib/worldbank-knowledge';
import { WorldBankDB } from '@/lib/worldbank-db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const id = searchParams.get('id'); // Single document fetch
    const autocomplete = searchParams.get('autocomplete') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');

    // Handle single document fetch
    if (id) {
      const db = new WorldBankDB();
      const document = await db.getDocument(id);

      if (document) {
        return NextResponse.json({
          document: {
            id: document.id,
            title: document.title,
            url: document.url,
            summary: document.summary,
            content: document.content,
            date: document.date,
            topics: document.topics || [],
            keywords: document.keywords || [],
            type: document.type
          }
        });
      } else {
        return NextResponse.json(
          { error: 'Document not found' },
          { status: 404 }
        );
      }
    }

    if (autocomplete && query) {
      // Handle autocomplete requests
      const db = new WorldBankDB();

      // Get title autocompletions using trigram similarity
      const titleSuggestions = await db.supabase
        .from('worldbank_documents')
        .select('title')
        .limit(Math.min(limit, 10));

      // Get content autocompletions
      const contentSuggestions = await db.supabase
        .from('worldbank_documents')
        .select('title, content')
        .limit(Math.min(limit, 10));

      // Get keywords and topics from documents that might contain the query
      const keywordResults = await db.supabase
        .from('worldbank_documents')
        .select('keywords')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .limit(100);

      const topicResults = await db.supabase
        .from('worldbank_documents')
        .select('topics')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .limit(100);

      // Extract unique suggestions that contain the query
      const allKeywords = keywordResults.data?.flatMap(doc => doc.keywords || []) || [];
      const allTopics = topicResults.data?.flatMap(doc => doc.topics || []) || [];

      const keywordSuggestions = [...new Set(
        allKeywords.filter(k =>
          k && k.toLowerCase().includes(query.toLowerCase())
        )
      )].slice(0, 5);

      const topicSuggestions = [...new Set(
        allTopics.filter(t =>
          t && t.toLowerCase().includes(query.toLowerCase())
        )
      )].slice(0, 5);

      return NextResponse.json({
        autocomplete: true,
        query,
        suggestions: {
          titles: titleSuggestions.data?.filter(item =>
            item.title && item.title.toLowerCase().includes(query.toLowerCase())
          ).slice(0, 5).map(item => ({
            text: item.title,
            type: 'title'
          })) || [],
          content: contentSuggestions.data?.filter(item =>
            item.content && item.content.toLowerCase().includes(query.toLowerCase())
          ).slice(0, 3).map(item => ({
            text: item.title,
            snippet: item.content.substring(0, 100) + '...',
            type: 'content'
          })) || [],
          keywords: keywordSuggestions.map(kw => ({
            text: kw,
            type: 'keyword'
          })),
          topics: topicSuggestions.map(topic => ({
            text: topic,
            type: 'topic'
          }))
        },
        timestamp: new Date().toISOString()
      });
    }

    // Regular search using database
    const db = new WorldBankDB();
    let documents = [];
    let totalAvailable = 0;

    if (query.trim()) {
      // Use full-text search for query
      // First get the total count of search results
      const allSearchResults = await db.fullTextSearch(query, 10000); // Get all results to count
      totalAvailable = allSearchResults.length;

      // Then get the limited results for display
      const searchResults = allSearchResults.slice(0, Math.min(limit, 200));
      documents = searchResults.map(doc => ({
        id: doc.id,
        title: doc.title,
        url: doc.url,
        summary: doc.summary,
        date: doc.date,
        content: doc.content,
        topics: doc.topics || [],
        keywords: doc.keywords || [],
        type: doc.type
      }));
    } else {
      // Get all documents if no query (for browse functionality)
      // First get the total count
      const { count: totalCount, error: countError } = await db.supabase
        .from('worldbank_documents')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;

      // Then get the limited results
      const { data, error } = await db.supabase
        .from('worldbank_documents')
        .select('*')
        .order('date', { ascending: false })
        .limit(Math.min(limit, 200));

      if (error) throw error;

      documents = (data || []).map(doc => ({
        id: doc.id,
        title: doc.title,
        url: doc.url,
        summary: doc.summary,
        date: doc.date,
        content: doc.content,
        topics: doc.topics || [],
        keywords: doc.keywords || [],
        type: doc.type
      }));

      // Use the actual total count from the database
      totalAvailable = totalCount || 0;
    }

    return NextResponse.json({
      documents,
      total: documents.length,
      cached: false,
      searchQuery: query,
      totalAvailable: totalAvailable,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in GET:', error);
    return NextResponse.json(
      { error: 'Failed to load documents' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'populate-database':
        return await handlePopulateDatabase();

      case 'verify-sample':
        return await handleVerifySample();

      case 'worldbank-general-intelligence-cleanup':
        return await handleWorldBankGeneralIntelligenceCleanup();

      case 'strategic-expansion-plan':
        return await handleStrategicExpansionPlan();

      case 'execute-strategic-collection':
        return await handleExecuteStrategicCollection();

      case 'refresh':
        return await handleRefreshData();

      case 'add_test_mexico_document':
        return await handleAddTestMexicoDocument();

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${action}`
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handlePopulateDatabase() {
  try {
    const documents = await WorldBankKnowledgeBase.getAllDocuments();
    const db = new WorldBankDB();

    console.log(`📊 Starting database population with ${documents.length} documents...`);

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const doc of documents) {
      try {
        // Convert to database format
        const dbDoc = {
          id: doc.id,
          title: doc.title,
          url: doc.url,
          content: doc.content || doc.summary,
          summary: doc.summary,
          date: doc.date,
          type: doc.type,
          file_type: 'html',
          file_size: (doc.content || doc.summary).length,
          local_path: null,

          topics: doc.topics,
          keywords: doc.keywords,
          citations: [],
          related_documents: [],

          // Tags - flatten the complex object
          tags_document_type: doc.tags.documentType,
          tags_content_type: doc.tags.contentType,
          tags_audience: doc.tags.audience,
          tags_regions: doc.regions,
          tags_sectors: doc.sectors,
          tags_initiatives: doc.initiatives,
          tags_authors: doc.tags.authors,
          tags_departments: [], // departments field doesn't exist in current schema
          tags_priority: doc.tags.priority,
          tags_status: doc.tags.status,

          // Source reference
          source_original_url: doc.sourceReference.originalUrl,
          source_scraped_from: doc.sourceReference.scrapedFrom,
          source_parent_page: null, // parentPage field doesn't exist in current schema
          source_link_text: null, // linkText field doesn't exist in current schema
          source_discovered_at: doc.sourceReference.discoveredAt,
          source_type: doc.sourceReference.sourceType,

          // Metadata
          metadata_language: doc.metadata.language,
          metadata_word_count: doc.metadata.wordCount,
          metadata_reading_time: doc.metadata.readingTime,
          metadata_last_modified: null,

          scraped_at: doc.scrapedAt || new Date().toISOString()
        };

        await db.saveDocument(dbDoc);
        successCount++;
        console.log(`✅ Saved: ${doc.title.substring(0, 50)}...`);
      } catch (error) {
        errorCount++;
        const errorMsg = `Failed to save ${doc.title}: ${error instanceof Error ? error.message : String(error)}`;
        errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    }

    return NextResponse.json({
      success: true,
      totalInserted: successCount,
      totalErrors: errorCount,
      warning: errorCount > 0 ? `${errorCount} documents failed to save. Check logs for details.` : null,
      errors: errors.slice(0, 10), // Limit error output
      message: `Successfully saved ${successCount} documents to database`
    });

  } catch (error) {
    console.error('Error populating database:', error);
    return NextResponse.json(
      { error: `Database population failed: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

async function handleVerifySample() {
  try {
    const documents = await WorldBankKnowledgeBase.getAllDocuments();
    const sampleSize = Math.min(50, documents.length);

    // Take random sample
    const sample = documents
      .sort(() => 0.5 - Math.random())
      .slice(0, sampleSize);

    const issues: string[] = [];
    const recommendations: string[] = [];

    sample.forEach(doc => {
      // Check domain
      if (!doc.url.includes('worldbank.org')) {
        issues.push(`Document "${doc.title}" from non-World Bank domain: ${doc.url}`);
      }

      // Check date range (2024-2025)
      const docDate = new Date(doc.date);
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2025-12-31');

      if (docDate < startDate || docDate > endDate) {
        issues.push(`Document "${doc.title}" outside date range: ${doc.date}`);
      }

      // Check content length
      const contentLength = (doc.content || doc.summary).length;
      if (contentLength < 500) {
        issues.push(`Document "${doc.title}" has insufficient content (${contentLength} chars)`);
      }

      // Check title quality
      if (doc.title.length < 10) {
        issues.push(`Document "${doc.title}" has suspiciously short title`);
      }

      // Check for spam/bot content
      const spamIndicators = ['click here', 'buy now', 'free download', '!!!'];
      const hasSpam = spamIndicators.some(indicator =>
        doc.title.toLowerCase().includes(indicator) ||
        doc.summary.toLowerCase().includes(indicator)
      );

      if (hasSpam) {
        issues.push(`Document "${doc.title}" contains spam indicators`);
      }
    });

    // Generate recommendations
    if (issues.length > sampleSize * 0.3) {
      recommendations.push('High error rate detected. Consider manual review of all documents.');
    }

    if (issues.some(issue => issue.includes('non-World Bank domain'))) {
      recommendations.push('Filter out documents from non-worldbank.org domains.');
    }

    if (issues.some(issue => issue.includes('outside date range'))) {
      recommendations.push('Focus on 2024-2025 content only.');
    }

    const passedChecks = sampleSize - issues.length;
    const qualityScore = (passedChecks / sampleSize) * 100;

    let recommendation = 'ACCEPTABLE';
    if (qualityScore < 70) {
      recommendation = 'UNACCEPTABLE - Requires immediate cleanup';
    } else if (qualityScore < 90) {
      recommendation = 'REVIEW REQUIRED - Manual verification needed';
    } else {
      recommendation = 'VERIFIED - Ready for production use';
    }

    return NextResponse.json({
      success: true,
      results: {
        sampleSize,
        totalChecks: sampleSize,
        passedChecks,
        failedChecks: issues.length,
        qualityScore: Math.round(qualityScore),
        issues: issues.slice(0, 20), // Limit output
        recommendations
      },
      recommendation
    });

  } catch (error) {
    console.error('Error verifying sample:', error);
    return NextResponse.json(
      { error: `Verification failed: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

async function handleWorldBankGeneralIntelligenceCleanup() {
  try {
    const db = new WorldBankDB();

    // Get all documents from database
    const { data: allDocs, error: fetchError } = await db.supabase
      .from('worldbank_documents')
      .select('*');

    if (fetchError) throw fetchError;

    const totalDocuments = allDocs.length;
    let retainedCount = 0;
    let deletedCount = 0;
    const deletedReasons: string[] = [];

    for (const doc of allDocs) {
      let shouldDelete = false;
      const reasons: string[] = [];

      // Check domain
      if (!doc.url.includes('worldbank.org')) {
        shouldDelete = true;
        reasons.push('Non-World Bank domain');
      }

      // Check date range
      const docDate = new Date(doc.date);
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2025-12-31');

      if (docDate < startDate || docDate > endDate) {
        shouldDelete = true;
        reasons.push('Outside 2024-2025 date range');
      }

      // Check content quality
      if (!doc.content || doc.content.length < 500) {
        shouldDelete = true;
        reasons.push('Insufficient content');
      }

      // Check title quality
      if (!doc.title || doc.title.length < 10) {
        shouldDelete = true;
        reasons.push('Poor title quality');
      }

      // Note: We accept all World Bank languages as valid sources

      if (shouldDelete) {
        // Delete the document
        const { error: deleteError } = await db.supabase
          .from('worldbank_documents')
          .delete()
          .eq('id', doc.id);

        if (deleteError) {
          console.error(`Failed to delete ${doc.id}:`, deleteError);
        } else {
          deletedCount++;
          deletedReasons.push(`${doc.title}: ${reasons.join(', ')}`);
        }
      } else {
        // Mark as verified
        const { error: updateError } = await db.supabase
          .from('worldbank_documents')
          .update({ tags_status: 'verified' })
          .eq('id', doc.id);

        if (!updateError) {
          retainedCount++;
        }
      }
    }

    const qualityMetrics = {
      retentionRate: totalDocuments > 0 ? Math.round((retainedCount / totalDocuments) * 100) : 0,
      deletionRate: totalDocuments > 0 ? Math.round((deletedCount / totalDocuments) * 100) : 0
    };

    const status = qualityMetrics.retentionRate >= 90
      ? '✅ EXCELLENT - Database meets 90% quality standard'
      : qualityMetrics.retentionRate >= 70
        ? '⚠️ ACCEPTABLE - Manual review recommended'
        : '❌ CRITICAL - Immediate action required';

    return NextResponse.json({
      success: true,
      results: {
        totalDocuments,
        retainedCount,
        deletedCount,
        qualityMetrics,
        deletedReasons: deletedReasons.slice(0, 10)
      },
      status
    });

  } catch (error) {
    console.error('Error in cleanup:', error);
    return NextResponse.json(
      { error: `Cleanup failed: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

async function handleStrategicExpansionPlan() {
  try {
    const db = new WorldBankDB();

    // Get current database stats
    const stats = await db.getStats();

    const currentDatabase = `${stats.total} documents`;
    const worldBankDocs = stats.total;
    const totalVerifiedContent = stats.total; // Assuming all are verified for now
    const qualityStandard = '90%+ research-grade quality required';

    // Strategic expansion plan
    const plan = {
      executiveSummary: 'Strategic expansion to build comprehensive RJ Banga knowledge base covering his change initiatives, policy priorities, and strategic vision through World Bank sources.',
      currentState: {
        worldBankDocs,
        totalVerifiedContent,
        qualityStandard
      },
      strategicExpansion: {
        phase1: {
          name: 'Foundation Building (Q1 2025)',
          targetDocuments: 500,
          focus: 'Core strategic documents, policy papers, and implementation plans'
        },
        phase2: {
          name: 'Deep Implementation (Q2 2025)',
          targetDocuments: 1000,
          focus: 'Change management frameworks, stakeholder engagement, and progress reports'
        },
        phase3: {
          name: 'Comprehensive Coverage (Q3-Q4 2025)',
          targetDocuments: 2000,
          focus: 'Complete RJ Banga strategic portfolio and impact assessment'
        }
      },
      budgetResources: {
        total: '$50,000-100,000',
        breakdown: 'API costs, data processing, quality assurance, and manual verification'
      },
      successMetrics: {
        quantitative: {
          targetDocuments: 2000,
          qualityRetentionRate: 95
        },
        qualitative: [
          'Complete strategic vision mapping',
          'Actionable intelligence for decision-making',
          'Real-time policy insights'
        ]
      }
    };

    const implementation = {
      currentDatabase,
      targetExpansion: '2000+ strategic documents',
      priorityInitiatives: [
        'Evolution Agenda Implementation',
        'Private Sector Mobilization Strategy',
        'Human Capital Development Framework',
        'Digital Transformation Roadmap'
      ]
    };

    return NextResponse.json({
      success: true,
      plan,
      implementation
    });

  } catch (error) {
    console.error('Error generating plan:', error);
    return NextResponse.json(
      { error: `Plan generation failed: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

async function executeImmediateStrategicCollection() {
  try {
    const strategicQueries = [
      'evolution agenda implementation plan',
      'private sector mobilization strategy 2025-2030',
      'human capital development framework',
      'digital transformation roadmap world bank',
      'climate finance scaling strategy',
      'world bank strategy 2025',
      'annual meetings 2025 progress reports',
      'mission 300 implementation updates',
      'rj banga change management',
      'world bank innovation strategy',
      'development effectiveness review',
      'strategic directions paper'
    ];

    console.log('🚀 Starting strategic document collection...');

    const _allDocuments: WorldBankDocument[] = []; // Reserved for future use
    const collectionByCategory: Record<string, number> = {};
    const errors: string[] = [];

    let sourcesProcessed = 0;
    let documentsFound = 0;
    let totalCollected = 0;

    for (const query of strategicQueries) {
      try {
        sourcesProcessed++;
        console.log(`Searching for: "${query}"`);

        // Search using World Bank API (simulated for now)
        const searchResults = await WorldBankKnowledgeBase.search(query);
        documentsFound += searchResults.length;

        // Process and save strategic documents
        for (const doc of searchResults) {
          try {
            // Enhanced strategic metadata
            const strategicDoc = {
              ...doc,
              rj_banga_initiative: determineInitiative(doc),
              strategic_priority_level: determinePriority(doc),
              implementation_timeline: determineTimeline(doc),
              stakeholder_impact: determineStakeholderImpact(doc),
              budget_allocation: estimateBudget(doc),
              success_metrics: defineSuccessMetrics(doc),
              regional_focus: determineRegionalFocus(doc),
              sector_alignment: determineSectorAlignment(doc),
              innovation_category: determineInnovationCategory(doc),
              change_management_phase: determineChangePhase(doc),
              verification_status: 'verified'
            };

            // Save to database
            const db = new WorldBankDB();
            await db.saveDocument(strategicDoc);

            totalCollected++;

            // Categorize
            const category = strategicDoc.rj_banga_initiative || 'General Strategy';
            collectionByCategory[category] = (collectionByCategory[category] || 0) + 1;

            console.log(`✅ Collected: ${doc.title.substring(0, 50)}...`);
          } catch (saveError) {
            console.error(`❌ Failed to save ${doc.title}:`, saveError);
          }
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (queryError) {
        const errorMsg = `Query "${query}" failed: ${queryError instanceof Error ? queryError.message : String(queryError)}`;
        errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    }

    return {
      success: true,
      results: {
        sourcesProcessed,
        documentsFound,
        totalCollected,
        collectionByCategory,
        errors
      },
      status: `Successfully collected ${totalCollected} strategic documents`
    };

  } catch (error) {
    console.error('Error in strategic collection:', error);
    throw error;
  }
}

async function handleExecuteStrategicCollection() {
  try {
    const result = await executeImmediateStrategicCollection();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error executing strategic collection:', error);
    return NextResponse.json(
      { error: `Strategic collection failed: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

async function handleRefreshData() {
  try {
    // Refresh the cached data
    const documents = await WorldBankKnowledgeBase.search('');
    const total = documents.length;

    return NextResponse.json({
      success: true,
      message: `Refreshed data cache. Found ${total} documents.`,
      totalDocuments: total,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error refreshing data:', error);
    return NextResponse.json(
      { error: `Refresh failed: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

async function handleAddTestMexicoDocument() {
  try {
    const db = new WorldBankDB();

    // Create a test document with Mexico content
    const testDoc = {
      id: 'test-mexico-document-001',
      title: 'Mexico Economic Development Strategy 2025',
      url: 'https://documents.worldbank.org/en/publication/documents-reports/documentdetail/999999',
      content: `Mexico faces significant opportunities for sustainable economic development. The World Bank supports Mexico's efforts to strengthen institutions, promote inclusive growth, and address climate change challenges. Key priorities include infrastructure development, education reform, and private sector mobilization. Mexico has made remarkable progress in recent years but continues to face challenges in reducing poverty and inequality. The government's reform agenda focuses on energy sector modernization, fiscal consolidation, and improving the business environment. World Bank financing supports critical infrastructure projects across transportation, water, and urban development sectors.`,
      summary: 'World Bank support for Mexico economic development and institutional strengthening.',
      date: '2024-11-01',
      type: 'policy-research-working-paper',
      fileType: 'html',
      fileSize: 2500,
      topics: ['economic development', 'infrastructure', 'education', 'mexico'],
      keywords: ['mexico', 'economic development', 'infrastructure', 'education', 'world bank'],
      citations: [],
      relatedDocuments: [],
      tags: {
        documentType: 'policy-research-working-paper',
        contentType: 'country-strategy',
        audience: ['policymakers', 'development-partners'],
        authors: ['World Bank'],
        departments: ['Research'],
        priority: 'high',
        status: 'published'
      },
      regions: ['Latin America and Caribbean'],
      sectors: ['Infrastructure', 'Education', 'Economic Policy'],
      initiatives: ['World Bank Development'],
      sourceReference: {
        originalUrl: 'https://documents.worldbank.org/en/publication/documents-reports/documentdetail/999999',
        scrapedFrom: 'https://documents.worldbank.org/en/publication/documents-reports/documentdetail/999999',
        discoveredAt: new Date().toISOString(),
        sourceType: 'test-document'
      },
      metadata: {
        language: 'en',
        wordCount: 150,
        readingTime: 1
      },
      scrapedAt: new Date().toISOString()
    };

    await db.saveDocument(testDoc);

    return NextResponse.json({
      success: true,
      message: 'Test Mexico document added successfully',
      documentId: testDoc.id
    });
  } catch (error) {
    console.error('Error adding test document:', error);
    return NextResponse.json(
      { error: `Failed to add test document: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

// Helper functions for strategic metadata
function determineInitiative(doc: WorldBankDocument): string {
  const title = doc.title.toLowerCase();
  const content = (doc.content || doc.summary).toLowerCase();

  if (title.includes('evolution') || content.includes('evolution agenda')) {
    return 'Evolution Agenda';
  }
  if (title.includes('private sector') || content.includes('private sector mobilization')) {
    return 'Private Sector Mobilization';
  }
  if (title.includes('human capital') || content.includes('human capital development')) {
    return 'Human Capital Development';
  }
  if (title.includes('digital') || content.includes('digital transformation')) {
    return 'Digital Transformation';
  }
  if (title.includes('climate') || content.includes('climate finance')) {
    return 'Climate Finance';
  }

  return 'General Strategy';
}

function determinePriority(doc: WorldBankDocument): string {
  const content = (doc.content || doc.summary).toLowerCase();

  if (content.includes('urgent') || content.includes('critical') || content.includes('immediate')) {
    return 'Critical';
  }
  if (content.includes('high priority') || content.includes('strategic priority')) {
    return 'High';
  }
  if (content.includes('medium priority') || content.includes('important')) {
    return 'Medium';
  }

  return 'Standard';
}

function determineTimeline(doc: WorldBankDocument): string {
  const content = (doc.content || doc.summary).toLowerCase();

  if (content.includes('2025') || content.includes('immediate')) {
    return '2025';
  }
  if (content.includes('2026') || content.includes('short-term')) {
    return '2026';
  }
  if (content.includes('2030') || content.includes('long-term')) {
    return '2025-2030';
  }

  return 'Ongoing';
}

function determineStakeholderImpact(doc: WorldBankDocument): string[] {
  const content = (doc.content || doc.summary).toLowerCase();
  const impacts: string[] = [];

  if (content.includes('government') || content.includes('policy')) {
    impacts.push('Government');
  }
  if (content.includes('private sector') || content.includes('business')) {
    impacts.push('Private Sector');
  }
  if (content.includes('civil society') || content.includes('ngo')) {
    impacts.push('Civil Society');
  }
  if (content.includes('development partners')) {
    impacts.push('Development Partners');
  }

  return impacts.length > 0 ? impacts : ['General Stakeholders'];
}

function estimateBudget(doc: WorldBankDocument): string {
  // Simple budget estimation based on content
  const content = (doc.content || doc.summary).toLowerCase();

  if (content.includes('billion') || content.includes('large scale')) {
    return '$1B+';
  }
  if (content.includes('million') || content.includes('significant investment')) {
    return '$100M-$1B';
  }
  if (content.includes('investment') || content.includes('funding')) {
    return '$10M-$100M';
  }

  return 'TBD';
}

function defineSuccessMetrics(doc: WorldBankDocument): string[] {
  // Define success metrics based on document type and content
  const metrics: string[] = ['Implementation completion rate'];

  const content = (doc.content || doc.summary).toLowerCase();

  if (content.includes('impact') || content.includes('results')) {
    metrics.push('Development impact achieved');
  }
  if (content.includes('stakeholder') || content.includes('engagement')) {
    metrics.push('Stakeholder satisfaction');
  }
  if (content.includes('financial') || content.includes('investment')) {
    metrics.push('Financial mobilization');
  }

  return metrics;
}

function determineRegionalFocus(doc: WorldBankDocument): string[] {
  const regions: string[] = [];

  // Check for specific regions mentioned
  const content = (doc.content || doc.summary).toLowerCase();

  if (content.includes('africa')) regions.push('Africa');
  if (content.includes('asia')) regions.push('Asia');
  if (content.includes('europe')) regions.push('Europe');
  if (content.includes('latin america') || content.includes('caribbean')) regions.push('Latin America & Caribbean');
  if (content.includes('middle east')) regions.push('Middle East & North Africa');

  return regions.length > 0 ? regions : ['Global'];
}

function determineSectorAlignment(doc: WorldBankDocument): string[] {
  const sectors: string[] = [];

  const content = (doc.content || doc.summary).toLowerCase();

  if (content.includes('education')) sectors.push('Education');
  if (content.includes('health')) sectors.push('Health');
  if (content.includes('infrastructure')) sectors.push('Infrastructure');
  if (content.includes('finance') || content.includes('financial')) sectors.push('Finance');
  if (content.includes('agriculture')) sectors.push('Agriculture');
  if (content.includes('energy')) sectors.push('Energy');
  if (content.includes('digital') || content.includes('technology')) sectors.push('Digital Development');

  return sectors.length > 0 ? sectors : ['Cross-cutting'];
}

function determineInnovationCategory(doc: WorldBankDocument): string {
  const content = (doc.content || doc.summary).toLowerCase();

  if (content.includes('digital') || content.includes('technology') || content.includes('innovation')) {
    return 'Digital Innovation';
  }
  if (content.includes('finance') || content.includes('fintech')) {
    return 'Financial Innovation';
  }
  if (content.includes('sustainable') || content.includes('green')) {
    return 'Sustainable Development';
  }
  if (content.includes('institutional') || content.includes('governance')) {
    return 'Institutional Innovation';
  }

  return 'Operational Excellence';
}

function determineChangePhase(doc: WorldBankDocument): string {
  const content = (doc.content || doc.summary).toLowerCase();

  if (content.includes('planning') || content.includes('design')) {
    return 'Planning & Design';
  }
  if (content.includes('implementation') || content.includes('execution')) {
    return 'Implementation';
  }
  if (content.includes('monitoring') || content.includes('evaluation')) {
    return 'Monitoring & Evaluation';
  }
  if (content.includes('scaling') || content.includes('expansion')) {
    return 'Scaling & Expansion';
  }

  return 'Strategic Planning';
}