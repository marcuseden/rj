import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

// Legacy endpoint that includes JSON file documents
// For backward compatibility with existing document IDs
export const dynamic = 'force-dynamic';
export const revalidate = 300;

export async function GET() {
  console.log('📚 Loading legacy documents (JSON files + DB)...');
  
  try {
    const supabase = createClient();
    
    // Get database items from materialized view
    const { data: dbData, error } = await supabase
      .from('worldbank_unified_search')
      .select('*')
      .order('date', { ascending: false })
      .limit(1000); // Reasonable limit
    
    if (error) {
      console.error('❌ DB fetch error:', error);
    }
    
    // Convert DB format to legacy document format
    const dbDocs = (dbData || []).map(item => ({
      id: item.id,
      title: item.title,
      summary: item.summary,
      date: item.date,
      sourceType: item.source_type,
      tags: {
        documentType: item.document_type,
        authors: item.authors,
        sectors: item.sectors,
        regions: item.regions,
        departments: item.departments,
        priority: item.priority
      },
      metadata: {
        readingTime: item.reading_time,
        wordCount: item.word_count
      }
    }));
    
    // Load legacy JSON files
    let legacyDocs: any[] = [];
    
    try {
      const [ajayDocs, strategyDocs, allDocs] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/data/worldbank-strategy/ajay-banga-documents-verified.json`).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/data/worldbank-strategy/documents.json`).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/data/worldbank-strategy/all-documents-indexed.json`).then(r => r.ok ? r.json() : []).catch(() => [])
      ]);
      
      legacyDocs = [
        ...ajayDocs.map((d: any) => ({ ...d, sourceType: 'speech' })),
        ...strategyDocs.map((d: any) => ({ ...d, sourceType: 'strategy' })),
        ...allDocs.map((d: any) => ({ ...d, sourceType: d.tags?.departments?.length ? 'department' : 'general' }))
      ];
    } catch (e) {
      console.warn('⚠️ Could not load legacy JSON files:', e);
    }
    
    // Combine and deduplicate
    const allDocuments = [...dbDocs, ...legacyDocs];
    const uniqueDocs = Array.from(
      new Map(allDocuments.map(doc => [doc.id, doc])).values()
    );
    
    console.log(`✅ Legacy endpoint: ${uniqueDocs.length} documents (${dbDocs.length} from DB, ${legacyDocs.length} from JSON)`);
    
    return NextResponse.json({
      documents: uniqueDocs,
      counts: {
        database: dbDocs.length,
        legacy: legacyDocs.length,
        total: uniqueDocs.length
      }
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      }
    });
    
  } catch (error: any) {
    console.error('❌ Legacy API error:', error);
    return NextResponse.json(
      { error: 'Failed to load documents', details: error.message },
      { status: 500 }
    );
  }
}


