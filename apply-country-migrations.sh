#!/bin/bash

# ============================================================================
# Apply Country Economic & Demographics Migrations
# ============================================================================

echo "============================================================"
echo "🌍 COUNTRY PAGE FIX - APPLY MIGRATIONS"
echo "============================================================"
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ ERROR: .env.local file not found${NC}"
    echo "   Please create .env.local with your Supabase credentials"
    exit 1
fi

echo "📋 This script will:"
echo "  1. Apply country indicators migration (demographics)"
echo "  2. Apply economic structure migration"
echo "  3. Optionally fetch data from World Bank API"
echo ""

# Check if supabase CLI is installed
if command -v supabase &> /dev/null; then
    echo -e "${GREEN}✅ Supabase CLI found${NC}"
    echo ""
    echo "🚀 Applying migrations..."
    echo ""
    
    supabase db push
    
    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ Migrations applied successfully!${NC}"
    else
        echo ""
        echo -e "${RED}❌ Migration failed${NC}"
        echo ""
        echo "Please apply migrations manually:"
        echo "  1. Go to Supabase Dashboard → SQL Editor"
        echo "  2. Run: supabase/migrations/20241105210000_add_country_indicators.sql"
        echo "  3. Run: supabase/migrations/20241105220000_add_economic_structure.sql"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Supabase CLI not found${NC}"
    echo ""
    echo "Please apply migrations manually:"
    echo "  1. Go to Supabase Dashboard → SQL Editor"
    echo "  2. Run: supabase/migrations/20241105210000_add_country_indicators.sql"
    echo "  3. Run: supabase/migrations/20241105220000_add_economic_structure.sql"
    echo ""
    echo "Or install Supabase CLI:"
    echo "  npm install -g supabase"
    echo ""
    exit 1
fi

echo ""
echo "============================================================"
echo "📊 FETCH DATA (Optional)"
echo "============================================================"
echo ""
echo "Would you like to fetch country data from World Bank API?"
echo "This will populate:"
echo "  - Demographics (life expectancy, literacy, etc.)"
echo "  - Economic structure (GDP sectors, natural resources, etc.)"
echo ""
read -p "Fetch data now? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo ""
    echo "🔄 Fetching country indicators..."
    npx tsx scripts/fetch-country-indicators.ts
    
    echo ""
    echo "🔄 Fetching economic structure..."
    npx tsx scripts/fetch-country-economic-structure.ts
    
    echo ""
    echo -e "${GREEN}✅ Data fetched successfully!${NC}"
fi

echo ""
echo "============================================================"
echo "🧪 TEST YOUR COUNTRY PAGE"
echo "============================================================"
echo ""
echo "1. Start dev server:"
echo "   npm run dev"
echo ""
echo "2. Open browser console at http://localhost:3001/countries"
echo "   Run: localStorage.clear()"
echo "   Refresh page"
echo ""
echo "3. Click on any country to see:"
echo "   ✅ Demographics & Development Indicators"
echo "   ✅ Economic Structure"
echo "   ✅ Natural Resources"
echo "   ✅ Trade Data"
echo ""
echo -e "${GREEN}Done! Your country page is ready to use. 🎉${NC}"
echo ""


