# 📄 Fetch Real World Bank Documents with Full PDF Content

## What This Does

This script will:
1. ✅ **Search World Bank API** for documents
2. ✅ **Download PDFs** from World Bank
3. ✅ **Extract full text** from PDFs (not just metadata!)
4. ✅ **Store in your database** with complete content
5. ✅ **Generate summaries** automatically
6. ✅ **Extract keywords** for better search

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
cd "/Users/marlow/Documents/Cursor-projects/RJ Banga Speaches"

# Install PDF extraction library (choose one)
pip install pdfplumber         # Recommended (better quality)
# OR
pip install PyPDF2              # Alternative (faster)

# Ensure supabase is installed
pip install supabase python-dotenv requests
```

### Step 2: Run the Script

```bash
# Fetch Ajay Banga documents (default: 20 docs)
python3 scripts/fetch_worldbank_documents.py

# Custom search query
python3 scripts/fetch_worldbank_documents.py "climate change" 30

# Fetch specific topic
python3 scripts/fetch_worldbank_documents.py "IDA replenishment" 10
```

### Step 3: Check Your Database

```sql
-- See newly added documents
SELECT id, title, LENGTH(content) as chars, metadata->>'word_count' as words
FROM worldbank_documents
WHERE id LIKE 'wb-pdf-%'
ORDER BY date DESC
LIMIT 10;
```

## 📊 What You'll Get

### Before (What you had):
```
Documents with:
❌ Only metadata (title, URL, date)
❌ No actual content
❌ Short summaries (100-200 chars)
```

### After (What you'll have):
```
Documents with:
✅ Full PDF text content (thousands of words!)
✅ Auto-generated summaries
✅ Keywords extracted from content
✅ Word count & reading time
✅ Clean, formatted text
```

## 🎯 Example Output

```bash
🔍 Searching World Bank for: 'Ajay Banga'
================================================================================
✅ Found 25 documents

📄 Processing 25 documents...
================================================================================

[1/25] Remarks by World Bank Group President Ajay Banga at IDA...
--------------------------------------------------------------------------------
   📥 Downloading: 34442285.pdf
   ✅ Downloaded: 34442285.pdf (245.3 KB)
   📝 Extracting text...
   ✅ Extracted 8,542 characters (1,423 words)
   ✅ Stored in database: wb-pdf-34442285

[2/25] World Bank Group President Ajay Banga's Speech at...
--------------------------------------------------------------------------------
   📥 Downloading: 34400797.pdf
   ✅ Downloaded: 34400797.pdf (189.7 KB)
   📝 Extracting text...
   ✅ Extracted 6,234 characters (1,039 words)
   ✅ Stored in database: wb-pdf-34400797

...

================================================================================
SUMMARY
================================================================================
📊 Statistics:
   Documents fetched: 25
   PDFs downloaded: 23
   Text extracted: 22
   Stored in database: 22
   Errors: 3

✅ Success rate: 88.0%
================================================================================
```

## 🔧 How It Works

### 1. API Search
```python
# Searches World Bank API
WB_SEARCH_API = "https://search.worldbank.org/api/v2/wds"

# Returns: title, date, PDF URL, metadata
```

### 2. PDF Download
```python
# Downloads PDF to: data/worldbank_pdfs/
# Skips if already downloaded
```

### 3. Text Extraction
```python
# Uses pdfplumber or PyPDF2
# Extracts all text from all pages
# Cleans and formats the text
```

### 4. Database Storage
```python
# Stores in worldbank_documents table:
{
    'id': 'wb-pdf-34442285',
    'title': 'Full title...',
    'content': 'Full extracted text...', // THOUSANDS OF WORDS!
    'summary': 'Auto-generated summary...',
    'keywords': ['climate', 'finance', 'development'],
    'metadata': {
        'word_count': 1423,
        'reading_time': 7,  // minutes
        'source': 'World Bank API + PDF'
    }
}
```

## 📚 Search Queries You Can Try

```bash
# Speeches by Ajay Banga
python3 scripts/fetch_worldbank_documents.py "Ajay Banga" 50

# Climate-related documents
python3 scripts/fetch_worldbank_documents.py "climate finance" 30

# IDA documents
python3 scripts/fetch_worldbank_documents.py "IDA21" 20

# Country-specific
python3 scripts/fetch_worldbank_documents.py "India development" 25

# Sector-specific
python3 scripts/fetch_worldbank_documents.py "education sector" 15

# Recent policy papers
python3 scripts/fetch_worldbank_documents.py "policy research" 40
```

## ⚡ Advanced Usage

### Custom Script for Specific Needs

```python
# Modify scripts/fetch_worldbank_documents.py

# Change search parameters
params = {
    'qterm': 'your search',
    'rows': 100,  # More results
    'docty': 'Speech',  # Filter by type
    'lang_exact': 'English'  # Language filter
}

# Add custom processing
def custom_process(text):
    # Your custom text processing
    return processed_text
```

### Batch Processing

```bash
# Create a batch script
for query in "Ajay Banga" "IDA21" "climate finance"; do
    python3 scripts/fetch_worldbank_documents.py "$query" 20
    sleep 5
done
```

## 🐛 Troubleshooting

### Issue: "No PDF library found"
```bash
# Install pdfplumber
pip install pdfplumber
```

### Issue: "Permission denied" or "Connection refused"
```bash
# Check internet connection
# World Bank servers might be slow, retry later
```

### Issue: "No text extracted"
```
Some PDFs are scanned images (not searchable text)
These cannot be extracted without OCR
Skip these or use OCR tools separately
```

### Issue: PDFs download but text is gibberish
```
Some PDFs have encoding issues
The script tries to clean text automatically
For important docs, manual review might be needed
```

## 📁 Where Files Are Stored

```
/Users/marlow/Documents/Cursor-projects/RJ Banga Speaches/
├── data/
│   └── worldbank_pdfs/
│       ├── 34442285.pdf
│       ├── 34400797.pdf
│       └── ...
└── scripts/
    └── fetch_worldbank_documents.py
```

## 🎯 Expected Results

After running the script with 50 documents:

```sql
-- Check results
SELECT 
    COUNT(*) as total,
    AVG(LENGTH(content)) as avg_content_length,
    MIN(LENGTH(content)) as min_length,
    MAX(LENGTH(content)) as max_length
FROM worldbank_documents
WHERE id LIKE 'wb-pdf-%';

-- Should show something like:
-- total: 45
-- avg_content_length: 12,453
-- min_length: 1,234
-- max_length: 45,678
```

## ✅ Verification

```sql
-- Compare old vs new documents
SELECT 
    'Old (metadata only)' as type,
    AVG(LENGTH(content)) as avg_chars
FROM worldbank_documents
WHERE id NOT LIKE 'wb-pdf-%'

UNION ALL

SELECT 
    'New (full PDF content)' as type,
    AVG(LENGTH(content)) as avg_chars
FROM worldbank_documents
WHERE id LIKE 'wb-pdf-%';

-- You should see:
-- Old: ~400 chars (just summaries)
-- New: ~12,000 chars (full content!)
```

## 🎉 What's Next?

After fetching real documents:
1. ✅ **Delete old metadata-only docs** (optional)
2. ✅ **Refresh your app** - document pages now have full content!
3. ✅ **Improve search** - now searching actual content
4. ✅ **Add more documents** - run script with different queries

---

**Ready?** Install dependencies and run the script! 🚀

```bash
pip install pdfplumber supabase python-dotenv requests
python3 scripts/fetch_worldbank_documents.py "Ajay Banga" 20
```


