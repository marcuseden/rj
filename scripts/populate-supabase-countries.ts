/**
 * Populate Supabase with Countries Data
 * Run: npx tsx scripts/populate-supabase-countries.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function populateCountries() {
  console.log('🌍 Loading countries data from JSON...');
  
  const countriesPath = path.join(process.cwd(), 'data/worldbank-countries-complete.json');
  
  if (!fs.existsSync(countriesPath)) {
    console.error('❌ Countries JSON file not found:', countriesPath);
    process.exit(1);
  }

  const countriesData = JSON.parse(fs.readFileSync(countriesPath, 'utf-8'));
  console.log(`✅ Loaded ${countriesData.length} countries from JSON`);

  // Check current count
  const { count: currentCount } = await supabase
    .from('worldbank_countries')
    .select('*', { count: 'exact', head: true });

  console.log(`📊 Current countries in Supabase: ${currentCount || 0}`);

  if (currentCount && currentCount > 0) {
    console.log('⚠️  Countries table already has data. Delete first? (y/n)');
    console.log('   Run: DELETE FROM worldbank_countries; in Supabase SQL Editor');
    console.log('   Then run this script again.');
    return;
  }

  // Insert in batches of 100
  const batchSize = 100;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < countriesData.length; i += batchSize) {
    const batch = countriesData.slice(i, i + batchSize);
    
    // Transform data to match database schema
    const transformedBatch = batch.map((country: any) => ({
      id: country.id || country.iso2_code?.toLowerCase(),
      iso2_code: country.iso2_code,
      iso3_code: country.iso3_code,
      name: country.name,
      region: country.region,
      region_code: country.region_code,
      income_level: country.income_level,
      income_level_code: country.income_level_code,
      lending_type: country.lending_type,
      capital_city: country.capital_city,
      latitude: country.latitude,
      longitude: country.longitude,
      portfolio_value: country.portfolio_value || 0,
      portfolio_value_formatted: country.portfolio_value_formatted || '$0',
      active_projects: country.active_projects_count || country.active_projects || 0,
      ibrd_amount: country.ibrd_commitments || 0,
      ida_amount: country.ida_commitments || 0,
      regional_vp_id: country.regional_vp_id || null,
      regional_vp_name: country.regional_vp_name || null,
      recent_projects: country.recent_projects || [],
      sector_focus: country.sector_focus || [],
      theme_focus: country.theme_focus || [],
      data_verified: country.data_verified !== false,
      last_api_fetch: country.last_api_fetch || new Date().toISOString(),
      api_source: country.api_source || 'World Bank API v2'
    }));

    const { data, error } = await supabase
      .from('worldbank_countries')
      .insert(transformedBatch)
      .select();

    if (error) {
      console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, error.message);
      errors += batch.length;
    } else {
      inserted += data?.length || 0;
      console.log(`✅ Inserted batch ${i / batchSize + 1}: ${data?.length || 0} countries`);
    }
  }

  console.log('\n============================================================');
  console.log('📊 FINAL RESULTS');
  console.log('============================================================');
  console.log(`✅ Successfully inserted: ${inserted} countries`);
  console.log(`❌ Errors: ${errors}`);
  console.log('============================================================\n');

  // Verify final count
  const { count: finalCount } = await supabase
    .from('worldbank_countries')
    .select('*', { count: 'exact', head: true });

  console.log(`✅ Total countries in Supabase: ${finalCount}`);

  // Test queries
  console.log('\n🧪 Testing searches...');
  
  const { data: kenya } = await supabase
    .from('worldbank_countries')
    .select('name, region, active_projects')
    .ilike('name', '%kenya%')
    .single();
  
  console.log('Kenya:', kenya);

  const { data: mexico } = await supabase
    .from('worldbank_countries')
    .select('name, region, active_projects')
    .ilike('name', '%mexico%')
    .single();
  
  console.log('Mexico:', mexico);
}

// Run the script
populateCountries().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

