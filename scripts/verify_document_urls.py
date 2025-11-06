#!/usr/bin/env python3
"""
Verify World Bank Document URLs
Checks which URLs in the database return 404 or are invalid
"""

import os
import sys
import asyncio
import aiohttp
from datetime import datetime
from dotenv import load_dotenv

# Add parent directory to path to import from lib
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load environment variables
load_dotenv('.env.local')

# Supabase connection
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ ERROR: Missing SUPABASE_URL or SUPABASE_KEY in .env.local")
    sys.exit(1)

class URLVerifier:
    def __init__(self):
        self.results = {
            'valid': [],
            'invalid_404': [],
            'invalid_timeout': [],
            'invalid_other': [],
            'invalid_pattern': [],
            'missing_url': []
        }
        self.total = 0
    
    async def check_url(self, session, doc_id, url, title):
        """Check if a URL is valid"""
        
        # Check for obviously invalid URLs
        invalid_patterns = [
            '999999',
            '000000',
            'placeholder',
            'example.com',
            'test.com'
        ]
        
        if not url:
            self.results['missing_url'].append({
                'id': doc_id,
                'title': title,
                'url': None
            })
            return False
        
        # Check for invalid patterns
        for pattern in invalid_patterns:
            if pattern in url.lower():
                self.results['invalid_pattern'].append({
                    'id': doc_id,
                    'title': title,
                    'url': url,
                    'reason': f'Contains "{pattern}"'
                })
                return False
        
        # Try to fetch the URL
        try:
            async with session.head(url, timeout=10, allow_redirects=True) as response:
                if response.status == 404:
                    self.results['invalid_404'].append({
                        'id': doc_id,
                        'title': title,
                        'url': url
                    })
                    return False
                elif response.status >= 400:
                    self.results['invalid_other'].append({
                        'id': doc_id,
                        'title': title,
                        'url': url,
                        'status': response.status
                    })
                    return False
                else:
                    self.results['valid'].append({
                        'id': doc_id,
                        'title': title,
                        'url': url,
                        'status': response.status
                    })
                    return True
        except asyncio.TimeoutError:
            self.results['invalid_timeout'].append({
                'id': doc_id,
                'title': title,
                'url': url
            })
            return False
        except Exception as e:
            self.results['invalid_other'].append({
                'id': doc_id,
                'title': title,
                'url': url,
                'error': str(e)
            })
            return False
    
    async def verify_documents(self, documents):
        """Verify all document URLs"""
        self.total = len(documents)
        
        print(f"🔍 Checking {self.total} document URLs...")
        print("=" * 80)
        
        async with aiohttp.ClientSession() as session:
            tasks = []
            for doc in documents:
                task = self.check_url(
                    session,
                    doc['id'],
                    doc.get('url'),
                    doc.get('title', 'Untitled')[:60]
                )
                tasks.append(task)
            
            # Process in batches to avoid overwhelming the server
            batch_size = 10
            for i in range(0, len(tasks), batch_size):
                batch = tasks[i:i+batch_size]
                await asyncio.gather(*batch)
                print(f"Progress: {min(i+batch_size, len(tasks))}/{len(tasks)} checked", end='\r')
        
        print("\n" + "=" * 80)
        self.print_results()
    
    def print_results(self):
        """Print verification results"""
        print("\n" + "=" * 80)
        print("VERIFICATION RESULTS")
        print("=" * 80)
        
        print(f"\n📊 SUMMARY:")
        print(f"   Total Documents: {self.total}")
        print(f"   ✅ Valid URLs: {len(self.results['valid'])} ({self.get_percentage('valid')}%)")
        print(f"   ❌ 404 Not Found: {len(self.results['invalid_404'])} ({self.get_percentage('invalid_404')}%)")
        print(f"   ⚠️  Invalid Patterns: {len(self.results['invalid_pattern'])} ({self.get_percentage('invalid_pattern')}%)")
        print(f"   ⏱️  Timeout: {len(self.results['invalid_timeout'])} ({self.get_percentage('invalid_timeout')}%)")
        print(f"   🚫 Other Errors: {len(self.results['invalid_other'])} ({self.get_percentage('invalid_other')}%)")
        print(f"   📝 Missing URL: {len(self.results['missing_url'])} ({self.get_percentage('missing_url')}%)")
        
        # Show some examples
        if self.results['invalid_pattern']:
            print(f"\n🔍 INVALID PATTERNS (first 5):")
            for doc in self.results['invalid_pattern'][:5]:
                print(f"   ID: {doc['id']}")
                print(f"   Title: {doc['title']}")
                print(f"   URL: {doc['url']}")
                print(f"   Reason: {doc['reason']}")
                print()
        
        if self.results['invalid_404']:
            print(f"\n❌ 404 NOT FOUND (first 5):")
            for doc in self.results['invalid_404'][:5]:
                print(f"   ID: {doc['id']}")
                print(f"   Title: {doc['title']}")
                print(f"   URL: {doc['url']}")
                print()
        
        # Calculate what to keep
        invalid_count = (
            len(self.results['invalid_404']) +
            len(self.results['invalid_pattern'])
        )
        valid_count = len(self.results['valid']) + len(self.results['missing_url'])
        
        print("\n" + "=" * 80)
        print("RECOMMENDATIONS")
        print("=" * 80)
        print(f"\n🎯 Documents to KEEP: {valid_count}")
        print(f"   - Valid URLs: {len(self.results['valid'])}")
        print(f"   - Missing URLs (but content exists): {len(self.results['missing_url'])}")
        
        print(f"\n🗑️  Documents to CONSIDER REMOVING: {invalid_count}")
        print(f"   - 404 URLs: {len(self.results['invalid_404'])}")
        print(f"   - Invalid patterns: {len(self.results['invalid_pattern'])}")
        
        print(f"\n⚠️  Documents needing REVIEW: {len(self.results['invalid_timeout']) + len(self.results['invalid_other'])}")
        print(f"   - Timeouts: {len(self.results['invalid_timeout'])}")
        print(f"   - Other errors: {len(self.results['invalid_other'])}")
        
        # Save detailed report
        self.save_report()
    
    def get_percentage(self, category):
        """Calculate percentage for a category"""
        if self.total == 0:
            return 0
        return round((len(self.results[category]) / self.total) * 100, 1)
    
    def save_report(self):
        """Save detailed report to file"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'url_verification_report_{timestamp}.txt'
        
        with open(filename, 'w') as f:
            f.write("=" * 80 + "\n")
            f.write("DOCUMENT URL VERIFICATION REPORT\n")
            f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write("=" * 80 + "\n\n")
            
            f.write(f"Total Documents: {self.total}\n\n")
            
            for category, docs in self.results.items():
                f.write(f"\n{category.upper().replace('_', ' ')}: {len(docs)}\n")
                f.write("-" * 80 + "\n")
                for doc in docs:
                    f.write(f"ID: {doc['id']}\n")
                    f.write(f"Title: {doc['title']}\n")
                    if 'url' in doc:
                        f.write(f"URL: {doc['url']}\n")
                    if 'reason' in doc:
                        f.write(f"Reason: {doc['reason']}\n")
                    if 'status' in doc:
                        f.write(f"Status: {doc['status']}\n")
                    if 'error' in doc:
                        f.write(f"Error: {doc['error']}\n")
                    f.write("\n")
        
        print(f"\n📄 Detailed report saved: {filename}")

async def main():
    """Main function"""
    print("=" * 80)
    print("WORLD BANK DOCUMENT URL VERIFIER")
    print("=" * 80)
    print()
    
    # Import supabase here after path is set
    try:
        from supabase import create_client
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    except ImportError:
        print("❌ ERROR: supabase-py not installed")
        print("Run: pip install supabase")
        sys.exit(1)
    
    # Fetch all documents
    print("📥 Fetching documents from database...")
    try:
        response = supabase.table('worldbank_documents').select('id, title, url').execute()
        documents = response.data
        print(f"✅ Found {len(documents)} documents\n")
    except Exception as e:
        print(f"❌ ERROR fetching documents: {e}")
        sys.exit(1)
    
    # Verify URLs
    verifier = URLVerifier()
    await verifier.verify_documents(documents)
    
    # Generate SQL cleanup script
    if verifier.results['invalid_404'] or verifier.results['invalid_pattern']:
        print("\n" + "=" * 80)
        print("GENERATING CLEANUP SCRIPT")
        print("=" * 80)
        
        invalid_ids = [doc['id'] for doc in verifier.results['invalid_404'] + verifier.results['invalid_pattern']]
        
        sql_filename = 'cleanup_invalid_documents.sql'
        with open(sql_filename, 'w') as f:
            f.write("-- Cleanup Invalid Documents\n")
            f.write(f"-- Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"-- Removes {len(invalid_ids)} documents with invalid URLs\n\n")
            
            f.write("-- Backup first (optional):\n")
            f.write("-- CREATE TABLE worldbank_documents_backup AS SELECT * FROM worldbank_documents WHERE id IN (")
            f.write(", ".join(f"'{id}'" for id in invalid_ids[:10]))
            if len(invalid_ids) > 10:
                f.write(", ...")
            f.write(");\n\n")
            
            f.write("-- Delete documents with invalid URLs:\n")
            f.write("DELETE FROM worldbank_documents\nWHERE id IN (\n")
            for i, doc_id in enumerate(invalid_ids):
                f.write(f"  '{doc_id}'")
                if i < len(invalid_ids) - 1:
                    f.write(",")
                f.write("\n")
            f.write(");\n\n")
            
            f.write(f"-- Expected: {len(invalid_ids)} rows deleted\n")
        
        print(f"✅ SQL cleanup script generated: {sql_filename}")
        print(f"\n⚠️  WARNING: Review the script before running it!")
        print(f"   It will delete {len(invalid_ids)} documents from the database.")

if __name__ == '__main__':
    asyncio.run(main())

