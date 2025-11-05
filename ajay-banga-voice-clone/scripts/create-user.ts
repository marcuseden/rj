/**
 * Create User Script
 * Creates a user account in Supabase
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createUser(email: string, password: string) {
  console.log('═══════════════════════════════════════');
  console.log('  CREATING USER ACCOUNT');
  console.log('═══════════════════════════════════════\n');

  console.log(`📧 Email: ${email}`);
  console.log(`🔑 Password: ${password}\n`);

  try {
    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: 'Marcus Lowegren'
      }
    });

    if (error) {
      console.error('❌ Error creating user:', error.message);
      process.exit(1);
    }

    console.log('✅ User created successfully!');
    console.log(`   User ID: ${data.user.id}`);
    console.log(`   Email: ${data.user.email}`);
    console.log(`   Email Confirmed: ${data.user.email_confirmed_at ? 'Yes' : 'No'}`);

    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: data.user.id,
        email: email,
        full_name: 'Marcus Lowegren',
        company: 'World Bank Group',
        role: 'Administrator'
      });

    if (profileError) {
      console.log(`⚠️ Warning: Could not create user profile: ${profileError.message}`);
    } else {
      console.log('✅ User profile created!');
    }

    console.log('\n═══════════════════════════════════════');
    console.log('  YOU CAN NOW SIGN IN');
    console.log('═══════════════════════════════════════\n');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('\nGo to: http://localhost:3001/login\n');

  } catch (error: any) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

// Get credentials from command line or use defaults
const email = process.argv[2] || 'm_lowegren@mac.com';
const password = process.argv[3] || 'ABC123';

createUser(email, password);







