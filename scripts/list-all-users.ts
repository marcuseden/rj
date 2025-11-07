import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function listUsers() {
  console.log('👥 Fetching all users from database...\n');
  
  try {
    const { data, error } = await supabase.auth.admin.listUsers({
      perPage: 100
    });

    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }

    console.log(`Found ${data.users.length} users:\n`);
    console.log('═══════════════════════════════════════════════════════════════════════════');
    
    data.users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.email}`);
      console.log(`   User ID: ${user.id}`);
      console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`);
      console.log(`   Confirmed: ${user.email_confirmed_at ? '✅ Yes' : '❌ No'}`);
      console.log(`   Last Sign In: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : '❌ Never'}`);
      
      if (user.user_metadata && Object.keys(user.user_metadata).length > 0) {
        console.log(`   Metadata:`, JSON.stringify(user.user_metadata, null, 2));
      }
      
      if (user.app_metadata && Object.keys(user.app_metadata).length > 0) {
        console.log(`   App Metadata:`, JSON.stringify(user.app_metadata, null, 2));
      }
    });
    
    console.log('\n═══════════════════════════════════════════════════════════════════════════');
    console.log(`\nTotal: ${data.users.length} users`);
    
  } catch (error: any) {
    console.error('❌ Unexpected error:', error);
  }
}

listUsers();


