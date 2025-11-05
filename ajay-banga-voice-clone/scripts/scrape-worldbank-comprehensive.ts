/**
 * COMPREHENSIVE WORLD BANK SCRAPER - 2024-2025 CONTENT
 * 
 * This scraper gets:
 * - Strategy documents
 * - Case studies
 * - Project reports
 * - Articles and publications
 * - Country-specific documents
 * - Sector reports
 * 
 * NO SHORTCUTS - Production-ready scraper with full validation
 */

import * as fs from 'fs';
import * as path from 'path';

interface WorldBankAPIDocument {
  id: string;
  display_title: string;
  url: string;
  pdfurl?: string;
  abstractEN?: string;
  abstracts?: string;
  desc?: string;
  master_date?: string;
  docty_exact?: string;
  masterconttype_exact?: string;
  count_exact?: string;
  lang_exact?: string;
  srt_date?: string;
  repnb?: string;
  repnme?: string;
  majtheme_exact?: string[];
  theme_exact?: string[];
  sector_exact?: string[];
  topic?: string[];
  subtopic?: string[];
  authoremail?: string;
}

interface ProcessedDocument {
  id: string;
  title: string;
  url: string;
  summary: string;
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
}

/**
 * World Bank API endpoints for different content types
 */
const API_ENDPOINTS = {
  // Strategy documents and policy papers
  strategy: 'https://search.worldbank.org/api/v2/everything?format=json&fl=*&qterm=strategy&srt=master_date&order=desc&rows=50',
  
  // Case studies and impact reports
  caseStudies: 'https://search.worldbank.org/api/v2/everything?format=json&fl=*&qterm=case%20study&srt=master_date&order=desc&rows=50',
  
  // Project documents
  projects: 'https://search.worldbank.org/api/v2/everything?format=json&fl=*&docty_exact=Project&srt=master_date&order=desc&rows=50',
  
  // Country strategies
  countryStrategies: 'https://search.worldbank.org/api/v2/everything?format=json&fl=*&qterm=country%20partnership%20framework&srt=master_date&order=desc&rows=50',
  
  // Sector reports
  sectorReports: 'https://search.worldbank.org/api/v2/everything?format=json&fl=*&docty_exact=Sector%20Report&srt=master_date&order=desc&rows=50',
  
  // Annual reports and publications
  annualReports: 'https://search.worldbank.org/api/v2/everything?format=json&fl=*&qterm=annual%20report%202024%20OR%202025&srt=master_date&order=desc&rows=50',
  
  // Climate and sustainability
  climate: 'https://search.worldbank.org/api/v2/everything?format=json&fl=*&qterm=climate%20action&srt=master_date&order=desc&rows=50',
  
  // Digital development
  digital: 'https://search.worldbank.org/api/v2/everything?format=json&fl=*&qterm=digital%20development&srt=master_date&order=desc&rows=50',
};

/**
 * Extract clean text from any field
 */
function cleanText(text: string | undefined | null): string {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ')     // Normalize whitespace
    .replace(/&nbsp;/g, ' ')  // Remove HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

/**
 * Determine document type
 */
function determineType(doc: WorldBankAPIDocument): string {
  const docType = doc.docty_exact || doc.masterconttype_exact || '';
  const title = doc.display_title?.toLowerCase() || '';
  
  if (docType.includes('Project') || title.includes('project')) return 'project';
  if (docType.includes('Strategy') || title.includes('strategy')) return 'strategy';
  if (docType.includes('Report') || title.includes('report')) return 'report';
  if (docType.includes('Case') || title.includes('case study')) return 'case-study';
  if (docType.includes('Policy') || title.includes('policy')) return 'policy';
  if (docType.includes('Brief') || title.includes('brief')) return 'brief';
  if (docType.includes('Publication')) return 'publication';
  
  return 'document';
}

/**
 * Extract sectors from document
 */
function extractSectors(doc: WorldBankAPIDocument): string[] {
  const sectors = new Set<string>();
  
  // From explicit sector fields
  if (doc.sector_exact) {
    doc.sector_exact.forEach(s => sectors.add(s));
  }
  
  // From major themes
  if (doc.majtheme_exact) {
    doc.majtheme_exact.forEach(t => sectors.add(t));
  }
  
  // From themes
  if (doc.theme_exact) {
    doc.theme_exact.forEach(t => sectors.add(t));
  }
  
  // If no sectors found, try to infer from content
  if (sectors.size === 0) {
    const text = `${doc.display_title} ${doc.abstractEN || ''}`.toLowerCase();
    const sectorKeywords = {
      'Agriculture': ['agriculture', 'farming', 'food security', 'rural'],
      'Education': ['education', 'learning', 'schools', 'teachers'],
      'Health': ['health', 'healthcare', 'medical', 'pandemic'],
      'Finance': ['finance', 'financial', 'banking', 'investment'],
      'Climate': ['climate', 'environment', 'green', 'sustainability'],
      'Energy': ['energy', 'power', 'electricity', 'renewable'],
      'Transport': ['transport', 'infrastructure', 'roads', 'mobility'],
      'Water': ['water', 'sanitation', 'wash'],
      'Digital': ['digital', 'technology', 'ict', 'innovation'],
      'Governance': ['governance', 'institution', 'reform', 'public sector'],
    };
    
    Object.entries(sectorKeywords).forEach(([sector, keywords]) => {
      if (keywords.some(kw => text.includes(kw))) {
        sectors.add(sector);
      }
    });
  }
  
  return Array.from(sectors).slice(0, 5); // Max 5 sectors
}

/**
 * Extract regions/countries
 */
function extractRegions(doc: WorldBankAPIDocument): string[] {
  const regions = new Set<string>();
  
  const text = `${doc.display_title} ${doc.abstractEN || doc.abstracts || ''}`.toLowerCase();
  
  // Major regions
  const regionKeywords: Record<string, string[]> = {
    'Africa': ['africa', 'african', 'sub-saharan'],
    'Asia': ['asia', 'asian', 'south asia', 'east asia'],
    'Latin America': ['latin america', 'caribbean', 'lac'],
    'Middle East': ['middle east', 'mena'],
    'Europe': ['europe', 'european', 'eca'],
    'Global': ['global', 'worldwide', 'international'],
  };
  
  // Specific countries
  const countryKeywords: Record<string, string[]> = {
    'Kenya': ['kenya', 'kenyan'],
    'Mexico': ['mexico', 'mexican'],
    'India': ['india', 'indian'],
    'Brazil': ['brazil', 'brazilian'],
    'Nigeria': ['nigeria', 'nigerian'],
    'Ethiopia': ['ethiopia', 'ethiopian'],
    'Bangladesh': ['bangladesh', 'bangladeshi'],
    'Pakistan': ['pakistan', 'pakistani'],
    'Indonesia': ['indonesia', 'indonesian'],
    'Egypt': ['egypt', 'egyptian'],
  };
  
  // Check regions
  Object.entries(regionKeywords).forEach(([region, keywords]) => {
    if (keywords.some(kw => text.includes(kw))) {
      regions.add(region);
    }
  });
  
  // Check countries
  Object.entries(countryKeywords).forEach(([country, keywords]) => {
    if (keywords.some(kw => text.includes(kw))) {
      regions.add(country);
    }
  });
  
  return regions.size > 0 ? Array.from(regions) : ['Global'];
}

/**
 * Extract keywords from content
 */
function extractKeywords(doc: WorldBankAPIDocument): string[] {
  const keywords = new Set<string>();
  const text = `${doc.display_title} ${doc.abstractEN || doc.abstracts || ''}`.toLowerCase();
  
  const keyTerms = [
    'climate', 'development', 'poverty', 'reform', 'partnership',
    'investment', 'financing', 'sustainable', 'energy', 'education',
    'health', 'digital', 'infrastructure', 'agriculture', 'governance',
    'innovation', 'resilience', 'inclusive', 'equity', 'growth',
    'jobs', 'employment', 'private sector', 'public sector',
  ];
  
  keyTerms.forEach(term => {
    if (text.includes(term)) {
      keywords.add(term);
    }
  });
  
  return Array.from(keywords).slice(0, 10); // Max 10 keywords
}

/**
 * Determine priority based on date and content
 */
function determinePriority(doc: WorldBankAPIDocument, date: Date): string {
  const now = new Date();
  const monthsOld = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 30);
  
  // Recent documents are higher priority
  if (monthsOld < 3) return 'high';
  if (monthsOld < 6) return 'medium';
  return 'low';
}

/**
 * Process raw API document into our format
 */
function processDocument(doc: WorldBankAPIDocument, sourceUrl: string): ProcessedDocument | null {
  try {
    // Validate required fields
    if (!doc.id || !doc.display_title) {
      console.log(`⚠️ Skipping document - missing required fields`);
      return null;
    }
    
    // Parse date
    const dateStr = doc.master_date || doc.srt_date || new Date().toISOString();
    const date = new Date(dateStr);
    const year = date.getFullYear();
    
    // Only include documents from 2024-2025
    if (year < 2024) {
      return null;
    }
    
    // Build summary
    const summary = cleanText(
      doc.abstractEN || 
      doc.abstracts || 
      doc.desc || 
      'World Bank document - full summary not available'
    );
    
    if (summary.length < 50) {
      console.log(`⚠️ Skipping ${doc.display_title} - insufficient summary`);
      return null;
    }
    
    const title = cleanText(doc.display_title);
    const url = doc.url || doc.pdfurl || '';
    const sectors = extractSectors(doc);
    const regions = extractRegions(doc);
    const keywords = extractKeywords(doc);
    const type = determineType(doc);
    
    // Word count estimation
    const wordCount = summary.split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));
    
    return {
      id: doc.id,
      title,
      url,
      summary,
      date: date.toISOString().split('T')[0],
      type,
      topics: doc.topic || [],
      keywords,
      initiatives: [], // Will be enriched later
      regions,
      sectors,
      tags: {
        documentType: doc.docty_exact || doc.masterconttype_exact || type,
        contentType: doc.pdfurl ? 'pdf' : 'html',
        audience: ['public', 'government', 'stakeholders'],
        authors: doc.repnme ? [doc.repnme] : ['World Bank Group'],
        priority: determinePriority(doc, date),
        status: 'current',
      },
      sourceReference: {
        originalUrl: url,
        scrapedFrom: sourceUrl,
        discoveredAt: new Date().toISOString(),
        sourceType: 'api',
      },
      metadata: {
        language: doc.lang_exact || 'English',
        wordCount,
        readingTime,
        publicationYear: year,
      },
    };
  } catch (error) {
    console.error(`❌ Error processing document ${doc.id}:`, error);
    return null;
  }
}

/**
 * Fetch documents from World Bank API
 */
async function fetchDocuments(url: string, category: string): Promise<ProcessedDocument[]> {
  console.log(`\n📥 Fetching ${category} documents...`);
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`❌ Failed to fetch ${category}: ${response.status} ${response.statusText}`);
      return [];
    }
    
    const data = await response.json();
    
    if (!data.documents || !data.documents.docs) {
      console.error(`❌ Invalid response format for ${category}`);
      return [];
    }
    
    const rawDocs = data.documents.docs;
    console.log(`   Found ${rawDocs.length} raw documents`);
    
    const processed = rawDocs
      .map((doc: WorldBankAPIDocument) => processDocument(doc, url))
      .filter((doc: ProcessedDocument | null): doc is ProcessedDocument => doc !== null);
    
    console.log(`   ✅ Processed ${processed.length} valid documents from 2024-2025`);
    
    return processed;
  } catch (error) {
    console.error(`❌ Error fetching ${category}:`, error);
    return [];
  }
}

/**
 * Add delay between requests to be respectful
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main scraper function
 */
async function scrapeWorldBankContent() {
  console.log('🌍 WORLD BANK COMPREHENSIVE SCRAPER');
  console.log('====================================');
  console.log('Target: 2024-2025 documents');
  console.log('Categories: Strategy, Case Studies, Projects, Reports, Country docs\n');
  
  const allDocuments: ProcessedDocument[] = [];
  const seenIds = new Set<string>();
  
  // Scrape each category
  for (const [category, url] of Object.entries(API_ENDPOINTS)) {
    console.log(`\n🔍 Category: ${category}`);
    
    const docs = await fetchDocuments(url, category);
    
    // Deduplicate
    docs.forEach(doc => {
      if (!seenIds.has(doc.id)) {
        seenIds.add(doc.id);
        allDocuments.push(doc);
      }
    });
    
    // Be respectful - wait between requests
    await delay(2000);
  }
  
  console.log('\n====================================');
  console.log(`📊 SCRAPING COMPLETE`);
  console.log(`   Total documents: ${allDocuments.length}`);
  console.log(`   Unique documents: ${seenIds.size}`);
  console.log(`   Date range: 2024-2025 only`);
  
  // Sort by date (newest first)
  allDocuments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Statistics
  const byType = allDocuments.reduce((acc, doc) => {
    acc[doc.type] = (acc[doc.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const bySector = allDocuments.reduce((acc, doc) => {
    doc.sectors.forEach(s => {
      acc[s] = (acc[s] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);
  
  const byRegion = allDocuments.reduce((acc, doc) => {
    doc.regions.forEach(r => {
      acc[r] = (acc[r] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);
  
  console.log('\n📈 STATISTICS');
  console.log('   By Type:', byType);
  console.log('   By Sector (top 5):', Object.entries(bySector).sort((a, b) => b[1] - a[1]).slice(0, 5));
  console.log('   By Region (top 5):', Object.entries(byRegion).sort((a, b) => b[1] - a[1]).slice(0, 5));
  
  // Save to file
  const outputDir = path.join(process.cwd(), 'public', 'data', 'worldbank-strategy');
  const outputFile = path.join(outputDir, 'documents.json');
  
  // Ensure directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write file
  fs.writeFileSync(
    outputFile,
    JSON.stringify(allDocuments, null, 2),
    'utf-8'
  );
  
  console.log(`\n💾 SAVED TO: ${outputFile}`);
  console.log(`   File size: ${(fs.statSync(outputFile).size / 1024).toFixed(2)} KB`);
  
  // Also save to data directory (backup)
  const dataDir = path.join(process.cwd(), 'data', 'worldbank-strategy');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(dataDir, 'documents.json'),
    JSON.stringify(allDocuments, null, 2),
    'utf-8'
  );
  
  // Create index file for quick stats
  const indexData = {
    totalDocuments: allDocuments.length,
    lastUpdated: new Date().toISOString(),
    dateRange: {
      start: '2024-01-01',
      end: '2025-12-31',
    },
    statistics: {
      byType,
      bySector,
      byRegion,
    },
    categories: Object.keys(API_ENDPOINTS),
  };
  
  fs.writeFileSync(
    path.join(outputDir, 'index.json'),
    JSON.stringify(indexData, null, 2),
    'utf-8'
  );
  
  console.log('\n✅ COMPLETE! Ready to use in application.');
  console.log(`\n🔍 To search, users can now query:`);
  console.log(`   - Countries: ${Array.from(new Set(allDocuments.flatMap(d => d.regions))).slice(0, 5).join(', ')}`);
  console.log(`   - Sectors: ${Array.from(new Set(allDocuments.flatMap(d => d.sectors))).slice(0, 5).join(', ')}`);
  console.log(`   - Keywords: ${Array.from(new Set(allDocuments.flatMap(d => d.keywords))).slice(0, 10).join(', ')}`);
}

// Run the scraper
scrapeWorldBankContent().catch(console.error);







