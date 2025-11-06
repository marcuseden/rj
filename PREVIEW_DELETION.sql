-- =============================================================================
-- PREVIEW WHAT WILL BE DELETED (Creates permanent review table)
-- =============================================================================

-- Create permanent table to review which documents will be kept
DROP TABLE IF EXISTS docs_to_keep_review;
CREATE TABLE docs_to_keep_review AS
WITH ranked_docs AS (
    SELECT 
        id,
        content,
        title,
        url,
        LENGTH(content) as content_length,
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
SELECT id, content, title, url, content_length
FROM ranked_docs
WHERE rank = 1;

-- Show summary
SELECT 
    'Will KEEP (unique)' as action,
    COUNT(*) as count
FROM docs_to_keep_review

UNION ALL

SELECT 
    'Will DELETE (duplicates)' as action,
    COUNT(*) as count
FROM worldbank_documents
WHERE id NOT IN (SELECT id FROM docs_to_keep_review);

-- Show examples of what will be KEPT
SELECT 
    '✅ KEEP' as action,
    id,
    LEFT(title, 50) as title,
    content_length,
    LEFT(content, 80) as content_preview
FROM docs_to_keep_review
ORDER BY content_length DESC
LIMIT 10;

-- Show examples of what will be DELETED
SELECT 
    '🗑️ DELETE' as action,
    id,
    LEFT(title, 50) as title,
    LENGTH(content) as content_length
FROM worldbank_documents
WHERE id NOT IN (SELECT id FROM docs_to_keep_review)
ORDER BY id
LIMIT 10;

-- Show duplicate groups (same content, different IDs)
WITH duplicate_content AS (
    SELECT content, COUNT(*) as copies
    FROM worldbank_documents
    WHERE content IS NOT NULL
    GROUP BY content
    HAVING COUNT(*) > 1
    ORDER BY COUNT(*) DESC
    LIMIT 5
)
SELECT 
    'DUPLICATE GROUP' as info,
    d.id,
    CASE WHEN d.id IN (SELECT id FROM docs_to_keep_review) THEN '✅ Keeping' ELSE '🗑️ Deleting' END as action,
    LEFT(d.title, 40) as title,
    dc.copies as total_copies
FROM worldbank_documents d
JOIN duplicate_content dc ON d.content = dc.content
ORDER BY dc.copies DESC, d.id
LIMIT 20;

-- Final instructions
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'REVIEW COMPLETE';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Review tables created:';
    RAISE NOTICE '  • docs_to_keep_review (53 documents to keep)';
    RAISE NOTICE '';
    RAISE NOTICE 'To proceed with deletion:';
    RAISE NOTICE '  1. Review: SELECT * FROM docs_to_keep_review;';
    RAISE NOTICE '  2. If satisfied, uncomment DELETE block in DELETE_DUPLICATES_FINAL.sql';
    RAISE NOTICE '  3. Run DELETE_DUPLICATES_FINAL.sql';
    RAISE NOTICE '';
    RAISE NOTICE '=============================================================================';
END $$;

