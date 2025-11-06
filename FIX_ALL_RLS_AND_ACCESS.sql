-- =============================================================================
-- FIX ALL RLS POLICIES AND DATABASE ACCESS
-- =============================================================================
-- This script ensures all tables have proper Row Level Security policies
-- and grants necessary permissions for both authenticated and anonymous users.
-- =============================================================================

-- 1. CHECK WHAT DATA EXISTS
-- =============================================================================
DO $$
DECLARE
    countries_count INTEGER := 0;
    projects_count INTEGER := 0;
    docs_count INTEGER := 0;
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'DATABASE CONTENT CHECK';
    RAISE NOTICE '=============================================================================';
    
    -- Check worldbank_countries
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'worldbank_countries') THEN
        SELECT COUNT(*) INTO countries_count FROM worldbank_countries;
        RAISE NOTICE '📊 worldbank_countries: % rows', countries_count;
    ELSE
        RAISE NOTICE '⚠️  worldbank_countries: table does not exist';
    END IF;
    
    -- Check worldbank_projects
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'worldbank_projects') THEN
        SELECT COUNT(*) INTO projects_count FROM worldbank_projects;
        RAISE NOTICE '📊 worldbank_projects: % rows', projects_count;
    ELSE
        RAISE NOTICE '⚠️  worldbank_projects: table does not exist';
    END IF;
    
    -- Check worldbank_documents
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'worldbank_documents') THEN
        SELECT COUNT(*) INTO docs_count FROM worldbank_documents;
        RAISE NOTICE '📊 worldbank_documents: % rows', docs_count;
    ELSE
        RAISE NOTICE '⚠️  worldbank_documents: table does not exist';
    END IF;
    
    RAISE NOTICE '=============================================================================';
END $$;

-- 2. FIX WORLDBANK_COUNTRIES RLS
-- =============================================================================
DO $$
BEGIN
    RAISE NOTICE '';
    
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'worldbank_countries') THEN
        RAISE NOTICE '⚠️  worldbank_countries table does not exist - skipping RLS fix';
        RETURN;
    END IF;
    
    RAISE NOTICE '🔧 Fixing worldbank_countries RLS policies...';
    
    -- Enable RLS
    ALTER TABLE worldbank_countries ENABLE ROW LEVEL SECURITY;
    
    -- Drop all existing policies
    DROP POLICY IF EXISTS "Allow public read access to countries" ON worldbank_countries;
    DROP POLICY IF EXISTS "Enable read access for all users" ON worldbank_countries;
    DROP POLICY IF EXISTS "Public read access" ON worldbank_countries;
    DROP POLICY IF EXISTS "countries_select_policy" ON worldbank_countries;
    
    -- Create comprehensive SELECT policy
    CREATE POLICY "countries_public_select"
    ON worldbank_countries
    FOR SELECT
    TO public
    USING (true);
    
    -- Grant explicit permissions
    GRANT USAGE ON SCHEMA public TO anon, authenticated;
    GRANT SELECT ON worldbank_countries TO anon, authenticated, public;
    
    RAISE NOTICE '✅ worldbank_countries RLS policies fixed';
END $$;

-- 3. FIX WORLDBANK_PROJECTS RLS
-- =============================================================================
DO $$
BEGIN
    RAISE NOTICE '';
    
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'worldbank_projects') THEN
        RAISE NOTICE '⚠️  worldbank_projects table does not exist - skipping RLS fix';
        RETURN;
    END IF;
    
    RAISE NOTICE '🔧 Fixing worldbank_projects RLS policies...';
    
    ALTER TABLE worldbank_projects ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "projects_select_policy" ON worldbank_projects;
    DROP POLICY IF EXISTS "Enable read access for all users" ON worldbank_projects;
    DROP POLICY IF EXISTS "Public read access" ON worldbank_projects;
    
    CREATE POLICY "projects_public_select"
    ON worldbank_projects
    FOR SELECT
    TO public
    USING (true);
    
    GRANT SELECT ON worldbank_projects TO anon, authenticated, public;
    
    RAISE NOTICE '✅ worldbank_projects RLS policies fixed';
END $$;

-- 4. FIX WORLDBANK_DOCUMENTS RLS
-- =============================================================================
DO $$
BEGIN
    RAISE NOTICE '';
    
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'worldbank_documents') THEN
        RAISE NOTICE '⚠️  worldbank_documents table does not exist - skipping RLS fix';
        RETURN;
    END IF;
    
    RAISE NOTICE '🔧 Fixing worldbank_documents RLS policies...';
    
    ALTER TABLE worldbank_documents ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "documents_select_policy" ON worldbank_documents;
    DROP POLICY IF EXISTS "Enable read access for all users" ON worldbank_documents;
    DROP POLICY IF EXISTS "Public read access" ON worldbank_documents;
    
    CREATE POLICY "documents_public_select"
    ON worldbank_documents
    FOR SELECT
    TO public
    USING (true);
    
    GRANT SELECT ON worldbank_documents TO anon, authenticated, public;
    
    RAISE NOTICE '✅ worldbank_documents RLS policies fixed';
END $$;

-- 5. FIX ORGANIZATION CHART TABLES RLS (IF THEY EXIST)
-- =============================================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔧 Checking organization chart tables...';
    
    -- Fix worldbank_leadership (if exists)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'worldbank_leadership') THEN
        ALTER TABLE worldbank_leadership ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "leadership_select_policy" ON worldbank_leadership;
        CREATE POLICY "leadership_public_select" ON worldbank_leadership FOR SELECT TO public USING (true);
        GRANT SELECT ON worldbank_leadership TO anon, authenticated, public;
        RAISE NOTICE '✅ worldbank_leadership RLS policies fixed';
    ELSE
        RAISE NOTICE '⚠️  worldbank_leadership table does not exist - skipping';
    END IF;
    
    -- Fix worldbank_departments (if exists)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'worldbank_departments') THEN
        ALTER TABLE worldbank_departments ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "departments_select_policy" ON worldbank_departments;
        CREATE POLICY "departments_public_select" ON worldbank_departments FOR SELECT TO public USING (true);
        GRANT SELECT ON worldbank_departments TO anon, authenticated, public;
        RAISE NOTICE '✅ worldbank_departments RLS policies fixed';
    ELSE
        RAISE NOTICE '⚠️  worldbank_departments table does not exist - skipping';
    END IF;
    
    -- Fix worldbank_organization_chart (if exists)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'worldbank_organization_chart') THEN
        ALTER TABLE worldbank_organization_chart ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "orgchart_select_policy" ON worldbank_organization_chart;
        CREATE POLICY "orgchart_public_select" ON worldbank_organization_chart FOR SELECT TO public USING (true);
        GRANT SELECT ON worldbank_organization_chart TO anon, authenticated, public;
        RAISE NOTICE '✅ worldbank_organization_chart RLS policies fixed';
    ELSE
        RAISE NOTICE '⚠️  worldbank_organization_chart table does not exist - skipping';
    END IF;
END $$;

-- 6. FIX WORLDBANK_INDICATORS RLS (if exists)
-- =============================================================================
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'worldbank_indicators') THEN
        RAISE NOTICE '';
        RAISE NOTICE '🔧 Fixing worldbank_indicators RLS policies...';
        
        ALTER TABLE worldbank_indicators ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "indicators_select_policy" ON worldbank_indicators;
        CREATE POLICY "indicators_public_select" ON worldbank_indicators FOR SELECT TO public USING (true);
        GRANT SELECT ON worldbank_indicators TO anon, authenticated, public;
        
        RAISE NOTICE '✅ worldbank_indicators RLS policies fixed';
    END IF;
END $$;

-- 7. VERIFY ALL POLICIES
-- =============================================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'VERIFICATION - All RLS Policies';
    RAISE NOTICE '=============================================================================';
END $$;

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename LIKE 'worldbank_%'
ORDER BY tablename, policyname;

-- 8. FINAL STATUS
-- =============================================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE '✅ ALL RLS POLICIES FIXED AND VERIFIED';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE '🎯 All tables now have public SELECT access';
    RAISE NOTICE '🎯 Both authenticated and anonymous users can read data';
    RAISE NOTICE '🎯 RLS is enabled but allows all SELECT operations';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Next step: Refresh your application (Ctrl+Shift+R or Cmd+Shift+R)';
    RAISE NOTICE '=============================================================================';
END $$;

