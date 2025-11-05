-- Check if project data exists in database
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE '%project%';
