// Client-side speech analysis - no API keys needed!
import styleGuide from '@/public/banga_style_guide.json';
import speechesDatabase from '@/public/speeches_database.json';

interface AnalysisResult {
  score: number;
  strengths: string[];
  improvements: string[];
  suggestions: string[];
  missing_elements: string[];
  vocabulary_match: number;
  phrase_match: number;
  tone_match: number;
}

export function analyzeSpeech(userSpeech: string): AnalysisResult {
  const userWords = userSpeech.toLowerCase().split(/\s+/);
  const userSentences = userSpeech.split(/[.!?]+/).filter(s => s.trim());
  
  // 1. Vocabulary Analysis (30 points)
  const vocabularyScore = analyzeVocabulary(userWords);
  
  // 2. Phrase Pattern Match (25 points)
  const phraseScore = analyzePhrases(userSpeech.toLowerCase());
  
  // 3. Tone and Structure (25 points)
  const toneScore = analyzeTone(userSpeech, userSentences);
  
  // 4. Action-oriented language (20 points)
  const actionScore = analyzeActionLanguage(userSpeech);
  
  const totalScore = Math.round(vocabularyScore + phraseScore + toneScore + actionScore);
  
  // Generate feedback
  const strengths: string[] = [];
  const improvements: string[] = [];
  const suggestions: string[] = [];
  const missing: string[] = [];
  
  // Vocabulary feedback
  if (vocabularyScore > 20) {
    strengths.push("Strong use of development and partnership vocabulary");
  } else {
    improvements.push("Use more specific World Bank terminology (development, partnership, reform, investment)");
    suggestions.push("Try: 'development finance', 'private sector partnership', 'measurable results'");
  }
  
  // Phrase pattern feedback
  if (phraseScore > 15) {
    strengths.push("Good alignment with Ajay Banga's common phrases and expressions");
  } else {
    improvements.push("Incorporate more of his signature phrases");
    suggestions.push("Try starting with: 'The challenge before us', 'Let me be direct', 'As we look ahead'");
  }
  
  // Tone feedback
  if (toneScore > 15) {
    strengths.push("Professional and direct tone matches his style well");
  } else {
    improvements.push("Adopt a more direct, action-oriented tone");
    suggestions.push("Focus on concrete actions and measurable outcomes");
  }
  
  // Action language feedback
  if (actionScore > 12) {
    strengths.push("Excellent use of action-oriented language and calls to action");
  } else {
    improvements.push("Include more action verbs and specific calls to action");
    suggestions.push("Use phrases like: 'we must', 'requires action', 'demands collaboration'");
    missing.push("Clear call to action");
  }
  
  // Check for missing key elements
  if (!userSpeech.toLowerCase().includes('partner')) {
    missing.push("Emphasis on partnership and collaboration");
  }
  if (!hasNumbers(userSpeech)) {
    missing.push("Data-driven arguments with specific numbers");
  }
  if (!userSpeech.toLowerCase().includes('together')) {
    missing.push("Collective effort language");
  }
  
  return {
    score: Math.min(100, totalScore),
    strengths,
    improvements,
    suggestions,
    missing_elements: missing,
    vocabulary_match: vocabularyScore,
    phrase_match: phraseScore,
    tone_match: toneScore
  };
}

function analyzeVocabulary(userWords: string[]): number {
  const keyTerms = Object.keys(styleGuide.vocabulary);
  const userWordSet = new Set(userWords);
  
  let matches = 0;
  let weightedScore = 0;
  
  keyTerms.forEach(term => {
    if (userWordSet.has(term)) {
      matches++;
      // Weight by frequency in Banga's speeches
      const frequency = styleGuide.vocabulary[term as keyof typeof styleGuide.vocabulary];
      weightedScore += Math.min(3, frequency / 10);
    }
  });
  
  // Max 30 points
  return Math.min(30, weightedScore);
}

function analyzePhrases(userText: string): number {
  const common2Word = styleGuide.common_phrases['2_word'].slice(0, 30);
  const common3Word = styleGuide.common_phrases['3_word'].slice(0, 30);
  
  let score = 0;
  
  // Check for 2-word phrases
  common2Word.forEach(({ phrase }) => {
    if (userText.includes(phrase)) {
      score += 0.5;
    }
  });
  
  // Check for 3-word phrases (weighted more)
  common3Word.forEach(({ phrase }) => {
    if (userText.includes(phrase)) {
      score += 1;
    }
  });
  
  // Max 25 points
  return Math.min(25, score);
}

function analyzeTone(fullText: string, sentences: string[]): number {
  let score = 0;
  const lowerText = fullText.toLowerCase();
  
  // Check for direct language (5 points)
  const directPhrases = ['let me be direct', 'the facts are', 'the challenge', 'the reality'];
  directPhrases.forEach(phrase => {
    if (lowerText.includes(phrase)) score += 1.5;
  });
  
  // Check for professional but accessible tone (5 points)
  const avgSentenceLength = fullText.split(/\s+/).length / sentences.length;
  if (avgSentenceLength > 10 && avgSentenceLength < 25) {
    score += 5; // Good sentence length
  } else if (avgSentenceLength >= 25) {
    score += 2; // Too long
  }
  
  // Check for collaborative language (5 points)
  const collabWords = ['together', 'partner', 'collaboration', 'collective', 'shared'];
  collabWords.forEach(word => {
    if (lowerText.includes(word)) score += 1;
  });
  
  // Check for solution-oriented language (5 points)
  const solutionWords = ['solution', 'opportunity', 'achieve', 'success', 'progress'];
  solutionWords.forEach(word => {
    if (lowerText.includes(word)) score += 1;
  });
  
  // Check for typical closing (5 points)
  if (lowerText.includes('thank you')) score += 2;
  if (lowerText.includes('move forward') || lowerText.includes('join us')) score += 3;
  
  // Max 25 points
  return Math.min(25, score);
}

function analyzeActionLanguage(text: string): number {
  let score = 0;
  const lowerText = text.toLowerCase();
  
  // Action verbs (10 points)
  const actionVerbs = [
    'must', 'require', 'demand', 'need', 'drive', 'achieve', 'deliver',
    'ensure', 'create', 'build', 'invest', 'catalyze', 'mobilize'
  ];
  actionVerbs.forEach(verb => {
    if (lowerText.includes(verb)) score += 0.8;
  });
  
  // Measurable results language (5 points)
  const measurableTerms = ['measurable', 'results', 'accountability', 'progress', 'outcomes'];
  measurableTerms.forEach(term => {
    if (lowerText.includes(term)) score += 1;
  });
  
  // Call to action (5 points)
  if (lowerText.includes('call') || lowerText.includes('urge') || lowerText.includes('invite')) {
    score += 2;
  }
  if (lowerText.includes('work together') || lowerText.includes('join')) {
    score += 3;
  }
  
  // Max 20 points
  return Math.min(20, score);
}

function hasNumbers(text: string): boolean {
  return /\d/.test(text);
}

export function generateImprovedVersion(userSpeech: string): string {
  // Simple template-based improvement
  const analysis = analyzeSpeech(userSpeech);
  
  let improved = userSpeech;
  
  // Add opening if missing
  if (!userSpeech.toLowerCase().startsWith('let me') && !userSpeech.toLowerCase().startsWith('the ')) {
    const openings = [
      "Let me be direct. ",
      "The challenge before us is clear. ",
      "As we look ahead, "
    ];
    improved = openings[Math.floor(Math.random() * openings.length)] + improved;
  }
  
  // Enhance with partnership language if missing
  if (!improved.toLowerCase().includes('partner') && !improved.toLowerCase().includes('together')) {
    improved = improved.replace(/\. ([A-Z])/, '. Together, we can achieve results no single actor could accomplish alone. $1');
  }
  
  // Add closing if missing
  if (!improved.toLowerCase().includes('thank you')) {
    improved += "\n\nSuccess may demand hard work and vision, but it is within reach if we move forward together. Thank you.";
  }
  
  return improved;
}

export function getSpeechesDatabase() {
  return speechesDatabase;
}

