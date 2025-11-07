import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addActiveProjectsColumn() {
  console.log('🔧 Adding active_projects column to worldbank_countries...\n');
  
  try {
    // Check if column exists
    const { data: columns } = await supabase
      .from('worldbank_countries')
      .select('*')
      .limit(1);
    
    if (columns && columns[0] && 'active_projects' in columns[0]) {
      console.log('✅ Column active_projects already exists');
      return;
    }
    
    // Add the column using raw SQL (you'll need to add this via Supabase dashboard SQL editor)
    console.log('⚠️  Column needs to be added via SQL:');
    console.log('\nRun this in Supabase SQL Editor:');
    console.log('--------------------------------------------------');
    console.log('ALTER TABLE worldbank_countries');
    console.log('ADD COLUMN IF NOT EXISTS active_projects INTEGER DEFAULT 0;');
    console.log('--------------------------------------------------\n');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

addActiveProjectsColumn();






