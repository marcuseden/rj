-- Create World Bank Documents Table
-- Stores scraped World Bank strategy documents with full tagging and source tracking

CREATE TABLE IF NOT EXISTS worldbank_documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  summary TEXT,
  date DATE NOT NULL,
  type TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  local_path TEXT,
  
  -- Topics and keywords (arrays)
  topics TEXT[] DEFAULT '{}',
  keywords TEXT[] DEFAULT '{}',
  citations TEXT[] DEFAULT '{}',
  related_documents TEXT[] DEFAULT '{}',
  
  -- Tags (flattened for indexing)
  tags_document_type TEXT NOT NULL,
  tags_content_type TEXT NOT NULL,
  tags_audience TEXT[] DEFAULT '{}',
  tags_regions TEXT[] DEFAULT '{}',
  tags_sectors TEXT[] DEFAULT '{}',
  tags_initiatives TEXT[] DEFAULT '{}',
  tags_authors TEXT[] DEFAULT '{}',
  tags_departments TEXT[] DEFAULT '{}',
  tags_priority TEXT NOT NULL,
  tags_status TEXT NOT NULL,
  
  -- Source reference (complete tracking)
  source_original_url TEXT NOT NULL,
  source_scraped_from TEXT NOT NULL,
  source_parent_page TEXT,
  source_link_text TEXT,
  source_discovered_at TIMESTAMPTZ NOT NULL,
  source_type TEXT NOT NULL,
  
  -- Metadata
  metadata_language TEXT DEFAULT 'en',
  metadata_word_count INTEGER NOT NULL,
  metadata_reading_time INTEGER NOT NULL,
  metadata_last_modified TIMESTAMPTZ,
  
  -- Timestamps
  scraped_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for fast searching
CREATE INDEX IF NOT EXISTS idx_worldbank_date ON worldbank_documents(date DESC);
CREATE INDEX IF NOT EXISTS idx_worldbank_type ON worldbank_documents(type);
CREATE INDEX IF NOT EXISTS idx_worldbank_doc_type ON worldbank_documents(tags_document_type);
CREATE INDEX IF NOT EXISTS idx_worldbank_priority ON worldbank_documents(tags_priority);
CREATE INDEX IF NOT EXISTS idx_worldbank_sectors ON worldbank_documents USING GIN(tags_sectors);
CREATE INDEX IF NOT EXISTS idx_worldbank_initiatives ON worldbank_documents USING GIN(tags_initiatives);
CREATE INDEX IF NOT EXISTS idx_worldbank_authors ON worldbank_documents USING GIN(tags_authors);
CREATE INDEX IF NOT EXISTS idx_worldbank_topics ON worldbank_documents USING GIN(topics);
CREATE INDEX IF NOT EXISTS idx_worldbank_keywords ON worldbank_documents USING GIN(keywords);

-- Full text search index
CREATE INDEX IF NOT EXISTS idx_worldbank_content_search
  ON worldbank_documents
  USING GIN(to_tsvector('english', title || ' ' || content));

-- Trigram indexes for fast autocomplete and fuzzy matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_worldbank_title_trgm ON worldbank_documents USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_worldbank_content_trgm ON worldbank_documents USING GIN (content gin_trgm_ops);

-- Partial indexes for common search patterns
CREATE INDEX IF NOT EXISTS idx_worldbank_title_prefix ON worldbank_documents (lower(title) text_pattern_ops);

-- Autocomplete functions (run after pg_trgm is installed)
-- These provide fuzzy matching for search suggestions
/*
CREATE OR REPLACE FUNCTION autocomplete_worldbank_titles(
  prefix TEXT,
  result_limit INTEGER DEFAULT 10
)
RETURNS TABLE(title TEXT, similarity_score REAL) AS $$
  SELECT
    wb.title,
    similarity(wb.title, prefix) as similarity_score
  FROM worldbank_documents wb
  WHERE wb.title % prefix
  ORDER BY similarity_score DESC, wb.title
  LIMIT result_limit;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION autocomplete_worldbank_content(
  search_term TEXT,
  result_limit INTEGER DEFAULT 10
)
RETURNS TABLE(title TEXT, content_snippet TEXT, similarity_score REAL) AS $$
  SELECT
    wb.title,
    substring(wb.content, 1, 200) as content_snippet,
    similarity(wb.content, search_term) as similarity_score
  FROM worldbank_documents wb
  WHERE wb.content % search_term
  ORDER BY similarity_score DESC
  LIMIT result_limit;
$$ LANGUAGE sql STABLE;
*/

-- Create search function
CREATE OR REPLACE FUNCTION search_worldbank_documents(
  search_query TEXT,
  result_limit INTEGER DEFAULT 10
)
RETURNS SETOF worldbank_documents AS $$
  SELECT *
  FROM worldbank_documents
  WHERE to_tsvector('english', title || ' ' || content) @@ plainto_tsquery('english', search_query)
  ORDER BY ts_rank(to_tsvector('english', title || ' ' || content), plainto_tsquery('english', search_query)) DESC
  LIMIT result_limit;
$$ LANGUAGE sql STABLE;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_worldbank_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_worldbank_documents_updated_at
  BEFORE UPDATE ON worldbank_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_worldbank_updated_at();

-- Comments for documentation
COMMENT ON TABLE worldbank_documents IS 'Scraped World Bank strategy documents with full metadata, tagging, and source tracking';
COMMENT ON COLUMN worldbank_documents.source_original_url IS 'Original URL where document was published';
COMMENT ON COLUMN worldbank_documents.source_scraped_from IS 'Page where we discovered this document';
COMMENT ON COLUMN worldbank_documents.source_parent_page IS 'Parent page that linked to the discovery page';
COMMENT ON COLUMN worldbank_documents.source_link_text IS 'Exact text of the link that was clicked';
COMMENT ON COLUMN worldbank_documents.tags_initiatives IS 'World Bank initiatives/projects mentioned (includes P-codes)';

