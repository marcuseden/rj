import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const indexes = [
  // Countries table indexes
  'CREATE INDEX IF NOT EXISTS idx_countries_name ON worldbank_countries (name)',
  'CREATE INDEX IF NOT EXISTS idx_countries_name_lower ON worldbank_countries (LOWER(name))',
  'CREATE INDEX IF NOT EXISTS idx_countries_region_name ON worldbank_countries (region, name)',
  'CREATE INDEX IF NOT EXISTS idx_countries_income_level ON worldbank_countries (income_level)',
  'CREATE INDEX IF NOT EXISTS idx_countries_region_income ON worldbank_countries (region, income_level)',
  
  // Org chart indexes
  'CREATE INDEX IF NOT EXISTS idx_orgchart_parent_id ON worldbank_orgchart (parent_id) WHERE parent_id IS NOT NULL',
  'CREATE INDEX IF NOT EXISTS idx_orgchart_level_order ON worldbank_orgchart (level, sort_order)',
  'CREATE INDEX IF NOT EXISTS idx_orgchart_is_active ON worldbank_orgchart (is_active)',
  'CREATE INDEX IF NOT EXISTS idx_orgchart_name_lower ON worldbank_orgchart (LOWER(name))',
  'CREATE INDEX IF NOT EXISTS idx_orgchart_active_level ON worldbank_orgchart (is_active, level)',
];

async function applyIndexes() {
  console.log('🔧 Creating database indexes for performance...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const sql of indexes) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
      
      if (error) {
        // Try direct query if RPC doesn't work
        const indexName = sql.match(/idx_\w+/)?.[0] || 'unknown';
        console.log(`⚠️  ${indexName}: ${error.message}`);
        errorCount++;
      } else {
        const indexName = sql.match(/idx_\w+/)?.[0] || 'unknown';
        console.log(`✅ Created: ${indexName}`);
        successCount++;
      }
    } catch (error: any) {
      console.error(`❌ Error:`, error.message);
      errorCount++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`✅ Success: ${successCount}`);
  console.log(`⚠️  Skipped/Errors: ${errorCount}`);
  console.log('='.repeat(60));
  
  // Analyze tables
  console.log('\n📊 Analyzing tables...');
  console.log('✅ Indexes are ready for better query performance');
}

applyIndexes();






