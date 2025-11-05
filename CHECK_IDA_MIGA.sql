-- Check if IDA and MIGA were successfully added
SELECT 
  id, 
  name, 
  position, 
  level, 
  parent_id, 
  department,
  is_active
FROM worldbank_orgchart 
WHERE department IN ('IDA', 'MIGA')
ORDER BY level, sort_order;

-- Also check all level 2 departments (should include IDA and MIGA)
SELECT 
  id, 
  name, 
  position, 
  level,
  department
FROM worldbank_orgchart 
WHERE level = 2
ORDER BY sort_order;

