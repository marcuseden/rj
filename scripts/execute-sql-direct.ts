import pg from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const { Client } = pg;

async function executeSQL() {
  const connectionString = `postgresql://postgres.osakeppuupnhjpiwpnsv:Mirjas8899!@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`;
  
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    // Add active_projects column
    console.log('🔧 Adding active_projects column...');
    await client.query(`
      ALTER TABLE worldbank_countries 
      ADD COLUMN IF NOT EXISTS active_projects INTEGER DEFAULT 0
    `);
    console.log('✅ Added active_projects column\n');
    
    // Update existing records
    console.log('🔧 Updating existing records...');
    const updateResult = await client.query(`
      UPDATE worldbank_countries 
      SET active_projects = 0 
      WHERE active_projects IS NULL
    `);
    console.log(`✅ Updated ${updateResult.rowCount} records\n`);
    
    // Create indexes
    console.log('🔧 Creating performance indexes...');
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_countries_name ON worldbank_countries (name)',
      'CREATE INDEX IF NOT EXISTS idx_countries_region_name ON worldbank_countries (region, name)',
      'CREATE INDEX IF NOT EXISTS idx_countries_income_level ON worldbank_countries (income_level)',
      'CREATE INDEX IF NOT EXISTS idx_countries_active_projects ON worldbank_countries (active_projects DESC NULLS LAST)',
      'CREATE INDEX IF NOT EXISTS idx_countries_region_income ON worldbank_countries (region, income_level)',
      'CREATE INDEX IF NOT EXISTS idx_orgchart_level_order ON worldbank_orgchart (level, sort_order)',
      'CREATE INDEX IF NOT EXISTS idx_orgchart_is_active ON worldbank_orgchart (is_active)',
    ];
    
    for (const sql of indexes) {
      try {
        await client.query(sql);
        const indexName = sql.match(/idx_\w+/)?.[0];
        console.log(`✅ Created: ${indexName}`);
      } catch (error: any) {
        if (error.code !== '42P07') { // Ignore "already exists" errors
          console.log(`⚠️  ${error.message}`);
        }
      }
    }
    
    // Analyze tables
    console.log('\n🔧 Analyzing tables for query planner...');
    await client.query('ANALYZE worldbank_countries');
    await client.query('ANALYZE worldbank_orgchart');
    console.log('✅ Analysis complete\n');
    
    // Verify
    const { rows } = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'worldbank_countries' 
      AND column_name = 'active_projects'
    `);
    
    if (rows.length > 0) {
      console.log('✅ Verification: active_projects column exists');
      console.log(`   Type: ${rows[0].data_type}\n`);
    }
    
    console.log('🎉 Database optimization complete!');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

executeSQL();

