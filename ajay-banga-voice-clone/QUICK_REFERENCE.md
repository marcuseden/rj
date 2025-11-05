# 🚀 Quick Reference - Security Setup

## ⚡ 3-Minute Setup

### 1. Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### 2. Supabase Configuration

**In Supabase Dashboard:**
1. **Authentication → URL Configuration:**
   - Add: `http://localhost:3001/**`

2. **SQL Editor:**
   - Run: `supabase/migrations/00_complete_schema.sql`

### 3. Start App

```bash
npm install
npm run dev
```

Visit: **http://localhost:3001**

---

## 🔑 Which Client to Use?

```typescript
// ✅ Client Components (use 'client' directive)
import { createClient } from '@/lib/supabase';
const supabase = createClient();

// ✅ Server Components, API Routes
import { createServerSupabaseClient } from '@/lib/supabase-server';
const supabase = await createServerSupabaseClient();

// ⚠️ Admin operations ONLY (bypasses RLS!)
import { createServiceRoleClient } from '@/lib/supabase-server';
const supabase = createServiceRoleClient();
```

---

## 🛡️ Security Checklist

- [x] RLS enabled on all tables
- [x] Middleware protects routes
- [x] Environment variables set
- [x] Supabase URLs configured
- [x] Migration run in database

---

## 🐛 Common Errors & Quick Fixes

### "Failed to fetch" / CORS error
```bash
# Fix: Add to Supabase Dashboard → Authentication → URL Configuration
http://localhost:3001/**
```

### "No rows returned"
```bash
# Fix: Check you're authenticated
# In Supabase SQL Editor:
SELECT auth.uid();  -- Should return your user ID
```

### Image 403 errors
```bash
# Already fixed in next.config.ts
# Images will fallback to avatar initials
```

---

## 📋 Testing Commands

```sql
-- Verify RLS is enabled (all should show 't')
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Check policies exist
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';

-- Test as user (should only see your data)
SELECT * FROM user_profiles;
```

---

## 📚 Full Documentation

| Document | When to Use |
|----------|-------------|
| `SECURITY_IMPLEMENTATION_SUMMARY.md` | Overview of what was implemented |
| `SETUP_COMPLETE.md` | Detailed setup instructions |
| `SECURITY_BEST_PRACTICES.md` | Deep dive into security features |
| `README_SECURITY.md` | Architecture and patterns |
| `QUICK_REFERENCE.md` | This file (quick lookup) |

---

## 🎯 Key Files Modified

```
✅ middleware.ts                   # New - Auth middleware
✅ lib/supabase-server.ts          # New - Server clients
✅ lib/supabase.ts                 # Updated - Enhanced client
✅ next.config.ts                  # Updated - CORS + images
✅ app/login/page.tsx              # Updated - Better errors
✅ supabase/migrations/*.sql       # Updated - RLS policies
```

---

## ⚡ Quick Commands

```bash
# Start dev server
npm run dev

# Check database stats
npm run db:stats

# Verify setup
npm run verify

# Run migration (in Supabase SQL Editor)
# Copy/paste: supabase/migrations/00_complete_schema.sql
```

---

## 🆘 Emergency Troubleshooting

**App won't start?**
1. Check `.env.local` exists with all variables
2. Verify Supabase URL is correct
3. Run `npm install`

**Can't log in?**
1. Check Supabase project is running
2. Verify allowed URLs in Supabase Dashboard
3. Check browser console for errors

**Protected routes not working?**
1. Clear cookies
2. Restart dev server
3. Check middleware.ts is in root directory

---

**For detailed help, see `SETUP_COMPLETE.md`**







