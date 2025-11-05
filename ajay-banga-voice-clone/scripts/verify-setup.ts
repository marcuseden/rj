/**
 * Setup Verification Script
 * Checks that all tables exist and system is ready
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log('═══════════════════════════════════════════════════════════');
console.log('  CEO ALIGNMENT CHECKER - SETUP VERIFICATION');
console.log('═══════════════════════════════════════════════════════════\n');

// Check 1: Environment Variables
console.log('1️⃣  Checking Environment Variables...');
const requiredEnvVars = [
  'NEXT_PUBLIC_ELEVENLABS_API_KEY',
  'NEXT_PUBLIC_AGENT_ID',
  'OPENAI_API_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY'
];

let envOk = true;
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`   ✓ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`   ✗ ${varName}: MISSING`);
    envOk = false;
  }
});

if (!envOk) {
  console.log('\n❌ Some environment variables are missing!');
  console.log('Update your .env.local file and try again.\n');
  process.exit(1);
}

// Check 2: Supabase Connection
console.log('\n2️⃣  Testing Supabase Connection...');
if (!supabaseUrl || !supabaseKey) {
  console.log('   ✗ Supabase credentials not set');
  console.log('   Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  // Check 3: Database Tables
  console.log('   Testing connection...');
  
  const tables = [
    'user_profiles',
    'ceo_profiles',
    'speeches',
    'analysis_history',
    'worldbank_documents'
  ];

  console.log('\n3️⃣  Checking Database Tables...');
  
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`   ✗ ${table}: ${error.message}`);
      } else {
        console.log(`   ✓ ${table}: ${count ?? 0} rows`);
      }
    } catch (error: any) {
      console.log(`   ✗ ${table}: ${error.message}`);
    }
  }

  // Check 4: CEO Profile
  console.log('\n4️⃣  Checking CEO Profile...');
  const { data: ceoData, error: ceoError } = await supabase
    .from('ceo_profiles')
    .select('*')
    .eq('name', 'Ajay Banga')
    .single();

  if (ceoError || !ceoData) {
    console.log('   ✗ Ajay Banga profile not found');
    console.log('   Run the seed data from 00_complete_schema.sql');
  } else {
    console.log(`   ✓ Found: ${ceoData.name} - ${ceoData.title}`);
    console.log(`   ✓ Total speeches: ${ceoData.total_speeches}`);
  }

  // Check 5: Local Data Files
  console.log('\n5️⃣  Checking Local Data Files...');
  
  const dataFiles = [
    'public/speeches_database.json',
    'public/banga_style_guide.json',
    'data/worldbank-strategy/documents.json'
  ];

  dataFiles.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      console.log(`   ✓ ${filePath} (${(stats.size / 1024).toFixed(1)} KB)`);
    } else {
      console.log(`   ✗ ${filePath}: NOT FOUND`);
    }
  });

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  SUMMARY');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  console.log('✅ Setup verification complete!\n');
  console.log('Next steps:');
  console.log('1. If tables are missing, run: supabase/migrations/00_complete_schema.sql');
  console.log('2. To scrape and save speeches: npm run scrape:save');
  console.log('3. To start the app: npm run dev');
  console.log('4. Open: http://localhost:3001\n');
}

checkDatabase().catch(console.error);

