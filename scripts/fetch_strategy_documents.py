#!/usr/bin/env python3
"""
Fetch World Bank Strategy Documents, Policy Papers, and Reports
Focuses on strategic content with full PDF extraction
"""

import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from scripts.fetch_worldbank_documents import WorldBankDocumentFetcher

class StrategyDocumentFetcher(WorldBankDocumentFetcher):
    """Fetcher specialized for strategy documents"""
    
    def fetch_strategy_documents(self):
        """Fetch comprehensive strategy documents"""
        
        print("=" * 80)
        print("FETCHING WORLD BANK STRATEGY DOCUMENTS")
        print("=" * 80)
        print()
        
        # Define strategy-focused search queries
        strategies = [
            # Corporate Strategy
            {
                'query': 'World Bank Group Strategy',
                'start': '2023-01-01',
                'end': '2025-12-31',
                'max': 50,
                'category': 'Corporate Strategy'
            },
            
            # Evolution Roadmap
            {
                'query': 'Evolution Roadmap',
                'start': '2023-01-01',
                'end': '2025-12-31',
                'max': 30,
                'category': 'Strategic Planning'
            },
            
            # Country Partnership Frameworks
            {
                'query': 'Country Partnership Framework',
                'start': '2023-01-01',
                'end': '2025-12-31',
                'max': 50,
                'category': 'Country Strategy'
            },
            
            # Sector Strategies
            {
                'query': 'Sector Strategy',
                'start': '2023-01-01',
                'end': '2025-12-31',
                'max': 40,
                'category': 'Sector Strategy'
            },
            
            # Policy Papers
            {
                'query': 'Policy Research Working Paper',
                'start': '2023-01-01',
                'end': '2025-12-31',
                'max': 60,
                'category': 'Policy Research'
            },
            
            # Development Policy
            {
                'query': 'Development Policy',
                'start': '2023-01-01',
                'end': '2025-12-31',
                'max': 40,
                'category': 'Policy'
            },
            
            # Country Strategies
            {
                'query': 'Country Strategy',
                'start': '2023-01-01',
                'end': '2025-12-31',
                'max': 40,
                'category': 'Country Strategy'
            },
            
            # Systematic Country Diagnostics
            {
                'query': 'Systematic Country Diagnostic',
                'start': '2023-01-01',
                'end': '2025-12-31',
                'max': 35,
                'category': 'Country Diagnostic'
            },
            
            # Regional Strategies
            {
                'query': 'Regional Strategy',
                'start': '2023-01-01',
                'end': '2025-12-31',
                'max': 30,
                'category': 'Regional Strategy'
            },
            
            # Climate Strategy
            {
                'query': 'Climate Action Plan',
                'start': '2023-01-01',
                'end': '2025-12-31',
                'max': 35,
                'category': 'Climate Strategy'
            },
            
            # Financial Strategy
            {
                'query': 'Financial Strategy',
                'start': '2023-01-01',
                'end': '2025-12-31',
                'max': 30,
                'category': 'Finance Strategy'
            },
            
            # Reform Documents
            {
                'query': 'Institutional Reform',
                'start': '2023-01-01',
                'end': '2025-12-31',
                'max': 25,
                'category': 'Reform'
            },
            
            # Strategic Framework
            {
                'query': 'Strategic Framework',
                'start': '2023-01-01',
                'end': '2025-12-31',
                'max': 35,
                'category': 'Framework'
            },
            
            # Action Plans
            {
                'query': 'Action Plan',
                'start': '2023-01-01',
                'end': '2025-12-31',
                'max': 35,
                'category': 'Action Plan'
            },
            
            # Implementation Plans
            {
                'query': 'Implementation Plan',
                'start': '2023-01-01',
                'end': '2025-12-31',
                'max': 30,
                'category': 'Implementation'
            },
            
            # Operational Policies
            {
                'query': 'Operational Policy',
                'start': '2023-01-01',
                'end': '2025-12-31',
                'max': 30,
                'category': 'Operations'
            },
            
            # Technical Notes
            {
                'query': 'Technical Note',
                'start': '2023-01-01',
                'end': '2025-12-31',
                'max': 40,
                'category': 'Technical'
            },
            
            # Evaluation Reports
            {
                'query': 'Evaluation Report',
                'start': '2023-01-01',
                'end': '2025-12-31',
                'max': 35,
                'category': 'Evaluation'
            },
            
            # Impact Assessments
            {
                'query': 'Impact Assessment',
                'start': '2023-01-01',
                'end': '2025-12-31',
                'max': 30,
                'category': 'Assessment'
            },
            
            # White Papers
            {
                'query': 'White Paper',
                'start': '2023-01-01',
                'end': '2025-12-31',
                'max': 25,
                'category': 'White Paper'
            },
        ]
        
        print(f"📋 Will execute {len(strategies)} search strategies")
        print(f"🎯 Focus: Strategy documents, policy papers, frameworks")
        print(f"📅 Period: 2023-2025")
        print()
        
        total_found = 0
        
        # Process each strategy
        for i, strategy in enumerate(strategies, 1):
            print("\n" + "=" * 80)
            print(f"STRATEGY {i}/{len(strategies)}: {strategy['category']}")
            print(f"Query: \"{strategy['query']}\"")
            print("=" * 80)
            
            # Fetch documents
            documents = self.fetch_documents_by_date(
                query=strategy['query'],
                start_date=strategy['start'],
                end_date=strategy['end'],
                max_docs=strategy['max']
            )
            
            if documents:
                total_found += len(documents)
                
                # Process documents
                self.process_documents(documents)
                
                # Rate limiting
                import time
                if i < len(strategies):
                    print(f"\n⏸️  Pausing 3 seconds...")
                    time.sleep(3)
            else:
                print("⚠️  No documents found")
        
        # Final summary
        print("\n" + "=" * 80)
        print("STRATEGY DOCUMENTS FETCH COMPLETE")
        print("=" * 80)
        print()
        print(f"📊 Results:")
        print(f"   Search strategies: {len(strategies)}")
        print(f"   Documents found: {total_found}")
        print(f"   PDFs downloaded: {self.stats['downloaded']}")
        print(f"   Text extracted: {self.stats['extracted']}")
        print(f"   Stored in database: {self.stats['inserted']}")
        print(f"   Errors: {self.stats['errors']}")
        print()
        print(f"✅ Success rate: {(self.stats['inserted'] / max(1, self.stats['fetched'])) * 100:.1f}%")
        print()
        print("=" * 80)

def main():
    fetcher = StrategyDocumentFetcher()
    fetcher.fetch_strategy_documents()

if __name__ == '__main__':
    main()

