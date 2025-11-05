/**
 * World Bank Org Chart API Route
 *
 * Provides endpoints for organizational chart data
 */

import { NextRequest, NextResponse } from 'next/server';
import { WorldBankOrgChartDB } from '@/lib/worldbank-orgchart-db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'hierarchy';
    const id = searchParams.get('id');
    const level = searchParams.get('level') ? parseInt(searchParams.get('level')!) : null;
    const query = searchParams.get('q');

    const db = new WorldBankOrgChartDB();

    switch (action) {
      case 'hierarchy':
        const hierarchy = await db.getOrgChartHierarchy();
        return NextResponse.json({ hierarchy });

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
        return NextResponse.json({ children });

      case 'member':
        if (!id) {
          return NextResponse.json({ error: 'ID parameter required' }, { status: 400 });
        }
        const member = await db.getMemberById(id);
        if (!member) {
          return NextResponse.json({ error: 'Member not found' }, { status: 404 });
        }
        return NextResponse.json({ member });

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