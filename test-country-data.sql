-- Test Country Data Loading with Economic Structure and Demographics

-- Check if economic structure columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'worldbank_countries' 
AND column_name IN (
  'primary_sector',
  'natural_resources',
  'agriculture_pct_gdp',
  'industry_pct_gdp',
  'services_pct_gdp',
  'life_expectancy',
  'infant_mortality',
  'literacy_rate',
  'unemployment_rate',
  'gdp_growth_rate',
  'access_electricity_pct',
  'access_water_pct'
)
ORDER BY column_name;

-- Sample data from a few countries with new fields
SELECT 
  name,
  region,
  population,
  primary_sector,
  agriculture_pct_gdp,
  industry_pct_gdp,
  services_pct_gdp,
  life_expectancy,
  literacy_rate,
  unemployment_rate
FROM worldbank_countries 
WHERE name IN ('United States', 'India', 'Kenya', 'Brazil', 'Germany')
ORDER BY name;

-- Count countries with economic data
SELECT 
  COUNT(*) as total_countries,
  COUNT(primary_sector) as with_primary_sector,
  COUNT(agriculture_pct_gdp) as with_agriculture_gdp,
  COUNT(life_expectancy) as with_life_expectancy,
  COUNT(literacy_rate) as with_literacy_rate
FROM worldbank_countries;






