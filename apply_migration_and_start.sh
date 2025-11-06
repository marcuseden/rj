#!/bin/bash

# ============================================================================
# Apply Supabase Migration and Start Dev Server
# ============================================================================

echo "============================================================"
echo "🚀 APPLYING MIGRATION AND STARTING SERVER"
echo "============================================================"

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ ERROR: .env.local file not found"
    echo "   Please create .env.local with your Supabase credentials"
    exit 1
fi

# Source environment variables
source .env.local

echo ""
echo "📊 Applying search optimization migration to Supabase..."
echo ""

# Check if supabase CLI is installed
if command -v supabase &> /dev/null; then
    echo "Using Supabase CLI..."
    supabase db push
else
    echo "⚠️  Supabase CLI not found. Migration will be applied manually."
    echo ""
    echo "Please apply the migration manually:"
    echo "  1. Go to your Supabase Dashboard"
    echo "  2. Navigate to SQL Editor"
    echo "  3. Copy and paste the content from:"
    echo "     supabase/migrations/20241105190000_optimize_search_indexes.sql"
    echo "  4. Run the SQL"
    echo ""
fi

echo ""
echo "============================================================"
echo "🔧 STARTING DEVELOPMENT SERVER"
echo "============================================================"
echo ""
echo "🌐 Open http://localhost:3000 in your browser"
echo ""
echo "To test the search:"
echo "  1. Go to http://localhost:3000/worldbank-search"
echo "  2. Open browser console and run: localStorage.clear()"
echo "  3. Refresh the page"
echo "  4. Try searching for countries, people, or projects"
echo ""
echo "============================================================"
echo ""

# Start the dev server
npm run dev


