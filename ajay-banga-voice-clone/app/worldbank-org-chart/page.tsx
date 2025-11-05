'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AppLayout } from '@/components/app-layout';
import { Search, Building, Users, Globe, ChevronDown, ChevronRight, User, Crown, Shield, Briefcase } from 'lucide-react';

interface Department {
  id: string;
  name: string;
  acronym: string;
  description: string;
  parent?: string;
  level: number;
  children?: Department[];
  functions: string[];
}

interface Leader {
  id: string;
  name: string;
  position: string;
  avatar: string; // URL or placeholder
  bio: string;
  level: number;
  parent?: string;
  children?: Leader[];
  reportsTo?: string;
  country?: string;
  tenure?: string;
  education?: string[];
  linkedin?: string;
  website?: string;
}

interface Abbreviation {
  acronym: string;
  fullName: string;
  description: string;
  category: string;
}

// World Bank Organizational Structure
const worldBankStructure: Department[] = [
  {
    id: 'president',
    name: 'Office of the President',
    acronym: 'OP',
    description: 'Executive leadership and strategic direction',
    level: 1,
    functions: ['Strategic Planning', 'Policy Direction', 'Stakeholder Relations']
  },
  {
    id: 'executive-directors',
    name: 'Executive Directors',
    acronym: 'EDs',
    description: 'Board of Executive Directors representing member countries',
    level: 1,
    functions: ['Governance', 'Oversight', 'Policy Approval']
  },
  {
    id: 'vice-presidents',
    name: 'Vice Presidents',
    acronym: 'VPs',
    description: 'Senior executive leadership',
    level: 2,
    functions: ['Regional Operations', 'Global Practices', 'Corporate Functions']
  },
  {
    id: 'regional-vps',
    name: 'Regional Vice Presidents',
    acronym: 'RVPs',
    description: 'Regional leadership for operational delivery',
    level: 3,
    functions: ['Regional Strategy', 'Country Programs', 'Regional Partnerships']
  },
  {
    id: 'africa',
    name: 'Africa Region',
    acronym: 'AFR',
    description: 'Eastern and Southern Africa operations',
    level: 4,
    functions: ['Country Programs', 'Regional Integration', 'Development Impact'],
    parent: 'regional-vps'
  },
  {
    id: 'asia',
    name: 'East Asia and Pacific Region',
    acronym: 'EAP',
    description: 'East Asia and Pacific operations',
    level: 4,
    functions: ['Economic Development', 'Infrastructure', 'Social Protection'],
    parent: 'regional-vps'
  },
  {
    id: 'eca',
    name: 'Europe and Central Asia Region',
    acronym: 'ECA',
    description: 'Europe and Central Asia operations',
    level: 4,
    functions: ['Transition Economies', 'Regional Cooperation', 'Institutional Reform'],
    parent: 'regional-vps'
  },
  {
    id: 'lac',
    name: 'Latin America and Caribbean Region',
    acronym: 'LAC',
    description: 'Latin America and Caribbean operations',
    level: 4,
    functions: ['Social Inclusion', 'Climate Resilience', 'Private Sector Development'],
    parent: 'regional-vps'
  },
  {
    id: 'mena',
    name: 'Middle East and North Africa Region',
    acronym: 'MENA',
    description: 'Middle East and North Africa operations',
    level: 4,
    functions: ['Conflict-Affected States', 'Economic Diversification', 'Human Development'],
    parent: 'regional-vps'
  },
  {
    id: 'sar',
    name: 'South Asia Region',
    acronym: 'SAR',
    description: 'South Asia operations',
    level: 4,
    functions: ['Poverty Reduction', 'Infrastructure', 'Education'],
    parent: 'regional-vps'
  },
  {
    id: 'global-practices',
    name: 'Global Practices',
    acronym: 'GPs',
    description: 'Technical expertise and knowledge sectors',
    level: 3,
    functions: ['Technical Leadership', 'Knowledge Sharing', 'Innovation']
  },
  {
    id: 'education',
    name: 'Education Global Practice',
    acronym: 'GED',
    description: 'Education sector expertise',
    level: 4,
    functions: ['Learning Outcomes', 'Education Systems', 'Skills Development'],
    parent: 'global-practices'
  },
  {
    id: 'health',
    name: 'Health, Nutrition and Population Global Practice',
    acronym: 'GHN',
    description: 'Health sector expertise',
    level: 4,
    functions: ['Health Systems', 'Nutrition', 'Population Dynamics'],
    parent: 'global-practices'
  },
  {
    id: 'social-protection',
    name: 'Social Protection and Labor Global Practice',
    acronym: 'GSO',
    description: 'Social protection and labor expertise',
    level: 4,
    functions: ['Social Safety Nets', 'Labor Markets', 'Poverty Reduction'],
    parent: 'global-practices'
  },
  {
    id: 'finance',
    name: 'Finance, Competitiveness and Innovation Global Practice',
    acronym: 'GFI',
    description: 'Finance sector expertise',
    level: 4,
    functions: ['Financial Markets', 'Private Sector', 'Innovation'],
    parent: 'global-practices'
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure Global Practice',
    acronym: 'GIN',
    description: 'Infrastructure sector expertise',
    level: 4,
    functions: ['Transportation', 'Energy', 'Urban Development'],
    parent: 'global-practices'
  },
  {
    id: 'environment',
    name: 'Environment and Natural Resources Global Practice',
    acronym: 'GEN',
    description: 'Environment sector expertise',
    level: 4,
    functions: ['Climate Change', 'Biodiversity', 'Natural Resources'],
    parent: 'global-practices'
  },
  {
    id: 'agriculture',
    name: 'Agriculture and Food Global Practice',
    acronym: 'GAF',
    description: 'Agriculture sector expertise',
    level: 4,
    functions: ['Food Security', 'Agricultural Productivity', 'Rural Development'],
    parent: 'global-practices'
  },
  {
    id: 'governance',
    name: 'Governance Global Practice',
    acronym: 'GGP',
    description: 'Governance sector expertise',
    level: 4,
    functions: ['Public Sector', 'Anti-Corruption', 'Rule of Law'],
    parent: 'global-practices'
  },
  {
    id: 'corporate-functions',
    name: 'Corporate Functions',
    acronym: 'CF',
    description: 'Internal support functions',
    level: 3,
    functions: ['HR', 'Finance', 'Legal', 'Communications']
  },
  {
    id: 'human-resources',
    name: 'Human Resources',
    acronym: 'HR',
    description: 'Human capital management',
    level: 4,
    functions: ['Talent Management', 'Employee Relations', 'Learning & Development'],
    parent: 'corporate-functions'
  },
  {
    id: 'corporate-finance',
    name: 'Corporate Finance',
    acronym: 'CFI',
    description: 'Financial management and treasury',
    level: 4,
    functions: ['Budget', 'Financial Planning', 'Risk Management'],
    parent: 'corporate-functions'
  },
  {
    id: 'legal',
    name: 'Legal Department',
    acronym: 'LEG',
    description: 'Legal services and compliance',
    level: 4,
    functions: ['Legal Advice', 'Contract Management', 'Compliance'],
    parent: 'corporate-functions'
  },
  {
    id: 'communications',
    name: 'Communications',
    acronym: 'EXT',
    description: 'External communications and outreach',
    level: 4,
    functions: ['Media Relations', 'Digital Communications', 'Stakeholder Engagement'],
    parent: 'corporate-functions'
  },
  {
    id: 'independent-evaluation',
    name: 'Independent Evaluation Group',
    acronym: 'IEG',
    description: 'Independent evaluation of World Bank operations',
    level: 2,
    functions: ['Impact Evaluation', 'Learning', 'Accountability']
  },
  {
    id: 'inspection-panel',
    name: 'Inspection Panel',
    acronym: 'IP',
    description: 'Independent accountability mechanism',
    level: 2,
    functions: ['Complaint Investigation', 'Problem Resolution', 'Accountability']
  }
];


// World Bank Abbreviations Lexicon
const worldBankLexicon: Abbreviation[] = [
  // Organizational Abbreviations
  { acronym: 'WBG', fullName: 'World Bank Group', description: 'The collective term for IBRD, IDA, IFC, MIGA, and ICSID', category: 'Organization' },
  { acronym: 'IBRD', fullName: 'International Bank for Reconstruction and Development', description: 'The original World Bank lending arm for middle-income countries', category: 'Organization' },
  { acronym: 'IDA', fullName: 'International Development Association', description: 'Provides interest-free loans and grants to the world\'s poorest countries', category: 'Organization' },
  { acronym: 'IFC', fullName: 'International Finance Corporation', description: 'Focuses on private sector development in emerging markets', category: 'Organization' },
  { acronym: 'MIGA', fullName: 'Multilateral Investment Guarantee Agency', description: 'Provides political risk insurance and credit enhancement', category: 'Organization' },
  { acronym: 'ICSID', fullName: 'International Centre for Settlement of Investment Disputes', description: 'Provides international arbitration for investment disputes', category: 'Organization' },

  // Regional Abbreviations
  { acronym: 'AFR', fullName: 'Africa Region', description: 'Eastern and Southern Africa operations', category: 'Regional' },
  { acronym: 'EAP', fullName: 'East Asia and Pacific Region', description: 'East Asia and Pacific operations', category: 'Regional' },
  { acronym: 'ECA', fullName: 'Europe and Central Asia Region', description: 'Europe and Central Asia operations', category: 'Regional' },
  { acronym: 'LAC', fullName: 'Latin America and Caribbean Region', description: 'Latin America and Caribbean operations', category: 'Regional' },
  { acronym: 'MENA', fullName: 'Middle East and North Africa Region', description: 'Middle East and North Africa operations', category: 'Regional' },
  { acronym: 'SAR', fullName: 'South Asia Region', description: 'South Asia operations', category: 'Regional' },

  // Global Practice Abbreviations
  { acronym: 'GED', fullName: 'Education Global Practice', description: 'Education sector expertise and operations', category: 'Global Practice' },
  { acronym: 'GHN', fullName: 'Health, Nutrition and Population Global Practice', description: 'Health sector expertise and operations', category: 'Global Practice' },
  { acronym: 'GSO', fullName: 'Social Protection and Labor Global Practice', description: 'Social protection and labor sector expertise', category: 'Global Practice' },
  { acronym: 'GFI', fullName: 'Finance, Competitiveness and Innovation Global Practice', description: 'Finance sector expertise and operations', category: 'Global Practice' },
  { acronym: 'GIN', fullName: 'Infrastructure Global Practice', description: 'Infrastructure sector expertise and operations', category: 'Global Practice' },
  { acronym: 'GEN', fullName: 'Environment and Natural Resources Global Practice', description: 'Environment sector expertise and operations', category: 'Global Practice' },
  { acronym: 'GAF', fullName: 'Agriculture and Food Global Practice', description: 'Agriculture sector expertise and operations', category: 'Global Practice' },
  { acronym: 'GGP', fullName: 'Governance Global Practice', description: 'Governance sector expertise and operations', category: 'Global Practice' },

  // Operational Abbreviations
  { acronym: 'CAS', fullName: 'Country Assistance Strategy', description: 'Comprehensive development strategy for each country partnership', category: 'Operational' },
  { acronym: 'CPF', fullName: 'Country Partnership Framework', description: 'Three-year strategic framework for World Bank engagement with a country', category: 'Operational' },
  { acronym: 'DPO', fullName: 'Development Policy Operation', description: 'Budget support operations linked to policy reforms', category: 'Operational' },
  { acronym: 'IPF', fullName: 'Investment Project Financing', description: 'Traditional investment lending for specific projects', category: 'Operational' },
  { acronym: 'PforR', fullName: 'Program-for-Results', description: 'Results-based financing linked to development outcomes', category: 'Operational' },
  { acronym: 'SCF', fullName: 'Scaling-Up Facility', description: 'Additional concessional financing for IDA countries', category: 'Operational' },

  // Financial Abbreviations
  { acronym: 'SDR', fullName: 'Special Drawing Rights', description: 'International reserve asset created by the IMF', category: 'Financial' },
  { acronym: 'LIBOR', fullName: 'London Interbank Offered Rate', description: 'Benchmark interest rate for dollar-denominated loans', category: 'Financial' },
  { acronym: 'SOFR', fullName: 'Secured Overnight Financing Rate', description: 'Replacement for LIBOR in US dollar transactions', category: 'Financial' },
  { acronym: 'CAT-DDO', fullName: 'Contingent-Agency and Termination for Debt Distress Option', description: 'Debt clause providing contingent financing for debt distress', category: 'Financial' },

  // Knowledge and Learning Abbreviations
  { acronym: 'KM', fullName: 'Knowledge Management', description: 'Systems and processes for capturing and sharing knowledge', category: 'Knowledge' },
  { acronym: 'DEC', fullName: 'Development Economics', description: 'Research and economic analysis function', category: 'Knowledge' },
  { acronym: 'WDR', fullName: 'World Development Report', description: 'Annual flagship publication on development topics', category: 'Knowledge' },
  { acronym: 'GSURR', fullName: 'Global Solutions for Urgent Risks and Resilience', description: 'Research program on urgent global challenges', category: 'Knowledge' },

  // Corporate Abbreviations
  { acronym: 'HR', fullName: 'Human Resources', description: 'Human capital and talent management', category: 'Corporate' },
  { acronym: 'IT', fullName: 'Information Technology', description: 'Technology infrastructure and services', category: 'Corporate' },
  { acronym: 'OSS', fullName: 'Operational Support Services', description: 'Administrative and operational support', category: 'Corporate' },
  { acronym: 'GS', fullName: 'General Services', description: 'Facilities, security, and administrative services', category: 'Corporate' },

  // Governance Abbreviations
  { acronym: 'EDs', fullName: 'Executive Directors', description: 'Board members representing member countries', category: 'Governance' },
  { acronym: 'AFDB', fullName: 'Alternate Executive Directors', description: 'Deputy representatives to the Board', category: 'Governance' },
  { acronym: 'BoD', fullName: 'Board of Directors', description: 'Governing body of the World Bank', category: 'Governance' },
  { acronym: 'BoG', fullName: 'Board of Governors', description: 'Highest decision-making body, one governor per member country', category: 'Governance' },

  // Partnership Abbreviations
  { acronym: 'MDBs', fullName: 'Multilateral Development Banks', description: 'International financial institutions focused on development', category: 'Partnerships' },
  { acronym: 'DFIs', fullName: 'Development Finance Institutions', description: 'Institutions that provide financing for development projects', category: 'Partnerships' },
  { acronym: 'PFIs', fullName: 'Private Financial Institutions', description: 'Commercial banks and investment funds', category: 'Partnerships' },
  { acronym: 'CSOs', fullName: 'Civil Society Organizations', description: 'Non-governmental organizations and community groups', category: 'Partnerships' },

  // Risk and Compliance Abbreviations
  { acronym: 'AML', fullName: 'Anti-Money Laundering', description: 'Measures to prevent illegal financial activities', category: 'Compliance' },
  { acronym: 'CFT', fullName: 'Combating the Financing of Terrorism', description: 'Measures to prevent terrorism financing', category: 'Compliance' },
  { acronym: 'ESG', fullName: 'Environmental, Social, and Governance', description: 'Standards for sustainable and ethical business practices', category: 'Compliance' },
  { acronym: 'SAP', fullName: 'Sanctions Advisory Panel', description: 'Advisory body on sanctions compliance', category: 'Compliance' },

  // Country and Regional Abbreviations
  { acronym: 'LICs', fullName: 'Low-Income Countries', description: 'Countries with GNI per capita of $1,085 or less', category: 'Country Classification' },
  { acronym: 'MICs', fullName: 'Middle-Income Countries', description: 'Countries with GNI per capita between $1,086 and $13,205', category: 'Country Classification' },
  { acronym: 'HICs', fullName: 'High-Income Countries', description: 'Countries with GNI per capita of $13,206 or more', category: 'Country Classification' },
  { acronym: 'FCAS', fullName: 'Fragile and Conflict-Affected Situations', description: 'Countries facing severe development challenges due to conflict or fragility', category: 'Country Classification' },
  { acronym: 'SIDS', fullName: 'Small Island Developing States', description: 'Small island nations facing unique development challenges', category: 'Country Classification' },
  { acronym: 'LLDCs', fullName: 'Landlocked Developing Countries', description: 'Countries without coastal access facing transportation challenges', category: 'Country Classification' }
];

const categories = ['All', ...Array.from(new Set(worldBankLexicon.map(item => item.category)))];

// Avatar placeholder function
const getAvatarUrl = (name: string) => {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=3b82f6&color=fff&size=120&font-size=0.6`;
};

export default function WorldBankOrgChartPage() {
  const [activeTab, setActiveTab] = useState<'leadership' | 'orgchart' | 'lexicon'>('leadership');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['ajay-banga']));
  const [selectedLeader, setSelectedLeader] = useState<Leader | null>(null);

  // State for dynamic org chart data
  const [orgChartData, setOrgChartData] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch org chart data on component mount
  useEffect(() => {
    const fetchOrgChartData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/worldbank-orgchart?action=hierarchy');
        if (!response.ok) {
          throw new Error('Failed to fetch org chart data');
        }
        const data = await response.json();

        if (data.hierarchy && data.hierarchy.length > 0) {
          // Use database data if available
          const convertedData: Leader[] = data.hierarchy.map((member: any) => ({
            id: member.id,
            name: member.name,
            position: member.position,
            avatar: member.avatar_url || getAvatarUrl(member.name),
            bio: member.bio,
            level: member.level,
            parent: member.parent_id,
            reportsTo: member.reports_to,
            country: member.country,
            tenure: member.tenure,
            education: member.education,
            department: member.department,
            region: member.region,
            function: member.function,
            children: [], // Will be populated based on relationships
            children_count: member.children_count
          }));

          // Build hierarchy relationships
          const dataMap = new Map(convertedData.map(item => [item.id, item]));
          convertedData.forEach(member => {
            if (member.parent && dataMap.has(member.parent)) {
              const parent = dataMap.get(member.parent)!;
              if (!parent.children) parent.children = [];
              parent.children.push(member);
            }
          });

          setOrgChartData(convertedData);
        } else {
          // Fallback to hardcoded data if database is empty or unavailable
          console.log('Using fallback org chart data');
          setOrgChartData(getFallbackOrgChartData());
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching org chart:', err);
        // Fallback to hardcoded data on error
        console.log('Falling back to hardcoded org chart data');
        setOrgChartData(getFallbackOrgChartData());
        setError(null); // Don't show error since we have fallback data
      } finally {
        setLoading(false);
      }
    };

    fetchOrgChartData();
  }, []);

  // Fallback hardcoded data
  const getFallbackOrgChartData = (): Leader[] => [
    {
      id: 'ajay-banga',
      name: 'Ajay Banga',
      position: 'President',
      avatar: getAvatarUrl('Ajay Banga'),
      bio: 'President of the World Bank Group since June 2023. Former CEO of Mastercard. Leading global efforts to end extreme poverty and promote shared prosperity.',
      level: 1,
      country: 'United States',
      tenure: '2023–Present',
      education: ['Indian Institute of Technology, Delhi', 'Saint Stephen\'s College']
    },
    {
      id: 'executive-team',
      name: 'Executive Leadership Team',
      position: 'Executive Vice Presidents',
      avatar: getAvatarUrl('Executive Team'),
      bio: 'Senior executive leadership team supporting the President in global operations.',
      level: 2,
      parent: 'ajay-banga',
    },
    {
      id: 'regional-leaders',
      name: 'Regional Leadership',
      position: 'Regional Vice Presidents',
      avatar: getAvatarUrl('Regional Leaders'),
      bio: 'Regional leaders overseeing country programs and operations worldwide.',
      level: 2,
      parent: 'ajay-banga',
    },
    {
      id: 'global-practices',
      name: 'Global Practices',
      position: 'Practice Leaders',
      avatar: getAvatarUrl('Global Practices'),
      bio: 'Technical experts leading sectoral knowledge and global standards.',
      level: 2,
      parent: 'ajay-banga',
    },
    {
      id: 'corporate-functions',
      name: 'Corporate Functions',
      position: 'Corporate Leaders',
      avatar: getAvatarUrl('Corporate Functions'),
      bio: 'Internal support functions and corporate governance.',
      level: 2,
      parent: 'ajay-banga',
    },
    // Individual leaders
    {
      id: 'axel-van-trotsenburg',
      name: 'Axel van Trotsenburg',
      position: 'Managing Director & COO',
      avatar: getAvatarUrl('Axel van Trotsenburg'),
      bio: 'Chief Operating Officer overseeing operational excellence and institutional reforms.',
      level: 3,
      parent: 'executive-team',
      country: 'Netherlands',
      tenure: '2019–Present'
    },
    {
      id: 'makhtar-diop',
      name: 'Makhtar Diop',
      position: 'Vice President, Infrastructure',
      avatar: getAvatarUrl('Makhtar Diop'),
      bio: 'Leading infrastructure investments across energy, transport, and urban development.',
      level: 3,
      parent: 'executive-team',
      country: 'Senegal',
      tenure: '2018–Present'
    },
    {
      id: 'anna-bjerde',
      name: 'Anna Bjerde',
      position: 'Managing Director, Development Policy & Partnerships',
      avatar: getAvatarUrl('Anna Bjerde'),
      bio: 'Overseeing development policy, partnerships, and global engagement initiatives.',
      level: 3,
      parent: 'executive-team',
      country: 'Norway',
      tenure: '2022–Present'
    },
    {
      id: 'mamta-murthi',
      name: 'Mamta Murthi',
      position: 'Vice President, Human Development',
      avatar: getAvatarUrl('Mamta Murthi'),
      bio: 'Leading human development initiatives including education, health, and social protection.',
      level: 3,
      parent: 'executive-team',
      country: 'India',
      tenure: '2023–Present'
    }
  ];

  const toggleExpanded = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const filteredLexicon = worldBankLexicon.filter(item => {
    const matchesSearch = item.acronym.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderOrgChartNode = (department: Department, isLast: boolean = false) => {
    const hasChildren = department.children || worldBankStructure.some(d => d.parent === department.id);
    const isExpanded = expandedNodes.has(department.id);
    const children = worldBankStructure.filter(d => d.parent === department.id);

    return (
      <div key={department.id} className="relative">
        <div className="flex items-start gap-3 py-3">
          <div className="flex flex-col items-center">
            {hasChildren && (
              <button
                onClick={() => toggleExpanded(department.id)}
                className="p-1 hover:bg-gray-100 rounded text-gray-600"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            )}
            {!isLast && hasChildren && (
              <div className="w-px h-full bg-gray-300 mt-2"></div>
            )}
          </div>

          <Card className={`flex-1 p-4 ${department.level === 1 ? 'bg-blue-50 border-blue-200' :
                                         department.level === 2 ? 'bg-green-50 border-green-200' :
                                         department.level === 3 ? 'bg-yellow-50 border-yellow-200' :
                                         'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Building className="w-5 h-5 text-gray-600" />
                  {department.name}
                  <span className="text-sm font-normal text-gray-500">({department.acronym})</span>
                </h3>
                <p className="text-gray-600 mt-1">{department.description}</p>
                <div className="mt-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Key Functions:</h4>
                  <div className="flex flex-wrap gap-2">
                    {department.functions.map((func, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {func}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  department.level === 1 ? 'bg-blue-100 text-blue-800' :
                  department.level === 2 ? 'bg-green-100 text-green-800' :
                  department.level === 3 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  Level {department.level}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {isExpanded && children.length > 0 && (
          <div className="ml-8 pl-4 border-l-2 border-gray-200">
            {children.map((child, index) => renderOrgChartNode(child, index === children.length - 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            World Bank Leadership & Organization
          </h1>
          <p className="text-gray-600">Meet the leadership team, explore organizational structure, and master World Bank terminology</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('leadership')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'leadership'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Leadership Team
          </button>
          <button
            onClick={() => setActiveTab('orgchart')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'orgchart'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Building className="w-4 h-4 inline mr-2" />
            Organizational Chart
          </button>
          <button
            onClick={() => setActiveTab('lexicon')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'lexicon'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Search className="w-4 h-4 inline mr-2" />
            Abbreviations Lexicon
          </button>
        </div>

        {/* Content */}
        {activeTab === 'leadership' ? (
          <div className="space-y-8">
            {/* Leadership Chart */}
            <Card className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Crown className="w-6 h-6 text-blue-600" />
                World Bank Group Leadership Team
              </h2>

              {/* Level 1: President */}
              <div className="flex justify-center mb-12">
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : error ? (
                  <div className="text-center text-red-600">
                    <p>{error}</p>
                    <Button onClick={() => window.location.reload()} className="mt-2">
                      Retry
                    </Button>
                  </div>
                ) : (
                  (() => {
                    const president = orgChartData.find(member => member.level === 1);
                    return president ? (
                      <div className="text-center">
                        <div className="relative mb-4">
                          <img
                            src={president.avatar || getAvatarUrl(president.name)}
                            alt={president.name}
                            className="w-24 h-24 rounded-full mx-auto border-4 border-blue-500 shadow-lg"
                          />
                          <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white rounded-full p-1">
                            <Crown className="w-4 h-4" />
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{president.name}</h3>
                        <p className="text-blue-600 font-medium">{president.position}</p>
                        <p className="text-sm text-gray-600 mt-1">World Bank Group</p>
                        <div className="flex items-center justify-center gap-2 mt-2">
                          {president.country && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {president.country}
                            </span>
                          )}
                          {president.tenure && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              {president.tenure}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500">
                        <p>No president data available</p>
                      </div>
                    );
                  })()
                )}
              </div>

              {/* Connecting Line */}
              <div className="flex justify-center mb-8">
                <div className="w-1 bg-blue-300 h-8"></div>
              </div>

              {/* Level 2: Executive Leadership */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {orgChartData.filter(leader => leader.level === 2).map((leader) => (
                  <div key={leader.id} className="text-center">
                    <button
                      onClick={() => toggleExpanded(leader.id)}
                      className="w-full group"
                    >
                      <div className="relative mb-3">
                        <img
                          src={getAvatarUrl(leader.name)}
                          alt={leader.name}
                          className="w-16 h-16 rounded-full mx-auto border-2 border-green-400 shadow-md group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-green-600 text-white rounded-full p-1">
                          <Shield className="w-3 h-3" />
                        </div>
                      </div>
                      <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {leader.name}
                      </h4>
                      <p className="text-sm text-gray-600">{leader.position}</p>
                      <div className="flex items-center justify-center mt-2">
                        {expandedNodes.has(leader.id) ?
                          <ChevronDown className="w-4 h-4 text-gray-400" /> :
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        }
                      </div>
                    </button>
                  </div>
                ))}
              </div>

              {/* Level 3: Individual Leaders */}
              {orgChartData.filter(leader => leader.level === 2).map((groupLeader) => (
                expandedNodes.has(groupLeader.id) && (
                  <div key={`group-${groupLeader.id}`} className="mb-8">
                    {/* Group Header */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-px bg-gray-300 flex-1"></div>
                      <h3 className="text-lg font-semibold text-gray-700 bg-white px-4">
                        {groupLeader.name}
                      </h3>
                      <div className="h-px bg-gray-300 flex-1"></div>
                    </div>

                    {/* Individual Leaders in Group */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {orgChartData
                        .filter(leader => leader.parent === groupLeader.id)
                        .map((leader) => (
                        <Card
                          key={leader.id}
                          className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                          onClick={() => {
                            // Check if this leader has children (team members)
                            const hasChildren = orgChartData.some(member => member.parent === leader.id);
                            if (hasChildren) {
                              toggleExpanded(leader.id);
                            } else {
                              setSelectedLeader(leader);
                            }
                          }}
                        >
                          <div className="text-center">
                            <img
                              src={getAvatarUrl(leader.name)}
                              alt={leader.name}
                              className="w-12 h-12 rounded-full mx-auto mb-3 border-2 border-gray-200"
                            />
                            <h4 className="font-semibold text-gray-900 text-sm">{leader.name}</h4>
                            <p className="text-xs text-blue-600 font-medium mb-2">{leader.position}</p>
                            <div className="flex flex-col gap-1 text-xs text-gray-500">
                              {leader.country && (
                                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                  {leader.country}
                                </span>
                              )}
                              {leader.tenure && (
                                <span className="text-gray-500">{leader.tenure}</span>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )
              ))}

              {/* Level 4: Teams under individual leaders */}
              {orgChartData
                .filter(leader => leader.level === 3)
                .map((teamLeader) => (
                expandedNodes.has(teamLeader.id) && (
                  <div key={`team-${teamLeader.id}`} className="mb-8">
                    {/* Team Header */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-px bg-gray-300 flex-1"></div>
                      <h3 className="text-lg font-semibold text-gray-700 bg-white px-4">
                        {teamLeader.name}'s Team
                      </h3>
                      <div className="h-px bg-gray-300 flex-1"></div>
                    </div>

                    {/* Team Members */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {orgChartData
                        .filter(member => member.parent === teamLeader.id)
                        .map((member) => (
                        <Card
                          key={member.id}
                          className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                          onClick={() => setSelectedLeader(member)}
                        >
                          <div className="text-center">
                            <img
                              src={getAvatarUrl(member.name)}
                              alt={member.name}
                              className="w-12 h-12 rounded-full mx-auto mb-3 border-2 border-gray-200"
                            />
                            <h4 className="font-semibold text-gray-900 text-sm">{member.name}</h4>
                            <p className="text-xs text-blue-600 font-medium mb-2">{member.position}</p>
                            <div className="flex flex-col gap-1 text-xs text-gray-500">
                              {member.country && (
                                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                  {member.country}
                                </span>
                              )}
                              {member.tenure && (
                                <span className="text-gray-500">{member.tenure}</span>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </Card>

            {/* Selected Leader Detail Modal */}
            {selectedLeader && (
              <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <div className="flex items-start gap-6">
                  <img
                    src={getAvatarUrl(selectedLeader.name)}
                    alt={selectedLeader.name}
                    className="w-20 h-20 rounded-full border-4 border-blue-400 shadow-lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{selectedLeader.name}</h3>
                        <p className="text-blue-600 font-medium text-lg">{selectedLeader.position}</p>
                      </div>
                      <Button
                        onClick={() => setSelectedLeader(null)}
                        variant="ghost"
                        size="sm"
                      >
                        ✕
                      </Button>
                    </div>

                    <p className="text-gray-700 mb-4 leading-relaxed">{selectedLeader.bio}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      {selectedLeader.country && (
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">Country:</span>
                          <span>{selectedLeader.country}</span>
                        </div>
                      )}
                      {selectedLeader.tenure && (
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">Tenure:</span>
                          <span>{selectedLeader.tenure}</span>
                        </div>
                      )}
                      {selectedLeader.education && selectedLeader.education.length > 0 && (
                        <div>
                          <span className="font-medium">Education:</span>
                          <ul className="mt-1 text-xs text-gray-600">
                            {selectedLeader.education.map((edu, index) => (
                              <li key={index}>• {edu}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        ) : activeTab === 'orgchart' ? (
          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">World Bank Group Organizational Structure</h2>
            <div className="space-y-1">
              {worldBankStructure
                .filter(dept => !dept.parent)
                .map((dept, index) => renderOrgChartNode(dept, index === worldBankStructure.filter(d => !d.parent).length - 1))}
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Search and Filter */}
            <Card className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search abbreviations, terms, or descriptions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="md:w-64">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>

            {/* Lexicon Results */}
            <div className="grid gap-4">
              {filteredLexicon.map((item, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{item.acronym}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          item.category === 'Organization' ? 'bg-blue-100 text-blue-800' :
                          item.category === 'Regional' ? 'bg-green-100 text-green-800' :
                          item.category === 'Global Practice' ? 'bg-purple-100 text-purple-800' :
                          item.category === 'Operational' ? 'bg-orange-100 text-orange-800' :
                          item.category === 'Financial' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.category}
                        </span>
                      </div>
                      <p className="text-gray-700 font-medium mb-1">{item.fullName}</p>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {filteredLexicon.length === 0 && (
              <Card className="p-8 text-center">
                <p className="text-gray-500">No abbreviations found matching your search criteria.</p>
              </Card>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
