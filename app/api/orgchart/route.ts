import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Cache for 5 minutes

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const level = searchParams.get('level');
  const parentId = searchParams.get('parentId');
  
  console.log('🏢 Orgchart API called:', { level, parentId });
  
  try {
    const supabase = createClient();
    
    let query = supabase
      .from('worldbank_orgchart_hierarchy')
      .select('id, name, position, avatar_url, bio, level, department, parent_id, children_count, region, function, is_active')
      .eq('is_active', true)
      .order('level', { ascending: true })
      .order('name', { ascending: true });
    
    // Apply filters if provided
    if (level) {
      const levelNum = parseInt(level, 10);
      query = query.eq('level', levelNum);
      console.log(`  Filtering by level: ${levelNum}`);
    }
    
    if (parentId) {
      query = query.eq('parent_id', parentId);
      console.log(`  Filtering by parent: ${parentId}`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('❌ Orgchart query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch org chart', details: error.message },
        { status: 500 }
      );
    }
    
    // Fix avatar URLs - ensure they point to /avatars/ directory
    const fixedData = data?.map(member => {
      if (member.avatar_url && !member.avatar_url.startsWith('/avatars/')) {
        // Extract filename and fix path
        const filename = member.avatar_url.split('/').pop();
        return {
          ...member,
          avatar_url: `/avatars/${filename}`
        };
      }
      return member;
    });
    
    console.log(`✅ Orgchart loaded: ${fixedData?.length || 0} members`);
    
    return NextResponse.json({
      hierarchy: fixedData || [],
      count: fixedData?.length || 0
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      }
    });
    
  } catch (error: any) {
    console.error('❌ Orgchart API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

