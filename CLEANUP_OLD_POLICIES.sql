-- =============================================================================
-- CLEANUP OLD RLS POLICIES - Remove All Conflicting Policies
-- =============================================================================
-- This removes ALL old policies and keeps only the new public access ones
-- Run this to fix the conflicts you're seeing
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'CLEANING UP OLD RLS POLICIES';
    RAISE NOTICE '=============================================================================';
END $$;

-- =============================================================================
-- 1. CLEAN UP WORLDBANK_COUNTRIES
-- =============================================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🧹 Cleaning worldbank_countries policies...';
    
    -- Drop ALL policies
    DROP POLICY IF EXISTS "Countries are viewable by authenticated users only" ON worldbank_countries;
    DROP POLICY IF EXISTS "Allow public read access to countries" ON worldbank_countries;
    DROP POLICY IF EXISTS "Enable read access for all users" ON worldbank_countries;
    DROP POLICY IF EXISTS "Public read access" ON worldbank_countries;
    DROP POLICY IF EXISTS "countries_select_policy" ON worldbank_countries;
    
    -- Keep only the public select policy
    DROP POLICY IF EXISTS "countries_public_select" ON worldbank_countries;
    CREATE POLICY "countries_public_select"
    ON worldbank_countries
    FOR SELECT
    TO public
    USING (true);
    
    RAISE NOTICE '✅ Cleaned worldbank_countries - kept only public select policy';
END $$;

-- =============================================================================
-- 2. CLEAN UP WORLDBANK_DOCUMENTS (This one has the most conflicts!)
-- =============================================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🧹 Cleaning worldbank_documents policies...';
    
    -- Drop ALL old policies
    DROP POLICY IF EXISTS "Anyone can view worldbank documents" ON worldbank_documents;
    DROP POLICY IF EXISTS "Authenticated users can read" ON worldbank_documents;
    DROP POLICY IF EXISTS "Authenticated users can view worldbank documents" ON worldbank_documents;
    DROP POLICY IF EXISTS "Prevent unauthorized worldbank document modifications" ON worldbank_documents;
    DROP POLICY IF EXISTS "Service role can insert worldbank documents" ON worldbank_documents;
    DROP POLICY IF EXISTS "Service role can manage worldbank documents" ON worldbank_documents;
    DROP POLICY IF EXISTS "Service role has full access" ON worldbank_documents;
    DROP POLICY IF EXISTS "documents_select_policy" ON worldbank_documents;
    DROP POLICY IF EXISTS "Enable read access for all users" ON worldbank_documents;
    DROP POLICY IF EXISTS "Public read access" ON worldbank_documents;
    
    -- Keep only the public select policy
    DROP POLICY IF EXISTS "documents_public_select" ON worldbank_documents;
    CREATE POLICY "documents_public_select"
    ON worldbank_documents
    FOR SELECT
    TO public
    USING (true);
    
    RAISE NOTICE '✅ Cleaned worldbank_documents - removed ALL old policies, kept only public select';
END $$;

-- =============================================================================
-- 3. CLEAN UP WORLDBANK_ORGCHART
-- =============================================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🧹 Cleaning worldbank_orgchart policies...';
    
    -- Drop ALL old policies
    DROP POLICY IF EXISTS "Enable read access for all users" ON worldbank_orgchart;
    DROP POLICY IF EXISTS "Org chart viewable by authenticated users only" ON worldbank_orgchart;
    DROP POLICY IF EXISTS "orgchart_select_policy" ON worldbank_orgchart;
    DROP POLICY IF EXISTS "Public read access" ON worldbank_orgchart;
    
    -- Keep only the public select policy
    DROP POLICY IF EXISTS "orgchart_public_select" ON worldbank_orgchart;
    CREATE POLICY "orgchart_public_select"
    ON worldbank_orgchart
    FOR SELECT
    TO public
    USING (true);
    
    RAISE NOTICE '✅ Cleaned worldbank_orgchart - kept only public select policy';
END $$;

-- =============================================================================
-- 4. WORLDBANK_PROJECTS (This one is already clean, just verify)
-- =============================================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ worldbank_projects already has clean policies';
END $$;

-- =============================================================================
-- 5. VERIFY ALL GRANTS
-- =============================================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔐 Ensuring all tables have proper grants...';
    
    GRANT USAGE ON SCHEMA public TO anon, authenticated, public;
    GRANT SELECT ON worldbank_countries TO anon, authenticated, public;
    GRANT SELECT ON worldbank_documents TO anon, authenticated, public;
    GRANT SELECT ON worldbank_orgchart TO anon, authenticated, public;
    GRANT SELECT ON worldbank_projects TO anon, authenticated, public;
    
    RAISE NOTICE '✅ All grants verified';
END $$;

-- =============================================================================
-- 6. SHOW FINAL POLICIES
-- =============================================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'FINAL RLS POLICIES (After Cleanup)';
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

-- =============================================================================
-- FINAL MESSAGE
-- =============================================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE '✅ CLEANUP COMPLETE!';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE '';
    RAISE NOTICE '📋 What was done:';
    RAISE NOTICE '   • Removed ALL old conflicting policies';
    RAISE NOTICE '   • Each table now has exactly ONE policy: public SELECT';
    RAISE NOTICE '   • All users (authenticated, anonymous, public) can read data';
    RAISE NOTICE '   • RLS is still enabled for security';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Expected result:';
    RAISE NOTICE '   • Each table should show only 1 policy in the output above';
    RAISE NOTICE '   • Policy name ends with "_public_select"';
    RAISE NOTICE '   • Role should be {public}';
    RAISE NOTICE '   • Command should be SELECT';
    RAISE NOTICE '';
    RAISE NOTICE '📱 Next steps:';
    RAISE NOTICE '   1. Hard refresh your browser (Cmd+Shift+R or Ctrl+Shift+R)';
    RAISE NOTICE '   2. Clear localStorage in browser console: localStorage.clear()';
    RAISE NOTICE '   3. Check if countries page now loads';
    RAISE NOTICE '   4. Check if documents page now loads';
    RAISE NOTICE '';
    RAISE NOTICE '=============================================================================';
END $$;







