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

interface VerificationResult {
  person_id: string;
  name: string;
  position: string;
  verified_data: {
    correct_position: string;
    correct_nationality: string;
    correct_tenure: string;
    current_role: string;
    verified_bio: string;
    official_source_url: string;
  };
  data_quality: number; // 0-100
  corrections_needed: string[];
  verification_timestamp: string;
}

async function verifyPersonWithAI(
  id: string,
  name: string,
  position: string,
  country: string,
  bio: string
): Promise<VerificationResult> {
  console.log(`\n🔍 Verifying: ${name}`);

  const prompt = `You are a fact-checking expert for the World Bank Group. Verify ALL information for this person with 100% accuracy using official World Bank sources.

**Person to Verify:**
- Name: ${name}
- Listed Position: ${position}
- Listed Nationality: ${country}
- Current Bio: ${bio}

**YOUR TASK:**
1. Search official World Bank website (worldbank.org) for this person
2. Verify their EXACT current position and title
3. Verify their CORRECT nationality
4. Verify when they started their current role (tenure)
5. Get their official biography from World Bank
6. Find the official source URL

**CRITICAL REQUIREMENTS:**
- Use ONLY official World Bank sources
- If ANY information is incorrect or unverified, flag it
- Return data quality score: 90-100% = acceptable, <90% = UNACCEPTABLE
- List ALL corrections needed
- Include official source URL for verification

Return JSON:
{
  "verified_data": {
    "correct_position": "exact official title",
    "correct_nationality": "verified country",
    "correct_tenure": "start date - present",
    "current_role": "is person still in this role? yes/no/unknown",
    "verified_bio": "official bio from World Bank website",
    "official_source_url": "https://www.worldbank.org/..."
  },
  "data_quality": 95,
  "corrections_needed": ["nationality should be X not Y", ...],
  "is_current_position": true/false
}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are a fact-checking expert. Verify ALL World Bank leadership information against official sources. Zero tolerance for inaccurate data. Data must be 90%+ quality or it is UNACCEPTABLE.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1, // Low temperature for factual accuracy
  });

  const result = JSON.parse(completion.choices[0].message.content || '{}');
  
  return {
    person_id: id,
    name,
    position,
    verified_data: result.verified_data,
    data_quality: result.data_quality || 0,
    corrections_needed: result.corrections_needed || [],
    verification_timestamp: new Date().toISOString()
  };
}

async function main() {
  console.log('🔍 STARTING 100% DATA VERIFICATION FOR ALL LEADERSHIP');
  console.log('📊 ZERO TOLERANCE POLICY: Data below 90% quality is UNACCEPTABLE\n');

  // Fetch all people
  const { data: people, error } = await supabase
    .from('worldbank_orgchart')
    .select('id, name, position, country, bio, tenure')
    .order('level', { ascending: true });

  if (error) {
    console.error('❌ Error fetching data:', error);
    return;
  }

  console.log(`📋 Found ${people.length} people to verify\n`);

  const results: VerificationResult[] = [];
  let acceptable = 0;
  let unacceptable = 0;
  let totalQuality = 0;

  for (const person of people) {
    try {
      const verification = await verifyPersonWithAI(
        person.id,
        person.name,
        person.position,
        person.country || 'Unknown',
        person.bio
      );

      results.push(verification);
      totalQuality += verification.data_quality;

      if (verification.data_quality >= 90) {
        console.log(`✅ ${person.name}: ${verification.data_quality}% - ACCEPTABLE`);
        acceptable++;
      } else {
        console.log(`❌ ${person.name}: ${verification.data_quality}% - UNACCEPTABLE`);
        console.log(`   Corrections needed: ${verification.corrections_needed.join(', ')}`);
        unacceptable++;
      }

      // Update database with verification
      await supabase
        .from('worldbank_orgchart')
        .update({
          data_verified: verification.data_quality >= 90,
          last_verified_date: verification.verification_timestamp,
          verification_source: verification.verified_data.official_source_url
        })
        .eq('id', person.id);

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 3000));

    } catch (error) {
      console.error(`❌ Error verifying ${person.name}:`, error);
    }
  }

  const avgQuality = totalQuality / people.length;

  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 VERIFICATION SUMMARY:');
  console.log(`${'='.repeat(60)}`);
  console.log(`✅ Acceptable (≥90%): ${acceptable}`);
  console.log(`❌ Unacceptable (<90%): ${unacceptable}`);
  console.log(`📈 Average Quality: ${avgQuality.toFixed(1)}%`);
  console.log(`\n${avgQuality >= 90 ? '✅ SYSTEM PASSES QUALITY STANDARDS' : '❌ SYSTEM FAILS - REQUIRES CORRECTION'}`);

  // Save detailed report
  const report = {
    verification_date: new Date().toISOString(),
    total_people: people.length,
    acceptable_count: acceptable,
    unacceptable_count: unacceptable,
    average_quality: avgQuality,
    meets_standards: avgQuality >= 90,
    detailed_results: results
  };

  // Write report to file
  const fs = await import('fs/promises');
  await fs.writeFile(
    'LEADERSHIP_VERIFICATION_REPORT.json',
    JSON.stringify(report, null, 2)
  );

  console.log(`\n📄 Detailed report saved to: LEADERSHIP_VERIFICATION_REPORT.json`);
  
  // Show people needing corrections
  const needsCorrection = results.filter(r => r.data_quality < 90);
  if (needsCorrection.length > 0) {
    console.log(`\n⚠️  PEOPLE REQUIRING CORRECTION:`);
    needsCorrection.forEach(r => {
      console.log(`\n${r.name}:`);
      r.corrections_needed.forEach(c => console.log(`  - ${c}`));
    });
  }
}

main().catch(console.error);

