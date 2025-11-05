-- Check what data is currently in the database

-- 1. Projects count
SELECT COUNT(*) as total_projects FROM worldbank_projects;

-- 2. Projects by size
SELECT tagged_size_category, COUNT(*) as count
FROM worldbank_projects
GROUP BY tagged_size_category
ORDER BY count DESC;

-- 3. Sample projects
SELECT id, project_name, country_name, total_commitment, tagged_size_category
FROM worldbank_projects
ORDER BY total_commitment DESC
LIMIT 10;

-- 4. Documents count
SELECT COUNT(*) as total_documents FROM worldbank_documents;

-- 5. Countries count
SELECT COUNT(*) as total_countries FROM worldbank_countries;

-- 6. Countries with indicators
SELECT COUNT(*) as countries_with_data
FROM worldbank_countries
WHERE population IS NOT NULL;

