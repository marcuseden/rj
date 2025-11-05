/**
 * Complete RJ Banga Scraper
 * Fetches ALL RJ Banga speeches from World Bank API and saves to Supabase
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

// World Bank API endpoint for RJ Banga content
const API_URL = 'https://search.worldbank.org/api/v2/everything?format=json&fl=experts&sq=(experts.name:(masterupi:%22610586%22)OR(masterupi:%22000610586%22)%20OR%20(keywd:%22People:ajay-banga%22))&rows=150&fl=*&fct=status_exact,%20displayconttype_exact,%20lang_exact&srt=master_date&order=desc&apilang=en&lang_exact=English&os=0';

async function fetchRJBangaSpeeches() {
  console.log('═══════════════════════════════════════');
  console.log('  SCRAPING RJ BANGA SPEECHES');
  console.log('═══════════════════════════════════════\n');

  console.log('📡 Fetching from World Bank API...\n');

  const response = await fetch(API_URL);
  const data = await response.json();

  const everything = data.everything;
  
  if (!everything) {
    console.log('❌ No documents found!');
    return [];
  }

  const documents = Object.values(everything).filter((doc: any) => doc.id);
  console.log(`✓ Found ${documents.length} documents\n`);

  const speeches = documents
    .filter((doc: any) => 
      doc.masterconttype === "President's Speech" || 
      doc.docty_exact === "President's Speech"
    )
    .map((doc: any) => ({
      id: doc.id,
      title: doc.display_title || doc.title,
      url: doc.url,
      summary: doc.abstracts || doc.ml_abstracts || doc.desc || 'No summary available',
      date: doc.master_date ? doc.master_date.split('T')[0] : new Date().toISOString().split('T')[0],
      type: 'speech',
      sectors: extractSectors(doc),
      regions: extractRegions(doc),
      keywords: extractKeywords(doc),
      wordCount: 200, // Default estimate
      language: doc.lang_exact || 'English'
    }));

  console.log(`✓ Filtered to ${speeches.length} speeches\n`);
  
  return speeches;
}

function extractSectors(doc: any): string[] {
  const sectors = [];
  if (doc.topic) {
    const topics = Array.isArray(doc.topic) ? doc.topic : [doc.topic];
    sectors.push(...topics);
  }
  return [...new Set(sectors)];
}

function extractRegions(doc: any): string[] {
  const regions = [];
  if (doc.count_exact) {
    const countries = Array.isArray(doc.count_exact) ? doc.count_exact : [doc.count_exact];
    regions.push(...countries);
  }
  return regions.length > 0 ? regions : ['Global'];
}

function extractKeywords(doc: any): string[] {
  const keywords: string[] = [];
  const text = `${doc.display_title} ${doc.abstractEN || ''}`.toLowerCase();
  
  const keyTerms = ['climate', 'development', 'poverty', 'reform', 'partnership', 
                    'investment', 'banga', 'financing', 'sustainable', 'energy'];
  
  keyTerms.forEach(term => {
    if (text.includes(term)) keywords.push(term);
  });
  
  return keywords;
}

async function saveToDatabase(speeches: any[]) {
  console.log('📦 Saving to Supabase...\n');

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

  for (const speech of speeches) {
    try {
      // Save to worldbank_documents
      await supabase.from('worldbank_documents').upsert({
        id: speech.id,
        title: speech.title,
        url: speech.url,
        content: speech.summary,
        summary: speech.summary,
        date: speech.date,
        type: 'speech',
        file_type: 'html',
        topics: [],
        keywords: speech.keywords,
        citations: [],
        related_documents: [],
        tags_document_type: 'speech',
        tags_content_type: 'text',
        tags_audience: ['public', 'government', 'stakeholders'],
        tags_regions: speech.regions,
        tags_sectors: speech.sectors,
        tags_initiatives: [],
        tags_authors: ['Ajay Banga'],
        tags_departments: [],
        tags_priority: 'high',
        tags_status: 'current',
        source_original_url: speech.url,
        source_scraped_from: API_URL,
        source_discovered_at: new Date().toISOString(),
        source_type: 'api',
        metadata_language: speech.language,
        metadata_word_count: speech.wordCount,
        metadata_reading_time: Math.ceil(speech.wordCount / 200),
        scraped_at: new Date().toISOString(),
      }, { onConflict: 'id' });

      // Save to speeches table
      await supabase.from('speeches').upsert({
        id: randomUUID(),
        ceo_profile_id: ceoProfileId,
        title: speech.title,
        content: speech.summary,
        date: speech.date,
        word_count: speech.wordCount,
        source_url: speech.url,
      });

      console.log(`✓ ${speech.title.substring(0, 60)}...`);
      savedCount++;
      
    } catch (error: any) {
      console.error(`✗ Error: ${error.message}`);
    }
  }

  // Update CEO profile
  await supabase
    .from('ceo_profiles')
    .update({ 
      total_speeches: savedCount,
      last_activity: new Date().toISOString()
    })
    .eq('id', ceoProfileId);

  console.log(`\n✅ Saved ${savedCount}/${speeches.length} speeches!`);
}

async function main() {
  const speeches = await fetchRJBangaSpeeches();
  
  if (speeches.length > 0) {
    await saveToDatabase(speeches);
    console.log('\n✅ Complete! Check your Supabase dashboard.\n');
  }
}

main().catch(console.error);

