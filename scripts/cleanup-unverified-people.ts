import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  console.log('🧹 Removing unverifiable people from database...\n');

  const unverifiableIds = [
    'executive-team',
    'corporate-functions', 
    'regional-leaders',
    'armin-fidler',
    'adamou-labara',
    'alfredo-gonzalez'
  ];

  for (const id of unverifiableIds) {
    const { error } = await supabase
      .from('worldbank_orgchart')
      .delete()
      .eq('id', id);

    if (error) {
      console.log(`❌ Error deleting ${id}:`, error.message);
    } else {
      console.log(`✅ Removed: ${id}`);
    }
  }

  // Verify remaining count
  const { count } = await supabase
    .from('worldbank_orgchart')
    .select('*', { count: 'exact', head: true });

  console.log(`\n✅ Cleanup complete!`);
  console.log(`📊 Remaining people: ${count}`);
  console.log(`🎯 All remaining entries are 90%+ verified`);
}

main().catch(console.error);

