/**
 * World Bank Org Chart API Route
 *
 * Provides endpoints for organizational chart data
 */

import { NextRequest, NextResponse } from 'next/server';
import { WorldBankOrgChartDB } from '@/lib/worldbank-orgchart-db';

// Enable caching for GET requests (30 minutes)
export const revalidate = 1800; // 30 minutes in seconds

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'hierarchy';
    const id = searchParams.get('id');
    const level = searchParams.get('level') ? parseInt(searchParams.get('level')!) : null;
    const query = searchParams.get('q');

    const db = new WorldBankOrgChartDB();
    
    // Valid avatar URLs to prevent 404 errors
    const validAvatars = ['ajay-banga-avatar.jpg', '/ajay-banga-avatar.jpg'];

    switch (action) {
      case 'hierarchy':
        const hierarchy = await db.getOrgChartHierarchy();
        
        // Clean up avatar URLs - remove non-existent images to prevent 404 errors
        const cleanedHierarchy = hierarchy.map(member => {
          // Only keep avatar_url if it's the Ajay Banga one or if it exists in public folder
          // For now, remove all avatar_url except for known good ones
          const hasValidAvatar = member.avatar_url && validAvatars.some(valid => 
            member.avatar_url?.includes(valid)
          );
          
          return {
            ...member,
            avatar_url: hasValidAvatar ? member.avatar_url : undefined
          };
        });
        
        // Add cache headers
        return NextResponse.json({ hierarchy: cleanedHierarchy }, {
          headers: {
            'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600'
          }
        });

      case 'level':
        if (!level) {
          return NextResponse.json({ error: 'Level parameter required' }, { status: 400 });
        }
        const levelMembers = await db.getMembersByLevel(level);
        return NextResponse.json({ members: levelMembers });

      case 'children':
        if (!id) {
          return NextResponse.json({ error: 'ID parameter required' }, { status: 400 });
        }
        const children = await db.getMemberChildren(id);
        
        // Clean avatar URLs
        const cleanedChildren = children.map(child => ({
          ...child,
          avatar_url: child.avatar_url && validAvatars.some(valid => child.avatar_url?.includes(valid)) 
            ? child.avatar_url 
            : undefined
        }));
        
        return NextResponse.json({ children: cleanedChildren });

      case 'member':
        if (!id) {
          return NextResponse.json({ error: 'ID parameter required' }, { status: 400 });
        }
        const member = await db.getMemberById(id);
        if (!member) {
          return NextResponse.json({ error: 'Member not found' }, { status: 404 });
        }
        
        // Clean avatar URL
        const hasValidAvatar = member.avatar_url && validAvatars.some(valid => 
          member.avatar_url?.includes(valid)
        );
        
        return NextResponse.json({ 
          member: {
            ...member,
            avatar_url: hasValidAvatar ? member.avatar_url : undefined
          }
        });

      case 'search':
        if (!query) {
          return NextResponse.json({ error: 'Query parameter required' }, { status: 400 });
        }
        const searchResults = await db.searchMembers(query);
        return NextResponse.json({ results: searchResults });

      case 'stats':
        const stats = await db.getStats();
        return NextResponse.json({ stats });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in org chart API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch org chart data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = new WorldBankOrgChartDB();

    // Upsert member
    const member = await db.upsertMember(body);
    return NextResponse.json({ member, success: true });
  } catch (error) {
    console.error('Error creating/updating member:', error);
    return NextResponse.json(
      { error: 'Failed to save member' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID parameter required' }, { status: 400 });
    }

    const db = new WorldBankOrgChartDB();
    await db.deactivateMember(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deactivating member:', error);
    return NextResponse.json(
      { error: 'Failed to deactivate member' },
      { status: 500 }
    );
  }
}