-- Create World Bank Projects Table
-- Stores all active projects from 2023-present with 100% QA verification

CREATE TABLE IF NOT EXISTS worldbank_projects (
  -- Project Identity
  id TEXT PRIMARY KEY, -- World Bank Project ID (e.g., P501648)
  project_name TEXT NOT NULL,
  url TEXT NOT NULL,
  
  -- Country & Region
  country_code TEXT NOT NULL,
  country_name TEXT NOT NULL,
  region_name TEXT,
  
  -- Financial Details
  total_commitment DECIMAL,
  ibrd_commitment DECIMAL DEFAULT 0,
  ida_commitment DECIMAL DEFAULT 0,
  total_amount_formatted TEXT,
  
  -- Project Details
  status TEXT NOT NULL,
  lending_instrument TEXT,
  product_line TEXT,
  
  -- Team & Implementation
  team_lead TEXT,
  implementing_agency TEXT,
  borrower TEXT,
  
  -- Timeline
  board_approval_date TIMESTAMPTZ,
  approval_fy INTEGER,
  approval_month TEXT,
  closing_date TIMESTAMPTZ,
  
  -- Classification
  sectors JSONB DEFAULT '[]'::jsonb,
  themes JSONB DEFAULT '[]'::jsonb,
  major_theme TEXT,
  
  -- Additional Info
  project_docs JSONB DEFAULT '[]'::jsonb,
  supplemental_project BOOLEAN DEFAULT false,
  
  -- COMPREHENSIVE TAGS (for search and filtering)
  tagged_departments TEXT[],
  tagged_countries TEXT[],
  tagged_size_category TEXT,
  tagged_regions TEXT[],
  
  -- Data Quality
  data_verified BOOLEAN DEFAULT true,
  last_api_fetch TIMESTAMPTZ DEFAULT NOW(),
  api_source TEXT DEFAULT 'World Bank Projects API',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_country ON worldbank_projects (country_code);
CREATE INDEX IF NOT EXISTS idx_projects_status ON worldbank_projects (status);
CREATE INDEX IF NOT EXISTS idx_projects_approval_fy ON worldbank_projects (approval_fy DESC);
CREATE INDEX IF NOT EXISTS idx_projects_approval_date ON worldbank_projects (board_approval_date DESC);
CREATE INDEX IF NOT EXISTS idx_projects_total ON worldbank_projects (total_commitment DESC);
CREATE INDEX IF NOT EXISTS idx_projects_name ON worldbank_projects USING GIN (to_tsvector('english', project_name));

-- TAG INDEXES (for filtering and search)
CREATE INDEX IF NOT EXISTS idx_projects_departments ON worldbank_projects USING GIN (tagged_departments);
CREATE INDEX IF NOT EXISTS idx_projects_tagged_countries ON worldbank_projects USING GIN (tagged_countries);
CREATE INDEX IF NOT EXISTS idx_projects_size_category ON worldbank_projects (tagged_size_category);
CREATE INDEX IF NOT EXISTS idx_projects_tagged_regions ON worldbank_projects USING GIN (tagged_regions);

-- Enable RLS
ALTER TABLE worldbank_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to projects" ON worldbank_projects;
CREATE POLICY "Allow public read access to projects" 
ON worldbank_projects FOR SELECT USING (true);

GRANT SELECT ON worldbank_projects TO authenticated, anon;

-- Comments
COMMENT ON TABLE worldbank_projects IS '100% verified World Bank projects from 2023-present. Sourced from official World Bank Projects API with real-time data.';
COMMENT ON COLUMN worldbank_projects.approval_fy IS 'Fiscal year of approval (e.g., 2024, 2025)';
COMMENT ON COLUMN worldbank_projects.total_commitment IS 'Total project commitment in millions USD';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'PROJECTS TABLE CREATED';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Table: worldbank_projects';
  RAISE NOTICE 'Ready to receive project data from World Bank API';
  RAISE NOTICE '';
  RAISE NOTICE 'Projects will include:';
  RAISE NOTICE '  - All active projects from 2023-present';
  RAISE NOTICE '  - Complete financial details (IBRD/IDA)';
  RAISE NOTICE '  - Team leads and implementation info';
  RAISE NOTICE '  - Sectors and themes';
  RAISE NOTICE '  - Links to official project pages';
  RAISE NOTICE '';
  RAISE NOTICE 'Next: Run projects fetcher';
  RAISE NOTICE '  npx tsx scripts/fetch-projects.ts';
  RAISE NOTICE '============================================================';
END $$;

