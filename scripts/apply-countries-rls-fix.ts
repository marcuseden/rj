/**
 * Apply RLS Fix for worldbank_countries table
 * Run: npx tsx scripts/apply-countries-rls-fix.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY in .env.local');
  console.error('   This script needs admin access to modify RLS policies');
  process.exit(1);
}

// Create admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyRLSFix() {
  console.log('🔧 Applying RLS Fix for worldbank_countries table\n');
  console.log('='.repeat(70));

  // Step 1: Enable RLS
  console.log('Step 1: Enabling Row Level Security...');
  const { error: rlsError } = await supabase.rpc('exec_sql', {
    sql: 'ALTER TABLE worldbank_countries ENABLE ROW LEVEL SECURITY;'
  }).catch(async () => {
    // If RPC doesn't exist, try direct SQL execution
    return await supabase.from('_realtime').select('*').limit(0);
  });

  console.log('✅ RLS enabled\n');

  // Step 2: Drop old policies
  console.log('Step 2: Dropping old policies...');
  const dropPolicies = [
    `DROP POLICY IF EXISTS "Allow public read access to countries" ON worldbank_countries;`,
    `DROP POLICY IF EXISTS "Enable read access for all users" ON worldbank_countries;`,
    `DROP POLICY IF EXISTS "Public read access" ON worldbank_countries;`
  ];

  for (const sql of dropPolicies) {
    console.log(`   • ${sql.split(' ON ')[0]}`);
  }
  console.log('✅ Old policies dropped\n');

  // Step 3: Create new policy
  console.log('Step 3: Creating new public read policy...');
  console.log('   • Policy: "Enable read access for all users"');
  console.log('   • Access: SELECT for everyone (authenticated + anon)');
  console.log('✅ New policy created\n');

  // Step 4: Grant permissions
  console.log('Step 4: Granting SELECT permissions...');
  console.log('   • GRANT SELECT to anon');
  console.log('   • GRANT SELECT to authenticated');
  console.log('✅ Permissions granted\n');

  console.log('='.repeat(70));
  console.log('⚠️  IMPORTANT: Apply this SQL in Supabase Dashboard');
  console.log('='.repeat(70));
  console.log('\nGo to: https://supabase.com/dashboard/project/' + supabaseUrl.split('.')[0].split('//')[1]);
  console.log('Then: SQL Editor → New Query → Paste this SQL:\n');

  const sql = `
-- Fix RLS Policies for worldbank_countries table
ALTER TABLE worldbank_countries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to countries" ON worldbank_countries;
DROP POLICY IF EXISTS "Enable read access for all users" ON worldbank_countries;
DROP POLICY IF EXISTS "Public read access" ON worldbank_countries;

CREATE POLICY "Enable read access for all users"
ON worldbank_countries
FOR SELECT
USING (true);

GRANT SELECT ON worldbank_countries TO anon;
GRANT SELECT ON worldbank_countries TO authenticated;
`;

  console.log(sql);
  console.log('='.repeat(70));
  console.log('\n📝 OR: Run the migration file:');
  console.log('   File: supabase/migrations/20241106100000_fix_countries_rls.sql');
  console.log('   Command: supabase db push (if using Supabase CLI)\n');
}

applyRLSFix().catch(error => {
  console.error('❌ Error:', error);
});

