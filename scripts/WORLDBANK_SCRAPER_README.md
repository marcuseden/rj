# World Bank Strategy Document Scraper

## Overview

This scraper collects public World Bank strategy documents and articles related to RJ Banga (Ajay Banga)'s leadership and the bank's strategic direction. The data can be indexed and used to enhance the AI coach agent's knowledge base.

## What It Scrapes

### Document Types
1. **Presidential Speeches & Statements** - RJ Banga's vision and announcements
2. **Strategy Documents** - Official World Bank strategic plans
3. **Blog Articles** - Insights and analysis from World Bank experts
4. **News Articles** - Latest updates on initiatives and changes
5. **Initiatives & Projects** - Specific programs and change processes

### Key Topics Tracked
- Climate & Environment
- Poverty & Inequality
- Digital Transformation
- Governance & Reform
- Partnerships
- Financial Strategy
- Organizational Change
- Leadership Vision

## Usage

### Run the Scraper

```bash
npm run scrape:worldbank
```

### Output Structure

```
data/worldbank-strategy/
├── documents.json           # Complete collection
├── index.json              # Searchable index
├── README.md               # Summary report
└── documents/              # Individual document files
    ├── doc1.json
    ├── doc2.json
    └── ...
```

### Document Format

Each document is stored as:

```json
{
  "id": "unique-id",
  "title": "Document Title",
  "url": "https://worldbank.org/...",
  "content": "Full text content...",
  "summary": "Brief summary...",
  "date": "2025-01-01",
  "type": "strategy",
  "topics": ["Climate & Environment", "Leadership Vision"],
  "keywords": ["banga", "climate", "strategy"],
  "scrapedAt": "2025-11-02T..."
}
```

## Integration with AI Agent

### Option 1: Load at Runtime

```typescript
import documents from '@/data/worldbank-strategy/documents.json';

// Filter by topic
const climateStrategy = documents.filter(d => 
  d.topics.includes('Climate & Environment')
);

// Filter by date
const recentDocs = documents.filter(d => 
  new Date(d.date) > new Date('2024-01-01')
);

// Search by keyword
const bangaVision = documents.filter(d => 
  d.keywords.includes('banga')
);
```

### Option 2: Add to Agent Context

```typescript
// In lib/elevenlabs-agent.ts or agent prompt
const worldBankContext = `
World Bank Strategic Context:
${documents.map(d => `- ${d.title}: ${d.summary}`).join('\n')}
`;

// Add to agent configuration
const conversation = useConversation({
  overrides: {
    agent: {
      prompt: {
        prompt: basePrompt + '\n\n' + worldBankContext
      }
    }
  }
});
```

### Option 3: Create RAG System

```typescript
// Use vector embeddings for semantic search
import { OpenAIEmbeddings } from 'langchain/embeddings';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';

// Create vector store from documents
const vectorStore = await MemoryVectorStore.fromTexts(
  documents.map(d => d.content),
  documents.map(d => ({ id: d.id, title: d.title, url: d.url })),
  new OpenAIEmbeddings()
);

// Search when user asks questions
const results = await vectorStore.similaritySearch(userQuestion, 3);
```

## Configuration

### Customize Search Terms

Edit `searchTerms` in the scraper:

```typescript
private searchTerms = [
  'Ajay Banga',
  'Your custom term',
  // ...
];
```

### Adjust Max Documents

```typescript
const scraper = new WorldBankStrategyScraper({
  maxDocuments: 200, // Increase limit
});
```

### Enable/Disable PDFs

```typescript
const scraper = new WorldBankStrategyScraper({
  includePDFs: true, // Set to false to skip PDFs
});
```

## Features

### ✅ Implemented
- [x] Scrapes multiple World Bank sources
- [x] Filters for relevant content
- [x] Extracts metadata (dates, topics, keywords)
- [x] Generates summaries
- [x] Creates searchable index
- [x] Categorizes by topic
- [x] Removes duplicates
- [x] Handles errors gracefully

### 🚧 Future Enhancements
- [ ] PDF text extraction
- [ ] Image/chart extraction
- [ ] Automatic updates (cron job)
- [ ] Vector embeddings integration
- [ ] Advanced NLP summarization
- [ ] Multi-language support
- [ ] API endpoint for querying

## Maintenance

### Update Frequency

Run regularly to keep data current:

```bash
# Manual update
npm run scrape:worldbank

# Or set up cron job (Unix/Mac)
0 0 * * 0 cd /path/to/project && npm run scrape:worldbank
```

### Data Validation

Check the generated `README.md` in the output directory for:
- Total documents scraped
- Topic distribution
- Date coverage
- Keyword analysis

## Troubleshooting

### No Documents Found

1. Check internet connection
2. Verify World Bank sites are accessible
3. Check for rate limiting (add delays)
4. Review search terms

### Insufficient Content

Some pages may have little text. The scraper automatically skips documents with <100 characters.

### CSP Issues

If running in browser context, ensure Content Security Policy allows external requests.

## Examples

### Find Climate Strategy Documents

```typescript
import documents from './data/worldbank-strategy/documents.json';

const climateStrategies = documents.filter(d => 
  d.topics.includes('Climate & Environment') &&
  d.type === 'strategy'
);

console.log(`Found ${climateStrategies.length} climate strategy documents`);
```

### Get Latest Leadership Vision

```typescript
const leadership = documents
  .filter(d => d.topics.includes('Leadership Vision'))
  .sort((a, b) => b.date.localeCompare(a.date))
  .slice(0, 5);
```

### Search by Keyword

```typescript
const searchResults = documents.filter(d => 
  d.keywords.includes('transformation') ||
  d.content.toLowerCase().includes('digital transformation')
);
```

## Integration Checklist

- [ ] Run scraper: `npm run scrape:worldbank`
- [ ] Review output in `data/worldbank-strategy/`
- [ ] Check `README.md` for summary
- [ ] Load documents into agent context
- [ ] Test agent with World Bank questions
- [ ] Set up regular updates

## Notes

- Respects robots.txt
- Uses ethical scraping practices
- Public documents only
- Proper attribution maintained
- Rate-limited to avoid overwhelming servers

---

**Created**: November 2025  
**Purpose**: Enhance AI coach agent with World Bank strategic knowledge  
**Maintainer**: ICF Coach Development Team

