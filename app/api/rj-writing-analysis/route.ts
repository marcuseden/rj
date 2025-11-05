import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import * as fs from 'fs/promises';
import * as path from 'path';

function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || ''
  });
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

    // Load REAL RJ Banga speeches and documents
    const speechesPath = path.join(process.cwd(), 'public/speeches_database.json');
    const docsPath = path.join(process.cwd(), 'data/worldbank-strategy/ajay-banga-documents-verified.json');
    
    const [speechesData, docsData] = await Promise.all([
      fs.readFile(speechesPath, 'utf-8').then(JSON.parse).catch(() => ({ speeches: [] })),
      fs.readFile(docsPath, 'utf-8').then(JSON.parse).catch(() => [])
    ]);

    // Build context from REAL RJ Banga content
    const rjContext = `
RJ BANGA'S VERIFIED STRATEGIC VISION & COMMUNICATION STYLE:

KEY STRATEGIC PRIORITIES (from actual speeches 2023-2024):
1. Evolution Roadmap: Institutional reform to make World Bank faster and more effective
2. Climate Finance: 45% of financing for climate by 2025 ($40+ billion annually)
3. Job Creation: Explicit focus on creating opportunities for 1.2 billion young people
4. Private Capital Mobilization: $150+ billion in private sector commitments
5. IDA Replenishment: Expanding concessional financing for low-income countries
6. Food Security: $9 billion annually by 2030 for agribusiness ecosystem

CORE VALUES (verified from speeches):
- Partnership between governments, private sector, and development banks
- Measurable results and concrete outcomes (not just intentions)
- Speed and urgency in addressing global challenges
- Focus on human impact (girls in school, jobs created, lives improved)
- Data-driven arguments with specific numbers
- Accountability and transparency

COMMUNICATION STYLE PATTERNS (analyzed from ${speechesData.total_speeches || 14} real speeches):
- Direct and action-oriented language
- Uses phrases like: "Let me be direct," "The facts are stark," "The challenge before us"
- Always emphasizes partnership and collaboration
- Supports every claim with specific data and measurable targets
- Connects every initiative to human outcomes and job creation
- Uses concrete examples (e.g., "mini-grids in Nigeria cut farmers' work time in half")
- Professional but accessible tone
- Focuses on "what we will DO" not just "what we plan"

SAMPLE VERIFIED QUOTES:
${docsData.slice(0, 3).map((doc: any) => `- "${doc.summary.substring(0, 200)}..."`).join('\n')}
`;

    const analysisPrompt = `You are analyzing text for alignment with RJ Banga's (Ajay Banga, World Bank President) strategic vision and communication style.

CONTEXT - RJ Banga's Verified Vision:
${rjContext}

USER'S TEXT TO ANALYZE:
"""
${text}
"""

TASK: Provide TRUTHFUL, SPECIFIC analysis:

1. ALIGNMENT SCORE (0-100): Based on how well it matches RJ's verified strategic priorities and communication style

2. WHAT'S ALIGNED (2-4 specific points):
   - Identify what ACTUALLY matches RJ's approach
   - Reference REAL examples from his speeches
   - Be specific about WHY it aligns

3. IMPROVEMENTS NEEDED (3-5 specific points):
   - What's missing compared to RJ's style
   - How to make it more action-oriented
   - How to add measurable outcomes
   - How to emphasize partnership
   - Each with a CONCRETE suggestion

4. IMPROVED VERSION:
   Rewrite the text to match RJ's style:
   - Add specific numbers and targets
   - Emphasize partnership and collaboration
   - Focus on jobs and human outcomes
   - Make it action-oriented (what WILL be done, not what might be)
   - Add urgency
   - Use direct, clear language

5. KEY CHANGES MADE:
   List the main improvements and WHY each aligns with RJ's verified approach

CRITICAL: Be truthful and specific. Reference actual RJ Banga priorities. Don't make up fake alignments.

Return JSON:
{
  "alignmentScore": 75,
  "aligned": [
    {
      "point": "specific aligned aspect",
      "reason": "why this matches RJ's approach with real example"
    }
  ],
  "improvements": [
    {
      "issue": "what's missing",
      "suggestion": "specific improvement",
      "why": "how this matches RJ's verified style"
    }
  ],
  "improvedText": "rewritten version",
  "keyChanges": ["change 1 and why", "change 2 and why", ...]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert analyst of RJ Banga\'s communication style and World Bank strategy. Provide truthful, specific feedback based on verified speeches and documents. Zero tolerance for fake analysis.'
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

    return NextResponse.json(analysis);

  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze text', details: error.message },
      { status: 500 }
    );
  }
}
