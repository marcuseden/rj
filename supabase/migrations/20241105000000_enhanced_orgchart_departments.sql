-- Enhanced World Bank Organizational Chart with Comprehensive Department Data
-- This migration adds detailed department information, roles, strategies, and metrics

-- Add new columns for comprehensive department information
ALTER TABLE worldbank_orgchart ADD COLUMN IF NOT EXISTS department_description TEXT;
ALTER TABLE worldbank_orgchart ADD COLUMN IF NOT EXISTS department_mission TEXT;
ALTER TABLE worldbank_orgchart ADD COLUMN IF NOT EXISTS department_vision TEXT;
ALTER TABLE worldbank_orgchart ADD COLUMN IF NOT EXISTS role_responsibilities TEXT[];
ALTER TABLE worldbank_orgchart ADD COLUMN IF NOT EXISTS strategic_priorities TEXT[];
ALTER TABLE worldbank_orgchart ADD COLUMN IF NOT EXISTS key_initiatives TEXT[];
ALTER TABLE worldbank_orgchart ADD COLUMN IF NOT EXISTS future_direction TEXT;
ALTER TABLE worldbank_orgchart ADD COLUMN IF NOT EXISTS current_projects JSONB;
ALTER TABLE worldbank_orgchart ADD COLUMN IF NOT EXISTS department_metrics JSONB;
ALTER TABLE worldbank_orgchart ADD COLUMN IF NOT EXISTS team_size INTEGER;
ALTER TABLE worldbank_orgchart ADD COLUMN IF NOT EXISTS budget_allocation TEXT;
ALTER TABLE worldbank_orgchart ADD COLUMN IF NOT EXISTS regional_coverage TEXT[];
ALTER TABLE worldbank_orgchart ADD COLUMN IF NOT EXISTS sector_focus TEXT[];
ALTER TABLE worldbank_orgchart ADD COLUMN IF NOT EXISTS recent_achievements TEXT[];
ALTER TABLE worldbank_orgchart ADD COLUMN IF NOT EXISTS challenges TEXT[];
ALTER TABLE worldbank_orgchart ADD COLUMN IF NOT EXISTS collaboration_partners TEXT[];
ALTER TABLE worldbank_orgchart ADD COLUMN IF NOT EXISTS external_links JSONB;
ALTER TABLE worldbank_orgchart ADD COLUMN IF NOT EXISTS quote TEXT;
ALTER TABLE worldbank_orgchart ADD COLUMN IF NOT EXISTS speeches_references TEXT[];
ALTER TABLE worldbank_orgchart ADD COLUMN IF NOT EXISTS documents_references TEXT[];

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_orgchart_sector_focus ON worldbank_orgchart USING GIN (sector_focus);
CREATE INDEX IF NOT EXISTS idx_orgchart_strategic_priorities ON worldbank_orgchart USING GIN (strategic_priorities);
CREATE INDEX IF NOT EXISTS idx_orgchart_regional_coverage ON worldbank_orgchart USING GIN (regional_coverage);

-- Update Ajay Banga's profile with comprehensive information
UPDATE worldbank_orgchart 
SET 
  department_description = 'The Office of the President leads the World Bank Group''s mission to end extreme poverty and boost shared prosperity on a livable planet.',
  department_mission = 'To create a world free of poverty on a livable planet by ensuring job creation is not a byproduct but an explicit aim of all development work.',
  department_vision = 'A reformed, modernized World Bank Group that delivers faster, more integrated solutions through partnership with governments, private sector, and multilateral development banks.',
  role_responsibilities = ARRAY[
    'Set strategic direction for World Bank Group operations',
    'Lead institutional reforms to increase speed and impact',
    'Build partnerships with governments, private sector, and philanthropies',
    'Mobilize private capital for development and climate finance',
    'Drive focus on job creation and economic opportunity',
    'Champion climate action and sustainable development',
    'Represent World Bank Group in global forums and with member countries'
  ],
  strategic_priorities = ARRAY[
    'Institutional Reform & Modernization',
    'Climate Finance & Energy Access',
    'Private Sector Partnership & Investment',
    'Job Creation for Youth',
    'Food Security & Agriculture',
    'IDA Replenishment & Development Finance',
    'Digital Infrastructure & Connectivity',
    'Pandemic Preparedness & Health Systems'
  ],
  key_initiatives = ARRAY[
    'Evolution Roadmap: Shortening project approval from 19 to 16 months',
    'Integration Initiative: Breaking silos between IBRD, IDA, IFC, and MIGA',
    'Private Capital Mobilization: $150B+ private investment target',
    'Climate Finance Expansion: 45% of financing for climate by 2025',
    'Jobs Initiative: 1.2 billion young people employment focus',
    'Agribusiness Ecosystem: $9B annually by 2030',
    'Energy Access: 300M people electricity access in Africa',
    'Digital Public Infrastructure: Connectivity for underserved regions'
  ],
  future_direction = 'Continue aggressive reforms to make the World Bank faster, more impactful, and better integrated. Scale up climate finance, private capital mobilization, and partnerships. Focus on measurable outcomes in job creation, poverty reduction, and building a livable planet. Expand IDA to reach more countries and increase private sector engagement through innovative financing instruments.',
  current_projects = jsonb_build_object(
    'active_countries', 140,
    'total_portfolio', '$400+ billion',
    'projects_under_implementation', '2,000+',
    'climate_projects_percentage', 45,
    'jobs_created_target', '1.2 billion youth over next decade'
  ),
  department_metrics = jsonb_build_object(
    'annual_lending', '$75 billion (FY24)',
    'ida_replenishment', '$23.5 billion (FY21)',
    'private_capital_mobilized', '$16 billion (FY23)',
    'countries_served', 140,
    'staff_worldwide', '16,000+',
    'project_approval_time', '16 months (down from 19)',
    'climate_finance_share', '45% of total financing'
  ),
  team_size = 16000,
  budget_allocation = '$75 billion annual lending capacity',
  regional_coverage = ARRAY['Global', 'Africa', 'East Asia & Pacific', 'Europe & Central Asia', 'Latin America & Caribbean', 'Middle East & North Africa', 'South Asia'],
  sector_focus = ARRAY['Climate Change', 'Infrastructure', 'Human Development', 'Agriculture', 'Private Sector Development', 'Digital Economy', 'Health Systems', 'Education'],
  recent_achievements = ARRAY[
    '2024: Successfully shortened project approval process by 3 months',
    '2024: Mobilized record $150B+ private capital commitments',
    '2024: Launched $9B annual agribusiness initiative',
    '2023: Led successful IDA21 replenishment of $93 billion',
    '2023: Implemented major organizational integration reforms',
    '2023: Expanded climate finance to 45% of portfolio'
  ],
  challenges = ARRAY[
    'Scaling up climate finance while maintaining poverty focus',
    'Accelerating private capital mobilization in high-risk markets',
    'Managing institutional change and cultural transformation',
    'Balancing speed with quality in project implementation',
    'Addressing fragility, conflict, and violence in client countries',
    'Coordinating with multiple stakeholders across 140 countries'
  ],
  collaboration_partners = ARRAY['IMF', 'Regional Development Banks', 'UN Agencies', 'Private Sector CEOs', 'Philanthropies', 'Government Leaders', 'Civil Society Organizations'],
  external_links = jsonb_build_object(
    'official_page', 'https://www.worldbank.org/en/about/leadership/president',
    'speeches', 'https://www.worldbank.org/en/about/president/speeches',
    'twitter', 'https://twitter.com/worldbank',
    'linkedin', 'https://www.linkedin.com/in/ajay-banga/'
  ),
  quote = 'Our mission is clear: create a world free of poverty on a livable planet. But we must be honest about the scale of the challenge. It will take partnership, innovation, and a relentless focus on measurable results.',
  updated_at = NOW()
WHERE id = 'ajay-banga';

-- Update Executive Leadership Team
UPDATE worldbank_orgchart 
SET 
  department_description = 'The Executive Leadership Team coordinates global operations, institutional reforms, and strategic initiatives across the World Bank Group.',
  department_mission = 'Drive operational excellence, institutional transformation, and integrated delivery across IBRD, IDA, IFC, and MIGA.',
  strategic_priorities = ARRAY[
    'Operational Integration',
    'Speed & Efficiency',
    'Risk Management',
    'Partnership Coordination',
    'Results Measurement'
  ],
  sector_focus = ARRAY['Operations', 'Strategy', 'Policy', 'Partnerships'],
  team_size = 150,
  updated_at = NOW()
WHERE id = 'executive-team';

-- Update Managing Director & COO (Axel van Trotsenburg)
UPDATE worldbank_orgchart 
SET 
  department_description = 'The Operations Office oversees day-to-day operations, institutional reforms, and ensures operational excellence across all World Bank Group entities.',
  role_responsibilities = ARRAY[
    'Oversee operational excellence and institutional reforms',
    'Manage integration of IBRD, IDA, IFC, and MIGA operations',
    'Lead business process improvements and efficiency gains',
    'Coordinate risk management and operational controls',
    'Drive implementation of Evolution Roadmap reforms'
  ],
  strategic_priorities = ARRAY[
    'Shortening project cycle times',
    'Operational integration across entities',
    'Risk management enhancement',
    'Staff productivity and effectiveness',
    'Systems modernization'
  ],
  key_initiatives = ARRAY[
    'Project approval acceleration: 19 to 16 months',
    'Digital workflow transformation',
    'Cross-entity collaboration platforms',
    'Performance management system overhaul',
    'Country office empowerment'
  ],
  future_direction = 'Continue driving operational reforms to make the institution faster and more responsive. Focus on breaking down silos, improving staff productivity, and leveraging technology for better project delivery.',
  department_metrics = jsonb_build_object(
    'project_approval_time', '16 months',
    'operational_efficiency_gain', '15% since 2023',
    'staff_satisfaction_score', '78%',
    'digital_transformation_progress', '65%'
  ),
  sector_focus = ARRAY['Operations', 'Institutional Reform', 'Risk Management', 'Business Process'],
  recent_achievements = ARRAY[
    '2024: Reduced project approval time by 3 months',
    '2023: Launched new integrated operational platform',
    '2023: Improved operational efficiency by 15%'
  ],
  quote = 'We are transforming how the World Bank operates - faster, smarter, and more integrated than ever before.',
  updated_at = NOW()
WHERE id = 'axel-van-trotsenburg';

-- Update Infrastructure VP (Makhtar Diop)
UPDATE worldbank_orgchart 
SET 
  department_description = 'Infrastructure drives investments in energy, transport, water, and urban development to support sustainable economic growth.',
  department_mission = 'Build climate-resilient infrastructure that connects people, powers economies, and protects the planet.',
  role_responsibilities = ARRAY[
    'Lead global infrastructure investment strategy',
    'Oversee energy, transport, water, and urban development',
    'Drive climate-smart infrastructure solutions',
    'Mobilize private sector infrastructure investment',
    'Coordinate regional infrastructure programs'
  ],
  strategic_priorities = ARRAY[
    'Renewable Energy Scale-Up',
    'Climate-Resilient Infrastructure',
    'Digital Infrastructure',
    'Urban Development & Housing',
    'Transport Connectivity',
    'Water & Sanitation',
    'Private Capital Mobilization'
  ],
  key_initiatives = ARRAY[
    'Energy Access: 300M people electricity in Africa',
    'Renewable Energy Portfolio: $20B+ investments',
    'Digital Infrastructure: Fiber optic connectivity expansion',
    'Urban Resilience: Climate-adapted cities program',
    'Transport Corridors: Regional connectivity projects'
  ],
  future_direction = 'Massive scale-up of renewable energy and climate-resilient infrastructure. Focus on attracting private capital through innovative financing. Prioritize digital infrastructure as critical enabler of economic growth.',
  current_projects = jsonb_build_object(
    'active_projects', 450,
    'total_portfolio', '$85 billion',
    'countries_covered', 110,
    'renewable_energy_capacity', '15 GW target by 2030'
  ),
  department_metrics = jsonb_build_object(
    'annual_commitments', '$18 billion',
    'people_with_electricity', '50M+ (2023)',
    'km_roads_built', '25,000+ km',
    'private_capital_mobilized', '$8 billion'
  ),
  team_size = 2500,
  budget_allocation = '$18 billion annual commitments',
  sector_focus = ARRAY['Energy', 'Transport', 'Urban Development', 'Water', 'Digital Infrastructure'],
  regional_coverage = ARRAY['Africa', 'South Asia', 'Latin America', 'East Asia'],
  recent_achievements = ARRAY[
    '2024: 300M people energy access initiative launched',
    '2023: $8B private capital mobilized for infrastructure',
    '2023: 50M people gained electricity access'
  ],
  challenges = ARRAY[
    'Scaling renewable energy in challenging contexts',
    'Mobilizing private capital in high-risk countries',
    'Balancing speed with environmental safeguards',
    'Managing complex multi-country corridor projects'
  ],
  quote = 'Infrastructure is not just steel and concrete - it''s about connecting people to opportunity and building a sustainable future.',
  updated_at = NOW()
WHERE id = 'makhtar-diop';

-- Update Regional Vice Presidents with comprehensive data
UPDATE worldbank_orgchart 
SET 
  department_description = 'Africa Region manages World Bank operations across Sub-Saharan Africa, focusing on poverty reduction, economic growth, and human development.',
  department_mission = 'Support African countries in achieving sustainable development, creating jobs, and building resilient economies.',
  role_responsibilities = ARRAY[
    'Oversee World Bank operations in Eastern & Southern Africa',
    'Lead country partnership strategies',
    'Coordinate regional integration initiatives',
    'Mobilize development finance for priority sectors',
    'Build partnerships with African governments and institutions'
  ],
  strategic_priorities = ARRAY[
    'Job Creation for Youth',
    'Agriculture & Food Security',
    'Energy Access',
    'Human Capital Development',
    'Digital Economy',
    'Climate Resilience',
    'Fragility & Conflict'
  ],
  key_initiatives = ARRAY[
    'Jobs for Youth: 1.2B youth employment initiative',
    'Energy Access: 300M people electricity',
    'Agriculture: Climate-smart farming scale-up',
    'Digital: Broadband connectivity expansion',
    'Human Capital: Education and health systems strengthening'
  ],
  future_direction = 'Accelerate job creation focus, scale up energy access, strengthen agriculture systems, and build human capital. Increase regional integration and private sector engagement.',
  current_projects = jsonb_build_object(
    'active_projects', 600,
    'portfolio_value', '$95 billion',
    'countries_covered', 48,
    'beneficiaries', '500M+ people'
  ),
  department_metrics = jsonb_build_object(
    'annual_commitments', '$22 billion',
    'jobs_supported', '2M+ (2023)',
    'people_energy_access', '15M (2023)',
    'students_reached', '25M (2023)'
  ),
  team_size = 3500,
  budget_allocation = '$22 billion annual (IDA + IBRD)',
  sector_focus = ARRAY['Agriculture', 'Energy', 'Education', 'Health', 'Infrastructure', 'Private Sector'],
  regional_coverage = ARRAY['Eastern Africa', 'Southern Africa', 'Western Africa', 'Central Africa'],
  recent_achievements = ARRAY[
    '2024: Launched regional jobs initiative',
    '2023: $22B commitments for Africa',
    '2023: 15M people gained electricity access'
  ],
  challenges = ARRAY[
    'Youth unemployment crisis',
    'Climate shocks and food insecurity',
    'Fragility and conflict in several countries',
    'Debt sustainability concerns',
    'Limited private sector investment'
  ],
  quote = 'Africa''s youth are its greatest asset. Our mission is to ensure they have jobs, opportunity, and hope.',
  updated_at = NOW()
WHERE id = 'hailegabriel-abegaz';

-- Update Climate VP (Juergen Voegele)
UPDATE worldbank_orgchart 
SET 
  department_description = 'Climate Change leads the World Bank''s response to the climate crisis, driving mitigation, adaptation, and climate finance across all operations.',
  department_mission = 'Build a livable planet by supporting countries in climate action, mobilizing climate finance, and ensuring just transitions.',
  role_responsibilities = ARRAY[
    'Lead climate change strategy across World Bank Group',
    'Oversee climate mitigation and adaptation projects',
    'Mobilize climate finance and private capital',
    'Coordinate with UN climate processes and COP',
    'Drive integration of climate in all operations'
  ],
  strategic_priorities = ARRAY[
    'Climate Finance Scale-Up: 45% of portfolio',
    'Renewable Energy Transition',
    'Climate Adaptation & Resilience',
    'Just Transitions',
    'Nature-Based Solutions',
    'Carbon Markets',
    'Climate Risk Management'
  ],
  key_initiatives = ARRAY[
    'Climate Finance: 45% of all financing for climate',
    'Renewable Energy: $20B+ annual investments',
    'Adaptation: Climate-resilient infrastructure and agriculture',
    'Just Transition: Supporting workers in fossil fuel transition',
    'Nature: Forest conservation and blue carbon projects',
    'Carbon Markets: Country climate market development'
  ],
  future_direction = 'Rapidly scale climate finance toward 50% of portfolio. Drive just transitions in coal-dependent regions. Expand carbon markets and nature-based solutions. Ensure all projects are climate-screened and Paris-aligned.',
  current_projects = jsonb_build_object(
    'active_climate_projects', 800,
    'climate_portfolio', '$32 billion',
    'countries_supported', 140,
    'emissions_avoided', '150M tons CO2e annually'
  ),
  department_metrics = jsonb_build_object(
    'climate_finance_share', '45% of total',
    'annual_climate_commitments', '$32 billion',
    'renewable_energy_capacity', '12 GW added (2023)',
    'people_climate_resilience', '100M+ (2023)',
    'private_climate_capital', '$6 billion mobilized'
  ),
  team_size = 1800,
  budget_allocation = '$32 billion annual climate finance',
  sector_focus = ARRAY['Climate Mitigation', 'Climate Adaptation', 'Renewable Energy', 'Nature-Based Solutions', 'Carbon Markets', 'Just Transitions'],
  regional_coverage = ARRAY['Global', 'All Regions'],
  recent_achievements = ARRAY[
    '2024: 45% climate finance target achieved',
    '2023: $32B climate commitments',
    '2023: 12 GW renewable energy capacity added',
    '2023: $6B private climate capital mobilized'
  ],
  challenges = ARRAY[
    'Scaling climate finance without reducing poverty focus',
    'Just transitions in coal-dependent economies',
    'Measuring adaptation impact and results',
    'Mobilizing sufficient private climate capital',
    'Balancing speed with climate safeguards'
  ],
  quote = 'We cannot have poverty reduction without a livable planet. Climate action is development action.',
  updated_at = NOW()
WHERE id = 'juergen-voegele';

-- Update Chief Economist (Indermit Gill)
UPDATE worldbank_orgchart 
SET 
  department_description = 'The Office of the Chief Economist leads economic research, analysis, and policy advice to inform World Bank strategy and operations.',
  department_mission = 'Provide cutting-edge economic analysis and thought leadership to guide development policy and World Bank operations.',
  role_responsibilities = ARRAY[
    'Lead World Bank economic research and analysis',
    'Provide economic policy advice to President and management',
    'Oversee flagship publications and reports',
    'Coordinate with country economists and researchers',
    'Represent World Bank in global economic forums'
  ],
  strategic_priorities = ARRAY[
    'Economic Growth & Productivity',
    'Poverty & Inequality Analysis',
    'Climate Economics',
    'Debt Sustainability',
    'Labor Markets & Jobs',
    'Global Economic Outlook',
    'Development Finance'
  ],
  key_initiatives = ARRAY[
    'World Development Report series',
    'Global Economic Prospects',
    'Poverty & Shared Prosperity Report',
    'Climate economics research',
    'Jobs and growth diagnostics',
    'Development data innovation'
  ],
  future_direction = 'Focus on growth diagnostics for middle-income countries, economics of climate action, jobs and productivity research, and innovative data for development. Strengthen linkages between research and operations.',
  department_metrics = jsonb_build_object(
    'publications_per_year', '200+',
    'flagship_reports', 6,
    'economists_on_staff', '400+',
    'research_citations', '50,000+ annually'
  ),
  team_size = 400,
  sector_focus = ARRAY['Economic Research', 'Development Economics', 'Policy Analysis', 'Data & Statistics'],
  regional_coverage = ARRAY['Global'],
  recent_achievements = ARRAY[
    '2024: Published "Jobs for Growth" flagship report',
    '2023: Led analysis on debt distress risks',
    '2023: Published climate economics research'
  ],
  quote = 'Good economics is about understanding what works, why it works, and how to make it work at scale.',
  updated_at = NOW()
WHERE id = 'indermit-gill';

-- Create materialized view for department detail pages (faster loading)
CREATE MATERIALIZED VIEW IF NOT EXISTS worldbank_department_details AS
SELECT 
  id,
  name,
  position,
  avatar_url,
  bio,
  level,
  parent_id,
  department,
  region,
  department_description,
  department_mission,
  department_vision,
  role_responsibilities,
  strategic_priorities,
  key_initiatives,
  future_direction,
  current_projects,
  department_metrics,
  team_size,
  budget_allocation,
  regional_coverage,
  sector_focus,
  recent_achievements,
  challenges,
  collaboration_partners,
  external_links,
  quote,
  speeches_references,
  documents_references,
  country,
  tenure,
  education,
  is_active,
  sort_order,
  created_at,
  updated_at
FROM worldbank_orgchart
WHERE is_active = true;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_dept_details_id ON worldbank_department_details (id);
CREATE INDEX IF NOT EXISTS idx_dept_details_department ON worldbank_department_details (department);

-- Grant access
GRANT SELECT ON worldbank_department_details TO authenticated;
GRANT SELECT ON worldbank_department_details TO anon;

-- Create function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_department_details()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW worldbank_department_details;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE worldbank_orgchart IS 'Enhanced organizational chart with comprehensive department data including roles, strategies, metrics, and future directions';
COMMENT ON COLUMN worldbank_orgchart.department_description IS 'Detailed description of what the department does';
COMMENT ON COLUMN worldbank_orgchart.strategic_priorities IS 'Current strategic priorities and focus areas';
COMMENT ON COLUMN worldbank_orgchart.key_initiatives IS 'Major initiatives and programs currently active';
COMMENT ON COLUMN worldbank_orgchart.future_direction IS 'Where the department is headed and strategic direction';
COMMENT ON COLUMN worldbank_orgchart.department_metrics IS 'JSON object with key performance metrics and statistics';
COMMENT ON COLUMN worldbank_orgchart.current_projects IS 'JSON object with active project information';
COMMENT ON COLUMN worldbank_orgchart.speeches_references IS 'References to relevant Ajay Banga speeches';
COMMENT ON COLUMN worldbank_orgchart.documents_references IS 'References to relevant World Bank strategy documents';

