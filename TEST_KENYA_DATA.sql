-- =============================================================================
-- DIAGNOSTIC: Check Kenya's Data
-- =============================================================================

-- 1. Does Kenya exist in worldbank_countries?
SELECT 
    'Kenya in countries table' as check_type,
    name, 
    iso2_code, 
    region, 
    income_level,
    active_projects
FROM worldbank_countries
WHERE name ILIKE '%kenya%';

-- 2. How many projects does Kenya have in worldbank_projects?
SELECT 
    'Projects count for Kenya' as check_type,
    COUNT(*) as total_projects,
    country_name
FROM worldbank_projects
WHERE country_name ILIKE '%kenya%'
GROUP BY country_name;

-- 3. Show some Kenya projects
SELECT 
    id,
    project_name,
    country_name,
    board_approval_date,
    total_commitment
FROM worldbank_projects
WHERE country_name ILIKE '%kenya%'
ORDER BY board_approval_date DESC
LIMIT 5;

-- 4. Check if country name matches exactly
SELECT DISTINCT country_name
FROM worldbank_projects
WHERE country_name ILIKE '%kenya%'
OR country_name ILIKE '%ken%';

-- 5. Get top 10 countries by actual project count
SELECT 
    country_name,
    COUNT(*) as project_count
FROM worldbank_projects
GROUP BY country_name
ORDER BY project_count DESC
LIMIT 10;

-- =============================================================================
-- Run this in Supabase SQL Editor to diagnose the issue
-- =============================================================================

