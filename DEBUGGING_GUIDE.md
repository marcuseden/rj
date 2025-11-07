# 🐛 Debugging Guide - Page Loading Issues

## Current Status

All code fixes have been applied. Logging has been added to track the exact point where pages get stuck.

## How to Debug

### 1. Open Browser Console
- **Chrome/Edge**: Press `F12` or `Cmd+Option+I` (Mac)
- Go to the **Console** tab

### 2. Navigate to Pages

#### For Countries List Page:
- Go to: `http://localhost:3001/countries`
- Watch for these logs in order:

```
🌍 Loading countries...
🔌 Creating Supabase client...
✅ Client created
🔍 Starting query to worldbank_countries...
📊 Query complete. Data: 211 Error: null
✅ Loaded 211 countries from database
💾 Caching data to localStorage...
✅ Data cached
📝 Setting state with countries...
✅ State updated
```

#### For Individual Country Page:
- Go to: `http://localhost:3001/country/Ukraine`
- Watch for these logs:

```
🎬 [Country Page] useEffect triggered, countryName: Ukraine
🔍 [Country Page] Decoded country name: Ukraine
🌍 [Country Page] Starting fetch for: Ukraine
🔌 [Country Page] Creating Supabase client...
📊 [Country Page] Fetching country data from worldbank_countries...
✅ [Country Page] Country data loaded: Ukraine
📋 [Country Page] Fetching projects from worldbank_projects...
✅ [Country Page] Projects loaded: 3
✅ [Country Page] Data transformation complete
✅ [Country Page] State updated, rendering page
🏁 [Country Page] Fetch complete, loading: false
```

#### For Knowledge/Search Page:
- Go to: `http://localhost:3001/worldbank-search`
- Watch for these logs:

```
🎬 [Search Page] Component mounting/rendering
🔍 [Search Page] Cache key: ...
🔍 [Search Page] Search params: {...}
🎛️ [Search Page] Fetching filters...
📡 [Search Page] Fetching filters from API...
✅ [Search Page] Filters loaded: 5 keys
📡 [Search Page] Fetching search results...
✅ [Search Page] Search results loaded: 20 items
📊 [Search Page] Render state: {...}
```

### 3. What to Look For

#### If Spinner Keeps Showing:
Look for the **LAST** log message before it stops. This tells you where it's stuck:

**Stuck after "📡 Fetching from Supabase..."**
- The Supabase query is hanging
- Check network tab for pending requests
- Possible RLS policy issue

**Stuck after "Query complete"**
- Data is arriving but state not updating
- Check if data is null or empty
- React rendering issue

**Logs show error**
- Copy the full error message
- Check if it mentions RLS, permissions, or "not found"

### 4. Common Issues & Fixes

#### Error: "permission denied for table..."
- RLS policy not applied
- Run the SQL from `apply_rls_fixes.sql` in Supabase Dashboard

#### Error: "column does not exist"
- Database schema mismatch
- Check column names in error vs code

#### Logs stop at "Creating client"
- Supabase credentials issue
- Check `.env.local` has correct values

#### Page loads but shows no data
- Query succeeds but returns empty
- Check filters or search params

### 5. Testing Checklist

Once you see all logs complete:

- [ ] Countries page loads and shows country cards
- [ ] Can click on a country card
- [ ] Individual country page shows data and projects
- [ ] Search page loads with results
- [ ] Can filter and search on knowledge page

### 6. If Still Stuck

Share the **complete console output** showing:
1. First log message
2. Last log message before it stops
3. Any error messages (in red)
4. Network tab showing any pending/failed requests

---

**Note**: After server restart, hard refresh the browser (`Cmd+Shift+R` or `Ctrl+F5`) to clear old cached code.






