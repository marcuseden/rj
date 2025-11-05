/**
 * Test Countries Page - Verify DB connection and data retrieval
 * Run: npx tsx scripts/test-countries-page.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

// Create client with ANON key (same as frontend)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCountriesPage() {
  console.log('🧪 Testing Countries Page Database Connection\n');
  console.log('='.repeat(70));
  console.log('Using ANON key (same as frontend):');
  console.log(`URL: ${supabaseUrl}`);
  console.log(`Key: ${supabaseAnonKey.substring(0, 20)}...`);
  console.log('='.repeat(70) + '\n');

  // Test 1: Basic query
  console.log('Test 1: Basic query (SELECT *)...');
  const { data: allCountries, error: error1, count } = await supabase
    .from('worldbank_countries')
    .select('*', { count: 'exact' })
    .limit(5);

  if (error1) {
    console.error('❌ Test 1 FAILED:', error1.message);
    console.error('   Code:', error1.code);
    console.error('   Details:', error1.details);
    console.error('   Hint:', error1.hint);
    return;
  }

  console.log(`✅ Test 1 PASSED: Retrieved ${count} total countries`);
  console.log(`   Sample: ${allCountries?.map(c => c.name).join(', ')}\n`);

  // Test 2: Filter by region
  console.log('Test 2: Filter by region (Africa)...');
  const { data: africaCountries, error: error2 } = await supabase
    .from('worldbank_countries')
    .select('*')
    .eq('region', 'Sub-Saharan Africa')
    .limit(3);

  if (error2) {
    console.error('❌ Test 2 FAILED:', error2.message);
    return;
  }

  console.log(`✅ Test 2 PASSED: Retrieved ${africaCountries?.length} African countries`);
  console.log(`   Sample: ${africaCountries?.map(c => c.name).join(', ')}\n`);

  // Test 3: Search by name
  console.log('Test 3: Search by name (contains "United")...');
  const { data: searchResults, error: error3 } = await supabase
    .from('worldbank_countries')
    .select('name, region, capital_city, active_projects')
    .ilike('name', '%United%');

  if (error3) {
    console.error('❌ Test 3 FAILED:', error3.message);
    return;
  }

  console.log(`✅ Test 3 PASSED: Found ${searchResults?.length} countries`);
  searchResults?.forEach(c => {
    console.log(`   • ${c.name} - ${c.region} - ${c.active_projects || 0} projects`);
  });
  console.log();

  // Test 4: Check for required fields
  console.log('Test 4: Verify required fields are populated...');
  const { data: fieldCheck, error: error4 } = await supabase
    .from('worldbank_countries')
    .select('id, name, iso2_code, region, capital_city, active_projects')
    .limit(10);

  if (error4) {
    console.error('❌ Test 4 FAILED:', error4.message);
    return;
  }

  const missingFields: string[] = [];
  fieldCheck?.forEach(country => {
    if (!country.id) missingFields.push(`${country.name}: missing id`);
    if (!country.iso2_code) missingFields.push(`${country.name}: missing iso2_code`);
    if (!country.region) missingFields.push(`${country.name}: missing region`);
  });

  if (missingFields.length > 0) {
    console.error('❌ Test 4 FAILED: Missing required fields:');
    missingFields.forEach(msg => console.error(`   ${msg}`));
    return;
  }

  console.log(`✅ Test 4 PASSED: All required fields are populated\n`);

  // Test 5: Check RLS policies
  console.log('Test 5: Verify RLS policies allow public read access...');
  const { data: rlsTest, error: error5 } = await supabase
    .from('worldbank_countries')
    .select('count')
    .limit(1);

  if (error5) {
    console.error('❌ Test 5 FAILED: RLS might be blocking access');
    console.error('   Error:', error5.message);
    console.error('\n💡 FIX: Run this SQL in Supabase dashboard:');
    console.error(`
      ALTER TABLE worldbank_countries ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "Allow public read access to countries" ON worldbank_countries;
      CREATE POLICY "Allow public read access to countries" 
      ON worldbank_countries FOR SELECT USING (true);
      
      GRANT SELECT ON worldbank_countries TO authenticated, anon;
    `);
    return;
  }

  console.log('✅ Test 5 PASSED: RLS policies are correct\n');

  // Test 6: Check specific columns used by frontend
  console.log('Test 6: Verify frontend-required columns exist...');
  const { data: columnTest, error: error6 } = await supabase
    .from('worldbank_countries')
    .select(`
      id, 
      name, 
      iso2_code, 
      iso3_code, 
      region, 
      income_level, 
      capital_city, 
      active_projects, 
      portfolio_value_formatted, 
      sector_focus, 
      latitude, 
      longitude,
      population,
      life_expectancy,
      primary_sector
    `)
    .limit(1);

  if (error6) {
    console.error('❌ Test 6 FAILED:', error6.message);
    console.error('   Missing columns might be causing frontend issues');
    return;
  }

  console.log('✅ Test 6 PASSED: All frontend columns exist\n');

  // Summary
  console.log('='.repeat(70));
  console.log('✅ ALL TESTS PASSED!');
  console.log('='.repeat(70));
  console.log('Database Status:');
  console.log(`  • Total Countries: ${count}`);
  console.log(`  • RLS Policies: ✅ Configured correctly`);
  console.log(`  • Required Fields: ✅ All present`);
  console.log(`  • Frontend Compatibility: ✅ All columns available`);
  console.log('\n🌍 Countries page should load correctly!');
  console.log('   Visit: http://localhost:3000/countries\n');
  console.log('='.repeat(70) + '\n');
}

testCountriesPage().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});

