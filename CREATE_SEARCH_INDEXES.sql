-- =============================================================================
-- CREATE SEARCH INDEXES FOR PROJECTS, COUNTRIES, DOCUMENTS
-- =============================================================================
-- Simple version - just creates the indexes without complex reporting
-- =============================================================================

-- PROJECTS INDEXES
-- =============================================================================

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


-- COUNTRIES INDEXES
-- =============================================================================

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


-- DOCUMENTS INDEXES
-- =============================================================================

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


-- UPDATE STATISTICS
-- =============================================================================

ANALYZE worldbank_projects;
ANALYZE worldbank_countries;
ANALYZE worldbank_documents;


-- SHOW RESULTS
-- =============================================================================

SELECT 'INDEXES CREATED SUCCESSFULLY' as status;

-- Show index count per table
SELECT 
    'worldbank_projects' as table_name,
    COUNT(*) as index_count
FROM pg_indexes
WHERE tablename = 'worldbank_projects' AND schemaname = 'public'

UNION ALL

SELECT 
    'worldbank_countries' as table_name,
    COUNT(*) as index_count
FROM pg_indexes
WHERE tablename = 'worldbank_countries' AND schemaname = 'public'

UNION ALL

SELECT 
    'worldbank_documents' as table_name,
    COUNT(*) as index_count
FROM pg_indexes
WHERE tablename = 'worldbank_documents' AND schemaname = 'public';

-- Show table row counts
SELECT 
    'worldbank_projects' as table_name,
    COUNT(*) as row_count
FROM worldbank_projects

UNION ALL

SELECT 
    'worldbank_countries' as table_name,
    COUNT(*) as row_count
FROM worldbank_countries

UNION ALL

SELECT 
    'worldbank_documents' as table_name,
    COUNT(*) as row_count
FROM worldbank_documents;

