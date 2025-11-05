import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import * as fs from 'fs/promises';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

interface WorldBankAPIDocument {
  id: string;
  title: string;
  abstract?: string;
  url?: string;
  docdate?: string;
  doctype?: string;
  topic?: string[];
  region?: string[];
  country?: string[];
}

async function fetchFromWorldBankAPI(page: number = 1, perPage: number = 50): Promise<any> {
  console.log(`📥 Fetching page ${page}...`);
  
  const offset = (page - 1) * perPage;
  const url = `https://search.worldbank.org/api/v2/wds?format=json&qterm=ajay+banga+OR+world+bank+strategy&rows=${perPage}&os=${offset}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  // Convert documents object to array
  const documents = data.documents ? Object.values(data.documents) : [];
  
  return {
    ...data,
    documents: documents
  };
}

async function enrichDocumentWithAI(doc: WorldBankAPIDocument): Promise<any> {
  try {
    const prompt = `Analyze this World Bank document and extract key information for indexing.

DOCUMENT:
Title: ${doc.title}
Abstract: ${doc.abstract || 'N/A'}
Type: ${doc.doctype || 'Unknown'}
Date: ${doc.docdate || 'Unknown'}

Extract and categorize:
1. Document type (speech, strategy, report, initiative, policy)
2. Priority level (high/medium/low) based on strategic importance
3. Key sectors involved
4. Regions covered
5. Main initiatives mentioned
6. Authors (if mentioned)
7. Brief summary (200 words max)
8. Reading time estimate

Return JSON:
{
  "document_type": "speech",
  "priority": "high",
  "sectors": ["Climate", "Infrastructure"],
  "regions": ["Global", "Africa"],
  "initiatives": ["Evolution Roadmap"],
  "authors": ["Ajay Banga"],
  "summary": "...",
  "reading_time": 10
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a document categorization expert. Extract factual information only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    return JSON.parse(completion.choices[0].message.content || '{}');
  } catch (error) {
    console.error('  ❌ AI enrichment failed:', error);
    return null;
  }
}

async function main() {
  console.log('🌍 INDEXING ALL WORLD BANK DOCUMENTS FROM API');
  console.log('=' .repeat(70));
  console.log('🎯 Target: 1000+ documents from World Bank API\n');

  const allDocuments: any[] = [];
  let page = 1;
  let totalAvailable = 0;
  let hasMore = true;

  // Fetch all pages
  while (hasMore && page <= 20) { // Limit to 20 pages = 1000 docs
    try {
      const result = await fetchFromWorldBankAPI(page, 50);
      
      if (page === 1) {
        totalAvailable = result.total || 0;
        console.log(`📊 Total available: ${totalAvailable} documents\n`);
      }

      const documents = result.documents || [];
      console.log(`  ✅ Page ${page}: ${documents.length} documents`);
      
      if (documents.length === 0) {
        hasMore = false;
      } else {
        allDocuments.push(...documents);
        page++;
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`❌ Error fetching page ${page}:`, error);
      hasMore = false;
    }
  }

  console.log(`\n📦 Fetched ${allDocuments.length} documents from API`);
  console.log(`🤖 Starting AI enrichment...\n`);

  const enrichedDocs = [];
  let processed = 0;

  for (const doc of allDocuments.slice(0, 100)) { // Process first 100 for now
    try {
      console.log(`[${++processed}/${Math.min(100, allDocuments.length)}] ${doc.title?.substring(0, 60)}...`);
      
      const enrichment = await enrichDocumentWithAI({
        id: doc.id,
        title: doc.display_title || doc.title,
        abstract: doc.abstracts,
        url: doc.url,
        docdate: doc.docdt,
        doctype: doc.docty,
        topic: doc.topic,
        region: doc.count?.region,
      });

      if (enrichment) {
        enrichedDocs.push({
          id: doc.id || `wb-${Date.now()}-${processed}`,
          title: doc.display_title || doc.title,
          summary: enrichment.summary || doc.abstracts || 'No summary available',
          date: doc.docdt || 'Unknown',
          tags: {
            documentType: enrichment.document_type || 'document',
            sectors: enrichment.sectors || [],
            regions: enrichment.regions || [],
            initiatives: enrichment.initiatives || [],
            authors: enrichment.authors || [],
            priority: enrichment.priority || 'medium',
          },
          sourceReference: {
            originalUrl: doc.url || '',
            scrapedFrom: 'World Bank API'
          },
          metadata: {
            wordCount: (doc.abstracts?.split(' ').length || 0) * 10,
            readingTime: enrichment.reading_time || 5
          }
        });
      }

      // Rate limiting for OpenAI
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`  ❌ Error processing document:`, error);
    }
  }

  console.log(`\n${'='.repeat(70)}`);
  console.log(`📊 INDEXING COMPLETE:`);
  console.log(`${'='.repeat(70)}`);
  console.log(`📥 Fetched from API: ${allDocuments.length}`);
  console.log(`🤖 Enriched with AI: ${enrichedDocs.length}`);
  console.log(`💾 Ready to save`);

  // Save to file
  await fs.writeFile(
    'data/worldbank-strategy/all-documents-indexed.json',
    JSON.stringify(enrichedDocs, null, 2)
  );

  console.log(`\n✅ Saved to: data/worldbank-strategy/all-documents-indexed.json`);
  console.log(`\n🎉 Ready to use in the app!`);
  
  // Summary by category
  const byType = enrichedDocs.reduce((acc: any, doc) => {
    const type = doc.tags.documentType;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  console.log(`\n📋 Documents by type:`);
  Object.entries(byType).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });
}

main().catch(console.error);

