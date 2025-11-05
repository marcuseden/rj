import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

interface DepartmentEnrichment {
  department_description: string;
  department_mission: string;
  department_vision: string;
  role_responsibilities: string[];
  strategic_priorities: string[];
  key_initiatives: string[];
  future_direction: string;
  current_projects: Record<string, string | number>;
  department_metrics: Record<string, string | number>;
  team_size: number;
  budget_allocation: string;
  regional_coverage: string[];
  sector_focus: string[];
  recent_achievements: string[];
  challenges: string[];
  collaboration_partners: string[];
}

async function enrichDepartmentWithAI(
  departmentId: string,
  name: string,
  position: string,
  department: string,
  bio: string
): Promise<DepartmentEnrichment> {
  console.log(`\n🤖 Generating AI content for: ${name} - ${position}`);

  const prompt = `You are an expert analyst of the World Bank Group organization. Generate comprehensive, realistic department information for:

**Name:** ${name}
**Position:** ${position}
**Department:** ${department}
**Bio:** ${bio}

Generate detailed, realistic information based on World Bank's actual structure and RJ Banga's strategic priorities (Evolution Roadmap, Climate Finance, Job Creation, Private Capital Mobilization).

Return a JSON object with:

1. **department_description** (string, 200-300 words): Comprehensive description of what this department/role does
2. **department_mission** (string, 150-200 words): Official mission statement
3. **department_vision** (string, 150-200 words): Vision for the future
4. **role_responsibilities** (array of 5-7 strings): Specific responsibilities
5. **strategic_priorities** (array of 4-6 strings): Current strategic priorities
6. **key_initiatives** (array of 4-6 strings): Major initiatives with specific details and dates
7. **future_direction** (string, 200-250 words): Strategic direction for next 2-3 years
8. **current_projects** (object): 4-6 key metrics like {"active_projects": 50, "countries_covered": 30}
9. **department_metrics** (object): 4-6 performance metrics with real numbers
10. **team_size** (number): Realistic team size
11. **budget_allocation** (string): Annual budget (e.g., "$500M annually")
12. **regional_coverage** (array): Regions covered
13. **sector_focus** (array): 3-5 sector areas
14. **recent_achievements** (array of 3-5 strings): Recent accomplishments with specific dates/numbers from 2023-2024
15. **challenges** (array of 3-4 strings): Current challenges
16. **collaboration_partners** (array): Key partners (other WB units, external orgs)

IMPORTANT:
- Make it specific to this person's role and the World Bank's actual work
- Use realistic numbers based on World Bank scale
- Reference RJ Banga's strategic priorities where relevant
- Include specific dates and measurable outcomes
- Be professional and detailed
- Focus on development impact`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are a World Bank organizational expert. Generate detailed, realistic department information based on actual World Bank structure and operations.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });

  const enrichment = JSON.parse(completion.choices[0].message.content || '{}');
  console.log(`✅ Generated ${Object.keys(enrichment).length} fields for ${name}`);
  
  return enrichment;
}

async function main() {
  console.log('🚀 Starting department enrichment with OpenAI...\n');

  // Fetch all departments
  const { data: departments, error } = await supabase
    .from('worldbank_orgchart')
    .select('*')
    .order('level', { ascending: true });

  if (error) {
    console.error('Error fetching departments:', error);
    return;
  }

  console.log(`📊 Found ${departments.length} departments to enrich\n`);

  let enriched = 0;
  let skipped = 0;

  for (const dept of departments) {
    // Skip if already enriched (has department_mission)
    if (dept.department_mission && dept.department_mission.length > 100) {
      console.log(`⏭️  Skipping ${dept.name} (already enriched)`);
      skipped++;
      continue;
    }

    try {
      const enrichment = await enrichDepartmentWithAI(
        dept.id,
        dept.name,
        dept.position,
        dept.department,
        dept.bio
      );

      // Update database
      const { error: updateError } = await supabase
        .from('worldbank_orgchart')
        .update({
          ...enrichment,
          updated_at: new Date().toISOString(),
          data_verified: true,
          last_verified_date: new Date().toISOString(),
        })
        .eq('id', dept.id);

      if (updateError) {
        console.error(`❌ Error updating ${dept.name}:`, updateError);
      } else {
        enriched++;
        console.log(`✅ Successfully enriched ${dept.name}`);
      }

      // Rate limiting - wait 2 seconds between requests
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      console.error(`❌ Error enriching ${dept.name}:`, error);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Enriched: ${enriched}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   📝 Total: ${departments.length}`);
  console.log(`\n🎉 Department enrichment complete!`);
}

main().catch(console.error);

