import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import speechesDatabase from '@/public/speeches_database.json';
import styleGuide from '@/public/banga_style_guide.json';

export async function POST(request: NextRequest) {
  try {
    const { userSpeech } = await request.json();

    if (!userSpeech) {
      return NextResponse.json(
        { error: 'Missing user speech' },
        { status: 400 }
      );
    }

    // Use server-side OpenAI key
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured on server' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey: openaiKey });

    // Create analysis prompt with Ajay Banga's style
    const prompt = `You are analyzing a speech to see how well it matches Ajay Banga's speaking style as World Bank Group President.

AJAY BANGA'S SPEAKING STYLE CHARACTERISTICS:
- Direct, action-oriented language
- Emphasis on collaboration between governments, private sector, and development banks
- Data-driven arguments with specific numbers and facts
- Focus on measurable results and accountability
- Common themes: development finance, partnership, reform, jobs, climate, energy
- Often uses phrases like "Let me be direct", "The facts are stark", "Together, we can achieve"
- Calls to action emphasizing collective effort
- Professional but accessible tone

COMMON VOCABULARY:
${JSON.stringify(styleGuide.vocabulary)}

COMMON PHRASES:
${styleGuide.common_phrases['3_word'].slice(0, 20).map((p: any) => p.phrase).join(', ')}

USER'S SPEECH TO ANALYZE:
"""
${userSpeech}
"""

Analyze this speech and provide:
1. Overall similarity score (0-100)
2. What matches Ajay Banga's style well
3. What could be improved to match his style better
4. Specific suggestions for rewording
5. Key missing elements from his typical speeches

Format as JSON with keys: score, strengths, improvements, suggestions, missing_elements`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in analyzing political and development speeches, specifically Ajay Banga\'s style.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const analysis = JSON.parse(completion.choices[0].message.content || '{}');

    // Also generate an improved version
    const improvementPrompt = `Rewrite this speech in Ajay Banga's style as World Bank Group President:

ORIGINAL SPEECH:
"""
${userSpeech}
"""

Rewrite it to sound exactly like Ajay Banga would say it, incorporating:
- His direct, action-oriented language
- Emphasis on partnership and collaboration
- Data-driven approach
- Focus on measurable results
- His common vocabulary and phrases
- Professional but accessible tone

Keep the core message but transform the style.`;

    const improvementCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are Ajay Banga, President of the World Bank Group. Rewrite speeches in your distinctive style.'
        },
        {
          role: 'user',
          content: improvementPrompt
        }
      ],
      temperature: 0.8,
    });

    const improvedVersion = improvementCompletion.choices[0].message.content;

    return NextResponse.json({
      analysis,
      improvedVersion,
      databaseStats: {
        totalSpeeches: speechesDatabase.total_speeches,
        totalWords: speechesDatabase.total_words,
      }
    });

  } catch (error: any) {
    console.error('Error analyzing speech:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze speech' },
      { status: 500 }
    );
  }
}

