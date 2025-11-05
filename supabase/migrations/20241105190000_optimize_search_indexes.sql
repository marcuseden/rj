-- ============================================================================
-- SEARCH OPTIMIZATION: Comprehensive Indexes for Search Functionality
-- Created: November 5, 2025
-- Purpose: Optimize search performance across all tables for unified search
-- ============================================================================

-- ============================================================================
-- COUNTRIES TABLE - ENHANCED SEARCH INDEXES
-- ============================================================================

-- Full-text search index for country data
DROP INDEX IF EXISTS idx_countries_search;
CREATE INDEX idx_countries_search ON worldbank_countries USING gin(
  to_tsvector('english', 
    name || ' ' || 
    COALESCE(capital_city, '') || ' ' || 
    region || ' ' || 
    COALESCE(income_level, '') || ' ' ||
    COALESCE(regional_vp_name, '')
  )
);

-- JSONB index for recent_projects search
CREATE INDEX IF NOT EXISTS idx_countries_projects_gin ON worldbank_countries USING gin(recent_projects);

-- Index for project search within JSONB
CREATE INDEX IF NOT EXISTS idx_countries_projects_jsonb ON worldbank_countries USING gin(recent_projects jsonb_path_ops);

-- Case-insensitive search indexes
CREATE INDEX IF NOT EXISTS idx_countries_name_trgm ON worldbank_countries USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_countries_capital_trgm ON worldbank_countries USING gin(capital_city gin_trgm_ops);

-- Array indexes for sector/theme search
CREATE INDEX IF NOT EXISTS idx_countries_sector_focus_gin ON worldbank_countries USING gin(sector_focus);
CREATE INDEX IF NOT EXISTS idx_countries_theme_focus_gin ON worldbank_countries USING gin(theme_focus);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_countries_region_active_projects ON worldbank_countries (region, active_projects DESC);
CREATE INDEX IF NOT EXISTS idx_countries_vp_name_region ON worldbank_countries (regional_vp_name, region) WHERE regional_vp_name IS NOT NULL;

-- ============================================================================
-- ORG CHART TABLE - ENHANCED SEARCH INDEXES
-- ============================================================================

-- Full-text search with better coverage
DROP INDEX IF EXISTS idx_orgchart_search;
CREATE INDEX idx_orgchart_search ON worldbank_orgchart USING gin(
  to_tsvector('english', 
    name || ' ' || 
    position || ' ' || 
    COALESCE(bio, '') || ' ' ||
    COALESCE(department, '') || ' ' ||
    COALESCE(region, '') || ' ' ||
    COALESCE(function, '')
  )
);

-- Trigram indexes for fuzzy/partial matching
CREATE INDEX IF NOT EXISTS idx_orgchart_name_trgm ON worldbank_orgchart USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_orgchart_position_trgm ON worldbank_orgchart USING gin(position gin_trgm_ops);

-- Better composite indexes for common search patterns
CREATE INDEX IF NOT EXISTS idx_orgchart_active_level_name ON worldbank_orgchart (is_active, level, name) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_orgchart_dept_region ON worldbank_orgchart (department, region) WHERE department IS NOT NULL;

-- Array field optimization
CREATE INDEX IF NOT EXISTS idx_orgchart_education_gin ON worldbank_orgchart USING gin(education);

-- ============================================================================
-- ENABLE EXTENSIONS IF NOT ALREADY ENABLED
-- ============================================================================

-- Enable pg_trgm for fuzzy/similarity search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enable btree_gin for better composite indexes
CREATE EXTENSION IF NOT EXISTS btree_gin;

-- ============================================================================
-- MATERIALIZED VIEW FOR SEARCH RESULTS
-- ============================================================================

-- Drop and recreate materialized view for search optimization
DROP MATERIALIZED VIEW IF EXISTS worldbank_search_index;

CREATE MATERIALIZED VIEW worldbank_search_index AS
SELECT 
  'country' AS source_type,
  id,
  name AS title,
  region || ' | ' || COALESCE(income_level, 'N/A') || ' | ' || 
    COALESCE(active_projects::TEXT, '0') || ' projects' AS summary,
  region,
  sector_focus,
  ARRAY[regional_vp_name]::TEXT[] AS authors,
  NULL::TEXT[] AS departments,
  CURRENT_DATE::TEXT AS date,
  to_tsvector('english', 
    name || ' ' || 
    COALESCE(capital_city, '') || ' ' || 
    region || ' ' || 
    COALESCE(regional_vp_name, '')
  ) AS search_vector
FROM worldbank_countries

UNION ALL

SELECT 
  'person' AS source_type,
  id,
  name AS title,
  position || 
    COALESCE(' | ' || department, '') || 
    COALESCE(' | ' || region, '') AS summary,
  COALESCE(region, 'Global') AS region,
  NULL::TEXT[] AS sector_focus,
  ARRAY[name]::TEXT[] AS authors,
  CASE WHEN department IS NOT NULL THEN ARRAY[department]::TEXT[] ELSE NULL::TEXT[] END AS departments,
  CURRENT_DATE::TEXT AS date,
  to_tsvector('english', 
    name || ' ' || 
    position || ' ' || 
    COALESCE(bio, '') || ' ' ||
    COALESCE(department, '')
  ) AS search_vector
FROM worldbank_orgchart
WHERE is_active = true;

-- Create indexes on the materialized view
CREATE INDEX idx_search_index_type ON worldbank_search_index (source_type);
CREATE INDEX idx_search_index_region ON worldbank_search_index (region);
CREATE INDEX idx_search_index_vector ON worldbank_search_index USING gin(search_vector);
CREATE INDEX idx_search_index_title_trgm ON worldbank_search_index USING gin(title gin_trgm_ops);

-- ============================================================================
-- FUNCTION TO REFRESH SEARCH INDEX
-- ============================================================================

CREATE OR REPLACE FUNCTION refresh_search_index()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW worldbank_search_index;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ANALYZE ALL TABLES
-- ============================================================================

ANALYZE worldbank_countries;
ANALYZE worldbank_orgchart;
ANALYZE worldbank_search_index;

-- ============================================================================
-- STATISTICS AND VALIDATION
-- ============================================================================

DO $$
DECLARE
  v_countries_count INTEGER;
  v_people_count INTEGER;
  v_search_index_count INTEGER;
  v_total_indexes INTEGER;
BEGIN
  -- Count records
  SELECT COUNT(*) INTO v_countries_count FROM worldbank_countries;
  SELECT COUNT(*) INTO v_people_count FROM worldbank_orgchart WHERE is_active = true;
  SELECT COUNT(*) INTO v_search_index_count FROM worldbank_search_index;
  
  -- Count total indexes
  SELECT COUNT(*) INTO v_total_indexes 
  FROM pg_indexes 
  WHERE schemaname = 'public' 
  AND tablename IN ('worldbank_countries', 'worldbank_orgchart', 'worldbank_search_index');
  
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'SEARCH OPTIMIZATION COMPLETE';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Countries: % records', v_countries_count;
  RAISE NOTICE 'People (Active): % records', v_people_count;
  RAISE NOTICE 'Search Index: % records', v_search_index_count;
  RAISE NOTICE 'Total Indexes: %', v_total_indexes;
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Extensions Enabled: pg_trgm, btree_gin';
  RAISE NOTICE 'Full-text search indexes created';
  RAISE NOTICE 'Trigram indexes for fuzzy matching created';
  RAISE NOTICE 'JSONB indexes for project search created';
  RAISE NOTICE 'Materialized view for search optimization created';
  RAISE NOTICE '============================================================';
END $$;

