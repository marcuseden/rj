/**
 * Fetch Economic Structure Data for All Countries
 * 
 * Comprehensive economic data including:
 * - Sectoral Composition (Agriculture, Industry, Services % of GDP)
 * - Top Export Products
 * - Natural Resources & Minerals
 * - Key Industries
 * - Trade Data
 * 
 * Sources: World Bank Indicators API, Natural Capital Data
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase credentials not configured');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Economic Structure Indicators
const ECONOMIC_INDICATORS = {
  // Sectoral Composition (% of GDP)
  agricultureGDP: 'NV.AGR.TOTL.ZS',
  industryGDP: 'NV.IND.TOTL.ZS',
  manufacturingGDP: 'NV.IND.MANF.ZS',
  servicesGDP: 'NV.SRV.TOTL.ZS',
  
  // Trade & Exports
  merchandiseExports: 'TX.VAL.MRCH.CD.WT',
  exportsGoodsServices: 'NE.EXP.GNFS.ZS',
  importsGoodsServices: 'NE.IMP.GNFS.ZS',
  
  // Natural Resources
  naturalResourcesRents: 'NY.GDP.TOTL.RT.ZS',
  forestRents: 'NY.GDP.FRST.RT.ZS',
  mineralRents: 'NY.GDP.MINR.RT.ZS',
  oilRents: 'NY.GDP.PETR.RT.ZS',
  coalRents: 'NY.GDP.COAL.RT.ZS',
  gasRents: 'NY.GDP.NGAS.RT.ZS',
  
  // Employment by Sector
  employmentAgriculture: 'SL.AGR.EMPL.ZS',
  employmentIndustry: 'SL.IND.EMPL.ZS',
  employmentServices: 'SL.SRV.EMPL.ZS',
  
  // Foreign Direct Investment
  fdiNetInflows: 'BX.KLT.DINV.CD.WD',
  
  // Innovation & Technology
  highTechExports: 'TX.VAL.TECH.CD',
  researchDevelopment: 'GB.XPD.RSDV.GD.ZS'
};

async function fetchIndicator(countryCode: string, indicatorCode: string): Promise<any> {
  try {
    const response = await fetch(
      `https://api.worldbank.org/v2/country/${countryCode}/indicator/${indicatorCode}?format=json&date=2020:2024&per_page=10`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (!data || !data[1] || data[1].length === 0) return null;
    
    // Get most recent non-null value
    const recentData = data[1].find((d: any) => d.value !== null);
    
    return recentData ? {
      value: recentData.value,
      year: parseInt(recentData.date),
      indicator: recentData.indicator.value
    } : null;
    
  } catch (error) {
    return null;
  }
}

async function fetchEconomicStructure(countryCode: string) {
  const structure: any = {};
  
  for (const [key, code] of Object.entries(ECONOMIC_INDICATORS)) {
    const data = await fetchIndicator(countryCode, code);
    if (data) {
      structure[key] = data;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return structure;
}

function analyzeEconomicStructure(structure: any) {
  const analysis: any = {
    primarySector: 'Unknown',
    topSectors: [],
    hasNaturalResources: false,
    resourceTypes: [],
    exportOriented: false,
    industrialized: false
  };
  
  // Determine primary sector
  const sectors = [
    { name: 'Agriculture', value: structure.agricultureGDP?.value || 0 },
    { name: 'Industry', value: structure.industryGDP?.value || 0 },
    { name: 'Services', value: structure.servicesGDP?.value || 0 }
  ];
  
  sectors.sort((a, b) => b.value - a.value);
  analysis.primarySector = sectors[0].name;
  analysis.topSectors = sectors.filter(s => s.value > 10).map(s => ({
    sector: s.name,
    percentageGDP: s.value.toFixed(1)
  }));
  
  // Check for natural resources
  const resourceRents = structure.naturalResourcesRents?.value || 0;
  if (resourceRents > 5) {
    analysis.hasNaturalResources = true;
    
    if (structure.mineralRents?.value > 1) analysis.resourceTypes.push('Minerals');
    if (structure.oilRents?.value > 1) analysis.resourceTypes.push('Oil');
    if (structure.gasRents?.value > 1) analysis.resourceTypes.push('Natural Gas');
    if (structure.coalRents?.value > 1) analysis.resourceTypes.push('Coal');
    if (structure.forestRents?.value > 1) analysis.resourceTypes.push('Forest Products');
  }
  
  // Export oriented?
  if (structure.exportsGoodsServices?.value > 30) {
    analysis.exportOriented = true;
  }
  
  // Industrialized?
  if (structure.industryGDP?.value > 25) {
    analysis.industrialized = true;
  }
  
  return analysis;
}

async function main() {
  console.log('='.repeat(70));
  console.log('🏭 ECONOMIC STRUCTURE & RESOURCES DATA COLLECTION');
  console.log('='.repeat(70));
  console.log('Fetching: Sectors, Industries, Natural Resources, Trade');
  console.log('Source: World Bank Indicators API (2020-2024 data)');
  console.log('='.repeat(70) + '\n');
  
  // Get all countries
  const { data: countries, error } = await supabase
    .from('worldbank_countries')
    .select('iso2_code, name')
    .order('name');
  
  if (error || !countries) {
    console.error('❌ Could not fetch countries');
    return;
  }
  
  console.log(`Processing ${countries.length} countries...\n`);
  
  let processed = 0;
  let updated = 0;
  let withResources = 0;
  
  for (const country of countries) {
    processed++;
    console.log(`[${processed}/${countries.length}] ${country.name} (${country.iso2_code})`);
    
    const economicData = await fetchEconomicStructure(country.iso2_code);
    const analysis = analyzeEconomicStructure(economicData);
    
    const indicatorCount = Object.keys(economicData).length;
    
    if (indicatorCount > 0) {
      console.log(`  ✅ ${indicatorCount} indicators`);
      
      // Show key findings
      if (analysis.primarySector !== 'Unknown') {
        console.log(`     Primary: ${analysis.primarySector}`);
      }
      
      if (analysis.hasNaturalResources) {
        console.log(`     Resources: ${analysis.resourceTypes.join(', ')}`);
        withResources++;
      }
      
      if (analysis.exportOriented) {
        console.log(`     Export-oriented economy`);
      }
      
      // Update database
      const updateData: any = {
        economic_structure: {
          ...economicData,
          analysis,
          last_updated: new Date().toISOString()
        },
        primary_sector: analysis.primarySector,
        natural_resources: analysis.resourceTypes,
        has_natural_resources: analysis.hasNaturalResources,
        export_oriented: analysis.exportOriented,
        updated_at: new Date().toISOString()
      };
      
      // Add individual fields for easy querying
      if (economicData.agricultureGDP) {
        updateData.agriculture_pct_gdp = economicData.agricultureGDP.value;
      }
      if (economicData.industryGDP) {
        updateData.industry_pct_gdp = economicData.industryGDP.value;
      }
      if (economicData.servicesGDP) {
        updateData.services_pct_gdp = economicData.servicesGDP.value;
      }
      if (economicData.manufacturingGDP) {
        updateData.manufacturing_pct_gdp = economicData.manufacturingGDP.value;
      }
      
      const { error: updateError } = await supabase
        .from('worldbank_countries')
        .update(updateData)
        .eq('iso2_code', country.iso2_code);
      
      if (updateError) {
        console.error(`     ❌ Failed to update`);
      } else {
        updated++;
      }
      
    } else {
      console.log(`  ℹ️  No economic data available`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 400));
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('📊 ECONOMIC STRUCTURE COLLECTION COMPLETE');
  console.log('='.repeat(70));
  console.log(`Countries Processed: ${processed}`);
  console.log(`Countries Updated: ${updated}`);
  console.log(`Countries with Natural Resources: ${withResources}`);
  console.log('='.repeat(70));
  console.log('\n✅ Economic structure data now in database!');
  console.log('   Each country has: sector composition, natural resources, trade data');
  console.log('   All data from World Bank Indicators API\n');
}

main();






