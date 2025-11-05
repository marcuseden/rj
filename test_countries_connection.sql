-- Test if countries data exists
SELECT COUNT(*) as total_countries FROM worldbank_countries;

-- Show sample countries
SELECT name, iso2_code, region, active_projects 
FROM worldbank_countries 
LIMIT 5;

-- Check if Kenya exists
SELECT * FROM worldbank_countries WHERE name ILIKE '%kenya%';

-- Check if Mexico exists
SELECT * FROM worldbank_countries WHERE name ILIKE '%mexico%';
