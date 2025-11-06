-- =============================================================================
-- CHECK FOR INVALID DOCUMENT URLS
-- =============================================================================
-- This script identifies documents with obviously invalid URLs
-- Run this to see how many documents need cleanup
-- =============================================================================

-- 1. OVERVIEW - Count documents by URL status
-- =============================================================================
DO $$
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'DOCUMENT URL STATUS CHECK';
    RAISE NOTICE '=============================================================================';
END $$;

SELECT 
    'Total Documents' as category,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM worldbank_documents), 1) as percentage
FROM worldbank_documents

UNION ALL

SELECT 
    'Missing URL' as category,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM worldbank_documents), 1) as percentage
FROM worldbank_documents
WHERE url IS NULL OR url = ''

UNION ALL

SELECT 
    'Contains "999999" (Placeholder)' as category,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM worldbank_documents), 1) as percentage
FROM worldbank_documents
WHERE url LIKE '%999999%'

UNION ALL

SELECT 
    'Contains "placeholder"' as category,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM worldbank_documents), 1) as percentage
FROM worldbank_documents
WHERE url ILIKE '%placeholder%'

UNION ALL

SELECT 
    'Contains "000000"' as category,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM worldbank_documents), 1) as percentage
FROM worldbank_documents
WHERE url LIKE '%000000%'

UNION ALL

SELECT 
    'Invalid Patterns (Any of above)' as category,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM worldbank_documents), 1) as percentage
FROM worldbank_documents
WHERE url IS NULL 
   OR url = ''
   OR url LIKE '%999999%'
   OR url ILIKE '%placeholder%'
   OR url LIKE '%000000%'

UNION ALL

SELECT 
    'Potentially Valid URLs' as category,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM worldbank_documents), 1) as percentage
FROM worldbank_documents
WHERE url IS NOT NULL 
  AND url != ''
  AND url NOT LIKE '%999999%'
  AND url NOT ILIKE '%placeholder%'
  AND url NOT LIKE '%000000%'
ORDER BY count DESC;

-- 2. SHOW EXAMPLES OF INVALID DOCUMENTS
-- =============================================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'EXAMPLES OF DOCUMENTS WITH INVALID URLS';
    RAISE NOTICE '=============================================================================';
END $$;

-- Documents with "999999" in URL
SELECT 
    '🚫 PLACEHOLDER URL (999999)' as issue,
    id,
    LEFT(title, 60) as title_preview,
    url
FROM worldbank_documents
WHERE url LIKE '%999999%'
LIMIT 5;

-- Documents with no URL but have content
SELECT 
    '📝 MISSING URL (but has content)' as issue,
    id,
    LEFT(title, 60) as title_preview,
    CASE 
        WHEN LENGTH(content) > 100 THEN 'Has content (' || LENGTH(content) || ' chars)'
        WHEN content IS NOT NULL THEN 'Has short content'
        ELSE 'No content'
    END as content_status
FROM worldbank_documents
WHERE (url IS NULL OR url = '')
  AND content IS NOT NULL
LIMIT 5;

-- Documents with no URL and no content
SELECT 
    '❌ MISSING URL & CONTENT' as issue,
    id,
    LEFT(title, 60) as title_preview,
    'Should probably delete' as recommendation
FROM worldbank_documents
WHERE (url IS NULL OR url = '')
  AND (content IS NULL OR content = '')
LIMIT 5;

-- 3. CHECK CONTENT AVAILABILITY
-- =============================================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'CONTENT AVAILABILITY CHECK';
    RAISE NOTICE '=============================================================================';
END $$;

SELECT 
    CASE 
        WHEN url IS NULL OR url = '' THEN 'Missing URL'
        WHEN url LIKE '%999999%' OR url ILIKE '%placeholder%' THEN 'Invalid URL'
        ELSE 'Valid URL'
    END as url_status,
    CASE 
        WHEN content IS NOT NULL AND LENGTH(content) > 500 THEN 'Has Good Content'
        WHEN content IS NOT NULL AND LENGTH(content) > 0 THEN 'Has Short Content'
        ELSE 'No Content'
    END as content_status,
    COUNT(*) as count
FROM worldbank_documents
GROUP BY url_status, content_status
ORDER BY url_status, content_status;

-- 4. RECOMMENDATIONS
-- =============================================================================
DO $$
DECLARE
    delete_candidates INTEGER;
    keep_despite_url INTEGER;
    total_invalid_urls INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'RECOMMENDATIONS';
    RAISE NOTICE '=============================================================================';
    
    -- Count documents to delete (no URL, no content)
    SELECT COUNT(*) INTO delete_candidates
    FROM worldbank_documents
    WHERE (url IS NULL OR url = '' OR url LIKE '%999999%' OR url ILIKE '%placeholder%')
      AND (content IS NULL OR LENGTH(content) < 100);
    
    -- Count documents to keep despite invalid URL (has content)
    SELECT COUNT(*) INTO keep_despite_url
    FROM worldbank_documents
    WHERE (url IS NULL OR url = '' OR url LIKE '%999999%' OR url ILIKE '%placeholder%')
      AND content IS NOT NULL 
      AND LENGTH(content) >= 100;
    
    -- Total invalid URLs
    SELECT COUNT(*) INTO total_invalid_urls
    FROM worldbank_documents
    WHERE url IS NULL OR url = '' OR url LIKE '%999999%' OR url ILIKE '%placeholder%';
    
    RAISE NOTICE '';
    RAISE NOTICE '📊 SUMMARY:';
    RAISE NOTICE '   Total documents with invalid URLs: %', total_invalid_urls;
    RAISE NOTICE '';
    RAISE NOTICE '✅ KEEP (% documents):', keep_despite_url;
    RAISE NOTICE '   These have invalid URLs but good content';
    RAISE NOTICE '   The content is the source of truth';
    RAISE NOTICE '';
    RAISE NOTICE '🗑️  CONSIDER DELETING (% documents):', delete_candidates;
    RAISE NOTICE '   These have invalid URLs AND no/minimal content';
    RAISE NOTICE '   Low value to keep in database';
    RAISE NOTICE '';
    
    IF delete_candidates > 0 THEN
        RAISE NOTICE '💡 NEXT STEP:';
        RAISE NOTICE '   Run the Python verification script:';
        RAISE NOTICE '   python3 scripts/verify_document_urls.py';
        RAISE NOTICE '';
        RAISE NOTICE '   This will:';
        RAISE NOTICE '   • Check each URL to see if it actually returns 404';
        RAISE NOTICE '   • Generate a cleanup SQL script';
        RAISE NOTICE '   • Save a detailed report';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '=============================================================================';
END $$;

-- 5. GENERATE LIST OF IDS TO POTENTIALLY DELETE
-- =============================================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'Documents that could be safely deleted:';
    RAISE NOTICE '(Invalid URL + No meaningful content)';
    RAISE NOTICE '';
END $$;

SELECT 
    id,
    LEFT(title, 70) as title,
    COALESCE(url, 'NULL') as url,
    COALESCE(LENGTH(content)::text, '0') || ' chars' as content_length
FROM worldbank_documents
WHERE (url IS NULL OR url = '' OR url LIKE '%999999%' OR url ILIKE '%placeholder%')
  AND (content IS NULL OR LENGTH(content) < 100)
ORDER BY id
LIMIT 20;

-- Final message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE '✅ ANALYSIS COMPLETE';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE '';
    RAISE NOTICE '📝 What to do next:';
    RAISE NOTICE '';
    RAISE NOTICE '1. Review the counts above';
    RAISE NOTICE '2. For detailed verification, run:';
    RAISE NOTICE '   python3 scripts/verify_document_urls.py';
    RAISE NOTICE '';
    RAISE NOTICE '3. The Python script will:';
    RAISE NOTICE '   • Actually check each URL (HEAD request)';
    RAISE NOTICE '   • Identify real 404s vs timeouts';
    RAISE NOTICE '   • Generate cleanup SQL automatically';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  Don''t delete documents with good content!';
    RAISE NOTICE '   Even if the URL is broken, the content is valuable.';
    RAISE NOTICE '';
    RAISE NOTICE '=============================================================================';
END $$;

