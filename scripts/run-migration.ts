/**
 * Run Database Migration Directly
 * Executes the orgchart migration on remote Supabase instance
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('   Need: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('🚀 Starting Migration...\n');
  console.log(`📍 Target: ${supabaseUrl}`);
  console.log('📄 File: 20241105000000_worldbank_orgchart_complete.sql\n');
  
  // Read migration file
  const migrationPath = path.join(
    process.cwd(),
    'supabase',
    'migrations',
    '20241105000000_worldbank_orgchart_complete.sql'
  );
  
  if (!fs.existsSync(migrationPath)) {
    console.error('❌ Migration file not found:', migrationPath);
    process.exit(1);
  }
  
  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
  console.log(`✅ Loaded migration (${migrationSQL.length} characters)\n`);
  
  console.log('⏳ Executing migration...\n');
  console.log('This may take 10-30 seconds...\n');
  
  try {
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: migrationSQL
    });
    
    if (error) {
      // If exec_sql function doesn't exist, try direct query
      if (error.message.includes('exec_sql')) {
        console.log('⚠️  exec_sql function not available, using direct query...\n');
        
        // For Supabase, we need to use the REST API or direct SQL
        // Let's use the postgrest admin API
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          },
          body: JSON.stringify({ query: migrationSQL })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }
        
        console.log('✅ Migration executed successfully!\n');
      } else {
        throw error;
      }
    } else {
      console.log('✅ Migration executed successfully!\n');
    }
    
    // Verify the migration worked
    console.log('🔍 Verifying migration...\n');
    
    const { data: orgChart, error: verifyError } = await supabase
      .from('worldbank_orgchart')
      .select('id, name, position, data_verified')
      .limit(5);
    
    if (verifyError) {
      console.error('⚠️  Verification warning:', verifyError.message);
      console.log('\nMigration may have succeeded, but verification query failed.');
      console.log('Check Supabase Dashboard to confirm.\n');
    } else {
      console.log('✅ Verification successful!\n');
      console.log(`📊 Found ${orgChart.length} records in worldbank_orgchart:\n`);
      
      orgChart.forEach(record => {
        const verified = record.data_verified ? '✅' : '⚠️ ';
        console.log(`   ${verified} ${record.name} - ${record.position}`);
      });
      
      console.log('\n' + '='.repeat(70));
      console.log('✅ MIGRATION COMPLETE!');
      console.log('='.repeat(70));
      console.log('\n📋 Next steps:');
      console.log('   1. Run: npx tsx scripts/verify-department-data.ts');
      console.log('   2. Visit: http://localhost:3000/department/ajay-banga');
      console.log('   3. Enrich: npx tsx scripts/enrich-department-data.ts\n');
    }
    
  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\n💡 Alternative: Run migration manually in Supabase Dashboard');
    console.error('   1. Go to: Database → SQL Editor');
    console.error('   2. Copy migration file contents');
    console.error('   3. Paste and click "Run"\n');
    process.exit(1);
  }
}

runMigration();







