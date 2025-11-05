# Integrating World Bank Knowledge into AI Coach Agent

## Overview

This guide explains how to integrate the scraped World Bank strategy documents into your ElevenLabs AI coach agent to provide informed responses about World Bank initiatives, RJ Banga's vision, and institutional changes.

## Step 1: Scrape the Data

```bash
npm run scrape:worldbank
```

This creates:
- `data/worldbank-strategy/documents.json` - All documents
- `data/worldbank-strategy/index.json` - Searchable index  
- `data/worldbank-strategy/README.md` - Summary report

## Step 2: Integration Approaches

### Approach A: Static Context (Simple)

Add World Bank knowledge directly to the agent's prompt:

```typescript
// app/(authenticated)/voice-session/page.tsx

import worldBankDocs from '@/data/worldbank-strategy/documents.json';

// Create context summary
const worldBankContext = worldBankDocs
  .slice(0, 10) // Top 10 most relevant
  .map(d => `- ${d.title}: ${d.summary}`)
  .join('\n');

const conversation = useConversation({
  overrides: {
    agent: {
      prompt: {
        prompt: `You are an ICF-aligned executive coach.

World Bank Strategic Context:
${worldBankContext}

Use this knowledge when discussing organizational change, leadership, or World Bank-related topics.`
      }
    }
  }
});
```

**Pros**: Simple, no external dependencies  
**Cons**: Limited to prompt size, static data

### Approach B: Dynamic Context Loading (Recommended)

Load relevant documents based on conversation context:

```typescript
// lib/worldbank-knowledge.ts

import documents from '@/data/worldbank-strategy/documents.json';

export class WorldBankKnowledgeBase {
  
  /**
   * Search for relevant documents by topic
   */
  static searchByTopic(topic: string): Document[] {
    return documents.filter(d => 
      d.topics.some(t => t.toLowerCase().includes(topic.toLowerCase()))
    );
  }

  /**
   * Search by keywords
   */
  static searchByKeywords(keywords: string[]): Document[] {
    return documents.filter(d =>
      keywords.some(kw => 
        d.keywords.includes(kw.toLowerCase()) ||
        d.content.toLowerCase().includes(kw.toLowerCase())
      )
    );
  }

  /**
   * Get recent strategic documents
   */
  static getRecentStrategy(limit: number = 5): Document[] {
    return documents
      .filter(d => d.type === 'strategy')
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, limit);
  }

  /**
   * Get RJ Banga's vision documents
   */
  static getBangaVision(): Document[] {
    return documents.filter(d =>
      d.keywords.includes('banga') ||
      d.topics.includes('Leadership Vision')
    );
  }

  /**
   * Get contextual knowledge for conversation
   */
  static getContextForQuery(query: string): string {
    const queryLower = query.toLowerCase();
    
    // Detect topic from query
    let relevantDocs: Document[] = [];
    
    if (queryLower.includes('climate')) {
      relevantDocs = this.searchByTopic('Climate');
    } else if (queryLower.includes('banga') || queryLower.includes('leadership')) {
      relevantDocs = this.getBangaVision();
    } else if (queryLower.includes('strategy')) {
      relevantDocs = this.getRecentStrategy();
    } else {
      // General search
      const keywords = query.split(' ').filter(w => w.length > 3);
      relevantDocs = this.searchByKeywords(keywords);
    }
    
    // Format as context
    return relevantDocs
      .slice(0, 3)
      .map(d => `${d.title}\n${d.summary}\nSource: ${d.url}`)
      .join('\n\n');
  }
}
```

Then use it with contextual updates:

```typescript
// In your voice session component

const conversation = useConversation({
  onMessage: (message) => {
    if (message.source === 'user') {
      // Get relevant World Bank knowledge
      const context = WorldBankKnowledgeBase.getContextForQuery(message.message);
      
      if (context) {
        // Send as contextual update
        conversation.sendContextualUpdate(
          `Relevant World Bank knowledge:\n${context}`
        );
      }
    }
  }
});
```

**Pros**: Dynamic, relevant, efficient  
**Cons**: Requires more implementation

### Approach C: Vector Search (Advanced)

For semantic search using embeddings:

```bash
npm install @langchain/community @langchain/openai
```

```typescript
// lib/worldbank-vector-store.ts

import { OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from '@langchain/community/vectorstores/memory';
import documents from '@/data/worldbank-strategy/documents.json';

let vectorStore: MemoryVectorStore | null = null;

export async function initializeVectorStore() {
  if (vectorStore) return vectorStore;
  
  console.log('🔧 Initializing World Bank vector store...');
  
  const texts = documents.map(d => `${d.title}\n\n${d.content}`);
  const metadatas = documents.map(d => ({
    id: d.id,
    title: d.title,
    url: d.url,
    date: d.date,
    type: d.type,
    topics: d.topics
  }));
  
  vectorStore = await MemoryVectorStore.fromTexts(
    texts,
    metadatas,
    new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY
    })
  );
  
  console.log('✅ Vector store initialized');
  return vectorStore;
}

export async function searchWorldBankKnowledge(query: string, k: number = 3) {
  const store = await initializeVectorStore();
  const results = await store.similaritySearch(query, k);
  
  return results.map(doc => ({
    content: doc.pageContent,
    metadata: doc.metadata
  }));
}
```

Usage:

```typescript
import { searchWorldBankKnowledge } from '@/lib/worldbank-vector-store';

const conversation = useConversation({
  onMessage: async (message) => {
    if (message.source === 'user') {
      const results = await searchWorldBankKnowledge(message.message);
      
      const context = results
        .map(r => `${r.metadata.title}\n${r.content.substring(0, 500)}...`)
        .join('\n\n');
      
      conversation.sendContextualUpdate(context);
    }
  }
});
```

**Pros**: Semantic search, highly relevant results  
**Cons**: Requires OpenAI API, more complex

## Use Cases

### Executive Coaching Context

When coaching World Bank executives or discussing organizational change:

```typescript
// Detect World Bank context in conversation
if (conversationIncludes(['world bank', 'banga', 'institutional change'])) {
  const relevantDocs = WorldBankKnowledgeBase.getRecentStrategy(3);
  const context = `Current World Bank initiatives: ${formatDocs(relevantDocs)}`;
  conversation.sendContextualUpdate(context);
}
```

### Strategic Planning Discussions

When discussing strategy:

```typescript
const strategyDocs = documents.filter(d => 
  d.type === 'strategy' && 
  d.date > '2024-01-01'
);

// Add to agent context
conversation.sendContextualUpdate(
  `Recent World Bank strategic priorities: ${summarize(strategyDocs)}`
);
```

### Change Management Coaching

When coaching on change processes:

```typescript
const changeDocs = WorldBankKnowledgeBase.searchByTopic('Organizational Change');

conversation.sendContextualUpdate(
  `World Bank change initiatives for reference: ${summarize(changeDocs)}`
);
```

## Best Practices

### 1. Relevance Filtering

Only send context when relevant:

```typescript
function isWorldBankRelated(message: string): boolean {
  const keywords = ['world bank', 'banga', 'multilateral', 'development bank'];
  return keywords.some(kw => message.toLowerCase().includes(kw));
}
```

### 2. Context Size Management

Keep context concise to avoid overwhelming the agent:

```typescript
const context = relevantDocs
  .slice(0, 3) // Max 3 documents
  .map(d => d.summary) // Use summaries, not full content
  .join('\n');
```

### 3. Source Attribution

Always include sources:

```typescript
const context = relevantDocs.map(d => 
  `${d.summary}\nSource: ${d.url} (${d.date})`
).join('\n\n');
```

### 4. Regular Updates

Keep data fresh:

```bash
# Weekly cron job
0 0 * * 0 npm run scrape:worldbank
```

## Testing

### Test the Scraper

```bash
# Run with limited documents for testing
npm run scrape:worldbank

# Check output
cat data/worldbank-strategy/README.md
```

### Test Agent Integration

```typescript
// Test in voice session
console.log('Testing World Bank knowledge...');

const testQuery = "Tell me about World Bank's climate strategy";
const context = WorldBankKnowledgeBase.getContextForQuery(testQuery);

console.log('Relevant context:', context);
```

## Performance Considerations

### Document Count

Start with fewer documents:
- Development: 20-50 documents
- Production: 100-200 documents

### Embedding Costs

If using vector search:
- Cache embeddings
- Use cheaper embedding models
- Batch processing

### Update Frequency

Balance freshness vs. costs:
- Critical updates: Daily
- Regular updates: Weekly  
- Archive updates: Monthly

## Monitoring

Track scraper performance:

```typescript
// Add to scraper
private stats = {
  totalAttempts: 0,
  successful: 0,
  failed: 0,
  duplicates: 0
};
```

## Security

### API Keys

Never expose in scraped data:
- Sanitize URLs
- Remove authentication tokens
- Strip sensitive metadata

### Data Privacy

Only scrape public documents:
- Check robots.txt
- Respect rate limits
- Follow Terms of Service

## Next Steps

1. ✅ Run scraper: `npm run scrape:worldbank`
2. ✅ Review output data
3. ✅ Choose integration approach
4. ✅ Implement in agent
5. ✅ Test with real queries
6. ✅ Set up automation
7. ✅ Monitor and maintain

---

**Questions?** Check `scripts/WORLDBANK_SCRAPER_README.md` for detailed documentation.

