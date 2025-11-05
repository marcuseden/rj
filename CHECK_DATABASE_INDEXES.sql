-- ============================================================================
-- CHECK ALL INDEXES IN DATABASE
-- Copy and run this in Supabase SQL Editor
-- ============================================================================

-- List all indexes on worldbank tables
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
AND tablename LIKE 'worldbank%'
ORDER BY tablename, indexname;

-- ============================================================================
-- COUNT INDEXES PER TABLE
-- ============================================================================

SELECT 
    tablename,
    COUNT(*) as index_count
FROM pg_indexes
WHERE schemaname = 'public' 
AND tablename LIKE 'worldbank%'
GROUP BY tablename
ORDER BY tablename;

-- ============================================================================
-- CHECK IF REQUIRED EXTENSIONS ARE INSTALLED
-- ============================================================================

SELECT 
    extname as extension_name,
    extversion as version
FROM pg_extension
WHERE extname IN ('pg_trgm', 'btree_gin');

-- ============================================================================
-- CHECK TABLE ROW COUNTS
-- ============================================================================

SELECT 
    'worldbank_documents' as table_name,
    COUNT(*) as row_count
FROM worldbank_documents
UNION ALL
SELECT 
    'worldbank_countries' as table_name,
    COUNT(*) as row_count
FROM worldbank_countries
UNION ALL
SELECT 
    'worldbank_orgchart' as table_name,
    COUNT(*) as row_count
FROM worldbank_orgchart;

-- ============================================================================
-- TEST FULL-TEXT SEARCH
-- ============================================================================

-- Test if full-text search works on documents
SELECT 
    id, 
    title,
    ts_rank(
        to_tsvector('english', title || ' ' || content),
        plainto_tsquery('english', 'hospital')
    ) as rank
FROM worldbank_documents
WHERE to_tsvector('english', title || ' ' || content) @@ plainto_tsquery('english', 'hospital')
ORDER BY rank DESC
LIMIT 5;

-- ============================================================================
-- TEST COUNTRIES SEARCH
-- ============================================================================

-- Test if countries can be found
SELECT name, region, active_projects
FROM worldbank_countries
WHERE name ILIKE '%kenya%' OR name ILIKE '%mexico%'
LIMIT 5;

-- ============================================================================
-- TEST PEOPLE SEARCH
-- ============================================================================

-- Test if org chart people can be found
SELECT name, position, department
FROM worldbank_orgchart
WHERE is_active = true
AND (name ILIKE '%banga%' OR position ILIKE '%director%')
LIMIT 5;

