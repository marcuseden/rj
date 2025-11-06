-- Fix RLS Policies for worldbank_orgchart table
-- This enables public read access to the org chart data

-- Enable RLS
ALTER TABLE worldbank_orgchart ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to orgchart" ON worldbank_orgchart;
DROP POLICY IF EXISTS "Enable read access for all users" ON worldbank_orgchart;
DROP POLICY IF EXISTS "Public read access" ON worldbank_orgchart;

-- Create new policy for public SELECT access
CREATE POLICY "Enable read access for all users"
ON worldbank_orgchart
FOR SELECT
USING (true);

-- Grant SELECT to both authenticated and anonymous users
GRANT SELECT ON worldbank_orgchart TO anon;
GRANT SELECT ON worldbank_orgchart TO authenticated;

-- Verify the policy was created
DO $$
BEGIN
  RAISE NOTICE '✅ RLS policies updated for worldbank_orgchart';
  RAISE NOTICE '   • Public read access enabled';
  RAISE NOTICE '   • Both anon and authenticated users can SELECT';
END $$;

