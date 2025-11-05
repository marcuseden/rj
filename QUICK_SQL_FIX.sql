-- Quick SQL to run in Supabase Dashboard
-- Just copy this entire block and run it

-- Add active_projects column
ALTER TABLE worldbank_countries 
ADD COLUMN IF NOT EXISTS active_projects INTEGER DEFAULT 0;

-- Update existing records
UPDATE worldbank_countries 
SET active_projects = 0 
WHERE active_projects IS NULL;

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_countries_name ON worldbank_countries (name);
CREATE INDEX IF NOT EXISTS idx_countries_region_name ON worldbank_countries (region, name);
CREATE INDEX IF NOT EXISTS idx_countries_income_level ON worldbank_countries (income_level);
CREATE INDEX IF NOT EXISTS idx_countries_region_income ON worldbank_countries (region, income_level);

-- Org chart indexes
CREATE INDEX IF NOT EXISTS idx_orgchart_level_order ON worldbank_orgchart (level, sort_order);
CREATE INDEX IF NOT EXISTS idx_orgchart_is_active ON worldbank_orgchart (is_active);
CREATE INDEX IF NOT EXISTS idx_orgchart_parent_id ON worldbank_orgchart (parent_id) WHERE parent_id IS NOT NULL;

-- Analyze tables
ANALYZE worldbank_countries;
ANALYZE worldbank_orgchart;

-- Verify
SELECT 'Database optimization complete!' AS status,
       COUNT(*) AS countries_count
FROM worldbank_countries;

