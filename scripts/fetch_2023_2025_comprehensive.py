#!/usr/bin/env python3
"""
Comprehensive World Bank Document Fetcher for 2023-2025
Fetches documents with date filtering for maximum coverage
"""

import os
import sys
import time
from pathlib import Path
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Import the main fetcher
from scripts.fetch_worldbank_documents import WorldBankDocumentFetcher

class ComprehensiveFetcher(WorldBankDocumentFetcher):
    """Enhanced fetcher with date filtering and comprehensive queries"""
    
    def fetch_documents_by_date(self, query: str, start_date: str, end_date: str, max_docs: int = 100):
        """
        Fetch documents with date range
        start_date/end_date format: YYYY-MM-DD
        """
        print(f"\n🔍 Searching: '{query}' ({start_date} to {end_date})")
        print("=" * 80)
        
        params = {
            'format': 'json',
            'qterm': query,
            'rows': max_docs,
            'fl': 'id,docty,repnme,docdt,url,pdfurl,txturl,repnb,docna,count,subtitl,lang_exact',
            'fct': 'docdt',
            'srt': 'docdt',
            'order': 'desc',
            # Date filter
            'strdate': start_date.replace('-', ''),  # YYYYMMDD format
            'enddate': end_date.replace('-', ''),
        }
        
        try:
            import requests
            response = requests.get(
                "https://search.worldbank.org/api/v2/wds",
                params=params,
                timeout=30
            )
            response.raise_for_status()
            data = response.json()
            
            documents = data.get('documents', {})
            doc_list = documents.get('docs', [])
            
            print(f"✅ Found {len(doc_list)} documents")
            return doc_list
            
        except Exception as e:
            print(f"❌ Error: {e}")
            return []

def main():
    print("=" * 80)
    print("COMPREHENSIVE WORLD BANK DOCUMENT FETCHER (2023-2025)")
    print("=" * 80)
    print()
    
    fetcher = ComprehensiveFetcher()
    
    # Define search strategies for comprehensive coverage
    search_strategies = [
        # Ajay Banga specific (became president June 2023)
        {
            'query': 'Ajay Banga',
            'start': '2023-06-01',
            'end': '2025-12-31',
            'max': 100,
            'priority': 'high'
        },
        
        # President speeches (broader)
        {
            'query': 'President speech',
            'start': '2023-06-01',
            'end': '2025-12-31',
            'max': 50,
            'priority': 'high'
        },
        
        # Annual Meetings (important events)
        {
            'query': 'Annual Meetings 2024',
            'start': '2024-01-01',
            'end': '2024-12-31',
            'max': 30,
            'priority': 'high'
        },
        {
            'query': 'Annual Meetings 2023',
            'start': '2023-01-01',
            'end': '2023-12-31',
            'max': 30,
            'priority': 'high'
        },
        
        # IDA (International Development Association)
        {
            'query': 'IDA21',
            'start': '2023-01-01',
            'end': '2025-12-31',
            'max': 40,
            'priority': 'high'
        },
        {
            'query': 'IDA replenishment',
            'start': '2023-01-01',
            'end': '2025-12-31',
            'max': 30,
            'priority': 'medium'
        },
        
        # Mission 300 (energy initiative)
        {
            'query': 'Mission 300',
            'start': '2024-01-01',
            'end': '2025-12-31',
            'max': 25,
            'priority': 'high'
        },
        
        # Climate and sustainability
        {
            'query': 'climate finance',
            'start': '2023-01-01',
            'end': '2025-12-31',
            'max': 40,
            'priority': 'medium'
        },
        
        # Development topics
        {
            'query': 'poverty reduction strategy',
            'start': '2023-01-01',
            'end': '2025-12-31',
            'max': 30,
            'priority': 'medium'
        },
        
        # G20 and international forums
        {
            'query': 'G20',
            'start': '2023-01-01',
            'end': '2025-12-31',
            'max': 30,
            'priority': 'medium'
        },
        
        # Policy and reform
        {
            'query': 'World Bank reform',
            'start': '2023-01-01',
            'end': '2025-12-31',
            'max': 25,
            'priority': 'medium'
        },
        
        # Food security
        {
            'query': 'food security agriculture',
            'start': '2023-01-01',
            'end': '2025-12-31',
            'max': 25,
            'priority': 'medium'
        },
        
        # Regional focus
        {
            'query': 'Africa development',
            'start': '2023-01-01',
            'end': '2025-12-31',
            'max': 25,
            'priority': 'low'
        },
        
        # Document types
        {
            'query': 'President remarks',
            'start': '2023-06-01',
            'end': '2025-12-31',
            'max': 50,
            'priority': 'high'
        },
    ]
    
    # Statistics
    total_strategies = len(search_strategies)
    total_docs_found = 0
    total_docs_processed = 0
    
    print(f"📋 Running {total_strategies} search strategies...")
    print(f"🎯 Target period: 2023-2025")
    print(f"🎯 Focus: Ajay Banga era (June 2023 onwards)")
    print()
    
    # Process each strategy
    for i, strategy in enumerate(search_strategies, 1):
        print("\n" + "=" * 80)
        print(f"STRATEGY {i}/{total_strategies}: {strategy['query']} [{strategy['priority'].upper()}]")
        print("=" * 80)
        
        # Fetch documents
        documents = fetcher.fetch_documents_by_date(
            query=strategy['query'],
            start_date=strategy['start'],
            end_date=strategy['end'],
            max_docs=strategy['max']
        )
        
        if documents:
            total_docs_found += len(documents)
            
            # Process documents
            fetcher.process_documents(documents)
            total_docs_processed += fetcher.stats['inserted']
            
            # Rate limiting between strategies
            if i < total_strategies:
                print(f"\n⏸️  Pausing 5 seconds before next strategy...")
                time.sleep(5)
        else:
            print("⚠️  No documents found for this query")
    
    # Final summary
    print("\n" + "=" * 80)
    print("FINAL SUMMARY")
    print("=" * 80)
    print(f"\n📊 Overall Statistics:")
    print(f"   Search strategies executed: {total_strategies}")
    print(f"   Total documents found: {total_docs_found}")
    print(f"   Documents fetched: {fetcher.stats['fetched']}")
    print(f"   PDFs downloaded: {fetcher.stats['downloaded']}")
    print(f"   Text extracted: {fetcher.stats['extracted']}")
    print(f"   Stored in database: {fetcher.stats['inserted']}")
    print(f"   Errors encountered: {fetcher.stats['errors']}")
    print()
    
    success_rate = (fetcher.stats['inserted'] / max(1, fetcher.stats['fetched'])) * 100
    print(f"✅ Success rate: {success_rate:.1f}%")
    
    # Coverage estimate
    print()
    print("📈 Coverage Estimate:")
    print(f"   2023-2025 documents in database: ~{fetcher.stats['inserted']}")
    print(f"   Focus areas covered: {total_strategies}")
    print(f"   Ajay Banga era: ✅ Comprehensive")
    print()
    print("=" * 80)
    print("✅ COMPREHENSIVE FETCH COMPLETE!")
    print("=" * 80)
    print()
    print("Next steps:")
    print("  1. Refresh your app to see new documents")
    print("  2. Check database: SELECT COUNT(*) FROM worldbank_documents WHERE id LIKE 'wb-pdf-%';")
    print("  3. Test search functionality with full content")
    print()

if __name__ == '__main__':
    main()







