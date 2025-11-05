/**
 * COMPREHENSIVE WORLD BANK API SCRAPER
 * Uses official World Bank APIs and RSS feeds for validated content
 */

import { WorldBankDB } from '../lib/worldbank-db.ts';

interface WBDocument {
  id: string;
  title: string;
  url: string;
  content: string;
  summary: string;
  date: string;
  type: string;
  source: string;
}

class ComprehensiveWorldBankScraper {
  private db: WorldBankDB;
  private collected = 0;

  // Official World Bank APIs and feeds
  private readonly APIs = {
    documents: 'https://search.worldbank.org/api/v2/wds',
    rssNews: 'https://feeds.feedburner.com/worldbank/news',
    rssDocuments: 'https://feeds.feedburner.com/worldbank/documents',
    rssBlogs: 'https://feeds.feedburner.com/worldbank/blogs',
    rssVideos: 'https://feeds.feedburner.com/worldbank/videos',
    openKnowledge: 'https://openknowledge.worldbank.org/api/v1/search'
  };

  constructor() {
    this.db = new WorldBankDB();
  }

  async scrapeAllSources(): Promise<void> {
    console.log('🌍 COMPREHENSIVE WORLD BANK SCRAPER');
    console.log('===================================');
    console.log('🎯 Sources: Official APIs + RSS Feeds');
    console.log('✅ 100% Validated World Bank Content');
    console.log('');

    try {
      // 1. Documents API
      console.log('📚 1. SCRAPING DOCUMENTS API...');
      await this.scrapeDocumentsAPI();
      console.log(`   ✅ Documents API: ${this.collected} collected so far\\n`);

      // 2. RSS Feeds
      console.log('📰 2. SCRAPING RSS FEEDS...');
      await this.scrapeRSSFeeds();
      console.log(`   ✅ RSS Feeds: ${this.collected} total collected so far\\n`);

      // 3. Open Knowledge Repository
      console.log('📖 3. SCRAPING OPEN KNOWLEDGE REPOSITORY...');
      await this.scrapeOpenKnowledge();
      console.log(`   ✅ Open Knowledge: ${this.collected} total collected\\n`);

      console.log('🎉 COMPREHENSIVE SCRAPING COMPLETE!');
      console.log('====================================');
      console.log(`✅ Total Validated Documents: ${this.collected}`);
      console.log('✅ All from Official World Bank Sources');

    } catch (error) {
      console.log('❌ SCRAPING ERROR:', error.message);
    }
  }

  private async scrapeDocumentsAPI(): Promise<void> {
    try {
      const params = new URLSearchParams({
        format: 'json',
        rows: '200', // Get more documents
        os: '0',
        lang_exact: 'English',
        apilang: 'en',
        fl: 'id,title,url,date,contenttype,abstract,display_title,docdt'
      });

      const response = await fetch(`${this.APIs.documents}?${params.toString()}`);
      const data = await response.json();

      if (data.documents) {
        const docs = Object.values(data.documents) as any[];

        for (const doc of docs.slice(0, 50)) { // Process first 50
          const wbDoc = {
            id: `wb-doc-${doc.id}`,
            title: doc.display_title || doc.title,
            url: doc.url,
            content: doc.abstract || `World Bank document: ${doc.display_title}`,
            summary: doc.abstract || doc.display_title,
            date: doc.date ? new Date(doc.date).toISOString().split('T')[0] : '2024-01-01',
            type: doc.contenttype || 'document',
            source: 'World Bank Documents API'
          };

          await this.saveValidatedDocument(wbDoc, 'documents-api');
        }
      }
    } catch (error) {
      console.log('   ❌ Documents API failed:', error.message);
    }
  }

  private async scrapeRSSFeeds(): Promise<void> {
    const feeds = [
      { name: 'News', url: this.APIs.rssNews },
      { name: 'Documents', url: this.APIs.rssDocuments },
      { name: 'Blogs', url: this.APIs.rssBlogs }
    ];

    for (const feed of feeds) {
      try {
        console.log(`   📡 Fetching ${feed.name} RSS...`);

        const response = await fetch(feed.url);
        const xmlText = await response.text();

        // Parse RSS (simple XML parsing)
        const items = this.parseRSSItems(xmlText);

        for (const item of items.slice(0, 20)) { // Process first 20 per feed
          const wbDoc = {
            id: `wb-rss-${feed.name.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            title: item.title,
            url: item.link,
            content: item.description || item.title,
            summary: item.description || item.title,
            date: item.pubDate ? new Date(item.pubDate).toISOString().split('T')[0] : '2024-01-01',
            type: feed.name.toLowerCase(),
            source: `World Bank RSS - ${feed.name}`
          };

          await this.saveValidatedDocument(wbDoc, 'rss');
        }

        console.log(`   ✅ ${feed.name}: ${items.length} items processed`);

      } catch (error) {
        console.log(`   ❌ ${feed.name} RSS failed:`, error.message);
      }
    }
  }

  private async scrapeOpenKnowledge(): Promise<void> {
    try {
      const params = new URLSearchParams({
        q: 'development',
        format: 'json',
        rows: '50',
        start: '0'
      });

      const response = await fetch(`${this.APIs.openKnowledge}?${params.toString()}`);
      const data = await response.json();

      if (data.documents) {
        for (const doc of data.documents.slice(0, 30)) {
          const wbDoc = {
            id: `wb-okr-${doc.id || Date.now()}`,
            title: doc.title || 'Open Knowledge Document',
            url: doc.url || doc.link,
            content: doc.abstract || doc.description || doc.title,
            summary: doc.abstract || doc.description || doc.title,
            date: doc.date_created ? new Date(doc.date_created).toISOString().split('T')[0] : '2024-01-01',
            type: 'research-paper',
            source: 'World Bank Open Knowledge Repository'
          };

          await this.saveValidatedDocument(wbDoc, 'open-knowledge');
        }
      }
    } catch (error) {
      console.log('   ❌ Open Knowledge API failed:', error.message);
    }
  }

  private parseRSSItems(xmlText: string): any[] {
    const items: any[] = [];
    const itemRegex = /<item>(.*?)<\/item>/gs;
    const titleRegex = /<title>(.*?)<\/title>/;
    const linkRegex = /<link>(.*?)<\/link>/;
    const descRegex = /<description>(.*?)<\/description>/;
    const dateRegex = /<pubDate>(.*?)<\/pubDate>/;

    let match;
    while ((match = itemRegex.exec(xmlText)) !== null) {
      const itemXml = match[1];

      const title = titleRegex.exec(itemXml)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/, '$1') || '';
      const link = linkRegex.exec(itemXml)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/, '$1') || '';
      const description = descRegex.exec(itemXml)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/, '$1') || '';
      const pubDate = dateRegex.exec(itemXml)?.[1] || '';

      if (title && link) {
        items.push({ title, link, description, pubDate });
      }
    }

    return items;
  }

  private async saveValidatedDocument(doc: WBDocument, sourceType: string): Promise<void> {
    // Validate
    if (!doc.title || !doc.url || !doc.url.includes('worldbank.org')) {
      return;
    }

    const dbDoc = {
      id: doc.id,
      title: doc.title,
      url: doc.url,
      content: doc.content,
      summary: doc.summary,
      date: doc.date,
      type: doc.type,
      file_type: 'html',
      file_size: doc.content.length,
      local_path: null,
      topics: this.extractTopics(doc.content),
      keywords: this.extractKeywords(doc.content),
      citations: [],
      related_documents: [],
      tags_document_type: doc.type,
      tags_content_type: doc.type,
      tags_audience: ['general'],
      tags_regions: this.extractRegions(doc.content),
      tags_sectors: this.extractSectors(doc.content),
      tags_initiatives: ['World Bank Development'],
      tags_authors: ['World Bank'],
      tags_departments: ['Research'],
      tags_priority: 'standard',
      tags_status: 'verified',
      source_original_url: doc.url,
      source_scraped_from: doc.url,
      source_parent_page: null,
      source_link_text: doc.title,
      source_discovered_at: new Date().toISOString(),
      source_type: sourceType,
      metadata_language: 'en',
      metadata_word_count: doc.content.split(' ').length,
      metadata_reading_time: Math.ceil(doc.content.split(' ').length / 200),
      metadata_last_modified: null,
      scraped_at: new Date().toISOString()
    };

    await this.db.saveDocument(dbDoc);
    this.collected++;

    console.log(`🎉 SAVED: ${this.collected} | ${doc.title.substring(0, 50)}...`);
  }

  private extractTopics(content: string): string[] {
    const topics: string[] = [];
    const topicKeywords = {
      'Climate Change': ['climate', 'carbon', 'emission', 'greenhouse'],
      'Poverty Reduction': ['poverty', 'inequality', 'social protection'],
      'Economic Growth': ['growth', 'economic', 'development', 'GDP'],
      'Health': ['health', 'healthcare', 'medical', 'disease'],
      'Education': ['education', 'school', 'learning', 'literacy'],
      'Infrastructure': ['infrastructure', 'transport', 'roads', 'energy'],
      'Agriculture': ['agriculture', 'food', 'farming', 'rural'],
      'Finance': ['finance', 'banking', 'investment', 'credit']
    };

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(kw => content.toLowerCase().includes(kw))) {
        topics.push(topic);
      }
    });

    return topics;
  }

  private extractKeywords(content: string): string[] {
    const keywords: string[] = [];
    const text = content.toLowerCase();

    const commonKeywords = [
      'development', 'policy', 'economic', 'growth', 'sustainable',
      'poverty', 'climate', 'health', 'education', 'infrastructure',
      'finance', 'trade', 'agriculture', 'energy', 'governance',
      'innovation', 'partnership', 'investment', 'reform'
    ];

    commonKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        keywords.push(keyword);
      }
    });

    return [...new Set(keywords)];
  }

  private extractRegions(content: string): string[] {
    const regions: string[] = [];
    const text = content.toLowerCase();

    const regionKeywords = {
      'Africa': ['africa', 'african'],
      'Asia': ['asia', 'asian'],
      'Europe': ['europe', 'european'],
      'Latin America': ['latin america', 'caribbean', 'brazil', 'mexico'],
      'Middle East': ['middle east', 'north africa', 'egypt', 'jordan'],
      'South Asia': ['south asia', 'india', 'pakistan', 'bangladesh'],
      'East Asia': ['east asia', 'china', 'vietnam', 'indonesia']
    };

    Object.entries(regionKeywords).forEach(([region, keywords]) => {
      if (keywords.some(kw => text.includes(kw))) {
        regions.push(region);
      }
    });

    return regions;
  }

  private extractSectors(content: string): string[] {
    const sectors: string[] = [];
    const text = content.toLowerCase();

    const sectorKeywords = {
      'Health': ['health', 'healthcare', 'medical'],
      'Education': ['education', 'school', 'learning'],
      'Infrastructure': ['infrastructure', 'transport', 'roads'],
      'Agriculture': ['agriculture', 'food', 'farming'],
      'Finance': ['finance', 'banking', 'investment'],
      'Energy': ['energy', 'power', 'electricity'],
      'Climate': ['climate', 'environment', 'carbon'],
      'Governance': ['governance', 'policy', 'reform']
    };

    Object.entries(sectorKeywords).forEach(([sector, keywords]) => {
      if (keywords.some(kw => text.includes(kw))) {
        sectors.push(sector);
      }
    });

    return sectors;
  }
}

// Execute comprehensive scraper
const scraper = new ComprehensiveWorldBankScraper();
scraper.scrapeAllSources().catch(console.error);


