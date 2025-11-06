-- =============================================================================
-- DELETE DUPLICATES - KEEP ONLY UNIQUE CONTENT
-- =============================================================================
-- Your database has 2,027 documents but only ~42 unique ones!
-- This script safely removes duplicates, keeping one copy of each
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'DUPLICATE REMOVAL PLAN';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Current situation:';
    RAISE NOTICE '  • 2,027 total documents';
    RAISE NOTICE '  • Only ~42 unique documents';
    RAISE NOTICE '  • 1,985 duplicates (98%% waste!)';
    RAISE NOTICE '';
    RAISE NOTICE 'After cleanup:';
    RAISE NOTICE '  • ~42 documents (all unique)';
    RAISE NOTICE '  • 0 duplicates';
    RAISE NOTICE '  • 100%% useful content';
    RAISE NOTICE '';
    RAISE NOTICE '=============================================================================';
END $$;

-- STEP 1: Create backup of everything
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'STEP 1: Creating backup...';
END $$;

DROP TABLE IF EXISTS worldbank_documents_backup_before_dedup;
CREATE TABLE worldbank_documents_backup_before_dedup AS
SELECT *, CURRENT_TIMESTAMP as backed_up_at
FROM worldbank_documents;

DO $$
DECLARE
    backup_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO backup_count FROM worldbank_documents_backup_before_dedup;
    RAISE NOTICE '✅ Backed up % documents', backup_count;
END $$;

-- STEP 2: Identify documents to keep (one per unique content)
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'STEP 2: Identifying unique documents...';
END $$;

-- Create temp table with documents to KEEP
DROP TABLE IF EXISTS docs_to_keep;
CREATE TEMP TABLE docs_to_keep AS
WITH ranked_docs AS (
    SELECT 
        id,
        content,
        title,
        url,
        -- Keep the document with:
        -- 1. Shortest ID (likely original)
        -- 2. API docs preferred over others
        -- 3. Docs with URLs preferred
        ROW_NUMBER() OVER (
            PARTITION BY content 
            ORDER BY 
                CASE WHEN id LIKE 'wb-api-%' THEN 1 ELSE 2 END,
                CASE WHEN url IS NOT NULL THEN 1 ELSE 2 END,
                LENGTH(id),
                id
        ) as rank
    FROM worldbank_documents
    WHERE content IS NOT NULL
)
SELECT id, content, title, url
FROM ranked_docs
WHERE rank = 1;

DO $$
DECLARE
    keep_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO keep_count FROM docs_to_keep;
    RAISE NOTICE '✅ Will keep % unique documents', keep_count;
END $$;

-- STEP 3: Show what will be deleted
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'STEP 3: Preview of deletion...';
END $$;

SELECT 
    'Documents to DELETE' as action,
    COUNT(*) as count
FROM worldbank_documents
WHERE id NOT IN (SELECT id FROM docs_to_keep)

UNION ALL

SELECT 
    'Documents to KEEP' as action,
    COUNT(*) as count
FROM docs_to_keep;

-- Show examples of documents being deleted (duplicates)
SELECT 
    'DUPLICATE (will delete)' as status,
    id,
    LEFT(title, 50) as title,
    LENGTH(content) as content_length
FROM worldbank_documents
WHERE content IN (
    SELECT content FROM worldbank_documents
    GROUP BY content
    HAVING COUNT(*) > 1
)
AND id NOT IN (SELECT id FROM docs_to_keep)
ORDER BY content, id
LIMIT 10;

-- Show examples of documents being kept
SELECT 
    'UNIQUE (will keep)' as status,
    id,
    LEFT(title, 50) as title,
    LENGTH(content) as content_length
FROM docs_to_keep
ORDER BY id
LIMIT 10;

-- STEP 4: Perform deletion (COMMENTED OUT for safety)
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'STEP 4: EXECUTE DELETION';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  The DELETE command is commented out for safety.';
    RAISE NOTICE '';
    RAISE NOTICE 'Review the preview above. If it looks good:';
    RAISE NOTICE '  1. Verify backup exists: SELECT COUNT(*) FROM worldbank_documents_backup_before_dedup;';
    RAISE NOTICE '  2. Uncomment the DELETE block below';
    RAISE NOTICE '  3. Run this script again';
    RAISE NOTICE '';
    RAISE NOTICE '=============================================================================';
END $$;

/*
-- UNCOMMENT THIS BLOCK TO PERFORM THE ACTUAL DELETION
-- Only run after reviewing the backup and preview!

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🗑️  Deleting duplicates...';
END $$;

DELETE FROM worldbank_documents
WHERE id NOT IN (SELECT id FROM docs_to_keep);

-- Show results
DO $$
DECLARE
    remaining_count INTEGER;
    deleted_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO remaining_count FROM worldbank_documents;
    SELECT COUNT(*) INTO deleted_count FROM worldbank_documents_backup_before_dedup;
    
    RAISE NOTICE '';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE '✅ DELETION COMPLETE!';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Before: % documents', deleted_count;
    RAISE NOTICE 'After: % documents', remaining_count;
    RAISE NOTICE 'Deleted: % duplicates', deleted_count - remaining_count;
    RAISE NOTICE 'Space saved: %%', ROUND((deleted_count - remaining_count) * 100.0 / deleted_count, 1);
    RAISE NOTICE '';
    RAISE NOTICE '✅ All documents now have unique content!';
    RAISE NOTICE '';
    RAISE NOTICE '=============================================================================';
END $$;
*/

-- STEP 5: Verification queries
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'VERIFICATION';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Run these queries to verify:';
    RAISE NOTICE '';
    RAISE NOTICE '1. Check backup:';
    RAISE NOTICE '   SELECT COUNT(*) FROM worldbank_documents_backup_before_dedup;';
    RAISE NOTICE '';
    RAISE NOTICE '2. Check what will be kept:';
    RAISE NOTICE '   SELECT * FROM docs_to_keep ORDER BY id;';
    RAISE NOTICE '';
    RAISE NOTICE '3. After deletion, verify no duplicates:';
    RAISE NOTICE '   SELECT content, COUNT(*) FROM worldbank_documents';
    RAISE NOTICE '   GROUP BY content HAVING COUNT(*) > 1;';
    RAISE NOTICE '   (Should return 0 rows)';
    RAISE NOTICE '';
    RAISE NOTICE '=============================================================================';
END $$;

-- Show final statistics
SELECT 
    'Current database' as status,
    COUNT(*) as total_docs,
    COUNT(DISTINCT content) as unique_docs,
    COUNT(*) - COUNT(DISTINCT content) as duplicate_docs,
    ROUND((COUNT(*) - COUNT(DISTINCT content)) * 100.0 / COUNT(*), 1) as pct_duplicates
FROM worldbank_documents;

