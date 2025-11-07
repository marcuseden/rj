# 🚨 RUN THIS TO FIX YOUR DATABASE ACCESS

## The Problem
You have **conflicting RLS policies** on your tables. Some tables have BOTH "authenticated only" AND "public" policies, which is causing confusion and blocking access.

### What I Found:
- ❌ `worldbank_countries` - 2 conflicting policies
- ❌ `worldbank_documents` - **10 conflicting policies!**
- ❌ `worldbank_orgchart` - 2 conflicting policies
- ✅ `worldbank_projects` - 1 clean policy

## The Fix (30 Seconds)

### 1. Open Supabase SQL Editor
Go to: https://supabase.com/dashboard → Your Project → SQL Editor

### 2. Run the Cleanup Script
1. Open file: `CLEANUP_OLD_POLICIES.sql`
2. Copy ALL contents (Cmd+A, Cmd+C)
3. Paste into Supabase SQL Editor
4. Click **Run** (or Cmd+Enter)

### 3. Check the Results
You should see:
```
✅ Cleaned worldbank_countries - kept only public select policy
✅ Cleaned worldbank_documents - removed ALL old policies
✅ Cleaned worldbank_orgchart - kept only public select policy
✅ worldbank_projects already has clean policies
```

And a table showing each table now has ONLY ONE policy ending in `_public_select`.

### 4. Refresh Your App
1. Go to your browser
2. Hard refresh: **Cmd+Shift+R** (Mac) or **Ctrl+Shift+R** (Windows)
3. Open Console (F12) and run:
   ```javascript
   localStorage.clear();
   location.reload();
   ```

## What This Does

### Before (BROKEN):
```
worldbank_documents has 10 policies:
- "Anyone can view worldbank documents" (public)
- "Authenticated users can read" (public) 
- "Authenticated users can view" (authenticated)
- ... 7 more conflicting policies
```

### After (FIXED):
```
worldbank_documents has 1 policy:
- "documents_public_select" (public, SELECT only)
```

## Expected Result
✅ Countries page loads with all countries  
✅ Documents page loads from database  
✅ Search works  
✅ No more "Document Not Found" errors  
✅ Clean, beautiful layouts

## If You See Errors
The script is safe and will:
- ✅ Check if tables exist before modifying
- ✅ Show clear messages about what it's doing
- ✅ Not delete any data, only policies
- ✅ Display final state for verification

## Why This Happened
Multiple migrations and manual policy changes created conflicting rules. PostgreSQL RLS uses OR logic, but having both "authenticated only" and "public" policies causes confusion about which rule applies.

## After Running This
Your database will have:
- ✅ Exactly ONE policy per table
- ✅ All policies allow public SELECT (read) access
- ✅ RLS still enabled for security
- ✅ No write access (SELECT only)

---

**Ready?** Open `CLEANUP_OLD_POLICIES.sql` → Copy → Paste into Supabase → Run!






