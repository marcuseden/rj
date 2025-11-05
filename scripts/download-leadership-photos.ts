import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

dotenv.config({ path: '.env.local' });

const execAsync = promisify(exec);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Official World Bank leadership photo URLs
const OFFICIAL_PHOTOS: Record<string, string> = {
  'ajay-banga': 'https://www.worldbank.org/content/dam/photos/780x439/2023/jun-3/Ajay-Banga.jpg',
  'anna-bjerde': 'https://www.worldbank.org/content/dam/photos/780x439/2024/anna-bjerde.jpg',
  'axel-van-trotsenburg': 'https://www.worldbank.org/content/dam/photos/780x439/2023/Axel-van-Trotsenburg.jpg',
  'anshula-kant': 'https://www.worldbank.org/content/dam/photos/780x439/2023/Anshula-Kant.jpg',
  'indermit-gill': 'https://www.worldbank.org/content/dam/photos/780x439/2023/Indermit-Gill.jpg',
  'mamta-murthi': 'https://www.worldbank.org/content/dam/photos/780x439/2023/Mamta-Murthi.jpg',
  'christopher-stephens': 'https://www.worldbank.org/content/dam/photos/780x439/2023/Christopher-Stephens.jpg',
  'makhtar-diop': 'https://www.worldbank.org/content/dam/photos/780x439/2023/Makhtar-Diop.jpg',
  'juergen-voegele': 'https://www.worldbank.org/content/dam/photos/780x439/2024/Juergen-Voegele.jpg',
  'ferid-belhaj': 'https://www.worldbank.org/content/dam/photos/780x439/2023/Ferid-Belhaj.jpg',
  'hartwig-schafer': 'https://www.worldbank.org/content/dam/photos/780x439/2023/Hartwig-Schafer.jpg',
  'junaid-ahmad': 'https://www.worldbank.org/content/dam/photos/780x439/2023/Junaid-Ahmad.jpg',
  'arup-banerji': 'https://www.worldbank.org/content/dam/photos/780x439/2024/Arup-Banerji.jpg',
  'ernesto-silva': 'https://www.worldbank.org/content/dam/photos/780x439/2024/Ernesto-Silva.jpg',
  'hailegabriel-abegaz': 'https://www.worldbank.org/content/dam/photos/780x439/2024/Hailegabriel-Abegaz.jpg',
  'jaime-saavedra': 'https://www.worldbank.org/content/dam/photos/780x439/2023/Jaime-Saavedra.jpg',
};

async function downloadPhoto(id: string, url: string): Promise<boolean> {
  try {
    const outputPath = path.join('public/avatars', `${id}.jpg`);
    
    console.log(`  Downloading: ${url}`);
    
    // Use curl to download the image
    await execAsync(`curl -s -o "${outputPath}" "${url}"`);
    
    // Check if file was downloaded successfully
    const stats = await fs.stat(outputPath);
    if (stats.size > 1000) { // At least 1KB
      console.log(`  ✅ Downloaded (${(stats.size / 1024).toFixed(1)} KB)`);
      return true;
    } else {
      console.log(`  ⚠️  File too small, might be 404`);
      await fs.unlink(outputPath).catch(() => {});
      return false;
    }
  } catch (error) {
    console.log(`  ❌ Failed to download`);
    return false;
  }
}

async function main() {
  console.log('📸 Downloading official World Bank leadership photos...\n');

  // Ensure avatars directory exists
  await fs.mkdir('public/avatars', { recursive: true });

  // Get all people from database
  const { data: people, error } = await supabase
    .from('worldbank_orgchart')
    .select('id, name')
    .eq('data_verified', true);

  if (error) {
    console.error('❌ Error fetching people:', error);
    return;
  }

  console.log(`👥 Found ${people.length} verified people\n`);

  let downloaded = 0;
  let failed = 0;
  let updated = 0;

  for (const person of people) {
    console.log(`\n📷 Processing: ${person.name}`);
    
    const photoUrl = OFFICIAL_PHOTOS[person.id];
    
    if (!photoUrl) {
      console.log(`  ⚠️  No official photo URL configured`);
      failed++;
      continue;
    }

    const success = await downloadPhoto(person.id, photoUrl);
    
    if (success) {
      downloaded++;
      
      // Update database with local avatar path
      const { error: updateError } = await supabase
        .from('worldbank_orgchart')
        .update({
          avatar_url: `/avatars/${person.id}.jpg`,
          updated_at: new Date().toISOString()
        })
        .eq('id', person.id);

      if (!updateError) {
        console.log(`  ✅ Database updated with avatar path`);
        updated++;
      }
    } else {
      failed++;
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 PHOTO DOWNLOAD SUMMARY:');
  console.log(`${'='.repeat(60)}`);
  console.log(`✅ Downloaded: ${downloaded}`);
  console.log(`💾 Database Updated: ${updated}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📝 Total: ${people.length}`);
  console.log(`\n✨ Photos saved to: public/avatars/`);
}

main().catch(console.error);

