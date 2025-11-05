-- Fix RLS Policies for worldbank_countries table
ALTER TABLE worldbank_countries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to countries" ON worldbank_countries;
DROP POLICY IF EXISTS "Enable read access for all users" ON worldbank_countries;
DROP POLICY IF EXISTS "Public read access" ON worldbank_countries;

CREATE POLICY "Enable read access for all users"
ON worldbank_countries
FOR SELECT
USING (true);

GRANT SELECT ON worldbank_countries TO anon;
GRANT SELECT ON worldbank_countries TO authenticated;
