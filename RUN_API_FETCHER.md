# 🚀 Fetch All Countries from World Bank API

## ✅ What's Ready

### Fixed Issues:
1. ✅ Column name corrected: `active_projects_count` (not `active_projects`)
2. ✅ Added donor country tracking (countries that contribute to IDA)
3. ✅ Updated API endpoint to correct World Bank search API
4. ✅ Filter for 2023-present projects only

### Migration Ready:
```
supabase/migrations/20241105160000_create_countries_table.sql
```

**Apply this in Supabase first!** It adds:
- Countries table with all fields
- Donor country columns (for high-income contributors)
- IDA contribution tracking

---

## 🔄 Run the Fetcher

After applying the migration, run:

```bash
npx tsx scripts/fetch-all-countries-worldbank-api.ts
```

### What It Will Do:

**For Each Country (211 total):**
1. ✅ Fetch basic country info (name, region, capital, coordinates)
2. ✅ Fetch economic indicators (income level, lending type)
3. ✅ Fetch active projects (2023-present only)
4. ✅ Calculate portfolio value
5. ✅ Identify donor countries (high income, no projects = they contribute)
6. ✅ Save to database

**Expected Output:**
```
[1/211] Processing: Afghanistan (AF)
  ✅ 15 active projects (2023+), $2.3B portfolio

[2/211] Processing: Albania (AL)
  ✅ 8 active projects (2023+), $450M portfolio

...

[25/211] Processing: Germany (DE)
  💰 Donor country (high income, contributes to IDA)

[26/211] Processing: United States (US)
  💰 Donor country (high income, contributes to IDA)

...

[150/211] Processing: Ukraine (UA)
  ✅ 45 active projects (2023+), $19.5B portfolio
```

**Time:** ~10-15 minutes (211 countries with rate limiting)

---

## 📊 What You'll Get

### Borrowing Countries (with projects):
- Portfolio value
- Active projects count (2023+)
- IBRD/IDA commitments
- Recent projects with details
- Sector breakdown

### Donor Countries (high income):
- Flagged as `is_donor_country: true`
- Show their IDA contributions
- Examples: USA, UK, Germany, Japan, Canada, etc.

### All Countries Get:
- ✅ Geographic data (capital, coordinates)
- ✅ Economic indicators
- ✅ Regional assignment
- ✅ 100% verified from World Bank API
- ✅ 2023-present data only

---

## 📝 After Fetching

Once complete, you can:

**1. View Any Country:**
```
http://localhost:3001/country/Ukraine
http://localhost:3001/country/Pakistan
http://localhost:3001/country/Kenya
```

**2. See Donor Countries:**
```
http://localhost:3001/country/United%20States
http://localhost:3001/country/Germany
```

**3. Query Database:**
```sql
-- Get all borrowing countries with projects
SELECT name, portfolio_value_formatted, active_projects_count
FROM worldbank_countries
WHERE active_projects_count > 0
ORDER BY portfolio_value DESC;

-- Get all donor countries
SELECT name, income_level
FROM worldbank_countries  
WHERE is_donor_country = true
ORDER BY name;

-- Get countries by region
SELECT name, active_projects_count, portfolio_value_formatted
FROM worldbank_countries
WHERE region = 'Europe & Central Asia'
ORDER BY active_projects_count DESC;
```

---

## 🎯 Next Steps

1. ✅ **Apply migration** in Supabase (20241105160000_create_countries_table.sql)
2. ⏳ **Run fetcher** (npx tsx scripts/fetch-all-countries-worldbank-api.ts)
3. ⏳ **Wait 10-15 min** while it fetches all 211 countries
4. ✅ **Test country pages** with real data!

---

## 💡 Why Some Countries Show "No Projects"

**Reasons:**
1. **Donor Countries**: High-income countries like USA, UK, Japan **give money** to World Bank, they don't borrow
2. **No Recent Projects**: Some countries have no projects approved in 2023-2024
3. **Graduated Countries**: Some countries graduated from World Bank lending

**We handle all cases:**
- Borrowers → Show projects and portfolio
- Donors → Show their contributions
- No recent activity → Show "No projects in 2023-2024"

---

**Ready to run!** Apply the migration first, then run the fetcher script. 🚀







