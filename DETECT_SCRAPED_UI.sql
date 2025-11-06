-- =============================================================================
-- DETECT DOCUMENTS WITH SCRAPED UI/NAVIGATION ELEMENTS
-- =============================================================================
-- Finds documents that contain website UI instead of actual content
-- These need cleaning or deletion
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'DETECTING SCRAPED UI ELEMENTS IN DOCUMENTS';
    RAISE NOTICE '=============================================================================';
END $$;

-- Show summary statistics
SELECT 
    'Total Documents' as category,
    COUNT(*) as count,
    '100%' as percentage
FROM worldbank_documents

UNION ALL

SELECT 
    'With UI Contamination' as category,
    COUNT(DISTINCT d.id) as count,
    ROUND(COUNT(DISTINCT d.id) * 100.0 / (SELECT COUNT(*) FROM worldbank_documents), 1)::text || '%' as percentage
FROM worldbank_documents d
WHERE d.content ILIKE '%Will you take two minutes%'
   OR d.content ILIKE '%Working for a World Free of Poverty%'
   OR d.content ILIKE '%Esta página em:%'
   OR d.content ILIKE '%Skip to Main Navigation%'
   OR d.content ILIKE '%World Bank Group. All Rights Reserved%'
   OR d.content ILIKE '%This site uses cookies%'

UNION ALL

SELECT 
    'Severe (mostly UI)' as category,
    COUNT(DISTINCT d.id) as count,
    ROUND(COUNT(DISTINCT d.id) * 100.0 / (SELECT COUNT(*) FROM worldbank_documents), 1)::text || '%' as percentage
FROM worldbank_documents d
WHERE LENGTH(d.content) < 2000
  AND (
      d.content ILIKE '%Will you take two minutes%'
      OR d.content ILIKE '%Working for a World Free of Poverty%'
      OR d.content ILIKE '%Esta página em:%'
  );

-- Show contamination by category
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'Contamination by pattern type:';
END $$;

SELECT 
    'Feedback Survey' as ui_type,
    COUNT(DISTINCT id) as documents
FROM worldbank_documents
WHERE content ILIKE '%Will you take two minutes%'
   OR content ILIKE '%Thank you for participating in this survey%'

UNION ALL

SELECT 
    'Site Header' as ui_type,
    COUNT(DISTINCT id) as documents
FROM worldbank_documents
WHERE content ILIKE '%Working for a World Free of Poverty%'
   OR content ILIKE '%World Bank Logo%'

UNION ALL

SELECT 
    'Language Selector' as ui_type,
    COUNT(DISTINCT id) as documents
FROM worldbank_documents
WHERE content ILIKE '%Esta página em:%'

UNION ALL

SELECT 
    'Navigation Menu' as ui_type,
    COUNT(DISTINCT id) as documents
FROM worldbank_documents
WHERE content ILIKE '%Skip to Main Navigation%'
   OR content ILIKE '%Trending Data%'

UNION ALL

SELECT 
    'Footer' as ui_type,
    COUNT(DISTINCT id) as documents
FROM worldbank_documents
WHERE content ILIKE '%World Bank Group. All Rights Reserved%'
   OR content ILIKE '%Site Accessibility%'
   OR content ILIKE '%Privacy Notice%'
   OR content ILIKE '%Scam Alert%'

UNION ALL

SELECT 
    'Cookie Notice' as ui_type,
    COUNT(DISTINCT id) as documents
FROM worldbank_documents
WHERE content ILIKE '%This site uses cookies%'
ORDER BY documents DESC;

-- Show examples
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'EXAMPLES OF CONTAMINATED DOCUMENTS';
    RAISE NOTICE '=============================================================================';
END $$;

WITH contaminated_docs AS (
    SELECT DISTINCT
        d.id,
        d.title,
        d.url,
        LENGTH(d.content) as content_length,
        COUNT(*) OVER (PARTITION BY d.id) as pattern_count
    FROM worldbank_documents d
    WHERE 
        d.content ILIKE '%Will you take two minutes%'
        OR d.content ILIKE '%Working for a World Free of Poverty%'
        OR d.content ILIKE '%Esta página em:%'
        OR d.content ILIKE '%Skip to Main Navigation%'
        OR d.content ILIKE '%World Bank Group. All Rights Reserved%'
        OR d.content ILIKE '%This site uses cookies%'
)
SELECT 
    id,
    LEFT(title, 60) as title,
    pattern_count as ui_elements_found,
    content_length as content_chars,
    CASE 
        WHEN content_length < 1000 THEN '❌ Mostly UI'
        WHEN content_length < 5000 THEN '⚠️  Mixed'
        ELSE '✅ Mostly Content'
    END as quality
FROM contaminated_docs
ORDER BY pattern_count DESC, content_length ASC
LIMIT 15;

-- Calculate severity
DO $$
DECLARE
    total_docs INTEGER;
    contaminated_count INTEGER;
    severe_count INTEGER;
    contamination_pct NUMERIC;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'SEVERITY ASSESSMENT';
    RAISE NOTICE '=============================================================================';
    
    SELECT COUNT(*) INTO total_docs FROM worldbank_documents;
    
    SELECT COUNT(DISTINCT id) INTO contaminated_count
    FROM worldbank_documents
    WHERE content ILIKE '%Will you take two minutes%'
        OR content ILIKE '%Working for a World Free of Poverty%'
        OR content ILIKE '%Esta página em:%'
        OR content ILIKE '%Skip to Main Navigation%'
        OR content ILIKE '%World Bank Group. All Rights Reserved%';
    
    -- Severe: Short documents that are mostly UI
    SELECT COUNT(DISTINCT id) INTO severe_count
    FROM worldbank_documents
    WHERE LENGTH(content) < 2000
        AND (
            content ILIKE '%Will you take two minutes%'
            OR content ILIKE '%Working for a World Free of Poverty%'
            OR content ILIKE '%Esta página em:%'
        );
    
    contamination_pct := ROUND(contaminated_count * 100.0 / total_docs, 1);
    
    RAISE NOTICE '';
    RAISE NOTICE '📊 Numbers:';
    RAISE NOTICE '   Total documents: %', total_docs;
    RAISE NOTICE '   Contaminated: % (%% of total)', contaminated_count, contamination_pct;
    RAISE NOTICE '   Severely contaminated: % (mostly UI, little content)', severe_count;
    RAISE NOTICE '';
    
    IF contamination_pct > 50 THEN
        RAISE NOTICE '🚨 CRITICAL: Over 50%% of documents have UI contamination!';
        RAISE NOTICE '   Recommendation: Re-scrape with better content extraction';
    ELSIF contamination_pct > 25 THEN
        RAISE NOTICE '⚠️  WARNING: Over 25%% of documents have UI contamination';
        RAISE NOTICE '   Recommendation: Clean up existing documents';
    ELSIF contamination_pct > 10 THEN
        RAISE NOTICE '⚠️  MODERATE: Over 10%% of documents have UI contamination';
        RAISE NOTICE '   Recommendation: Clean worst offenders';
    ELSE
        RAISE NOTICE '✅ GOOD: Less than 10%% contamination';
        RAISE NOTICE '   Recommendation: Minor cleanup needed';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'RECOMMENDATIONS';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Action Items:';
    RAISE NOTICE '';
    RAISE NOTICE '1. DELETE severely contaminated documents (% docs)', severe_count;
    RAISE NOTICE '   These are mostly UI with little content';
    RAISE NOTICE '';
    RAISE NOTICE '2. CLEAN moderately contaminated (% docs)', contaminated_count - severe_count;
    RAISE NOTICE '   Strip UI elements, keep actual content';
    RAISE NOTICE '';
    RAISE NOTICE '3. IMPROVE scraping for future documents';
    RAISE NOTICE '   • Use better CSS selectors';
    RAISE NOTICE '   • Extract only article/main content';
    RAISE NOTICE '   • Skip navigation/footer elements';
    RAISE NOTICE '';
    RAISE NOTICE '=============================================================================';
END $$;

-- Generate cleanup suggestions
SELECT 
    '🗑️  Documents to DELETE (mostly UI, <2000 chars):' as recommendation,
    COUNT(*) as count
FROM worldbank_documents
WHERE LENGTH(content) < 2000
    AND (
        content ILIKE '%Will you take two minutes%'
        OR content ILIKE '%Working for a World Free of Poverty%'
        OR content ILIKE '%Esta página em:%'
    )

UNION ALL

SELECT 
    '🧹 Documents to CLEAN (mixed content, >2000 chars):' as recommendation,
    COUNT(*) as count
FROM worldbank_documents
WHERE LENGTH(content) >= 2000
    AND (
        content ILIKE '%Will you take two minutes%'
        OR content ILIKE '%Working for a World Free of Poverty%'
        OR content ILIKE '%Esta página em:%'
        OR content ILIKE '%World Bank Group. All Rights Reserved%'
    );

