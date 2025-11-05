-- Check All Database Indexes Across All Tables

-- 1. List all indexes
SELECT 
    schemaname,
    tablename as table_name,
    indexname as index_name,
    indexdef as index_definition
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('worldbank_projects', 'worldbank_countries', 'worldbank_documents', 'worldbank_orgchart')
ORDER BY tablename, indexname;

-- 2. Check index usage statistics
SELECT 
    schemaname,
    relname as table_name,
    indexrelname as index_name,
    idx_scan as scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
AND relname IN ('worldbank_projects', 'worldbank_countries', 'worldbank_documents', 'worldbank_orgchart')
ORDER BY idx_scan DESC;

-- 3. Count indexes per table
SELECT 
    tablename as table_name,
    COUNT(*) as index_count
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('worldbank_projects', 'worldbank_countries', 'worldbank_documents', 'worldbank_orgchart')
GROUP BY tablename
ORDER BY index_count DESC;

-- 4. Table sizes and row counts
SELECT 
    'worldbank_projects' as table_name,
    pg_size_pretty(pg_total_relation_size('worldbank_projects')) AS total_size,
    (SELECT COUNT(*) FROM worldbank_projects) as row_count
UNION ALL
SELECT 
    'worldbank_countries' as table_name,
    pg_size_pretty(pg_total_relation_size('worldbank_countries')) AS total_size,
    (SELECT COUNT(*) FROM worldbank_countries) as row_count
UNION ALL
SELECT 
    'worldbank_documents' as table_name,
    pg_size_pretty(pg_total_relation_size('worldbank_documents')) AS total_size,
    (SELECT COUNT(*) FROM worldbank_documents) as row_count
UNION ALL
SELECT 
    'worldbank_orgchart' as table_name,
    pg_size_pretty(pg_total_relation_size('worldbank_orgchart')) AS total_size,
    (SELECT COUNT(*) FROM worldbank_orgchart) as row_count;

