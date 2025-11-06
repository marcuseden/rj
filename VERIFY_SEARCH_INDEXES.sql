-- =============================================================================
-- VERIFY AND CREATE SEARCH INDEXES FOR PROJECTS, COUNTRIES, DOCUMENTS
-- =============================================================================
-- Ensures all tables are properly indexed for fast searching
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'VERIFYING SEARCH INDEXES';
    RAISE NOTICE '=============================================================================';
END $$;

-- 1. Check existing indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('worldbank_projects', 'worldbank_countries', 'worldbank_documents')
ORDER BY tablename, indexname;

-- 2. CREATE MISSING INDEXES FOR PROJECTS
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔍 Creating indexes for worldbank_projects...';
END $$;

-- Project name search (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_projects_name_gin 
ON worldbank_projects USING gin(to_tsvector('english', project_name));

CREATE INDEX IF NOT EXISTS idx_projects_name_lower 
ON worldbank_projects(LOWER(project_name));

-- Country search
CREATE INDEX IF NOT EXISTS idx_projects_country_name 
ON worldbank_projects(country_name);

CREATE INDEX IF NOT EXISTS idx_projects_country_code 
ON worldbank_projects(country_code);

-- Region search
CREATE INDEX IF NOT EXISTS idx_projects_region 
ON worldbank_projects(region_name);

-- Sector search (GIN for array searching)
CREATE INDEX IF NOT EXISTS idx_projects_sectors_gin 
ON worldbank_projects USING gin(sectors);

-- Department search (GIN for array searching)
CREATE INDEX IF NOT EXISTS idx_projects_departments_gin 
ON worldbank_projects USING gin(tagged_departments);

-- Status and date filters
CREATE INDEX IF NOT EXISTS idx_projects_status 
ON worldbank_projects(status);

CREATE INDEX IF NOT EXISTS idx_projects_approval_date 
ON worldbank_projects(board_approval_date DESC);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_projects_country_status 
ON worldbank_projects(country_name, status);

CREATE INDEX IF NOT EXISTS idx_projects_region_date 
ON worldbank_projects(region_name, board_approval_date DESC);

DO $$
BEGIN
    RAISE NOTICE '✅ worldbank_projects indexes created';
END $$;

-- 3. CREATE MISSING INDEXES FOR COUNTRIES
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔍 Creating indexes for worldbank_countries...';
END $$;

-- Country name search (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_countries_name_gin 
ON worldbank_countries USING gin(to_tsvector('english', name));

CREATE INDEX IF NOT EXISTS idx_countries_name_lower 
ON worldbank_countries(LOWER(name));

-- Capital city search
CREATE INDEX IF NOT EXISTS idx_countries_capital_lower 
ON worldbank_countries(LOWER(capital_city));

-- Region search
CREATE INDEX IF NOT EXISTS idx_countries_region 
ON worldbank_countries(region);

-- Income level
CREATE INDEX IF NOT EXISTS idx_countries_income_level 
ON worldbank_countries(income_level);

-- ISO codes
CREATE INDEX IF NOT EXISTS idx_countries_iso2 
ON worldbank_countries(iso2_code);

CREATE INDEX IF NOT EXISTS idx_countries_iso3 
ON worldbank_countries(iso3_code);

-- Sector focus (GIN for array)
CREATE INDEX IF NOT EXISTS idx_countries_sector_focus_gin 
ON worldbank_countries USING gin(sector_focus);

-- Active projects
CREATE INDEX IF NOT EXISTS idx_countries_active_projects 
ON worldbank_countries(active_projects DESC NULLS LAST);

-- Composite indexes
CREATE INDEX IF NOT EXISTS idx_countries_region_income 
ON worldbank_countries(region, income_level);

DO $$
BEGIN
    RAISE NOTICE '✅ worldbank_countries indexes created';
END $$;

-- 4. CREATE MISSING INDEXES FOR DOCUMENTS
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔍 Creating indexes for worldbank_documents...';
END $$;

-- Title search (full-text)
CREATE INDEX IF NOT EXISTS idx_documents_title_gin 
ON worldbank_documents USING gin(to_tsvector('english', title));

CREATE INDEX IF NOT EXISTS idx_documents_title_lower 
ON worldbank_documents(LOWER(title));

-- Summary search
CREATE INDEX IF NOT EXISTS idx_documents_summary_gin 
ON worldbank_documents USING gin(to_tsvector('english', COALESCE(summary, '')));

-- Content search (full-text)
CREATE INDEX IF NOT EXISTS idx_documents_content_gin 
ON worldbank_documents USING gin(to_tsvector('english', COALESCE(content, '')));

-- Keywords (GIN for array)
CREATE INDEX IF NOT EXISTS idx_documents_keywords_gin 
ON worldbank_documents USING gin(keywords);

-- Document type
CREATE INDEX IF NOT EXISTS idx_documents_type 
ON worldbank_documents(type);

-- Date search
CREATE INDEX IF NOT EXISTS idx_documents_date 
ON worldbank_documents(date DESC NULLS LAST);

-- URL (for deduplication)
CREATE INDEX IF NOT EXISTS idx_documents_url 
ON worldbank_documents(url);

-- Composite indexes
CREATE INDEX IF NOT EXISTS idx_documents_type_date 
ON worldbank_documents(type, date DESC);

DO $$
BEGIN
    RAISE NOTICE '✅ worldbank_documents indexes created';
END $$;

-- 5. ANALYZE (update statistics)
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '📊 Updating table statistics...';
END $$;

-- Note: Run VACUUM separately if needed:
-- VACUUM ANALYZE worldbank_projects;
-- VACUUM ANALYZE worldbank_countries;
-- VACUUM ANALYZE worldbank_documents;

ANALYZE worldbank_projects;
ANALYZE worldbank_countries;
ANALYZE worldbank_documents;

-- 6. CHECK INDEX SIZES
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'INDEX SIZES AND STATISTICS';
    RAISE NOTICE '=============================================================================';
END $$;

SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexname::regclass)) as index_size
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('worldbank_projects', 'worldbank_countries', 'worldbank_documents')
ORDER BY pg_relation_size(indexname::regclass) DESC
LIMIT 20;

-- 7. TEST SEARCH PERFORMANCE (commented out - run manually if needed)
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'SEARCH QUERIES READY TO TEST';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Run these manually to test performance:';
    RAISE NOTICE '1. SELECT * FROM worldbank_projects WHERE LOWER(project_name) LIKE ''%education%'' LIMIT 10;';
    RAISE NOTICE '2. SELECT * FROM worldbank_countries WHERE LOWER(name) LIKE ''%india%'' LIMIT 10;';
    RAISE NOTICE '3. SELECT * FROM worldbank_documents WHERE LOWER(title) LIKE ''%climate%'' LIMIT 10;';
    RAISE NOTICE '';
END $$;

-- Uncomment to test (these can be slow, so run one at a time):
/*
EXPLAIN ANALYZE
SELECT id, project_name, country_name 
FROM worldbank_projects 
WHERE LOWER(project_name) LIKE '%education%' 
LIMIT 10;

EXPLAIN ANALYZE
SELECT id, name, region 
FROM worldbank_countries 
WHERE LOWER(name) LIKE '%india%' 
LIMIT 10;

EXPLAIN ANALYZE
SELECT id, title, date 
FROM worldbank_documents 
WHERE LOWER(title) LIKE '%climate%' 
LIMIT 10;
*/

-- 8. SUMMARY
DO $$
DECLARE
    project_count INTEGER;
    country_count INTEGER;
    document_count INTEGER;
    project_indexes INTEGER;
    country_indexes INTEGER;
    document_indexes INTEGER;
BEGIN
    -- Count records
    SELECT COUNT(*) INTO project_count FROM worldbank_projects;
    SELECT COUNT(*) INTO country_count FROM worldbank_countries;
    SELECT COUNT(*) INTO document_count FROM worldbank_documents;
    
    -- Count indexes
    SELECT COUNT(*) INTO project_indexes 
    FROM pg_indexes 
    WHERE tablename = 'worldbank_projects' AND schemaname = 'public';
    
    SELECT COUNT(*) INTO country_indexes 
    FROM pg_indexes 
    WHERE tablename = 'worldbank_countries' AND schemaname = 'public';
    
    SELECT COUNT(*) INTO document_indexes 
    FROM pg_indexes 
    WHERE tablename = 'worldbank_documents' AND schemaname = 'public';
    
    RAISE NOTICE '';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'FINAL SUMMARY';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Table Statistics:';
    RAISE NOTICE '   worldbank_projects: % rows, % indexes', project_count, project_indexes;
    RAISE NOTICE '   worldbank_countries: % rows, % indexes', country_count, country_indexes;
    RAISE NOTICE '   worldbank_documents: % rows, % indexes', document_count, document_indexes;
    RAISE NOTICE '';
    RAISE NOTICE '✅ All search indexes are in place!';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Your search will now include:';
    RAISE NOTICE '   • Projects (by name, country, sector, department)';
    RAISE NOTICE '   • Countries (by name, capital, region)';
    RAISE NOTICE '   • Documents (by title, content, keywords)';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Search performance optimized with:';
    RAISE NOTICE '   • Full-text search (GIN indexes)';
    RAISE NOTICE '   • Case-insensitive matching';
    RAISE NOTICE '   • Array searching (sectors, keywords)';
    RAISE NOTICE '   • Date and status filtering';
    RAISE NOTICE '';
    RAISE NOTICE '=============================================================================';
END $$;

