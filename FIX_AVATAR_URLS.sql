-- Fix avatar URLs to point to correct /avatars/ directory
-- Run this in your Supabase SQL editor

-- Update Ajay Banga's avatar
UPDATE worldbank_orgchart_hierarchy
SET avatar_url = '/avatars/ajay-banga.jpg'
WHERE id = 'ajay-banga' OR name LIKE '%Ajay Banga%';

-- Update Anna Bjerde's avatar
UPDATE worldbank_orgchart_hierarchy
SET avatar_url = '/avatars/anna-bjerde.jpg'
WHERE name LIKE '%Anna Bjerde%';

-- Update Anshula Kant's avatar
UPDATE worldbank_orgchart_hierarchy
SET avatar_url = '/avatars/anshula-kant.jpg'
WHERE name LIKE '%Anshula Kant%';

-- Update Arup Banerji's avatar
UPDATE worldbank_orgchart_hierarchy
SET avatar_url = '/avatars/arup-banerji.jpg'
WHERE name LIKE '%Arup Banerji%';

-- Update Axel van Trotsenburg's avatar
UPDATE worldbank_orgchart_hierarchy
SET avatar_url = '/avatars/axel-van-trotsenburg.jpg'
WHERE name LIKE '%Axel%Trotsenburg%';

-- Update Christopher Stephens' avatar
UPDATE worldbank_orgchart_hierarchy
SET avatar_url = '/avatars/christopher-stephens.jpg'
WHERE name LIKE '%Christopher%Stephens%';

-- Update Ernesto Silva's avatar
UPDATE worldbank_orgchart_hierarchy
SET avatar_url = '/avatars/ernesto-silva.jpg'
WHERE name LIKE '%Ernesto Silva%';

-- Update Ferid Belhaj's avatar
UPDATE worldbank_orgchart_hierarchy
SET avatar_url = '/avatars/ferid-belhaj.jpg'
WHERE name LIKE '%Ferid Belhaj%';

-- Update Hailegabriel Abegaz's avatar
UPDATE worldbank_orgchart_hierarchy
SET avatar_url = '/avatars/hailegabriel-abegaz.jpg'
WHERE name LIKE '%Hailegabriel%';

-- Update Hartwig Schafer's avatar
UPDATE worldbank_orgchart_hierarchy
SET avatar_url = '/avatars/hartwig-schafer.jpg'
WHERE name LIKE '%Hartwig%';

-- Update Indermit Gill's avatar
UPDATE worldbank_orgchart_hierarchy
SET avatar_url = '/avatars/indermit-gill.jpg'
WHERE name LIKE '%Indermit Gill%';

-- Update Jaime Saavedra's avatar
UPDATE worldbank_orgchart_hierarchy
SET avatar_url = '/avatars/jaime-saavedra.jpg'
WHERE name LIKE '%Jaime Saavedra%';

-- Update Juergen Voegele's avatar
UPDATE worldbank_orgchart_hierarchy
SET avatar_url = '/avatars/juergen-voegele.jpg'
WHERE name LIKE '%Juergen%' OR name LIKE '%Voegele%';

-- Update Junaid Kamal Ahmad's avatar
UPDATE worldbank_orgchart_hierarchy
SET avatar_url = '/avatars/junaid-kamal-ahmad.jpg'
WHERE name LIKE '%Junaid%Ahmad%';

-- Update Makhtar Diop's avatar
UPDATE worldbank_orgchart_hierarchy
SET avatar_url = '/avatars/makhtar-diop.jpg'
WHERE name LIKE '%Makhtar Diop%';

-- Update Mamta Murthi's avatar
UPDATE worldbank_orgchart_hierarchy
SET avatar_url = '/avatars/mamta-murthi.jpg'
WHERE name LIKE '%Mamta Murthi%';

-- Verify the updates
SELECT id, name, avatar_url 
FROM worldbank_orgchart_hierarchy 
WHERE avatar_url IS NOT NULL
ORDER BY name;






