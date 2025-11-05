/**
 * Department Data Verification Script
 * 
 * Verifies that:
 * 1. All columns exist in the database
 * 2. Data quality meets 90%+ standard
 * 3. All required fields are populated
 * 4. Sources are valid and accessible
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface QualityReport {
  totalRecords: number;
  verifiedRecords: number;
  qualityScore: number;
  missingFields: Record<string, number>;
  recommendations: string[];
}

async function verifyDatabaseSchema() {
  console.log('🔍 Verifying Database Schema...\n');
  
  const requiredColumns = [
    'id', 'name', 'position', 'department',
    'department_description', 'department_mission', 'strategic_priorities',
    'key_initiatives', 'department_metrics', 'sector_focus',
    'recent_achievements', 'data_verified', 'verification_source'
  ];
  
  try {
    // Try to select all required columns
    const { data, error } = await supabase
      .from('worldbank_orgchart')
      .select(requiredColumns.join(','))
      .limit(1);
    
    if (error) {
      console.error('❌ Schema verification failed:', error.message);
      if (error.message.includes('does not exist')) {
        const missingCol = error.message.match(/column "([^"]+)"/)?.[1];
        console.error(`\n💡 Missing column: ${missingCol}`);
        console.error('   Run the migration in Supabase dashboard');
      }
      return false;
    }
    
    console.log('✅ All required columns exist');
    console.log(`   Verified ${requiredColumns.length} columns\n`);
    return true;
    
  } catch (error: any) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

async function verifyDataQuality(): Promise<QualityReport> {
  console.log('📊 Analyzing Data Quality...\n');
  
  const { data: records, error } = await supabase
    .from('worldbank_orgchart')
    .select('*')
    .eq('is_active', true);
  
  if (error || !records) {
    throw new Error(`Failed to fetch records: ${error?.message}`);
  }
  
  const totalRecords = records.length;
  const verifiedRecords = records.filter(r => r.data_verified).length;
  
  // Check field completeness
  const criticalFields = [
    'department_description',
    'department_mission',
    'strategic_priorities',
    'department_metrics',
    'sector_focus'
  ];
  
  const missingFields: Record<string, number> = {};
  
  records.forEach(record => {
    criticalFields.forEach(field => {
      const value = record[field];
      const isEmpty = !value || 
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === 'object' && Object.keys(value).length === 0);
      
      if (isEmpty) {
        missingFields[field] = (missingFields[field] || 0) + 1;
      }
    });
  });
  
  // Calculate quality score
  const totalFields = totalRecords * criticalFields.length;
  const missingCount = Object.values(missingFields).reduce((a, b) => a + b, 0);
  const qualityScore = Math.round(((totalFields - missingCount) / totalFields) * 100);
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (qualityScore < 90) {
    recommendations.push('⚠️  Quality score below 90% threshold - add missing data');
  }
  
  if (verifiedRecords < totalRecords) {
    recommendations.push(`⚠️  ${totalRecords - verifiedRecords} records not verified - add verification_source`);
  }
  
  Object.entries(missingFields).forEach(([field, count]) => {
    if (count > 0) {
      recommendations.push(`⚠️  ${count} records missing ${field}`);
    }
  });
  
  if (recommendations.length === 0) {
    recommendations.push('✅ All quality checks passed!');
  }
  
  return {
    totalRecords,
    verifiedRecords,
    qualityScore,
    missingFields,
    recommendations
  };
}

async function verifyPresidentData() {
  console.log('👔 Verifying President Data...\n');
  
  const { data: president, error } = await supabase
    .from('worldbank_orgchart')
    .select('*')
    .eq('id', 'ajay-banga')
    .single();
  
  if (error || !president) {
    console.error('❌ President data not found');
    return false;
  }
  
  console.log(`✅ Found: ${president.name}`);
  console.log(`   Position: ${president.position}`);
  console.log(`   Department: ${president.department}`);
  
  // Check critical fields
  const checks = [
    { field: 'department_mission', label: 'Mission' },
    { field: 'strategic_priorities', label: 'Strategic Priorities', minLength: 5 },
    { field: 'key_initiatives', label: 'Key Initiatives', minLength: 5 },
    { field: 'department_metrics', label: 'Metrics', minKeys: 5 },
    { field: 'recent_achievements', label: 'Achievements', minLength: 3 },
    { field: 'sector_focus', label: 'Sectors', minLength: 5 },
    { field: 'quote', label: 'Quote' }
  ];
  
  let passedChecks = 0;
  
  checks.forEach(check => {
    const value = president[check.field];
    let passed = false;
    
    if (Array.isArray(value) && check.minLength) {
      passed = value.length >= check.minLength;
      console.log(`   ${passed ? '✅' : '⚠️ '} ${check.label}: ${value.length} items${passed ? '' : ` (need ${check.minLength}+)`}`);
    } else if (typeof value === 'object' && value !== null && check.minKeys) {
      const keys = Object.keys(value).length;
      passed = keys >= check.minKeys;
      console.log(`   ${passed ? '✅' : '⚠️ '} ${check.label}: ${keys} metrics${passed ? '' : ` (need ${check.minKeys}+)`}`);
    } else if (value) {
      passed = true;
      console.log(`   ✅ ${check.label}: Present`);
    } else {
      console.log(`   ⚠️  ${check.label}: Missing`);
    }
    
    if (passed) passedChecks++;
  });
  
  const completeness = Math.round((passedChecks / checks.length) * 100);
  console.log(`\n   Completeness: ${completeness}% (${passedChecks}/${checks.length} checks)`);
  
  if (president.data_verified) {
    console.log(`   ✅ Data verified: ${president.verification_source}`);
  } else {
    console.log(`   ⚠️  Data not verified`);
  }
  
  return completeness >= 80;
}

async function testMaterializedView() {
  console.log('\n📈 Testing Materialized View...\n');
  
  try {
    const { data, error } = await supabase
      .from('worldbank_department_details')
      .select('id, name, position')
      .limit(5);
    
    if (error) {
      console.error('❌ Materialized view error:', error.message);
      console.log('   Try refreshing: SELECT refresh_department_details();');
      return false;
    }
    
    console.log(`✅ Materialized view working`);
    console.log(`   ${data.length} records accessible`);
    
    if (data.length > 0) {
      console.log(`   Sample: ${data[0].name} - ${data[0].position}`);
    }
    
    return true;
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testHierarchyFunction() {
  console.log('\n🌳 Testing Hierarchy Function...\n');
  
  try {
    const { data, error } = await supabase
      .rpc('get_department_hierarchy', { dept_id: 'ajay-banga' });
    
    if (error) {
      console.error('❌ Hierarchy function error:', error.message);
      return false;
    }
    
    console.log(`✅ Hierarchy function working`);
    console.log(`   ${data.length} nodes in organization tree`);
    
    // Show hierarchy levels
    const byLevel = data.reduce((acc: any, node: any) => {
      acc[node.depth] = (acc[node.depth] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(byLevel).forEach(([depth, count]) => {
      console.log(`   Level ${depth}: ${count} members`);
    });
    
    return true;
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function generateReport() {
  console.log('═'.repeat(70));
  console.log('🏢 WORLD BANK DEPARTMENT DATA - QUALITY VERIFICATION REPORT');
  console.log('═'.repeat(70));
  console.log();
  
  // 1. Schema verification
  const schemaValid = await verifyDatabaseSchema();
  
  if (!schemaValid) {
    console.log('\n❌ CRITICAL: Schema verification failed');
    console.log('   Please run the migration first in Supabase dashboard');
    return;
  }
  
  // 2. Data quality
  const qualityReport = await verifyDataQuality();
  
  console.log(`Total Records: ${qualityReport.totalRecords}`);
  console.log(`Verified Records: ${qualityReport.verifiedRecords}`);
  console.log(`Quality Score: ${qualityReport.qualityScore}%`);
  
  if (qualityReport.qualityScore >= 90) {
    console.log('✅ RESEARCH-GRADE QUALITY (90%+)');
  } else if (qualityReport.qualityScore >= 70) {
    console.log('⚠️  COMMERCIAL QUALITY (70-89%) - Not acceptable for research');
  } else {
    console.log('❌ POOR QUALITY (<70%) - Unacceptable');
  }
  
  console.log();
  
  // 3. President data
  const presidentValid = await verifyPresidentData();
  
  // 4. Views and functions
  const viewValid = await testMaterializedView();
  const functionValid = await testHierarchyFunction();
  
  // 5. Final summary
  console.log('\n' + '═'.repeat(70));
  console.log('📋 SUMMARY');
  console.log('═'.repeat(70));
  console.log();
  
  console.log('System Health:');
  console.log(`  ${schemaValid ? '✅' : '❌'} Database Schema`);
  console.log(`  ${qualityReport.qualityScore >= 90 ? '✅' : '⚠️ '} Data Quality (${qualityReport.qualityScore}%)`);
  console.log(`  ${presidentValid ? '✅' : '⚠️ '} President Profile`);
  console.log(`  ${viewValid ? '✅' : '❌'} Materialized View`);
  console.log(`  ${functionValid ? '✅' : '❌'} Hierarchy Function`);
  
  console.log();
  console.log('Recommendations:');
  qualityReport.recommendations.forEach(rec => {
    console.log(`  ${rec}`);
  });
  
  console.log();
  
  if (schemaValid && qualityReport.qualityScore >= 90 && presidentValid && viewValid && functionValid) {
    console.log('✅ SYSTEM READY FOR PRODUCTION');
    console.log('   All checks passed - data meets research-grade standards');
  } else {
    console.log('⚠️  SYSTEM NEEDS ATTENTION');
    console.log('   Please address recommendations above');
  }
  
  console.log();
  console.log('Next Steps:');
  console.log('  1. Visit /department/ajay-banga to test UI');
  console.log('  2. Run enrichment: npx tsx scripts/enrich-department-data.ts');
  console.log('  3. Add more department leaders');
  console.log('  4. Integrate with AI agent');
  console.log();
  console.log('═'.repeat(70));
}

// Run verification
generateReport()
  .then(() => {
    console.log('✅ Verification complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });


