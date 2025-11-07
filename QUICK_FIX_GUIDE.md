# 🚨 QUICK FIX - Countries Not Showing

## The Problem
Your countries page and documents are not loading because of database Row Level Security (RLS) policies blocking access.

## The Solution (2 Minutes)

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New query"** button

### Step 2: Run the Fix Script
1. Open the file `FIX_ALL_RLS_AND_ACCESS.sql` in your code editor
2. Copy ALL the contents (Cmd+A, Cmd+C)
3. Paste into the Supabase SQL Editor
4. Click **"Run"** (or press Cmd+Enter)

### Step 3: Check the Output
You should see messages like:
```
✅ worldbank_countries: 217 rows
✅ worldbank_projects: 15000 rows  
✅ worldbank_documents: 1000 rows
✅ worldbank_countries RLS policies fixed
✅ worldbank_projects RLS policies fixed
✅ worldbank_documents RLS policies fixed
```

If you see `⚠️ table does not exist` warnings, that's OK - it just means those tables haven't been created yet.

### Step 4: Refresh Your App
1. Go back to your app in the browser
2. Hard refresh:
   - **Mac**: `Cmd + Shift + R`
   - **Windows**: `Ctrl + Shift + R`
3. Open browser console (F12) and check for errors

## What This Does
- ✅ Enables public read access to all World Bank tables
- ✅ Creates RLS policies that allow SELECT for anonymous and authenticated users
- ✅ Safely checks if tables exist before modifying them
- ✅ Shows you exactly what data you have in your database

## Still Not Working?

### Check 1: Verify Supabase Connection
Open your browser console (F12) and check for errors like:
- `401 Unauthorized`
- `403 Forbidden`  
- `Failed to fetch`

### Check 2: Clear Cache
```javascript
// Run this in browser console
localStorage.clear();
location.reload();
```

### Check 3: Verify Environment Variables
Make sure your `.env.local` file has:
```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Check 4: Look at Network Tab
1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Filter by **Fetch/XHR**
4. Refresh the page
5. Look for failed requests (red) to Supabase

## Expected Result
After running the fix:
- ✅ Countries page shows all countries with map
- ✅ Document pages load from database
- ✅ Search works properly
- ✅ No more "Not Found" errors

## What Changed
The app was trying to load data from local JSON files. Now it:
- ✅ Fetches everything from Supabase database
- ✅ Uses proper RLS policies for security
- ✅ Has better error handling and logging
- ✅ Shows beautiful, readable document layouts

---

**Need Help?** Check your browser console for specific error messages and share them.






