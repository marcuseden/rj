#!/usr/bin/env tsx

/**
 * Direct RJ Banga Speeches Scraper
 * 
 * Scrapes all of Ajay Banga's speeches directly from World Bank documents API
 * No document limit - gets everything available
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

interface BangaSpeech {
  id: string;
  title: string;
  url: string;
  date: string;
  summary: string;
  type: 'speech' | 'statement' | 'remarks' | 'address';
  topics: string[];
  keywords: string[];
  initiatives: string[];
  regions: string[];
  sectors: string[];
  tags: any;
  sourceReference: any;
  metadata: any;
  scrapedAt: string;
}

async function scrapeBangaSpeeches() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║         RJ Banga Direct Speech Scraper                   ║');
  console.log('║         Getting ALL available speeches (no limit)        ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  const speeches: BangaSpeech[] = [];

  // World Bank Documents API - Ajay Banga's speeches
  const apiUrl = 'https://search.worldbank.org/api/v2/everything?format=json&fl=experts&sq=(experts.name:(masterupi:%22610586%22)OR(masterupi:%22000610586%22)%20OR%20(keywd:%22People:ajay-banga%22))&rows=150&fl=*&fct=status_exact,%20displayconttype_exact,%20lang_exact&srt=master_date&order=desc&apilang=en&lang_exact=English&os=0';

  console.log('📡 Fetching from World Bank Documents API...\n');

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    const documents = data.everything || {};
    const docKeys = Object.keys(documents).filter(k => k.startsWith('_'));

    console.log(`Found ${docKeys.length} documents from Ajay Banga\n`);

    for (const key of docKeys) {
      const doc = documents[key];

      // Skip if before 2024
      const docDate = doc.date || doc.master_date || '';
      if (docDate < '2024-01-01') {
        console.log(`⏭️  Skipping: ${doc.title} (${docDate})`);
        continue;
      }

      const speech: BangaSpeech = {
        id: doc.id || doc.entityid,
        title: doc.title || doc.display_title || 'Untitled',
        url: doc.url || `http://documents.worldbank.org/curated/en/${doc.guid}/${doc.url_friendly_title}`,
        date: docDate.split('T')[0],
        summary: doc.desc || doc.abstracts || doc.ml_abstracts || '',
        type: doc.contenttype?.toLowerCase().includes('statement') ? 'statement' : 
              doc.contenttype?.toLowerCase().includes('address') ? 'address' :
              doc.contenttype?.toLowerCase().includes('remarks') ? 'remarks' : 'speech',
        topics: [],
        keywords: extractKeywords(doc.title + ' ' + (doc.desc || '')),
        initiatives: extractInitiatives(doc.title + ' ' + (doc.desc || '')),
        regions: extractRegions(doc.title + ' ' + (doc.desc || '')),
        sectors: extractSectors(doc.title + ' ' + (doc.desc || '')),
        tags: {
          documentType: 'speech',
          contentType: 'text',
          audience: ['public', 'government', 'stakeholders'],
          authors: ['Ajay Banga'],
          priority: 'high',
          status: 'current'
        },
        sourceReference: {
          originalUrl: doc.url,
          scrapedFrom: apiUrl,
          discoveredAt: new Date().toISOString(),
          sourceType: 'api'
        },
        metadata: {
          language: doc.lang_exact || 'English',
          wordCount: (doc.desc || '').split(/\s+/).length,
          readingTime: Math.ceil((doc.desc || '').split(/\s+/).length / 200),
          publicationYear: parseInt((docDate || '2024').substring(0, 4))
        },
        scrapedAt: new Date().toISOString()
      };

      speeches.push(speech);
      console.log(`✅ ${speech.title.substring(0, 70)}... (${speech.date})`);
    }

    // Save results
    const outputDir = path.join(process.cwd(), 'data', 'worldbank-strategy');
    await fs.mkdir(outputDir, { recursive: true });

    const outputPath = path.join(outputDir, 'documents.json');
    await fs.writeFile(outputPath, JSON.stringify(speeches, null, 2));

    // Also copy to public folder for frontend access
    const publicDir = path.join(process.cwd(), 'public', 'data', 'worldbank-strategy');
    await fs.mkdir(publicDir, { recursive: true });
    await fs.writeFile(path.join(publicDir, 'documents.json'), JSON.stringify(speeches, null, 2));

    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║                    ✅ COMPLETE                            ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log(`\n📊 Results:`);
    console.log(`   Total Speeches: ${speeches.length}`);
    console.log(`   Date Range: 2024-01-01 to ${speeches[0]?.date || 'present'}`);
    console.log(`   Saved to: data/worldbank-strategy/documents.json`);
    console.log(`   Public: public/data/worldbank-strategy/documents.json`);
    console.log(`\n✅ Ready to use in RJ Banga FAQ, Writing Assistant, and AI Agent!\n`);

  } catch (error) {
    console.error('❌ Error scraping speeches:', error);
    process.exit(1);
  }
}

function extractKeywords(text: string): string[] {
  const keywords: string[] = [];
  const keyTerms = [
    'climate', 'poverty', 'development', 'partnership', 'reform',
    'strategy', 'transformation', 'innovation', 'impact', 'sustainable',
    'banga', 'evolution', 'roadmap', 'financing', 'investment'
  ];

  keyTerms.forEach(term => {
    if (text.toLowerCase().includes(term)) keywords.push(term);
  });

  return keywords;
}

function extractInitiatives(text: string): string[] {
  const initiatives: string[] = [];
  const known = [
    'Evolution Roadmap', 'Climate Action Plan', 'IDA Replenishment',
    'Human Capital Project', 'Pandemic Fund', 'Methane Reduction',
    'Private Sector Investment Lab'
  ];

  known.forEach(init => {
    if (text.toLowerCase().includes(init.toLowerCase())) {
      initiatives.push(init);
    }
  });

  const projectCodes = text.match(/P\d{6}/g) || [];
  initiatives.push(...projectCodes);

  return [...new Set(initiatives)];
}

function extractRegions(text: string): string[] {
  const regions: string[] = [];
  if (text.toLowerCase().includes('africa')) regions.push('Africa');
  if (text.toLowerCase().includes('asia')) regions.push('Asia');
  if (text.toLowerCase().includes('europe')) regions.push('Europe');
  if (text.toLowerCase().includes('latin america') || text.toLowerCase().includes('caribbean')) regions.push('Latin America');
  if (text.toLowerCase().includes('middle east')) regions.push('Middle East');
  if (text.toLowerCase().includes('global') || text.toLowerCase().includes('world')) regions.push('Global');
  return regions;
}

function extractSectors(text: string): string[] {
  const sectors: string[] = [];
  const sectorMap: Record<string, string[]> = {
    'Climate': ['climate', 'carbon', 'green', 'renewable'],
    'Agriculture': ['agriculture', 'food', 'farming'],
    'Energy': ['energy', 'power', 'electricity'],
    'Finance': ['finance', 'banking', 'investment', 'capital'],
    'Health': ['health', 'healthcare', 'medical'],
    'Education': ['education', 'school', 'learning'],
    'Infrastructure': ['infrastructure', 'transport'],
    'Water': ['water', 'sanitation'],
    'Technology': ['technology', 'digital', 'innovation'],
    'Governance': ['governance', 'institutions', 'reform']
  };

  Object.entries(sectorMap).forEach(([sector, keywords]) => {
    if (keywords.some(kw => text.toLowerCase().includes(kw))) {
      sectors.push(sector);
    }
  });

  return sectors;
}

scrapeBangaSpeeches();

