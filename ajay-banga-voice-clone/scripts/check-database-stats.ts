/**
 * Database Statistics Check
 * Shows counts of all data in the database
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStats() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  DATABASE STATISTICS');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Check speeches table
  console.log('📊 SPEECHES TABLE:');
  const { count: speechesCount, data: speeches } = await supabase
    .from('speeches')
    .select('*', { count: 'exact' });

  console.log(`   Total speeches: ${speechesCount}`);
  
  if (speeches && speeches.length > 0) {
    console.log('\n   Recent speeches:');
    speeches.slice(0, 5).forEach((speech: any) => {
      console.log(`   - ${speech.title.substring(0, 60)}...`);
      console.log(`     Date: ${speech.date} | Words: ${speech.word_count}`);
    });
  }

  // Check worldbank_documents table
  console.log('\n📊 WORLDBANK_DOCUMENTS TABLE:');
  const { count: wbCount, data: wbDocs } = await supabase
    .from('worldbank_documents')
    .select('*', { count: 'exact' });

  console.log(`   Total documents: ${wbCount}`);
  
  if (wbDocs && wbDocs.length > 0) {
    console.log('\n   Documents by type:');
    const byType: Record<string, number> = {};
    wbDocs.forEach((doc: any) => {
      byType[doc.type] = (byType[doc.type] || 0) + 1;
    });
    Object.entries(byType).forEach(([type, count]) => {
      console.log(`   - ${type}: ${count}`);
    });

    console.log('\n   Recent documents:');
    wbDocs.slice(0, 5).forEach((doc: any) => {
      console.log(`   - ${doc.title.substring(0, 60)}...`);
      console.log(`     Type: ${doc.type} | Date: ${doc.date}`);
      console.log(`     Sectors: ${doc.tags_sectors?.join(', ') || 'None'}`);
    });
  }

  // Check CEO profiles
  console.log('\n📊 CEO PROFILES:');
  const { data: ceoProfiles } = await supabase
    .from('ceo_profiles')
    .select('*');

  if (ceoProfiles && ceoProfiles.length > 0) {
    ceoProfiles.forEach((ceo: any) => {
      console.log(`   ✓ ${ceo.name} - ${ceo.title}`);
      console.log(`     Company: ${ceo.company}`);
      console.log(`     Total speeches: ${ceo.total_speeches}`);
      console.log(`     Values: ${ceo.values?.join(', ')}`);
    });
  }

  // Check users
  console.log('\n📊 USER PROFILES:');
  const { count: userCount, data: users } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact' });

  console.log(`   Total users: ${userCount}`);
  
  if (users && users.length > 0) {
    users.forEach((user: any) => {
      console.log(`   - ${user.email} (${user.full_name || 'No name'})`);
      console.log(`     Company: ${user.company || 'Not set'} | Role: ${user.role || 'Not set'}`);
    });
  }

  // Check analysis history
  console.log('\n📊 ANALYSIS HISTORY:');
  const { count: analysisCount } = await supabase
    .from('analysis_history')
    .select('*', { count: 'exact' });

  console.log(`   Total analyses: ${analysisCount}`);

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  SUMMARY');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log(`✅ Total Speeches: ${speechesCount}`);
  console.log(`✅ Total Worldbank Documents: ${wbCount}`);
  console.log(`✅ Total Users: ${userCount}`);
  console.log(`✅ Total CEO Profiles: ${ceoProfiles?.length || 0}`);
  console.log(`✅ Total Analyses: ${analysisCount}\n`);
}

checkStats().catch(console.error);







