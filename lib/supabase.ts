import { createBrowserClient } from '@supabase/ssr';
import { createClient as createServerClient } from '@supabase/supabase-js';

export function createClient() {
  // Use empty strings as fallback during build time
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
  
  // Check if we're on the server or client
  if (typeof window === 'undefined') {
    // Server-side: Use standard client
    return createServerClient(supabaseUrl, supabaseKey);
  } else {
    // Client-side: Use SSR-compatible browser client
    return createBrowserClient(supabaseUrl, supabaseKey);
  }
}

