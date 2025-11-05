# Security Best Practices - CEO Alignment Checker

## Overview
This document outlines the security measures implemented in the application to protect user data and ensure secure operations.

## 🔒 Supabase Security Configuration

### 1. Row Level Security (RLS)

All tables have RLS enabled with `FORCE ROW LEVEL SECURITY` to prevent accidental bypass:

#### User Profiles
- ✅ Users can only view/update their own profile
- ✅ Users cannot delete profiles (data retention)
- ✅ Profile creation restricted to authenticated users

#### CEO Profiles
- ✅ Read-only for authenticated users (active profiles only)
- ✅ Write operations restricted to service role
- ✅ Inactive profiles hidden from regular users

#### Speeches
- ✅ Read-only for authenticated users
- ✅ Write operations restricted to service role
- ✅ Prevents unauthorized content modification

#### Worldbank Documents
- ✅ Read-only for authenticated users
- ✅ Write operations restricted to service role
- ✅ Bulk data operations secured

#### Analysis History
- ✅ Users can only access their own analysis
- ✅ Full CRUD operations on own data
- ✅ Complete data isolation between users

### 2. Environment Variables

**Required Variables (must be set):**
```bash
# Public - Safe for client-side
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Private - Server-side only
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # NEVER expose to client

# Optional - For features
OPENAI_API_KEY=your_openai_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

**Security Notes:**
- ✅ Anon key is safe for client-side (protected by RLS)
- ⚠️ Service role key bypasses RLS - NEVER expose to client
- ✅ API keys stored server-side only

### 3. Supabase Project Configuration

**In Supabase Dashboard → Authentication → URL Configuration:**

1. **Site URL:** `http://localhost:3001` (development) or your production URL
2. **Redirect URLs:** Add all allowed redirect URLs:
   - `http://localhost:3001/**`
   - `https://yourdomain.com/**`

**In Supabase Dashboard → Authentication → Providers:**

1. **Email Provider:** Enabled
2. **Confirm email:** Recommended for production
3. **Secure email change:** Enabled
4. **Session settings:**
   - JWT expiry: 3600 (1 hour)
   - Refresh token rotation: Enabled

## 🛡️ Application Security

### 1. Middleware Protection

The middleware (`middleware.ts`) provides:

- ✅ Automatic session validation and refresh
- ✅ Protected route enforcement
- ✅ Automatic redirect to login for unauthenticated users
- ✅ CORS headers for API routes
- ✅ Security headers (X-Frame-Options, CSP, etc.)
- ✅ Preflight request handling

**Protected Routes:**
- `/dashboard`
- `/rj-agent`
- `/rj-faq`
- `/rj-writing-assistant`
- `/vision`
- `/worldbank-search`

### 2. Client Types

**Three Supabase client types for different contexts:**

#### Browser Client (`lib/supabase.ts`)
```typescript
import { createClient } from '@/lib/supabase';
```
- ✅ Use in Client Components
- ✅ Cookie-based session management
- ✅ Automatic token refresh
- ✅ Respects RLS policies

#### Server Client (`lib/supabase-server.ts`)
```typescript
import { createServerSupabaseClient } from '@/lib/supabase-server';
```
- ✅ Use in Server Components, Server Actions, Route Handlers
- ✅ Cookie-based session management
- ✅ Respects RLS policies
- ✅ SSR compatible

#### Service Role Client (`lib/supabase-server.ts`)
```typescript
import { createServiceRoleClient } from '@/lib/supabase-server';
```
- ⚠️ BYPASSES RLS - Use with extreme caution
- ✅ For admin operations, data seeding, system tasks
- ❌ NEVER use for user-initiated actions
- ❌ NEVER expose to client-side

### 3. Security Headers

Implemented via middleware:

```typescript
X-Frame-Options: DENY                    // Prevents clickjacking
X-Content-Type-Options: nosniff         // Prevents MIME sniffing
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### 4. CORS Configuration

- ✅ Configured in `next.config.ts` for API routes
- ✅ Middleware adds proper CORS headers
- ✅ Preflight requests handled
- ✅ Credentials support enabled

## 🔐 Authentication Best Practices

### 1. Password Requirements
- Minimum 6 characters (enforced by Supabase)
- Recommend 12+ characters for production

### 2. Session Management
- Sessions stored in HTTP-only cookies (secure by default)
- Automatic token refresh via middleware
- Session expires after inactivity (configurable in Supabase)

### 3. Email Verification
- Optional for development
- Strongly recommended for production
- Configure in Supabase Dashboard → Authentication

## 📝 API Security

### 1. Route Protection
All API routes automatically include:
- CORS headers
- Authentication validation
- Rate limiting (via Supabase)

### 2. Data Validation
- Input sanitization in API routes
- Type checking with TypeScript
- Zod schemas for validation (recommended)

## 🚨 Common Security Pitfalls to Avoid

❌ **DON'T:**
1. Never commit `.env.local` to git
2. Never use service role key in client-side code
3. Never disable RLS on production tables
4. Never trust client-side data without validation
5. Never expose sensitive data in error messages

✅ **DO:**
1. Always validate and sanitize user input
2. Use proper client type for each context
3. Keep dependencies updated
4. Log security events
5. Regular security audits

## 🔄 Migration and Setup

### Initial Setup

1. **Run the migration:**
```bash
# In Supabase Dashboard → SQL Editor
# Run the contents of supabase/migrations/00_complete_schema.sql
```

2. **Set environment variables:**
```bash
cp .env.local.example .env.local
# Edit .env.local with your credentials
```

3. **Configure Supabase URLs:**
- Add localhost:3001 to allowed URLs
- Enable email provider
- Configure security settings

### Verify Security

Run these queries in Supabase SQL Editor:

```sql
-- Check RLS is enabled on all tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
-- All should show 't' (true)

-- Check policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

## 📚 Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

## 🆘 Troubleshooting

### "Failed to fetch" errors
- Check NEXT_PUBLIC_SUPABASE_URL in .env.local
- Verify Supabase project is accessible
- Check CORS configuration in Supabase Dashboard

### "No rows returned" with valid data
- Verify RLS policies are correct
- Check user is authenticated
- Use service role client only when necessary

### 403 Forbidden errors
- Check RLS policies
- Verify user has correct permissions
- Ensure authenticated user context exists

## 📞 Support

For security concerns or vulnerabilities, please contact the development team immediately.







