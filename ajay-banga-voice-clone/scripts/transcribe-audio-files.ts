/**
 * Audio File Transcription
 * Transcribes all MP3/WAV files in data/audio/ using OpenAI Whisper
 */

import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { randomUUID } from 'crypto';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const openaiKey = process.env.OPENAI_API_KEY!;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!openaiKey) {
  console.error('❌ Missing OPENAI_API_KEY!');
  process.exit(1);
}

const openai = new OpenAI({ apiKey: openaiKey });
const supabase = createClient(supabaseUrl, supabaseKey);

async function transcribeFile(audioPath: string, filename: string) {
  console.log(`\n🎤 Transcribing: ${filename}`);
  console.log(`   Size: ${(fs.statSync(audioPath).size / 1024 / 1024).toFixed(2)} MB`);
  
  try {
    const audioFile = fs.createReadStream(audioPath) as any;
    
    console.log('   ⏳ Sending to OpenAI Whisper...');
    
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en',
      response_format: 'verbose_json',
      timestamp_granularities: ['segment']
    });

    const text = transcription.text;
    const wordCount = text.split(/\s+/).length;

    console.log(`   ✅ Transcription complete!`);
    console.log(`   📊 Words: ${wordCount.toLocaleString()}`);
    console.log(`   📖 Reading time: ${Math.ceil(wordCount / 200)} minutes`);
    
    return { text, wordCount, duration: transcription.duration };
    
  } catch (error: any) {
    console.error(`   ✗ Error: ${error.message}`);
    return null;
  }
}

async function saveToDatabase(filename: string, transcript: string, wordCount: number) {
  console.log(`\n💾 Saving to database...`);
  
  try {
    const { data: ceoData } = await supabase
      .from('ceo_profiles')
      .select('id')
      .eq('name', 'Ajay Banga')
      .single();

    if (!ceoData) {
      console.error('   ✗ CEO profile not found');
      return;
    }

    const title = filename
      .replace(/\.mp3$/i, '')
      .replace(/\.wav$/i, '')
      .replace(/-/g, ' ')
      .replace(/_/g, ' ')
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    const docId = randomUUID();
    const speechId = randomUUID();

    // Save to worldbank_documents
    await supabase.from('worldbank_documents').insert({
      id: docId,
      title: `Video Transcript: ${title}`,
      url: `local://audio/${filename}`,
      content: transcript,
      summary: transcript.substring(0, 500) + '...',
      date: new Date().toISOString().split('T')[0],
      type: 'speech',
      file_type: 'audio',
      topics: ['Video Transcript'],
      keywords: ['video', 'transcript', 'audio'],
      citations: [],
      related_documents: [],
      tags_document_type: 'Video Transcript',
      tags_content_type: 'audio',
      tags_audience: ['public'],
      tags_regions: ['Global'],
      tags_sectors: [],
      tags_initiatives: [],
      tags_authors: ['Ajay Banga'],
      tags_departments: [],
      tags_priority: 'high',
      tags_status: 'current',
      source_original_url: `local://audio/${filename}`,
      source_scraped_from: 'Video Transcription (Whisper)',
      source_discovered_at: new Date().toISOString(),
      source_type: 'video',
      metadata_language: 'English',
      metadata_word_count: wordCount,
      metadata_reading_time: Math.ceil(wordCount / 200),
      scraped_at: new Date().toISOString(),
    });

    // Save to speeches table
    await supabase.from('speeches').insert({
      id: speechId,
      ceo_profile_id: ceoData.id,
      title: `Video Transcript: ${title}`,
      content: transcript,
      date: new Date().toISOString().split('T')[0],
      word_count: wordCount,
      source_url: `local://audio/${filename}`,
    });

    console.log(`   ✅ Saved to database`);
    
  } catch (error: any) {
    console.error(`   ✗ Error saving: ${error.message}`);
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  AUDIO FILE TRANSCRIPTION');
  console.log('═══════════════════════════════════════════════════════════\n');

  const audioDir = path.join(process.cwd(), 'data', 'audio');
  
  if (!fs.existsSync(audioDir)) {
    console.log('❌ data/audio/ directory not found!');
    console.log('Create it and add MP3 files to transcribe.\n');
    return;
  }

  const audioFiles = fs.readdirSync(audioDir)
    .filter(f => f.endsWith('.mp3') || f.endsWith('.wav') || f.endsWith('.m4a'));

  if (audioFiles.length === 0) {
    console.log('❌ No audio files found in data/audio/');
    console.log('\nDownload some videos first:');
    console.log('  yt-dlp -x --audio-format mp3 -o "data/audio/%(title)s.mp3" "YOUTUBE_URL"\n');
    return;
  }

  console.log(`✓ Found ${audioFiles.length} audio file(s)\n`);

  let transcribed = 0;
  let failed = 0;

  for (const audioFile of audioFiles) {
    const audioPath = path.join(audioDir, audioFile);
    const result = await transcribeFile(audioPath, audioFile);
    
    if (result) {
      // Save transcript to file
      const transcriptPath = path.join(process.cwd(), 'data', 'transcripts', audioFile.replace(/\.(mp3|wav|m4a)$/i, '.txt'));
      fs.mkdirSync(path.dirname(transcriptPath), { recursive: true });
      fs.writeFileSync(transcriptPath, result.text);
      console.log(`   📄 Saved: ${transcriptPath}`);
      
      // Save to database
      await saveToDatabase(audioFile, result.text, result.wordCount);
      
      transcribed++;
    } else {
      failed++;
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  TRANSCRIPTION COMPLETE');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log(`✅ Successfully transcribed: ${transcribed}`);
  if (failed > 0) {
    console.log(`❌ Failed: ${failed}`);
  }
  console.log('\nRun: npm run db:stats to see updated counts\n');
}

main().catch(console.error);







