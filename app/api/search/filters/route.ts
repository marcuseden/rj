import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 900; // Cache for 15 minutes

export async function GET() {
  console.log('🎛️ Loading search filters...');
  
  try {
    const supabase = createClient();
    
    // Compute filters from actual data
    const [
      { data: documents },
      { data: countries },
      { data: people }
    ] = await Promise.all([
      supabase.from('worldbank_documents').select('tags_authors, tags_document_type, tags_sectors, tags_regions, tags_departments'),
      supabase.from('worldbank_countries').select('region, sector_focus'),
      supabase.from('worldbank_orgchart').select('department, region').eq('is_active', true)
    ]);
    
    // Extract unique values
    const authors = new Set<string>();
    const documentTypes = new Set<string>();
    const sectors = new Set<string>();
    const regions = new Set<string>();
    const departments = new Set<string>();
    
    documents?.forEach((doc: any) => {
      doc.tags_authors?.forEach((a: string) => authors.add(a));
      if (doc.tags_document_type) documentTypes.add(doc.tags_document_type);
      doc.tags_sectors?.forEach((s: string) => sectors.add(s));
      doc.tags_regions?.forEach((r: string) => regions.add(r));
      doc.tags_departments?.forEach((d: string) => departments.add(d));
    });
    
    countries?.forEach((c: any) => {
      if (c.region) regions.add(c.region);
      c.sector_focus?.forEach((s: string) => sectors.add(s));
    });
    
    people?.forEach((p: any) => {
      if (p.department) departments.add(p.department);
      if (p.region) regions.add(p.region);
    });
    
    const filters = {
      authors: Array.from(authors).sort(),
      documentTypes: Array.from(documentTypes).sort(),
      sectors: Array.from(sectors).sort(),
      regions: Array.from(regions).sort(),
      departments: Array.from(departments).sort(),
      sourceTypes: {
        all: (documents?.length || 0) + (countries?.length || 0) + (people?.length || 0),
        document: documents?.length || 0,
        country: countries?.length || 0,
        person: people?.length || 0,
        project: 0 // Computed dynamically from countries
      }
    };
    
    console.log('✅ Filters computed successfully');
    
    return NextResponse.json(filters, {
      headers: {
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
      }
    });
    
  } catch (error: any) {
    console.error('❌ Filter API error:', error);
    return NextResponse.json(
      { error: 'Failed to load filters', details: error.message },
      { status: 500 }
    );
  }
}

