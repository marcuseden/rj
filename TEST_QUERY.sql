-- Test query to verify data and permissions
-- Run this in Supabase SQL Editor

-- Check if data exists
SELECT COUNT(*) as total_countries FROM worldbank_countries;

-- Check sample data
SELECT id, name, iso2_code, region, income_level, capital_city
FROM worldbank_countries
ORDER BY name
LIMIT 5;

-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  roles
FROM pg_policies 
WHERE tablename = 'worldbank_countries';

-- Check grants
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'worldbank_countries';

