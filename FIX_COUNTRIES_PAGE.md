# Fix Countries Page - Complete Guide

## Problem Identified
The countries page at `/countries` is not loading countries because of **Row Level Security (RLS) policies** blocking anonymous access to the `worldbank_countries` table.

## Database Status
- ✅ **Database Table**: `worldbank_countries` exists
- ✅ **Data**: 211 countries loaded
- ❌ **RLS Policies**: Blocking anonymous (anon) access
- ❌ **Frontend**: Cannot fetch data

## Solution

### Option 1: Apply via Supabase Dashboard (RECOMMENDED)

1. **Go to Supabase SQL Editor**:
   ```
   https://supabase.com/dashboard/project/osakeppuupnhjpiwpnsv/editor/sql
   ```

2. **Paste and run this SQL**:
   ```sql
   -- Fix RLS Policies for worldbank_countries table
   ALTER TABLE worldbank_countries ENABLE ROW LEVEL SECURITY;

   -- Drop all existing policies
   DROP POLICY IF EXISTS "Allow public read access to countries" ON worldbank_countries;
   DROP POLICY IF EXISTS "Enable read access for all users" ON worldbank_countries;
   DROP POLICY IF EXISTS "Public read access" ON worldbank_countries;

   -- Create new policy for public SELECT access
   CREATE POLICY "Enable read access for all users"
   ON worldbank_countries
   FOR SELECT
   USING (true);

   -- Grant SELECT permissions
   GRANT SELECT ON worldbank_countries TO anon;
   GRANT SELECT ON worldbank_countries TO authenticated;
   ```

3. **Click "RUN"** (or press Cmd+Enter / Ctrl+Enter)

4. **Verify the fix**:
   ```bash
   npx tsx scripts/test-countries-page.ts
   ```

### Option 2: Use Migration File

If you have Supabase CLI installed:

```bash
# Push the migration
supabase db push

# Or apply the specific migration file
supabase migration up 20241106100000_fix_countries_rls
```

Migration file location: `supabase/migrations/20241106100000_fix_countries_rls.sql`

### Option 3: Manual psql Connection

If you have direct database access:

```bash
# Connect to database
psql "postgresql://postgres:[YOUR_PASSWORD]@db.osakeppuupnhjpiwpnsv.supabase.co:5432/postgres"

# Then paste the SQL from Option 1
```

## Testing

After applying the fix, run these tests:

### Test 1: Database Access
```bash
npx tsx scripts/test-countries-page.ts
```

Expected output:
```
✅ Test 1 PASSED: Retrieved 211 total countries
✅ Test 2 PASSED: Retrieved X African countries
✅ Test 3 PASSED: Found X countries
✅ Test 4 PASSED: All required fields are populated
✅ Test 5 PASSED: RLS policies are correct
✅ Test 6 PASSED: All frontend columns exist
```

### Test 2: Frontend Page
```bash
npm run dev
```

Then visit: http://localhost:3000/countries

You should see:
- ✅ 211 countries displayed
- ✅ Search functionality working
- ✅ Region filters working
- ✅ Country cards with data

## Root Cause Analysis

### What Happened?
1. Table `worldbank_countries` was created with RLS enabled
2. Initial policy was created but either:
   - Not applied correctly
   - Dropped by another migration
   - Had wrong permissions

### Why Countries Weren't Loading?
```typescript
// Frontend code in app/(authenticated)/countries/page.tsx
const { data, error } = await supabase
  .from('worldbank_countries')
  .select('*');
// ❌ Error: "permission denied for table worldbank_countries"
```

The frontend uses the **ANON key** (not service role), so it needs proper RLS policies.

### The Fix
```sql
-- Enable RLS
ALTER TABLE worldbank_countries ENABLE ROW LEVEL SECURITY;

-- Create policy that allows SELECT for everyone
CREATE POLICY "Enable read access for all users"
ON worldbank_countries
FOR SELECT
USING (true);  -- This means: everyone can read

-- Grant permissions to anon and authenticated roles
GRANT SELECT ON worldbank_countries TO anon;
GRANT SELECT ON worldbank_countries TO authenticated;
```

## Files Created/Modified

### New Files
1. `supabase/migrations/20241106100000_fix_countries_rls.sql` - Migration with RLS fix
2. `scripts/test-countries-page.ts` - Comprehensive test script
3. `scripts/fix-countries-rls-direct.ts` - Helper script to show fix instructions
4. `FIX_COUNTRIES_PAGE.md` - This documentation

### Existing Files
- `app/(authenticated)/countries/page.tsx` - No changes needed (already correct)
- `lib/supabase.ts` - No changes needed (already correct)

## Verification Checklist

After applying the fix:

- [ ] Run `npx tsx scripts/test-countries-page.ts` - all tests pass
- [ ] Visit `/countries` - page loads without errors
- [ ] See 211 countries displayed
- [ ] Search works (try searching "United")
- [ ] Region filter works (try "Sub-Saharan Africa")
- [ ] Click on a country - navigates to country detail page
- [ ] Browser console has no errors

## Next Steps

Once the countries page works:

1. **Test country detail pages**: `/country/[countryName]`
2. **Verify search integration**: Countries should appear in global search
3. **Check related data**: Ensure indicators and economic data also have proper RLS

## Database Schema Reference

```sql
-- worldbank_countries table structure
CREATE TABLE worldbank_countries (
  id TEXT PRIMARY KEY,
  iso2_code TEXT UNIQUE NOT NULL,
  iso3_code TEXT,
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  income_level TEXT,
  capital_city TEXT,
  latitude TEXT,
  longitude TEXT,
  portfolio_value DECIMAL,
  portfolio_value_formatted TEXT,
  active_projects INTEGER DEFAULT 0,
  -- ... additional columns for indicators, economic data, etc.
);
```

## Support

If you still have issues after applying the fix:

1. Check Supabase logs in dashboard
2. Verify RLS policies: 
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'worldbank_countries';
   ```
3. Check grants:
   ```sql
   SELECT * FROM information_schema.role_table_grants 
   WHERE table_name = 'worldbank_countries';
   ```
4. Run verbose test with console output

---

**Status**: Ready to apply fix
**Priority**: HIGH (countries page is not functional)
**Estimated Time**: 2 minutes to apply SQL + 1 minute to verify

