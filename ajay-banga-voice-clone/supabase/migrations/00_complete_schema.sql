-- ============================================================================
-- CEO ALIGNMENT CHECKER - COMPLETE DATABASE SCHEMA
-- ============================================================================

-- ============================================================================
-- 1. USER PROFILES (extends Supabase auth.users)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company TEXT,
  role TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- 2. CEO PROFILES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ceo_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  vision_statement TEXT,
  values TEXT[],
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  total_speeches INTEGER DEFAULT 0
);

-- ============================================================================
-- 3. SPEECHES (Simple storage for uploaded/scraped speeches)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.speeches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ceo_profile_id UUID REFERENCES public.ceo_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  date DATE,
  word_count INTEGER,
  uploaded_by UUID REFERENCES auth.users(id),
  source_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- 4. ANALYSIS HISTORY
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.analysis_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ceo_profile_id UUID REFERENCES public.ceo_profiles(id),
  original_content TEXT NOT NULL,
  rewritten_content TEXT,
  alignment_score INTEGER,
  analysis_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- 5. WORLDBANK DOCUMENTS (Complete scraping system)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.worldbank_documents (
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

  -- RJ Banga Strategic Metadata (Phase 2 Expansion)
  rj_banga_initiative TEXT,
  strategic_priority_level INTEGER CHECK (strategic_priority_level BETWEEN 1 AND 5),
  implementation_timeline TEXT,
  stakeholder_impact TEXT,
  budget_allocation DECIMAL(15,2),
  success_metrics TEXT,
  regional_focus TEXT[] DEFAULT '{}',
  sector_alignment TEXT[] DEFAULT '{}',
  innovation_category TEXT,
  change_management_phase TEXT,
  
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
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- User profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);

-- CEO profiles
CREATE INDEX IF NOT EXISTS idx_ceo_profiles_active ON public.ceo_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_ceo_profiles_company ON public.ceo_profiles(company);

-- Speeches
CREATE INDEX IF NOT EXISTS idx_speeches_ceo ON public.speeches(ceo_profile_id);
CREATE INDEX IF NOT EXISTS idx_speeches_date ON public.speeches(date DESC);

-- Analysis history
CREATE INDEX IF NOT EXISTS idx_analysis_user ON public.analysis_history(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_date ON public.analysis_history(created_at DESC);

-- Worldbank documents (for fast searching)
CREATE INDEX IF NOT EXISTS idx_worldbank_date ON public.worldbank_documents(date DESC);
CREATE INDEX IF NOT EXISTS idx_worldbank_type ON public.worldbank_documents(type);
CREATE INDEX IF NOT EXISTS idx_worldbank_doc_type ON public.worldbank_documents(tags_document_type);
CREATE INDEX IF NOT EXISTS idx_worldbank_priority ON public.worldbank_documents(tags_priority);
CREATE INDEX IF NOT EXISTS idx_worldbank_sectors ON public.worldbank_documents USING GIN(tags_sectors);
CREATE INDEX IF NOT EXISTS idx_worldbank_initiatives ON public.worldbank_documents USING GIN(tags_initiatives);
CREATE INDEX IF NOT EXISTS idx_worldbank_authors ON public.worldbank_documents USING GIN(tags_authors);
CREATE INDEX IF NOT EXISTS idx_worldbank_topics ON public.worldbank_documents USING GIN(topics);
CREATE INDEX IF NOT EXISTS idx_worldbank_keywords ON public.worldbank_documents USING GIN(keywords);

-- Full text search index
CREATE INDEX IF NOT EXISTS idx_worldbank_content_search 
  ON public.worldbank_documents 
  USING GIN(to_tsvector('english', title || ' ' || content));

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) - BEST PRACTICES
-- ============================================================================

-- Enable RLS on all tables (security by default)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ceo_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speeches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worldbank_documents ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owners (prevents accidental bypass)
ALTER TABLE public.user_profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.ceo_profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.speeches FORCE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_history FORCE ROW LEVEL SECURITY;
ALTER TABLE public.worldbank_documents FORCE ROW LEVEL SECURITY;

-- ============================================================================
-- USER PROFILES POLICIES - Users can only access their own profile
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" 
  ON public.user_profiles FOR SELECT 
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" 
  ON public.user_profiles FOR UPDATE 
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile" 
  ON public.user_profiles FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users cannot delete profiles" ON public.user_profiles;
CREATE POLICY "Users cannot delete profiles" 
  ON public.user_profiles FOR DELETE 
  TO authenticated
  USING (false);

-- ============================================================================
-- CEO PROFILES POLICIES - Read-only for authenticated users
-- ============================================================================

DROP POLICY IF EXISTS "Authenticated users can view active CEO profiles" ON public.ceo_profiles;
CREATE POLICY "Authenticated users can view active CEO profiles" 
  ON public.ceo_profiles FOR SELECT 
  TO authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "Prevent unauthorized CEO profile modifications" ON public.ceo_profiles;
CREATE POLICY "Prevent unauthorized CEO profile modifications" 
  ON public.ceo_profiles FOR ALL 
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- Service role can manage CEO profiles
DROP POLICY IF EXISTS "Service role can manage CEO profiles" ON public.ceo_profiles;
CREATE POLICY "Service role can manage CEO profiles" 
  ON public.ceo_profiles FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- SPEECHES POLICIES - Read-only for authenticated users
-- ============================================================================

DROP POLICY IF EXISTS "Authenticated users can view speeches" ON public.speeches;
CREATE POLICY "Authenticated users can view speeches" 
  ON public.speeches FOR SELECT 
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Prevent unauthorized speech modifications" ON public.speeches;
CREATE POLICY "Prevent unauthorized speech modifications" 
  ON public.speeches FOR ALL 
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- Service role can manage speeches
DROP POLICY IF EXISTS "Service role can manage speeches" ON public.speeches;
CREATE POLICY "Service role can manage speeches" 
  ON public.speeches FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- WORLDBANK DOCUMENTS POLICIES - Read-only for authenticated users
-- ============================================================================

DROP POLICY IF EXISTS "Authenticated users can view worldbank documents" ON public.worldbank_documents;
CREATE POLICY "Authenticated users can view worldbank documents" 
  ON public.worldbank_documents FOR SELECT 
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Prevent unauthorized worldbank document modifications" ON public.worldbank_documents;
CREATE POLICY "Prevent unauthorized worldbank document modifications" 
  ON public.worldbank_documents FOR ALL 
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- Service role can manage worldbank documents
DROP POLICY IF EXISTS "Service role can manage worldbank documents" ON public.worldbank_documents;
CREATE POLICY "Service role can manage worldbank documents" 
  ON public.worldbank_documents FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- ANALYSIS HISTORY POLICIES - Users can only access their own analysis
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own analysis" ON public.analysis_history;
CREATE POLICY "Users can view own analysis" 
  ON public.analysis_history FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own analysis" ON public.analysis_history;
CREATE POLICY "Users can insert own analysis" 
  ON public.analysis_history FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own analysis" ON public.analysis_history;
CREATE POLICY "Users can update own analysis" 
  ON public.analysis_history FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own analysis" ON public.analysis_history;
CREATE POLICY "Users can delete own analysis" 
  ON public.analysis_history FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Full text search function for worldbank documents
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

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger for user_profiles.updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON public.user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for ceo_profiles.updated_at
DROP TRIGGER IF EXISTS update_ceo_profiles_updated_at ON public.ceo_profiles;
CREATE TRIGGER update_ceo_profiles_updated_at 
  BEFORE UPDATE ON public.ceo_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for worldbank_documents.updated_at
DROP TRIGGER IF EXISTS update_worldbank_documents_updated_at ON public.worldbank_documents;
CREATE TRIGGER update_worldbank_documents_updated_at
  BEFORE UPDATE ON public.worldbank_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA - Ajay Banga CEO Profile
-- ============================================================================

INSERT INTO public.ceo_profiles (
  name, 
  title, 
  company, 
  vision_statement, 
  values, 
  is_active,
  total_speeches
)
VALUES (
  'Ajay Banga',
  'President',
  'World Bank Group',
  'Creating a world free of poverty on a livable planet through partnership, innovation, and measurable results. The World Bank Group mission is to ensure that job creation is not a byproduct of our projects but an explicit aim, driving development through collaboration between governments, private sector, and development banks.',
  ARRAY['Partnership', 'Accountability', 'Innovation', 'Equity', 'Sustainability', 'Results-Driven'],
  true,
  14
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.worldbank_documents IS 'Scraped World Bank strategy documents with full metadata, tagging, and source tracking';
COMMENT ON TABLE public.ceo_profiles IS 'CEO information including vision, values, and configuration';
COMMENT ON TABLE public.speeches IS 'CEO speeches and statements for analysis';
COMMENT ON TABLE public.analysis_history IS 'User content analysis results and history';
COMMENT ON TABLE public.user_profiles IS 'Extended user profile information';

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

-- Run this to verify all tables were created successfully:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

