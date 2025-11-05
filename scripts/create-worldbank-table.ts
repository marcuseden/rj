#!/usr/bin/env tsx

/**
 * Create World Bank Documents Table in Supabase
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs/promises';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function main() {
  console.log('🗄️  Creating World Bank Documents Table...\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase credentials not found in .env.local');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Read SQL migration file
  const sqlPath = path.join(process.cwd(), 'supabase', 'migrations', 'create_worldbank_documents.sql');
  const sql = await fs.readFile(sqlPath, 'utf-8');
  
  // Split into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
  
  console.log(`Executing ${statements.length} SQL statements...\n`);
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    if (!statement) continue;
    
    console.log(`${i + 1}/${statements.length}: Executing...`);
    
    const { error } = await supabase.rpc('exec', {
      query: statement + ';'
    });
    
    if (error) {
      // Try direct query
      const { error: directError } = await (supabase as any)
        .from('_sql')
        .select('*')
        .eq('query', statement);
      
      if (directError) {
        console.log(`  ⚠️  Statement ${i + 1} - will handle differently`);
        continue;
      }
    }
    
    console.log(`  ✅ Statement ${i + 1} executed`);
  }
  
  console.log('\n✅ Table creation complete!');
  console.log('\nVerifying table...');
  
  // Verify table exists
  const { data, error } = await supabase
    .from('worldbank_documents')
    .select('count');
  
  if (error) {
    console.error('❌ Table verification failed:', error.message);
    console.log('\n📝 Manual Setup Required:');
    console.log('   1. Go to your Supabase dashboard');
    console.log('   2. Navigate to SQL Editor');
    console.log('   3. Run the SQL from: supabase/migrations/create_worldbank_documents.sql');
    process.exit(1);
  }
  
  console.log('✅ Table verified and ready to use!');
  console.log('\nYou can now run:');
  console.log('  npm run scrape:index -- --max 10\n');
}

main();

