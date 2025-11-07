# 🔍 Document URL Verification & Cleanup Guide

## Your Question

> "Should we use worldbank 404 as a red flag and remove from our DB? Can you verify URLs and see how many lead to 404 from original source link?"

**Answer:** ✅ **Yes, but with caution!** 

Delete documents that have BOTH:
- ❌ Invalid/404 URLs
- ❌ No meaningful content

Keep documents that have:
- ✅ Good content (even if URL is broken)
- ✅ Valid URLs

## 🎯 Strategy

### What to Keep:
1. **Documents with good content** - Even if URL is 404, the content is valuable
2. **Documents with valid URLs** - These are still accessible on World Bank

### What to Delete:
1. **Placeholder documents** - URLs like `/999999`, no real content
2. **404 + No content** - Broken link AND empty/minimal content
3. **Duplicate/test entries** - Obviously invalid data

### What to Review:
1. **404 + Short content** - Might be summaries worth keeping
2. **Timeout errors** - World Bank might be slow, not dead

## 📋 Step-by-Step Process

### Step 1: Quick SQL Check (2 minutes)

Run this in Supabase SQL Editor:

```bash
File: CHECK_INVALID_URLS.sql
```

This will show you:
- ✅ How many documents have invalid URLs
- ✅ How many have content despite invalid URLs
- ✅ How many should be considered for deletion
- ✅ Examples of each category

**Run it now** to see what you're dealing with!

### Step 2: Detailed Verification (5-10 minutes)

Install Python dependencies:
```bash
cd "/Users/marlow/Documents/Cursor-projects/RJ Banga Speaches"
pip install aiohttp supabase python-dotenv
```

Run the verification script:
```bash
python3 scripts/verify_document_urls.py
```

This script will:
- 🔍 Check EVERY URL in your database
- 📊 Test if URLs actually return 404
- ⏱️  Detect timeouts vs real errors
- 📄 Generate a detailed report
- 🗑️  Create a cleanup SQL script automatically

### Step 3: Review the Report

The script generates:
```
url_verification_report_20241105_HHMMSS.txt
```

This shows:
- ✅ Valid URLs (keep these)
- ❌ 404 URLs (potential deletions)
- ⚠️  Invalid patterns (obvious placeholders)
- ⏱️  Timeouts (might be slow servers)
- 📝 Missing URLs (check if content exists)

### Step 4: Review Generated Cleanup Script

The script generates:
```
cleanup_invalid_documents.sql
```

**⚠️  DO NOT RUN WITHOUT REVIEWING!**

1. Open the SQL file
2. Check which documents it will delete
3. Verify none have valuable content
4. Make manual adjustments if needed

### Step 5: Backup Before Deletion

**ALWAYS backup first:**

```sql
-- Create backup table
CREATE TABLE worldbank_documents_backup_20241105 AS 
SELECT * FROM worldbank_documents;

-- Or export specific invalid documents
CREATE TABLE worldbank_documents_invalid_backup AS
SELECT * FROM worldbank_documents
WHERE url LIKE '%999999%' 
   OR url IS NULL;
```

### Step 6: Run Cleanup

Only after reviewing and backing up:

```sql
-- Run the generated cleanup script
-- Or manually delete specific IDs
```

## 📊 Expected Results

Based on typical World Bank scraping, you might see:

### Typical Distribution:
```
Total Documents: 1000
├─ ✅ Valid URLs: 700 (70%)
├─ ❌ 404 URLs: 150 (15%)
├─ ⚠️  Invalid Patterns: 100 (10%)
└─ 📝 Missing URLs: 50 (5%)
```

### Recommended Actions:
```
Keep: 800 documents (80%)
├─ 700 with valid URLs
└─ 100 with good content (despite invalid URL)

Delete: 200 documents (20%)
├─ 150 with 404 + no content
└─ 50 placeholder/test entries
```

## 🤔 Decision Matrix

### Keep This Document If:
```
✅ URL works (200, 301, 302 status)
✅ Content length > 500 characters
✅ Has summary and metadata
✅ Part of a collection/series
✅ Referenced by other documents
```

### Delete This Document If:
```
❌ URL returns 404
AND
❌ Content is empty or < 100 characters
AND
❌ No summary or meaningful metadata
AND
❌ Looks like placeholder/test data
```

### Review This Document If:
```
⚠️  URL times out (might be temporary)
⚠️  URL is 404 but content is 200-500 chars
⚠️  Missing URL but has some content
⚠️  Part of a batch that needs decisions
```

## 🔧 Script Features

### Python Verification Script Does:
```python
✅ Checks URLs in parallel (fast)
✅ Uses HEAD requests (efficient)
✅ Respects timeouts (10 seconds)
✅ Handles redirects
✅ Identifies invalid patterns
✅ Generates cleanup SQL
✅ Saves detailed report
✅ Shows progress bar
```

### SQL Check Script Does:
```sql
✅ Instant analysis (no network calls)
✅ Pattern matching for obvious invalids
✅ Content availability check
✅ Statistics and percentages
✅ Examples of each category
✅ Recommendations
```

## 📝 Example Output

### Python Script Output:
```
🔍 Checking 1000 document URLs...
Progress: 1000/1000 checked

📊 SUMMARY:
   Total Documents: 1000
   ✅ Valid URLs: 720 (72.0%)
   ❌ 404 Not Found: 180 (18.0%)
   ⚠️  Invalid Patterns: 80 (8.0%)
   ⏱️  Timeout: 15 (1.5%)
   🚫 Other Errors: 5 (0.5%)

🎯 Documents to KEEP: 820
   - Valid URLs: 720
   - Missing URLs (but content exists): 100

🗑️  Documents to CONSIDER REMOVING: 180
   - 404 URLs: 150
   - Invalid patterns: 30

✅ SQL cleanup script generated: cleanup_invalid_documents.sql
```

### SQL Script Output:
```
category                           | count | percentage
-----------------------------------|-------|------------
Total Documents                    | 1000  | 100.0
Potentially Valid URLs             | 720   | 72.0
Invalid Patterns (Any of above)    | 280   | 28.0
Missing URL                        | 100   | 10.0
Contains "999999" (Placeholder)    | 80    | 8.0
Contains "placeholder"             | 50    | 5.0
Contains "000000"                  | 50    | 5.0
```

## ⚠️  Important Warnings

### DON'T Delete:
```
❌ Documents with >500 char content (even if URL is bad)
❌ Recent documents (might be temporary 404)
❌ Documents referenced elsewhere
❌ All documents at once (review batches)
```

### DO Delete:
```
✅ Obvious placeholders (999999, etc.)
✅ Empty documents with 404 URLs
✅ Test/duplicate entries
✅ After backing up first!
```

## 🎯 Best Practices

### 1. Start Conservative
- First run: Only delete obvious placeholders
- Review what gets removed
- Gradually expand criteria

### 2. Keep Content
- If document has meaningful content, keep it
- Even if URL is broken
- Your database is the source of truth

### 3. Batch Processing
- Don't delete everything at once
- Review in batches of 50-100
- Check a few manually first

### 4. Document Decisions
- Keep notes on what you deleted and why
- Save reports for future reference
- Track deletion criteria

## 🚀 Quick Start

**5-Minute Quick Check:**
```bash
# 1. Run SQL check
# Open Supabase → SQL Editor → Run CHECK_INVALID_URLS.sql

# 2. See results immediately
# No installation needed
```

**10-Minute Full Verification:**
```bash
# 1. Install dependencies
pip install aiohttp supabase python-dotenv

# 2. Run Python script
python3 scripts/verify_document_urls.py

# 3. Review generated reports
# 4. Backup database
# 5. Run cleanup script (if needed)
```

## 📞 Need Help?

If uncertain about deleting documents:
1. Check the content field
2. Search for the title on World Bank site
3. Keep it if in doubt
4. You can always delete later

**Better to keep a few bad documents than delete good ones!**

---

**Ready?** Start with `CHECK_INVALID_URLS.sql` to see what you're dealing with!






