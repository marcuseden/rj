-- ============================================================================
-- COMPLETE PERFORMANCE INDEXES - Run in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- COUNTRIES TABLE INDEXES
-- ============================================================================

-- Basic lookup indexes (already created, but safe to run again)
CREATE INDEX IF NOT EXISTS idx_countries_name ON worldbank_countries (name);
CREATE INDEX IF NOT EXISTS idx_countries_name_lower ON worldbank_countries (LOWER(name));
CREATE INDEX IF NOT EXISTS idx_countries_region_name ON worldbank_countries (region, name);
CREATE INDEX IF NOT EXISTS idx_countries_income_level ON worldbank_countries (income_level);
CREATE INDEX IF NOT EXISTS idx_countries_region_income ON worldbank_countries (region, income_level);

-- Additional performance indexes
CREATE INDEX IF NOT EXISTS idx_countries_iso2 ON worldbank_countries (iso2_code);
CREATE INDEX IF NOT EXISTS idx_countries_iso3 ON worldbank_countries (iso3_code);
CREATE INDEX IF NOT EXISTS idx_countries_capital ON worldbank_countries (capital_city);
CREATE INDEX IF NOT EXISTS idx_countries_vp ON worldbank_countries (regional_vp_name);

-- Full-text search index for countries
CREATE INDEX IF NOT EXISTS idx_countries_search ON worldbank_countries 
USING gin(to_tsvector('english', 
  name || ' ' || 
  COALESCE(capital_city, '') || ' ' || 
  region
));

-- ============================================================================
-- ORG CHART TABLE INDEXES
-- ============================================================================

-- Basic indexes (already created)
CREATE INDEX IF NOT EXISTS idx_orgchart_parent_id ON worldbank_orgchart (parent_id) 
WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orgchart_level_order ON worldbank_orgchart (level, sort_order);
CREATE INDEX IF NOT EXISTS idx_orgchart_is_active ON worldbank_orgchart (is_active);
CREATE INDEX IF NOT EXISTS idx_orgchart_active_level ON worldbank_orgchart (is_active, level);

-- Additional search and filter indexes
CREATE INDEX IF NOT EXISTS idx_orgchart_name_lower ON worldbank_orgchart (LOWER(name));
CREATE INDEX IF NOT EXISTS idx_orgchart_position_lower ON worldbank_orgchart (LOWER(position));
CREATE INDEX IF NOT EXISTS idx_orgchart_department ON worldbank_orgchart (department);
CREATE INDEX IF NOT EXISTS idx_orgchart_region ON worldbank_orgchart (region);
CREATE INDEX IF NOT EXISTS idx_orgchart_id ON worldbank_orgchart (id);

-- Full-text search for org chart
CREATE INDEX IF NOT EXISTS idx_orgchart_search ON worldbank_orgchart 
USING gin(to_tsvector('english', 
  name || ' ' || 
  position || ' ' || 
  COALESCE(bio, '')
));

-- Array indexes for org chart
CREATE INDEX IF NOT EXISTS idx_orgchart_countries ON worldbank_orgchart 
USING gin(countries_covered) 
WHERE countries_covered IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orgchart_regional_coverage ON worldbank_orgchart 
USING gin(regional_coverage) 
WHERE regional_coverage IS NOT NULL;

-- ============================================================================
-- ANALYZE TABLES FOR QUERY PLANNER
-- ============================================================================

ANALYZE worldbank_countries;
ANALYZE worldbank_orgchart;

-- ============================================================================
-- REFRESH MATERIALIZED VIEWS (if they exist)
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_matviews 
    WHERE schemaname = 'public' 
    AND matviewname = 'worldbank_department_details'
  ) THEN
    REFRESH MATERIALIZED VIEW worldbank_department_details;
    RAISE NOTICE 'Refreshed worldbank_department_details';
  END IF;
  
  IF EXISTS (
    SELECT FROM pg_matviews 
    WHERE schemaname = 'public' 
    AND matviewname = 'worldbank_orgchart_hierarchy'
  ) THEN
    REFRESH MATERIALIZED VIEW worldbank_orgchart_hierarchy;
    RAISE NOTICE 'Refreshed worldbank_orgchart_hierarchy';
  END IF;
END $$;

-- ============================================================================
-- STATISTICS & VERIFICATION
-- ============================================================================

DO $$
DECLARE
  v_countries_count INTEGER;
  v_orgchart_count INTEGER;
  v_countries_indexes INTEGER;
  v_orgchart_indexes INTEGER;
BEGIN
  -- Count records
  SELECT COUNT(*) INTO v_countries_count FROM worldbank_countries;
  SELECT COUNT(*) INTO v_orgchart_count FROM worldbank_orgchart;
  
  -- Count indexes
  SELECT COUNT(*) INTO v_countries_indexes 
  FROM pg_indexes 
  WHERE schemaname = 'public' AND tablename = 'worldbank_countries';
  
  SELECT COUNT(*) INTO v_orgchart_indexes 
  FROM pg_indexes 
  WHERE schemaname = 'public' AND tablename = 'worldbank_orgchart';
  
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'PERFORMANCE OPTIMIZATION COMPLETE';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Countries: % records, % indexes', v_countries_count, v_countries_indexes;
  RAISE NOTICE 'Org Chart: % records, % indexes', v_orgchart_count, v_orgchart_indexes;
  RAISE NOTICE '============================================================';
END $$;

-- Final verification query
SELECT 
  'All indexes created successfully!' AS status,
  (SELECT COUNT(*) FROM worldbank_countries) AS countries_count,
  (SELECT COUNT(*) FROM worldbank_orgchart) AS orgchart_count,
  (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'worldbank_countries') AS countries_indexes,
  (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'worldbank_orgchart') AS orgchart_indexes;

