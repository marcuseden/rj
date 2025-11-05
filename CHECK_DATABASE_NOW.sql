-- Quick check: How many projects are in database RIGHT NOW?

SELECT COUNT(*) as total_projects FROM worldbank_projects;

-- Show recent additions
SELECT id, project_name, country_name, total_commitment, created_at
FROM worldbank_projects
ORDER BY created_at DESC
LIMIT 20;

-- Count by size
SELECT tagged_size_category, COUNT(*) as count
FROM worldbank_projects
WHERE tagged_size_category IS NOT NULL
GROUP BY tagged_size_category
ORDER BY count DESC;

