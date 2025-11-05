import React from 'react';

interface ContentFormatterProps {
  content: string;
  className?: string;
}

export function ContentFormatter({ content, className = '' }: ContentFormatterProps) {
  // Function to extract readable text from content
  const extractReadableContent = (rawContent: string): string => {
    if (!rawContent) return '';

    // Try to parse as JSON first (World Bank API responses)
    try {
      const parsed = JSON.parse(rawContent);
      // Extract readable content from World Bank API structure
      if (parsed.everything) {
        const speeches = Object.values(parsed.everything) as any[];
        const readableTexts: string[] = [];

        speeches.forEach((speech: any) => {
          if (speech.desc || speech.ml_abstracts) {
            const text = speech.desc || speech.ml_abstracts;
            // Clean up the text by removing excessive newlines and formatting
            const cleaned = text
              .replace(/\\n/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();
            readableTexts.push(cleaned);
          }
        });

        return readableTexts.join('\n\n');
      }
    } catch (e) {
      // Not JSON, treat as plain text
    }

    // For plain text, clean up formatting
    return rawContent
      .replace(/\\n/g, '\n')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Function to format content with proper HTML structure
  const formatContent = (text: string) => {
    const readableText = extractReadableContent(text);
    if (!readableText) return null;

    // Split content into paragraphs (double newlines, or by sentence boundaries)
    let paragraphs = readableText.split(/\n\s*\n/).filter(p => p.trim().length > 0);

    // If no double newlines found, try to split by sentence endings
    if (paragraphs.length === 1) {
      paragraphs = readableText.split(/(?<=\.|\?|!)\s+(?=[A-Z])/).filter(p => p.trim().length > 0);
    }

    // If still one paragraph, split by reasonable line lengths (around 300-500 chars)
    if (paragraphs.length === 1 && readableText.length > 500) {
      const chunkSize = 400;
      paragraphs = [];
      for (let i = 0; i < readableText.length; i += chunkSize) {
        let chunk = readableText.slice(i, i + chunkSize);
        // Try to break at sentence endings within the chunk
        const lastSentenceEnd = Math.max(
          chunk.lastIndexOf('. '),
          chunk.lastIndexOf('? '),
          chunk.lastIndexOf('! ')
        );
        if (lastSentenceEnd > chunkSize * 0.5) {
          chunk = chunk.slice(0, lastSentenceEnd + 1);
          i -= (chunkSize - lastSentenceEnd - 1); // Adjust position
        }
        paragraphs.push(chunk.trim());
      }
    }

    return paragraphs.map((paragraph, index) => {
      const trimmed = paragraph.trim();

      // Check if this looks like a heading (short line, ends with colon, or all caps)
      if (isHeading(trimmed)) {
        return (
          <h3 key={index} className="text-lg font-semibold text-gray-900 mt-6 mb-3 first:mt-0">
            {formatTextWithBold(trimmed.replace(/:$/, ''))}
          </h3>
        );
      }

      // Check if this is a bullet point or numbered list
      if (trimmed.match(/^[-•*]\s/) || trimmed.match(/^\d+\.\s/)) {
        return (
          <ul key={index} className="list-disc list-inside ml-4 mb-4 space-y-1">
            {trimmed.split('\n').map((item, itemIndex) => (
              <li key={itemIndex} className="text-gray-700 leading-relaxed">
                {formatTextWithBold(item.replace(/^[-•*\s\d\.]+\s*/, ''))}
              </li>
            ))}
          </ul>
        );
      }

      // Regular paragraph
      return (
        <p key={index} className="text-gray-700 leading-relaxed mb-4 last:mb-0">
          {formatTextWithBold(trimmed)}
        </p>
      );
    });
  };

  // Check if text looks like a heading
  const isHeading = (text: string): boolean => {
    // Short lines that might be headings
    if (text.length < 100 && (
      text.endsWith(':') ||
      text.toUpperCase() === text ||
      /^\d+\./.test(text) ||
      text.includes('Key') && text.includes(':') ||
      text.includes('Important') && text.includes(':') ||
      text.includes('Summary') ||
      text.includes('Conclusion') ||
      text.includes('Introduction')
    )) {
      return true;
    }
    return false;
  };

  // Format text with bold elements (words that should be emphasized)
  const formatTextWithBold = (text: string): React.ReactNode => {
    if (!text) return text;

    // Split by potential bold markers or key terms
    const parts = text.split(/(\*\*.*?\*\*|".*?"|'.*?'|\b(World Bank|Ajay Banga|Banga|President|CEO|Chairman|Director|Minister|Prime Minister|Secretary|Ambassador)\b)/gi);

    return parts.map((part, index) => {
      if (!part) return part;

      // Check for bold markers
      if (part.startsWith && part.startsWith('**') && part.endsWith && part.endsWith('**')) {
        return <strong key={index} className="font-semibold">{part.slice(2, -2)}</strong>;
      }

      // Check for quoted text
      if ((part.startsWith && part.startsWith('"') && part.endsWith && part.endsWith('"')) ||
          (part.startsWith && part.startsWith("'") && part.endsWith && part.endsWith("'"))) {
        return <em key={index} className="italic">{part}</em>;
      }

      // Check for important titles/people
      if (part && /\b(World Bank|Ajay Banga|Banga|President|CEO|Chairman|Director|Minister|Prime Minister|Secretary|Ambassador)\b/gi.test(part)) {
        return <strong key={index} className="font-semibold text-gray-900">{part}</strong>;
      }

      return part;
    });
  };

  return (
    <div className={`prose prose-gray max-w-none ${className}`}>
      {formatContent(content)}
    </div>
  );
}
