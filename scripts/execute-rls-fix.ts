/**
 * Execute RLS Fix using Supabase Management API
 * Run: npx tsx scripts/execute-rls-fix.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

async function executeSQL(sql: string) {
  console.log('🔧 Executing SQL via REST API...\n');
  
  const projectRef = supabaseUrl.split('//')[1].split('.')[0];
  const endpoint = `${supabaseUrl}/rest/v1/rpc/exec`;

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ query: sql })
    });

    const result = await response.text();
    console.log('Response:', result);

  } catch (error: any) {
    console.error('❌ Fetch failed:', error.message);
  }
}

async function tryAlternativeApproach() {
  console.log('🚀 Attempting to fix RLS via alternative method\n');
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Try to use SQL through a stored procedure
  const fixSQL = `
ALTER TABLE worldbank_countries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to countries" ON worldbank_countries;
DROP POLICY IF EXISTS "Enable read access for all users" ON worldbank_countries;
DROP POLICY IF EXISTS "Public read access" ON worldbank_countries;
CREATE POLICY "Enable read access for all users" ON worldbank_countries FOR SELECT USING (true);
GRANT SELECT ON worldbank_countries TO anon;
GRANT SELECT ON worldbank_countries TO authenticated;
  `.trim();

  // Try via direct REST API call
  await executeSQL(fixSQL);

  console.log('\n' + '='.repeat(70));
  console.log('ALTERNATIVE: Apply via Supabase Dashboard');
  console.log('='.repeat(70));
  console.log('\n1. Go to: https://supabase.com/dashboard/project/osakeppuupnhjpiwpnsv/editor/sql');
  console.log('2. Paste the SQL above');
  console.log('3. Click "Run"\n');
  console.log('OR use the migration file:');
  console.log('   supabase/migrations/20241106100000_fix_countries_rls.sql\n');
}

tryAlternativeApproach();

