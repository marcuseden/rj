/**
 * Create Test Users in Supabase
 * Run: npx tsx scripts/create-test-users.ts
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const testUsers = [
  {
    email: 'serge@disruptiveventures.se',
    password: 'ABC123',
    email_confirm: true
  },
  {
    email: 'mirjasjoblom@gmail.com',
    password: 'ABC123', // Using same password
    email_confirm: true
  }
];

async function createTestUsers() {
  console.log('👥 Creating test users...\n');

  for (const user of testUsers) {
    try {
      console.log(`📧 Creating user: ${user.email}`);
      
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: user.email_confirm,
        user_metadata: {
          created_by: 'test-script',
          created_at: new Date().toISOString()
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          console.log(`⚠️  User already exists: ${user.email}`);
          console.log(`   You can log in with existing credentials\n`);
        } else {
          console.error(`❌ Error: ${error.message}\n`);
        }
      } else {
        console.log(`✅ User created successfully!`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Password: ${user.password}`);
        console.log(`   User ID: ${data.user?.id}\n`);
      }
    } catch (err: any) {
      console.error(`❌ Failed to create ${user.email}:`, err.message, '\n');
    }
  }

  console.log('✨ Done!\n');
  console.log('📋 Test Credentials:');
  console.log('─'.repeat(50));
  testUsers.forEach(user => {
    console.log(`Email:    ${user.email}`);
    console.log(`Password: ${user.password}`);
    console.log('─'.repeat(50));
  });
}

createTestUsers();

