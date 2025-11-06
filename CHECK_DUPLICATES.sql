-- =============================================================================
-- CHECK FOR DUPLICATE DOCUMENTS
-- =============================================================================
-- Finds documents with identical or very similar content
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'DUPLICATE DETECTION';
    RAISE NOTICE '=============================================================================';
END $$;

-- 1. Find exact content duplicates
SELECT 
    '❌ EXACT DUPLICATES' as issue,
    content,
    COUNT(*) as duplicate_count,
    STRING_AGG(id, ', ' ORDER BY id) as document_ids
FROM worldbank_documents
WHERE content IS NOT NULL
GROUP BY content
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC
LIMIT 10;

-- 2. Find title + length duplicates (same title and same content length)
SELECT 
    '⚠️ SAME TITLE + LENGTH' as issue,
    title,
    LENGTH(content) as content_length,
    COUNT(*) as duplicate_count,
    STRING_AGG(id, ', ' ORDER BY id) as document_ids
FROM worldbank_documents
WHERE content IS NOT NULL
GROUP BY title, LENGTH(content)
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC
LIMIT 10;

-- 3. Show the suspicious 619-character documents
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'SUSPICIOUS 619-CHARACTER DOCUMENTS';
    RAISE NOTICE '=============================================================================';
END $$;

SELECT 
    id,
    title,
    LENGTH(content) as chars,
    LEFT(content, 150) as content_preview
FROM worldbank_documents
WHERE LENGTH(content) = 619
ORDER BY id
LIMIT 10;

-- 4. Statistics on content length patterns
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'Common content lengths (might indicate templates):';
END $$;

SELECT 
    LENGTH(content) as exact_length,
    COUNT(*) as documents,
    CASE 
        WHEN COUNT(*) > 10 THEN '🚨 Suspicious (many docs with exact same length)'
        WHEN COUNT(*) > 5 THEN '⚠️ Check (multiple docs with same length)'
        ELSE '✅ OK'
    END as status
FROM worldbank_documents
WHERE content IS NOT NULL
GROUP BY LENGTH(content)
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC
LIMIT 20;

-- 5. Check for template patterns in content
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'TEMPLATE PATTERN DETECTION';
    RAISE NOTICE '=============================================================================';
END $$;

SELECT 
    'Contains template markers' as pattern_type,
    COUNT(*) as documents
FROM worldbank_documents
WHERE content ILIKE '%[%]%'
   OR content ILIKE '%{%}%'
   OR content ILIKE '%<template>%'
   OR content ILIKE '%placeholder%'

UNION ALL

SELECT 
    'Starts with generic phrase' as pattern_type,
    COUNT(*) as documents
FROM worldbank_documents
WHERE content ILIKE 'This document%'
   OR content ILIKE 'This report%'
   OR content ILIKE 'This paper%'
   OR content ILIKE 'This study%'

UNION ALL

SELECT 
    'Very short "content" (100-200 chars)' as pattern_type,
    COUNT(*) as documents
FROM worldbank_documents
WHERE LENGTH(content) BETWEEN 100 AND 200;

-- 6. Detailed analysis of validated documents
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'VALIDATED DOCUMENTS ANALYSIS';
    RAISE NOTICE '=============================================================================';
END $$;

SELECT 
    LENGTH(content) as content_length,
    COUNT(*) as documents,
    COUNT(DISTINCT title) as unique_titles,
    COUNT(DISTINCT content) as unique_content,
    ROUND(COUNT(DISTINCT content) * 100.0 / COUNT(*), 1) as pct_unique
FROM worldbank_documents
WHERE id LIKE 'wb-validated-%'
GROUP BY LENGTH(content)
ORDER BY COUNT(*) DESC
LIMIT 10;

-- 7. Show actual content of some validated docs
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'SAMPLE VALIDATED DOCUMENT CONTENT';
    RAISE NOTICE '=============================================================================';
END $$;

SELECT 
    id,
    title,
    content,
    url
FROM worldbank_documents
WHERE id LIKE 'wb-validated-%'
  AND LENGTH(content) = 619
ORDER BY id
LIMIT 3;

-- 8. Compare API vs Validated quality
SELECT 
    'API Documents' as source,
    COUNT(*) as total,
    COUNT(DISTINCT content) as unique_content,
    ROUND(COUNT(DISTINCT content) * 100.0 / COUNT(*), 1) as pct_unique
FROM worldbank_documents
WHERE id LIKE 'wb-api-%'

UNION ALL

SELECT 
    'Validated Documents' as source,
    COUNT(*) as total,
    COUNT(DISTINCT content) as unique_content,
    ROUND(COUNT(DISTINCT content) * 100.0 / COUNT(*), 1) as pct_unique
FROM worldbank_documents
WHERE id LIKE 'wb-validated-%'

UNION ALL

SELECT 
    'Numeric ID Documents' as source,
    COUNT(*) as total,
    COUNT(DISTINCT content) as unique_content,
    ROUND(COUNT(DISTINCT content) * 100.0 / COUNT(*), 1) as pct_unique
FROM worldbank_documents
WHERE id ~ '^\d+$';

-- Summary message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'RECOMMENDATIONS';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Based on the analysis above:';
    RAISE NOTICE '';
    RAISE NOTICE '1. DELETE exact duplicates (keep only 1 of each)';
    RAISE NOTICE '2. DELETE documents with no real content';
    RAISE NOTICE '3. CHECK if validated documents are actually useful';
    RAISE NOTICE '4. Consider keeping only documents with unique content';
    RAISE NOTICE '';
    RAISE NOTICE '=============================================================================';
END $$;

