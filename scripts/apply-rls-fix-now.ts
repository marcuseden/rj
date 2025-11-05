/**
 * Apply RLS Fix NOW using direct database connection
 * Run: npx tsx scripts/apply-rls-fix-now.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing credentials in .env.local');
  process.exit(1);
}

async function applyFix() {
  console.log('🚀 Applying RLS Fix for worldbank_countries\n');
  console.log('='.repeat(70));
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'
    }
  });

  // Read the migration file
  const migrationPath = path.join(process.cwd(), 'supabase/migrations/20241106100000_fix_countries_rls.sql');
  const sql = fs.readFileSync(migrationPath, 'utf-8');

  console.log('📝 Migration SQL:');
  console.log(sql);
  console.log('='.repeat(70) + '\n');

  // Split SQL into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

  console.log(`Executing ${statements.length} SQL statements...\n`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i] + ';';
    console.log(`[${i + 1}/${statements.length}] ${stmt.substring(0, 60)}...`);

    try {
      // Use the REST API to execute SQL
      const { data, error } = await supabase.rpc('exec_sql' as any, {
        sql: stmt
      }) as any;

      if (error) {
        console.log(`  ⚠️  ${error.message || 'May have succeeded (check below)'}`);
        failed++;
      } else {
        console.log(`  ✅ Success`);
        success++;
      }
    } catch (err: any) {
      console.log(`  ⚠️  ${err.message}`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('RESULTS');
  console.log('='.repeat(70));
  console.log(`✅ Successful: ${success}`);
  console.log(`⚠️  Failed/Warning: ${failed}`);
  console.log('='.repeat(70) + '\n');

  // Test if the fix worked
  console.log('🧪 Testing with ANON key...\n');

  const testClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const { data: testData, error: testError } = await testClient
    .from('worldbank_countries')
    .select('name, region')
    .limit(3);

  if (testError) {
    console.error('❌ TEST FAILED - RLS still blocking access');
    console.error('   Error:', testError.message);
    console.log('\n⚠️  Manual fix required - see FIX_COUNTRIES_PAGE.md\n');
  } else {
    console.log('✅ TEST PASSED - RLS is working correctly!');
    console.log('   Sample data:');
    testData?.forEach(c => console.log(`   • ${c.name} (${c.region})`));
    console.log('\n🎉 Countries page should now work!');
    console.log('   Visit: http://localhost:3000/countries\n');
  }
}

applyFix().catch(error => {
  console.error('\n❌ Fatal error:', error.message);
  console.log('\n📝 See FIX_COUNTRIES_PAGE.md for manual fix instructions\n');
});

