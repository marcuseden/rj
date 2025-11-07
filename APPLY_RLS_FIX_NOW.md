# 🚨 URGENT: Apply RLS Policies to Fix Pages

## The Problem
The **Country Page** and **Knowledge/Search Page** cannot load because the database tables have Row Level Security (RLS) enabled but no policies allowing public read access.

## Quick Fix (2 minutes)

### Option 1: Via Supabase Dashboard (RECOMMENDED)

1. Go to: https://osakeppuupnhjpiwpnsv.supabase.co/project/osakeppuupnhjpiwpnsv/sql/new

2. Copy and paste this SQL and click **RUN**:

```sql
-- Fix worldbank_countries
ALTER TABLE worldbank_countries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON worldbank_countries;
CREATE POLICY "Enable read access for all users" ON worldbank_countries FOR SELECT USING (true);
GRANT SELECT ON worldbank_countries TO anon, authenticated;

-- Fix worldbank_projects  
ALTER TABLE worldbank_projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON worldbank_projects;
CREATE POLICY "Enable read access for all users" ON worldbank_projects FOR SELECT USING (true);
GRANT SELECT ON worldbank_projects TO anon, authenticated;

-- Fix worldbank_orgchart
ALTER TABLE worldbank_orgchart ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON worldbank_orgchart;
CREATE POLICY "Enable read access for all users" ON worldbank_orgchart FOR SELECT USING (true);
GRANT SELECT ON worldbank_orgchart TO anon, authenticated;

SELECT 'RLS policies applied successfully!' as status;
```

3. **That's it!** Refresh your app - pages should now load.

### Option 2: Via Terminal

```bash
# Copy the SQL file content
cat apply_rls_fixes.sql

# Then paste it in the Supabase SQL Editor (link above)
```

## What This Does

- Enables public **READ-ONLY** access to:
  - `worldbank_countries` (for country pages)
  - `worldbank_projects` (for project listings)
  - `worldbank_orgchart` (for people/department search)

- Does NOT allow write/update/delete - only SELECT queries

## Test After Applying

1. Navigate to: `/country/Ukraine`
2. Navigate to: `/worldbank-search`
3. Both pages should now load successfully!

## Code Fixes Already Applied

I've already fixed the following code issues:

✅ Country page: Updated to use correct project table columns (`id`, `board_approval_date`, `total_amount_formatted`)
✅ Search API: Fixed to query `worldbank_projects` table correctly
✅ Search API: Added error handling for empty `worldbank_documents` table
✅ Filters API: Added projects data to populate filters

All code is ready - just need to apply the RLS policies above!






