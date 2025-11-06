/**
 * Unified Search API - Searches across ALL database entities
 * - Projects (by name, country, department, size)
 * - Countries (by name, region, sector)
 * - Documents (by title, content)
 * - Departments (by name, function)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all'; // all, projects, countries, documents, departments
    const department = searchParams.get('department');
    const size = searchParams.get('size');
    const country = searchParams.get('country');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Allow empty query to return all results (paginated)
    // if (!query && !department && !size && !country) {
    //   return NextResponse.json({ error: 'Search query or filter required' }, { status: 400 });
    // }

    const supabase = createClient();
    const results: any = {
      projects: [],
      countries: [],
      documents: [],
      departments: [],
      total: 0
    };

    // Search Projects (from worldbank_projects table)
    if (type === 'all' || type === 'projects') {
      try {
        let projectQuery = supabase
          .from('worldbank_projects')
          .select('id, project_name, country_name, country_code, region_name, status, total_commitment, total_amount_formatted, board_approval_date, approval_fy, sectors, themes, major_theme, tagged_departments, url');

        if (query) {
          // Enhanced search: project name, country, region, sectors (as text), themes (as text), and major_theme
          const searchPattern = `%${query}%`;
          projectQuery = projectQuery.or(
            `project_name.ilike.${searchPattern},` +
            `country_name.ilike.${searchPattern},` +
            `region_name.ilike.${searchPattern},` +
            `sectors::text.ilike.${searchPattern},` +
            `themes::text.ilike.${searchPattern},` +
            `major_theme.ilike.${searchPattern}`
          );
        }

        if (country) {
          projectQuery = projectQuery.eq('country_name', country);
        }

        const { data: projects, error: projectsError } = await projectQuery
          .order('board_approval_date', { ascending: false })
          .limit(limit);

        if (!projectsError) {
          results.projects = projects?.map((p: any) => ({
            id: p.id,
            project_name: p.project_name,
            country_name: p.country_name,
            country_code: p.country_code,
            region: p.region_name,
            sector: Array.isArray(p.sectors) ? p.sectors[0] : (p.sectors || 'N/A'),
            sectors: Array.isArray(p.sectors) ? p.sectors : [p.sectors].filter(Boolean),
            theme: p.major_theme,
            themes: p.themes,
            status: p.status || 'Active',
            total_commitment: p.total_commitment,
            total_amount_formatted: p.total_amount_formatted,
            board_approval_date: p.board_approval_date,
            approval_fy: p.approval_fy,
            tagged_departments: p.tagged_departments,
            url: p.url
          })) || [];
        }
      } catch (err) {
        console.warn('Projects search error, continuing without projects:', err);
        results.projects = [];
      }
    }

    // Search Countries
    if (type === 'all' || type === 'countries') {
      let countryQuery = supabase
        .from('worldbank_countries')
        .select('*');

      if (query) {
        countryQuery = countryQuery.or(`name.ilike.%${query}%,capital_city.ilike.%${query}%,region.ilike.%${query}%`);
      }

      const { data: countries } = await countryQuery
        .order('name')
        .limit(limit);

      results.countries = countries || [];
    }

    // Search Documents (only if table has data)
    if (type === 'all' || type === 'documents' || type === 'speech' || type === 'strategy') {
      try {
        let docQuery = supabase
          .from('worldbank_documents')
          .select('id, title, summary, date, type, tags_document_type, tags_authors, tags_sectors, tags_regions, tags_departments, tags_priority, metadata_reading_time, metadata_word_count');

        if (query) {
          // Enhanced search: title, summary, keywords (as text), content, tags
          const searchPattern = `%${query}%`;
          docQuery = docQuery.or(
            `title.ilike.${searchPattern},` +
            `summary.ilike.${searchPattern},` +
            `content.ilike.${searchPattern},` +
            `keywords::text.ilike.${searchPattern},` +
            `tags_sectors::text.ilike.${searchPattern},` +
            `tags_regions::text.ilike.${searchPattern},` +
            `tags_departments::text.ilike.${searchPattern}`
          );
        }

        if (department) {
          docQuery = docQuery.contains('tags_departments', [department]);
        }

        const { data: documents, error: docsError } = await docQuery
          .order('date', { ascending: false })
          .limit(limit);

        if (!docsError) {
          results.documents = documents || [];
        }
      } catch (err) {
        console.warn('Documents table error, continuing without documents:', err);
        results.documents = [];
      }
    }

    // Search People/Departments (from org chart)
    if (type === 'all' || type === 'departments' || type === 'people') {
      let peopleQuery = supabase
        .from('worldbank_orgchart')
        .select('*');

      if (query) {
        peopleQuery = peopleQuery.or(`name.ilike.%${query}%,position.ilike.%${query}%,department.ilike.%${query}%,bio.ilike.%${query}%`);
      }

      const { data: people } = await peopleQuery
        .eq('is_active', true)
        .order('level')
        .limit(limit);

      results.departments = people || [];
    }

    // Convert to unified search result format
    const unifiedResults = [
      ...results.projects.map((p: any) => ({
        id: p.id,
        title: p.project_name,
        summary: `${p.country_name} | ${p.sector || 'N/A'} | ${p.total_amount_formatted || 'N/A'}`,
        date: p.board_approval_date || new Date().toISOString(),
        sourceType: 'project',
        tags: {
          documentType: 'World Bank Project',
          regions: p.region ? [p.region] : [],
          sectors: p.sectors || [],
          departments: p.tagged_departments || []
        }
      })),
      ...results.countries.map((c: any) => ({
        id: `country-${c.iso2_code}`,
        title: c.name,
        summary: `${c.region} | ${c.income_level || 'N/A'} | ${c.active_projects || 0} projects`,
        date: new Date().toISOString(),
        sourceType: 'country',
        tags: {
          documentType: 'Country Profile',
          regions: [c.region],
          sectors: c.sector_focus || []
        }
      })),
      ...results.documents.map((d: any) => ({
        id: d.id,
        title: d.title,
        summary: d.summary || '',
        date: d.date || new Date().toISOString(),
        sourceType: d.type === 'speech' ? 'speech' : 'strategy',
        tags: {
          documentType: d.tags_document_type || d.type,
          regions: d.tags_regions || [],
          sectors: d.tags_sectors || [],
          departments: d.tags_departments || [],
          authors: d.tags_authors || [],
          priority: d.tags_priority
        },
        metadata: {
          readingTime: d.metadata_reading_time,
          wordCount: d.metadata_word_count
        }
      })),
      ...results.departments.map((d: any) => ({
        id: `person-${d.id}`,
        title: d.name,
        summary: `${d.position}${d.department ? ` | ${d.department}` : ''}`,
        date: new Date().toISOString(),
        sourceType: 'person',
        tags: {
          documentType: 'Leadership Profile',
          departments: d.department ? [d.department] : [],
          regions: d.region ? [d.region] : []
        }
      }))
    ];

    const page = parseInt(searchParams.get('page') || '1');
    const pageLimit = parseInt(searchParams.get('limit') || '20');
    const total = unifiedResults.length;
    const pages = Math.ceil(total / pageLimit);
    
    // Paginate results
    const startIdx = (page - 1) * pageLimit;
    const paginatedResults = unifiedResults.slice(startIdx, startIdx + pageLimit);

    return NextResponse.json({
      results: paginatedResults,
      pagination: {
        total,
        page,
        pages,
        limit: pageLimit
      }
    });

  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed', message: error.message },
      { status: 500 }
    );
  }
}
