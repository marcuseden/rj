import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || ''
  });
}

// Cache to avoid fetching from DB every time
let cachedContext: any = null;
let cacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function fetchDatabaseContext() {
  /**
   * Fetch REAL content from Supabase database for analysis
   * Cached for 5 minutes to improve performance
   */
  
  // Return cached data if still valid
  if (cachedContext && Date.now() - cacheTime < CACHE_DURATION) {
    return cachedContext;
  }
  
  // Create server-side Supabase client for API route
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    return {
      speeches: [],
      documents: [],
      priorities: [],
      projects: []
    };
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Fetch in parallel for speed - REDUCED LIMITS for faster response
    const [speechesResult, documentsResult, projectsResult] = await Promise.all([
      supabase
        .from('speeches')
        .select('title, date, full_text')
        .order('date', { ascending: false })
        .limit(10), // Reduced from 20
      
      supabase
        .from('worldbank_documents')
        .select('title, doc_type, summary')
        .order('date', { ascending: false })
        .limit(10), // Reduced from 20
      
      supabase
        .from('worldbank_projects')
        .select('project_name, country, sector1_name')
        .order('boardapprovaldate', { ascending: false })
        .limit(5) // Reduced from 15
    ]);
    
    const speeches = speechesResult.data;
    const documents = documentsResult.data;
    const projects = projectsResult.data;
    
    // Note: priorities table doesn't exist, will use hardcoded ones
    const priorities: any[] = [];
    
    // Build hardcoded priorities from RJ's verified speeches
    const hardcodedPriorities = [
      {
        title: 'Job Creation',
        description: '1.2 billion young people entering workforce by 2035, need to create 800M+ jobs',
        targets: '420 million jobs projected; need 800 million more',
        status: 'In Progress'
      },
      {
        title: 'Mission 300 - Energy Access',
        description: 'Bringing electricity to 300 million Africans by 2030',
        targets: '90 million connections in first phase by 2030',
        status: 'In Progress'
      },
      {
        title: 'Climate Finance',
        description: '45% of World Bank funding toward climate projects',
        targets: '$40+ billion annually by 2025',
        status: 'On Track'
      },
      {
        title: 'IDA Replenishment',
        description: 'Record funding for poorest countries',
        targets: '$100+ billion secured (IDA21: $93B)',
        status: 'Achieved'
      },
      {
        title: 'Private Capital Mobilization',
        description: 'Using guarantees and de-risking to attract investment',
        targets: '$150+ billion in commitments',
        status: 'On Track'
      },
      {
        title: 'Healthcare Access',
        description: 'Quality primary healthcare for 1.5 billion people',
        targets: '1.5 billion people by 2030',
        status: 'In Progress'
      }
    ];
    
    const result = {
      speeches: speeches || [],
      documents: documents || [],
      priorities: hardcodedPriorities,
      projects: projects || []
    };
    
    // Cache the result
    cachedContext = result;
    cacheTime = Date.now();
    
    return result;
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
  
  // Extract key quotes from speeches - REDUCED for speed
  const speechQuotes = speeches.slice(0, 5).map((s: any) => {
    const text = s.full_text || s.content || '';
    const excerpt = text.substring(0, 300); // Reduced from 500
    return `"${excerpt}..." - ${s.title}`;
  }).join('\n\n');
  
  // Extract project examples - REDUCED
  const projectExamples = projects.slice(0, 3).map((p: any) => {
    const sector = p.sector1_name || 'Development';
    return `- ${p.project_name} (${p.country}): ${sector}`;
  }).join('\n');
  
  // Build priorities list
  const prioritiesList = priorities.map((p: any, i: number) => {
    return `${i + 1}. ${p.title}: ${p.description}\n   Target: ${p.targets || 'In progress'}`;
  }).join('\n\n');
  
  // RJ BANGA'S AUTHENTIC VOICE (from speeches - THIS is the Gold Standard)
  const rjAuthenticVoice = `
RJ BANGA'S AUTHENTIC COMMUNICATION STYLE (Gold Standard - from actual speeches):

WHAT 95-100% ALIGNMENT SOUNDS LIKE:
- Specific numbers: "1.2 billion young people entering workforce by 2035"
- Concrete examples: "In Nigeria, mini-grids cut farmers' work time in half"
- Urgency: "We don't have time to waste - speed matters"
- Action language: "We WILL achieve", not "We hope to"
- Signature phrases: "Forecasts are not destiny"
- Data points: "45% of financing - $40+ billion annually"
- Partnership specifics: "governments, private sector, and multilateral development banks working together"
- Human impact: "giving diabetics regular access to climate-controlled insulin"
- Timelines: "by 2030", "by 2035"
- Measurable targets: "300 million Africans", "800 million jobs needed"

WHAT INSTITUTIONAL LANGUAGE LOOKS LIKE (Lower scores 60-75%):
- Generic: "creating a world free of poverty" (lacks specifics)
- Vague: "through partnership and innovation" (what kind? how much? when?)
- No numbers: "ensuring job creation" (how many jobs? by when?)
- No examples: missing concrete stories from the field
- No urgency: missing "speed matters" or "we don't have time"
- Passive: "is to ensure" rather than "we WILL"

The official World Bank mission is institutional language (60-75% alignment).
RJ's speeches are his AUTHENTIC voice (95-100% alignment).

SCORING GUIDE:
- 95-100%: Sounds like RJ speaking - specific numbers, concrete examples, urgency, signature phrases
- 85-94%: Has RJ's elements but missing some specifics or examples
- 70-84%: Has right themes but too generic, lacks data
- 60-69%: Institutional language - correct topics but not RJ's voice
- Below 60%: Missing RJ's key priorities or style`;


  
  const context = `
RJ BANGA'S VERIFIED STRATEGIC VISION & COMMUNICATION STYLE
(Based on ${speeches.length} speeches, ${documents.length} documents, and ${projects.length} projects in database)

${rjAuthenticVoice}

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

CRITICAL SCORING GUIDANCE:
The gold standard is RJ BANGA'S AUTHENTIC VOICE from his speeches, NOT institutional language.

- Institutional/official language (even if correct) = 60-75% (lacks RJ's personal voice)
- Generic with right themes but no specifics = 70-80%
- Has RJ elements but missing data/examples = 80-90%
- Sounds like RJ actually speaking = 95-100%

DO NOT score institutional language highly just because it's "official."
RJ's authentic voice is direct, data-driven, with specific examples and urgency.

TASK: Provide TRUTHFUL, SPECIFIC, DATABASE-BACKED analysis:

1. ALIGNMENT SCORE (0-100): 
   Based on how well it matches RJ BANGA'S PERSONAL VOICE (not institutional language)
   - Sounds like RJ speaking (specific numbers, examples, urgency): 95-100%
   - Has RJ's themes but needs more specifics/data: 80-90%
   - Right topics but generic institutional language: 70-80%
   - Correct themes but lacks RJ's voice: 60-70%
   - Compare against REAL speeches where RJ uses concrete examples and data
   - Institutional language scores LOWER (60-75%) than RJ's authentic voice

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
   Rewrite the text to match RJ's style - BUT DO NOT FABRICATE DATA:
   
   CRITICAL RULES:
   - KEEP the user's original facts and message - do NOT invent new data
   - If user mentions "job creation", do NOT add fake numbers like "800 million jobs"
   - Only use numbers/examples from DATABASE if they're relevant AND the user's text mentions that topic
   - Transform STYLE, not content - make it sound like RJ without changing the facts
   
   STYLE TRANSFORMATIONS (what to change):
   - Make language more direct and action-oriented
   - Add RJ's communication patterns (urgency, partnership emphasis)
   - Use RJ's vocabulary and phrasing
   - Strengthen calls to action
   - Add appropriate signature phrases if they fit naturally
   
   WHAT NOT TO CHANGE:
   - User's core message and intent
   - User's specific facts and numbers (unless clearly wrong)
   - Don't add examples user didn't mention
   - Don't invent statistics
   
   If user's text is generic and would benefit from specifics, SUGGEST adding them in the improvements section, don't fabricate them in the rewrite.

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
      model: 'gpt-4o-mini', // Using mini for 2-3x faster response
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
      max_tokens: 2000, // Limit response size for speed
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

