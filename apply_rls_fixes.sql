-- Apply all RLS fixes for the pages to work

-- Fix worldbank_countries
ALTER TABLE worldbank_countries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON worldbank_countries;
CREATE POLICY "Enable read access for all users"
ON worldbank_countries FOR SELECT USING (true);
GRANT SELECT ON worldbank_countries TO anon, authenticated;

-- Fix worldbank_projects
ALTER TABLE worldbank_projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON worldbank_projects;
CREATE POLICY "Enable read access for all users"
ON worldbank_projects FOR SELECT USING (true);
GRANT SELECT ON worldbank_projects TO anon, authenticated;

-- Fix worldbank_orgchart
ALTER TABLE worldbank_orgchart ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON worldbank_orgchart;
CREATE POLICY "Enable read access for all users"
ON worldbank_orgchart FOR SELECT USING (true);
GRANT SELECT ON worldbank_orgchart TO anon, authenticated;

-- Fix worldbank_documents (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'worldbank_documents') THEN
    ALTER TABLE worldbank_documents ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Enable read access for all users" ON worldbank_documents;
    CREATE POLICY "Enable read access for all users"
    ON worldbank_documents FOR SELECT USING (true);
    GRANT SELECT ON worldbank_documents TO anon, authenticated;
    RAISE NOTICE '✅ RLS policies updated for worldbank_documents';
  END IF;
END $$;

SELECT '✅ All RLS policies fixed! Pages should now load correctly.' as status;

