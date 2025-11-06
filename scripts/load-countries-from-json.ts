/**
 * Load Countries from JSON to Database
 * Uses the already-fetched data from worldbank-countries-complete.json
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase credentials not configured');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function loadCountriesFromJSON() {
  console.log('📂 Loading countries from JSON file...\n');
  
  const jsonPath = path.join(process.cwd(), 'data', 'worldbank-countries-complete.json');
  
  if (!fs.existsSync(jsonPath)) {
    console.error('❌ JSON file not found:', jsonPath);
    console.log('   Run the fetcher first: npx tsx scripts/fetch-all-countries-worldbank-api.ts');
    return;
  }
  
  const countriesData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  console.log(`✅ Loaded ${countriesData.length} countries from JSON\n`);
  
  console.log('💾 Saving to Supabase...\n');
  
  let saved = 0;
  let errors = 0;
  
  for (const country of countriesData) {
    try {
      const { error } = await supabase
        .from('worldbank_countries')
        .upsert(country, { onConflict: 'iso2_code' });
      
      if (error) {
        console.error(`  ❌ ${country.name}:`, error.message);
        errors++;
      } else {
        saved++;
        if (saved % 25 === 0) {
          console.log(`  ✅ Saved ${saved}/${countriesData.length} countries...`);
        }
      }
    } catch (err: any) {
      console.error(`  ❌ ${country.name}:`, err.message);
      errors++;
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('✅ SAVE COMPLETE');
  console.log('='.repeat(70));
  console.log(`Successfully saved: ${saved} countries`);
  console.log(`Errors: ${errors}`);
  
  if (saved > 0) {
    console.log('\n📊 Country breakdown:');
    const donorCount = countriesData.filter((c: any) => c.is_donor_country).length;
    console.log(`  💰 Donor countries: ${donorCount}`);
    console.log(`  🌍 Borrowing countries: ${saved - donorCount}`);
    console.log('\n✅ All countries now in database!');
    console.log('   Test: http://localhost:3001/department/arup-banerji');
    console.log('   Click any country to see details');
  } else if (errors > 0) {
    console.log('\n❌ No countries saved. Possible issues:');
    console.log('   1. Migration not applied in Supabase');
    console.log('   2. Schema cache needs refresh');
    console.log('   3. Column names mismatch');
    console.log('\n💡 Solution:');
    console.log('   1. Apply migration: 20241105160000_create_countries_table.sql');
    console.log('   2. Refresh schema in Supabase dashboard');
    console.log('   3. Re-run this script');
  }
  
  console.log('='.repeat(70) + '\n');
}

loadCountriesFromJSON();


