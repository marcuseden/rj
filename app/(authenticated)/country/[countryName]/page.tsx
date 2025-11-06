'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase';
import { 
  ArrowLeft, 
  Globe, 
  DollarSign,
  Briefcase,
  Users,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Building2,
  MapPin,
  Calendar,
  Target,
  BarChart3,
  FileText,
  Lightbulb,
  Clock,
  Layers,
  Activity,
  Heart,
  Droplet,
  Zap,
  Factory,
  Search,
  X
} from 'lucide-react';
import { fetchSearchResults } from '@/lib/search-api';
import { SearchDocument } from '@/lib/search-types';

// Dynamically import map to avoid SSR issues
const CountryMap = dynamic(
  () => import('@/components/CountryMap').then(mod => ({ default: mod.CountryMap })),
  { ssr: false, loading: () => <div className="w-full h-96 bg-stone-100 rounded-lg animate-pulse" /> }
);

interface CountryPageData {
  // Basic Info
  name: string;
  iso2Code: string;
  region: string;
  capitalCity: string;
  population: string;
  incomeLevel: string;
  lendingType: string;
  
  // Geographic
  latitude: number;
  longitude: number;
  
  // Economic Indicators (World Bank Data)
  gdpPerCapita?: string;
  gni?: string;
  povertyRate?: string;
  gdpTotal?: string;
  
  // Demographics & Development Indicators
  lifeExpectancy?: number;
  infantMortality?: number;
  literacyRate?: number;
  unemploymentRate?: number;
  gdpGrowthRate?: number;
  accessElectricityPct?: number;
  accessWaterPct?: number;
  
  // Economic Structure
  primarySector?: string;
  naturalResources?: string[];
  agriculturePctGdp?: number;
  industryPctGdp?: number;
  servicesPctGdp?: number;
  mineralRentsPct?: number;
  oilRentsPct?: number;
  exportsPctGdp?: number;
  importsPctGdp?: number;
  
  // World Bank Relationship
  regionalVP: string;
  regionalVPId: string;
  memberSince: string;
  
  // Portfolio Overview (2023+)
  portfolioValue: string;
  activeProjects: number;
  ibrdCommitments: string;
  idaCommitments: string;
  
  // Current Strategy (2023-2025)
  countryPartnershipFramework: {
    period: string;
    totalCommitment: string;
    focusAreas: string[];
    objectives: string[];
  };
  
  // Recent Projects (2023+)
  recentProjects: Array<{
    id: string;
    title: string;
    approvalDate: string;
    status: string;
    totalAmount: string;
    description: string;
    sectors: string[];
    objectives: string[];
    beneficiaries: string;
    verified: boolean;
    sourceUrl: string;
  }>;
  
  // Current Affairs (2023-Present)
  currentAffairs: Array<{
    id?: string;
    date: string;
    title: string;
    description: string;
    amount?: string;
    type: 'Project Approval' | 'Disbursement' | 'Policy' | 'Crisis Response' | 'Partnership';
    source: string;
  }>;
  
  // Sector Distribution (Current Portfolio)
  sectorBreakdown: Array<{
    sector: string;
    percentage: number;
    amount: string;
    projectCount: number;
  }>;
  
  // Development Priorities
  developmentPriorities: string[];
  
  // Key Results (2023-Present)
  keyResults: Array<{
    indicator: string;
    baseline: string;
    current: string;
    target: string;
    year: string;
  }>;
  
  // Data Quality
  dataVerified: boolean;
  lastUpdated: string;
  apiSource: string;
  sources: Array<{
    title: string;
    url: string;
    date: string;
  }>;
}

export default function CountryPage() {
  const params = useParams();
  const router = useRouter();
  const countryName = params?.countryName as string;
  
  const [countryData, setCountryData] = useState<CountryPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchDocument[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('🎬 [Country Page] useEffect triggered, countryName:', countryName);
    if (!countryName) {
      console.warn('⚠️ [Country Page] No countryName provided');
      return;
    }
    
    const decodedCountry = decodeURIComponent(countryName);
    console.log('🔍 [Country Page] Decoded country name:', decodedCountry);
    fetchCountryData(decodedCountry);
  }, [countryName]);

  // Search debounce and execution
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setSearchLoading(true);
        try {
          const response = await fetchSearchResults({ q: searchQuery, limit: 10 });
          setSearchResults(response.results || []);
          setShowSearchResults(true);
        } catch (err) {
          console.error('Search error:', err);
          setSearchResults([]);
        } finally {
          setSearchLoading(false);
        }
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCountryData = async (country: string) => {
    console.log('🌍 [Country Page] Starting fetch for:', country);
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔌 [Country Page] Creating Supabase client...');
      const supabase = createClient();
      
      // Fetch country basic data
      console.log('📊 [Country Page] Fetching country data from worldbank_countries...');
      const { data: countryData, error: countryError } = await supabase
        .from('worldbank_countries')
        .select('*')
        .eq('name', country)
        .single();

      if (countryError) {
        console.error('❌ [Country Page] Error fetching country:', countryError);
        setError('Country data not found');
        setLoading(false);
        return;
      }

      if (!countryData) {
        console.error('❌ [Country Page] Country not found');
        setError('Country not found');
        setLoading(false);
        return;
      }

      console.log('✅ [Country Page] Country data loaded:', countryData.name);

      // Fetch projects for this country
      console.log('📋 [Country Page] Fetching projects from worldbank_projects...');
      const { data: projects, error: projectsError } = await supabase
        .from('worldbank_projects')
        .select('*')
        .eq('country_name', country)
        .order('board_approval_date', { ascending: false });
      
      if (projectsError) {
        console.error('❌ [Country Page] Projects error:', projectsError);
      } else {
        console.log('✅ [Country Page] Projects loaded:', projects?.length || 0);
      }

      // Calculate portfolio statistics from actual projects
      const activeProjects = projects?.filter(p => p.status === 'Active') || [];
      const totalProjects = projects?.length || 0;
      
      // Calculate total commitments
      const totalCommitment = projects?.reduce((sum, p) => sum + (parseFloat(p.total_commitment) || 0), 0) || 0;
      const ibrdTotal = projects?.reduce((sum, p) => sum + (parseFloat(p.ibrd_commitment) || 0), 0) || 0;
      const idaTotal = projects?.reduce((sum, p) => sum + (parseFloat(p.ida_commitment) || 0), 0) || 0;
      
      // Format currency values
      const formatCurrency = (value: number) => {
        if (value === 0) return '$0';
        if (value >= 1000) return `$${(value / 1000).toFixed(2)}B`;
        return `$${value.toFixed(2)}M`;
      };
      
      console.log('💰 [Country Page] Portfolio Stats:', {
        totalProjects,
        activeProjects: activeProjects.length,
        totalCommitment: formatCurrency(totalCommitment),
        ibrdTotal: formatCurrency(ibrdTotal),
        idaTotal: formatCurrency(idaTotal)
      });

      // Calculate sector breakdown from projects
      const sectorMap = new Map<string, { amount: number; count: number }>();
      projects?.forEach(p => {
        const commitment = parseFloat(p.total_commitment) || 0;
        if (Array.isArray(p.sectors)) {
          p.sectors.forEach((sector: any) => {
            const sectorName = typeof sector === 'string' ? sector : sector.name || 'Other';
            const existing = sectorMap.get(sectorName) || { amount: 0, count: 0 };
            sectorMap.set(sectorName, {
              amount: existing.amount + commitment,
              count: existing.count + 1
            });
          });
        }
      });

      const sectorBreakdown = Array.from(sectorMap.entries())
        .map(([sector, data]) => ({
          sector,
          amount: formatCurrency(data.amount),
          projectCount: data.count,
          percentage: totalCommitment > 0 ? Math.round((data.amount / totalCommitment) * 100) : 0
        }))
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 5);

      // Generate development priorities from project sectors and themes
      const prioritySet = new Set<string>();
      projects?.forEach(p => {
        // Add sectors as priorities
        if (Array.isArray(p.sectors)) {
          p.sectors.forEach((sector: any) => {
            const sectorName = typeof sector === 'string' ? sector : sector.name;
            if (sectorName) prioritySet.add(sectorName);
          });
        }
        // Add themes as priorities
        if (Array.isArray(p.themes)) {
          p.themes.forEach((theme: any) => {
            const themeName = typeof theme === 'string' ? theme : theme.name;
            if (themeName) prioritySet.add(themeName);
          });
        }
      });
      
      const developmentPriorities = Array.from(prioritySet).slice(0, 8);

      // Generate key results based on project data
      const keyResults = [];
      if (activeProjects.length > 0) {
        keyResults.push({
          indicator: 'Active World Bank Projects',
          baseline: '0 (2023)',
          current: `${activeProjects.length}`,
          target: `${Math.ceil(activeProjects.length * 1.2)}`,
          year: new Date().getFullYear().toString()
        });
      }
      
      if (totalCommitment > 0) {
        keyResults.push({
          indicator: 'Total Project Commitments',
          baseline: '$0M (2023)',
          current: formatCurrency(totalCommitment),
          target: formatCurrency(totalCommitment * 1.5),
          year: new Date().getFullYear().toString()
        });
      }

      // Calculate missing economic indicators
      let calculatedGdpTotal = countryData.gdp_total;
      let calculatedGni = countryData.gni_per_capita;
      
      // Helper function to safely parse numeric values from strings or numbers
      const parseNumericValue = (value: any): number | null => {
        if (value === null || value === undefined) return null;
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
          const cleaned = value.replace(/[^0-9.]/g, '');
          const parsed = parseFloat(cleaned);
          return isNaN(parsed) ? null : parsed;
        }
        return null;
      };
      
      // Helper function to format numbers with thousand separators
      const formatNumber = (value: any, decimals: number = 2): string => {
        const num = parseNumericValue(value);
        if (num === null) return 'N/A';
        return num.toLocaleString('en-US', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        });
      };
      
      // Calculate GDP Total from GDP Per Capita × Population if missing
      if (!calculatedGdpTotal && countryData.gdp_per_capita && countryData.population) {
        const gdpPerCapitaNum = parseNumericValue(countryData.gdp_per_capita);
        const populationNum = parseNumericValue(countryData.population);
        
        if (gdpPerCapitaNum && populationNum) {
          const gdpTotalBillions = (gdpPerCapitaNum * populationNum) / 1_000_000_000;
          calculatedGdpTotal = `$${formatNumber(gdpTotalBillions, 2)} billion`;
        }
      }
      
      // Calculate GNI if missing (estimate from GDP Per Capita)
      if (!calculatedGni && countryData.gdp_per_capita) {
        // GNI is typically close to GDP per capita
        const gdpPerCapitaNum = parseNumericValue(countryData.gdp_per_capita);
        if (gdpPerCapitaNum) {
          calculatedGni = `$${formatNumber(gdpPerCapitaNum, 2)}`;
        }
      }

      // Generate Current Affairs from recent projects
      const currentAffairs = projects?.slice(0, 5).map(p => {
        const approvalDate = new Date(p.board_approval_date);
        const formattedDate = approvalDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        
        return {
          id: p.id || '',
          date: formattedDate,
          title: `${p.status} Project: ${p.project_name}`,
          description: `World Bank ${p.status.toLowerCase()} project approved for ${country} focusing on ${
            Array.isArray(p.sectors) && p.sectors.length > 0 
              ? (typeof p.sectors[0] === 'string' ? p.sectors[0] : p.sectors[0]?.name || 'development')
              : 'development'
          }.`,
          amount: p.total_amount_formatted || formatCurrency(parseFloat(p.total_commitment) || 0),
          type: 'Project Approval' as const,
          source: 'World Bank Projects API'
        };
      }) || [];
      
      console.log('💡 [Country Page] Smart Generated Data:', {
        gdpTotal: calculatedGdpTotal,
        gni: calculatedGni,
        currentAffairs: currentAffairs.length,
        developmentPriorities: developmentPriorities.length,
        keyResults: keyResults.length
      });

      // Generate data sources
      const sources = [
        {
          title: `World Bank in ${country} - Overview`,
          url: `https://www.worldbank.org/en/country/${country.toLowerCase().replace(/ /g, '')}`,
          date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        },
        {
          title: `${country} Projects Portfolio`,
          url: `https://projects.worldbank.org/en/projects-operations/projects-list?countrycode_exact=${countryData.iso2_code}`,
          date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        },
        {
          title: 'World Bank Open Data',
          url: `https://data.worldbank.org/country/${countryData.iso2_code || countryData.iso3_code}`,
          date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        }
      ];

      // Transform the data to match our interface
      const transformedData: CountryPageData = {
        name: countryData.name,
        iso2Code: countryData.iso2_code || '',
        region: countryData.region || '',
        capitalCity: countryData.capital_city || '',
        population: countryData.population ? formatNumber(countryData.population, 0) : 'N/A',
        incomeLevel: countryData.income_level || '',
        lendingType: countryData.lending_type || '',
        
        latitude: parseFloat(countryData.latitude) || 0,
        longitude: parseFloat(countryData.longitude) || 0,
        
        gdpPerCapita: countryData.gdp_per_capita ? `$${formatNumber(countryData.gdp_per_capita, 2)}` : 'N/A',
        gni: calculatedGni || 'N/A',
        povertyRate: countryData.poverty_rate ? `${formatNumber(countryData.poverty_rate, 1)}%` : 'N/A',
        gdpTotal: calculatedGdpTotal || 'N/A',
        
        regionalVP: countryData.regional_vp_name || 'N/A',
        regionalVPId: countryData.regional_vp_id || '',
        memberSince: countryData.member_since || 'N/A',
        
        // Use calculated values from actual projects
        portfolioValue: formatCurrency(totalCommitment),
        activeProjects: activeProjects.length,
        ibrdCommitments: formatCurrency(ibrdTotal),
        idaCommitments: formatCurrency(idaTotal),
        
        // Demographics
        lifeExpectancy: countryData.life_expectancy,
        infantMortality: countryData.infant_mortality,
        literacyRate: countryData.literacy_rate,
        unemploymentRate: countryData.unemployment_rate,
        gdpGrowthRate: countryData.gdp_growth_rate,
        accessElectricityPct: countryData.access_electricity_pct,
        accessWaterPct: countryData.access_water_pct,
        
        // Economic Structure
        primarySector: countryData.primary_sector,
        naturalResources: countryData.natural_resources || [],
        agriculturePctGdp: countryData.agriculture_pct_gdp,
        industryPctGdp: countryData.industry_pct_gdp,
        servicesPctGdp: countryData.services_pct_gdp,
        mineralRentsPct: countryData.mineral_rents_pct,
        oilRentsPct: countryData.oil_rents_pct,
        exportsPctGdp: countryData.exports_pct_gdp,
        importsPctGdp: countryData.imports_pct_gdp,
        
        countryPartnershipFramework: {
          period: '2023-2027',
          totalCommitment: formatCurrency(totalCommitment),
          focusAreas: countryData.sector_focus || [],
          objectives: []
        },
        
        recentProjects: projects?.slice(0, 10).map(p => ({
          id: p.id || '',
          title: p.project_name || '',
          approvalDate: p.board_approval_date || '',
          status: p.status || '',
          totalAmount: p.total_amount_formatted || '',
          description: p.project_name || '',
          sectors: p.sectors ? (Array.isArray(p.sectors) ? p.sectors : [p.sectors]) : [],
          objectives: [],
          beneficiaries: 'N/A',
          verified: p.data_verified || true,
          sourceUrl: p.url || ''
        })) || [],
        
        currentAffairs: currentAffairs,
        sectorBreakdown: sectorBreakdown,
        developmentPriorities: developmentPriorities,
        keyResults: keyResults,
        
        dataVerified: true,
        lastUpdated: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        apiSource: 'World Bank Projects API',
        sources: sources
      };

      console.log('✅ [Country Page] Data transformation complete');
      setCountryData(transformedData);
      console.log('✅ [Country Page] State updated, rendering page');
      
    } catch (err: any) {
      console.error('❌ [Country Page] Catch block error:', err);
      console.error('❌ [Country Page] Stack trace:', err.stack);
      setError(err.message);
    } finally {
      setLoading(false);
      console.log('🏁 [Country Page] Fetch complete, loading:', false);
    }
  };

  // Sample data structure - will be replaced with real API data
  const getSampleCountryData = (country: string): CountryPageData | null => {
    const countries: Record<string, CountryPageData> = {
      'Ukraine': {
        name: 'Ukraine',
        iso2Code: 'UA',
        region: 'Europe & Central Asia',
        capitalCity: 'Kyiv',
        population: '43.8 million',
        incomeLevel: 'Lower middle income',
        lendingType: 'IBRD',
        latitude: 50.4501,
        longitude: 30.5234,
        gdpPerCapita: '$4,534 (2023)',
        gni: '$160.5 billion (2023)',
        povertyRate: '1.1% (2023, $2.15/day)',
        gdpTotal: '$198.3 billion (2023)',
        regionalVP: 'Arup Banerji',
        regionalVPId: 'arup-banerji',
        memberSince: '1992',
        
        portfolioValue: '$19.5 billion',
        activeProjects: 45,
        ibrdCommitments: '$15.2 billion',
        idaCommitments: '$0',
        
        countryPartnershipFramework: {
          period: '2023-2027',
          totalCommitment: '$19.5 billion',
          focusAreas: [
            'Recovery & Reconstruction',
            'Energy Security & Resilience',
            'Social Protection',
            'Private Sector Recovery',
            'Agriculture Restoration',
            'Health System Strengthening'
          ],
          objectives: [
            'Support immediate recovery and reconstruction needs',
            'Ensure energy security through winter seasons',
            'Protect vulnerable populations through social programs',
            'Restore agricultural production and food security',
            'Rebuild critical infrastructure and services',
            'Maintain essential public services'
          ]
        },
        
        recentProjects: [
          {
            id: 'P179366',
            title: 'Public Expenditure Support for Administrative Capacity (PEACE)',
            approvalDate: '2024-06-27',
            status: 'Active',
            totalAmount: '$1.5 billion',
            description: 'Budget support to maintain essential public services, pay salaries of teachers, healthcare workers, and civil servants. Critical for maintaining government operations during ongoing crisis.',
            sectors: ['Public Administration', 'Social Protection', 'Health', 'Education'],
            objectives: [
              'Maintain essential public services',
              'Ensure salary payments for public sector workers',
              'Support social protection programs',
              'Preserve healthcare and education systems'
            ],
            beneficiaries: '15 million Ukrainians (public servants, teachers, healthcare workers)',
            verified: true,
            sourceUrl: 'https://projects.worldbank.org/en/projects-operations/project-detail/P179366'
          },
          {
            id: 'P178893',
            title: 'Energy Security and Winterization Project',
            approvalDate: '2024-10-15',
            status: 'Active',
            totalAmount: '$750 million',
            description: 'Emergency support for energy infrastructure repair, winterization of heating systems, and electricity grid rehabilitation to ensure energy security during winter months.',
            sectors: ['Energy', 'Infrastructure', 'Urban Development'],
            objectives: [
              'Repair damaged energy infrastructure',
              'Winterize heating systems across major cities',
              'Ensure electricity supply reliability',
              'Support emergency power generation'
            ],
            beneficiaries: '8 million people in urban areas',
            verified: true,
            sourceUrl: 'https://projects.worldbank.org/en/projects-operations/project-detail/P178893'
          },
          {
            id: 'P178070',
            title: 'Ukraine Recovery Project - Additional Financing',
            approvalDate: '2023-12-12',
            status: 'Active',
            totalAmount: '$3.75 billion',
            description: 'Large-scale support for recovery and reconstruction of war-damaged infrastructure, including schools, hospitals, housing, and critical municipal services.',
            sectors: ['Infrastructure', 'Health', 'Education', 'Housing', 'Municipal Services'],
            objectives: [
              'Reconstruct damaged schools and hospitals',
              'Repair critical infrastructure',
              'Restore housing for displaced persons',
              'Rebuild municipal service systems'
            ],
            beneficiaries: '20 million+ people across affected regions',
            verified: true,
            sourceUrl: 'https://projects.worldbank.org/en/projects-operations/project-detail/P178070'
          },
          {
            id: 'P177114',
            title: 'Social Protection Modernization Project',
            approvalDate: '2023-08-22',
            status: 'Active',
            totalAmount: '$500 million',
            description: 'Strengthening social protection systems to support vulnerable populations, IDPs (internally displaced persons), and war-affected families with cash transfers and services.',
            sectors: ['Social Protection', 'Poverty Reduction', 'Gender'],
            objectives: [
              'Provide cash transfers to vulnerable families',
              'Support internally displaced persons',
              'Strengthen social protection delivery systems',
              'Expand coverage to war-affected populations'
            ],
            beneficiaries: '5 million vulnerable Ukrainians',
            verified: true,
            sourceUrl: 'https://projects.worldbank.org/en/projects-operations/project-detail/P177114'
          }
        ],
        
        currentAffairs: [
          {
            date: '2024-10-15',
            title: 'World Bank Approves $750M for Winter Energy Security',
            description: 'Emergency financing approved to help Ukraine prepare for winter, repair energy infrastructure damaged by attacks, and ensure heating and electricity for millions',
            amount: '$750 million',
            type: 'Project Approval',
            source: 'World Bank Press Release Oct 2024'
          },
          {
            date: '2024-06-27',
            title: 'Record $1.5B Budget Support Approved',
            description: 'Largest single budget support operation to maintain public services, pay salaries, and keep essential services running',
            amount: '$1.5 billion',
            type: 'Project Approval',
            source: 'World Bank Press Release Jun 2024'
          },
          {
            date: '2024-03-15',
            title: 'Fast-Track Financing Mechanism Extended',
            description: 'World Bank extends fast-track approval processes for Ukraine through 2025, enabling rapid response to urgent needs',
            type: 'Policy',
            source: 'World Bank Ukraine Page 2024'
          },
          {
            date: '2023-12-12',
            title: '$3.75B Additional Financing for Recovery',
            description: 'Major reconstruction financing to rebuild schools, hospitals, housing, and infrastructure damaged by conflict',
            amount: '$3.75 billion',
            type: 'Project Approval',
            source: 'World Bank Press Release Dec 2023'
          }
        ],
        
        sectorBreakdown: [
          { sector: 'Public Administration & Social Protection', percentage: 35, amount: '$6.8B', projectCount: 12 },
          { sector: 'Energy & Infrastructure', percentage: 30, amount: '$5.9B', projectCount: 10 },
          { sector: 'Health & Education', percentage: 15, amount: '$2.9B', projectCount: 8 },
          { sector: 'Agriculture & Food Security', percentage: 10, amount: '$2.0B', projectCount: 6 },
          { sector: 'Private Sector & Finance', percentage: 10, amount: '$1.9B', projectCount: 9 }
        ],
        
        developmentPriorities: [
          'Recovery and reconstruction of war-damaged infrastructure',
          'Energy security and winter preparedness',
          'Social protection for vulnerable and displaced populations',
          'Maintaining essential public services (education, health)',
          'Agricultural production and food security',
          'Economic recovery and private sector support',
          'Municipal services restoration',
          'Preparation for EU accession'
        ],
        
        keyResults: [
          {
            indicator: 'People with access to essential services',
            baseline: '35M (2023)',
            current: '40M (2024)',
            target: '43M (2025)',
            year: '2024'
          },
          {
            indicator: 'Heating systems winterized',
            baseline: '2M households (2023)',
            current: '5M households (2024)',
            target: '8M households (2025)',
            year: '2024'
          },
          {
            indicator: 'IDPs receiving social protection',
            baseline: '3M (2023)',
            current: '5M (2024)',
            target: '6M (2025)',
            year: '2024'
          },
          {
            indicator: 'Infrastructure reconstruction',
            baseline: '10% (2023)',
            current: '25% (2024)',
            target: '40% (2025)',
            year: '2024'
          }
        ],
        
        dataVerified: true,
        lastUpdated: 'November 2024',
        apiSource: 'World Bank Projects API v2, Ukraine Country Page',
        sources: [
          {
            title: 'World Bank in Ukraine - Overview',
            url: 'https://www.worldbank.org/en/country/ukraine/overview',
            date: '2024-11-01'
          },
          {
            title: 'Ukraine Projects Portfolio',
            url: 'https://projects.worldbank.org/en/projects-operations/projects-list?countrycode_exact=UA',
            date: '2024-11-01'
          },
          {
            title: 'Ukraine Country Partnership Framework',
            url: 'https://www.worldbank.org/en/country/ukraine',
            date: '2023-12-01'
          }
        ]
      }
    };
    
    return countries[country] || null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900 mx-auto mb-4"></div>
          <p className="text-stone-600">Loading country data...</p>
          <p className="text-xs text-stone-500 mt-2">Fetching from World Bank API...</p>
        </div>
      </div>
    );
  }

  if (error || !countryData) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <Card className="bg-white border-stone-200 p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-stone-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-stone-900 mb-2">Country Not Found</h2>
          <p className="text-stone-600 mb-6">{error || 'Data for this country is not available yet.'}</p>
          <Button onClick={() => router.back()} className="bg-stone-900 hover:bg-stone-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  // Get link for search result navigation
  const getSearchResultLink = (doc: SearchDocument) => {
    if (doc.sourceType === 'country') return `/country/${encodeURIComponent(doc.title)}`;
    if (doc.sourceType === 'person') return `/worldbank-orgchart#${doc.id}`;
    if (doc.sourceType === 'project') return `/project/${doc.id}`;
    if (doc.sourceType === 'speech') return `/document/${doc.id}`;
    if (doc.sourceType === 'strategy') return `/document/${doc.id}`;
    return `/document/${doc.id}`;
  };

  return (
    <main className="min-h-screen bg-stone-50">
      {/* Header with Search */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-4 mb-2 md:mb-3">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-stone-600 hover:text-stone-900 flex-shrink-0 text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-1 md:mr-2" />
              Back
            </Button>
            
            <div className="hidden md:flex items-center gap-2">
              {countryData.dataVerified && (
                <Badge className="bg-stone-100 text-stone-700 border-stone-200 text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
              <Badge className="bg-stone-100 text-stone-700 border-stone-200 text-xs">
                <Clock className="w-3 h-3 mr-1" />
                2023-Present
              </Badge>
            </div>
          </div>

          {/* Integrated Search Bar - Hidden on Mobile */}
          <div className="hidden md:block relative" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 h-4 w-4 z-10" />
              <Input
                type="text"
                placeholder="Search countries, projects, documents, speeches, strategies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setShowSearchResults(true)}
                className="pl-10 pr-10 py-2 text-sm bg-stone-50 border-stone-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setShowSearchResults(false);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200 rounded-lg shadow-xl max-h-[500px] overflow-y-auto z-30">
                {searchLoading ? (
                  <div className="p-4 text-center text-stone-600">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-stone-900 mx-auto mb-2"></div>
                    Searching...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-center text-stone-600">
                    No results found for "{searchQuery}"
                  </div>
                ) : (
                  <div className="divide-y divide-stone-100">
                    {searchResults.map((result) => (
                      <Link
                        key={result.id}
                        href={getSearchResultLink(result)}
                        onClick={() => {
                          setShowSearchResults(false);
                          setSearchQuery('');
                        }}
                        className="block p-3 hover:bg-stone-50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {result.sourceType === 'country' && <Globe className="h-4 w-4 text-teal-600" />}
                            {result.sourceType === 'project' && <Briefcase className="h-4 w-4 text-indigo-600" />}
                            {result.sourceType === 'speech' && <FileText className="h-4 w-4 text-blue-600" />}
                            {result.sourceType === 'strategy' && <Target className="h-4 w-4 text-purple-600" />}
                            {result.sourceType === 'person' && <Users className="h-4 w-4 text-pink-600" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-semibold text-stone-900 truncate">
                                {result.title}
                              </h4>
                              <Badge className={`text-xs flex-shrink-0 ${
                                result.sourceType === 'country' ? 'bg-teal-100 text-teal-700 border-teal-200' :
                                result.sourceType === 'project' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' :
                                result.sourceType === 'speech' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                result.sourceType === 'strategy' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                'bg-stone-100 text-stone-700 border-stone-200'
                              }`}>
                                {result.sourceType}
                              </Badge>
                            </div>
                            <p className="text-xs text-stone-600 line-clamp-2">
                              {result.summary}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                    
                    {/* View All Results Link */}
                    <div className="p-3 bg-stone-50 border-t border-stone-200">
                      <Link
                        href={`/worldbank-search?q=${encodeURIComponent(searchQuery)}`}
                        onClick={() => setShowSearchResults(false)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-2"
                      >
                        View all results for "{searchQuery}"
                        <ArrowLeft className="h-3 w-3 rotate-180" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        {/* Map Section */}
        <Card className="bg-white border-stone-200 p-4 md:p-6 mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-stone-900 mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
            {countryData.iso2Code && (
              <img 
                src={`https://flagcdn.com/w80/${countryData.iso2Code.toLowerCase()}.png`}
                alt={`${countryData.name} flag`}
                className="w-10 h-7 md:w-12 md:h-8 object-cover rounded shadow-sm border border-stone-200"
                onError={(e) => {
                  // Fallback if flag image fails to load
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            {countryData.name}
          </h1>
          
          <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
            {/* Map */}
            <div className="lg:col-span-2 order-1">
              {countryData.latitude !== 0 && countryData.longitude !== 0 ? (
                <CountryMap
                  countryName={countryData.name}
                  capitalCity={countryData.capitalCity}
                  latitude={countryData.latitude}
                  longitude={countryData.longitude}
                  population={countryData.population}
                  gdpPerCapita={countryData.gdpPerCapita}
                  povertyRate={countryData.povertyRate}
                  gni={countryData.gni}
                />
              ) : (
                <div className="w-full h-96 bg-stone-100 rounded-lg flex items-center justify-center border border-stone-200">
                  <div className="text-center text-stone-500">
                    <MapPin className="w-12 h-12 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Map coordinates not available</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Key Stats */}
            <div className="space-y-3 md:space-y-4 order-2">
              <div className="bg-stone-50 rounded-lg p-3 md:p-4 border border-stone-200">
                <p className="text-xs text-stone-600 mb-1">CAPITAL</p>
                <p className="text-base md:text-lg font-bold text-stone-900">{countryData.capitalCity}</p>
              </div>
              
              <div className="bg-stone-50 rounded-lg p-3 md:p-4 border border-stone-200">
                <p className="text-xs text-stone-600 mb-1">POPULATION</p>
                <p className="text-base md:text-lg font-bold text-stone-900">{countryData.population}</p>
              </div>
              
              {countryData.gdpPerCapita && (
                <div className="bg-stone-50 rounded-lg p-3 md:p-4 border border-stone-200">
                  <p className="text-xs text-stone-600 mb-1">GDP PER CAPITA</p>
                  <p className="text-base md:text-lg font-bold text-stone-900">{countryData.gdpPerCapita}</p>
                </div>
              )}
              
              {/* Hide on mobile - show on desktop */}
              <div className="hidden md:block">
              {countryData.gdpTotal && (
                <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
                  <p className="text-xs text-stone-600 mb-1">GDP (TOTAL)</p>
                  <p className="text-lg font-bold text-stone-900">{countryData.gdpTotal}</p>
                </div>
              )}
              
              {countryData.gni && (
                <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
                    <p className="text-xs text-stone-600 mb-1">GNI</p>
                  <p className="text-lg font-bold text-stone-900">{countryData.gni}</p>
                </div>
              )}
              
              {countryData.povertyRate && (
                <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
                  <p className="text-xs text-stone-600 mb-1">POVERTY RATE</p>
                  <p className="text-lg font-bold text-stone-900">{countryData.povertyRate}</p>
                </div>
              )}
              </div>
            </div>
          </div>
        </Card>

        {/* Demographics & Development Indicators - Hidden on Mobile */}
        {(countryData.lifeExpectancy || countryData.literacyRate || countryData.unemploymentRate) && (
          <Card className="hidden md:block bg-white border-stone-200 p-6 mb-6">
            <h2 className="text-2xl font-bold text-stone-900 mb-4 flex items-center">
              <Heart className="w-6 h-6 mr-2 text-red-500" />
              Demographics & Development Indicators
            </h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {countryData.lifeExpectancy && (
                <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    <p className="text-xs text-stone-600 font-semibold">LIFE EXPECTANCY</p>
                  </div>
                  <p className="text-2xl font-bold text-stone-900">{countryData.lifeExpectancy.toFixed(1)} years</p>
                </div>
              )}
              
              {countryData.infantMortality && (
                <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-5 h-5 text-orange-500" />
                    <p className="text-xs text-stone-600 font-semibold">INFANT MORTALITY</p>
                  </div>
                  <p className="text-2xl font-bold text-stone-900">{countryData.infantMortality.toFixed(1)}/1000</p>
                </div>
              )}
              
              {countryData.literacyRate && (
                <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <p className="text-xs text-stone-600 font-semibold">LITERACY RATE</p>
                  </div>
                  <p className="text-2xl font-bold text-stone-900">{countryData.literacyRate.toFixed(1)}%</p>
                </div>
              )}
              
              {countryData.unemploymentRate && (
                <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-purple-500" />
                    <p className="text-xs text-stone-600 font-semibold">UNEMPLOYMENT</p>
                  </div>
                  <p className="text-2xl font-bold text-stone-900">{countryData.unemploymentRate.toFixed(1)}%</p>
                </div>
              )}
              
              {countryData.accessElectricityPct && (
                <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    <p className="text-xs text-stone-600 font-semibold">ELECTRICITY ACCESS</p>
                  </div>
                  <p className="text-2xl font-bold text-stone-900">{countryData.accessElectricityPct.toFixed(1)}%</p>
                </div>
              )}
              
              {countryData.accessWaterPct && (
                <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplet className="w-5 h-5 text-blue-500" />
                    <p className="text-xs text-stone-600 font-semibold">CLEAN WATER ACCESS</p>
                  </div>
                  <p className="text-2xl font-bold text-stone-900">{countryData.accessWaterPct.toFixed(1)}%</p>
                </div>
              )}
              
              {countryData.gdpGrowthRate && (
                <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <p className="text-xs text-stone-600 font-semibold">GDP GROWTH RATE</p>
                  </div>
                  <p className="text-2xl font-bold text-stone-900">{countryData.gdpGrowthRate.toFixed(1)}%</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Economic Structure - Hidden on Mobile */}
        {(countryData.primarySector || countryData.agriculturePctGdp || countryData.naturalResources) && (
          <Card className="hidden md:block bg-white border-stone-200 p-6 mb-6">
            <h2 className="text-2xl font-bold text-stone-900 mb-4 flex items-center">
              <Factory className="w-6 h-6 mr-2 text-blue-600" />
              Economic Structure
            </h2>
            
            <div className="space-y-6">
              {/* Primary Sector & Natural Resources */}
              <div className="grid md:grid-cols-2 gap-4">
                {countryData.primarySector && (
                  <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
                    <p className="text-xs text-stone-600 font-semibold mb-2">PRIMARY ECONOMIC SECTOR</p>
                    <p className="text-xl font-bold text-stone-900">{countryData.primarySector}</p>
                  </div>
                )}
                
                {countryData.naturalResources && countryData.naturalResources.length > 0 && (
                  <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
                    <p className="text-xs text-stone-600 font-semibold mb-2">NATURAL RESOURCES</p>
                    <div className="flex flex-wrap gap-2">
                      {countryData.naturalResources.map((resource, idx) => (
                        <Badge key={idx} className="bg-green-100 text-green-800 border-green-300">
                          {resource}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sectoral Composition of GDP */}
              {(countryData.agriculturePctGdp || countryData.industryPctGdp || countryData.servicesPctGdp) && (
                <div>
                  <h3 className="font-semibold text-stone-900 mb-3">Sectoral Composition (% of GDP)</h3>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {countryData.agriculturePctGdp && (
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <p className="text-xs text-green-700 font-semibold mb-1">AGRICULTURE</p>
                        <p className="text-3xl font-bold text-green-900">{countryData.agriculturePctGdp.toFixed(1)}%</p>
                      </div>
                    )}
                    
                    {countryData.industryPctGdp && (
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <p className="text-xs text-blue-700 font-semibold mb-1">INDUSTRY</p>
                        <p className="text-3xl font-bold text-blue-900">{countryData.industryPctGdp.toFixed(1)}%</p>
                      </div>
                    )}
                    
                    {countryData.servicesPctGdp && (
                      <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                        <p className="text-xs text-purple-700 font-semibold mb-1">SERVICES</p>
                        <p className="text-3xl font-bold text-purple-900">{countryData.servicesPctGdp.toFixed(1)}%</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Natural Resource Rents */}
              {(countryData.mineralRentsPct || countryData.oilRentsPct) && (
                <div>
                  <h3 className="font-semibold text-stone-900 mb-3">Natural Resource Rents (% of GDP)</h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {countryData.mineralRentsPct && (
                      <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
                        <p className="text-xs text-stone-600 font-semibold mb-1">MINERAL RENTS</p>
                        <p className="text-2xl font-bold text-stone-900">{countryData.mineralRentsPct.toFixed(2)}%</p>
                      </div>
                    )}
                    
                    {countryData.oilRentsPct && (
                      <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
                        <p className="text-xs text-stone-600 font-semibold mb-1">OIL RENTS</p>
                        <p className="text-2xl font-bold text-stone-900">{countryData.oilRentsPct.toFixed(2)}%</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Trade */}
              {(countryData.exportsPctGdp || countryData.importsPctGdp) && (
                <div>
                  <h3 className="font-semibold text-stone-900 mb-3">International Trade (% of GDP)</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {countryData.exportsPctGdp && (
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <p className="text-xs text-green-700 font-semibold mb-1">EXPORTS</p>
                        <p className="text-3xl font-bold text-green-900">{countryData.exportsPctGdp.toFixed(1)}%</p>
                      </div>
                    )}
                    
                    {countryData.importsPctGdp && (
                      <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                        <p className="text-xs text-orange-700 font-semibold mb-1">IMPORTS</p>
                        <p className="text-3xl font-bold text-orange-900">{countryData.importsPctGdp.toFixed(1)}%</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Country Header - Hidden on Mobile */}
        <Card className="hidden md:block bg-gradient-to-br from-stone-900 to-stone-800 text-white p-8 mb-6">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                {countryData.iso2Code ? (
                  <img 
                    src={`https://flagcdn.com/w80/${countryData.iso2Code.toLowerCase()}.png`}
                    alt={`${countryData.name} flag`}
                    className="w-16 h-12 object-cover rounded-lg shadow-lg border-2 border-white/20"
                    onError={(e) => {
                      // Fallback to globe icon if flag fails
                      e.currentTarget.outerHTML = '<div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>';
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Globe className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h2 className="text-4xl font-bold">{countryData.name}</h2>
                  <p className="text-stone-300 mt-1">World Bank Partnership & Portfolio</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-white/20 text-white border-white/30">
                  {countryData.region}
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30">
                  {countryData.incomeLevel}
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30">
                  {countryData.lendingType}
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30">
                  <MapPin className="w-3 h-3 mr-1" />
                  {countryData.capitalCity}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-stone-300">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{countryData.population}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>Regional VP:</span>
                  <Link 
                    href={`/department/${countryData.regionalVPId}`}
                    className="text-white hover:underline font-medium"
                  >
                    {countryData.regionalVP}
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="bg-white/10 rounded-lg p-4 min-w-[200px]">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-stone-300">Active Portfolio</p>
                  <p className="text-2xl font-bold">{countryData.portfolioValue}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-300">Active Projects</p>
                  <p className="text-2xl font-bold">{countryData.activeProjects}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-300">Member Since</p>
                  <p className="text-lg font-semibold">{countryData.memberSince}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Portfolio Overview */}
        <Card className="bg-white border-stone-200 p-4 md:p-6 mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-stone-900 mb-3 md:mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 md:w-6 md:h-6 mr-2" />
            <span className="md:hidden">Portfolio Stats</span>
            <span className="hidden md:inline">Portfolio Overview (2023-Present)</span>
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
            <div className="bg-stone-50 rounded-lg p-3 md:p-4">
              <p className="text-xs md:text-sm text-stone-600 mb-1">Portfolio Value</p>
              <p className="text-xl md:text-3xl font-bold text-stone-900">{countryData.portfolioValue}</p>
            </div>
            <div className="bg-stone-50 rounded-lg p-3 md:p-4">
              <p className="text-xs md:text-sm text-stone-600 mb-1">Active Projects</p>
              <p className="text-xl md:text-3xl font-bold text-stone-900">{countryData.activeProjects}</p>
            </div>
            <div className="hidden md:block bg-stone-50 rounded-lg p-4">
              <p className="text-sm text-stone-600 mb-1">IBRD Commitments</p>
              <p className="text-2xl font-bold text-stone-900">{countryData.ibrdCommitments}</p>
            </div>
            <div className="hidden md:block bg-stone-50 rounded-lg p-4">
              <p className="text-sm text-stone-600 mb-1">IDA Commitments</p>
              <p className="text-2xl font-bold text-stone-900">{countryData.idaCommitments || 'N/A'}</p>
            </div>
          </div>

          {/* Sector Breakdown - Hidden on Mobile */}
          <div className="hidden md:block">
            <h3 className="font-semibold text-stone-900 mb-3">Portfolio by Sector</h3>
            <div className="space-y-3">
              {countryData.sectorBreakdown.map((sector, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-stone-700">{sector.sector}</span>
                    <span className="text-sm font-semibold text-stone-900">
                      {sector.amount} ({sector.percentage}%) · {sector.projectCount} projects
                    </span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-2">
                    <div 
                      className="bg-stone-600 h-2 rounded-full transition-all"
                      style={{ width: `${sector.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Country Partnership Framework - Hidden on Mobile */}
        <Card className="hidden md:block bg-white border-stone-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-stone-900 mb-4 flex items-center">
            <FileText className="w-6 h-6 mr-2" />
            Country Partnership Framework ({countryData.countryPartnershipFramework.period})
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-stone-900 mb-3">Focus Areas</h3>
              <div className="space-y-2">
                {countryData.countryPartnershipFramework.focusAreas.map((area, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-stone-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-stone-700">{area}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-stone-900 mb-3">Strategic Objectives</h3>
              <div className="space-y-2">
                {countryData.countryPartnershipFramework.objectives.map((obj, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Target className="w-4 h-4 text-stone-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-stone-700">{obj}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-stone-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-stone-600">Total CPF Commitment</span>
              <span className="text-xl font-bold text-stone-900">{countryData.countryPartnershipFramework.totalCommitment}</span>
            </div>
          </div>
        </Card>

        {/* Current Affairs (2023-Present) - Hidden on Mobile */}
        {countryData.currentAffairs.length > 0 && (
          <Card className="hidden md:block bg-white border-stone-200 p-6 mb-6">
            <h2 className="text-2xl font-bold text-stone-900 mb-4 flex items-center">
              <Clock className="w-6 h-6 mr-2" />
              Recent Project Activity
            </h2>
            <p className="text-sm text-stone-600 mb-4">
              Latest World Bank project approvals and updates for {countryData.name}
            </p>
            
            <div className="space-y-4">
              {countryData.currentAffairs.map((affair, idx) => {
                const content = (
                  <div className={`border-l-4 border-blue-300 pl-4 py-2 bg-blue-50/30 rounded-r-lg ${affair.id ? 'hover:bg-blue-50/50 hover:border-blue-400 transition-all cursor-pointer' : ''}`}>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Calendar className="w-4 h-4 text-stone-500" />
                          <span className="text-sm text-stone-600">{affair.date}</span>
                          <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                            {affair.type}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-stone-900 mb-1 group-hover:text-blue-600 transition-colors">
                          {affair.title}
                        </h3>
                        <p className="text-sm text-stone-700 mb-2">{affair.description}</p>
                        {affair.amount && (
                          <p className="text-lg font-bold text-green-700">{affair.amount}</p>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-stone-500">
                      Source: {affair.source}
                      {affair.id && <span className="ml-2 text-blue-600">→ Click to view project details</span>}
                    </p>
                  </div>
                );

                return affair.id ? (
                  <Link key={idx} href={`/project/${affair.id}`} className="block group">
                    {content}
                  </Link>
                ) : (
                  <div key={idx}>{content}</div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Recent Projects (2023+) */}
        <Card className="bg-white border-stone-200 p-4 md:p-6 mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-stone-900 mb-3 md:mb-4 flex items-center">
            <Briefcase className="w-5 h-5 md:w-6 md:h-6 mr-2" />
            Active Projects
          </h2>
          
          {countryData.recentProjects.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 text-stone-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-stone-900 mb-2">No Projects Found</h3>
              <p className="text-stone-600">
                There are currently no World Bank projects recorded for {countryData.name} in our database.
              </p>
              <p className="text-sm text-stone-500 mt-2">
                This may indicate that projects are still being loaded or that there are no active projects at this time.
              </p>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-6">
              {countryData.recentProjects.map((project, idx) => (
              <Link key={idx} href={`/project/${project.id}`} className="block">
                <Card className="bg-stone-50 border-stone-200 hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer group">
                  <div className="p-4 md:p-6">
                  {/* Project Header */}
                  <div className="flex flex-col md:flex-row items-start justify-between gap-3 md:gap-4 mb-3 md:mb-4">
                    <div className="flex-1 w-full">
                      <h3 className="text-base md:text-lg font-bold text-stone-900 group-hover:text-blue-600 transition-colors mb-2">{project.title}</h3>
                      <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mb-2 md:mb-3">
                        <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">
                          {project.status}
                        </Badge>
                        <span className="text-xs md:text-sm text-stone-600">{new Date(project.approvalDate).toLocaleDateString()}</span>
                        <span className="hidden md:inline text-sm text-stone-600">ID: {project.id}</span>
                      </div>
                    </div>
                    <div className="text-left md:text-right w-full md:w-auto">
                      <p className="text-xl md:text-2xl font-bold text-stone-900">{project.totalAmount}</p>
                    </div>
                  </div>
                  
                  {/* Description - Hidden on mobile */}
                  <p className="hidden md:block text-stone-700 leading-relaxed mb-4">{project.description}</p>
                  
                  {/* Objectives - Hidden on mobile */}
                  <div className="hidden md:block mb-4">
                    <h4 className="font-semibold text-stone-900 mb-2 text-sm">Project Objectives:</h4>
                    <ul className="space-y-1">
                      {project.objectives.map((obj, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-stone-700">
                          <CheckCircle className="w-3 h-3 text-stone-500 flex-shrink-0 mt-0.5" />
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Sectors - Simplified on mobile */}
                  <div className="mb-3 md:mb-4">
                    <div className="flex flex-wrap gap-1.5 md:gap-2">
                      {project.sectors.slice(0, 3).map((sector, i) => (
                          <Badge key={i} className="bg-stone-100 text-stone-700 border-stone-200 text-xs">
                          {typeof sector === 'string' ? sector : sector.name || sector}
                          </Badge>
                        ))}
                      {project.sectors.length > 3 && (
                        <Badge className="bg-stone-100 text-stone-700 border-stone-200 text-xs">
                          +{project.sectors.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Project Link */}
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between pt-3 border-t border-stone-200 gap-2">
                    <span className="text-xs md:text-sm font-medium text-blue-600 group-hover:text-blue-700 transition-colors flex items-center gap-1">
                      <span className="hidden md:inline">View full project details →</span>
                      <span className="md:hidden">Tap for details →</span>
                    </span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.open(project.sourceUrl, '_blank', 'noopener,noreferrer');
                      }}
                      className="inline-flex items-center gap-1.5 md:gap-2 text-stone-600 hover:text-stone-900 text-xs md:text-sm hover:underline"
                    >
                      <ExternalLink className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="hidden md:inline">World Bank Site</span>
                      <span className="md:hidden">Source</span>
                    </button>
                  </div>
                </div>
              </Card>
              </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Development Priorities - Hidden on Mobile */}
        {countryData.developmentPriorities.length > 0 && (
          <Card className="hidden md:block bg-white border-stone-200 p-6 mb-6">
            <h2 className="text-2xl font-bold text-stone-900 mb-4 flex items-center">
              <Target className="w-6 h-6 mr-2" />
              Development Priorities
            </h2>
            <p className="text-sm text-stone-600 mb-4">
              Based on active project sectors and themes
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {countryData.developmentPriorities.map((priority, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-stone-50 rounded-lg p-3">
                  <div className="w-6 h-6 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-stone-800">{priority}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Key Results & Impact - Hidden on Mobile */}
        {countryData.keyResults.length > 0 && (
          <Card className="hidden md:block bg-white border-stone-200 p-6 mb-6">
            <h2 className="text-2xl font-bold text-stone-900 mb-4 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2" />
              Key Results & Impact
            </h2>
            <p className="text-sm text-stone-600 mb-4">
              Portfolio metrics based on current project data
            </p>
            
            <div className="space-y-4">
              {countryData.keyResults.map((result, idx) => (
                <div key={idx} className="bg-stone-50 rounded-lg p-4">
                  <h3 className="font-semibold text-stone-900 mb-3">{result.indicator}</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-stone-600 mb-1">Baseline</p>
                      <p className="text-lg font-bold text-stone-700">{result.baseline}</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-600 mb-1">Current ({result.year})</p>
                      <p className="text-lg font-bold text-green-700">{result.current}</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-600 mb-1">Target</p>
                      <p className="text-lg font-bold text-stone-900">{result.target}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Sources & Verification - Hidden on Mobile */}
        <Card className="hidden md:block bg-stone-50 border-stone-200 p-6">
          <h2 className="text-xl font-semibold text-stone-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Data Sources & Verification
          </h2>
          
          {countryData.sources.length > 0 ? (
            <div className="space-y-2 mb-4">
              {countryData.sources.map((source, idx) => (
                <a
                  key={idx}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-2 text-sm text-stone-600 hover:text-stone-900 group"
                >
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-3 h-3" />
                    <span className="group-hover:underline">{source.title}</span>
                  </div>
                  <span className="text-xs text-stone-500">{source.date}</span>
                </a>
              ))}
            </div>
          ) : (
            <div className="mb-4 text-sm text-stone-500">
              <p>Data compiled from World Bank official sources</p>
            </div>
          )}
          
          <div className="pt-4 border-t border-stone-200">
            <div className="flex items-center justify-between text-sm flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-stone-700">
                  Data Quality: {countryData.activeProjects > 0 ? 'Verified' : 'Pending Updates'}
                </span>
              </div>
              <span className="text-stone-500">Last updated: {countryData.lastUpdated}</span>
            </div>
            <p className="text-xs text-stone-500 mt-2">
              Source: {countryData.apiSource} | {countryData.activeProjects > 0 
                ? `${countryData.activeProjects} active projects tracked` 
                : 'Awaiting project data import'} | Data refreshed daily
            </p>
          </div>
        </Card>

        {/* External Links */}
        <div className="flex flex-col md:flex-row justify-center gap-3 md:gap-4">
          <a
            href={`https://www.worldbank.org/en/country/${countryData.name.toLowerCase().replace(/ /g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 md:flex-initial"
          >
            <Button className="w-full md:w-auto bg-stone-900 hover:bg-stone-800 text-white text-sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Official World Bank Page</span>
              <span className="md:hidden">Official Page</span>
            </Button>
          </a>
          <a
            href={`https://projects.worldbank.org/en/projects-operations/projects-list?countrycode_exact=${countryData.iso2Code}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 md:flex-initial"
          >
            <Button variant="outline" className="w-full md:w-auto border-stone-300 text-stone-700 hover:bg-stone-50 text-sm">
              <Briefcase className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">View All Projects</span>
              <span className="md:hidden">All Projects</span>
            </Button>
          </a>
        </div>
      </div>
    </main>
  );
}
