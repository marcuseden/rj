#!/bin/bash

echo "=========================================================================="
echo "WORLD BANK PDF FETCHER - SETUP"
echo "=========================================================================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
echo ""

pip3 install pdfplumber supabase python-dotenv requests

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================================================="
    echo "✅ SETUP COMPLETE!"
    echo "=========================================================================="
    echo ""
    echo "You can now run the fetcher:"
    echo ""
    echo "  # Fetch Ajay Banga documents (20 docs)"
    echo "  python3 scripts/fetch_worldbank_documents.py"
    echo ""
    echo "  # Custom search"
    echo "  python3 scripts/fetch_worldbank_documents.py \"climate finance\" 30"
    echo ""
    echo "=========================================================================="
else
    echo ""
    echo "❌ Installation failed. Please check errors above."
    exit 1
fi


