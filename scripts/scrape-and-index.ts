#!/usr/bin/env tsx

/**
 * Complete World Bank Scraper Pipeline
 * 
 * 1. Scrapes World Bank documents (2024+)
 * 2. Saves to local files with full metadata
 * 3. Indexes in Supabase database with tags
 * 4. Generates reports and reference maps
 */

import { WorldBankStrategyScraper } from './worldbank-scraper';
import { WorldBankDB } from '../lib/worldbank-db';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║   World Bank Strategy Scraper & Database Indexer         ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  // Parse command line arguments
  const args = process.argv.slice(2);
  const maxDocs = args.includes('--max') 
    ? parseInt(args[args.indexOf('--max') + 1]) 
    : 10; // Default to 10 for testing

  console.log(`⚙️  Configuration:`);
  console.log(`   Max Documents: ${maxDocs}`);
  console.log(`   Min Date: 2024-01-01 (only 2024+ documents)`);
  console.log(`   Output: data/worldbank-strategy/`);
  console.log(`   Database: Supabase\n`);

  const startTime = Date.now();

  try {
    // Step 1: Scrape documents
    console.log('\n📥 STEP 1: Scraping World Bank documents...\n');
    
    const scraper = new WorldBankStrategyScraper({
      outputDir: path.join(process.cwd(), 'data', 'worldbank-strategy'),
      maxDocuments: maxDocs,
      includePDFs: true,
      downloadFiles: true,
      trackReferences: true,
      minDate: '2024-01-01'
    });
    
    await scraper.scrape();
    
    // Step 2: Load scraped documents
    console.log('\n📂 STEP 2: Loading scraped documents...\n');
    
    const documentsPath = path.join(process.cwd(), 'data', 'worldbank-strategy', 'documents.json');
    const documentsJson = await fs.readFile(documentsPath, 'utf-8');
    const documents = JSON.parse(documentsJson);
    
    console.log(`✅ Loaded ${documents.length} documents from file`);
    
    // Step 3: Initialize database
    console.log('\n🗄️  STEP 3: Initializing database...\n');
    
    const db = new WorldBankDB();
    
    // Create table if it doesn't exist
    try {
      await db.createTable();
    } catch (error) {
      console.log('⚠️  Table creation skipped (may already exist)');
    }
    
    // Step 4: Save to database
    console.log('\n💾 STEP 4: Saving to database with full indexing...\n');
    
    await db.saveDocuments(documents);
    
    // Step 5: Verify and show stats
    console.log('\n📊 STEP 5: Verification & Statistics...\n');
    
    const stats = await db.getStats();
    
    console.log('Database Statistics:');
    console.log(`  Total Documents: ${stats.total}`);
    console.log(`  Date Range: ${stats.dateRange.earliest} to ${stats.dateRange.latest}`);
    console.log('\n  By Type:');
    Object.entries(stats.byType).forEach(([type, count]) => {
      console.log(`    - ${type}: ${count}`);
    });
    console.log('\n  By Document Tag:');
    Object.entries(stats.byDocType).forEach(([type, count]) => {
      console.log(`    - ${type}: ${count}`);
    });
    console.log('\n  By Priority:');
    Object.entries(stats.byPriority).forEach(([priority, count]) => {
      console.log(`    - ${priority}: ${count}`);
    });
    
    // Step 6: Test search functionality
    console.log('\n🔍 STEP 6: Testing search functionality...\n');
    
    // Test tag search
    const bangaDocs = await db.searchByTags({
      authors: ['Ajay Banga']
    });
    console.log(`  Found ${bangaDocs.length} documents by Ajay Banga`);
    
    const climateDocs = await db.searchByTags({
      sectors: ['Climate']
    });
    console.log(`  Found ${climateDocs.length} climate-related documents`);
    
    const highPriority = await db.searchByTags({
      priority: 'high'
    });
    console.log(`  Found ${highPriority.length} high-priority documents`);
    
    // Final summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║                    ✅ COMPLETE SUCCESS                    ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log(`\n⏱️  Total time: ${duration}s`);
    console.log(`📁 Local files: data/worldbank-strategy/`);
    console.log(`🗄️  Database: worldbank_documents table`);
    console.log(`📊 Indexed: ${documents.length} documents with full tagging`);
    console.log(`\n✅ All documents:`);
    console.log(`   - Downloaded and saved locally`);
    console.log(`   - Indexed in Supabase database`);
    console.log(`   - Tagged with comprehensive metadata`);
    console.log(`   - Source references tracked`);
    console.log(`   - Searchable by tags, sectors, initiatives, authors`);
    console.log(`\nNext steps:`);
    console.log(`  1. Review: data/worldbank-strategy/README.md`);
    console.log(`  2. Check database: worldbank_documents table`);
    console.log(`  3. Test search: import { WorldBankDB } from '@/lib/worldbank-db'`);
    console.log(`  4. Integrate with AI agent\n`);
    
  } catch (error) {
    console.error('\n❌ Pipeline failed:', error);
    process.exit(1);
  }
}

main();

