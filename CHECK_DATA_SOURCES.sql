-- =============================================================================
-- CHECK DATA SOURCES - Where did your documents come from?
-- =============================================================================
-- Identifies which documents are from official API vs scraped/manual sources
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'DATA SOURCE ANALYSIS';
    RAISE NOTICE '=============================================================================';
END $$;

-- 1. Analyze ID patterns to identify sources
SELECT 
    CASE 
        WHEN id LIKE 'wb-api-%' THEN '🌐 World Bank API'
        WHEN id LIKE 'wb-validated-%' THEN '✅ Manually Validated'
        WHEN id LIKE 'wb-scraped-%' THEN '🕷️ Web Scraped'
        WHEN id ~ '^\d+$' THEN '🔢 Numeric ID (likely API)'
        ELSE '❓ Unknown Source'
    END as data_source,
    COUNT(*) as documents,
    ROUND(AVG(LENGTH(content))::numeric, 0) as avg_content_length,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM worldbank_documents), 1)::text || '%' as percentage
FROM worldbank_documents
GROUP BY data_source
ORDER BY COUNT(*) DESC;

-- 2. Check what columns exist
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'Available columns in worldbank_documents:';
END $$;

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'worldbank_documents'
  AND column_name IN ('source_reference', 'scraped_at', 'source_type', 'metadata')
ORDER BY column_name;

-- 3. Quality comparison by source
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'QUALITY BY DATA SOURCE';
    RAISE NOTICE '=============================================================================';
END $$;

SELECT 
    CASE 
        WHEN id LIKE 'wb-api-%' THEN 'API'
        WHEN id LIKE 'wb-validated-%' THEN 'Validated'
        WHEN id ~ '^\d+$' THEN 'Numeric'
        ELSE 'Other'
    END as source,
    COUNT(*) as total,
    COUNT(CASE WHEN LENGTH(content) > 500 THEN 1 END) as good_content,
    COUNT(CASE WHEN LENGTH(content) BETWEEN 100 AND 500 THEN 1 END) as short_content,
    COUNT(CASE WHEN content IS NULL OR LENGTH(content) < 100 THEN 1 END) as no_content,
    ROUND(COUNT(CASE WHEN LENGTH(content) > 500 THEN 1 END) * 100.0 / COUNT(*), 1) as pct_good
FROM worldbank_documents
GROUP BY source
ORDER BY total DESC;

-- 4. Check for UI contamination by source
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'UI CONTAMINATION BY SOURCE';
    RAISE NOTICE '=============================================================================';
END $$;

SELECT 
    CASE 
        WHEN id LIKE 'wb-api-%' THEN 'API'
        WHEN id LIKE 'wb-validated-%' THEN 'Validated'
        WHEN id ~ '^\d+$' THEN 'Numeric'
        ELSE 'Other'
    END as source,
    COUNT(*) as total,
    COUNT(CASE WHEN 
        content ILIKE '%Will you take two minutes%'
        OR content ILIKE '%Working for a World Free of Poverty%'
        OR content ILIKE '%Esta página em:%'
        OR content ILIKE '%Skip to Main Navigation%'
        THEN 1 END) as contaminated,
    ROUND(COUNT(CASE WHEN 
        content ILIKE '%Will you take two minutes%'
        OR content ILIKE '%Working for a World Free of Poverty%'
        OR content ILIKE '%Esta página em:%'
        OR content ILIKE '%Skip to Main Navigation%'
        THEN 1 END) * 100.0 / COUNT(*), 1) as pct_contaminated
FROM worldbank_documents
GROUP BY source
ORDER BY total DESC;

-- 5. Show examples from each source
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'EXAMPLES FROM EACH SOURCE';
    RAISE NOTICE '=============================================================================';
END $$;

-- API documents
SELECT 
    '🌐 API Documents' as source_type,
    id,
    LEFT(title, 60) as title,
    LENGTH(content) as content_length,
    CASE 
        WHEN LENGTH(content) > 500 THEN '✅ Good'
        WHEN LENGTH(content) > 100 THEN '⚠️ Short'
        ELSE '❌ Empty'
    END as quality
FROM worldbank_documents
WHERE id LIKE 'wb-api-%'
ORDER BY LENGTH(content) DESC
LIMIT 5;

-- Validated documents
SELECT 
    '✅ Validated Documents' as source_type,
    id,
    LEFT(title, 60) as title,
    LENGTH(content) as content_length,
    CASE 
        WHEN LENGTH(content) > 500 THEN '✅ Good'
        WHEN LENGTH(content) > 100 THEN '⚠️ Short'
        ELSE '❌ Empty'
    END as quality
FROM worldbank_documents
WHERE id LIKE 'wb-validated-%'
ORDER BY LENGTH(content) DESC
LIMIT 5;

-- 6. Recommendations
DO $$
DECLARE
    api_count INTEGER;
    api_good INTEGER;
    validated_count INTEGER;
    validated_good INTEGER;
    other_count INTEGER;
    total_docs INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_docs FROM worldbank_documents;
    
    SELECT COUNT(*), COUNT(CASE WHEN LENGTH(content) > 500 THEN 1 END)
    INTO api_count, api_good
    FROM worldbank_documents
    WHERE id LIKE 'wb-api-%';
    
    SELECT COUNT(*), COUNT(CASE WHEN LENGTH(content) > 500 THEN 1 END)
    INTO validated_count, validated_good
    FROM worldbank_documents
    WHERE id LIKE 'wb-validated-%';
    
    SELECT COUNT(*) INTO other_count
    FROM worldbank_documents
    WHERE id NOT LIKE 'wb-api-%' AND id NOT LIKE 'wb-validated-%';
    
    RAISE NOTICE '';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'RECOMMENDATIONS';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 YOUR DATA SOURCES:';
    RAISE NOTICE '   Total documents: %', total_docs;
    RAISE NOTICE '   API documents: % (% with good content)', api_count, api_good;
    RAISE NOTICE '   Validated documents: % (% with good content)', validated_count, validated_good;
    RAISE NOTICE '   Other sources: %', other_count;
    RAISE NOTICE '';
    
    IF api_count > 0 AND api_good < api_count * 0.5 THEN
        RAISE NOTICE '🚨 PROBLEM: API documents have poor content quality!';
        RAISE NOTICE '   Only % of % API documents have good content', api_good, api_count;
        RAISE NOTICE '';
        RAISE NOTICE '💡 SOLUTION OPTIONS:';
        RAISE NOTICE '   1. API might only return metadata (not full text)';
        RAISE NOTICE '   2. Need to fetch full documents separately';
        RAISE NOTICE '   3. Consider keeping "validated" documents (manually curated)';
    END IF;
    
    IF validated_good > api_good THEN
        RAISE NOTICE '✅ VALIDATED documents have better quality than API!';
        RAISE NOTICE '   Validated with good content: %', validated_good;
        RAISE NOTICE '   API with good content: %', api_good;
        RAISE NOTICE '';
        RAISE NOTICE '💡 RECOMMENDATION:';
        RAISE NOTICE '   Keep validated documents, they have better content';
        RAISE NOTICE '   Delete API documents with no/minimal content';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎯 CLEANUP STRATEGY:';
    RAISE NOTICE '   1. Keep: Documents with content length > 500';
    RAISE NOTICE '   2. Review: Documents with content 100-500 (might be summaries)';
    RAISE NOTICE '   3. Delete: Documents with content < 100 (no value)';
    RAISE NOTICE '   4. Source doesn''t matter - content quality matters!';
    RAISE NOTICE '';
    RAISE NOTICE '=============================================================================';
END $$;

