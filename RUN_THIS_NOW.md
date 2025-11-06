# 🚀 FIX DATABASE ACCESS - RUN NOW

## Problem
Countries and other data not showing because of Row Level Security (RLS) policies.

## Solution
Run the SQL fix script to enable proper access for all users.

## Steps

### Option 1: Via Supabase Dashboard (RECOMMENDED)
1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `FIX_ALL_RLS_AND_ACCESS.sql`
5. Click **Run** button
6. Check the output logs - you should see:
   - Row counts for each table
   - ✅ Success messages for each table
   - Final verification results

### Option 2: Via psql (If you have direct database access)
```bash
psql "your-database-connection-string" < FIX_ALL_RLS_AND_ACCESS.sql
```

### Option 3: Via Supabase CLI (If linked)
```bash
supabase db execute --file FIX_ALL_RLS_AND_ACCESS.sql
```

## After Running the Script

1. **Hard Refresh** your browser:
   - Chrome/Edge: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
   - Firefox: `Ctrl + F5` (Windows) or `Cmd + Shift + R` (Mac)

2. **Clear localStorage** (if still not working):
   - Open browser console (F12)
   - Go to Application tab → Local Storage
   - Right-click and clear all
   - Refresh page

3. **Check the browser console** for any errors:
   - Press F12
   - Go to Console tab
   - Look for any red error messages

## What the Script Does

✅ Checks how many rows exist in each table
✅ Enables RLS on all World Bank tables
✅ Creates public SELECT policies for all users
✅ Grants explicit permissions to anon and authenticated roles
✅ Verifies all policies are correctly applied

## Expected Output

You should see something like:
```
📊 worldbank_countries: 217 rows
📊 worldbank_projects: 15000+ rows
📊 worldbank_documents: 1000+ rows
✅ worldbank_countries RLS policies fixed
✅ worldbank_projects RLS policies fixed
✅ worldbank_documents RLS policies fixed
✅ ALL RLS POLICIES FIXED AND VERIFIED
```

## If Still Not Working

1. Check your `.env.local` file has correct Supabase credentials
2. Verify you're using the correct Supabase project
3. Check browser console for specific error messages
4. Try logging out and logging back in
5. Contact me with the error messages from browser console


