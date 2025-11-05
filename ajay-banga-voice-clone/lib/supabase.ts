import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a Supabase client for client-side operations (Client Components)
 * 
 * SECURITY FEATURES:
 * 1. Uses public anon key (safe for client-side)
 * 2. Respects Row Level Security (RLS) policies
 * 3. Automatically handles cookie-based sessions
 * 4. Token refresh happens automatically
 * 
 * @returns Supabase client instance
 */
export function createClient() {
  // Validate environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          if (typeof document === 'undefined') return undefined;
          const cookie = document.cookie
            .split('; ')
            .find(row => row.startsWith(`${name}=`));
          return cookie ? decodeURIComponent(cookie.split('=')[1]) : undefined;
        },
        set(name: string, value: string, options: any) {
          if (typeof document === 'undefined') return;
          let cookie = `${name}=${encodeURIComponent(value)}`;
          
          if (options.maxAge) {
            cookie += `; max-age=${options.maxAge}`;
          }
          if (options.path) {
            cookie += `; path=${options.path}`;
          }
          if (options.domain) {
            cookie += `; domain=${options.domain}`;
          }
          if (options.sameSite) {
            cookie += `; samesite=${options.sameSite}`;
          }
          if (options.secure) {
            cookie += '; secure';
          }
          
          document.cookie = cookie;
        },
        remove(name: string, options: any) {
          if (typeof document === 'undefined') return;
          this.set(name, '', { ...options, maxAge: -1 });
        },
      },
    }
  );
}

