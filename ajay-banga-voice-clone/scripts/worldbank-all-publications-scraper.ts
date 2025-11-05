/**
 * World Bank All Publications Scraper (2024+)
 * 
 * Scrapes ALL public World Bank reports and publications from 2024
 * Analyzes alignment with RJ Banga's strategic vision
 * Tags, indexes, and scores each publication for compliance
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as cheerio from 'cheerio';

interface StrategicAlignment {
  score: number; // 0-100% alignment with RJ Banga's vision
  aligned: string[]; // What aligns
  misaligned: string[]; // What doesn't align
  gaps: string[]; // Missing elements
  references: {
    documentTitle: string;
    documentUrl: string;
    relevantQuote: string;
    alignmentReason: string;
  }[];
}

interface Publication {
  id: string;
  title: string;
  url: string;
  content: string;
  summary: string;
  date: string;
  publicationType: 'annual-report' | 'sector-report' | 'country-report' | 'policy-paper' | 'evaluation' | 'data-report' | 'operational-policy' | 'research-paper';
  
  // Complete tagging
  tags: {
    documentType: string;
    sectors: string[];
    regions: string[];
    countries: string[];
    themes: string[];
    initiatives: string[];
    authors: string[];
    departments: string[];
    lendingInstruments: string[];
    projectCodes: string[];
  };
  
  // Strategic alignment analysis
  strategicAlignment: StrategicAlignment;
  
  // Metadata
  metadata: {
    language: string;
    wordCount: number;
    readingTime: number;
    publicationYear: number;
    reportNumber?: string;
    isbn?: string;
  };
  
  // Source tracking
  sourceReference: {
    originalUrl: string;
    scrapedFrom: string;
    parentPage?: string;
    discoveredAt: string;
    sourceType: string;
  };
  
  // File info
  fileType: 'html' | 'pdf' | 'doc' | 'docx';
  fileSize?: number;
  localPath?: string;
  storagePath?: string;
  
  scrapedAt: string;
}

interface ScraperConfig {
  outputDir: string;
  maxPublications?: number;
  minDate: string;
  useSupabaseStorage?: boolean;
  supabaseBucket?: string;
  analyzeAlignment?: boolean;
}

class WorldBankPublicationsScraper {
  private config: ScraperConfig;
  private publications: Publication[] = [];
  private processedUrls: Set<string> = new Set();
  private bangaDocuments: any[] = []; // RJ Banga's reference documents

  // World Bank publication sources
  private sources = [
    'https://documents.worldbank.org/en/publication/documents-reports',
    'https://www.worldbank.org/en/research/publication',
    'https://openknowledge.worldbank.org',
    'https://www.worldbank.org/en/publication/annual-reports',
    'https://www.worldbank.org/en/publication/wdr',
    'https://www.worldbank.org/en/publication/global-economic-prospects',
  ];

  // Strategic priorities from RJ Banga (for alignment scoring)
  private strategicPriorities = {
    climate: ['climate', 'carbon', 'renewable', 'green', 'sustainability', 'emissions'],
    poverty: ['poverty', 'inequality', 'inclusion', 'vulnerable'],
    partnership: ['partnership', 'collaboration', 'private sector', 'multilateral'],
    reform: ['reform', 'transformation', 'evolution', 'modernize', 'efficiency'],
    impact: ['impact', 'results', 'outcomes', 'measurable', 'concrete'],
    digital: ['digital', 'technology', 'innovation', 'data-driven'],
    jobs: ['employment', 'jobs', 'youth', 'economic opportunity'],
    fragility: ['fragility', 'conflict', 'crisis', 'resilience']
  };

  constructor(config: ScraperConfig) {
    this.config = {
      maxPublications: 100,
      analyzeAlignment: true,
      useSupabaseStorage: true,
      supabaseBucket: 'RJ-banga-Public-Informatin',
      ...config
    };
  }

  /**
   * Main scraping function
   */
  async scrape(): Promise<void> {
    console.log('🌍 Starting World Bank All Publications Scraper...');
    console.log(`📁 Output: ${this.config.outputDir}`);
    console.log(`📅 Date filter: ${this.config.minDate} onwards\n`);
    
    await this.ensureOutputDirectory();
    
    // Load RJ Banga's documents for alignment comparison
    if (this.config.analyzeAlignment) {
      await this.loadBangaDocuments();
    }
    
    // Scrape all publication types
    await this.scrapeAnnualReports();
    await this.scrapeSectorReports();
    await this.scrapeCountryReports();
    await this.scrapePolicyPapers();
    await this.scrapeResearchPublications();
    await this.scrapeEvaluationReports();
    
    // Save and index
    await this.savePublications();
    await this.generateComplianceIndex();
    await this.generateAlignmentReport();
    
    console.log(`\n✅ Scraping complete! Found ${this.publications.length} publications`);
  }

  /**
   * Load RJ Banga's documents for alignment analysis
   */
  private async loadBangaDocuments(): Promise<void> {
    console.log('📚 Loading RJ Banga reference documents...');
    
    try {
      const bangaPath = path.join(process.cwd(), 'data', 'worldbank-strategy', 'documents.json');
      const bangaJson = await fs.readFile(bangaPath, 'utf-8');
      this.bangaDocuments = JSON.parse(bangaJson);
      console.log(`✅ Loaded ${this.bangaDocuments.length} RJ Banga reference documents\n`);
    } catch (error) {
      console.warn('⚠️  Could not load RJ Banga documents. Alignment scoring will be limited.\n');
      this.bangaDocuments = [];
    }
  }

  /**
   * Analyze publication alignment with RJ Banga's strategy
   */
  private analyzeStrategicAlignment(publication: Partial<Publication>): StrategicAlignment {
    const text = `${publication.title} ${publication.content}`.toLowerCase();
    let score = 0;
    const aligned: string[] = [];
    const misaligned: string[] = [];
    const gaps: string[] = [];
    const references: StrategicAlignment['references'] = [];

    // Score against each strategic priority
    Object.entries(this.strategicPriorities).forEach(([priority, keywords]) => {
      const matches = keywords.filter(kw => text.includes(kw));
      
      if (matches.length > 0) {
        const priorityScore = Math.min(20, matches.length * 5);
        score += priorityScore;
        aligned.push(`${priority}: Mentions ${matches.join(', ')}`);
        
        // Find reference from RJ's documents
        const ref = this.findRelevantBangaDocument(priority, matches);
        if (ref) {
          references.push(ref);
        }
      } else {
        gaps.push(`${priority}: No mention of ${keywords.slice(0, 2).join(' or ')}`);
      }
    });

    // Check for misalignments
    if (text.includes('traditional') && !text.includes('innovation')) {
      misaligned.push('Focuses on traditional approaches without innovation emphasis');
      score -= 10;
    }

    if (text.includes('lending') && !text.includes('impact')) {
      misaligned.push('Mentions lending without clear impact metrics');
      score -= 5;
    }

    if (!text.includes('partnership') && !text.includes('private sector')) {
      gaps.push('Missing partnership and private sector engagement');
    }

    // Normalize score to 0-100
    score = Math.max(0, Math.min(100, score));

    return {
      score: Math.round(score),
      aligned,
      misaligned,
      gaps,
      references
    };
  }

  /**
   * Find relevant RJ Banga document for reference
   */
  private findRelevantBangaDocument(
    priority: string,
    keywords: string[]
  ): StrategicAlignment['references'][0] | null {
    if (this.bangaDocuments.length === 0) return null;

    // Find document that mentions this priority
    const relevant = this.bangaDocuments.find(doc => {
      const docText = `${doc.title} ${doc.summary}`.toLowerCase();
      return keywords.some(kw => docText.includes(kw));
    });

    if (!relevant) return null;

    // Extract relevant quote
    const quote = relevant.summary.substring(0, 200) + '...';

    return {
      documentTitle: relevant.title,
      documentUrl: relevant.sourceReference?.originalUrl || relevant.url,
      relevantQuote: quote,
      alignmentReason: `RJ Banga emphasizes ${priority} as a core strategic priority`
    };
  }

  /**
   * Scrape annual reports
   */
  private async scrapeAnnualReports(): Promise<void> {
    console.log('📊 Scraping annual reports...');
    
    const urls = [
      'https://www.worldbank.org/en/publication/annual-reports',
      'https://www.worldbank.org/en/about/annual-report',
    ];

    for (const url of urls) {
      await this.scrapePage(url, 'annual-report');
    }
  }

  /**
   * Scrape sector reports
   */
  private async scrapeSectorReports(): Promise<void> {
    console.log('🏭 Scraping sector reports...');
    
    const sectors = ['climate', 'health', 'education', 'agriculture', 'energy', 'finance'];
    
    for (const sector of sectors) {
      const searchUrl = `https://documents.worldbank.org/en/publication/documents-reports?q=${sector}&year=2024`;
      await this.scrapePage(searchUrl, 'sector-report');
    }
  }

  /**
   * Scrape country/regional reports
   */
  private async scrapeCountryReports(): Promise<void> {
    console.log('🌍 Scraping country/regional reports...');
    
    const regions = ['africa', 'asia', 'latin-america', 'europe', 'middle-east'];
    
    for (const region of regions) {
      const searchUrl = `https://documents.worldbank.org/en/publication/documents-reports?q=${region}&year=2024`;
      await this.scrapePage(searchUrl, 'country-report');
    }
  }

  /**
   * Scrape policy papers
   */
  private async scrapePolicyPapers(): Promise<void> {
    console.log('📄 Scraping policy papers...');
    
    const url = 'https://www.worldbank.org/en/research/publication';
    await this.scrapePage(url, 'policy-paper');
  }

  /**
   * Scrape research publications
   */
  private async scrapeResearchPublications(): Promise<void> {
    console.log('🔬 Scraping research publications...');
    
    const url = 'https://openknowledge.worldbank.org';
    await this.scrapePage(url, 'research-paper');
  }

  /**
   * Scrape evaluation reports
   */
  private async scrapeEvaluationReports(): Promise<void> {
    console.log('📋 Scraping evaluation reports...');
    
    const url = 'https://ieg.worldbankgroup.org/evaluations';
    await this.scrapePage(url, 'evaluation');
  }

  /**
   * Generic page scraper
   */
  private async scrapePage(url: string, type: Publication['publicationType']): Promise<void> {
    try {
      const response = await fetch(url);
      const html = await response.text();
      const $ = cheerio.load(html);

      // Extract publication links
      $('a').each((_, element) => {
        const href = $(element).attr('href');
        const linkText = $(element).text().trim();

        if (href && this.isPublication(linkText, href)) {
          const fullUrl = this.resolveUrl(url, href);
          this.queuePublication(fullUrl, type, {
            scrapedFrom: url,
            linkText,
            sourceType: 'linked'
          });
        }
      });
    } catch (error) {
      console.error(`Error scraping ${url}:`, error);
    }
  }

  /**
   * Check if link is a publication
   */
  private isPublication(text: string, url: string): boolean {
    const combined = `${text} ${url}`.toLowerCase();
    
    const pubIndicators = [
      'report', 'publication', 'paper', 'study', 'evaluation',
      'assessment', 'review', 'outlook', 'prospects', 'briefing',
      '.pdf', 'document', 'curated/en'
    ];

    return pubIndicators.some(indicator => combined.includes(indicator)) &&
           !combined.includes('2023') && // Exclude pre-2024
           !combined.includes('2022') &&
           !combined.includes('2021');
  }

  /**
   * Queue publication for processing
   */
  private queuePublication(
    url: string,
    type: Publication['publicationType'],
    sourceRef: Partial<Publication['sourceReference']>
  ): void {
    if (this.processedUrls.has(url)) return;
    if (this.publications.length >= (this.config.maxPublications || 100)) return;

    this.processedUrls.add(url);

    this.processPublication(url, type, sourceRef).catch(err => {
      console.error(`Error processing ${url}:`, err);
    });
  }

  /**
   * Process individual publication
   */
  private async processPublication(
    url: string,
    type: Publication['publicationType'],
    sourceRef: Partial<Publication['sourceReference']>
  ): Promise<void> {
    try {
      console.log(`📥 Processing: ${url}`);

      const response = await fetch(url);
      const html = await response.text();
      const $ = cheerio.load(html);

      const title = $('h1').first().text().trim() || 
                   $('title').text().trim() || 
                   'Untitled Publication';

      const content = this.extractContent($);

      if (content.length < 200) {
        console.log(`⏭️  Skipping - insufficient content`);
        return;
      }

      // Extract date
      const date = this.extractDate(content) || new Date().toISOString().split('T')[0];

      // Filter by date
      if (date < this.config.minDate) {
        console.log(`⏭️  Skipping - date ${date} before ${this.config.minDate}`);
        return;
      }

      // Extract comprehensive tags
      const tags = this.generateTags(content, title, url);

      // Calculate metadata
      const wordCount = content.split(/\s+/).length;
      const metadata = {
        language: 'en',
        wordCount,
        readingTime: Math.ceil(wordCount / 200),
        publicationYear: parseInt(date.substring(0, 4)),
        reportNumber: this.extractReportNumber(content),
        isbn: this.extractISBN(content)
      };

      // Analyze strategic alignment
      const strategicAlignment = this.config.analyzeAlignment
        ? this.analyzeStrategicAlignment({ title, content, tags })
        : this.getDefaultAlignment();

      const publication: Publication = {
        id: this.generateId(url),
        title,
        url,
        content,
        summary: this.generateSummary(content),
        date,
        publicationType: type,
        tags,
        strategicAlignment,
        metadata,
        sourceReference: {
          originalUrl: url,
          scrapedFrom: sourceRef.scrapedFrom || 'direct',
          parentPage: sourceRef.parentPage,
          discoveredAt: new Date().toISOString(),
          sourceType: sourceRef.sourceType || 'direct'
        },
        fileType: url.endsWith('.pdf') ? 'pdf' : 'html',
        scrapedAt: new Date().toISOString()
      };

      this.publications.push(publication);
      
      console.log(`✅ ${title.substring(0, 50)}... [${type}] [Alignment: ${strategicAlignment.score}%]`);

    } catch (error) {
      console.error(`Error processing ${url}:`, error);
    }
  }

  /**
   * Generate comprehensive tags
   */
  private generateTags(content: string, title: string, url: string): Publication['tags'] {
    const text = `${title} ${content}`.toLowerCase();

    return {
      documentType: this.detectDocumentType(text, url),
      sectors: this.extractSectors(text),
      regions: this.extractRegions(text),
      countries: this.extractCountries(text),
      themes: this.extractThemes(text),
      initiatives: this.extractInitiatives(text),
      authors: this.extractAuthors(content),
      departments: this.extractDepartments(text),
      lendingInstruments: this.extractLendingInstruments(text),
      projectCodes: this.extractProjectCodes(text)
    };
  }

  /**
   * Extract project codes (P-codes)
   */
  private extractProjectCodes(text: string): string[] {
    const codes = text.match(/P\d{6}/g) || [];
    return [...new Set(codes)];
  }

  /**
   * Extract lending instruments
   */
  private extractLendingInstruments(text: string): string[] {
    const instruments: string[] = [];
    const instrumentKeywords = {
      'IBRD Loan': ['ibrd', 'ibrd loan'],
      'IDA Credit': ['ida credit', 'ida grant'],
      'Trust Fund': ['trust fund', 'tf-'],
      'Guarantee': ['guarantee', 'guarantee facility'],
      'Technical Assistance': ['technical assistance', 'reimbursable advisory']
    };

    Object.entries(instrumentKeywords).forEach(([instrument, keywords]) => {
      if (keywords.some(kw => text.includes(kw))) {
        instruments.push(instrument);
      }
    });

    return instruments;
  }

  /**
   * Extract themes
   */
  private extractThemes(text: string): string[] {
    const themes: string[] = [];
    const themeKeywords = {
      'Climate Change': ['climate change', 'climate action'],
      'Gender': ['gender', 'women', 'girls'],
      'Governance': ['governance', 'institutions', 'public sector'],
      'Jobs & Growth': ['employment', 'job creation', 'economic growth'],
      'Human Development': ['education', 'health', 'nutrition'],
      'Infrastructure': ['infrastructure', 'transport', 'urban'],
      'Finance': ['financial sector', 'capital markets', 'fintech'],
      'Rural Development': ['rural', 'agriculture', 'farming'],
      'Social Protection': ['social protection', 'safety nets'],
      'Fragility': ['fragility', 'conflict', 'crisis response']
    };

    Object.entries(themeKeywords).forEach(([theme, keywords]) => {
      if (keywords.some(kw => text.includes(kw))) {
        themes.push(theme);
      }
    });

    return themes;
  }

  /**
   * Extract countries
   */
  private extractCountries(text: string): string[] {
    const countries: string[] = [];
    
    // Major countries frequently in World Bank reports
    const countryList = [
      'India', 'China', 'Brazil', 'Nigeria', 'Kenya', 'Ethiopia',
      'Tanzania', 'Uganda', 'Bangladesh', 'Pakistan', 'Indonesia',
      'Mexico', 'Colombia', 'Egypt', 'South Africa', 'Vietnam'
    ];

    countryList.forEach(country => {
      if (text.includes(country.toLowerCase())) {
        countries.push(country);
      }
    });

    return countries;
  }

  /**
   * Detect document type
   */
  private detectDocumentType(text: string, url: string): string {
    if (text.includes('annual report')) return 'annual-report';
    if (text.includes('evaluation')) return 'evaluation';
    if (text.includes('policy') || text.includes('operational policy')) return 'policy';
    if (text.includes('research') || text.includes('working paper')) return 'research';
    if (text.includes('data') || text.includes('statistics')) return 'data';
    if (url.includes('curated/en')) return 'official-document';
    return 'report';
  }

  /**
   * Extract report number
   */
  private extractReportNumber(content: string): string | undefined {
    const match = content.match(/Report\s+No\.?\s*(\d+)/i);
    return match ? match[1] : undefined;
  }

  /**
   * Extract ISBN
   */
  private extractISBN(content: string): string | undefined {
    const match = content.match(/ISBN:?\s*([\d-]+)/i);
    return match ? match[1] : undefined;
  }

  /**
   * Get default alignment (when no analysis)
   */
  private getDefaultAlignment(): StrategicAlignment {
    return {
      score: 50,
      aligned: [],
      misaligned: [],
      gaps: [],
      references: []
    };
  }

  /**
   * Generate compliance index with alignment scores
   */
  private async generateComplianceIndex(): Promise<void> {
    console.log('📊 Generating compliance index...');

    // Group by alignment score
    const highCompliance = this.publications.filter(p => p.strategicAlignment.score >= 70);
    const mediumCompliance = this.publications.filter(p => p.strategicAlignment.score >= 40 && p.strategicAlignment.score < 70);
    const lowCompliance = this.publications.filter(p => p.strategicAlignment.score < 40);

    const complianceIndex = {
      metadata: {
        totalPublications: this.publications.length,
        generated: new Date().toISOString(),
        dateRange: { min: this.config.minDate, max: 'present' }
      },
      compliance: {
        high: {
          count: highCompliance.length,
          percentage: Math.round((highCompliance.length / this.publications.length) * 100),
          publications: highCompliance.map(p => ({
            id: p.id,
            title: p.title,
            score: p.strategicAlignment.score,
            type: p.publicationType
          }))
        },
        medium: {
          count: mediumCompliance.length,
          percentage: Math.round((mediumCompliance.length / this.publications.length) * 100),
          publications: mediumCompliance.map(p => ({
            id: p.id,
            title: p.title,
            score: p.strategicAlignment.score,
            type: p.publicationType
          }))
        },
        low: {
          count: lowCompliance.length,
          percentage: Math.round((lowCompliance.length / this.publications.length) * 100),
          publications: lowCompliance.map(p => ({
            id: p.id,
            title: p.title,
            score: p.strategicAlignment.score,
            type: p.publicationType,
            gaps: p.strategicAlignment.gaps
          }))
        }
      },
      averageScore: Math.round(
        this.publications.reduce((sum, p) => sum + p.strategicAlignment.score, 0) / this.publications.length
      )
    };

    const indexPath = path.join(this.config.outputDir, 'compliance-index.json');
    await fs.writeFile(indexPath, JSON.stringify(complianceIndex, null, 2));

    console.log('✅ Compliance index generated');
  }

  /**
   * Generate alignment report
   */
  private async generateAlignmentReport(): Promise<void> {
    console.log('📋 Generating alignment report...');

    const avgScore = Math.round(
      this.publications.reduce((sum, p) => sum + p.strategicAlignment.score, 0) / this.publications.length
    );

    const report = `# World Bank Publications Strategic Alignment Report

## Overview
- **Total Publications**: ${this.publications.length}
- **Date Range**: ${this.config.minDate} to present
- **Average Alignment Score**: ${avgScore}%
- **Generated**: ${new Date().toLocaleString()}

## Compliance Distribution

### High Compliance (70-100%)
${this.publications.filter(p => p.strategicAlignment.score >= 70).length} publications (${Math.round((this.publications.filter(p => p.strategicAlignment.score >= 70).length / this.publications.length) * 100)}%)

### Medium Compliance (40-69%)
${this.publications.filter(p => p.strategicAlignment.score >= 40 && p.strategicAlignment.score < 70).length} publications (${Math.round((this.publications.filter(p => p.strategicAlignment.score >= 40 && p.strategicAlignment.score < 70).length / this.publications.length) * 100)}%)

### Low Compliance (0-39%)
${this.publications.filter(p => p.strategicAlignment.score < 40).length} publications (${Math.round((this.publications.filter(p => p.strategicAlignment.score < 40).length / this.publications.length) * 100)}%)

## Publications Not Aligned with RJ Banga's Strategy

${this.generateMisalignedList()}

## Common Gaps

${this.generateCommonGaps()}

## Top Aligned Publications

${this.generateTopAligned()}

---

Generated by World Bank Publications Scraper
`;

    const reportPath = path.join(this.config.outputDir, 'ALIGNMENT_REPORT.md');
    await fs.writeFile(reportPath, report);

    console.log('✅ Alignment report generated');
  }

  /**
   * Generate list of misaligned publications
   */
  private generateMisalignedList(): string {
    const misaligned = this.publications
      .filter(p => p.strategicAlignment.score < 50)
      .sort((a, b) => a.strategicAlignment.score - b.strategicAlignment.score)
      .slice(0, 20);

    if (misaligned.length === 0) {
      return '*No publications with low alignment found.*';
    }

    return misaligned.map(p => `
### ${p.title} (${p.strategicAlignment.score}% aligned)
- **Type**: ${p.publicationType}
- **Date**: ${p.date}
- **Gaps**: ${p.strategicAlignment.gaps.join('; ')}
- **Misalignments**: ${p.strategicAlignment.misaligned.join('; ') || 'None'}
- **URL**: ${p.url}
`).join('\n');
  }

  /**
   * Generate common gaps analysis
   */
  private generateCommonGaps(): string {
    const allGaps: Record<string, number> = {};

    this.publications.forEach(p => {
      p.strategicAlignment.gaps.forEach(gap => {
        const category = gap.split(':')[0];
        allGaps[category] = (allGaps[category] || 0) + 1;
      });
    });

    return Object.entries(allGaps)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([gap, count]) => `- **${gap}**: ${count} publications (${Math.round((count / this.publications.length) * 100)}%)`)
      .join('\n');
  }

  /**
   * Generate top aligned publications
   */
  private generateTopAligned(): string {
    const topAligned = this.publications
      .filter(p => p.strategicAlignment.score >= 70)
      .sort((a, b) => b.strategicAlignment.score - a.strategicAlignment.score)
      .slice(0, 10);

    return topAligned.map(p => `
### ${p.title} (${p.strategicAlignment.score}% aligned)
- **Type**: ${p.publicationType}
- **Date**: ${p.date}
- **Aligned Areas**: ${p.strategicAlignment.aligned.slice(0, 3).join('; ')}
- **URL**: ${p.url}
`).join('\n');
  }

  // Helper methods (reuse from previous scraper)
  private extractContent($: cheerio.CheerioAPI): string {
    $('script, style, nav, header, footer').remove();
    const content = $('article, main, .content, body').first().text();
    return content.replace(/\s+/g, ' ').trim();
  }

  private extractDate(content: string): string | null {
    const match = content.match(/20(24|25|26)[-\/](0[1-9]|1[0-2])[-\/](0[1-9]|[12]\d|3[01])/);
    return match ? match[0] : null;
  }

  private generateSummary(content: string): string {
    const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
    return sentences.slice(0, 3).join(' ').substring(0, 500);
  }

  private generateId(url: string): string {
    return Buffer.from(url).toString('base64').substring(0, 32);
  }

  private resolveUrl(base: string, relative: string): string {
    try {
      return new URL(relative, base).href;
    } catch {
      return relative;
    }
  }

  private async ensureOutputDirectory(): Promise<void> {
    await fs.mkdir(this.config.outputDir, { recursive: true });
    await fs.mkdir(path.join(this.config.outputDir, 'publications'), { recursive: true });
  }

  private async savePublications(): Promise<void> {
    console.log('💾 Saving publications...');

    // Save individual files
    for (const pub of this.publications) {
      const filename = `${pub.id}.json`;
      const filepath = path.join(this.config.outputDir, 'publications', filename);
      await fs.writeFile(filepath, JSON.stringify(pub, null, 2));
    }

    // Save complete collection
    const collectionPath = path.join(this.config.outputDir, 'publications.json');
    await fs.writeFile(collectionPath, JSON.stringify(this.publications, null, 2));

    // Save to database
    console.log('📊 Saving to database...');
    const { WorldBankDB } = await import('../lib/worldbank-db.ts');
    const db = new WorldBankDB();

    let saved = 0;
    let failed = 0;

    for (const pub of this.publications) {
      try {
        // Convert publication format to database format
        const dbDoc = {
          id: pub.id,
          title: pub.title,
          url: pub.url,
          content: pub.content || '',
          summary: pub.summary || '',
          date: pub.date,
          type: pub.publicationType || 'document',
          file_type: 'html',
          file_size: (pub.content || '').length,
          local_path: pub.localPath || null,
          topics: [], // publications don't have topics array
          keywords: [],
          citations: [],
          related_documents: [],
          tags_document_type: pub.publicationType || 'document',
          tags_content_type: pub.publicationType || 'document',
          tags_audience: ['general'],
          tags_regions: pub.tags?.regions || [],
          tags_sectors: pub.tags?.sectors || [],
          tags_initiatives: pub.tags?.initiatives || [],
          tags_authors: pub.tags?.authors || [],
          tags_departments: pub.tags?.departments || [],
          tags_priority: 'standard',
          tags_status: 'verified',
          source_original_url: pub.sourceReference?.originalUrl || pub.url,
          source_scraped_from: pub.sourceReference?.scrapedFrom || pub.url,
          source_parent_page: pub.sourceReference?.parentPage || null,
          source_link_text: pub.sourceReference?.linkText || pub.title,
          source_discovered_at: pub.sourceReference?.discoveredAt || new Date().toISOString(),
          source_type: pub.sourceReference?.sourceType || 'scraped',
          metadata_language: pub.metadata?.language || 'en',
          metadata_word_count: pub.metadata?.wordCount || (pub.content || '').split(' ').length,
          metadata_reading_time: pub.metadata?.readingTime || Math.ceil((pub.content || '').split(' ').length / 200),
          metadata_last_modified: null,
          scraped_at: pub.scrapedAt || new Date().toISOString()
        };

        await db.saveDocument(dbDoc);
        saved++;
        console.log(`  ✅ Saved: ${pub.title.substring(0, 40)}...`);
      } catch (error) {
        console.log(`  ❌ Failed: ${pub.title} - ${error.message}`);
        failed++;
      }
    }

    console.log(`✅ Saved ${this.publications.length} publications to files`);
    console.log(`📊 Database: ${saved} saved, ${failed} failed`);
  }

  // Reuse helper methods from original scraper
  private extractSectors(text: string): string[] {
    const sectors: string[] = [];
    const keywords: Record<string, string[]> = {
      'Energy': ['energy', 'power'],
      'Health': ['health', 'healthcare'],
      'Education': ['education', 'learning'],
      'Agriculture': ['agriculture', 'farming'],
      'Climate': ['climate', 'environment'],
      'Finance': ['finance', 'banking'],
      'Infrastructure': ['infrastructure', 'transport'],
      'Water': ['water', 'sanitation'],
      'Technology': ['technology', 'digital']
    };

    Object.entries(keywords).forEach(([sector, kws]) => {
      if (kws.some(kw => text.includes(kw))) sectors.push(sector);
    });

    return sectors;
  }

  private extractRegions(text: string): string[] {
    const regions: string[] = [];
    if (text.includes('africa')) regions.push('Africa');
    if (text.includes('asia')) regions.push('Asia');
    if (text.includes('europe')) regions.push('Europe');
    if (text.includes('latin america') || text.includes('caribbean')) regions.push('Latin America');
    if (text.includes('middle east') || text.includes('mena')) regions.push('Middle East');
    if (text.includes('global') || text.includes('worldwide')) regions.push('Global');
    return regions;
  }

  private extractInitiatives(text: string): string[] {
    const initiatives: string[] = [];
    const known = [
      'Climate Action Plan', 'Evolution Roadmap', 'Human Capital Project',
      'IDA Replenishment', 'Pandemic Fund', 'Digital Development'
    ];

    known.forEach(init => {
      if (text.includes(init.toLowerCase())) initiatives.push(init);
    });

    return initiatives;
  }

  private extractAuthors(content: string): string[] {
    const authors: string[] = [];
    const byPattern = /By\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/g;
    const matches = content.matchAll(byPattern);
    for (const match of matches) {
      authors.push(match[1]);
    }
    return [...new Set(authors)];
  }

  private extractDepartments(text: string): string[] {
    const depts: string[] = [];
    if (text.includes('ifc') || text.includes('international finance corporation')) depts.push('IFC');
    if (text.includes('miga')) depts.push('MIGA');
    if (text.includes('ibrd')) depts.push('IBRD');
    if (text.includes('ida')) depts.push('IDA');
    return depts;
  }
}

/**
 * Main execution
 */
async function main() {
  const scraper = new WorldBankPublicationsScraper({
    outputDir: path.join(process.cwd(), 'data', 'worldbank-publications'),
    maxPublications: 100,
    minDate: '2024-01-01',
    analyzeAlignment: true,
    useSupabaseStorage: true,
    supabaseBucket: 'RJ-banga-Public-Informatin'
  });

  await scraper.scrape();
}

if (require.main === module) {
  main().catch(console.error);
}

export { WorldBankPublicationsScraper, type Publication, type StrategicAlignment };

