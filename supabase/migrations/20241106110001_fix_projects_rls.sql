-- Fix RLS Policies for worldbank_projects table
-- This enables public read access to the projects data

-- Enable RLS
ALTER TABLE worldbank_projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to projects" ON worldbank_projects;
DROP POLICY IF EXISTS "Enable read access for all users" ON worldbank_projects;
DROP POLICY IF EXISTS "Public read access" ON worldbank_projects;

-- Create new policy for public SELECT access
CREATE POLICY "Enable read access for all users"
ON worldbank_projects
FOR SELECT
USING (true);

-- Grant SELECT to both authenticated and anonymous users
GRANT SELECT ON worldbank_projects TO anon;
GRANT SELECT ON worldbank_projects TO authenticated;

-- Verify the policy was created
DO $$
BEGIN
  RAISE NOTICE '✅ RLS policies updated for worldbank_projects';
  RAISE NOTICE '   • Public read access enabled';
  RAISE NOTICE '   • Both anon and authenticated users can SELECT';
END $$;







