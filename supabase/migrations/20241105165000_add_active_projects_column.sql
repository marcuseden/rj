-- ============================================================================
-- ADD ACTIVE_PROJECTS COLUMN TO COUNTRIES TABLE
-- Created: November 5, 2025
-- Purpose: Track number of active World Bank projects per country
-- ============================================================================

-- Add the column if it doesn't exist
ALTER TABLE worldbank_countries 
ADD COLUMN IF NOT EXISTS active_projects INTEGER DEFAULT 0;

-- Add comment
COMMENT ON COLUMN worldbank_countries.active_projects IS 'Number of active World Bank projects in this country';

-- Update existing records to have 0 as default
UPDATE worldbank_countries 
SET active_projects = 0 
WHERE active_projects IS NULL;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Added active_projects column to worldbank_countries table';
END $$;

