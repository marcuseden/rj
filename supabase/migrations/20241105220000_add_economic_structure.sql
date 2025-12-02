-- Add Economic Structure & Resources Data to Countries
-- Sectoral composition, industries, natural resources, trade data

ALTER TABLE worldbank_countries ADD COLUMN IF NOT EXISTS economic_structure JSONB;
ALTER TABLE worldbank_countries ADD COLUMN IF NOT EXISTS primary_sector TEXT;
ALTER TABLE worldbank_countries ADD COLUMN IF NOT EXISTS natural_resources TEXT[];
ALTER TABLE worldbank_countries ADD COLUMN IF NOT EXISTS has_natural_resources BOOLEAN DEFAULT false;
ALTER TABLE worldbank_countries ADD COLUMN IF NOT EXISTS export_oriented BOOLEAN DEFAULT false;

-- Sectoral Composition (% of GDP)
ALTER TABLE worldbank_countries ADD COLUMN IF NOT EXISTS agriculture_pct_gdp DECIMAL;
ALTER TABLE worldbank_countries ADD COLUMN IF NOT EXISTS industry_pct_gdp DECIMAL;
ALTER TABLE worldbank_countries ADD COLUMN IF NOT EXISTS manufacturing_pct_gdp DECIMAL;
ALTER TABLE worldbank_countries ADD COLUMN IF NOT EXISTS services_pct_gdp DECIMAL;

-- Natural Resources Rents (% of GDP)
ALTER TABLE worldbank_countries ADD COLUMN IF NOT EXISTS mineral_rents_pct DECIMAL;
ALTER TABLE worldbank_countries ADD COLUMN IF NOT EXISTS oil_rents_pct DECIMAL;
ALTER TABLE worldbank_countries ADD COLUMN IF NOT EXISTS gas_rents_pct DECIMAL;
ALTER TABLE worldbank_countries ADD COLUMN IF NOT EXISTS coal_rents_pct DECIMAL;
ALTER TABLE worldbank_countries ADD COLUMN IF NOT EXISTS forest_rents_pct DECIMAL;

-- Trade
ALTER TABLE worldbank_countries ADD COLUMN IF NOT EXISTS exports_pct_gdp DECIMAL;
ALTER TABLE worldbank_countries ADD COLUMN IF NOT EXISTS imports_pct_gdp DECIMAL;
ALTER TABLE worldbank_countries ADD COLUMN IF NOT EXISTS merchandise_exports_usd DECIMAL;

-- Employment Distribution
ALTER TABLE worldbank_countries ADD COLUMN IF NOT EXISTS employment_agriculture_pct DECIMAL;
ALTER TABLE worldbank_countries ADD COLUMN IF NOT EXISTS employment_industry_pct DECIMAL;
ALTER TABLE worldbank_countries ADD COLUMN IF NOT EXISTS employment_services_pct DECIMAL;

-- Create indexes for economic queries
CREATE INDEX IF NOT EXISTS idx_countries_primary_sector ON worldbank_countries (primary_sector);
CREATE INDEX IF NOT EXISTS idx_countries_resources ON worldbank_countries USING GIN (natural_resources);
CREATE INDEX IF NOT EXISTS idx_countries_agriculture_gdp ON worldbank_countries (agriculture_pct_gdp);
CREATE INDEX IF NOT EXISTS idx_countries_industry_gdp ON worldbank_countries (industry_pct_gdp);

-- Comments
COMMENT ON COLUMN worldbank_countries.economic_structure IS 'Complete JSONB with all economic indicators, sectoral data, resources, and analysis';
COMMENT ON COLUMN worldbank_countries.primary_sector IS 'Dominant economic sector: Agriculture, Industry, or Services';
COMMENT ON COLUMN worldbank_countries.natural_resources IS 'Array of natural resources: Oil, Gas, Minerals, Coal, Forest Products';
COMMENT ON COLUMN worldbank_countries.agriculture_pct_gdp IS 'Agriculture, forestry, fishing value added (% of GDP)';
COMMENT ON COLUMN worldbank_countries.mineral_rents_pct IS 'Mineral rents (% of GDP) - indicates mining importance';

DO $$
BEGIN
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'ECONOMIC STRUCTURE COLUMNS ADDED';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Added comprehensive economic data fields:';
  RAISE NOTICE '';
  RAISE NOTICE 'Sectoral Composition:';
  RAISE NOTICE '  - Agriculture %% of GDP';
  RAISE NOTICE '  - Industry %% of GDP';
  RAISE NOTICE '  - Manufacturing %% of GDP';
  RAISE NOTICE '  - Services %% of GDP';
  RAISE NOTICE '';
  RAISE NOTICE 'Natural Resources:';
  RAISE NOTICE '  - Mineral rents %% of GDP';
  RAISE NOTICE '  - Oil rents %% of GDP';
  RAISE NOTICE '  - Gas rents %% of GDP';
  RAISE NOTICE '  - Forest rents %% of GDP';
  RAISE NOTICE '';
  RAISE NOTICE 'Trade & Employment:';
  RAISE NOTICE '  - Exports/Imports %% of GDP';
  RAISE NOTICE '  - Employment by sector';
  RAISE NOTICE '';
  RAISE NOTICE 'Next: Fetch economic data';
  RAISE NOTICE '  npx tsx scripts/fetch-country-economic-structure.ts';
  RAISE NOTICE '============================================================';
END $$;







