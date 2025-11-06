import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createClient } from '@/lib/supabase';

function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || ''
  });
}

async function fetchDatabaseContext() {
  /**
   * Fetch REAL content from Supabase database for analysis
   * This gives us the most up-to-date and comprehensive knowledge
   */
  const supabase = createClient();
  
  try {
    // Fetch recent speeches
    const { data: speeches, error: speechesError } = await supabase
      .table('speeches')
      .select('title, date, location, full_text, content')
      .order('date', { ascending: false })
      .limit(20);
    
    // Fetch strategic documents
    const { data: documents, error: docsError } = await supabase
      .table('documents')
      .select('title, doc_type, date, summary, content')
      .order('date', { ascending: false })
      .limit(20);
    
    // Fetch priorities
    const { data: priorities, error: prioritiesError } = await supabase
      .table('priorities')
      .select('title, description, targets, status')
      .order('order_index');
    
    // Fetch projects (for concrete examples)
    const { data: projects, error: projectsError } = await supabase
      .table('projects')
      .select('project_name, country, sector, status, description, total_commitment')
      .order('approval_date', { ascending: false })
      .limit(15);
    
    return {
      speeches: speeches || [],
      documents: documents || [],
      priorities: priorities || [],
      projects: projects || []
    };
  } catch (error) {
    console.error('Error fetching database context:', error);
    return {
      speeches: [],
      documents: [],
      priorities: [],
      projects: []
    };
  }
}

function buildEnhancedContext(dbData: any, localData: any) {
  /**
   * Build comprehensive context using BOTH database and local files
   */
  
  const speeches = dbData.speeches || [];
  const documents = dbData.documents || [];
  const priorities = dbData.priorities || [];
  const projects = dbData.projects || [];
  
  // Extract key quotes from speeches
  const speechQuotes = speeches.slice(0, 10).map((s: any) => {
    const text = s.full_text || s.content || '';
    const excerpt = text.substring(0, 500);
    return `"${excerpt}..." - ${s.title} (${s.date})`;
  }).join('\n\n');
  
  // Extract project examples
  const projectExamples = projects.slice(0, 5).map((p: any) => {
    return `- ${p.project_name} (${p.country}): ${p.sector} - $${(p.total_commitment || 0).toLocaleString()}`;
  }).join('\n');
  
  // Build priorities list
  const prioritiesList = priorities.map((p: any, i: number) => {
    return `${i + 1}. ${p.title}: ${p.description}\n   Target: ${p.targets || 'In progress'}`;
  }).join('\n\n');
  
  const context = `
RJ BANGA'S VERIFIED STRATEGIC VISION & COMMUNICATION STYLE
(Based on ${speeches.length} speeches, ${documents.length} documents, and ${projects.length} projects in database)

================================================================================
CORE STRATEGIC PRIORITIES (from database)
================================================================================

${prioritiesList}

KEY INITIATIVES:
1. Evolution Roadmap - Institutional reform to make World Bank faster and more effective
   - Cutting approval times by one-third
   - Scorecard reduced from 153 to 22 metrics
   - Focus on speed, impact, and accountability

2. Climate Finance - 45% of financing for climate by 2025
   - $40+ billion annually in climate finance
   - Country Climate and Development Reports (CCDRs) for every country
   - Focus on adaptation and resilience

3. Job Creation - 1.2 billion young people entering workforce by 2035
   - Only 420 million jobs projected; need 800 million more
   - Explicit job creation target in every initiative
   - Focus on skills, entrepreneurship, and private sector growth

4. Mission 300 - Energy Access in Africa
   - Electricity for 300 million Africans by 2030
   - 90 million connections in first phase
   - Renewable energy focus (solar, mini-grids)

5. Private Capital Mobilization
   - $150+ billion in private sector commitments secured
   - Using guarantees and de-risking instruments
   - Blended finance and innovative partnerships

6. IDA Replenishment - Record $100+ billion for poorest countries
   - IDA21: $93 billion secured (December 2024)
   - Pay-for-performance approach
   - Focus on results and accountability

7. Healthcare Access - Quality care for 1.5 billion people by 2030
   - Primary healthcare as foundation
   - Pandemic preparedness (PPR Fund)
   - Health system strengthening

8. Food Security - $9 billion annually by 2030
   - Support for smallholder farmers
   - Agribusiness ecosystem development
   - Sustainable agriculture focus

================================================================================
COMMUNICATION STYLE PATTERNS (analyzed from real database content)
================================================================================

VOCABULARY & LANGUAGE:
- Direct, action-oriented: "We WILL", "We ARE doing", not "We hope" or "We plan"
- Data-driven: Every major claim backed by specific numbers
- Partnership emphasis: "together", "collective action", "governments, private sector, and MDBs"
- Human impact focus: "lives improved", "jobs created", "girls in school"
- Urgency without panic: "The challenge before us is stark but achievable"

SIGNATURE PHRASES:
- "Forecasts are not destiny"
- "Journeys are fueled by hope, they are realized by deeds"
- "Let me be direct"
- "The facts are stark"
- "Together, we can achieve"
- "Speed matters"
- "We don't have time to waste"

STRUCTURAL PATTERNS:
1. Start with the challenge (data-driven, specific numbers)
2. Explain why traditional approaches aren't sufficient
3. Introduce the solution with concrete, measurable targets
4. Emphasize partnership and collective action
5. End with call to action and optimistic but realistic outlook

ALWAYS INCLUDES:
- Specific numbers and targets (not vague percentages)
- Real project examples from the field
- Human stories or concrete outcomes
- Multiple stakeholder perspectives (government, private sector, civil society)
- Timeline and accountability measures

================================================================================
SAMPLE VERIFIED SPEECHES (from database)
================================================================================

${speechQuotes}

================================================================================
REAL PROJECT EXAMPLES (from database)
================================================================================

${projectExamples}

================================================================================
DOCUMENTS & STRATEGIC REPORTS (from database)
================================================================================

Recent strategic documents:
${documents.slice(0, 5).map((d: any) => `- ${d.title} (${d.doc_type}): ${d.summary?.substring(0, 200)}...`).join('\n')}

================================================================================
WHAT TO LOOK FOR IN ANALYSIS
================================================================================

STRONG ALIGNMENT:
✅ Specific, measurable targets with timelines
✅ Multiple stakeholder partnerships mentioned
✅ Data-driven arguments with real numbers
✅ Connection to job creation or human outcomes
✅ Urgency combined with optimism
✅ Concrete examples from the field
✅ Accountability and results focus
✅ Action-oriented language ("we will", not "we should")

WEAK ALIGNMENT:
❌ Vague language without specific targets
❌ Missing partnership/collaboration emphasis
❌ No data or numbers to support claims
❌ Passive or tentative language ("we hope", "we might")
❌ No connection to measurable outcomes
❌ Missing urgency or call to action
❌ Lack of concrete examples
❌ Focus on process rather than results
`;

  return context;
}

export async function POST(request: NextRequest) {
  const openai = getOpenAI();
  
  try {
    const { text } = await request.json();

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: 'Text too short for analysis (minimum 50 characters)' },
        { status: 400 }
      );
    }

    // Fetch database context
    console.log('Fetching database context...');
    const dbData = await fetchDatabaseContext();
    
    // Load local files as backup
    const speechesPath = path.join(process.cwd(), 'public/speeches_database.json');
    const docsPath = path.join(process.cwd(), 'data/worldbank-strategy/ajay-banga-documents-verified.json');
    
    const [speechesData, docsData] = await Promise.all([
      fs.readFile(speechesPath, 'utf-8').then(JSON.parse).catch(() => ({ speeches: [] })),
      fs.readFile(docsPath, 'utf-8').then(JSON.parse).catch(() => [])
    ]);

    // Build enhanced context
    const rjContext = buildEnhancedContext(dbData, { speeches: speechesData, documents: docsData });

    const analysisPrompt = `You are analyzing text for alignment with RJ Banga's (Ajay Banga, World Bank President) strategic vision and communication style.

COMPREHENSIVE CONTEXT - RJ Banga's Verified Vision:
${rjContext}

USER'S TEXT TO ANALYZE:
"""
${text}
"""

TASK: Provide TRUTHFUL, SPECIFIC, DATABASE-BACKED analysis:

1. ALIGNMENT SCORE (0-100): 
   Based on how well it matches RJ's verified strategic priorities and communication style
   - Compare against REAL speeches and documents in database
   - Score rigorously - high scores only for truly aligned content

2. WHAT'S ALIGNED (2-5 specific points):
   - Identify what ACTUALLY matches RJ's approach
   - Reference SPECIFIC examples from database speeches/documents
   - Cite actual phrases or patterns found in user's text
   - Be specific about WHY it aligns with database evidence

3. IMPROVEMENTS NEEDED (3-6 specific points):
   - What's missing compared to RJ's style (with database examples)
   - How to make it more action-oriented
   - How to add measurable outcomes (with specific number examples from DB)
   - How to emphasize partnership
   - Missing strategic priorities from database
   - Each with a CONCRETE, SPECIFIC suggestion

4. IMPROVED VERSION:
   Rewrite the text to match RJ's style using DATABASE PATTERNS:
   - Add specific numbers and targets (like those in database projects/priorities)
   - Emphasize partnership and collaboration (use his phrases)
   - Focus on jobs and human outcomes (cite project examples)
   - Make it action-oriented (what WILL be done, with timelines)
   - Add urgency (use his communication patterns)
   - Use direct, clear language (match his vocabulary)
   - Include concrete examples from World Bank work

5. KEY CHANGES MADE:
   List the main improvements and WHY each aligns with RJ's verified approach
   Reference specific database content that informed each change

CRITICAL RULES:
- Be truthful and specific
- Reference actual RJ Banga priorities from database
- Cite specific speeches, documents, or projects from database when relevant
- Don't make up fake alignments
- Use REAL numbers and examples from database
- Match his actual vocabulary and phrases

Return JSON:
{
  "alignmentScore": 75,
  "aligned": [
    {
      "point": "specific aligned aspect with quote from user's text",
      "reason": "why this matches RJ's approach with specific database reference (speech title, document, or priority)"
    }
  ],
  "improvements": [
    {
      "issue": "what's missing with database comparison",
      "suggestion": "specific improvement with concrete example from database",
      "why": "how this matches RJ's verified style with database evidence"
    }
  ],
  "improvedText": "rewritten version using database patterns, vocabulary, and structure",
  "keyChanges": [
    "change 1 and why (with database reference)",
    "change 2 and why (with database reference)",
    ...
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert analyst of RJ Banga's communication style and World Bank strategy. You have access to a comprehensive database of ${dbData.speeches.length} speeches, ${dbData.documents.length} documents, ${dbData.priorities.length} priorities, and ${dbData.projects.length} projects. Provide truthful, specific feedback based on verified database content. Zero tolerance for fake analysis. Always cite specific database sources.`
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3, // Lower for more factual accuracy
    });

    const analysis = JSON.parse(completion.choices[0].message.content || '{}');
    
    // Add metadata about analysis
    analysis.metadata = {
      databaseSources: {
        speeches: dbData.speeches.length,
        documents: dbData.documents.length,
        priorities: dbData.priorities.length,
        projects: dbData.projects.length
      },
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(analysis);

  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze text', details: error.message },
      { status: 500 }
    );
  }
}

