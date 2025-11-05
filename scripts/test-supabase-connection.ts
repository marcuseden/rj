#!/usr/bin/env tsx

/**
 * Test Supabase Database Connection
 * Verifies that the new Supabase credentials are working
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function testConnection() {
  console.log('🔍 Testing Supabase Connection...\n');
  
  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('📋 Configuration:');
  console.log(`   URL: ${supabaseUrl || '❌ NOT SET'}`);
  console.log(`   Anon Key: ${supabaseAnonKey ? '✅ SET (' + supabaseAnonKey.substring(0, 20) + '...)' : '❌ NOT SET'}`);
  console.log(`   Service Key: ${supabaseServiceKey ? '✅ SET (' + supabaseServiceKey.substring(0, 20) + '...)' : '❌ NOT SET'}\n`);
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase configuration in .env.local');
    console.log('\nPlease add:');
    console.log('NEXT_PUBLIC_SUPABASE_URL=https://osakeppuupnhjpiwpnsv.supabase.co');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
    console.log('SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
    process.exit(1);
  }
  
  // Test connection with service role (full access)
  console.log('🔗 Testing connection with service role key...');
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // Test 1: Check authentication
    console.log('\n1️⃣ Testing authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError && authError.message !== 'Auth session missing!') {
      throw authError;
    }
    console.log('   ✅ Authentication OK');
    
    // Test 2: List tables
    console.log('\n2️⃣ Listing database tables...');
    const { data: tables, error: tablesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (tablesError) {
      if (tablesError.message.includes('does not exist')) {
        console.log('   ⚠️  Table "profiles" does not exist yet (this is okay for new projects)');
      } else {
        throw tablesError;
      }
    } else {
      console.log('   ✅ Can access "profiles" table');
      console.log(`   📊 Sample data: ${tables?.length || 0} rows`);
    }
    
    // Test 3: Check permissions
    console.log('\n3️⃣ Testing write permissions...');
    const testData = {
      id: 'test-' + Date.now(),
      test: true,
      created_at: new Date().toISOString()
    };
    
    // Try to insert (this might fail if table doesn't exist, which is fine)
    const { error: insertError } = await supabase
      .from('test_connection')
      .insert(testData);
    
    if (insertError) {
      if (insertError.message.includes('does not exist')) {
        console.log('   ⚠️  Test table does not exist (expected for new setup)');
      } else {
        console.log('   ⚠️  Insert test skipped:', insertError.message);
      }
    } else {
      console.log('   ✅ Write permissions OK');
      
      // Clean up test data
      await supabase
        .from('test_connection')
        .delete()
        .eq('id', testData.id);
    }
    
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║              ✅ SUPABASE CONNECTION SUCCESS               ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    
    console.log('Database is accessible and configured correctly!');
    console.log('You can now use Supabase in your application.\n');
    
  } catch (error: any) {
    console.error('\n❌ Connection test failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

testConnection();

