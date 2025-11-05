import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

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
        { error: 'Text too short for analysis' },
        { status: 400 }
      );
    }

    // Step 1: Load RJ Banga documents from database
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: documents, error: dbError } = await supabase
      .from('worldbank_documents')
      .select('*')
      .contains('tags_authors', ['Ajay Banga'])
      .eq('tags_priority', 'high')
      .order('date', { ascending: false })
      .limit(5);

    if (dbError) {
      console.error('Database error:', dbError);
      // Fallback to local files if DB not available
    }

    // Step 2: Build context from RJ's documents
    const rjContext = documents?.map(doc => `
Document: ${doc.title}
Date: ${doc.date}
Type: ${doc.tags_document_type}
Key Quote: ${doc.summary.substring(0, 300)}
Initiatives: ${doc.tags_initiatives.join(', ')}
Focus Areas: ${doc.tags_sectors.join(', ')}
`).join('\n---\n') || 'Limited context available';

    // Step 3: Call OpenAI for analysis
    const analysisPrompt = `You are an expert communication analyst specializing in RJ Banga (Ajay Banga), President of the World Bank Group.

CONTEXT - RJ Banga's Communication Style (from actual speeches):
${rjContext}

USER'S TEXT TO ANALYZE:
"""
${text}
"""

TASK: Analyze the user's text and compare it to RJ Banga's communication style. Provide:

1. ALIGNMENT SCORE (0-100): How well does it match RJ's style?

2. WHAT'S ALIGNED: List 2-3 things that match RJ's style
   For each, provide:
   - What aspect is aligned
   - Reference a specific RJ document/speech
   - Quote from that document showing the alignment

3. NEEDS IMPROVEMENT: List 3-5 areas that could be better
   For each, provide:
   - Category (tone/vocabulary/focus/structure/impact)
   - Specific issue
   - Concrete suggestion
   - Reference document with relevant quote
   - Why this matters in RJ's communication approach

4. MISALIGNMENTS: List 2-3 things that conflict with RJ's style
   Same structure as improvements

5. IMPROVED VERSION: Rewrite the text in RJ Banga's style
   - Use action-oriented language
   - Focus on concrete outcomes
   - Emphasize partnerships
   - Add urgency
   - Connect to human impact
   - Use specific examples where possible

6. KEY DIFFERENCES: List 3-5 main changes made and why

IMPORTANT: 
- Every point MUST reference a specific document from the context
- Include actual quotes
- Explain WHY each change aligns with RJ's strategic vision
- Be specific and actionable

Return as JSON with this structure:
{
  "overallScore": number,
  "alignedPoints": [{ "type": "aligned", "category": string, "issue": string, "suggestion": string, "reference": { "documentTitle": string, "documentUrl": string, "quote": string, "reason": string } }],
  "improvements": [...],
  "misalignments": [...],
  "improvedText": string,
  "keyDifferences": [string]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert analyst of RJ Banga\'s communication style. Provide detailed, referenced feedback.'
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const analysis = JSON.parse(completion.choices[0].message.content || '{}');

    // Step 4: Enhance references with actual document URLs from DB
    if (documents && documents.length > 0) {
      // Map document titles to URLs
      const docMap = new Map(
        documents.map(d => [d.title, d.source_original_url])
      );

      // Update all references
      [analysis.alignedPoints, analysis.improvements, analysis.misalignments].forEach(items => {
        items?.forEach((item: any) => {
          if (item.reference && item.reference.documentTitle) {
            // Try to match document title
            const matchedUrl = docMap.get(item.reference.documentTitle);
            if (matchedUrl) {
              item.reference.documentUrl = matchedUrl;
            }
          }
        });
      });
    }

    return NextResponse.json(analysis);

  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze text', details: error.message },
      { status: 500 }
    );
  }
}

