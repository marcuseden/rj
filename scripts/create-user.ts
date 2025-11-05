import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createUser(email: string, password: string) {
  console.log('👤 Creating user...\n');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}\n`);
  
  try {
    // Create user with admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        created_via: 'admin_script',
        created_at: new Date().toISOString()
      }
    });

    if (error) {
      console.error('❌ Error creating user:', error.message);
      return;
    }

    console.log('✅ User created successfully!');
    console.log('📧 User ID:', data.user?.id);
    console.log('📧 Email:', data.user?.email);
    console.log('📧 Email confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No');
    console.log('\n🔐 Login credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('\n✅ User can now login at: http://localhost:3001/login');
    
  } catch (error: any) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Create the user
createUser('mirjasjoblom@gmail.com', 'ABC123');

