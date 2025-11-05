-- Create World Bank Organizational Chart Table
-- Stores leadership hierarchy and organizational structure

CREATE TABLE IF NOT EXISTS worldbank_orgchart (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  level INTEGER NOT NULL,
  parent_id TEXT,
  reports_to TEXT,
  country TEXT,
  tenure TEXT,
  education TEXT[],
  linkedin_url TEXT,
  website_url TEXT,
  department TEXT,
  region TEXT,
  function TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_orgchart_level ON worldbank_orgchart (level);
CREATE INDEX idx_orgchart_parent ON worldbank_orgchart (parent_id);
CREATE INDEX idx_orgchart_department ON worldbank_orgchart (department);
CREATE INDEX idx_orgchart_active ON worldbank_orgchart (is_active);

-- Add foreign key constraint for self-referencing hierarchy
ALTER TABLE worldbank_orgchart
ADD CONSTRAINT fk_orgchart_parent
FOREIGN KEY (parent_id) REFERENCES worldbank_orgchart(id);

-- Enable Row Level Security
ALTER TABLE worldbank_orgchart ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access to orgchart" ON worldbank_orgchart
  FOR SELECT USING (true);

-- Insert initial leadership data
INSERT INTO worldbank_orgchart (id, name, position, avatar_url, bio, level, country, tenure, department, is_active, sort_order) VALUES
-- Level 1: President
('ajay-banga', 'Ajay Banga', 'President', '/avatars/ajay-banga.jpg', 'President of the World Bank Group since June 2023. Former CEO of Mastercard. Leading global efforts to end extreme poverty and promote shared prosperity.', 1, 'United States', '2023–Present', 'Executive', true, 1),

-- Level 2: Executive Leadership
('executive-team', 'Executive Leadership Team', 'Executive Vice Presidents', '/avatars/executives.jpg', 'Senior executive leadership team supporting the President in global operations.', 2, NULL, NULL, 'Executive', true, 1),
('regional-leaders', 'Regional Leadership', 'Regional Vice Presidents', '/avatars/regions.jpg', 'Regional leaders overseeing country programs and operations worldwide.', 2, NULL, NULL, 'Regional', true, 2),
('global-practices', 'Global Practices', 'Practice Leaders', '/avatars/practices.jpg', 'Technical experts leading sectoral knowledge and global standards.', 2, NULL, NULL, 'Global Practices', true, 3),
('corporate-functions', 'Corporate Functions', 'Corporate Leaders', '/avatars/corporate.jpg', 'Internal support functions and corporate governance.', 2, NULL, NULL, 'Corporate', true, 4),

-- Level 3: Individual Leaders
-- Executive Team
('axel-van-trotsenburg', 'Axel van Trotsenburg', 'Managing Director & COO', '/avatars/axel-van-trotsenburg.jpg', 'Chief Operating Officer overseeing operational excellence and institutional reforms.', 3, 'Netherlands', '2019–Present', 'Executive', true, 1),
('makhtar-diop', 'Makhtar Diop', 'Vice President, Infrastructure', '/avatars/makhtar-diop.jpg', 'Leading infrastructure investments across energy, transport, and urban development.', 3, 'Senegal', '2018–Present', 'Executive', true, 2),
('anna-bjerde', 'Anna Bjerde', 'Managing Director, Development Policy & Partnerships', '/avatars/anna-bjerde.jpg', 'Overseeing development policy, partnerships, and global engagement initiatives.', 3, 'Norway', '2022–Present', 'Executive', true, 3),
('mamta-murthi', 'Mamta Murthi', 'Vice President, Human Development', '/avatars/mamta-murthi.jpg', 'Leading human development initiatives including education, health, and social protection.', 3, 'India', '2023–Present', 'Executive', true, 4),

-- Regional Vice Presidents
('hailegabriel-abegaz', 'Hailegabriel G. Abegaz', 'Vice President, Africa Region', '/avatars/hailegabriel-abegaz.jpg', 'Leading World Bank operations in Eastern and Southern Africa.', 3, 'Ethiopia', '2024–Present', 'Regional', true, 1),
('junaid-kamal-ahmad', 'Junaid Kamal Ahmad', 'Vice President, East Asia & Pacific', '/avatars/junaid-kamal-ahmad.jpg', 'Overseeing development operations across East Asia and Pacific countries.', 3, 'Pakistan', '2023–Present', 'Regional', true, 2),
('arup-banerji', 'Arup Banerji', 'Vice President, Europe & Central Asia', '/avatars/arup-banerji.jpg', 'Leading World Bank engagement in Europe and Central Asia region.', 3, 'India', '2024–Present', 'Regional', true, 3),
('ernesto-silva', 'Ernesto Silva', 'Vice President, Latin America & Caribbean', '/avatars/ernesto-silva.jpg', 'Overseeing World Bank programs in Latin America and the Caribbean.', 3, 'Chile', '2024–Present', 'Regional', true, 4),
('ferid-belhaj', 'Ferid Belhaj', 'Vice President, Middle East & North Africa', '/avatars/ferid-belhaj.jpg', 'Leading development initiatives in Middle East and North Africa region.', 3, 'Tunisia', '2024–Present', 'Regional', true, 5),
('hartwig-schafer', 'Hartwig Schafer', 'Vice President, South Asia', '/avatars/hartwig-schafer.jpg', 'Managing World Bank operations across South Asian countries.', 3, 'Germany', '2023–Present', 'Regional', true, 6),

-- Global Practice Leaders
('jaime-saavedra', 'Jaime Saavedra', 'Practice Manager, Education', '/avatars/jaime-saavedra.jpg', 'Leading global education initiatives and knowledge sharing.', 3, 'Peru', '2022–Present', 'Global Practices', true, 1),
('armin-fidler', 'Armin Fidler', 'Practice Manager, Health', '/avatars/armin-fidler.jpg', 'Overseeing global health programs and pandemic preparedness.', 3, 'Germany', '2024–Present', 'Global Practices', true, 2),
('alfredo-gonzalez', 'Alfredo Gonzalez', 'Practice Manager, Finance', '/avatars/alfredo-gonzalez.jpg', 'Leading financial sector development and capital markets expertise.', 3, 'Colombia', '2023–Present', 'Global Practices', true, 3),
('makhtar-diop-infrastructure', 'Makhtar Diop', 'Vice President, Infrastructure', '/avatars/makhtar-diop.jpg', 'Managing global infrastructure investments and policy.', 3, 'Senegal', '2018–Present', 'Global Practices', true, 4),
('juergen-voegele', 'Juergen Voegele', 'Vice President, Climate Change', '/avatars/juergen-voegele.jpg', 'Leading climate change adaptation and mitigation efforts.', 3, 'Germany', '2023–Present', 'Global Practices', true, 5),

-- Corporate Function Leaders
('indermit-gill', 'Indermit Gill', 'Senior Managing Director & Chief Economist', '/avatars/indermit-gill.jpg', 'Chief Economist and leading economic research and analysis.', 3, 'India', '2022–Present', 'Corporate', true, 1),
('anshula-kant', 'Anshula Kant', 'Managing Director & CFO', '/avatars/anshula-kant.jpg', 'Chief Financial Officer managing the institution''s financial strategy.', 3, 'India', '2023–Present', 'Corporate', true, 2),
('christopher-stephens', 'Christopher H. Stephens', 'General Counsel', '/avatars/christopher-stephens.jpg', 'Leading legal affairs and institutional governance.', 3, 'Barbados', '2023–Present', 'Corporate', true, 3),
('adamou-labara', 'Adamou Labara', 'Director, Communications', '/avatars/adamou-labara.jpg', 'Managing external communications and stakeholder engagement.', 3, 'Cameroon', '2024–Present', 'Corporate', true, 4)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  position = EXCLUDED.position,
  avatar_url = EXCLUDED.avatar_url,
  bio = EXCLUDED.bio,
  level = EXCLUDED.level,
  country = EXCLUDED.country,
  tenure = EXCLUDED.tenure,
  department = EXCLUDED.department,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- Set parent relationships
UPDATE worldbank_orgchart SET parent_id = 'ajay-banga' WHERE level = 2;
UPDATE worldbank_orgchart SET parent_id = 'executive-team' WHERE level = 3 AND department = 'Executive';
UPDATE worldbank_orgchart SET parent_id = 'regional-leaders' WHERE level = 3 AND department = 'Regional';
UPDATE worldbank_orgchart SET parent_id = 'global-practices' WHERE level = 3 AND department = 'Global Practices';
UPDATE worldbank_orgchart SET parent_id = 'corporate-functions' WHERE level = 3 AND department = 'Corporate';

-- Create view for org chart hierarchy
CREATE VIEW worldbank_orgchart_hierarchy AS
SELECT
  o.*,
  COUNT(c.id) as children_count
FROM worldbank_orgchart o
LEFT JOIN worldbank_orgchart c ON c.parent_id = o.id
WHERE o.is_active = true
GROUP BY o.id, o.name, o.position, o.avatar_url, o.bio, o.level, o.parent_id, o.reports_to,
         o.country, o.tenure, o.education, o.department, o.region, o.function, o.is_active, o.sort_order
ORDER BY o.level, o.sort_order, o.name;

-- Grant access to the view
GRANT SELECT ON worldbank_orgchart_hierarchy TO authenticated;
GRANT SELECT ON worldbank_orgchart_hierarchy TO anon;
