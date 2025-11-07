#!/bin/bash

# ============================================================
# INSTANT LOADING SETUP SCRIPT
# ============================================================
# This script sets up the optimized search and orgchart system
# ============================================================

set -e  # Exit on error

echo "============================================================"
echo "🚀 INSTANT LOADING OPTIMIZATION SETUP"
echo "============================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check if Supabase CLI is available
echo -e "${BLUE}Step 1: Checking Supabase CLI...${NC}"
if ! command -v supabase &> /dev/null; then
    echo -e "${YELLOW}⚠️  Supabase CLI not found. Install it or apply migration manually.${NC}"
    echo "   Visit: https://supabase.com/docs/guides/cli"
    SKIP_MIGRATION=true
else
    echo -e "${GREEN}✅ Supabase CLI found${NC}"
    SKIP_MIGRATION=false
fi
echo ""

# Step 2: Apply database migration
if [ "$SKIP_MIGRATION" = false ]; then
    echo -e "${BLUE}Step 2: Applying database migration...${NC}"
    
    # Check if we're in a Supabase project
    if [ -f "supabase/config.toml" ]; then
        echo "   Running: supabase db push"
        supabase db push
        echo -e "${GREEN}✅ Migration applied${NC}"
    else
        echo -e "${YELLOW}⚠️  Not a Supabase project. Apply migration manually:${NC}"
        echo "   psql \$DATABASE_URL -f supabase/migrations/20241106000000_optimize_search_performance.sql"
    fi
else
    echo -e "${BLUE}Step 2: Database migration (manual)${NC}"
    echo -e "${YELLOW}Apply manually:${NC}"
    echo "   psql \$DATABASE_URL -f supabase/migrations/20241106000000_optimize_search_performance.sql"
fi
echo ""

# Step 3: Verify dependencies
echo -e "${BLUE}Step 3: Checking dependencies...${NC}"
if [ -f "package.json" ]; then
    if grep -q "\"swr\"" package.json && grep -q "\"@tanstack/react-virtual\"" package.json; then
        echo -e "${GREEN}✅ Dependencies already installed${NC}"
    else
        echo "   Installing dependencies..."
        npm install swr @tanstack/react-virtual
        echo -e "${GREEN}✅ Dependencies installed${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  package.json not found${NC}"
fi
echo ""

# Step 4: Test database connection
echo -e "${BLUE}Step 4: Testing database setup...${NC}"
echo "   You can test with:"
echo "   psql \$DATABASE_URL -c \"SELECT COUNT(*) FROM worldbank_unified_search;\""
echo ""

# Step 5: Start dev server
echo -e "${BLUE}Step 5: Starting development server...${NC}"
echo "   Run: npm run dev"
echo ""

echo "============================================================"
echo -e "${GREEN}✅ SETUP COMPLETE!${NC}"
echo "============================================================"
echo ""
echo "📚 Next steps:"
echo ""
echo "1. Apply migration (if not done automatically):"
echo "   supabase db push"
echo "   OR"
echo "   psql \$DATABASE_URL -f supabase/migrations/20241106000000_optimize_search_performance.sql"
echo ""
echo "2. Refresh materialized views:"
echo "   psql \$DATABASE_URL -c \"SELECT refresh_search_materialized_views();\""
echo ""
echo "3. Start dev server:"
echo "   npm run dev"
echo ""
echo "4. Test the pages:"
echo "   http://localhost:3001/worldbank-search"
echo "   http://localhost:3001/worldbank-orgchart"
echo ""
echo "📖 Full documentation: INSTANT_LOADING_COMPLETE.md"
echo "============================================================"






