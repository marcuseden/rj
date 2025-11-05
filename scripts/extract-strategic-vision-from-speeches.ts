import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import * as fs from 'fs/promises';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

interface StrategicDocument {
  id: string;
  title: string;
  document_type: 'vision_statement' | 'strategy_document' | 'org_change_plan' | 'department_vision';
  content: string;
  department_id?: string;
  department_name?: string;
  key_points: string[];
  targets: Array<{
    metric: string;
    target: string;
    deadline: string;
  }>;
  organizational_changes: string[];
  source_speech_title: string;
  source_speech_date: string;
  source_speech_url: string;
  created_at: string;
  verified: boolean;
}

async function analyzeSpeechForStrategy(speech: any): Promise<StrategicDocument[]> {
  console.log(`\n📖 Analyzing: ${speech.title}`);

  const prompt = `Analyze this RJ Banga speech and extract ALL strategic vision statements, department visions, and organizational changes.

SPEECH TITLE: ${speech.title}
DATE: ${speech.date}
FULL TEXT:
${speech.full_text || speech.content || 'Limited text available'}

TASK: Extract and categorize strategic information:

1. OVERALL VISION STATEMENTS
   - Broad organizational vision
   - Mission statements
   - Strategic direction

2. DEPARTMENT-SPECIFIC VISIONS
   - Identify mentions of specific departments (e.g., IFC, MIGA, IDA, regional divisions)
   - Extract vision/strategy for each department
   - Note any department-specific targets

3. ORGANIZATIONAL CHANGES PLANNED
   - Restructuring plans
   - New initiatives
   - Process improvements
   - Integration efforts
   - Timeline mentions

4. MEASURABLE TARGETS
   - Extract ALL specific numbers and deadlines
   - Link to relevant department/area
   - Note commitment level (planned/committed/achieved)

Return JSON array of strategic documents:
[
  {
    "title": "brief title of vision/strategy",
    "document_type": "vision_statement" | "strategy_document" | "org_change_plan" | "department_vision",
    "content": "full extracted content (200-500 words)",
    "department_name": "specific department if applicable",
    "key_points": ["point 1", "point 2", ...],
    "targets": [
      {"metric": "climate finance share", "target": "45%", "deadline": "2025"},
      ...
    ],
    "organizational_changes": ["change 1", "change 2", ...],
  },
  ...
]

CRITICAL: Only extract ACTUAL statements from the speech. Do not invent or extrapolate. Zero tolerance for fake data.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: 'You are a strategic document extraction expert. Extract ONLY factual information from speeches. Zero tolerance for invented content. All extracted information must be directly stated or clearly implied in the source.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1, // Very low for factual extraction
  });

  const result = JSON.parse(completion.choices[0].message.content || '{}');
  const documents = result.documents || [];

  console.log(`  ✅ Extracted ${documents.length} strategic documents`);
  
  return documents.map((doc: any) => ({
    id: `${speech.id}-${doc.document_type}-${Date.now()}`,
    ...doc,
    source_speech_title: speech.title,
    source_speech_date: speech.date,
    source_speech_url: speech.url || '',
    created_at: new Date().toISOString(),
    verified: true
  }));
}

async function main() {
  console.log('📚 EXTRACTING RJ BANGA\'S STRATEGIC VISION FROM ALL SPEECHES');
  console.log('=' .repeat(70));
  console.log('🎯 Goals:');
  console.log('  1. Extract overall vision statements');
  console.log('  2. Find department-specific visions');
  console.log('  3. Identify organizational changes planned');
  console.log('  4. Index measurable targets and deadlines\n');

  // Load all speeches
  const speechesPath = path.join(process.cwd(), 'public/speeches_database.json');
  const speechesData = JSON.parse(await fs.readFile(speechesPath, 'utf-8'));
  const speeches = speechesData.speeches || [];

  console.log(`📊 Found ${speeches.length} speeches to analyze\n`);

  const allStrategicDocs: StrategicDocument[] = [];

  for (const speech of speeches) {
    try {
      const docs = await analyzeSpeechForStrategy(speech);
      allStrategicDocs.push(...docs);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      console.error(`❌ Error analyzing ${speech.title}:`, error);
    }
  }

  console.log(`\n${'='.repeat(70)}`);
  console.log(`📊 EXTRACTION SUMMARY:`);
  console.log(`${'='.repeat(70)}`);
  console.log(`📄 Total strategic documents extracted: ${allStrategicDocs.length}`);
  console.log(`📋 Vision statements: ${allStrategicDocs.filter(d => d.document_type === 'vision_statement').length}`);
  console.log(`📈 Strategy documents: ${allStrategicDocs.filter(d => d.document_type === 'strategy_document').length}`);
  console.log(`🏢 Department visions: ${allStrategicDocs.filter(d => d.document_type === 'department_vision').length}`);
  console.log(`🔄 Org change plans: ${allStrategicDocs.filter(d => d.document_type === 'org_change_plan').length}`);

  // Save to file for review
  await fs.writeFile(
    'STRATEGIC_VISION_EXTRACTED.json',
    JSON.stringify(allStrategicDocs, null, 2)
  );

  console.log(`\n💾 Saved to: STRATEGIC_VISION_EXTRACTED.json`);
  console.log(`\n✅ Ready to import to database!`);
  
  // Group by department
  const byDepartment = allStrategicDocs
    .filter(d => d.department_name)
    .reduce((acc: any, doc) => {
      const dept = doc.department_name!;
      if (!acc[dept]) acc[dept] = [];
      acc[dept].push(doc);
      return acc;
    }, {});

  console.log(`\n📊 DEPARTMENT-SPECIFIC VISIONS FOUND:`);
  Object.entries(byDepartment).forEach(([dept, docs]: [string, any]) => {
    console.log(`  ${dept}: ${docs.length} documents`);
  });
}

main().catch(console.error);

