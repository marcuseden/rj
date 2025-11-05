/**
 * REAL World Bank API Scraper
 * Fetches actual documents from World Bank APIs
 */

import { WorldBankDB } from '../lib/worldbank-db.ts';

interface WorldBankAPIDocument {
  id: string;
  title: string;
  url: string;
  date: string;
  contenttype: string;
  abstract?: string;
  display_title: string;
}

class RealWorldBankAPIScraper {
  private db: WorldBankDB;
  private collected = 0;

  constructor() {
    this.db = new WorldBankDB();
  }

  async scrapeFromAPI(): Promise<void> {
    console.log('🌐 REAL WORLD BANK API SCRAPER');
    console.log('==============================');
    console.log('🎯 Fetching from: World Bank Documents API');
    console.log('📊 Target: Real validated documents');
    console.log('');

    try {
      // World Bank Documents API
      const apiUrl = 'https://search.worldbank.org/api/v2/wds';

      console.log('🔍 Fetching from World Bank API...');

      const params = new URLSearchParams({
        format: 'json',
        rows: '100', // Get 100 documents per request
        os: '0',
        lang_exact: 'English',
        apilang: 'en',
        fl: 'id,title,url,date,contenttype,abstract,display_title'
      });

      const response = await fetch(`${apiUrl}?${params.toString()}`);
      const data = await response.json();

      console.log(`📋 API Response: Found ${data.total || 0} total documents`);
      console.log(`📦 Received ${data.documents ? Object.keys(data.documents).length : 0} documents in this batch`);
      console.log('');

      if (data.documents) {
        const documents = Object.values(data.documents) as WorldBankAPIDocument[];

        for (const doc of documents) {
          try {
            await this.processAndSaveDocument(doc);
          } catch (error) {
            console.log(`❌ Failed to process: ${doc.title} - ${error.message}`);
          }
        }
      }

      console.log(`\\n🎉 API SCRAPING COMPLETE!`);
      console.log(`📊 Documents Collected: ${this.collected}`);
      console.log('✅ All documents from verified World Bank API');

    } catch (error) {
      console.log('❌ API SCRAPING FAILED:', error.message);
      console.log('Error details:', error);
    }
  }

  private async processAndSaveDocument(apiDoc: WorldBankAPIDocument): Promise<void> {
    console.log(`🔍 PROCESSING: ${apiDoc.display_title?.substring(0, 60)}...`);

    // Validate the document
    if (!this.isValidDocument(apiDoc)) {
      console.log(`❌ REJECTED: Invalid document`);
      return;
    }

    // Convert to our format
    const dbDoc = {
      id: `wb-api-${apiDoc.id}`,
      title: apiDoc.display_title || apiDoc.title,
      url: apiDoc.url,
      content: apiDoc.abstract || `World Bank document: ${apiDoc.display_title}`,
      summary: apiDoc.abstract || apiDoc.display_title,
      date: apiDoc.date ? new Date(apiDoc.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      type: apiDoc.contenttype?.toLowerCase().replace(/\s+/g, '-') || 'document',
      file_type: 'html',
      file_size: (apiDoc.abstract || '').length,
      local_path: null,
      topics: [],
      keywords: this.extractKeywords(apiDoc),
      citations: [],
      related_documents: [],
      tags_document_type: apiDoc.contenttype || 'document',
      tags_content_type: apiDoc.contenttype || 'document',
      tags_audience: ['general'],
      tags_regions: [],
      tags_sectors: [],
      tags_initiatives: ['World Bank'],
      tags_authors: ['World Bank'],
      tags_departments: [],
      tags_priority: 'standard',
      tags_status: 'verified',
      source_original_url: apiDoc.url,
      source_scraped_from: apiDoc.url,
      source_parent_page: null,
      source_link_text: apiDoc.display_title || apiDoc.title,
      source_discovered_at: new Date().toISOString(),
      source_type: 'worldbank-api',
      metadata_language: 'en',
      metadata_word_count: (apiDoc.abstract || '').split(' ').length,
      metadata_reading_time: Math.ceil((apiDoc.abstract || '').split(' ').length / 200),
      metadata_last_modified: null,
      scraped_at: new Date().toISOString()
    };

    await this.db.saveDocument(dbDoc);
    this.collected++;

    console.log(`✅ SAVED TO DATABASE: Document ${this.collected}`);
    console.log(`   📄 Title: ${dbDoc.title}`);
    console.log(`   🌐 URL: ${dbDoc.url}`);
    console.log(`   📅 Date: ${dbDoc.date}`);
    console.log('');
  }

  private isValidDocument(doc: WorldBankAPIDocument): boolean {
    // Must have valid URL
    if (!doc.url || !doc.url.includes('worldbank.org')) {
      return false;
    }

    // Must have title
    if (!doc.display_title && !doc.title) {
      return false;
    }

    // Must have some content
    if (!doc.abstract && (!doc.display_title || doc.display_title.length < 10)) {
      return false;
    }

    // Must be recent (2024-2025)
    if (doc.date) {
      const docDate = new Date(doc.date);
      const minDate = new Date('2024-01-01');
      if (docDate < minDate) {
        return false;
      }
    }

    return true;
  }

  private extractKeywords(doc: WorldBankAPIDocument): string[] {
    const text = `${doc.display_title} ${doc.abstract || ''}`.toLowerCase();
    const keywords: string[] = [];

    // Extract common development keywords
    const commonKeywords = [
      'development', 'policy', 'economic', 'growth', 'poverty', 'climate',
      'health', 'education', 'infrastructure', 'finance', 'trade', 'agriculture',
      'energy', 'urban', 'rural', 'sustainable', 'innovation', 'governance'
    ];

    commonKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        keywords.push(keyword);
      }
    });

    return [...new Set(keywords)];
  }
}

// Execute the real API scraper
const scraper = new RealWorldBankAPIScraper();
scraper.scrapeFromAPI().catch(console.error);


