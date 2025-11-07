#!/bin/bash

# ============================================================================
# Clear Cache and Rebuild Application
# ============================================================================

echo "============================================================"
echo "🧹 CLEARING CACHE AND REBUILDING APPLICATION"
echo "============================================================"

# Stop any running Next.js processes
echo ""
echo "⏹️  Stopping running processes..."
pkill -f "next dev" || true
pkill -f "next" || true
sleep 2

# Clear Next.js cache
echo ""
echo "🗑️  Clearing Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache

# Clear browser localStorage instruction
echo ""
echo "📝 Browser Cache Instructions:"
echo "   Please open your browser console and run:"
echo "   localStorage.clear();"
echo "   Then refresh the page"
echo ""

# Rebuild
echo "🔨 Rebuilding application..."
npm run build

echo ""
echo "============================================================"
echo "✅ CACHE CLEARED AND REBUILD COMPLETE"
echo "============================================================"
echo ""
echo "To start the dev server, run:"
echo "  npm run dev"
echo ""
echo "Or to run the production build:"
echo "  npm start"
echo ""
echo "============================================================"






