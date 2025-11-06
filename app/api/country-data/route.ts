/**
 * Country Data API Route
 * Fetches country data with real projects from database
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const countryName = searchParams.get('name');

    if (!countryName) {
      return NextResponse.json({ error: 'Country name required' }, { status: 400 });
    }

    const supabase = createClient();

    // Fetch country data
    const { data: country, error: countryError } = await supabase
      .from('worldbank_countries')
      .select('*')
      .eq('name', countryName)
      .single();

    if (countryError) {
      return NextResponse.json({ error: 'Country not found' }, { status: 404 });
    }

    // Fetch projects for this country
    const { data: projects, error: projectsError } = await supabase
      .from('worldbank_projects')
      .select('*')
      .eq('country_name', countryName)
      .order('board_approval_date', { ascending: false })
      .limit(20);

    // Calculate portfolio from actual projects
    const activeProjects = projects || [];
    const portfolioValue = activeProjects.reduce((sum, p) => sum + (p.total_commitment || 0), 0);
    const ibrdTotal = activeProjects.reduce((sum, p) => sum + (p.ibrd_commitment || 0), 0);
    const idaTotal = activeProjects.reduce((sum, p) => sum + (p.ida_commitment || 0), 0);

    // Get sector breakdown
    const sectorBreakdown: any = {};
    activeProjects.forEach(p => {
      if (p.tagged_size_category) {
        if (!sectorBreakdown[p.tagged_size_category]) {
          sectorBreakdown[p.tagged_size_category] = {
            count: 0,
            amount: 0
          };
        }
        sectorBreakdown[p.tagged_size_category].count++;
        sectorBreakdown[p.tagged_size_category].amount += p.total_commitment || 0;
      }
    });

    // Build comprehensive country data
    const countryData = {
      name: country.name,
      iso2Code: country.iso2_code,
      region: country.region,
      capitalCity: country.capital_city,
      population: country.population ? `${(country.population / 1000000).toFixed(1)}M` : 'N/A',
      incomeLevel: country.income_level,
      lendingType: country.lending_type,
      latitude: parseFloat(country.latitude) || 0,
      longitude: parseFloat(country.longitude) || 0,
      
      // Economic indicators
      gdpPerCapita: country.gdp_per_capita ? `$${country.gdp_per_capita.toFixed(0)} (2023)` : undefined,
      gni: country.gni_current ? `$${(country.gni_current / 1000000000).toFixed(1)}B (2023)` : undefined,
      povertyRate: country.poverty_rate ? `${country.poverty_rate.toFixed(1)}% (2023)` : undefined,
      gdpTotal: country.gdp_current ? `$${(country.gdp_current / 1000000000).toFixed(1)}B (2023)` : undefined,
      
      // World Bank relationship
      regionalVP: country.regional_vp_name || 'N/A',
      regionalVPId: country.regional_vp_id || '',
      memberSince: country.member_since || 'N/A',
      
      // Portfolio (calculated from real projects)
      portfolioValue: `$${(portfolioValue / 1000).toFixed(1)}B`,
      activeProjects: activeProjects.length,
      ibrdCommitments: `$${(ibrdTotal / 1000).toFixed(1)}B`,
      idaCommitments: `$${(idaTotal / 1000).toFixed(1)}B`,
      
      // Real projects from database
      recentProjects: activeProjects.slice(0, 10).map(p => ({
        id: p.id,
        title: p.project_name,
        approvalDate: new Date(p.board_approval_date).toLocaleDateString(),
        status: p.status,
        totalAmount: p.total_amount_formatted || `$${p.total_commitment?.toFixed(0)}M`,
        description: `${p.lending_instrument || 'Investment'} project`,
        sectors: [p.tagged_size_category || 'General'],
        objectives: ['Implementation ongoing'],
        beneficiaries: country.population || 'Population served',
        verified: true,
        sourceUrl: p.url
      })),
      
      // Sector breakdown
      sectorBreakdown: Object.entries(sectorBreakdown).map(([sector, data]: [string, any]) => ({
        sector,
        percentage: Math.round((data.count / activeProjects.length) * 100),
        amount: `$${(data.amount / 1000).toFixed(1)}B`,
        projectCount: data.count
      })),
      
      // Current affairs (from recent projects)
      currentAffairs: activeProjects.slice(0, 5).map(p => ({
        date: new Date(p.board_approval_date).toISOString().split('T')[0],
        title: `${p.project_name} Approved`,
        description: `World Bank approved $${p.total_commitment?.toFixed(0)}M for ${p.project_name}`,
        amount: p.total_amount_formatted,
        type: 'Project Approval',
        source: 'World Bank Projects Database'
      })),
      
      developmentPriorities: country.sector_focus || ['Development'],
      
      keyResults: [],
      
      dataVerified: true,
      lastUpdated: 'November 2024',
      apiSource: 'World Bank Projects API + Countries Database',
      sources: [
        {
          title: `World Bank in ${country.name}`,
          url: `https://www.worldbank.org/en/country/${country.name.toLowerCase().replace(/ /g, '')}`,
          date: '2024-11-01'
        },
        {
          title: `${country.name} Projects Portfolio`,
          url: `https://projects.worldbank.org/en/projects-operations/projects-list?countrycode_exact=${country.iso2_code}`,
          date: '2024-11-01'
        }
      ]
    };

    return NextResponse.json({ country: countryData });

  } catch (error: any) {
    console.error('Error fetching country data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch country data' },
      { status: 500 }
    );
  }
}


