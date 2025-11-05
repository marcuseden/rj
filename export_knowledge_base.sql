-- Export comprehensive knowledge base for ElevenLabs Agent
-- This combines speeches, projects, and World Bank data

-- Count what we have
SELECT 
    'Speeches' as content_type,
    COUNT(*) as count
FROM worldbank_documents
WHERE document_type = 'speech'

UNION ALL

SELECT 
    'Projects' as content_type,
    COUNT(*) as count
FROM worldbank_projects

UNION ALL

SELECT 
    'Countries' as content_type,
    COUNT(*) as count
FROM countries_info;

