import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  console.log('🏢 Restoring department organizational structure...\n');

  // Step 1: Insert department groups (without the is_department_group column that doesn't exist)
  const departments = [
    {
      id: 'executive-team',
      name: 'Executive Leadership Team',
      position: 'Executive Vice Presidents & Managing Directors',
      department: 'Executive',
      bio: 'Senior executive leadership team supporting the President in global operations, policy, and institutional management.',
      level: 2,
      parent_id: 'ajay-banga',
      data_verified: true,
      last_verified_date: new Date().toISOString(),
    },
    {
      id: 'regional-leaders',
      name: 'Regional Leadership',
      position: 'Regional Vice Presidents',
      department: 'Regional',
      bio: 'Regional leaders overseeing country programs, operations, and partnerships across six world regions.',
      level: 2,
      parent_id: 'ajay-banga',
      data_verified: true,
      last_verified_date: new Date().toISOString(),
    },
    {
      id: 'global-practices',
      name: 'Global Practices',
      position: 'Sectoral Practice Leaders',
      department: 'Global Practices',
      bio: 'Technical experts leading sectoral knowledge, global standards, and cross-country learning in key development areas.',
      level: 2,
      parent_id: 'ajay-banga',
      data_verified: true,
      last_verified_date: new Date().toISOString(),
    },
    {
      id: 'corporate-functions',
      name: 'Corporate Functions',
      position: 'Corporate Support Leaders',
      department: 'Corporate',
      bio: 'Internal support functions including finance, legal, communications, HR, IT, and corporate governance.',
      level: 2,
      parent_id: 'ajay-banga',
      data_verified: true,
      last_verified_date: new Date().toISOString(),
    },
  ];

  console.log('📂 Inserting department groups...\n');
  
  for (const dept of departments) {
    const { error } = await supabase
      .from('worldbank_orgchart')
      .insert(dept);

    if (error) {
      console.log(`❌ ${dept.name}: ${error.message}`);
    } else {
      console.log(`✅ Inserted: ${dept.name}`);
    }
  }

  // Step 2: Reassign people to departments
  console.log('\n👥 Assigning people to departments...\n');

  const assignments = [
    // Executive Team
    { ids: ['axel-van-trotsenburg', 'anna-bjerde', 'mamta-murthi'], parent: 'executive-team', level: 3 },
    
    // Regional Leaders
    { ids: ['hailegabriel-abegaz', 'junaid-kamal-ahmad', 'arup-banerji', 'ernesto-silva', 'ferid-belhaj', 'hartwig-schafer'], parent: 'regional-leaders', level: 3 },
    
    // Global Practices
    { ids: ['jaime-saavedra', 'juergen-voegele', 'makhtar-diop', 'makhtar-diop-infrastructure'], parent: 'global-practices', level: 3 },
    
    // Corporate Functions
    { ids: ['indermit-gill', 'anshula-kant', 'christopher-stephens'], parent: 'corporate-functions', level: 3 },
  ];

  for (const assignment of assignments) {
    for (const id of assignment.ids) {
      const { error } = await supabase
        .from('worldbank_orgchart')
        .update({
          parent_id: assignment.parent,
          level: assignment.level,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.log(`❌ ${id}: ${error.message}`);
      } else {
        console.log(`✅ ${id} → ${assignment.parent}`);
      }
    }
  }

  // Step 3: Update children counts
  console.log('\n📊 Updating children counts...\n');

  for (const dept of departments) {
    const { count } = await supabase
      .from('worldbank_orgchart')
      .select('*', { count: 'exact', head: true })
      .eq('parent_id', dept.id);

    await supabase
      .from('worldbank_orgchart')
      .update({ children_count: count })
      .eq('id', dept.id);

    console.log(`  ${dept.name}: ${count} members`);
  }

  // Update Ajay's count
  const { count: ajayCount } = await supabase
    .from('worldbank_orgchart')
    .select('*', { count: 'exact', head: true })
    .eq('parent_id', 'ajay-banga');

  await supabase
    .from('worldbank_orgchart')
    .update({ children_count: ajayCount })
    .eq('id', 'ajay-banga');

  console.log(`  Ajay Banga: ${ajayCount} direct reports (4 departments)`);

  const { count: total } = await supabase
    .from('worldbank_orgchart')
    .select('*', { count: 'exact', head: true });

  console.log(`\n✅ Org chart restored!`);
  console.log(`📊 Total entries: ${total} (1 President + 4 Departments + ${total! - 5} People)`);
}

main().catch(console.error);

