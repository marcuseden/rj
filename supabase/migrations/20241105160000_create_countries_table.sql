
    CREATE TABLE IF NOT EXISTS worldbank_countries (
      id TEXT PRIMARY KEY,
      iso2_code TEXT UNIQUE NOT NULL,
      iso3_code TEXT,
      name TEXT NOT NULL,
      region TEXT NOT NULL,
      region_code TEXT,
      income_level TEXT,
      income_level_code TEXT,
      lending_type TEXT,
      capital_city TEXT,
      latitude TEXT,
      longitude TEXT,
      
      -- Portfolio data (from API)
      portfolio_value DECIMAL,
      portfolio_value_formatted TEXT,
      active_projects INTEGER DEFAULT 0,
      ibrd_amount DECIMAL DEFAULT 0,
      ida_amount DECIMAL DEFAULT 0,
      
      -- Regional assignment
      regional_vp_id TEXT,
      regional_vp_name TEXT,
      
      -- Recent projects (JSONB)
      recent_projects JSONB,
      
      -- Focus areas
      sector_focus TEXT[],
      theme_focus TEXT[],
      
      -- Metadata
      data_verified BOOLEAN DEFAULT true,
      last_api_fetch TIMESTAMPTZ DEFAULT NOW(),
      api_source TEXT DEFAULT 'World Bank API v2',
      
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_countries_region ON worldbank_countries (region);
    CREATE INDEX IF NOT EXISTS idx_countries_income ON worldbank_countries (income_level);
    CREATE INDEX IF NOT EXISTS idx_countries_vp ON worldbank_countries (regional_vp_id);
    CREATE INDEX IF NOT EXISTS idx_countries_iso2 ON worldbank_countries (iso2_code);
    
    ALTER TABLE worldbank_countries ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Allow public read access to countries" ON worldbank_countries;
    CREATE POLICY "Allow public read access to countries" 
    ON worldbank_countries FOR SELECT USING (true);
    
    GRANT SELECT ON worldbank_countries TO authenticated, anon;
  