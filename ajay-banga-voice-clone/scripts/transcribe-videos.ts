/**
 * VIDEO TRANSCRIPTION SCRIPT
 * Downloads videos and transcribes them using OpenAI Whisper API
 * Saves transcripts to database with full tagging
 */

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { randomUUID } from 'crypto';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const openaiKey = process.env.OPENAI_API_KEY!;

if (!supabaseUrl || !supabaseKey || !openaiKey) {
  console.error('❌ Missing credentials!');
  console.error('Need: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const openai = new OpenAI({ apiKey: openaiKey });

interface VideoDocument {
  id: string;
  title: string;
  videoUrl: string;
  description: string;
  date: string;
  duration?: string;
}

async function findVideoDocuments(): Promise<VideoDocument[]> {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  FINDING RJ BANGA VIDEOS');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Search for videos in World Bank API
  const apiUrl = 'https://search.worldbank.org/api/v2/everything?format=json&qterm=ajay+banga&docty_exact=Video&rows=50&fl=*&srt=master_date&order=desc&apilang=en';
  
  const response = await fetch(apiUrl);
  const data = await response.json();
  
  const everything = data.everything;
  
  if (!everything) {
    console.log('❌ No videos found');
    return [];
  }

  const videos = Object.values(everything)
    .filter((doc: any) => doc.id && doc.url)
    .map((doc: any) => ({
      id: doc.id,
      title: doc.display_title || doc.title || 'Untitled Video',
      videoUrl: doc.url,
      description: doc.abstracts || doc.desc || '',
      date: doc.master_date ? doc.master_date.split('T')[0] : new Date().toISOString().split('T')[0],
      duration: doc.runtime || ''
    }));

  console.log(`✓ Found ${videos.length} video documents\n`);
  
  videos.forEach((v: any) => {
    console.log(`   📹 ${v.title.substring(0, 60)}...`);
    console.log(`      URL: ${v.videoUrl}`);
    console.log(`      Date: ${v.date}\n`);
  });

  return videos;
}

async function transcribeVideoFromUrl(videoUrl: string, videoTitle: string): Promise<string | null> {
  console.log(`\n🎤 Transcribing: ${videoTitle.substring(0, 60)}...`);
  
  try {
    // Note: This requires the video to be downloadable as an audio file
    // For YouTube videos, you'd need to use yt-dlp first to download audio
    
    console.log('   ℹ️  For YouTube videos, download audio first using:');
    console.log(`      yt-dlp -x --audio-format mp3 "${videoUrl}"`);
    console.log('   ℹ️  Then transcribe the .mp3 file\n');
    
    // This is a placeholder - actual implementation would:
    // 1. Download video/audio
    // 2. Convert to supported format (mp3, mp4, wav, etc.)
    // 3. Upload to OpenAI Whisper
    // 4. Get transcript
    
    return null;
    
  } catch (error: any) {
    console.error(`   ✗ Error: ${error.message}`);
    return null;
  }
}

async function transcribeAudioFile(audioPath: string): Promise<string | null> {
  try {
    console.log(`\n🎤 Transcribing audio file...`);
    
    const audioFile = fs.createReadStream(audioPath);
    
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en',
      response_format: 'verbose_json',
      timestamp_granularities: ['segment']
    });

    console.log(`   ✓ Transcription complete!`);
    console.log(`   Words: ~${transcription.text.split(' ').length}`);
    
    return transcription.text;
    
  } catch (error: any) {
    console.error(`   ✗ Error: ${error.message}`);
    return null;
  }
}

async function saveTranscriptToDatabase(video: VideoDocument, transcript: string) {
  try {
    const { data: ceoData } = await supabase
      .from('ceo_profiles')
      .select('id')
      .eq('name', 'Ajay Banga')
      .single();

    if (!ceoData) return;

    const wordCount = transcript.split(/\s+/).length;

    // Save to worldbank_documents
    await supabase.from('worldbank_documents').upsert({
      id: video.id,
      title: video.title,
      url: video.videoUrl,
      content: transcript,
      summary: video.description,
      date: video.date,
      type: 'speech',
      file_type: 'video',
      topics: [],
      keywords: ['video', 'transcript'],
      citations: [],
      related_documents: [],
      tags_document_type: 'Video Transcript',
      tags_content_type: 'video',
      tags_audience: ['public'],
      tags_regions: ['Global'],
      tags_sectors: [],
      tags_initiatives: [],
      tags_authors: ['Ajay Banga'],
      tags_departments: [],
      tags_priority: 'high',
      tags_status: 'current',
      source_original_url: video.videoUrl,
      source_scraped_from: 'Video Transcription',
      source_discovered_at: new Date().toISOString(),
      source_type: 'video',
      metadata_language: 'English',
      metadata_word_count: wordCount,
      metadata_reading_time: Math.ceil(wordCount / 200),
      scraped_at: new Date().toISOString(),
    });

    // Save to speeches table
    await supabase.from('speeches').insert({
      id: randomUUID(),
      ceo_profile_id: ceoData.id,
      title: `${video.title} (Video Transcript)`,
      content: transcript,
      date: video.date,
      word_count: wordCount,
      source_url: video.videoUrl,
    });

    console.log(`   ✅ Saved transcript to database`);
    
    // Save transcript to file
    const transcriptPath = path.join(process.cwd(), 'data', 'transcripts', `${video.id}.txt`);
    fs.mkdirSync(path.dirname(transcriptPath), { recursive: true });
    fs.writeFileSync(transcriptPath, transcript);
    console.log(`   ✅ Saved to: ${transcriptPath}`);
    
  } catch (error: any) {
    console.error(`   ✗ Error saving: ${error.message}`);
  }
}

async function main() {
  const videos = await findVideoDocuments();
  
  if (videos.length === 0) {
    console.log('No videos found to transcribe.\n');
    return;
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('  VIDEO TRANSCRIPTION GUIDE');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  console.log('To transcribe these videos:\n');
  
  console.log('Option 1: Download from YouTube');
  console.log('---------------------------------');
  console.log('Install yt-dlp:');
  console.log('  brew install yt-dlp\n');
  
  console.log('Download audio from each video:');
  videos.slice(0, 5).forEach((v, i) => {
    console.log(`  ${i + 1}. yt-dlp -x --audio-format mp3 -o "video_${v.id}.mp3" "${v.videoUrl}"`);
  });
  
  console.log('\nOption 2: Manual Process');
  console.log('------------------------');
  console.log('1. Find videos on YouTube:');
  console.log('   Search: "Ajay Banga World Bank"');
  console.log('2. Use online tool: https://ytmp3.nu/');
  console.log('3. Download MP3 files');
  console.log('4. Place in data/audio/ folder\n');
  
  console.log('Option 3: Transcribe Audio Files');
  console.log('----------------------------------');
  console.log('If you have audio files in data/audio/, run:\n');
  
  const audioDir = path.join(process.cwd(), 'data', 'audio');
  if (fs.existsSync(audioDir)) {
    const audioFiles = fs.readdirSync(audioDir).filter(f => f.endsWith('.mp3') || f.endsWith('.wav'));
    
    if (audioFiles.length > 0) {
      console.log(`Found ${audioFiles.length} audio files ready to transcribe:\n`);
      
      for (const audioFile of audioFiles) {
        const audioPath = path.join(audioDir, audioFile);
        console.log(`📂 Transcribing: ${audioFile}...`);
        
        const transcript = await transcribeAudioFile(audioPath);
        
        if (transcript) {
          // Save transcript
          const transcriptPath = path.join(process.cwd(), 'data', 'transcripts', audioFile.replace(/\.(mp3|wav)$/, '.txt'));
          fs.mkdirSync(path.dirname(transcriptPath), { recursive: true });
          fs.writeFileSync(transcriptPath, transcript);
          
          console.log(`   ✅ Saved: ${transcriptPath}`);
          console.log(`   Words: ${transcript.split(' ').length}\n`);
          
          // Try to match with a video and save to DB
          const matchingVideo = videos.find(v => 
            audioFile.toLowerCase().includes(v.id.toLowerCase()) ||
            audioFile.toLowerCase().includes(v.title.toLowerCase().substring(0, 20))
          );
          
          if (matchingVideo) {
            await saveTranscriptToDatabase(matchingVideo, transcript);
          } else {
            // Save as standalone speech
            const { data: ceoData } = await supabase
              .from('ceo_profiles')
              .select('id')
              .eq('name', 'Ajay Banga')
              .single();

            if (ceoData) {
              await supabase.from('speeches').insert({
                id: randomUUID(),
                ceo_profile_id: ceoData.id,
                title: `Video Transcript: ${audioFile.replace(/\.(mp3|wav)$/, '')}`,
                content: transcript,
                date: new Date().toISOString().split('T')[0],
                word_count: transcript.split(/\s+/).length,
                source_url: `local:${audioFile}`,
              });
              console.log(`   ✅ Saved to database as new speech\n`);
            }
          }
        }
      }
    } else {
      console.log('No audio files found in data/audio/');
      console.log('Download some first using yt-dlp or manual download\n');
    }
  } else {
    console.log('Create data/audio/ folder and add MP3 files to transcribe\n');
  }

  console.log('═══════════════════════════════════════════════════════════\n');
}

main().catch(console.error);







