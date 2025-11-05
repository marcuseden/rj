/**
 * RJ Banga Speech Scraper with Supabase Integration
 * Scrapes RJ Banga speeches and saves to both local files and Supabase database
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { randomUUID } from 'crypto';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!');
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface Speech {
  id: string;
  title: string;
  url: string;
  content: string;
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
    departments?: string[];
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
  scrapedAt: string;
}

async function getCEOProfileId(): Promise<string | null> {
  const { data, error } = await supabase
    .from('ceo_profiles')
    .select('id')
    .eq('name', 'Ajay Banga')
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error getting CEO profile:', error);
    return null;
  }

  return data?.id || null;
}

async function saveToDatabase(speeches: Speech[]) {
  console.log('\n📦 Saving to Supabase...');

  const ceoProfileId = await getCEOProfileId();
  if (!ceoProfileId) {
    console.error('❌ CEO profile not found. Run the schema SQL first!');
    return;
  }

  let savedCount = 0;
  let errorCount = 0;

  for (const speech of speeches) {
    try {
      // 1. Save to worldbank_documents table
      const { error: docError } = await supabase
        .from('worldbank_documents')
        .upsert({
          id: speech.id,
          title: speech.title,
          url: speech.url,
          content: speech.content || speech.summary || 'No content available',
          summary: speech.summary,
          date: speech.date,
          type: speech.type,
          file_type: 'html',
          topics: speech.topics,
          keywords: speech.keywords,
          citations: speech.citations || [],
          related_documents: speech.related_documents || [],
          tags_document_type: speech.tags.documentType,
          tags_content_type: speech.tags.contentType,
          tags_audience: speech.tags.audience,
          tags_regions: speech.regions,
          tags_sectors: speech.sectors,
          tags_initiatives: speech.initiatives,
          tags_authors: speech.tags.authors,
          tags_departments: speech.tags.departments || [],
          tags_priority: speech.tags.priority,
          tags_status: speech.tags.status,
          source_original_url: speech.sourceReference.originalUrl,
          source_scraped_from: speech.sourceReference.scrapedFrom,
          source_parent_page: null,
          source_link_text: null,
          source_discovered_at: speech.sourceReference.discoveredAt,
          source_type: speech.sourceReference.sourceType,
          metadata_language: speech.metadata.language,
          metadata_word_count: speech.metadata.wordCount,
          metadata_reading_time: speech.metadata.readingTime,
          scraped_at: speech.scrapedAt,
        }, {
          onConflict: 'id'
        });

      if (docError) throw docError;

      // 2. Also save to speeches table for simpler queries (use UUID)
      const speechUUID = randomUUID();
      const { error: speechError } = await supabase
        .from('speeches')
        .insert({
          id: speechUUID,
          ceo_profile_id: ceoProfileId,
          title: speech.title,
          content: speech.content || speech.summary || 'No content available',
          date: speech.date,
          word_count: speech.metadata.wordCount,
          source_url: speech.url,
        });

      if (speechError) throw speechError;

      console.log(`✓ Saved: ${speech.title.substring(0, 60)}...`);
      savedCount++;
      
    } catch (error: any) {
      console.error(`✗ Error saving ${speech.title}:`, error.message);
      errorCount++;
    }
  }

  console.log(`\n✅ Saved ${savedCount}/${speeches.length} speeches to database`);
  if (errorCount > 0) {
    console.log(`❌ Failed: ${errorCount} speeches`);
  }

  // Update CEO profile speech count
  const { error: updateError } = await supabase
    .from('ceo_profiles')
    .update({ 
      total_speeches: speeches.length,
      last_activity: new Date().toISOString()
    })
    .eq('id', ceoProfileId);

  if (updateError) {
    console.error('Error updating CEO profile:', updateError);
  }
}

async function main() {
  console.log('═══════════════════════════════════════');
  console.log('  RJ BANGA SPEECH SCRAPER → SUPABASE');
  console.log('═══════════════════════════════════════\n');

  // Load existing scraped data
  const dataPath = path.join(process.cwd(), 'data/worldbank-strategy/documents.json');
  
  if (!fs.existsSync(dataPath)) {
    console.error('❌ No scraped data found!');
    console.error('Run the worldbank scraper first to generate data/worldbank-strategy/documents.json');
    process.exit(1);
  }

  const speeches: Speech[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  
  console.log(`📄 Loaded ${speeches.length} speeches from local files\n`);

  // Save to Supabase
  await saveToDatabase(speeches);

  console.log('\n✅ Complete! Speeches saved to Supabase.');
  console.log('\nVerify in Supabase dashboard:');
  console.log('- worldbank_documents table');
  console.log('- speeches table');
}

main().catch(console.error);

