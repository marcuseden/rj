import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const wordCount = text.trim().split(/\s+/).length;
    const charCount = text.length;
    const textLower = text.toLowerCase();

    // Enhanced keyword categories with different weights
    const coreKeywords = [
      'partnership', 'innovation', 'results', 'poverty', 'development',
      'sustainability', 'equity', 'accountability', 'impact'
    ];

    const secondaryKeywords = [
      'climate', 'growth', 'jobs', 'reform', 'investment', 'collaboration',
      'transformation', 'inclusion', 'resilience', 'empowerment'
    ];

    const missionKeywords = [
      'world free of poverty', 'livable planet', 'job creation', 'explicit aim',
      'driving development', 'private sector', 'development banks'
    ];

    // Check for matches
    const coreMatches = coreKeywords.filter(keyword => textLower.includes(keyword));
    const secondaryMatches = secondaryKeywords.filter(keyword => textLower.includes(keyword));
    const missionMatches = missionKeywords.filter(keyword => textLower.includes(keyword));

    // Calculate scores with different weights
    const coreScore = Math.min(50, (coreMatches.length / coreKeywords.length) * 60); // Up to 50 points
    const secondaryScore = Math.min(30, (secondaryMatches.length / secondaryKeywords.length) * 40); // Up to 30 points
    const missionScore = missionMatches.length > 0 ? Math.min(20, missionMatches.length * 10) : 0; // Up to 20 points

    // Length bonus/penalty (reduced for mission statements)
    let lengthScore = 0;
    if (wordCount <= 100 && missionMatches.length >= 2) {
      // Mission statements get bonus for being concise
      lengthScore = 10;
    } else if (wordCount >= 50 && wordCount <= 200) {
      lengthScore = 5; // Short documents ok
    } else if (wordCount >= 200 && wordCount <= 800) {
      lengthScore = 10; // Optimal length
    } else if (wordCount > 800) {
      lengthScore = Math.max(0, 10 - ((wordCount - 800) / 200)); // Penalty for very long
    }

    // Total keyword density bonus
    const totalKeywords = coreMatches.length + secondaryMatches.length + missionMatches.length;
    const keywordDensity = totalKeywords / wordCount;
    const densityBonus = Math.min(10, keywordDensity * 1000); // Up to 10 points for high density

    // Calculate final score
    const keywordTotal = coreScore + secondaryScore + missionScore;
    const overallScore = Math.min(100, Math.round(keywordTotal + lengthScore + densityBonus));

    // Enhanced feedback based on content type
    const isMissionStatement = wordCount <= 100 && missionMatches.length >= 2;
    const feedback = getEnhancedFeedback(overallScore, coreMatches, secondaryMatches, missionMatches, isMissionStatement);

    return NextResponse.json({
      overallScore,
      feedback,
      improvedText: null,
      wordCount,
      charCount,
      matchedKeywords: [...coreMatches, ...secondaryMatches, ...missionMatches],
      scores: {
        coreAlignment: Math.round(coreScore),
        secondaryAlignment: Math.round(secondaryScore),
        missionAlignment: Math.round(missionScore),
        lengthBonus: Math.round(lengthScore),
        densityBonus: Math.round(densityBonus)
      }
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    );
  }
}

function getEnhancedFeedback(
  score: number,
  coreMatches: string[],
  secondaryMatches: string[],
  missionMatches: string[],
  isMissionStatement: boolean
): string {
  if (isMissionStatement && missionMatches.length >= 2) {
    return `Excellent alignment! This appears to be a core mission statement that perfectly captures the World Bank's vision under Ajay Banga's leadership. Key mission elements identified: ${missionMatches.join(', ')}.`;
  }

  if (score >= 85) {
    return `Outstanding alignment! Your content strongly reflects Ajay Banga's leadership vision and World Bank values. Core themes identified: ${[...coreMatches, ...missionMatches].slice(0, 5).join(', ')}.`;
  } else if (score >= 70) {
    return `Strong alignment with Ajay Banga's vision. Your content demonstrates good understanding of World Bank priorities. ${coreMatches.length > 0 ? `Key themes: ${coreMatches.join(', ')}.` : ''} Consider adding more specific outcomes and measurable impacts.`;
  } else if (score >= 50) {
    return `Moderate alignment detected. Your content touches on some World Bank values but could better reflect Ajay Banga's emphasis on partnership-driven solutions and measurable development results.`;
  } else {
    return `Limited alignment with current World Bank vision. To better align with Ajay Banga's leadership style, focus on: measurable results, partnership approaches, sustainable development, and job creation as explicit aims rather than byproducts.`;
  }
}

