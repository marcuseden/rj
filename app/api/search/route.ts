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

    // Search Projects (extracted from countries.recent_projects)
    if (type === 'all' || type === 'projects') {
      // Get countries with projects
      const { data: countriesWithProjects } = await supabase
        .from('worldbank_countries')
        .select('iso2_code, name, region, recent_projects')
        .not('recent_projects', 'is', null);
      
      // Extract and flatten projects
      const allProjects: any[] = [];
      countriesWithProjects?.forEach((country: any) => {
        if (country.recent_projects && Array.isArray(country.recent_projects)) {
          country.recent_projects.forEach((project: any, idx: number) => {
            const projectName = project.project_name || project.title || '';
            const matchesQuery = !query || 
              projectName.toLowerCase().includes(query.toLowerCase()) ||
              country.name.toLowerCase().includes(query.toLowerCase()) ||
              (project.sector && project.sector.toLowerCase().includes(query.toLowerCase()));
            
            if (matchesQuery) {
              allProjects.push({
                id: `project-${country.iso2_code.toLowerCase()}-${idx}`,
                project_name: projectName,
                country_name: country.name,
                country_code: country.iso2_code,
                region: country.region,
                sector: project.sector || 'N/A',
                theme: project.theme,
                status: project.status || 'Active',
                total_commitment: project.total_amt || project.totalamt,
                board_approval_date: project.approvalfy || project.board_approval_date,
                ...project
              });
            }
          });
        }
      });
      
      results.projects = allProjects.slice(0, limit);
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

    // Search Documents
    if (type === 'all' || type === 'documents' || type === 'speech' || type === 'strategy') {
      let docQuery = supabase
        .from('worldbank_documents')
        .select('id, title, summary, date, type, tags_document_type, tags_authors, tags_sectors, tags_regions, tags_departments, tags_priority, metadata_reading_time, metadata_word_count');

      if (query) {
        // Search in title, summary, and keywords
        docQuery = docQuery.or(`title.ilike.%${query}%,summary.ilike.%${query}%,keywords.cs.{${query}}`);
      }

      if (department) {
        docQuery = docQuery.contains('tags_departments', [department]);
      }

      const { data: documents } = await docQuery
        .order('date', { ascending: false })
        .limit(limit);

      results.documents = documents || [];
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
        summary: `${p.country_name} | ${p.sector || 'N/A'} | ${p.total_commitment ? `$${p.total_commitment}M` : 'N/A'}`,
        date: p.board_approval_date || new Date().toISOString(),
        sourceType: 'project',
        tags: {
          documentType: 'World Bank Project',
          regions: [p.region],
          sectors: p.sector ? [p.sector] : [],
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
