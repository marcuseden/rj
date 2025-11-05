/**
 * World Bank Strategy Document Scraper
 * 
 * Scrapes public World Bank documents related to:
 * - RJ Banga's strategic vision
 * - Bank strategy and initiatives
 * - Change processes and projects
 * - Strategic documents and articles
 * 
 * Data is indexed and stored for AI agent context enhancement
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as cheerio from 'cheerio';

interface SourceReference {
  originalUrl: string;
  scrapedFrom: string;
  parentPage?: string;
  linkText?: string;
  discoveredAt: string;
  sourceType: 'direct' | 'linked' | 'search_result' | 'sitemap';
}

interface DocumentTags {
  documentType: 'speech' | 'article' | 'strategy' | 'report' | 'initiative' | 'press-release' | 'blog' | 'whitepaper' | 'policy-brief';
  contentType: 'text' | 'pdf' | 'video-transcript' | 'presentation';
  audience: ('public' | 'internal' | 'stakeholders' | 'government' | 'academic')[];
  regions: string[]; // Geographic focus
  sectors: string[]; // Economic sectors
  initiatives: string[]; // Specific initiative/project names
  authors: string[]; // Document authors
  departments: string[]; // World Bank departments
  priority: 'high' | 'medium' | 'low';
  status: 'current' | 'archived' | 'draft' | 'final';
}

interface Document {
  id: string;
  title: string;
  url: string;
  content: string;
  summary: string;
  date: string;
  type: 'strategy' | 'article' | 'report' | 'initiative' | 'speech' | 'pdf';
  topics: string[];
  keywords: string[];
  scrapedAt: string;
  fileType: 'html' | 'pdf' | 'doc' | 'docx' | 'txt';
  fileSize?: number;
  localPath?: string; // Path to downloaded file
  sourceReference: SourceReference;
  relatedDocuments?: string[]; // IDs of related documents
  citations?: string[]; // References within the document
  tags: DocumentTags; // Rich metadata tagging
  metadata: {
    language: string;
    wordCount: number;
    readingTime: number; // minutes
    lastModified?: string;
  };
}

interface ScraperConfig {
  outputDir: string;
  maxDocuments?: number;
  includePDFs?: boolean;
  downloadFiles?: boolean;
  trackReferences?: boolean;
  maxDepth?: number;
  minDate?: string; // Only scrape documents from this date forward (YYYY-MM-DD)
  supabaseBucket?: string; // Supabase storage bucket name
  useSupabaseStorage?: boolean; // Upload files to Supabase storage
}

class WorldBankStrategyScraper {
  private config: ScraperConfig;
  private documents: Document[] = [];
  private processedUrls: Set<string> = new Set();
  private supabase: any;

  // Key search terms related to RJ Banga and strategic initiatives
  private searchTerms = [
    'Ajay Banga',
    'World Bank President',
    'World Bank strategy',
    'World Bank reform',
    'World Bank initiatives',
    'climate change World Bank',
    'poverty reduction strategy',
    'sustainable development goals',
    'World Bank transformation',
    'institutional change World Bank',
    'World Bank evolution roadmap',
    'World Bank 2030 agenda'
  ];

  // World Bank public domains to scrape
  private sources = [
    'https://www.worldbank.org',
    'https://blogs.worldbank.org',
    'https://documents.worldbank.org',
    'https://www.worldbank.org/en/news',
    'https://www.worldbank.org/en/about/leadership',
  ];

  constructor(config: ScraperConfig) {
    this.config = {
      maxDocuments: 100,
      includePDFs: true,
      downloadFiles: true,
      trackReferences: true,
      maxDepth: 2,
      minDate: '2024-01-01', // Only documents from 2024 onwards
      ...config
    };
  }

  /**
   * Check if document date is within acceptable range
   */
  private isDateValid(date: string): boolean {
    if (!this.config.minDate) return true;
    return date >= this.config.minDate;
  }

  /**
   * Generate comprehensive tags for a document
   */
  private generateTags(content: string, title: string, url: string, type: Document['type']): DocumentTags {
    const text = `${title} ${content}`.toLowerCase();
    
    // Detect document type
    let documentType: DocumentTags['documentType'] = 'article';
    if (type === 'speech' || text.includes('remarks by') || text.includes('statement by')) {
      documentType = 'speech';
    } else if (type === 'strategy' || text.includes('strategic') || text.includes('roadmap')) {
      documentType = 'strategy';
    } else if (type === 'report' || text.includes('annual report') || text.includes('progress report')) {
      documentType = 'report';
    } else if (type === 'initiative' || text.includes('initiative') || text.includes('program')) {
      documentType = 'initiative';
    } else if (text.includes('press release')) {
      documentType = 'press-release';
    } else if (url.includes('blog')) {
      documentType = 'blog';
    } else if (text.includes('white paper') || text.includes('whitepaper')) {
      documentType = 'whitepaper';
    } else if (text.includes('policy brief')) {
      documentType = 'policy-brief';
    }
    
    // Detect content type
    const contentType: DocumentTags['contentType'] = 
      url.endsWith('.pdf') ? 'pdf' :
      text.includes('transcript') ? 'video-transcript' :
      text.includes('presentation') || text.includes('slides') ? 'presentation' :
      'text';
    
    // Detect audience
    const audience: DocumentTags['audience'] = [];
    if (text.includes('public') || documentType === 'press-release') audience.push('public');
    if (text.includes('government') || text.includes('ministry')) audience.push('government');
    if (text.includes('stakeholder')) audience.push('stakeholders');
    if (text.includes('research') || text.includes('academic')) audience.push('academic');
    if (audience.length === 0) audience.push('public'); // Default
    
    // Detect regions
    const regions = this.extractRegions(text);
    
    // Detect sectors
    const sectors = this.extractSectors(text);
    
    // Extract initiative/project names
    const initiatives = this.extractInitiatives(text);
    
    // Extract authors
    const authors = this.extractAuthors(content);
    
    // Detect departments
    const departments = this.extractDepartments(text);
    
    // Determine priority
    const priority = this.determinePriority(text, title, type);
    
    // Determine status
    const status = this.determineStatus(text, url);
    
    return {
      documentType,
      contentType,
      audience,
      regions,
      sectors,
      initiatives,
      authors,
      departments,
      priority,
      status
    };
  }

  /**
   * Extract geographic regions mentioned
   */
  private extractRegions(text: string): string[] {
    const regions: string[] = [];
    const regionMap: Record<string, string[]> = {
      'Africa': ['africa', 'african', 'sub-saharan'],
      'Asia': ['asia', 'asian', 'east asia', 'south asia'],
      'Europe': ['europe', 'european', 'central europe'],
      'Latin America': ['latin america', 'caribbean', 'south america'],
      'Middle East': ['middle east', 'mena'],
      'Global': ['global', 'worldwide', 'international']
    };
    
    Object.entries(regionMap).forEach(([region, keywords]) => {
      if (keywords.some(kw => text.includes(kw))) {
        regions.push(region);
      }
    });
    
    return regions;
  }

  /**
   * Extract economic sectors mentioned
   */
  private extractSectors(text: string): string[] {
    const sectors: string[] = [];
    const sectorKeywords: Record<string, string[]> = {
      'Energy': ['energy', 'power', 'electricity', 'renewable'],
      'Health': ['health', 'healthcare', 'medical', 'pandemic'],
      'Education': ['education', 'school', 'university', 'learning'],
      'Agriculture': ['agriculture', 'farming', 'food security'],
      'Infrastructure': ['infrastructure', 'transport', 'roads', 'bridges'],
      'Finance': ['finance', 'banking', 'investment', 'capital markets'],
      'Technology': ['technology', 'digital', 'innovation', 'tech'],
      'Climate': ['climate', 'environment', 'carbon', 'green'],
      'Water': ['water', 'sanitation', 'hygiene'],
      'Governance': ['governance', 'public sector', 'institutions']
    };
    
    Object.entries(sectorKeywords).forEach(([sector, keywords]) => {
      if (keywords.some(kw => text.includes(kw))) {
        sectors.push(sector);
      }
    });
    
    return sectors;
  }

  /**
   * Extract specific initiative/project names
   */
  private extractInitiatives(text: string): string[] {
    const initiatives: string[] = [];
    
    // Common World Bank initiatives
    const knownInitiatives = [
      'Climate Action Plan',
      'Human Capital Project',
      'IDA Replenishment',
      'Digital Development',
      'Fragility Forum',
      'Global Infrastructure Facility',
      'Pandemic Fund',
      'Carbon Pricing',
      'Debt Transparency',
      'Women Entrepreneurs Finance Initiative',
      'Evolution Roadmap',
      'Better World Bank'
    ];
    
    knownInitiatives.forEach(initiative => {
      if (text.includes(initiative.toLowerCase())) {
        initiatives.push(initiative);
      }
    });
    
    // Extract project codes (e.g., P123456)
    const projectCodes = text.match(/P\d{6}/g) || [];
    initiatives.push(...projectCodes);
    
    return [...new Set(initiatives)];
  }

  /**
   * Extract author names
   */
  private extractAuthors(content: string): string[] {
    const authors: string[] = [];
    
    // Look for "By [Name]" patterns
    const byPattern = /By\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/g;
    const byMatches = content.matchAll(byPattern);
    for (const match of byMatches) {
      authors.push(match[1]);
    }
    
    // Always check for Ajay Banga
    if (content.toLowerCase().includes('ajay banga') || content.toLowerCase().includes('president banga')) {
      authors.push('Ajay Banga');
    }
    
    return [...new Set(authors)];
  }

  /**
   * Extract World Bank departments
   */
  private extractDepartments(text: string): string[] {
    const departments: string[] = [];
    
    const deptKeywords: Record<string, string[]> = {
      'IFC': ['ifc', 'international finance corporation'],
      'MIGA': ['miga', 'multilateral investment guarantee'],
      'IBRD': ['ibrd', 'international bank for reconstruction'],
      'IDA': ['ida', 'international development association'],
      'Climate': ['climate change group', 'ccg'],
      'DEC': ['development economics', 'dec'],
      'Operations': ['operations policy', 'opcs']
    };
    
    Object.entries(deptKeywords).forEach(([dept, keywords]) => {
      if (keywords.some(kw => text.includes(kw))) {
        departments.push(dept);
      }
    });
    
    return departments;
  }

  /**
   * Determine document priority
   */
  private determinePriority(text: string, title: string, type: Document['type']): DocumentTags['priority'] {
    // High priority: speeches, strategies, presidential statements
    if (type === 'speech' || type === 'strategy') return 'high';
    if (text.includes('banga') || text.includes('president')) return 'high';
    if (title.toLowerCase().includes('strategy') || title.toLowerCase().includes('roadmap')) return 'high';
    
    // Medium priority: reports, initiatives
    if (type === 'report' || type === 'initiative') return 'medium';
    
    // Low priority: general articles
    return 'low';
  }

  /**
   * Determine document status
   */
  private determineStatus(text: string, url: string): DocumentTags['status'] {
    if (text.includes('draft')) return 'draft';
    if (text.includes('archive') || url.includes('archive')) return 'archived';
    if (text.includes('final version') || text.includes('published')) return 'final';
    return 'current';
  }

  /**
   * Calculate metadata
   */
  private calculateMetadata(content: string): Document['metadata'] {
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200); // Average reading speed
    
    return {
      language: 'en', // Default to English
      wordCount,
      readingTime
    };
  }

  /**
   * Download a file (PDF, DOC, etc.) to local storage
   */
  private async downloadFile(url: string, filename: string): Promise<string | null> {
    if (!this.config.downloadFiles) return null;
    
    try {
      console.log(`⬇️  Downloading: ${filename}`);
      
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      
      // Save to downloads folder
      const downloadsDir = path.join(this.config.outputDir, 'downloads');
      await fs.mkdir(downloadsDir, { recursive: true });
      
      const filepath = path.join(downloadsDir, filename);
      await fs.writeFile(filepath, Buffer.from(buffer));
      
      console.log(`✅ Downloaded: ${filename} (${(buffer.byteLength / 1024).toFixed(2)} KB)`);
      
      return filepath;
    } catch (error) {
      console.error(`❌ Failed to download ${url}:`, error);
      return null;
    }
  }

  /**
   * Extract text from PDF (placeholder - would need pdf-parse library)
   */
  private async extractPdfText(filepath: string): Promise<string> {
    // TODO: Implement PDF text extraction
    // Would need: npm install pdf-parse
    // For now, return placeholder
    return `[PDF content would be extracted from ${path.basename(filepath)}]`;
  }

  /**
   * Detect file type from URL
   */
  private getFileType(url: string): Document['fileType'] {
    const urlLower = url.toLowerCase();
    if (urlLower.endsWith('.pdf')) return 'pdf';
    if (urlLower.endsWith('.doc') || urlLower.endsWith('.docx')) return 'doc';
    if (urlLower.endsWith('.txt')) return 'txt';
    return 'html';
  }

  /**
   * Extract citations and references from content
   */
  private extractCitations(content: string): string[] {
    const citations: string[] = [];
    
    // Look for URLs in content
    const urlRegex = /https?:\/\/[^\s)]+/g;
    const urls = content.match(urlRegex) || [];
    
    // Look for World Bank document references
    const docRefRegex = /(?:Document|Report|Paper|Study)\s+(?:No\.|Number|#)?\s*[\w-]+/gi;
    const docRefs = content.match(docRefRegex) || [];
    
    citations.push(...urls, ...docRefs);
    
    return [...new Set(citations)]; // Remove duplicates
  }

  /**
   * Track source reference for a document
   */
  private createSourceReference(
    url: string,
    scrapedFrom: string,
    options: {
      parentPage?: string;
      linkText?: string;
      sourceType?: SourceReference['sourceType'];
    } = {}
  ): SourceReference {
    return {
      originalUrl: url,
      scrapedFrom,
      parentPage: options.parentPage,
      linkText: options.linkText,
      discoveredAt: new Date().toISOString(),
      sourceType: options.sourceType || 'direct'
    };
  }

  /**
   * Main scraping function
   */
  async scrape(): Promise<void> {
    console.log('🌍 Starting World Bank Strategy Scraper...');
    console.log(`📁 Output directory: ${this.config.outputDir}`);
    
    await this.ensureOutputDirectory();
    
    // Scrape different document types
    await this.scrapePresidentialSpeeches();
    await this.scrapeStrategyDocuments();
    await this.scrapeBlogArticles();
    await this.scrapeNewsArticles();
    await this.scrapeInitiatives();
    
    // Save results
    await this.saveDocuments();
    await this.generateIndex();
    await this.generateReferenceMap();
    await this.generateSummary();
    
    console.log(`✅ Scraping complete! Found ${this.documents.length} documents (2024+)`);
  }

  /**
   * Scrape presidential speeches and statements
   */
  private async scrapePresidentialSpeeches(): Promise<void> {
    console.log('🎤 Scraping presidential speeches...');
    
    const urls = [
      'https://www.worldbank.org/en/about/people/a/ajay-banga',
      'https://www.worldbank.org/en/news/speech',
      'https://www.worldbank.org/en/news/statement',
    ];

    for (const url of urls) {
      try {
        const response = await fetch(url);
        const html = await response.text();
        const $ = cheerio.load(html);
        
        // Extract speech links and content
        $('a').each((_, element) => {
          const href = $(element).attr('href');
          const linkText = $(element).text().trim();
          
          if (href && this.isRelevantDocument(linkText, href)) {
            const fullUrl = this.resolveUrl(url, href);
            this.queueDocument(fullUrl, 'speech', {
              scrapedFrom: url,
              parentPage: url,
              linkText,
              sourceType: 'linked'
            });
          }
        });
      } catch (error) {
        console.error(`Error scraping ${url}:`, error);
      }
    }
  }

  /**
   * Scrape official strategy documents
   */
  private async scrapeStrategyDocuments(): Promise<void> {
    console.log('📄 Scraping strategy documents...');
    
    const urls = [
      'https://www.worldbank.org/en/about/what-we-do',
      'https://www.worldbank.org/en/about/leadership/brief/world-bank-group-strategy',
      'https://documents.worldbank.org/en/publication/documents-reports',
    ];

    for (const url of urls) {
      try {
        const response = await fetch(url);
        const html = await response.text();
        const $ = cheerio.load(html);
        
        // Look for strategy-related links
        $('a').each((_, element) => {
          const href = $(element).attr('href');
          const text = $(element).text().trim();
          
          if (href && this.isStrategyDocument(text, href)) {
            const fullUrl = this.resolveUrl(url, href);
            this.queueDocument(fullUrl, 'strategy');
          }
        });
      } catch (error) {
        console.error(`Error scraping ${url}:`, error);
      }
    }
  }

  /**
   * Scrape blog articles
   */
  private async scrapeBlogArticles(): Promise<void> {
    console.log('📝 Scraping blog articles...');
    
    // Search World Bank blogs for relevant articles
    const searchUrl = 'https://blogs.worldbank.org/?s=Ajay+Banga+strategy';
    
    try {
      const response = await fetch(searchUrl);
      const html = await response.text();
      const $ = cheerio.load(html);
      
      $('article a, .post a').each((_, element) => {
        const href = $(element).attr('href');
        const text = $(element).text().trim();
        
        if (href && this.isRelevantDocument(text, href)) {
          this.queueDocument(href, 'article');
        }
      });
    } catch (error) {
      console.error('Error scraping blog articles:', error);
    }
  }

  /**
   * Scrape news articles
   */
  private async scrapeNewsArticles(): Promise<void> {
    console.log('📰 Scraping news articles...');
    
    const newsUrl = 'https://www.worldbank.org/en/news/all';
    
    try {
      const response = await fetch(newsUrl);
      const html = await response.text();
      const $ = cheerio.load(html);
      
      $('.article, .news-item').each((_, element) => {
        const $article = $(element);
        const href = $article.find('a').attr('href');
        const title = $article.find('h2, h3, .title').text().trim();
        
        if (href && this.isRelevantDocument(title, href)) {
          const fullUrl = this.resolveUrl(newsUrl, href);
          this.queueDocument(fullUrl, 'article');
        }
      });
    } catch (error) {
      console.error('Error scraping news articles:', error);
    }
  }

  /**
   * Scrape initiatives and projects
   */
  private async scrapeInitiatives(): Promise<void> {
    console.log('🚀 Scraping initiatives and projects...');
    
    const urls = [
      'https://www.worldbank.org/en/projects-operations',
      'https://www.worldbank.org/en/about/what-we-do#1',
    ];

    for (const url of urls) {
      try {
        const response = await fetch(url);
        const html = await response.text();
        const $ = cheerio.load(html);
        
        $('a').each((_, element) => {
          const href = $(element).attr('href');
          const text = $(element).text().trim();
          
          if (href && this.isInitiative(text, href)) {
            const fullUrl = this.resolveUrl(url, href);
            this.queueDocument(fullUrl, 'initiative');
          }
        });
      } catch (error) {
        console.error(`Error scraping ${url}:`, error);
      }
    }
  }

  /**
   * Queue a document for processing
   */
  private queueDocument(
    url: string, 
    type: Document['type'], 
    sourceRef: Partial<SourceReference> = {}
  ): void {
    if (this.processedUrls.has(url)) return;
    if (this.documents.length >= (this.config.maxDocuments || 100)) return;
    
    this.processedUrls.add(url);
    
    // Process in background
    this.processDocument(url, type, sourceRef).catch(err => {
      console.error(`Error processing ${url}:`, err);
    });
  }

  /**
   * Process a single document
   */
  private async processDocument(
    url: string, 
    type: Document['type'],
    sourceRef: Partial<SourceReference> = {}
  ): Promise<void> {
    try {
      console.log(`📥 Processing: ${url}`);
      
      // Detect file type
      const fileType = this.getFileType(url);
      
      let content = '';
      let title = '';
      let fileSize: number | undefined;
      let localPath: string | undefined;
      
      // Handle different file types
      if (fileType === 'pdf') {
        // Download PDF
        const filename = `${this.generateId(url)}.pdf`;
        localPath = await this.downloadFile(url, filename);
        
        if (localPath) {
          const stats = await fs.stat(localPath);
          fileSize = stats.size;
          
          // Extract text from PDF (placeholder)
          content = await this.extractPdfText(localPath);
          title = path.basename(url, '.pdf').replace(/-|_/g, ' ');
        }
      } else {
        // HTML content
        const response = await fetch(url);
        const html = await response.text();
        const $ = cheerio.load(html);
        
        title = $('h1').first().text().trim() || 
                $('title').text().trim() || 
                'Untitled Document';
        
        content = this.extractContent($);
        
        // Download HTML file
        if (this.config.downloadFiles) {
          const filename = `${this.generateId(url)}.html`;
          const downloadsDir = path.join(this.config.outputDir, 'downloads');
          await fs.mkdir(downloadsDir, { recursive: true });
          localPath = path.join(downloadsDir, filename);
          await fs.writeFile(localPath, html);
          const stats = await fs.stat(localPath);
          fileSize = stats.size;
        }
      }
      
      if (content.length < 100) {
        console.log(`⚠️ Skipping ${url} - insufficient content`);
        return;
      }
      
      // Extract metadata  
      const date = (fileType === 'html' && typeof content === 'object') 
        ? this.extractDateFromString(content.toString())
        : this.extractDateFromString(content) || new Date().toISOString().split('T')[0];
      
      // Apply date filter - only 2024 and later
      if (!this.isDateValid(date)) {
        console.log(`⏭️  Skipping ${url} - date ${date} before ${this.config.minDate}`);
        return;
      }
      
      const keywords = this.extractKeywords(content, title);
      const topics = this.categorizeDocument(content, title);
      const summary = this.generateSummary(content);
      const tags = this.generateTags(content, title, url, type);
      const metadata = this.calculateMetadata(content);
      const citations = this.extractCitations(content);
      
      // Create source reference
      const sourceReference = this.createSourceReference(url, sourceRef.scrapedFrom || 'direct', {
        parentPage: sourceRef.parentPage,
        linkText: sourceRef.linkText,
        sourceType: sourceRef.sourceType || 'direct'
      });
      
      const document: Document = {
        id: this.generateId(url),
        title,
        url,
        content,
        summary,
        date,
        type,
        topics,
        keywords,
        scrapedAt: new Date().toISOString(),
        fileType,
        fileSize,
        localPath,
        sourceReference,
        citations,
        tags,
        metadata
      };
      
      this.documents.push(document);
      console.log(`✅ Processed: ${title.substring(0, 60)}... [${type}] [${tags.documentType}]`);
      
    } catch (error) {
      console.error(`Error processing document ${url}:`, error);
    }
  }

  /**
   * Extract date from string content
   */
  private extractDateFromString(content: string): string | null {
    const datePatterns = [
      /\b(20\d{2})[-\/](0[1-9]|1[0-2])[-\/](0[1-9]|[12]\d|3[01])\b/, // YYYY-MM-DD
      /\b(0[1-9]|1[0-2])[-\/](0[1-9]|[12]\d|3[01])[-\/](20\d{2})\b/, // MM-DD-YYYY
      /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+20\d{2}\b/i
    ];
    
    for (const pattern of datePatterns) {
      const match = content.match(pattern);
      if (match) {
        // Normalize to YYYY-MM-DD
        const dateStr = match[0];
        try {
          const parsed = new Date(dateStr);
          if (!isNaN(parsed.getTime())) {
            return parsed.toISOString().split('T')[0];
          }
        } catch {
          // Continue to next pattern
        }
      }
    }
    return null;
  }

  /**
   * Extract main content from page
   */
  private extractContent($: cheerio.CheerioAPI): string {
    // Remove scripts, styles, navigation, etc.
    $('script, style, nav, header, footer, .sidebar, .menu').remove();
    
    // Try to find main content area
    const contentSelectors = [
      'article',
      'main',
      '.content',
      '.article-body',
      '.post-content',
      '#content',
      '.main-content'
    ];
    
    for (const selector of contentSelectors) {
      const content = $(selector).text().trim();
      if (content.length > 200) {
        return this.cleanText(content);
      }
    }
    
    // Fallback to body
    return this.cleanText($('body').text());
  }

  /**
   * Clean and normalize text
   */
  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();
  }

  /**
   * Extract date from document
   */
  private extractDate($: cheerio.CheerioAPI): string | null {
    const dateSelectors = [
      'time[datetime]',
      '.date',
      '.published-date',
      'meta[property="article:published_time"]',
      'meta[name="date"]'
    ];
    
    for (const selector of dateSelectors) {
      const element = $(selector).first();
      const date = element.attr('datetime') || 
                  element.attr('content') || 
                  element.text();
      
      if (date) {
        return date.split('T')[0]; // Extract date part
      }
    }
    
    return null;
  }

  /**
   * Extract keywords from content
   */
  private extractKeywords(content: string, title: string): string[] {
    const text = `${title} ${content}`.toLowerCase();
    const keywords = new Set<string>();
    
    const keyTerms = [
      'strategy', 'reform', 'transformation', 'initiative', 'climate',
      'poverty', 'development', 'sustainable', 'innovation', 'digital',
      'partnership', 'investment', 'governance', 'accountability',
      'banga', 'president', 'roadmap', 'vision', 'mission', 'goals',
      'change', 'evolution', 'modernization', 'efficiency', 'impact'
    ];
    
    keyTerms.forEach(term => {
      if (text.includes(term)) {
        keywords.add(term);
      }
    });
    
    return Array.from(keywords);
  }

  /**
   * Categorize document into topics
   */
  private categorizeDocument(content: string, title: string): string[] {
    const text = `${title} ${content}`.toLowerCase();
    const topics: string[] = [];
    
    const topicMap = {
      'Climate & Environment': ['climate', 'environment', 'carbon', 'green', 'renewable'],
      'Poverty & Inequality': ['poverty', 'inequality', 'inclusion', 'equity'],
      'Digital Transformation': ['digital', 'technology', 'innovation', 'data'],
      'Governance & Reform': ['governance', 'reform', 'transparency', 'accountability'],
      'Partnerships': ['partnership', 'collaboration', 'multilateral'],
      'Financial Strategy': ['finance', 'investment', 'capital', 'lending'],
      'Organizational Change': ['change', 'transformation', 'restructure', 'evolution'],
      'Leadership Vision': ['banga', 'president', 'vision', 'direction', 'strategy']
    };
    
    Object.entries(topicMap).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => text.includes(keyword))) {
        topics.push(topic);
      }
    });
    
    return topics;
  }

  /**
   * Generate summary of content
   */
  private generateSummary(content: string): string {
    // Simple extraction of first few sentences
    const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
    return sentences.slice(0, 3).join(' ').substring(0, 500);
  }

  /**
   * Check if document is relevant
   */
  private isRelevantDocument(text: string, url: string): boolean {
    const combined = `${text} ${url}`.toLowerCase();
    
    const relevantTerms = [
      'banga', 'strategy', 'president', 'reform', 'initiative',
      'vision', 'roadmap', 'transformation', 'change', 'evolution'
    ];
    
    return relevantTerms.some(term => combined.includes(term));
  }

  /**
   * Check if document is a strategy document
   */
  private isStrategyDocument(text: string, url: string): boolean {
    const combined = `${text} ${url}`.toLowerCase();
    
    return combined.includes('strategy') || 
           combined.includes('strategic') ||
           combined.includes('roadmap') ||
           combined.includes('vision');
  }

  /**
   * Check if document is about an initiative
   */
  private isInitiative(text: string, url: string): boolean {
    const combined = `${text} ${url}`.toLowerCase();
    
    return combined.includes('initiative') ||
           combined.includes('program') ||
           combined.includes('project');
  }

  /**
   * Resolve relative URLs
   */
  private resolveUrl(base: string, relative: string): string {
    try {
      return new URL(relative, base).href;
    } catch {
      return relative;
    }
  }

  /**
   * Generate unique ID for document
   */
  private generateId(url: string): string {
    return Buffer.from(url).toString('base64').substring(0, 32);
  }

  /**
   * Ensure output directory exists
   */
  private async ensureOutputDirectory(): Promise<void> {
    await fs.mkdir(this.config.outputDir, { recursive: true });
    await fs.mkdir(path.join(this.config.outputDir, 'documents'), { recursive: true });
  }

  /**
   * Save all documents to disk
   */
  private async saveDocuments(): Promise<void> {
    console.log('💾 Saving documents...');
    
    // Save individual documents
    for (const doc of this.documents) {
      const filename = `${doc.id}.json`;
      const filepath = path.join(this.config.outputDir, 'documents', filename);
      await fs.writeFile(filepath, JSON.stringify(doc, null, 2));
    }
    
    // Save complete collection
    const collectionPath = path.join(this.config.outputDir, 'documents.json');
    await fs.writeFile(collectionPath, JSON.stringify(this.documents, null, 2));
    
    console.log(`✅ Saved ${this.documents.length} documents`);
  }

  /**
   * Generate searchable index
   */
  private async generateIndex(): Promise<void> {
    console.log('📊 Generating index...');
    
    const index = {
      metadata: {
        totalDocuments: this.documents.length,
        lastUpdated: new Date().toISOString(),
        searchTerms: this.searchTerms,
        sources: this.sources,
      },
      byType: this.groupBy(this.documents, 'type'),
      byTopic: this.groupByTopics(this.documents),
      byDate: this.groupBy(this.documents, 'date'),
      allKeywords: this.getAllKeywords(),
    };
    
    const indexPath = path.join(this.config.outputDir, 'index.json');
    await fs.writeFile(indexPath, JSON.stringify(index, null, 2));
    
    console.log('✅ Index generated');
  }

  /**
   * Generate source reference map
   */
  private async generateReferenceMap(): Promise<void> {
    console.log('🗺️  Generating reference map...');
    
    const referenceMap = {
      metadata: {
        totalDocuments: this.documents.length,
        generated: new Date().toISOString()
      },
      sourceBreakdown: this.documents.reduce((acc, doc) => {
        const source = doc.sourceReference.scrapedFrom;
        if (!acc[source]) acc[source] = [];
        acc[source].push({
          id: doc.id,
          title: doc.title,
          url: doc.url,
          linkText: doc.sourceReference.linkText,
          discoveredAt: doc.sourceReference.discoveredAt
        });
        return acc;
      }, {} as Record<string, any[]>),
      documentReferences: this.documents.map(doc => ({
        id: doc.id,
        title: doc.title,
        url: doc.url,
        sourceReference: doc.sourceReference,
        citations: doc.citations,
        relatedDocuments: doc.relatedDocuments
      }))
    };
    
    const mapPath = path.join(this.config.outputDir, 'reference-map.json');
    await fs.writeFile(mapPath, JSON.stringify(referenceMap, null, 2));
    
    console.log('✅ Reference map generated');
  }

  /**
   * Generate summary report
   */
  private async generateSummary(): Promise<void> {
    console.log('📋 Generating summary report...');
    
    const report = `# World Bank Strategy Document Collection

## Overview
- **Total Documents**: ${this.documents.length}
- **Date Range**: ${this.config.minDate} to present
- **Last Updated**: ${new Date().toISOString()}
- **Scraped At**: ${new Date().toLocaleString()}
- **Downloads**: ${this.documents.filter(d => d.localPath).length} files saved locally

## Document Types
${this.generateTypeBreakdown()}

## Document Tags
${this.generateTagBreakdown()}

## Key Topics
${this.generateTopicBreakdown()}

## Sectors
${this.generateSectorBreakdown()}

## Initiatives & Projects
${this.generateInitiativeBreakdown()}

## Regions
${this.generateRegionBreakdown()}

## Top Keywords
${this.getTopKeywords(20).join(', ')}

## Authors
${this.generateAuthorBreakdown()}

## Documents by Date
${this.generateDateBreakdown()}

## Source References
${this.generateSourceBreakdown()}

## Usage

This collection can be used to enhance the AI coach agent's understanding of:
- World Bank strategic direction under RJ Banga
- Institutional change processes
- Key initiatives and projects
- Strategic priorities and goals

### Loading Documents

\`\`\`typescript
import documents from './documents.json';
import index from './index.json';

// Search by topic
const climateDocuments = documents.filter(d => 
  d.topics.includes('Climate & Environment')
);

// Search by keyword
const bangaDocuments = documents.filter(d => 
  d.keywords.includes('banga')
);
\`\`\`

### Integration with AI Agent

Use this knowledge base to:
1. Provide context about World Bank strategy
2. Answer questions about strategic initiatives
3. Explain change processes
4. Reference specific documents and sources

## Next Steps

1. Review documents in \`documents/\` folder
2. Use \`index.json\` for quick lookups
3. Integrate into AI agent context
4. Update regularly to stay current

---

Generated by World Bank Strategy Scraper
`;
    
    const reportPath = path.join(this.config.outputDir, 'README.md');
    await fs.writeFile(reportPath, report);
    
    console.log('✅ Summary report generated');
  }

  /**
   * Helper: Group documents by field
   */
  private groupBy(docs: Document[], field: keyof Document): Record<string, number> {
    return docs.reduce((acc, doc) => {
      const value = String(doc[field]);
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Helper: Group documents by topics
   */
  private groupByTopics(docs: Document[]): Record<string, number> {
    const topicCounts: Record<string, number> = {};
    
    docs.forEach(doc => {
      doc.topics.forEach(topic => {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      });
    });
    
    return topicCounts;
  }

  /**
   * Helper: Get all unique keywords
   */
  private getAllKeywords(): string[] {
    const keywords = new Set<string>();
    this.documents.forEach(doc => {
      doc.keywords.forEach(kw => keywords.add(kw));
    });
    return Array.from(keywords).sort();
  }

  /**
   * Helper: Get top keywords
   */
  private getTopKeywords(limit: number): string[] {
    const keywordCounts: Record<string, number> = {};
    
    this.documents.forEach(doc => {
      doc.keywords.forEach(kw => {
        keywordCounts[kw] = (keywordCounts[kw] || 0) + 1;
      });
    });
    
    return Object.entries(keywordCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([kw]) => kw);
  }

  /**
   * Generate type breakdown for report
   */
  private generateTypeBreakdown(): string {
    const types = this.groupBy(this.documents, 'type');
    return Object.entries(types)
      .map(([type, count]) => `- **${type}**: ${count}`)
      .join('\n');
  }

  /**
   * Generate topic breakdown for report
   */
  private generateTopicBreakdown(): string {
    const topics = this.groupByTopics(this.documents);
    return Object.entries(topics)
      .sort(([, a], [, b]) => b - a)
      .map(([topic, count]) => `- **${topic}**: ${count} documents`)
      .join('\n');
  }

  /**
   * Generate date breakdown for report
   */
  private generateDateBreakdown(): string {
    const dates = this.groupBy(this.documents, 'date');
    return Object.entries(dates)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 10)
      .map(([date, count]) => `- ${date}: ${count} documents`)
      .join('\n');
  }

  /**
   * Generate tag breakdown
   */
  private generateTagBreakdown(): string {
    const tagTypes: Record<string, number> = {};
    this.documents.forEach(d => {
      tagTypes[d.tags.documentType] = (tagTypes[d.tags.documentType] || 0) + 1;
    });
    
    return Object.entries(tagTypes)
      .sort(([, a], [, b]) => b - a)
      .map(([tag, count]) => `- **${tag}**: ${count}`)
      .join('\n');
  }

  /**
   * Generate sector breakdown
   */
  private generateSectorBreakdown(): string {
    const sectors: Record<string, number> = {};
    this.documents.forEach(d => {
      d.tags.sectors.forEach(s => {
        sectors[s] = (sectors[s] || 0) + 1;
      });
    });
    
    return Object.entries(sectors)
      .sort(([, a], [, b]) => b - a)
      .map(([sector, count]) => `- **${sector}**: ${count} documents`)
      .join('\n');
  }

  /**
   * Generate initiative breakdown
   */
  private generateInitiativeBreakdown(): string {
    const initiatives: Record<string, number> = {};
    this.documents.forEach(d => {
      d.tags.initiatives.forEach(i => {
        initiatives[i] = (initiatives[i] || 0) + 1;
      });
    });
    
    return Object.entries(initiatives)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([initiative, count]) => `- **${initiative}**: ${count} documents`)
      .join('\n') || 'No specific initiatives tagged';
  }

  /**
   * Generate region breakdown
   */
  private generateRegionBreakdown(): string {
    const regions: Record<string, number> = {};
    this.documents.forEach(d => {
      d.tags.regions.forEach(r => {
        regions[r] = (regions[r] || 0) + 1;
      });
    });
    
    return Object.entries(regions)
      .sort(([, a], [, b]) => b - a)
      .map(([region, count]) => `- **${region}**: ${count} documents`)
      .join('\n');
  }

  /**
   * Generate author breakdown
   */
  private generateAuthorBreakdown(): string {
    const authors: Record<string, number> = {};
    this.documents.forEach(d => {
      d.tags.authors.forEach(a => {
        authors[a] = (authors[a] || 0) + 1;
      });
    });
    
    return Object.entries(authors)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([author, count]) => `- **${author}**: ${count} documents`)
      .join('\n') || 'No authors identified';
  }

  /**
   * Generate source breakdown
   */
  private generateSourceBreakdown(): string {
    const sources: Record<string, number> = {};
    this.documents.forEach(d => {
      const source = d.sourceReference.scrapedFrom;
      sources[source] = (sources[source] || 0) + 1;
    });
    
    return Object.entries(sources)
      .sort(([, a], [, b]) => b - a)
      .map(([source, count]) => `- ${source}: ${count} documents`)
      .join('\n');
  }
}

/**
 * Main execution
 */
async function main() {
  const scraper = new WorldBankStrategyScraper({
    outputDir: path.join(process.cwd(), 'data', 'worldbank-strategy'),
    maxDocuments: 100,
    includePDFs: true
  });
  
  await scraper.scrape();
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { WorldBankStrategyScraper, type Document };

