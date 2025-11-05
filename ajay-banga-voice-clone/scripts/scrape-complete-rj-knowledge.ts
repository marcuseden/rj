/**
 * COMPLETE RJ BANGA KNOWLEDGE BASE SCRAPER
 * Fetches ALL content types: speeches, strategy docs, publications, reports, etc.
 * Comprehensive scraping for complete understanding of his vision and strategy
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { randomUUID } from 'crypto';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Multiple API endpoints to get comprehensive coverage
const SEARCH_QUERIES = [
  {
    name: 'RJ Banga All Content',
    url: 'https://search.worldbank.org/api/v2/everything?format=json&qterm=ajay+banga&rows=200&fl=*&srt=master_date&order=desc&apilang=en',
    priority: 'high'
  },
  {
    name: 'President Speeches',
    url: 'https://search.worldbank.org/api/v2/everything?format=json&fl=experts&sq=(experts.name:(masterupi:%22610586%22)OR(masterupi:%22000610586%22)%20OR%20(keywd:%22People:ajay-banga%22))&rows=200&fl=*&srt=master_date&order=desc&apilang=en',
    priority: 'high'
  },
  {
    name: 'Strategy & Vision Documents',
    url: 'https://search.worldbank.org/api/v2/everything?format=json&qterm=ajay+banga+strategy+vision+roadmap&rows=100&fl=*&srt=master_date&order=desc&apilang=en',
    priority: 'medium'
  }
];

interface Document {
  id: string;
  title: string;
  url: string;
  summary: string;
  date: string;
  type: string;
  docType: string;
  sectors: string[];
  regions: string[];
  keywords: string[];
  topics: string[];
  wordCount: number;
  language: string;
  priority: string;
  contentType: string;
}

async function fetchFromAllSources(): Promise<Document[]> {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  COMPREHENSIVE RJ BANGA KNOWLEDGE BASE SCRAPER');
  console.log('═══════════════════════════════════════════════════════════\n');

  const allDocuments = new Map<string, Document>();

  for (const query of SEARCH_QUERIES) {
    console.log(`\n📡 Fetching: ${query.name}...`);
    
    try {
      const response = await fetch(query.url);
      const data = await response.json();

      const everything = data.everything || data.documents?.$;
      
      if (!everything) {
        console.log(`   ⚠️ No results from this source`);
        continue;
      }

      const documents = typeof everything === 'object' 
        ? Object.values(everything).filter((doc: any) => doc.id)
        : everything;

      console.log(`   ✓ Found ${documents.length} items`);

      // Process each document
      documents.forEach((doc: any) => {
        if (!allDocuments.has(doc.id)) {
          const processed = processDocument(doc, query.priority);
          if (processed) {
            allDocuments.set(doc.id, processed);
          }
        }
      });

    } catch (error: any) {
      console.error(`   ✗ Error: ${error.message}`);
    }
  }

  const finalDocs = Array.from(allDocuments.values());
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  SCRAPING SUMMARY');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log(`✅ Total unique documents: ${finalDocs.length}\n`);

  // Group by type
  const byType: Record<string, number> = {};
  finalDocs.forEach(doc => {
    byType[doc.docType] = (byType[doc.docType] || 0) + 1;
  });

  console.log('By Document Type:');
  Object.entries(byType).forEach(([type, count]) => {
    console.log(`   - ${type}: ${count}`);
  });

  return finalDocs;
}

function processDocument(doc: any, priority: string): Document | null {
  try {
    const title = doc.display_title || doc.ml_display_title || doc.title || 'Untitled';
    const summary = doc.abstracts || doc.ml_abstracts || doc.desc || doc.wn_desc || '';
    
    // Skip if no meaningful content
    if (!summary || summary.length < 50) {
      return null;
    }

    return {
      id: doc.id,
      title: cleanText(title),
      url: doc.url,
      summary: cleanText(summary),
      date: doc.master_date ? doc.master_date.split('T')[0] : new Date().toISOString().split('T')[0],
      type: determineType(doc),
      docType: doc.masterconttype_exact || doc.docty_exact || doc.contenttype || 'Document',
      sectors: extractSectors(doc),
      regions: extractRegions(doc),
      keywords: extractKeywords(doc),
      topics: extractTopics(doc),
      wordCount: estimateWordCount(summary),
      language: doc.lang_exact || 'English',
      priority: priority,
      contentType: 'text'
    };
  } catch (error) {
    return null;
  }
}

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/&#x2019;/g, "'")
    .replace(/&#x2013;/g, "-")
    .replace(/&#x2014;/g, "—")
    .trim();
}

function determineType(doc: any): string {
  const contentType = (doc.masterconttype_exact || doc.docty_exact || '').toLowerCase();
  
  if (contentType.includes('speech')) return 'speech';
  if (contentType.includes('strategy')) return 'strategy';
  if (contentType.includes('report')) return 'report';
  if (contentType.includes('article') || contentType.includes('blog')) return 'article';
  if (contentType.includes('initiative')) return 'initiative';
  
  return 'document';
}

function extractSectors(doc: any): string[] {
  const sectors: Set<string> = new Set();
  const text = `${doc.title || ''} ${doc.abstracts || ''}`.toLowerCase();

  const sectorMap: Record<string, string[]> = {
    'Climate': ['climate', 'emissions', 'methane', 'cop28', 'cop29'],
    'Agriculture': ['agriculture', 'food', 'farming', 'agribusiness'],
    'Finance': ['finance', 'financing', 'investment', 'funding', 'capital'],
    'Energy': ['energy', 'electricity', 'power', 'renewable'],
    'Health': ['health', 'healthcare', 'medical'],
    'Infrastructure': ['infrastructure', 'construction', 'development'],
    'Education': ['education', 'school', 'training'],
    'Technology': ['digital', 'technology', 'innovation'],
    'Governance': ['governance', 'reform', 'policy', 'regulation'],
    'Poverty': ['poverty', 'hunger', 'vulnerable']
  };

  Object.entries(sectorMap).forEach(([sector, keywords]) => {
    if (keywords.some(kw => text.includes(kw))) {
      sectors.add(sector);
    }
  });

  return Array.from(sectors);
}

function extractRegions(doc: any): string[] {
  const regions: Set<string> = new Set();
  
  if (doc.country) {
    const country = doc.country.toString();
    if (country.includes('Africa')) regions.add('Africa');
    if (country.includes('Asia')) regions.add('Asia');
    if (country.includes('Latin America') || country.includes('Caribbean')) regions.add('Latin America');
    if (country.includes('Europe')) regions.add('Europe');
    if (country.includes('Middle East')) regions.add('Middle East');
    if (country.includes('World') || country === '1W') regions.add('Global');
  }

  return regions.size > 0 ? Array.from(regions) : ['Global'];
}

function extractKeywords(doc: any): string[] {
  const keywords: Set<string> = new Set(['banga']); // Always include
  const text = `${doc.title || ''} ${doc.abstracts || ''}`.toLowerCase();

  const keyTerms = [
    'climate', 'development', 'poverty', 'reform', 'partnership', 
    'investment', 'financing', 'sustainable', 'energy', 'agriculture',
    'infrastructure', 'innovation', 'governance', 'jobs', 'growth',
    'resilience', 'equity', 'accountability', 'transformation'
  ];

  keyTerms.forEach(term => {
    if (text.includes(term)) keywords.add(term);
  });

  return Array.from(keywords);
}

function extractTopics(doc: any): string[] {
  const topics: Set<string> = new Set();
  const text = `${doc.title || ''} ${doc.abstracts || ''}`.toLowerCase();

  // Key World Bank initiatives and topics
  const topicKeywords: Record<string, string[]> = {
    'IDA Replenishment': ['ida', 'replenishment'],
    'Climate Finance': ['climate finance', 'cop28', 'cop29'],
    'Evolution Roadmap': ['evolution', 'roadmap', 'reform'],
    'Private Sector Mobilization': ['private sector', 'mobilization'],
    'Mission 300': ['mission 300', 'energy access'],
    'Food Security': ['food security', 'hunger', 'agriculture'],
    'Job Creation': ['jobs', 'employment', 'youth'],
    'Digital Transformation': ['digital', 'technology']
  };

  Object.entries(topicKeywords).forEach(([topic, keywords]) => {
    if (keywords.some(kw => text.includes(kw))) {
      topics.add(topic);
    }
  });

  return Array.from(topics);
}

function estimateWordCount(text: string): number {
  return text.split(/\s+/).length;
}

async function saveToDatabase(documents: Document[]) {
  console.log('\n📦 Saving to Supabase...\n');

  const { data: ceoData } = await supabase
    .from('ceo_profiles')
    .select('id')
    .eq('name', 'Ajay Banga')
    .single();

  if (!ceoData) {
    console.error('❌ CEO profile not found!');
    return;
  }

  const ceoProfileId = ceoData.id;
  let savedCount = 0;
  let updatedCount = 0;

  for (const doc of documents) {
    try {
      // Save to worldbank_documents
      const { error: docError } = await supabase
        .from('worldbank_documents')
        .upsert({
          id: doc.id,
          title: doc.title,
          url: doc.url,
          content: doc.summary,
          summary: doc.summary,
          date: doc.date,
          type: doc.type,
          file_type: 'html',
          topics: doc.topics,
          keywords: doc.keywords,
          citations: [],
          related_documents: [],
          tags_document_type: doc.docType,
          tags_content_type: doc.contentType,
          tags_audience: ['public', 'government', 'stakeholders'],
          tags_regions: doc.regions,
          tags_sectors: doc.sectors,
          tags_initiatives: doc.topics.filter(t => t.includes('Mission') || t.includes('IDA') || t.includes('Roadmap')),
          tags_authors: ['Ajay Banga'],
          tags_departments: [],
          tags_priority: doc.priority,
          tags_status: 'current',
          source_original_url: doc.url,
          source_scraped_from: 'World Bank API',
          source_discovered_at: new Date().toISOString(),
          source_type: 'api',
          metadata_language: doc.language,
          metadata_word_count: doc.wordCount,
          metadata_reading_time: Math.ceil(doc.wordCount / 200),
          scraped_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (docError) throw docError;

      // Also save to speeches table if it's a speech
      if (doc.type === 'speech') {
        await supabase.from('speeches').upsert({
          id: randomUUID(),
          ceo_profile_id: ceoProfileId,
          title: doc.title,
          content: doc.summary,
          date: doc.date,
          word_count: doc.wordCount,
          source_url: doc.url,
        }, { 
          onConflict: 'source_url',
          ignoreDuplicates: true 
        });
      }

      console.log(`✓ ${doc.docType}: ${doc.title.substring(0, 60)}...`);
      savedCount++;
      
    } catch (error: any) {
      if (error.message.includes('duplicate')) {
        updatedCount++;
      } else {
        console.error(`✗ Error: ${error.message}`);
      }
    }
  }

  // Update CEO profile
  const { count } = await supabase
    .from('worldbank_documents')
    .select('*', { count: 'exact', head: true })
    .eq('tags_authors', '{Ajay Banga}');

  await supabase
    .from('ceo_profiles')
    .update({ 
      total_speeches: count || 0,
      last_activity: new Date().toISOString()
    })
    .eq('id', ceoProfileId);

  console.log(`\n✅ Saved: ${savedCount} new documents`);
  if (updatedCount > 0) {
    console.log(`✅ Updated: ${updatedCount} existing documents`);
  }
  console.log(`✅ Total in database: ${count}\n`);
}

async function main() {
  const documents = await fetchFromAllSources();
  
  if (documents.length > 0) {
    await saveToDatabase(documents);
    
    // Final stats
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  FINAL DATABASE STATUS');
    console.log('═══════════════════════════════════════════════════════════\n');

    const { count: wbCount } = await supabase
      .from('worldbank_documents')
      .select('*', { count: 'exact', head: true });

    const { count: speechCount } = await supabase
      .from('speeches')
      .select('*', { count: 'exact', head: true });

    console.log(`📊 Worldbank Documents: ${wbCount}`);
    console.log(`📊 Speeches: ${speechCount}`);
    
    console.log('\n✅ Complete! Knowledge base is ready.\n');
    console.log('Next steps:');
    console.log('1. Run: npm run db:stats');
    console.log('2. Visit: http://localhost:3001/rj-faq');
    console.log('3. Login and browse all documents!\n');
  }
}

main().catch(console.error);







