/**
 * Apply database migrations for worldbank_orgchart table
 *
 * Since Supabase hosted instances don't allow DDL operations via API,
 * this script provides the SQL for manual execution.
 */

import * as fs from 'fs';
import * as path from 'path';

function applyMigration() {
  try {
    // Read migration file
    const migrationPath = path.join(process.cwd(), 'supabase/migrations/create_worldbank_orgchart.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf-8');

    console.log('🔄 World Bank Org Chart Migration SQL');
    console.log('=' .repeat(50));
    console.log('');
    console.log('Please execute the following SQL in your Supabase SQL Editor:');
    console.log('');
    console.log(migrationSql);
    console.log('');
    console.log('=' .repeat(50));
    console.log('After executing the SQL, run: npm run verify to test the API endpoints');

  } catch (error) {
    console.error('Error reading migration file:', error);
    process.exit(1);
  }
}

applyMigration();
