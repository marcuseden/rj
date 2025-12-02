-- ============================================================================
-- QUICK DATA CHECK - Run in Supabase SQL Editor
-- ============================================================================

-- 1. ROW COUNTS
SELECT 
    'Documents' as table_name,
    COUNT(*) as total_rows
FROM worldbank_documents
UNION ALL
SELECT 
    'Countries' as table_name,
    COUNT(*) as total_rows
FROM worldbank_countries
UNION ALL
SELECT 
    'People' as table_name,
    COUNT(*) as total_rows
FROM worldbank_orgchart
WHERE is_active = true;

-- 2. TEST COUNTRY SEARCH
SELECT 
    name, 
    region, 
    active_projects,
    portfolio_value_formatted
FROM worldbank_countries
WHERE name ILIKE '%kenya%' OR name ILIKE '%mexico%' OR name ILIKE '%brazil%'
ORDER BY name;

-- 3. TEST DOCUMENT SEARCH FOR "HOSPITAL"
SELECT 
    id,
    title,
    LEFT(content, 100) as content_preview,
    tags_document_type
FROM worldbank_documents
WHERE 
    LOWER(title) LIKE '%hospital%' 
    OR LOWER(content) LIKE '%hospital%'
    OR LOWER(summary) LIKE '%hospital%'
LIMIT 10;

-- 4. TEST IF FULL-TEXT SEARCH INDEX EXISTS
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'worldbank_documents'
AND indexdef LIKE '%tsvector%';

-- 5. SAMPLE DOCUMENTS
SELECT 
    id,
    title,
    date,
    tags_document_type,
    LEFT(summary, 100) as summary_preview
FROM worldbank_documents
ORDER BY date DESC
LIMIT 5;







