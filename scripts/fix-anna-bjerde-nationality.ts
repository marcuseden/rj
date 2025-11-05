import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  console.log('🇸🇪 Fixing Anna Bjerde nationality to SWEDEN...\n');
  
  const { error } = await supabase
    .from('worldbank_orgchart')
    .update({ 
      country: 'Sweden',
      bio: 'Swedish Managing Director of Operations at the World Bank, overseeing a portfolio of $340 billion across client countries. Holds a master\'s degree in business and economics from the University of Stockholm. With 30 years of experience in international development, public policy, and public-private sector partnerships. Previously served as Vice President for Europe and Central Asia. Joined the World Bank in 1997.',
      tenure: '2023–Present',
      updated_at: new Date().toISOString(),
      verification_source: 'https://www.worldbank.org/en/about/people/anna-bjerde'
    })
    .eq('id', 'anna-bjerde');

  if (error) {
    console.error('❌ Error:', error);
  } else {
    console.log('✅ CORRECTED: Anna Bjerde is Swedish (not Norwegian)');
    console.log('✅ Bio updated with verified information from worldbank.org');
    console.log('✅ Source: https://www.worldbank.org/en/about/people/anna-bjerde');
  }
}

main().catch(console.error);

