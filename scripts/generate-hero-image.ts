/**
 * Generate Hero Image using DALL-E 3
 * Run: npx tsx scripts/generate-hero-image.ts
 */

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import https from 'https';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function downloadImage(url: string, filepath: string) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve(filepath);
      });
      fileStream.on('error', reject);
    });
  });
}

async function generateHeroImage() {
  try {
    console.log('🎨 Generating hero image with DALL-E 3...');
    
    const prompt = `A photorealistic wide banner image depicting global development and international cooperation in official World Bank style. 

The composition features diverse international professionals (African, Asian, European, Latin American) collaborating on development plans with tablets and documents in the foreground. 

In the middle ground, show modern sustainable infrastructure: solar panels on buildings, wind turbines, clean water facilities, and schools.

In the background, a subtle translucent globe hologram showing data connections between continents with soft blue light.

Color palette: World Bank blue (#0071bc) dominant, with accents of green for sustainability, warm earth tones for community, and white for clarity.

Golden hour natural lighting from the left creating professional warm ambiance. Highly detailed photorealistic style, sharp foreground, softer background. Clean, modern, inspiring, action-oriented mood.

No text, no logos - pure visual storytelling of global development partnership.`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1792x1024", // Closest to 16:9 ratio for wide banner
      quality: "hd",
      style: "natural"
    });

    const imageUrl = response.data[0].url;
    
    if (!imageUrl) {
      throw new Error('No image URL returned');
    }

    console.log('✅ Image generated!');
    console.log('🔗 URL:', imageUrl);

    // Download the image
    const publicDir = path.join(process.cwd(), 'public');
    const imagePath = path.join(publicDir, 'hero-global-development.jpg');

    console.log('⬇️  Downloading image to public folder...');
    await downloadImage(imageUrl, imagePath);

    console.log('✅ Image saved to:', imagePath);
    console.log('\n🎉 Success! The hero image is ready to use.');
    console.log('📍 Location: public/hero-global-development.jpg');
    console.log('\n💡 The landing page will automatically use this image.');

  } catch (error: any) {
    console.error('❌ Error generating image:', error.message);
    
    if (error.message?.includes('API key')) {
      console.error('\n⚠️  Make sure OPENAI_API_KEY is set in your .env file');
    }
    
    process.exit(1);
  }
}

generateHeroImage();

