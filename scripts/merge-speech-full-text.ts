import * as fs from 'fs';
import * as path from 'path';

/**
 * Merge full speech text from cleaned_speeches/*.txt into speeches_database.json
 * This ensures the AI analysis has access to complete speech content
 */

interface Speech {
  id: number | string;
  title: string;
  date?: string;
  summary?: string;
  key_points?: string[];
  themes?: string[];
  full_text?: string;
  filename?: string;
  word_count?: number;
  reading_time?: number;
  [key: string]: any;
}

interface SpeechDatabase {
  total_speeches?: number;
  total_words?: number;
  speeches: Speech[];
}

async function mergeSpeechFullText() {
  console.log('🔄 Merging full speech text into database...\n');

  // Paths
  const speechesDbPath = path.join(process.cwd(), 'public/speeches_database.json');
  const cleanedSpeechesDir = path.join(process.cwd(), 'cleaned_speeches');

  // Load speeches database
  const speechesDb: SpeechDatabase = JSON.parse(
    fs.readFileSync(speechesDbPath, 'utf-8')
  );

  console.log(`📊 Current database: ${speechesDb.speeches?.length || 0} speeches\n`);

  // Get all cleaned speech text files
  const textFiles = fs.readdirSync(cleanedSpeechesDir)
    .filter(f => f.endsWith('.txt'))
    .sort();

  console.log(`📁 Found ${textFiles.length} text files in cleaned_speeches/\n`);

  let mergedCount = 0;
  let totalWords = 0;

  // Process each text file
  for (const textFile of textFiles) {
    const textPath = path.join(cleanedSpeechesDir, textFile);
    const fullText = fs.readFileSync(textPath, 'utf-8').trim();
    
    // Extract number from filename (e.g., "01_speech.txt" -> "01")
    const fileNumber = textFile.match(/^(\d+)_/)?.[1];
    
    if (!fileNumber) {
      console.log(`⚠️  Skipping ${textFile} - no number prefix`);
      continue;
    }

    // Find matching speech in database
    const speechIndex = speechesDb.speeches.findIndex(s => {
      // Try matching by ID number or filename
      const speechId = String(s.id).padStart(2, '0');
      const speechFilename = s.filename?.match(/^(\d+)_/)?.[1];
      return speechId === fileNumber || speechFilename === fileNumber;
    });

    if (speechIndex >= 0) {
      const speech = speechesDb.speeches[speechIndex];
      
      // Add full text
      speech.full_text = fullText;
      
      // Update word count
      const words = fullText.split(/\s+/).length;
      speech.word_count = words;
      totalWords += words;
      
      // Calculate reading time (avg 200 words per minute)
      speech.reading_time = Math.ceil(words / 200);
      
      console.log(`✅ Merged ${textFile} → Speech #${speech.id}`);
      console.log(`   Words: ${words.toLocaleString()} | Reading time: ${speech.reading_time} min`);
      
      mergedCount++;
    } else {
      console.log(`⚠️  No match found for ${textFile}`);
    }
  }

  // Update database stats
  speechesDb.total_speeches = speechesDb.speeches.length;
  speechesDb.total_words = totalWords;

  // Save updated database
  fs.writeFileSync(
    speechesDbPath,
    JSON.stringify(speechesDb, null, 2),
    'utf-8'
  );

  console.log('\n' + '='.repeat(60));
  console.log('✅ MERGE COMPLETE');
  console.log('='.repeat(60));
  console.log(`Merged: ${mergedCount}/${textFiles.length} speeches`);
  console.log(`Total words: ${totalWords.toLocaleString()}`);
  console.log(`Average words per speech: ${Math.round(totalWords / mergedCount).toLocaleString()}`);
  console.log(`\n💾 Updated: ${speechesDbPath}`);
}

mergeSpeechFullText().catch(console.error);






