/**
 * Upload Hero Image to Supabase Storage
 * Run: npx tsx scripts/upload-hero-image.ts path/to/image.jpg
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadHeroImage(imagePath: string) {
  try {
    console.log('📸 Reading image file...');
    const imageBuffer = fs.readFileSync(imagePath);
    const fileName = 'hero-global-development.jpg';

    console.log('☁️  Uploading to Supabase Storage...');
    
    // Upload to Supabase Storage
    const { data, error } = await supabase
      .storage
      .from('images') // Make sure this bucket exists
      .upload(`landing/${fileName}`, imageBuffer, {
        contentType: 'image/jpeg',
        upsert: true // Replace if exists
      });

    if (error) {
      console.error('❌ Upload failed:', error);
      return;
    }

    console.log('✅ Image uploaded:', data.path);

    // Get public URL
    const { data: urlData } = supabase
      .storage
      .from('images')
      .getPublicUrl(`landing/${fileName}`);

    console.log('🌐 Public URL:', urlData.publicUrl);
    console.log('\n📋 Add this to your .env.local:');
    console.log(`NEXT_PUBLIC_HERO_IMAGE_URL=${urlData.publicUrl}`);

  } catch (err) {
    console.error('❌ Error:', err);
  }
}

// Get image path from command line
const imagePath = process.argv[2];

if (!imagePath) {
  console.error('❌ Usage: npx tsx scripts/upload-hero-image.ts path/to/image.jpg');
  process.exit(1);
}

if (!fs.existsSync(imagePath)) {
  console.error('❌ Image file not found:', imagePath);
  process.exit(1);
}

uploadHeroImage(imagePath);

