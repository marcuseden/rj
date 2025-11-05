-- ============================================================================
-- PRODUCTION-READY RLS POLICIES
-- Secure access control with authentication requirement
-- ============================================================================

-- ============================================================================
-- COUNTRIES TABLE - Authenticated users only
-- ============================================================================

ALTER TABLE worldbank_countries ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow public read access to countries" ON worldbank_countries;
DROP POLICY IF EXISTS "Enable read access for all users" ON worldbank_countries;
DROP POLICY IF EXISTS "Countries are viewable by authenticated users" ON worldbank_countries;

-- Create secure policy - REQUIRES AUTHENTICATION
CREATE POLICY "Countries are viewable by authenticated users only" 
ON worldbank_countries 
FOR SELECT 
TO authenticated
USING (true);

-- Grant permissions only to authenticated users
GRANT SELECT ON worldbank_countries TO authenticated;
REVOKE SELECT ON worldbank_countries FROM anon;

-- ============================================================================
-- ORG CHART TABLE - Authenticated users only  
-- ============================================================================

ALTER TABLE worldbank_orgchart ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON worldbank_orgchart;
DROP POLICY IF EXISTS "Org chart viewable by authenticated users" ON worldbank_orgchart;
DROP POLICY IF EXISTS "Allow public read access to org chart" ON worldbank_orgchart;

-- Create secure policy - REQUIRES AUTHENTICATION
CREATE POLICY "Org chart viewable by authenticated users only" 
ON worldbank_orgchart 
FOR SELECT 
TO authenticated
USING (is_active = true);

-- Grant permissions only to authenticated users
GRANT SELECT ON worldbank_orgchart TO authenticated;
REVOKE SELECT ON worldbank_orgchart FROM anon;

-- ============================================================================
-- MATERIALIZED VIEWS - Authenticated access
-- ============================================================================

DO $$
BEGIN
  -- Department details view
  IF EXISTS (
    SELECT FROM pg_matviews 
    WHERE schemaname = 'public' 
    AND matviewname = 'worldbank_department_details'
  ) THEN
    ALTER MATERIALIZED VIEW worldbank_department_details OWNER TO postgres;
    GRANT SELECT ON worldbank_department_details TO authenticated;
    REVOKE SELECT ON worldbank_department_details FROM anon;
  END IF;
  
  -- Hierarchy view
  IF EXISTS (
    SELECT FROM pg_matviews 
    WHERE schemaname = 'public' 
    AND matviewname = 'worldbank_orgchart_hierarchy'
  ) THEN
    ALTER MATERIALIZED VIEW worldbank_orgchart_hierarchy OWNER TO postgres;
    GRANT SELECT ON worldbank_orgchart_hierarchy TO authenticated;
    REVOKE SELECT ON worldbank_orgchart_hierarchy FROM anon;
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify policies are active
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('worldbank_countries', 'worldbank_orgchart')
ORDER BY tablename, policyname;

-- Verify table access
SELECT 
  'Production RLS policies configured!' AS status,
  (SELECT COUNT(*) FROM worldbank_countries) AS countries,
  (SELECT COUNT(*) FROM worldbank_orgchart WHERE is_active = true) AS active_members,
  'Authentication required for all access' AS security_level;


