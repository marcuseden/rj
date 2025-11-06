-- =============================================================================
-- CLEANUP EMPTY AND METADATA-ONLY DOCUMENTS
-- =============================================================================
-- Removes documents with no value:
-- 1. No content at all
-- 2. Only metadata (content just repeats title)
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'DOCUMENT CLEANUP ANALYSIS';
    RAISE NOTICE '=============================================================================';
END $$;

-- 1. Show what will be deleted
DO $$
DECLARE
    empty_count INTEGER;
    metadata_only_count INTEGER;
    total_delete INTEGER;
    total_docs INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_docs FROM worldbank_documents;
    
    -- Count empty documents
    SELECT COUNT(*) INTO empty_count
    FROM worldbank_documents
    WHERE content IS NULL OR LENGTH(content) < 100;
    
    -- Count metadata-only documents
    SELECT COUNT(*) INTO metadata_only_count
    FROM worldbank_documents
    WHERE content LIKE 'World Bank document:%'
       OR content LIKE 'World Bank Group document:%'
       OR content LIKE 'Official Documents-%'
       OR (LENGTH(content) < 150 AND content ILIKE '%World Bank%' AND content ILIKE '%document%');
    
    total_delete := empty_count + metadata_only_count;
    
    RAISE NOTICE '';
    RAISE NOTICE '📊 CLEANUP SUMMARY:';
    RAISE NOTICE '   Total documents: %', total_docs;
    RAISE NOTICE '   Empty (no content): %', empty_count;
    RAISE NOTICE '   Metadata only: %', metadata_only_count;
    RAISE NOTICE '   Total to delete: %', total_delete;
    RAISE NOTICE '   Will remain: %', total_docs - total_delete;
    RAISE NOTICE '';
END $$;

-- 2. Show examples of what will be deleted
DO $$
BEGIN
    RAISE NOTICE '🔍 EXAMPLES OF DOCUMENTS TO BE DELETED:';
    RAISE NOTICE '';
END $$;

-- Empty documents
SELECT 
    '❌ EMPTY' as type,
    id,
    LEFT(title, 60) as title,
    COALESCE(LENGTH(content)::text, '0') as chars
FROM worldbank_documents
WHERE content IS NULL OR LENGTH(content) < 100
ORDER BY id
LIMIT 5;

-- Metadata-only documents
SELECT 
    '❌ METADATA ONLY' as type,
    id,
    LEFT(title, 60) as title,
    LEFT(content, 80) as content_preview
FROM worldbank_documents
WHERE content LIKE 'World Bank document:%'
   OR content LIKE 'World Bank Group document:%'
   OR (LENGTH(content) < 150 AND content ILIKE '%World Bank%' AND content ILIKE '%document%')
ORDER BY id
LIMIT 5;

-- 3. Show examples of what will be KEPT
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ EXAMPLES OF DOCUMENTS TO BE KEPT:';
    RAISE NOTICE '';
END $$;

SELECT 
    '✅ KEEP' as type,
    id,
    LEFT(title, 60) as title,
    LENGTH(content) as chars,
    LEFT(content, 80) as preview
FROM worldbank_documents
WHERE LENGTH(content) >= 100
  AND NOT (
      content LIKE 'World Bank document:%'
      OR content LIKE 'World Bank Group document:%'
      OR (LENGTH(content) < 150 AND content ILIKE '%World Bank%' AND content ILIKE '%document%')
  )
ORDER BY LENGTH(content) ASC
LIMIT 5;

-- 4. Create backup table
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'STEP 1: CREATING BACKUP';
    RAISE NOTICE '=============================================================================';
END $$;

-- Backup documents that will be deleted
DROP TABLE IF EXISTS worldbank_documents_deleted_backup;

CREATE TABLE worldbank_documents_deleted_backup AS
SELECT 
    *,
    CURRENT_TIMESTAMP as deleted_at,
    CASE 
        WHEN content IS NULL OR LENGTH(content) < 100 THEN 'empty'
        WHEN content LIKE 'World Bank document:%' THEN 'metadata_only'
        WHEN content LIKE 'World Bank Group document:%' THEN 'metadata_only'
        ELSE 'other'
    END as deletion_reason
FROM worldbank_documents
WHERE 
    content IS NULL 
    OR LENGTH(content) < 100
    OR content LIKE 'World Bank document:%'
    OR content LIKE 'World Bank Group document:%'
    OR (LENGTH(content) < 150 AND content ILIKE '%World Bank%' AND content ILIKE '%document%');

DO $$
DECLARE
    backup_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO backup_count FROM worldbank_documents_deleted_backup;
    RAISE NOTICE '✅ Backed up % documents to worldbank_documents_deleted_backup', backup_count;
END $$;

-- 5. Show deletion query (commented out for safety)
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'STEP 2: REVIEW AND EXECUTE DELETION';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  The deletion query is commented out for safety.';
    RAISE NOTICE '   Review the backup table, then uncomment and run the DELETE below.';
    RAISE NOTICE '';
END $$;

/*
-- UNCOMMENT THIS BLOCK TO PERFORM THE ACTUAL DELETION
-- Only run after reviewing the backup table!

DELETE FROM worldbank_documents
WHERE 
    content IS NULL 
    OR LENGTH(content) < 100
    OR content LIKE 'World Bank document:%'
    OR content LIKE 'World Bank Group document:%'
    OR (LENGTH(content) < 150 AND content ILIKE '%World Bank%' AND content ILIKE '%document%');

-- Show results
DO $$
DECLARE
    remaining_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO remaining_count FROM worldbank_documents;
    RAISE NOTICE '';
    RAISE NOTICE '✅ DELETION COMPLETE!';
    RAISE NOTICE '   Documents remaining: %', remaining_count;
    RAISE NOTICE '';
END $$;
*/

-- 6. Verification queries
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'VERIFICATION QUERIES';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Review the backup table:';
    RAISE NOTICE '   SELECT * FROM worldbank_documents_deleted_backup LIMIT 10;';
    RAISE NOTICE '';
    RAISE NOTICE 'Check deletion reasons:';
    RAISE NOTICE '   SELECT deletion_reason, COUNT(*) FROM worldbank_documents_deleted_backup GROUP BY deletion_reason;';
    RAISE NOTICE '';
    RAISE NOTICE 'If backup looks good, uncomment the DELETE block above and run again.';
    RAISE NOTICE '';
    RAISE NOTICE '=============================================================================';
END $$;

-- Show breakdown of what's in backup
SELECT 
    deletion_reason,
    COUNT(*) as documents,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM worldbank_documents_deleted_backup), 1)::text || '%' as percentage
FROM worldbank_documents_deleted_backup
GROUP BY deletion_reason
ORDER BY COUNT(*) DESC;

