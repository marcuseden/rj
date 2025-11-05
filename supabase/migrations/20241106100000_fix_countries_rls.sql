-- Fix RLS Policies for worldbank_countries table
-- This enables public read access to the countries data

-- Enable RLS
ALTER TABLE worldbank_countries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to countries" ON worldbank_countries;
DROP POLICY IF EXISTS "Enable read access for all users" ON worldbank_countries;
DROP POLICY IF EXISTS "Public read access" ON worldbank_countries;

-- Create new policy for public SELECT access
CREATE POLICY "Enable read access for all users"
ON worldbank_countries
FOR SELECT
USING (true);

-- Grant SELECT to both authenticated and anonymous users
GRANT SELECT ON worldbank_countries TO anon;
GRANT SELECT ON worldbank_countries TO authenticated;

-- Verify the policy was created
DO $$
BEGIN
  RAISE NOTICE '✅ RLS policies updated for worldbank_countries';
  RAISE NOTICE '   • Public read access enabled';
  RAISE NOTICE '   • Both anon and authenticated users can SELECT';
END $$;

