-- ============================================================================
-- PERFORMANCE OPTIMIZATION: Database Indexes
-- Created: November 5, 2025
-- Purpose: Speed up queries on all tables
-- ============================================================================

-- ============================================================================
-- COUNTRIES TABLE INDEXES
-- ============================================================================

-- Primary lookup indexes
CREATE INDEX IF NOT EXISTS idx_countries_name ON worldbank_countries (name);
CREATE INDEX IF NOT EXISTS idx_countries_name_lower ON worldbank_countries (LOWER(name));
CREATE INDEX IF NOT EXISTS idx_countries_region_name ON worldbank_countries (region, name);

-- Only create indexes for columns that exist
DO $$
BEGIN
  -- Income level index
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'worldbank_countries' AND column_name = 'income_level'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_countries_income_level ON worldbank_countries (income_level);
    CREATE INDEX IF NOT EXISTS idx_countries_region_income ON worldbank_countries (region, income_level);
  END IF;

  -- Capital city search
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'worldbank_countries' AND column_name = 'capital_city'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_countries_search ON worldbank_countries USING gin(
      to_tsvector('english', name || ' ' || COALESCE(capital_city, '') || ' ' || region)
    );
  END IF;

  -- Sector focus array index
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'worldbank_countries' AND column_name = 'sector_focus'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_countries_sector_focus ON worldbank_countries USING gin(sector_focus);
  END IF;

  -- Regional VP index
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'worldbank_countries' AND column_name = 'regional_vp_name'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_countries_vp_region ON worldbank_countries (regional_vp_name, region);
  END IF;
END $$;

-- ============================================================================
-- ORG CHART TABLE INDEXES
-- ============================================================================

-- Hierarchy navigation
CREATE INDEX IF NOT EXISTS idx_orgchart_parent_id ON worldbank_orgchart (parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orgchart_level_order ON worldbank_orgchart (level, sort_order);
CREATE INDEX IF NOT EXISTS idx_orgchart_is_active ON worldbank_orgchart (is_active);

-- Search and filter
CREATE INDEX IF NOT EXISTS idx_orgchart_name_lower ON worldbank_orgchart (LOWER(name));
CREATE INDEX IF NOT EXISTS idx_orgchart_position_lower ON worldbank_orgchart (LOWER(position));
CREATE INDEX IF NOT EXISTS idx_orgchart_department ON worldbank_orgchart (department);
CREATE INDEX IF NOT EXISTS idx_orgchart_region ON worldbank_orgchart (region);

-- Full-text search
CREATE INDEX IF NOT EXISTS idx_orgchart_search ON worldbank_orgchart USING gin(
  to_tsvector('english', name || ' ' || position || ' ' || COALESCE(bio, ''))
);

-- Array fields
CREATE INDEX IF NOT EXISTS idx_orgchart_countries ON worldbank_orgchart USING gin(countries_covered);
CREATE INDEX IF NOT EXISTS idx_orgchart_regional_coverage ON worldbank_orgchart USING gin(regional_coverage);

-- Composite indexes
CREATE INDEX IF NOT EXISTS idx_orgchart_active_level ON worldbank_orgchart (is_active, level);

-- ============================================================================
-- DOCUMENTS TABLE INDEXES (if exists)
-- ============================================================================

-- Check if worldbank_documents table exists and create indexes
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'worldbank_documents') THEN
    -- Basic lookup indexes
    CREATE INDEX IF NOT EXISTS idx_docs_title ON worldbank_documents (title);
    CREATE INDEX IF NOT EXISTS idx_docs_date ON worldbank_documents (date DESC);
    CREATE INDEX IF NOT EXISTS idx_docs_type ON worldbank_documents (type);
    CREATE INDEX IF NOT EXISTS idx_docs_doc_type ON worldbank_documents (tags_document_type);
    
    -- Full-text search
    CREATE INDEX IF NOT EXISTS idx_docs_search ON worldbank_documents USING gin(
      to_tsvector('english', title || ' ' || summary || ' ' || COALESCE(content, ''))
    );
    
    -- Array fields for tags
    CREATE INDEX IF NOT EXISTS idx_docs_sectors ON worldbank_documents USING gin(tags_sectors);
    CREATE INDEX IF NOT EXISTS idx_docs_regions ON worldbank_documents USING gin(tags_regions);
    CREATE INDEX IF NOT EXISTS idx_docs_authors ON worldbank_documents USING gin(tags_authors);
    CREATE INDEX IF NOT EXISTS idx_docs_departments ON worldbank_documents USING gin(tags_departments);
    CREATE INDEX IF NOT EXISTS idx_docs_initiatives ON worldbank_documents USING gin(tags_initiatives);
    
    -- Composite indexes
    CREATE INDEX IF NOT EXISTS idx_docs_type_date ON worldbank_documents (type, date DESC);
    CREATE INDEX IF NOT EXISTS idx_docs_priority_date ON worldbank_documents (tags_priority, date DESC);
  END IF;
END $$;

-- ============================================================================
-- ANALYZE TABLES FOR QUERY PLANNER
-- ============================================================================

ANALYZE worldbank_countries;
ANALYZE worldbank_orgchart;

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'worldbank_documents') THEN
    ANALYZE worldbank_documents;
  END IF;
END $$;

-- ============================================================================
-- MATERIALIZED VIEW REFRESH
-- ============================================================================

-- Refresh materialized views if they exist
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_matviews WHERE schemaname = 'public' AND matviewname = 'worldbank_department_details') THEN
    REFRESH MATERIALIZED VIEW worldbank_department_details;
  END IF;
  
  IF EXISTS (SELECT FROM pg_matviews WHERE schemaname = 'public' AND matviewname = 'worldbank_orgchart_hierarchy') THEN
    REFRESH MATERIALIZED VIEW worldbank_orgchart_hierarchy;
  END IF;
END $$;

-- ============================================================================
-- STATISTICS
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

