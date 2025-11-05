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
  content: string;
  summary: string;
  date: string;
  type: 'strategy' | 'article' | 'report' | 'initiative' | 'speech';
  topics: string[];
  keywords: string[];
  scrapedAt: string;
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
      // Load documents from file
      const documentsModule = await import('@/data/worldbank-strategy/documents.json');
      this.documents = documentsModule.default || [];
      this.initialized = true;
      console.log(`📚 Loaded ${this.documents.length} World Bank documents`);
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
        d.content.toLowerCase().includes(kw.toLowerCase())
      )
    );
  }

  /**
   * Full text search
   */
  static async search(query: string): Promise<WorldBankDocument[]> {
    await this.init();
    const queryLower = query.toLowerCase();
    
    return this.documents.filter(d =>
      d.title.toLowerCase().includes(queryLower) ||
      d.content.toLowerCase().includes(queryLower) ||
      d.summary.toLowerCase().includes(queryLower)
    );
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
   * Get contextual knowledge for a conversation query
   * This is the main method to use with the AI agent
   */
  static async getContextForQuery(query: string, maxDocs: number = 3): Promise<string> {
    await this.init();
    
    if (this.documents.length === 0) {
      return ''; // No knowledge base available
    }
    
    const queryLower = query.toLowerCase();
    let relevantDocs: WorldBankDocument[] = [];
    
    // Topic-based routing
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
    } else {
      // General search
      const keywords = query.split(' ').filter(w => w.length > 3);
      relevantDocs = await this.searchByKeywords(keywords);
    }
    
    // If no results, try full text search
    if (relevantDocs.length === 0) {
      relevantDocs = await this.search(query);
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

