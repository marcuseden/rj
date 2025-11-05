#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function verify() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  console.log('🔍 Checking for worldbank_documents table...\n');
  
  const { data, error } = await supabase
    .from('worldbank_documents')
    .select('id')
    .limit(1);
  
  if (error) {
    console.error('❌ Table NOT found:', error.message);
    console.log('\n📋 Please run this SQL in Supabase SQL Editor:');
    console.log('   Go to: https://osakeppuupnhjpiwpnsv.supabase.co/project/_/sql');
    console.log('   Copy SQL from: supabase/migrations/create_worldbank_documents.sql\n');
    process.exit(1);
  }
  
  console.log('✅ Table exists!');
  console.log(`📊 Current row count: ${data?.length || 0}`);
  console.log('\nReady to scrape documents! Run:');
  console.log('  npm run scrape:index -- --max 10\n');
}

verify();

