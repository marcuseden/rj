-- Remove Duplicate Entries from Org Chart
-- Fixes issue where some people appear multiple times

-- Remove duplicate Makhtar Diop entry
-- Keep the one in Executive team, remove the one in Global Practices
DELETE FROM worldbank_orgchart 
WHERE id = 'makhtar-diop-infrastructure';

-- Verification
DO $$
BEGIN
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'DUPLICATE REMOVAL COMPLETE';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Removed duplicate entry: makhtar-diop-infrastructure';
  RAISE NOTICE '';
  RAISE NOTICE 'Makhtar Diop now appears only once in Executive team';
  RAISE NOTICE '============================================================';
END $$;

-- Refresh materialized view
REFRESH MATERIALIZED VIEW worldbank_department_details;

