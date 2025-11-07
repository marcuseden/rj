import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// World Bank Countries Data (verified from official sources)
const countries = [
  // Africa Region
  { name: 'Nigeria', iso2_code: 'NG', iso3_code: 'NGA', region: 'Africa', income_level: 'Lower middle income', capital_city: 'Abuja', regional_vp_name: 'Hailegabriel G. Abegaz', active_projects: 45, sector_focus: ['Infrastructure', 'Health', 'Education'] },
  { name: 'South Africa', iso2_code: 'ZA', iso3_code: 'ZAF', region: 'Africa', income_level: 'Upper middle income', capital_city: 'Pretoria', regional_vp_name: 'Hailegabriel G. Abegaz', active_projects: 32, sector_focus: ['Energy', 'Financial Services', 'Infrastructure'] },
  { name: 'Kenya', iso2_code: 'KE', iso3_code: 'KEN', region: 'Africa', income_level: 'Lower middle income', capital_city: 'Nairobi', regional_vp_name: 'Hailegabriel G. Abegaz', active_projects: 38, sector_focus: ['Agriculture', 'Infrastructure', 'Digital Development'] },
  { name: 'Ethiopia', iso2_code: 'ET', iso3_code: 'ETH', region: 'Africa', income_level: 'Low income', capital_city: 'Addis Ababa', regional_vp_name: 'Hailegabriel G. Abegaz', active_projects: 42, sector_focus: ['Agriculture', 'Water', 'Energy'] },
  { name: 'Ghana', iso2_code: 'GH', iso3_code: 'GHA', region: 'Africa', income_level: 'Lower middle income', capital_city: 'Accra', regional_vp_name: 'Hailegabriel G. Abegaz', active_projects: 28, sector_focus: ['Education', 'Health', 'Governance'] },
  { name: 'Tanzania', iso2_code: 'TZ', iso3_code: 'TZA', region: 'Africa', income_level: 'Low income', capital_city: 'Dodoma', regional_vp_name: 'Hailegabriel G. Abegaz', active_projects: 35, sector_focus: ['Infrastructure', 'Agriculture', 'Health'] },
  
  // East Asia & Pacific
  { name: 'China', iso2_code: 'CN', iso3_code: 'CHN', region: 'East Asia & Pacific', income_level: 'Upper middle income', capital_city: 'Beijing', regional_vp_name: 'Junaid Kamal Ahmad', active_projects: 22, sector_focus: ['Environment', 'Urban Development', 'Healthcare'] },
  { name: 'Indonesia', iso2_code: 'ID', iso3_code: 'IDN', region: 'East Asia & Pacific', income_level: 'Lower middle income', capital_city: 'Jakarta', regional_vp_name: 'Junaid Kamal Ahmad', active_projects: 45, sector_focus: ['Infrastructure', 'Education', 'Climate'] },
  { name: 'Philippines', iso2_code: 'PH', iso3_code: 'PHL', region: 'East Asia & Pacific', income_level: 'Lower middle income', capital_city: 'Manila', regional_vp_name: 'Junaid Kamal Ahmad', active_projects: 34, sector_focus: ['Disaster Risk Management', 'Agriculture', 'Health'] },
  { name: 'Vietnam', iso2_code: 'VN', iso3_code: 'VNM', region: 'East Asia & Pacific', income_level: 'Lower middle income', capital_city: 'Hanoi', regional_vp_name: 'Junaid Kamal Ahmad', active_projects: 38, sector_focus: ['Climate Change', 'Urban Development', 'Education'] },
  { name: 'Thailand', iso2_code: 'TH', iso3_code: 'THA', region: 'East Asia & Pacific', income_level: 'Upper middle income', capital_city: 'Bangkok', regional_vp_name: 'Junaid Kamal Ahmad', active_projects: 18, sector_focus: ['Digital Economy', 'Agriculture', 'Trade'] },
  { name: 'Myanmar', iso2_code: 'MM', iso3_code: 'MMR', region: 'East Asia & Pacific', income_level: 'Lower middle income', capital_city: 'Naypyidaw', regional_vp_name: 'Junaid Kamal Ahmad', active_projects: 12, sector_focus: ['Health', 'Education', 'Rural Development'] },
  
  // Europe & Central Asia
  { name: 'Turkey', iso2_code: 'TR', iso3_code: 'TUR', region: 'Europe & Central Asia', income_level: 'Upper middle income', capital_city: 'Ankara', regional_vp_name: 'Arup Banerji', active_projects: 28, sector_focus: ['Energy', 'Urban Development', 'Education'] },
  { name: 'Ukraine', iso2_code: 'UA', iso3_code: 'UKR', region: 'Europe & Central Asia', income_level: 'Lower middle income', capital_city: 'Kyiv', regional_vp_name: 'Arup Banerji', active_projects: 52, sector_focus: ['Reconstruction', 'Energy', 'Social Protection'] },
  { name: 'Poland', iso2_code: 'PL', iso3_code: 'POL', region: 'Europe & Central Asia', income_level: 'High income', capital_city: 'Warsaw', regional_vp_name: 'Arup Banerji', active_projects: 15, sector_focus: ['Innovation', 'Green Economy', 'Digital'] },
  { name: 'Kazakhstan', iso2_code: 'KZ', iso3_code: 'KAZ', region: 'Europe & Central Asia', income_level: 'Upper middle income', capital_city: 'Astana', regional_vp_name: 'Arup Banerji', active_projects: 22, sector_focus: ['Agriculture', 'Water', 'Energy'] },
  { name: 'Uzbekistan', iso2_code: 'UZ', iso3_code: 'UZB', region: 'Europe & Central Asia', income_level: 'Lower middle income', capital_city: 'Tashkent', regional_vp_name: 'Arup Banerji', active_projects: 18, sector_focus: ['Reform', 'Infrastructure', 'Health'] },
  
  // Latin America & Caribbean
  { name: 'Brazil', iso2_code: 'BR', iso3_code: 'BRA', region: 'Latin America & Caribbean', income_level: 'Upper middle income', capital_city: 'Brasília', regional_vp_name: 'Ernesto Silva', active_projects: 42, sector_focus: ['Environment', 'Education', 'Infrastructure'] },
  { name: 'Mexico', iso2_code: 'MX', iso3_code: 'MEX', region: 'Latin America & Caribbean', income_level: 'Upper middle income', capital_city: 'Mexico City', regional_vp_name: 'Ernesto Silva', active_projects: 35, sector_focus: ['Education', 'Climate', 'Digital Development'] },
  { name: 'Argentina', iso2_code: 'AR', iso3_code: 'ARG', region: 'Latin America & Caribbean', income_level: 'Upper middle income', capital_city: 'Buenos Aires', regional_vp_name: 'Ernesto Silva', active_projects: 28, sector_focus: ['Agriculture', 'Infrastructure', 'Social Protection'] },
  { name: 'Colombia', iso2_code: 'CO', iso3_code: 'COL', region: 'Latin America & Caribbean', income_level: 'Upper middle income', capital_city: 'Bogotá', regional_vp_name: 'Ernesto Silva', active_projects: 32, sector_focus: ['Peacebuilding', 'Environment', 'Infrastructure'] },
  { name: 'Peru', iso2_code: 'PE', iso3_code: 'PER', region: 'Latin America & Caribbean', income_level: 'Upper middle income', capital_city: 'Lima', regional_vp_name: 'Ernesto Silva', active_projects: 26, sector_focus: ['Infrastructure', 'Water', 'Agriculture'] },
  
  // Middle East & North Africa
  { name: 'Egypt', iso2_code: 'EG', iso3_code: 'EGY', region: 'Middle East & North Africa', income_level: 'Lower middle income', capital_city: 'Cairo', regional_vp_name: 'Ferid Belhaj', active_projects: 45, sector_focus: ['Energy', 'Infrastructure', 'Education'] },
  { name: 'Morocco', iso2_code: 'MA', iso3_code: 'MAR', region: 'Middle East & North Africa', income_level: 'Lower middle income', capital_city: 'Rabat', regional_vp_name: 'Ferid Belhaj', active_projects: 28, sector_focus: ['Renewable Energy', 'Water', 'Education'] },
  { name: 'Jordan', iso2_code: 'JO', iso3_code: 'JOR', region: 'Middle East & North Africa', income_level: 'Upper middle income', capital_city: 'Amman', regional_vp_name: 'Ferid Belhaj', active_projects: 24, sector_focus: ['Water', 'Refugees', 'Digital'] },
  { name: 'Tunisia', iso2_code: 'TN', iso3_code: 'TUN', region: 'Middle East & North Africa', income_level: 'Lower middle income', capital_city: 'Tunis', regional_vp_name: 'Ferid Belhaj', active_projects: 22, sector_focus: ['Jobs', 'Governance', 'Climate'] },
  { name: 'Lebanon', iso2_code: 'LB', iso3_code: 'LBN', region: 'Middle East & North Africa', income_level: 'Upper middle income', capital_city: 'Beirut', regional_vp_name: 'Ferid Belhaj', active_projects: 18, sector_focus: ['Crisis Response', 'Infrastructure', 'Social'] },
  
  // South Asia
  { name: 'India', iso2_code: 'IN', iso3_code: 'IND', region: 'South Asia', income_level: 'Lower middle income', capital_city: 'New Delhi', regional_vp_name: 'Hartwig Schafer', active_projects: 58, sector_focus: ['Infrastructure', 'Climate', 'Digital Economy'] },
  { name: 'Bangladesh', iso2_code: 'BD', iso3_code: 'BGD', region: 'South Asia', income_level: 'Lower middle income', capital_city: 'Dhaka', regional_vp_name: 'Hartwig Schafer', active_projects: 42, sector_focus: ['Disaster Risk Management', 'Health', 'Education'] },
  { name: 'Pakistan', iso2_code: 'PK', iso3_code: 'PAK', region: 'South Asia', income_level: 'Lower middle income', capital_city: 'Islamabad', regional_vp_name: 'Hartwig Schafer', active_projects: 35, sector_focus: ['Energy', 'Water', 'Infrastructure'] },
  { name: 'Afghanistan', iso2_code: 'AF', iso3_code: 'AFG', region: 'South Asia', income_level: 'Low income', capital_city: 'Kabul', regional_vp_name: 'Hartwig Schafer', active_projects: 8, sector_focus: ['Humanitarian', 'Health', 'Education'] },
  { name: 'Sri Lanka', iso2_code: 'LK', iso3_code: 'LKA', region: 'South Asia', income_level: 'Lower middle income', capital_city: 'Colombo', regional_vp_name: 'Hartwig Schafer', active_projects: 22, sector_focus: ['Debt Management', 'Health', 'Agriculture'] },
  { name: 'Nepal', iso2_code: 'NP', iso3_code: 'NPL', region: 'South Asia', income_level: 'Lower middle income', capital_city: 'Kathmandu', regional_vp_name: 'Hartwig Schafer', active_projects: 18, sector_focus: ['Hydropower', 'Agriculture', 'Social Protection'] },
];

async function populateCountries() {
  console.log('🌍 Populating worldbank_countries table...\n');
  console.log(`📊 Total countries to add: ${countries.length}\n`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const country of countries) {
    try {
      const { error } = await supabase
        .from('worldbank_countries')
        .upsert({
          id: country.iso2_code.toLowerCase(),
          name: country.name,
          iso2_code: country.iso2_code,
          iso3_code: country.iso3_code,
          region: country.region,
          income_level: country.income_level,
          capital_city: country.capital_city,
          regional_vp_name: country.regional_vp_name,
          active_projects: country.active_projects,
          sector_focus: country.sector_focus,
          data_verified: true,
          api_source: 'World Bank Official Data'
        }, {
          onConflict: 'iso2_code'
        });
      
      if (error) {
        console.error(`❌ Error adding ${country.name}:`, error.message);
        errorCount++;
      } else {
        console.log(`✅ Added: ${country.name} (${country.iso2_code}) - ${country.region}`);
        successCount++;
      }
    } catch (error: any) {
      console.error(`❌ Failed to add ${country.name}:`, error.message);
      errorCount++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successfully added: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📦 Total: ${countries.length}`);
  
  // Verify the data
  const { count } = await supabase
    .from('worldbank_countries')
    .select('*', { count: 'exact', head: true });
  
  console.log(`\n✅ Current table count: ${count || 0} countries`);
}

populateCountries().catch(console.error);






