#!/usr/bin/env tsx

/**
 * CLI Runner for World Bank Strategy Document Scraper
 */

import { WorldBankStrategyScraper } from './worldbank-scraper';
import * as path from 'path';

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║     World Bank Strategy Document Scraper                 ║');
  console.log('║     Collecting strategic documents and initiatives       ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  const args = process.argv.slice(2);
  const maxDocs = args.includes('--max') 
    ? parseInt(args[args.indexOf('--max') + 1]) 
    : 100;

  const scraper = new WorldBankStrategyScraper({
    outputDir: path.join(process.cwd(), 'data', 'worldbank-strategy'),
    maxDocuments: maxDocs,
    includePDFs: true
  });

  console.log(`⚙️  Configuration:`);
  console.log(`   Max Documents: ${maxDocs}`);
  console.log(`   Output: data/worldbank-strategy/`);
  console.log(`   Include PDFs: Yes\n`);

  const startTime = Date.now();

  try {
    await scraper.scrape();
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║                    ✅ SUCCESS                             ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log(`\n⏱️  Completed in ${duration}s`);
    console.log(`📁 Output: data/worldbank-strategy/`);
    console.log(`\nNext steps:`);
    console.log(`  1. Review: data/worldbank-strategy/README.md`);
    console.log(`  2. Explore: data/worldbank-strategy/documents.json`);
    console.log(`  3. Integrate into AI agent context\n`);
    
  } catch (error) {
    console.error('\n❌ Scraping failed:', error);
    process.exit(1);
  }
}

main();

