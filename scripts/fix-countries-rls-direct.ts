/**
 * Fix RLS for worldbank_countries - Direct SQL Execution
 * Run: npx tsx scripts/fix-countries-rls-direct.ts
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

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixRLS() {
  console.log('🔧 Fixing RLS for worldbank_countries table\n');

  try {
    // Test if we can query using service role key
    console.log('Testing service role access...');
    const { data, error } = await supabase
      .from('worldbank_countries')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Service role access failed:', error.message);
      throw error;
    }

    console.log('✅ Service role has access\n');

    // Now try to check and fix RLS using PostgreSQL REST API
    console.log('='.repeat(70));
    console.log('MANUAL FIX REQUIRED');
    console.log('='.repeat(70));
    console.log('\n📝 Please run this SQL in Supabase SQL Editor:\n');
    console.log('Dashboard URL: https://supabase.com/dashboard/project/osakeppuupnhjpiwpnsv/editor/sql\n');
    console.log('-'.repeat(70));

    const fixSQL = `
-- Fix RLS Policies for worldbank_countries table
ALTER TABLE worldbank_countries ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow public read access to countries" ON worldbank_countries;
DROP POLICY IF EXISTS "Enable read access for all users" ON worldbank_countries;
DROP POLICY IF EXISTS "Public read access" ON worldbank_countries;

-- Create new policy for public SELECT access
CREATE POLICY "Enable read access for all users"
ON worldbank_countries
FOR SELECT
USING (true);

-- Grant SELECT permissions
GRANT SELECT ON worldbank_countries TO anon;
GRANT SELECT ON worldbank_countries TO authenticated;

-- Verify
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  roles, 
  cmd 
FROM pg_policies 
WHERE tablename = 'worldbank_countries';
`;

    console.log(fixSQL);
    console.log('-'.repeat(70));
    console.log('\n✅ After running the SQL, test with: npx tsx scripts/test-countries-page.ts\n');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

fixRLS();

