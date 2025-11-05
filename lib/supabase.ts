import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  // Use empty strings as fallback during build time
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
  
  return createBrowserClient(supabaseUrl, supabaseKey);
}

