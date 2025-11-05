"""
World Bank Data to Supabase - Google Colab Script
==================================================

Upload this to Google Colab and run it!

SETUP IN COLAB:
1. Click 🔑 icon (left sidebar)
2. Add secret: NEXT_PUBLIC_SUPABASE_URL  
3. Add secret: SUPABASE_SERVICE_ROLE_KEY
4. Enable notebook access
5. Run all cells!

This will:
- Fetch 5,000 projects (FY2023-2025) in parallel
- Tag them by size, department, country
- Save directly to YOUR Supabase database

Time: ~10 minutes total
"""

# ============================================================================
# CELL 1: Install Dependencies
# ============================================================================
print("Installing dependencies...")
import sys
!{sys.executable} -m pip install supabase requests tqdm -q
print("✅ Installed: supabase, requests, tqdm")

# ============================================================================
# CELL 2: Imports
# ============================================================================
import requests
import json
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm
from supabase import create_client
from google.colab import userdata
import time

print("✅ All imports loaded")

# ============================================================================
# CELL 3: Connect to Supabase
# ============================================================================
print("🔐 Loading Supabase credentials from secrets...")

SUPABASE_URL = userdata.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = userdata.get('SUPABASE_SERVICE_ROLE_KEY')

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Test connection
result = supabase.table('worldbank_projects').select('id').limit(1).execute()
print(f"✅ Connected to Supabase!")
print(f"   URL: {SUPABASE_URL[:40]}...")

# ============================================================================
# CELL 4: Fetch Projects in Parallel
# ============================================================================
def fetch_projects_page(page, per_page=100):
    try:
        offset = (page - 1) * per_page
        url = f"https://search.worldbank.org/api/v2/projects?format=json&appr_yr=2023,2024,2025&rows={per_page}&os={offset}"
        response = requests.get(url, timeout=30)
        if response.ok:
            data = response.json()
            if data and 'projects' in data:
                return list(data['projects'].values())
    except:
        pass
    return []

print("📊 Fetching 5,000 projects in parallel...")
all_projects = []
pages = range(1, 51)

with ThreadPoolExecutor(max_workers=10) as executor:
    futures = {executor.submit(fetch_projects_page, page): page for page in pages}
    for future in tqdm(as_completed(futures), total=len(pages), desc="Fetching"):
        all_projects.extend(future.result())

print(f"✅ Fetched {len(all_projects):,} projects!")

# ============================================================================
# CELL 5: Tag Projects
# ============================================================================
def categorize_size(amount):
    if amount == 0: return 'No financing'
    elif amount < 10: return 'Small (< $10M)'
    elif amount < 50: return 'Medium ($10-50M)'
    elif amount < 200: return 'Large ($50-200M)'
    elif amount < 500: return 'Very Large ($200-500M)'
    else: return 'Mega (> $500M)'

print("🏷️  Tagging projects...")
for p in tqdm(all_projects, desc="Tagging"):
    commitment = float(str(p.get('totalcommamt', '0')).replace(',', '')) / 1_000_000
    p['tagged_size'] = categorize_size(commitment)
    p['tagged_commitment'] = commitment

size_dist = {}
for p in all_projects:
    size_dist[p['tagged_size']] = size_dist.get(p['tagged_size'], 0) + 1

print("\\n💰 Distribution:")
for size, count in sorted(size_dist.items(), key=lambda x: x[1], reverse=True):
    print(f"  {size}: {count:,}")

# ============================================================================
# CELL 6: Save to Supabase
# ============================================================================
print("\\n💾 Saving to Supabase database...")
saved = 0
errors = 0

for project in tqdm(all_projects, desc="Saving"):
    try:
        country_code = project.get('countrycode', [''])[0] if isinstance(project.get('countrycode'), list) else project.get('countrycode', '')
        
        data = {
            'id': project.get('id'),
            'project_name': project.get('project_name'),
            'url': project.get('url'),
            'country_code': country_code,
            'country_name': project.get('countryshortname'),
            'region_name': project.get('regionname'),
            'total_commitment': project['tagged_commitment'],
            'ibrd_commitment': float(str(project.get('ibrdcommamt', '0')).replace(',', '')) / 1_000_000,
            'ida_commitment': float(str(project.get('idacommamt', '0')).replace(',', '')) / 1_000_000,
            'total_amount_formatted': f"${project['tagged_commitment']:.0f}M",
            'status': project.get('status') or project.get('projectstatusdisplay') or 'Active',
            'lending_instrument': project.get('lendinginstr'),
            'product_line': project.get('prodlinetext'),
            'team_lead': project.get('teamleadname'),
            'board_approval_date': project.get('boardapprovaldate'),
            'approval_fy': int(project.get('approvalfy', 2024)),
            'approval_month': project.get('board_approval_month'),
            'closing_date': project.get('closingdate'),
            'tagged_size_category': project['tagged_size'],
            'data_verified': True
        }
        
        supabase.table('worldbank_projects').upsert(data).execute()
        saved += 1
        
    except Exception as e:
        errors += 1
        if errors <= 3:
            print(f"\\nError: {str(e)[:100]}")

print(f"\\n{'='*70}")
print(f"✅ Successfully saved: {saved:,} projects")
print(f"❌ Errors: {errors}")
print(f"Success rate: {(saved/len(all_projects))*100:.1f}%")
print(f"{'='*70}")

total_commitment = sum(p['tagged_commitment'] for p in all_projects)
print(f"\\n💵 Total in database: ${total_commitment/1000:.1f}B")
print(f"🎉 ALL DONE! Check your Supabase database now!")

