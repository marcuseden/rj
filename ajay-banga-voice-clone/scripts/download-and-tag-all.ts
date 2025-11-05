/**
 * COMPLETE CONTENT DOWNLOADER WITH FULL TAGGING
 * Downloads full text, generates PDFs, saves with comprehensive metadata
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { randomUUID } from 'crypto';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Comprehensive tagging system
interface FullDocument {
  // Basic Info
  id: string;
  title: string;
  url: string;
  fullText: string;
  summary: string;
  date: string;
  
  // Classification
  type: string;
  documentType: string;
  contentFormat: string;
  
  // Comprehensive Tags
  tags: {
    // Content classification
    documentType: string;
    contentType: string;
    audience: string[];
    
    // Geographic
    regions: string[];
    countries: string[];
    
    // Thematic
    sectors: string[];
    themes: string[];
    topics: string[];
    
    // World Bank specific
    initiatives: string[];
    departments: string[];
    projectCodes: string[];
    authors: string[];
    
    // Metadata
    priority: 'critical' | 'high' | 'medium' | 'low';
    status: 'current' | 'archived' | 'draft';
    visibility: 'public' | 'internal' | 'restricted';
  };
  
  // Strategic Analysis
  strategy: {
    keyMessages: string[];
    actionItems: string[];
    commitments: string[];
    partnerships: string[];
    financialCommitments: string[];
    targets: string[];
  };
  
  // Rich metadata
  metadata: {
    language: string;
    wordCount: number;
    readingTime: number;
    publicationYear: number;
    lastModified?: string;
    version?: string;
  };
  
  // Source tracking
  source: {
    originalUrl: string;
    downloadedFrom: string;
    scrapedAt: string;
    localPath?: string;
    pdfPath?: string;
  };
}

async function fetchAllDocuments() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  FETCHING ALL RJ BANGA CONTENT');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Fetch from multiple sources for comprehensive coverage
  const queries = [
    {
      name: 'Speeches & Transcripts',
      url: 'https://search.worldbank.org/api/v2/everything?format=json&qterm=ajay+banga&fct=docty_exact&rows=200&fl=*&srt=master_date&order=desc&apilang=en&lang_exact=English',
      filter: (doc: any) => doc.masterconttype?.includes('Speech') || doc.docty_exact?.includes('Speech')
    },
    {
      name: 'Strategy Documents',
      url: 'https://search.worldbank.org/api/v2/everything?format=json&qterm=ajay+banga+strategy+vision&rows=100&fl=*&apilang=en&lang_exact=English',
      filter: (doc: any) => true
    },
    {
      name: 'Press Releases',
      url: 'https://search.worldbank.org/api/v2/everything?format=json&qterm=ajay+banga&docty_exact=Press+Release&rows=150&fl=*&srt=master_date&order=desc&apilang=en',
      filter: (doc: any) => true
    }
  ];

  const allDocs = new Map<string, any>();

  for (const query of queries) {
    console.log(`📡 ${query.name}...`);
    
    try {
      const response = await fetch(query.url);
      const data = await response.json();
      const everything = data.everything;
      
      if (everything) {
        const documents = Object.values(everything).filter((doc: any) => doc.id && query.filter(doc));
        console.log(`   ✓ Found ${documents.length} items`);
        
        documents.forEach((doc: any) => {
          if (!allDocs.has(doc.id)) {
            allDocs.set(doc.id, doc);
          }
        });
      }
    } catch (error: any) {
      console.error(`   ✗ ${error.message}`);
    }
  }

  console.log(`\n✅ Total unique documents: ${allDocs.size}\n`);
  return Array.from(allDocs.values());
}

async function downloadAndProcessDocument(doc: any): Promise<FullDocument | null> {
  try {
    const url = doc.url;
    
    // Download full content if available
    let fullText = doc.abstracts || doc.ml_abstracts || doc.desc || '';
    
    // Try to download PDF or HTML for full content
    if (url) {
      try {
        const response = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          
          if (contentType?.includes('pdf')) {
            // Save PDF
            const pdfData = await response.arrayBuffer();
            const pdfPath = path.join(process.cwd(), 'data', 'pdfs', `${doc.id}.pdf`);
            fs.mkdirSync(path.dirname(pdfPath), { recursive: true });
            fs.writeFileSync(pdfPath, Buffer.from(pdfData));
            
            console.log(`     📄 Downloaded PDF: ${doc.id}.pdf`);
          } else {
            // Save HTML and extract text
            const html = await response.text();
            const htmlPath = path.join(process.cwd(), 'data', 'html', `${doc.id}.html`);
            fs.mkdirSync(path.dirname(htmlPath), { recursive: true });
            fs.writeFileSync(htmlPath, html);
            
            // Simple text extraction (you could use cheerio for better extraction)
            fullText = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
          }
        }
      } catch (error) {
        // If download fails, use summary
        console.log(`     ⚠️ Could not download full content, using summary`);
      }
    }

    // Extract strategic elements
    const strategy = extractStrategy(fullText);
    
    // Build comprehensive document
    const fullDoc: FullDocument = {
      id: doc.id,
      title: cleanText(doc.display_title || doc.ml_display_title || doc.title || 'Untitled'),
      url: doc.url,
      fullText: fullText,
      summary: cleanText(doc.abstracts || doc.ml_abstracts || doc.desc || ''),
      date: doc.master_date ? doc.master_date.split('T')[0] : new Date().toISOString().split('T')[0],
      type: determineType(doc),
      documentType: doc.masterconttype_exact || doc.docty_exact || 'Document',
      contentFormat: determineFormat(doc),
      tags: {
        documentType: doc.masterconttype_exact || doc.docty_exact || 'Document',
        contentType: doc.majdocty_exact || 'Publications & Research',
        audience: determineAudience(doc),
        regions: extractRegions(doc),
        countries: extractCountries(doc),
        sectors: extractSectors(doc, fullText),
        themes: extractThemes(fullText),
        topics: extractTopics(fullText),
        initiatives: extractInitiatives(fullText),
        departments: extractDepartments(doc),
        projectCodes: extractProjectCodes(fullText),
        authors: ['Ajay Banga'],
        priority: determinePriority(doc),
        status: 'current',
        visibility: 'public'
      },
      strategy: strategy,
      metadata: {
        language: doc.lang_exact || 'English',
        wordCount: fullText.split(/\s+/).length,
        readingTime: Math.ceil(fullText.split(/\s+/).length / 200),
        publicationYear: parseInt(doc.master_date?.substring(0, 4) || '2024')
      },
      source: {
        originalUrl: doc.url,
        downloadedFrom: 'World Bank API',
        scrapedAt: new Date().toISOString(),
        localPath: `data/html/${doc.id}.html`,
        pdfPath: `data/pdfs/${doc.id}.pdf`
      }
    };

    return fullDoc;
    
  } catch (error: any) {
    console.error(`   ✗ Error processing ${doc.id}: ${error.message}`);
    return null;
  }
}

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/&#x2019;/g, "'")
    .replace(/&#x2013;/g, "-")
    .replace(/&#x2014;/g, "—")
    .replace(/&amp;/g, "&")
    .trim();
}

function determineType(doc: any): string {
  const contentType = (doc.masterconttype_exact || doc.docty_exact || '').toLowerCase();
  
  if (contentType.includes('speech')) return 'speech';
  if (contentType.includes('strategy')) return 'strategy';
  if (contentType.includes('report')) return 'report';
  if (contentType.includes('article') || contentType.includes('feature')) return 'article';
  if (contentType.includes('press')) return 'press-release';
  if (contentType.includes('initiative')) return 'initiative';
  if (contentType.includes('video')) return 'video';
  if (contentType.includes('event')) return 'event';
  
  return 'speech'; // Default
}

function determineFormat(doc: any): string {
  if (doc.url?.includes('.pdf')) return 'pdf';
  if (doc.masterconttype_exact?.includes('Video')) return 'video';
  return 'html';
}

function determineAudience(doc: any): string[] {
  const audience = ['public'];
  const title = (doc.title || '').toLowerCase();
  
  if (title.includes('g20') || title.includes('summit')) audience.push('government');
  if (title.includes('board') || title.includes('governor')) audience.push('internal');
  if (title.includes('private sector') || title.includes('business')) audience.push('private-sector');
  
  audience.push('stakeholders');
  return audience;
}

function extractRegions(doc: any): string[] {
  const regions: Set<string> = new Set();
  const country = doc.country || doc.country_exact || '';
  const text = `${doc.title || ''} ${country}`.toLowerCase();
  
  if (text.includes('africa') || country.includes('Africa')) regions.add('Africa');
  if (text.includes('asia') || country.includes('Asia')) regions.add('Asia');
  if (text.includes('latin america') || text.includes('caribbean')) regions.add('Latin America');
  if (text.includes('europe')) regions.add('Europe');
  if (text.includes('middle east')) regions.add('Middle East');
  if (text.includes('pacific') || text.includes('oceania')) regions.add('Pacific');
  if (country.includes('World') || text.includes('global') || regions.size === 0) regions.add('Global');
  
  return Array.from(regions);
}

function extractCountries(doc: any): string[] {
  const countries: Set<string> = new Set();
  const country = doc.country_exact || doc.country || '';
  
  if (country && country !== 'World' && !country.includes('(') && country.length < 50) {
    countries.add(country);
  }
  
  return Array.from(countries);
}

function extractSectors(doc: any, fullText: string): string[] {
  const sectors: Set<string> = new Set();
  const text = `${doc.title || ''} ${fullText}`.toLowerCase();

  const sectorMap: Record<string, string[]> = {
    'Climate': ['climate', 'emissions', 'methane', 'cop28', 'cop29', 'carbon'],
    'Agriculture': ['agriculture', 'food', 'farming', 'agribusiness', 'hunger'],
    'Finance': ['finance', 'financing', 'investment', 'funding', 'capital', 'ida'],
    'Energy': ['energy', 'electricity', 'power', 'renewable', 'mission 300'],
    'Health': ['health', 'healthcare', 'medical', 'pandemic'],
    'Infrastructure': ['infrastructure', 'construction', 'roads', 'bridges'],
    'Education': ['education', 'school', 'training', 'skills'],
    'Technology': ['digital', 'technology', 'innovation', 'data'],
    'Governance': ['governance', 'reform', 'policy', 'regulation', 'institution'],
    'Poverty': ['poverty', 'poor', 'vulnerable', 'inequality'],
    'Water': ['water', 'sanitation', 'hydro'],
    'Transport': ['transport', 'mobility', 'logistics'],
    'Social Protection': ['social protection', 'safety net', 'welfare'],
    'Private Sector': ['private sector', 'business', 'enterprise', 'psi']
  };

  Object.entries(sectorMap).forEach(([sector, keywords]) => {
    if (keywords.some(kw => text.includes(kw))) {
      sectors.add(sector);
    }
  });

  return Array.from(sectors);
}

function extractThemes(text: string): string[] {
  const themes: Set<string> = new Set();
  const lower = text.toLowerCase();

  const themeMap: Record<string, string[]> = {
    'Partnership & Collaboration': ['partnership', 'collaboration', 'together', 'collective'],
    'Reform & Transformation': ['reform', 'transformation', 'evolution', 'change'],
    'Results & Accountability': ['results', 'measurable', 'accountability', 'outcomes'],
    'Innovation & Technology': ['innovation', 'digital', 'technology', 'modern'],
    'Equity & Inclusion': ['equity', 'inclusion', 'vulnerable', 'marginalized'],
    'Sustainability': ['sustainable', 'sustainability', 'long-term', 'future'],
    'Jobs & Growth': ['jobs', 'employment', 'growth', 'economic'],
    'Climate Action': ['climate action', 'net zero', 'emissions reduction'],
    'Poverty Reduction': ['poverty reduction', 'end poverty', 'eradicate poverty']
  };

  Object.entries(themeMap).forEach(([theme, keywords]) => {
    if (keywords.some(kw => lower.includes(kw))) {
      themes.add(theme);
    }
  });

  return Array.from(themes);
}

function extractTopics(text: string): string[] {
  const topics: Set<string> = new Set();
  const lower = text.toLowerCase();

  const topicPatterns = [
    { topic: 'IDA Replenishment', keywords: ['ida', 'replenishment', 'ida21', 'ida20'] },
    { topic: 'Mission 300', keywords: ['mission 300', 'energy access', 'electrification'] },
    { topic: 'Climate Finance', keywords: ['climate finance', 'climate funding', 'green finance'] },
    { topic: 'Evolution Roadmap', keywords: ['evolution roadmap', 'reform agenda', 'transformation plan'] },
    { topic: 'Private Sector Investment Lab', keywords: ['psi lab', 'private sector investment lab'] },
    { topic: 'Global Alliance Against Hunger', keywords: ['hunger alliance', 'food security alliance'] },
    { topic: 'Carbon Markets', keywords: ['carbon market', 'carbon credit', 'emissions trading'] },
    { topic: 'Digital Development', keywords: ['digital development', 'digital transformation'] },
    { topic: 'Pandemic Preparedness', keywords: ['pandemic', 'health emergency', 'pandemic fund'] },
    { topic: 'Debt Sustainability', keywords: ['debt', 'sovereign debt', 'debt relief'] }
  ];

  topicPatterns.forEach(({ topic, keywords }) => {
    if (keywords.some(kw => lower.includes(kw))) {
      topics.add(topic);
    }
  });

  return Array.from(topics);
}

function extractInitiatives(text: string): string[] {
  const initiatives: Set<string> = new Set();
  const lower = text.toLowerCase();

  // Extract specific World Bank initiatives
  const patterns = [
    'Mission 300',
    'IDA21',
    'IDA20',
    'Evolution Roadmap',
    'Global Alliance Against Hunger',
    'Private Sector Investment Lab',
    'Livable Planet Fund',
    'Pandemic Fund',
    'Global Infrastructure Facility',
    'Climate Finance Action Plan'
  ];

  patterns.forEach(pattern => {
    if (lower.includes(pattern.toLowerCase())) {
      initiatives.add(pattern);
    }
  });

  // Extract project codes (P-codes)
  const pcodeMatches = text.match(/P\d{6}/g);
  if (pcodeMatches) {
    pcodeMatches.forEach(code => initiatives.add(code));
  }

  return Array.from(initiatives);
}

function extractDepartments(doc: any): string[] {
  // Extract from entity IDs or metadata if available
  return ['Office of the President'];
}

function extractProjectCodes(text: string): string[] {
  const codes = text.match(/P\d{6}/g) || [];
  return [...new Set(codes)];
}

function determinePriority(doc: any): 'critical' | 'high' | 'medium' | 'low' {
  const type = (doc.masterconttype_exact || '').toLowerCase();
  
  if (type.includes("president's speech")) return 'critical';
  if (type.includes('speech') || type.includes('statement')) return 'high';
  if (type.includes('strategy') || type.includes('report')) return 'high';
  if (type.includes('press release')) return 'medium';
  
  return 'medium';
}

function extractStrategy(text: string): any {
  const lower = text.toLowerCase();
  
  return {
    keyMessages: extractKeyMessages(text),
    actionItems: extractActionItems(text),
    commitments: extractCommitments(text),
    partnerships: extractPartnerships(text),
    financialCommitments: extractFinancialCommitments(text),
    targets: extractTargets(text)
  };
}

function extractKeyMessages(text: string): string[] {
  const messages: string[] = [];
  const sentences = text.split(/[.!?]+/);
  
  // Find sentences with strong language
  const keyPhrases = ['must', 'will', 'committed', 'essential', 'critical', 'urgent'];
  
  sentences.forEach(sentence => {
    const lower = sentence.toLowerCase();
    if (keyPhrases.some(phrase => lower.includes(phrase)) && sentence.length > 50 && sentence.length < 300) {
      messages.push(sentence.trim());
    }
  });
  
  return messages.slice(0, 5);
}

function extractActionItems(text: string): string[] {
  const actions: string[] = [];
  const actionVerbs = ['launch', 'implement', 'deliver', 'create', 'establish', 'scale'];
  
  text.split(/[.!?]+/).forEach(sentence => {
    const lower = sentence.toLowerCase();
    if (actionVerbs.some(verb => lower.includes(verb)) && sentence.length > 30) {
      actions.push(sentence.trim());
    }
  });
  
  return actions.slice(0, 10);
}

function extractCommitments(text: string): string[] {
  const commitments: string[] = [];
  const patterns = [
    /will\s+[^.]{20,100}/gi,
    /committed to\s+[^.]{20,100}/gi,
    /pledge[sd]?\s+[^.]{20,100}/gi
  ];
  
  patterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      commitments.push(...matches.map(m => m.trim()));
    }
  });
  
  return [...new Set(commitments)].slice(0, 10);
}

function extractPartnerships(text: string): string[] {
  const partners: Set<string> = new Set();
  const partnerPatterns = [
    /with\s+(the\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
    /partnership with\s+([^,\.]{5,50})/gi,
    /alongside\s+([^,\.]{5,50})/gi
  ];
  
  partnerPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const clean = match.replace(/^(with|alongside|partnership with)\s+/i, '').trim();
        if (clean.length > 3 && clean.length < 50) {
          partners.add(clean);
        }
      });
    }
  });
  
  return Array.from(partners).slice(0, 15);
}

function extractFinancialCommitments(text: string): string[] {
  const commitments: Set<string> = new Set();
  
  // Extract financial amounts
  const patterns = [
    /\$\d+(?:\.\d+)?\s*(?:billion|million|trillion)/gi,
    /\d+\s*billion\s*dollars?/gi,
    /\d+\s*million\s*dollars?/gi
  ];
  
  patterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(m => commitments.add(m));
    }
  });
  
  return Array.from(commitments);
}

function extractTargets(text: string): string[] {
  const targets: Set<string> = new Set();
  
  // Extract target patterns (numbers + timeframes)
  const patterns = [
    /by\s+20\d{2}/gi,
    /\d+\s*percent/gi,
    /\d+\s*million\s+(?:people|jobs)/gi
  ];
  
  patterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(m => targets.add(m));
    }
  });
  
  return Array.from(targets).slice(0, 10);
}

async function saveDocuments(documents: FullDocument[]) {
  console.log('\n💾 Saving comprehensive data...\n');

  // Save master JSON file
  const masterPath = path.join(process.cwd(), 'data', 'rj-banga-complete.json');
  fs.mkdirSync(path.dirname(masterPath), { recursive: true });
  fs.writeFileSync(masterPath, JSON.stringify(documents, null, 2));
  console.log(`✓ Saved master file: ${masterPath}`);

  // Save to Supabase
  const { data: ceoData } = await supabase
    .from('ceo_profiles')
    .select('id')
    .eq('name', 'Ajay Banga')
    .single();

  if (!ceoData) {
    console.error('❌ CEO profile not found!');
    return;
  }

  let saved = 0;
  
  for (const doc of documents) {
    try {
      await supabase.from('worldbank_documents').upsert({
        id: doc.id,
        title: doc.title,
        url: doc.url,
        content: doc.fullText,
        summary: doc.summary,
        date: doc.date,
        type: doc.type,
        file_type: doc.contentFormat,
        topics: doc.tags.topics,
        keywords: doc.tags.themes,
        citations: doc.strategy.commitments,
        related_documents: [],
        tags_document_type: doc.tags.documentType,
        tags_content_type: doc.tags.contentType,
        tags_audience: doc.tags.audience,
        tags_regions: doc.tags.regions,
        tags_sectors: doc.tags.sectors,
        tags_initiatives: doc.tags.initiatives,
        tags_authors: doc.tags.authors,
        tags_departments: doc.tags.departments,
        tags_priority: doc.tags.priority,
        tags_status: doc.tags.status,
        source_original_url: doc.source.originalUrl,
        source_scraped_from: doc.source.downloadedFrom,
        source_discovered_at: doc.source.scrapedAt,
        source_type: 'api',
        metadata_language: doc.metadata.language,
        metadata_word_count: doc.metadata.wordCount,
        metadata_reading_time: doc.metadata.readingTime,
        scraped_at: doc.source.scrapedAt,
      }, { onConflict: 'id' });

      saved++;
      if (saved % 50 === 0) {
        console.log(`   ✓ Saved ${saved}/${documents.length}...`);
      }
      
    } catch (error: any) {
      console.error(`   ✗ ${doc.id}: ${error.message}`);
    }
  }

  console.log(`\n✅ Saved ${saved}/${documents.length} to database`);
}

async function main() {
  const rawDocs = await fetchAllDocuments();
  
  console.log('📝 Processing documents with full tagging...\n');
  
  const processedDocs: FullDocument[] = [];
  let count = 0;
  
  for (const doc of rawDocs) {
    const processed = await downloadAndProcessDocument(doc);
    if (processed) {
      processedDocs.push(processed);
      count++;
      if (count % 20 === 0) {
        console.log(`   Processed ${count}/${rawDocs.length}...`);
      }
    }
  }

  console.log(`\n✅ Processed ${processedDocs.length} documents\n`);

  await saveDocuments(processedDocs);

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  COMPLETE! KNOWLEDGE BASE READY');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('Run: npm run db:stats to see final counts\n');
}

main().catch(console.error);

