import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  console.log('🏢 Restoring department group structure...\n');

  const departmentGroups = [
    {
      id: 'executive-team',
      name: 'Executive Leadership Team',
      position: 'Executive Vice Presidents & Managing Directors',
      department: 'Executive',
      bio: 'Senior executive leadership team supporting the President in global operations, policy, and institutional management.',
      level: 2,
      parent_id: 'ajay-banga',
      is_department_group: true,
      data_verified: true,
    },
    {
      id: 'regional-leaders',
      name: 'Regional Leadership',
      position: 'Regional Vice Presidents',
      department: 'Regional',
      bio: 'Regional leaders overseeing country programs, operations, and partnerships across six world regions.',
      level: 2,
      parent_id: 'ajay-banga',
      is_department_group: true,
      data_verified: true,
    },
    {
      id: 'global-practices',
      name: 'Global Practices',
      position: 'Sectoral Practice Leaders',
      department: 'Global Practices',
      bio: 'Technical experts leading sectoral knowledge, global standards, and cross-country learning in key development areas.',
      level: 2,
      parent_id: 'ajay-banga',
      is_department_group: true,
      data_verified: true,
    },
    {
      id: 'corporate-functions',
      name: 'Corporate Functions',
      position: 'Corporate Leaders',
      department: 'Corporate',
      bio: 'Internal support functions including finance, legal, communications, HR, IT, and corporate governance.',
      level: 2,
      parent_id: 'ajay-banga',
      is_department_group: true,
      data_verified: true,
    },
  ];

  for (const group of departmentGroups) {
    const { error } = await supabase
      .from('worldbank_orgchart')
      .insert(group);

    if (error) {
      console.log(`❌ Error inserting ${group.name}:`, error.message);
    } else {
      console.log(`✅ Restored: ${group.name}`);
    }
  }

  // Now reassign people to their proper department groups
  const assignments = [
    { people: ['axel-van-trotsenburg', 'anna-bjerde', 'mamta-murthi'], parent: 'executive-team', level: 3 },
    { people: ['hailegabriel-abegaz', 'junaid-kamal-ahmad', 'arup-banerji', 'ernesto-silva', 'ferid-belhaj', 'hartwig-schafer'], parent: 'regional-leaders', level: 3 },
    { people: ['jaime-saavedra', 'juergen-voegele', 'makhtar-diop', 'makhtar-diop-infrastructure'], parent: 'global-practices', level: 3 },
    { people: ['indermit-gill', 'anshula-kant', 'christopher-stephens'], parent: 'corporate-functions', level: 3 },
  ];

  console.log('\n👥 Reassigning people to departments...\n');

  for (const assignment of assignments) {
    for (const personId of assignment.people) {
      const { error } = await supabase
        .from('worldbank_orgchart')
        .update({
          parent_id: assignment.parent,
          level: assignment.level,
          updated_at: new Date().toISOString()
        })
        .eq('id', personId);

      if (error) {
        console.log(`❌ ${personId}: ${error.message}`);
      } else {
        console.log(`✅ ${personId} → ${assignment.parent}`);
      }
    }
  }

  // Update children counts
  for (const group of departmentGroups) {
    const { count } = await supabase
      .from('worldbank_orgchart')
      .select('*', { count: 'exact', head: true })
      .eq('parent_id', group.id);

    await supabase
      .from('worldbank_orgchart')
      .update({ children_count: count })
      .eq('id', group.id);

    console.log(`📊 ${group.name}: ${count} members`);
  }

  console.log(`\n✅ Org chart structure restored!`);
}

main().catch(console.error);

