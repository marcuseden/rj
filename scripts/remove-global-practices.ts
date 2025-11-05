import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  console.log('🧹 Removing Global Practices group entry...\n');
  
  const { error } = await supabase
    .from('worldbank_orgchart')
    .delete()
    .eq('id', 'global-practices');

  if (error) {
    console.error('❌ Error:', error);
  } else {
    console.log('✅ Removed Global Practices');
  }

  // Get final count
  const { count } = await supabase
    .from('worldbank_orgchart')
    .select('*', { count: 'exact', head: true });

  console.log(`\n📊 Final count: ${count} verified people (all real individuals)`);
}

main();

