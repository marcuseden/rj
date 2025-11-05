-- Add Development Indicators to Countries Table
-- Demographic and development data from World Bank Indicators API

ALTER TABLE worldbank_countries ADD COLUMN IF NOT EXISTS development_indicators JSONB;
ALTER TABLE worldbank_countries ADD COLUMN IF NOT EXISTS life_expectancy DECIMAL;
ALTER TABLE worldbank_countries ADD COLUMN IF NOT EXISTS infant_mortality DECIMAL;
ALTER TABLE worldbank_countries ADD COLUMN IF NOT EXISTS under5_mortality DECIMAL;
ALTER TABLE worldbank_countries ADD COLUMN IF NOT EXISTS literacy_rate DECIMAL;
ALTER TABLE worldbank_countries ADD COLUMN IF NOT EXISTS unemployment_rate DECIMAL;
ALTER TABLE worldbank_countries ADD COLUMN IF NOT EXISTS gdp_growth_rate DECIMAL;
ALTER TABLE worldbank_countries ADD COLUMN IF NOT EXISTS access_electricity_pct DECIMAL;
ALTER TABLE worldbank_countries ADD COLUMN IF NOT EXISTS access_water_pct DECIMAL;
ALTER TABLE worldbank_countries ADD COLUMN IF NOT EXISTS indicators_last_updated TIMESTAMPTZ;

-- Create indexes for filtering
CREATE INDEX IF NOT EXISTS idx_countries_poverty ON worldbank_countries (poverty_rate);
CREATE INDEX IF NOT EXISTS idx_countries_gdp_per_capita ON worldbank_countries (gdp_per_capita);
CREATE INDEX IF NOT EXISTS idx_countries_life_expectancy ON worldbank_countries (life_expectancy);

-- Comments
COMMENT ON COLUMN worldbank_countries.development_indicators IS 'JSONB storing all World Bank development indicators with values and years. Includes: population, GDP, GNI, poverty, health, education metrics.';
COMMENT ON COLUMN worldbank_countries.poverty_rate IS 'Poverty headcount ratio at $2.15/day (% of population)';
COMMENT ON COLUMN worldbank_countries.life_expectancy IS 'Life expectancy at birth (years)';
COMMENT ON COLUMN worldbank_countries.infant_mortality IS 'Infant mortality rate (per 1,000 live births)';

DO $$
BEGIN
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'DEVELOPMENT INDICATORS COLUMNS ADDED';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Added columns for:';
  RAISE NOTICE '  - Life Expectancy';
  RAISE NOTICE '  - Infant & Under-5 Mortality';
  RAISE NOTICE '  - Literacy Rate';
  RAISE NOTICE '  - Unemployment';
  RAISE NOTICE '  - GDP Growth';
  RAISE NOTICE '  - Access to Electricity & Water';
  RAISE NOTICE '  - Full indicators JSONB storage';
  RAISE NOTICE '';
  RAISE NOTICE 'Next: Run indicators fetcher';
  RAISE NOTICE '  npx tsx scripts/fetch-country-indicators.ts';
  RAISE NOTICE '============================================================';
END $$;

