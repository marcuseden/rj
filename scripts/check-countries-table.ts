import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCountriesTable() {
  console.log('🔍 Checking worldbank_countries table...\n');
  
  try {
    const { data, error, count } = await supabase
      .from('worldbank_countries')
      .select('*', { count: 'exact' })
      .limit(5);

    if (error) {
      console.error('❌ Error querying table:', error.message);
      console.error('   Code:', error.code);
      console.error('   Details:', error.details);
      
      if (error.code === '42P01') {
        console.log('\n💡 Table does not exist. Run migrations first:');
        console.log('   npx supabase db push');
      }
      return;
    }

    console.log('✅ Table exists and is accessible');
    console.log(`📊 Total countries: ${count || 0}`);
    
    if (data && data.length > 0) {
      console.log('\n📋 Sample countries:');
      data.forEach((country: any) => {
        console.log(`   • ${country.name} (${country.iso2_code}) - ${country.region}`);
      });
    } else {
      console.log('\n⚠️  Table is empty! No country data found.');
      console.log('   Run the population script to add countries.');
    }
    
  } catch (error: any) {
    console.error('❌ Unexpected error:', error.message);
  }
}

checkCountriesTable();






