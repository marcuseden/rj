import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateProjectCounts() {
  console.log('🔄 Updating active_projects count for all countries...\n');
  
  try {
    // Get all countries
    const { data: countries, error: countriesError } = await supabase
      .from('worldbank_countries')
      .select('id, name, iso2_code');
    
    if (countriesError) {
      console.error('❌ Error fetching countries:', countriesError);
      return;
    }
    
    console.log(`Found ${countries?.length} countries to update\n`);
    
    let updated = 0;
    let failed = 0;
    
    for (const country of countries || []) {
      try {
        // Count projects for this country by name
        const { count: projectCount, error: countError } = await supabase
          .from('worldbank_projects')
          .select('*', { count: 'exact', head: true })
          .eq('country', country.name);
        
        if (countError) {
          console.error(`❌ Error counting projects for ${country.name}:`, countError);
          failed++;
          continue;
        }
        
        // Update the country with project count
        const { error: updateError } = await supabase
          .from('worldbank_countries')
          .update({ active_projects: projectCount || 0 })
          .eq('id', country.id);
        
        if (updateError) {
          console.error(`❌ Error updating ${country.name}:`, updateError);
          failed++;
        } else {
          updated++;
          if (projectCount && projectCount > 0) {
            console.log(`✅ ${country.name}: ${projectCount} projects`);
          } else {
            console.log(`   ${country.name}: 0 projects`);
          }
        }
        
      } catch (error) {
        console.error(`❌ Error processing ${country.name}:`, error);
        failed++;
      }
    }
    
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log(`✅ Updated: ${updated} countries`);
    console.log(`❌ Failed: ${failed} countries`);
    console.log('═══════════════════════════════════════════════════════════════\n');
    
  } catch (error: any) {
    console.error('❌ Unexpected error:', error);
  }
}

updateProjectCounts();

