import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  console.log('🔧 Fixing org chart hierarchy...\n');

  // Update all people who had parent_id pointing to deleted groups
  // Make them all report directly to Ajay Banga
  
  const updates = [
    // People who were under "executive-team" now report to Ajay
    { ids: ['axel-van-trotsenburg', 'anna-bjerde', 'mamta-murthi', 'makhtar-diop'], parent: 'ajay-banga', level: 2 },
    
    // People who were under "corporate-functions" now report to Ajay
    { ids: ['indermit-gill', 'anshula-kant', 'christopher-stephens'], parent: 'ajay-banga', level: 2 },
    
    // People who were under "regional-leaders" now report to Ajay
    { ids: ['hailegabriel-abegaz', 'junaid-ahmad', 'arup-banerji', 'ernesto-silva', 'ferid-belhaj', 'hartwig-schafer'], parent: 'ajay-banga', level: 2 },
    
    // People who were under "global-practices" now report to Ajay
    { ids: ['jaime-saavedra', 'juergen-voegele', 'makhtar-diop-infrastructure'], parent: 'ajay-banga', level: 2 },
  ];

  for (const update of updates) {
    for (const id of update.ids) {
      const { error } = await supabase
        .from('worldbank_orgchart')
        .update({
          parent_id: update.parent,
          level: update.level,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.log(`❌ Error updating ${id}:`, error.message);
      } else {
        console.log(`✅ Fixed: ${id} → now reports to ${update.parent}`);
      }
    }
  }

  // Update Ajay Banga's children count
  const { count } = await supabase
    .from('worldbank_orgchart')
    .select('*', { count: 'exact', head: true })
    .eq('parent_id', 'ajay-banga');

  await supabase
    .from('worldbank_orgchart')
    .update({ children_count: count })
    .eq('id', 'ajay-banga');

  console.log(`\n✅ Updated Ajay Banga's direct reports count: ${count}`);
  console.log(`\n🎉 Hierarchy fixed! All verified people now report to Ajay Banga`);
}

main().catch(console.error);

