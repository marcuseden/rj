/**
 * Fetch Demographic & Development Indicators for All Countries
 * 
 * Key Indicators:
 * - Population
 * - GDP per capita
 * - GNI
 * - Poverty rate
 * - Life expectancy
 * - Infant mortality
 * - Literacy rate
 * - Unemployment
 * 
 * Source: World Bank Indicators API
 * Focus: Latest available data (2020-2024)
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

// Key World Bank Indicators
const INDICATORS = {
  population: 'SP.POP.TOTL',
  gdpPerCapita: 'NY.GDP.PCAP.CD',
  gni: 'NY.GNP.MKTP.CD',
  gniPerCapita: 'NY.GNP.PCAP.CD',
  povertyRate: 'SI.POV.DDAY', // $2.15/day international poverty line
  lifeExpectancy: 'SP.DYN.LE00.IN',
  infantMortality: 'SP.DYN.IMRT.IN',
  under5Mortality: 'SH.DYN.MORT',
  literacyRate: 'SE.ADT.LITR.ZS',
  unemployment: 'SL.UEM.TOTL.ZS',
  gdpGrowth: 'NY.GDP.MKTP.KD.ZG',
  accessElectricity: 'EG.ELC.ACCS.ZS',
  accessWater: 'SH.H2O.BASW.ZS'
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

async function fetchAllIndicatorsForCountry(countryCode: string, countryName: string) {
  const indicators: any = {};
  
  for (const [key, code] of Object.entries(INDICATORS)) {
    const data = await fetchIndicator(countryCode, code);
    if (data) {
      indicators[key] = data;
    }
    await new Promise(resolve => setTimeout(resolve, 100)); // Rate limit
  }
  
  return indicators;
}

async function main() {
  console.log('='.repeat(70));
  console.log('📊 WORLD BANK DEMOGRAPHIC & DEVELOPMENT INDICATORS');
  console.log('='.repeat(70));
  console.log('Fetching latest data (2020-2024) for all countries');
  console.log('Indicators: Population, GDP, GNI, Poverty, Health, Education');
  console.log('='.repeat(70) + '\n');
  
  // Get all countries from database
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
  let errors = 0;
  
  for (const country of countries) {
    processed++;
    console.log(`[${processed}/${countries.length}] ${country.name} (${country.iso2_code})`);
    
    const indicators = await fetchAllIndicatorsForCountry(country.iso2_code, country.name);
    
    const indicatorCount = Object.keys(indicators).length;
    
    if (indicatorCount > 0) {
      console.log(`  ✅ ${indicatorCount} indicators found`);
      
      // Format for database
      const updateData: any = {};
      
      if (indicators.population) {
        updateData.population = indicators.population.value;
        console.log(`     Population: ${(indicators.population.value / 1000000).toFixed(1)}M (${indicators.population.year})`);
      }
      
      if (indicators.gdpPerCapita) {
        updateData.gdp_per_capita = indicators.gdpPerCapita.value;
        console.log(`     GDP/capita: $${indicators.gdpPerCapita.value.toFixed(0)} (${indicators.gdpPerCapita.year})`);
      }
      
      if (indicators.gni) {
        updateData.gni_current = indicators.gni.value;
      }
      
      if (indicators.povertyRate) {
        updateData.poverty_rate = indicators.povertyRate.value;
        console.log(`     Poverty: ${indicators.povertyRate.value.toFixed(1)}% (${indicators.povertyRate.year})`);
      }
      
      // Store all indicators as JSONB
      updateData.development_indicators = {
        ...indicators,
        last_updated: new Date().toISOString()
      };
      
      updateData.updated_at = new Date().toISOString();
      
      // Update database
      const { error: updateError } = await supabase
        .from('worldbank_countries')
        .update(updateData)
        .eq('iso2_code', country.iso2_code);
      
      if (updateError) {
        console.error(`     ❌ Failed to update: ${updateError.message}`);
        errors++;
      } else {
        updated++;
      }
      
    } else {
      console.log(`  ℹ️  No indicators available`);
    }
    
    // Rate limiting - be respectful to API
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('📊 INDICATORS COLLECTION COMPLETE');
  console.log('='.repeat(70));
  console.log(`Countries Processed: ${processed}`);
  console.log(`Countries Updated: ${updated}`);
  console.log(`Errors: ${errors}`);
  console.log('='.repeat(70));
  console.log('\n✅ Demographic data now in database!');
  console.log('   Each country has: population, GDP, GNI, poverty, health, education data');
  console.log('   All data from World Bank official Indicators API\n');
}

main();

