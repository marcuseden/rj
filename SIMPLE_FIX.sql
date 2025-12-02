-- Quick fix to allow authenticated users to read countries
-- Run this in Supabase SQL Editor

-- First, check if policies exist
SELECT tablename, policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'worldbank_countries';

-- Drop and recreate the policy cleanly
DROP POLICY IF EXISTS "Countries are viewable by authenticated users only" ON worldbank_countries;
DROP POLICY IF EXISTS "Enable read access for all users" ON worldbank_countries;
DROP POLICY IF EXISTS "Allow public read access to countries" ON worldbank_countries;

-- Create simple, working policy
CREATE POLICY "authenticated_read_countries"
ON worldbank_countries
FOR SELECT
TO authenticated
USING (true);

-- Ensure authenticated has SELECT permission
GRANT SELECT ON worldbank_countries TO authenticated;

-- Test the query as authenticated user would see it
SELECT COUNT(*) as total FROM worldbank_countries;

-- Verify policy
SELECT 'Policy created!' as status,
       policyname,
       cmd,
       roles::text
FROM pg_policies 
WHERE tablename = 'worldbank_countries';







