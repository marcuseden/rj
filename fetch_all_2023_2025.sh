#!/bin/bash

echo "=========================================================================="
echo "COMPREHENSIVE WORLD BANK DOCUMENT FETCH (2023-2025)"
echo "=========================================================================="
echo ""
echo "This will fetch 200-400 documents with FULL PDF content covering:"
echo "  • All Ajay Banga speeches (June 2023 onwards)"
echo "  • Annual Meetings 2023 & 2024"
echo "  • IDA21, Mission 300, Climate Finance"
echo "  • And 11 more comprehensive search strategies"
echo ""
echo "Expected time: 30-60 minutes"
echo ""
read -p "Ready to start? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo ""
    echo "🚀 Starting comprehensive fetch..."
    echo ""
    
    # Check dependencies
    if ! python3 -c "import pdfplumber" 2>/dev/null; then
        echo "📦 Installing dependencies first..."
        ./setup_pdf_fetcher.sh
        echo ""
    fi
    
    # Run comprehensive fetch
    python3 scripts/fetch_2023_2025_comprehensive.py
    
    echo ""
    echo "=========================================================================="
    echo "✅ DONE!"
    echo "=========================================================================="
    echo ""
    echo "Check results:"
    echo "  1. Refresh your app"
    echo "  2. Open document pages - now with full content!"
    echo "  3. Test search with actual PDF content"
    echo ""
else
    echo ""
    echo "Cancelled. Run this script again when ready!"
    echo ""
fi






