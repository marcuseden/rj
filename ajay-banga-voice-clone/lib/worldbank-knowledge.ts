/**
 * World Bank Knowledge Base
 * 
 * Utility for accessing and querying scraped World Bank strategy documents
 * Use this to enhance AI coach agent responses with World Bank context
 */

export interface WorldBankDocument {
  id: string;
  title: string;
  url: string;
  summary: string;
  content?: string; // Full content for comprehensive search
  date: string;
  type: string;
  topics: string[];
  keywords: string[];
  initiatives: string[];
  regions: string[];
  sectors: string[];
  tags: {
    documentType: string;
    contentType: string;
    audience: string[];
    authors: string[];
    priority: string;
    status: string;
  };
  sourceReference: {
    originalUrl: string;
    scrapedFrom: string;
    discoveredAt: string;
    sourceType: string;
  };
  metadata: {
    language: string;
    wordCount: number;
    readingTime: number;
    publicationYear: number;
  };
  scrapedAt?: string;
}

export class WorldBankKnowledgeBase {
  private static documents: WorldBankDocument[] = [];
  private static initialized = false;

  /**
   * Initialize the knowledge base (lazy loading)
   */
  private static async init() {
    if (this.initialized) return;

    try {
      // Try to load from database first
      const { WorldBankDB } = await import('./worldbank-db');
      const db = new WorldBankDB();

      const dbDocuments = await db.searchByTags({});
      if (dbDocuments && dbDocuments.length > 0) {
        // Convert database format to WorldBankDocument format
        this.documents = dbDocuments.map(doc => ({
          id: doc.id,
          title: doc.title,
          url: doc.url,
          summary: doc.summary || '',
          content: doc.content || '', // Include full content for search
          date: doc.date,
          type: doc.type,
          topics: doc.topics || [],
          keywords: doc.keywords || [],
          initiatives: doc.tags_initiatives || [],
          regions: doc.tags_regions || [],
          sectors: doc.tags_sectors || [],
          tags: {
            documentType: doc.tags_document_type,
            contentType: doc.tags_content_type,
            audience: doc.tags_audience || [],
            authors: doc.tags_authors || [],
            priority: doc.tags_priority,
            status: doc.tags_status
          },
          sourceReference: {
            originalUrl: doc.source_original_url,
            scrapedFrom: doc.source_scraped_from,
            discoveredAt: doc.source_discovered_at,
            sourceType: doc.source_type
          },
          metadata: {
            language: doc.metadata_language,
            wordCount: doc.metadata_word_count,
            readingTime: doc.metadata_reading_time,
            publicationYear: new Date(doc.date).getFullYear()
          },
          scrapedAt: doc.scraped_at
        }));
        console.log(`📚 Loaded ${this.documents.length} World Bank documents from database`);
      } else {
        // Fallback to JSON file if database is empty
        console.log('📚 Database empty, trying to load from JSON file...');
        const documentsModule = await import('@/data/worldbank-strategy/documents.json');
        this.documents = documentsModule.default || [];
        console.log(`📚 Loaded ${this.documents.length} World Bank documents from JSON file`);
      }
      this.initialized = true;
    } catch (error) {
      console.warn('⚠️ World Bank knowledge base not found. Run: npm run scrape:worldbank');
      this.documents = [];
      this.initialized = true;
    }
  }

  /**
   * Search for relevant documents by topic
   */
  static async searchByTopic(topic: string): Promise<WorldBankDocument[]> {
    await this.init();
    return this.documents.filter(d => 
      d.topics.some(t => t.toLowerCase().includes(topic.toLowerCase()))
    );
  }

  /**
   * Search by keywords
   */
  static async searchByKeywords(keywords: string[]): Promise<WorldBankDocument[]> {
    await this.init();
    return this.documents.filter(d =>
      keywords.some(kw =>
        d.keywords.includes(kw.toLowerCase()) ||
        d.summary.toLowerCase().includes(kw.toLowerCase()) ||
        d.title.toLowerCase().includes(kw.toLowerCase())
      )
    );
  }

  /**
   * Full text search - comprehensive search across all text fields
   */
  static async search(query: string): Promise<WorldBankDocument[]> {
    await this.init();
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(' ').filter(w => w.length > 2);

    return this.documents.filter(d => {
      // Title search
      if (d.title.toLowerCase().includes(queryLower)) return true;

      // Summary search
      if (typeof d.summary === 'string' && d.summary.toLowerCase().includes(queryLower)) return true;

      // Keywords search
      if (d.keywords.some(kw => kw.toLowerCase().includes(queryLower))) return true;

      // Sectors search
      if (d.sectors.some(s => s.toLowerCase().includes(queryLower))) return true;

      // Regions search
      if (d.regions.some(r => r.toLowerCase().includes(queryLower))) return true;

      // Topics search
      if (d.topics.some(t => t.toLowerCase().includes(queryLower))) return true;

      // Content search (full text search on content field)
      if (d.content && typeof d.content === 'string') {
        if (d.content.toLowerCase().includes(queryLower)) return true;
      }

      // Fuzzy region matching (e.g., "mexico" should match "Latin America and Caribbean")
      const regionMappings: Record<string, string[]> = {
        'mexico': ['latin america', 'caribbean', 'latin america and caribbean'],
        'brazil': ['latin america', 'caribbean', 'latin america and caribbean'],
        'china': ['east asia', 'pacific', 'east asia and pacific'],
        'india': ['south asia'],
        'nigeria': ['africa', 'western and central africa'],
        'kenya': ['africa', 'eastern and southern africa'],
        'indonesia': ['east asia', 'pacific', 'east asia and pacific'],
        'turkey': ['europe', 'central asia', 'europe and central asia'],
        'poland': ['europe', 'central asia', 'europe and central asia'],
        'vietnam': ['east asia', 'pacific', 'east asia and pacific'],
        'egypt': ['middle east', 'north africa', 'middle east and north africa'],
        'morocco': ['middle east', 'north africa', 'middle east and north africa']
      };

      for (const [country, regions] of Object.entries(regionMappings)) {
        if (queryLower.includes(country) &&
            d.regions.some(r => regions.some(mappedRegion =>
              r.toLowerCase().includes(mappedRegion)))) {
          return true;
        }
      }

      // Multi-word search - check if all query words appear somewhere
      if (queryWords.length > 1) {
        const searchableText = [
          d.title,
          d.summary || '',
          ...d.keywords,
          ...d.sectors,
          ...d.regions,
          ...d.topics
        ].join(' ').toLowerCase();

        if (queryWords.every(word => searchableText.includes(word))) {
          return true;
        }
      }

      return false;
    });
  }

  /**
   * Get recent strategic documents
   */
  static async getRecentStrategy(limit: number = 5): Promise<WorldBankDocument[]> {
    await this.init();
    return this.documents
      .filter(d => d.type === 'strategy')
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, limit);
  }

  /**
   * Get RJ Banga's vision and leadership documents
   */
  static async getBangaVision(): Promise<WorldBankDocument[]> {
    await this.init();
    return this.documents.filter(d =>
      d.keywords.includes('banga') ||
      d.topics.includes('Leadership Vision') ||
      d.type === 'speech'
    );
  }

  /**
   * Get documents by type
   */
  static async getByType(type: WorldBankDocument['type']): Promise<WorldBankDocument[]> {
    await this.init();
    return this.documents.filter(d => d.type === type);
  }

  /**
   * Get all documents
   */
  static async getAllDocuments(): Promise<WorldBankDocument[]> {
    await this.init();
    return this.documents;
  }

  /**
   * Get contextual knowledge for a conversation query
   * This is the main method to use with the AI agent
   */
  static async getContextForQuery(query: string, maxDocs: number = 3): Promise<string> {
    await this.init();

    if (this.documents.length === 0) {
      return ''; // No knowledge base available
    }

    // Use comprehensive full-text search
    let relevantDocs = await this.search(query);

    // If no results with full search, try keyword-based search
    if (relevantDocs.length === 0) {
      const keywords = query.split(' ').filter(w => w.length > 3);
      relevantDocs = await this.searchByKeywords(keywords);
    }

    // If still no results, try topic-based search for common themes
    if (relevantDocs.length === 0) {
      const queryLower = query.toLowerCase();
      if (queryLower.includes('climate') || queryLower.includes('environment')) {
        relevantDocs = await this.searchByTopic('Climate');
      } else if (queryLower.includes('banga') || queryLower.includes('president') || queryLower.includes('leadership')) {
        relevantDocs = await this.getBangaVision();
      } else if (queryLower.includes('strategy') || queryLower.includes('roadmap') || queryLower.includes('vision')) {
        relevantDocs = await this.getRecentStrategy(maxDocs);
      } else if (queryLower.includes('change') || queryLower.includes('transformation') || queryLower.includes('reform')) {
        relevantDocs = await this.searchByTopic('Organizational Change');
      } else if (queryLower.includes('poverty') || queryLower.includes('development')) {
        relevantDocs = await this.searchByTopic('Poverty');
      }
    }

    // Format as context for AI
    if (relevantDocs.length === 0) {
      return '';
    }

    return relevantDocs
      .slice(0, maxDocs)
      .map(d => `**${d.title}** (${d.date})\n${d.summary}\nSource: ${d.url}`)
      .join('\n\n---\n\n');
  }

  /**
   * Get summary statistics
   */
  static async getStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    byTopic: Record<string, number>;
    dateRange: { earliest: string; latest: string };
  }> {
    await this.init();
    
    const byType: Record<string, number> = {};
    const byTopic: Record<string, number> = {};
    
    this.documents.forEach(d => {
      byType[d.type] = (byType[d.type] || 0) + 1;
      d.topics.forEach(t => {
        byTopic[t] = (byTopic[t] || 0) + 1;
      });
    });
    
    const dates = this.documents.map(d => d.date).sort();
    
    return {
      total: this.documents.length,
      byType,
      byTopic,
      dateRange: {
        earliest: dates[0] || 'N/A',
        latest: dates[dates.length - 1] || 'N/A'
      }
    };
  }

  /**
   * Check if knowledge base is available
   */
  static async isAvailable(): Promise<boolean> {
    await this.init();
    return this.documents.length > 0;
  }
}

