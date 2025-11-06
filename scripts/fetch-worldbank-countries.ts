import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface WorldBankCountry {
  id: string;
  iso2Code: string;
  name: string;
  region: { id: string; value: string };
  incomeLevel: { id: string; value: string };
  lendingType: { id: string; value: string };
  capitalCity: string;
  longitude: string;
  latitude: string;
}

async function fetchWorldBankCountries() {
  console.log('🌍 Fetching countries from World Bank API...\n');
  
  try {
    // Fetch countries from World Bank API
    const response = await fetch('https://api.worldbank.org/v2/country?format=json&per_page=300');
    const data = await response.json();
    
    if (!data || !Array.isArray(data) || data.length < 2) {
      console.error('❌ Invalid response from World Bank API');
      return;
    }
    
    const countries: WorldBankCountry[] = data[1];
    console.log(`📊 Fetched ${countries.length} countries from World Bank API\n`);
    
    // Filter out aggregates and regions, keep only actual countries
    const actualCountries = countries.filter(c => 
      c.region.value !== 'Aggregates' && 
      c.capitalCity && 
      c.iso2Code.length === 2
    );
    
    console.log(`📊 Filtered to ${actualCountries.length} actual countries\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const country of actualCountries) {
      try {
        const { error } = await supabase
          .from('worldbank_countries')
          .upsert({
            id: country.iso2Code.toLowerCase(),
            iso2_code: country.iso2Code,
            iso3_code: country.id,
            name: country.name,
            region: country.region.value,
            region_code: country.region.id,
            income_level: country.incomeLevel.value,
            income_level_code: country.incomeLevel.id,
            lending_type: country.lendingType.value,
            capital_city: country.capitalCity,
            latitude: country.latitude,
            longitude: country.longitude,
            data_verified: true,
            api_source: 'World Bank API v2',
          }, {
            onConflict: 'iso2_code'
          });
        
        if (error) {
          console.error(`❌ ${country.name}:`, error.message);
          errorCount++;
        } else {
          console.log(`✅ ${country.name} (${country.iso2Code}) - ${country.region.value}`);
          successCount++;
        }
      } catch (error: any) {
        console.error(`❌ ${country.name}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully added: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📦 Total: ${actualCountries.length}`);
    
    // Verify
    const { count } = await supabase
      .from('worldbank_countries')
      .select('*', { count: 'exact', head: true });
    
    console.log(`\n✅ Total countries in database: ${count || 0}`);
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

fetchWorldBankCountries();


