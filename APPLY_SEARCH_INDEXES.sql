-- ============================================================================
-- QUICK APPLY: Search Optimization Indexes
-- Copy this entire file and paste into Supabase SQL Editor
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gin;

-- ============================================================================
-- COUNTRIES TABLE INDEXES
-- ============================================================================

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

CREATE INDEX IF NOT EXISTS idx_countries_projects_gin ON worldbank_countries USING gin(recent_projects);
CREATE INDEX IF NOT EXISTS idx_countries_projects_jsonb ON worldbank_countries USING gin(recent_projects jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_countries_name_trgm ON worldbank_countries USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_countries_capital_trgm ON worldbank_countries USING gin(capital_city gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_countries_sector_focus_gin ON worldbank_countries USING gin(sector_focus);
CREATE INDEX IF NOT EXISTS idx_countries_theme_focus_gin ON worldbank_countries USING gin(theme_focus);
CREATE INDEX IF NOT EXISTS idx_countries_region_active_projects ON worldbank_countries (region, active_projects DESC);
CREATE INDEX IF NOT EXISTS idx_countries_vp_name_region ON worldbank_countries (regional_vp_name, region) WHERE regional_vp_name IS NOT NULL;

-- ============================================================================
-- ORG CHART TABLE INDEXES
-- ============================================================================

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

CREATE INDEX IF NOT EXISTS idx_orgchart_name_trgm ON worldbank_orgchart USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_orgchart_position_trgm ON worldbank_orgchart USING gin(position gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_orgchart_active_level_name ON worldbank_orgchart (is_active, level, name) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_orgchart_dept_region ON worldbank_orgchart (department, region) WHERE department IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orgchart_education_gin ON worldbank_orgchart USING gin(education);

-- ============================================================================
-- ANALYZE TABLES
-- ============================================================================

ANALYZE worldbank_countries;
ANALYZE worldbank_orgchart;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
DECLARE
  v_countries_count INTEGER;
  v_people_count INTEGER;
  v_total_indexes INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_countries_count FROM worldbank_countries;
  SELECT COUNT(*) INTO v_people_count FROM worldbank_orgchart WHERE is_active = true;
  
  SELECT COUNT(*) INTO v_total_indexes 
  FROM pg_indexes 
  WHERE schemaname = 'public' 
  AND tablename IN ('worldbank_countries', 'worldbank_orgchart');
  
  RAISE NOTICE '============================================================';
  RAISE NOTICE '✅ SEARCH INDEXES APPLIED SUCCESSFULLY';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Countries: % records', v_countries_count;
  RAISE NOTICE 'People (Active): % records', v_people_count;
  RAISE NOTICE 'Total Indexes: %', v_total_indexes;
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Full-text search: ENABLED';
  RAISE NOTICE 'Fuzzy matching: ENABLED';
  RAISE NOTICE 'JSONB search: ENABLED';
  RAISE NOTICE '============================================================';
END $$;

