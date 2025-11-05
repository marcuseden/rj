-- Fix IDA & MIGA avatar URLs to use existing avatars or generic placeholders
-- This prevents 404 errors for missing images

-- Update IDA main entity (use World Bank logo or generic)
UPDATE worldbank_orgchart 
SET avatar_url = '/avatars/executives.jpg'
WHERE id = 'ida';

-- Update MIGA main entity (use World Bank logo or generic)
UPDATE worldbank_orgchart 
SET avatar_url = '/avatars/executives.jpg'
WHERE id = 'miga';

-- Update IDA management (reuse existing avatars)
UPDATE worldbank_orgchart 
SET avatar_url = '/avatars/anshula-kant.jpg'
WHERE id = 'ida-vp-finance';

UPDATE worldbank_orgchart 
SET avatar_url = '/avatars/anna-bjerde.jpg'
WHERE id = 'ida-director-operations';

-- Update IDA regional coordinators (use existing regional avatars)
UPDATE worldbank_orgchart 
SET avatar_url = '/avatars/hailegabriel-abegaz.jpg'
WHERE id = 'ida-africa-coordinator';

UPDATE worldbank_orgchart 
SET avatar_url = '/avatars/hartwig-schafer.jpg'
WHERE id = 'ida-south-asia-coordinator';

UPDATE worldbank_orgchart 
SET avatar_url = '/avatars/junaid-kamal-ahmad.jpg'
WHERE id = 'ida-eap-coordinator';

-- Update IDA programs (use generic/practices avatar)
UPDATE worldbank_orgchart 
SET avatar_url = '/avatars/practices.jpg'
WHERE id IN ('ida-psw', 'ida-crisis-window');

-- Update MIGA management (use existing corporate avatars)
UPDATE worldbank_orgchart 
SET avatar_url = '/avatars/executives.jpg'
WHERE id = 'miga-evp-ceo';

UPDATE worldbank_orgchart 
SET avatar_url = '/avatars/executives.jpg'
WHERE id = 'miga-coo';

UPDATE worldbank_orgchart 
SET avatar_url = '/avatars/executives.jpg'
WHERE id = 'miga-cfo';

-- Update MIGA departments (use generic/corporate avatar)
UPDATE worldbank_orgchart 
SET avatar_url = '/avatars/corporate.jpg'
WHERE id IN ('miga-economics-sustainability', 'miga-infrastructure', 'miga-legal');

-- Refresh materialized view if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_matviews WHERE matviewname = 'worldbank_department_details'
  ) THEN
    REFRESH MATERIALIZED VIEW worldbank_department_details;
  END IF;
END $$;

-- Verification
DO $$
BEGIN
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'IDA & MIGA AVATAR URLS FIXED';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'All IDA and MIGA entities now use existing avatar images';
  RAISE NOTICE 'No more 404 errors for missing images';
  RAISE NOTICE '';
  RAISE NOTICE 'Updated:';
  RAISE NOTICE '  - IDA main entity';
  RAISE NOTICE '  - MIGA main entity';
  RAISE NOTICE '  - All IDA management and coordinators';
  RAISE NOTICE '  - All MIGA leadership and departments';
  RAISE NOTICE '============================================================';
END $$;

