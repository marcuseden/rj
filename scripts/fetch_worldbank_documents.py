#!/usr/bin/env python3
"""
Fetch World Bank Documents with Full PDF Content
Downloads PDFs from World Bank API and extracts full text content
"""

import os
import sys
import requests
import time
from datetime import datetime
from pathlib import Path
import json
from typing import Dict, List, Optional
from dotenv import load_dotenv

# PDF extraction libraries
try:
    import pdfplumber
    PDF_LIBRARY = 'pdfplumber'
except ImportError:
    try:
        from PyPDF2 import PdfReader
        PDF_LIBRARY = 'pypdf2'
    except ImportError:
        print("❌ ERROR: No PDF library found!")
        print("Install one: pip install pdfplumber")
        print("         or: pip install PyPDF2")
        sys.exit(1)

# Supabase
try:
    from supabase import create_client, Client
except ImportError:
    print("❌ ERROR: supabase-py not installed")
    print("Run: pip install supabase")
    sys.exit(1)

# Load environment
load_dotenv('.env.local')

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ ERROR: Missing SUPABASE_URL or SUPABASE_KEY")
    sys.exit(1)

# World Bank API endpoints
WB_SEARCH_API = "https://search.worldbank.org/api/v2/wds"
WB_DOCUMENTS_API = "https://search.worldbank.org/api/v3/wds"

class WorldBankDocumentFetcher:
    def __init__(self):
        self.supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        self.download_dir = Path("data/worldbank_pdfs")
        self.download_dir.mkdir(parents=True, exist_ok=True)
        self.stats = {
            'fetched': 0,
            'downloaded': 0,
            'extracted': 0,
            'inserted': 0,
            'errors': 0
        }
    
    def fetch_documents(self, query: str = "Ajay Banga", max_docs: int = 50) -> List[Dict]:
        """
        Fetch documents from World Bank API
        """
        print(f"\n🔍 Searching World Bank for: '{query}'")
        print("=" * 80)
        
        params = {
            'format': 'json',
            'qterm': query,
            'rows': max_docs,
            'fl': 'id,docty,repnme,docdt,url,pdfurl,txturl,repnb,docna,count,subtitl,lang_exact',
            'srt': 'docdt',
            'order': 'desc'
        }
        
        try:
            response = requests.get(WB_SEARCH_API, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            documents = data.get('documents', {})
            doc_list = documents.get('docs', [])
            
            print(f"✅ Found {len(doc_list)} documents")
            return doc_list
            
        except Exception as e:
            print(f"❌ Error fetching documents: {e}")
            return []
    
    def download_pdf(self, url: str, doc_id: str) -> Optional[Path]:
        """
        Download PDF from URL
        """
        if not url:
            return None
        
        filename = f"{doc_id}.pdf"
        filepath = self.download_dir / filename
        
        # Skip if already downloaded
        if filepath.exists():
            print(f"   ⏭️  Already downloaded: {filename}")
            return filepath
        
        try:
            print(f"   📥 Downloading: {filename}")
            response = requests.get(url, timeout=60, stream=True)
            response.raise_for_status()
            
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            self.stats['downloaded'] += 1
            print(f"   ✅ Downloaded: {filename} ({filepath.stat().st_size / 1024:.1f} KB)")
            return filepath
            
        except Exception as e:
            print(f"   ❌ Download failed: {e}")
            self.stats['errors'] += 1
            return None
    
    def extract_text_from_pdf(self, pdf_path: Path) -> Optional[str]:
        """
        Extract text content from PDF
        """
        try:
            if PDF_LIBRARY == 'pdfplumber':
                return self._extract_with_pdfplumber(pdf_path)
            else:
                return self._extract_with_pypdf2(pdf_path)
        except Exception as e:
            print(f"   ❌ Extraction failed: {e}")
            self.stats['errors'] += 1
            return None
    
    def _extract_with_pdfplumber(self, pdf_path: Path) -> str:
        """Extract using pdfplumber (better quality)"""
        import pdfplumber
        
        text = ""
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n\n"
        
        return text.strip()
    
    def _extract_with_pypdf2(self, pdf_path: Path) -> str:
        """Extract using PyPDF2 (fallback)"""
        from PyPDF2 import PdfReader
        
        text = ""
        reader = PdfReader(pdf_path)
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n\n"
        
        return text.strip()
    
    def clean_text(self, text: str) -> str:
        """
        Clean extracted text
        """
        if not text:
            return ""
        
        # Remove multiple newlines
        import re
        text = re.sub(r'\n{3,}', '\n\n', text)
        
        # Remove excessive spaces
        text = re.sub(r' {2,}', ' ', text)
        
        # Remove page numbers and headers/footers (common patterns)
        text = re.sub(r'\n\d+\n', '\n', text)
        
        return text.strip()
    
    def generate_summary(self, text: str, max_length: int = 500) -> str:
        """
        Generate a summary from full text
        """
        if not text or len(text) < 200:
            return text
        
        # Take first few sentences
        sentences = text.split('. ')
        summary = ""
        for sentence in sentences:
            if len(summary) + len(sentence) < max_length:
                summary += sentence + ". "
            else:
                break
        
        return summary.strip()
    
    def store_document(self, doc_data: Dict, full_text: str) -> bool:
        """
        Store document in Supabase
        """
        try:
            # Prepare document data
            document = {
                'id': f"wb-pdf-{doc_data.get('id', 'unknown')}",
                'title': doc_data.get('docna', doc_data.get('repnme', 'Untitled'))[:500],
                'content': self.clean_text(full_text),
                'summary': self.generate_summary(full_text),
                'url': doc_data.get('url', ''),
                'date': doc_data.get('docdt', datetime.now().isoformat()),
                'type': doc_data.get('docty', 'Document'),
                'file_type': 'pdf',
                'keywords': self._extract_keywords(full_text),
                'metadata': {
                    'report_number': doc_data.get('repnb', ''),
                    'language': doc_data.get('lang_exact', 'English'),
                    'word_count': len(full_text.split()),
                    'character_count': len(full_text),
                    'reading_time': max(1, len(full_text.split()) // 200),
                    'pdf_url': doc_data.get('pdfurl', ''),
                    'source': 'World Bank API + PDF'
                }
            }
            
            # Upsert (insert or update)
            result = self.supabase.table('worldbank_documents').upsert(document).execute()
            
            self.stats['inserted'] += 1
            print(f"   ✅ Stored in database: {document['id']}")
            return True
            
        except Exception as e:
            print(f"   ❌ Database error: {e}")
            self.stats['errors'] += 1
            return False
    
    def _extract_keywords(self, text: str, max_keywords: int = 10) -> List[str]:
        """
        Extract keywords from text (simple frequency-based)
        """
        if not text:
            return []
        
        # Common words to ignore
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
                     'of', 'with', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has',
                     'this', 'that', 'these', 'those', 'by', 'from', 'as', 'it', 'its'}
        
        # Extract words
        words = text.lower().split()
        word_freq = {}
        
        for word in words:
            # Clean word
            word = ''.join(c for c in word if c.isalnum())
            if len(word) > 3 and word not in stop_words:
                word_freq[word] = word_freq.get(word, 0) + 1
        
        # Sort by frequency
        sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
        return [word for word, freq in sorted_words[:max_keywords]]
    
    def process_documents(self, documents: List[Dict]):
        """
        Process all documents: download PDF, extract text, store in DB
        """
        print(f"\n📄 Processing {len(documents)} documents...")
        print("=" * 80)
        
        for i, doc in enumerate(documents, 1):
            doc_id = doc.get('id', f'unknown-{i}')
            title = doc.get('docna', doc.get('repnme', 'Untitled'))[:60]
            
            print(f"\n[{i}/{len(documents)}] {title}")
            print("-" * 80)
            
            self.stats['fetched'] += 1
            
            # Get PDF URL
            pdf_url = doc.get('pdfurl', '')
            if not pdf_url:
                print(f"   ⚠️  No PDF URL available")
                continue
            
            # Download PDF
            pdf_path = self.download_pdf(pdf_url, doc_id)
            if not pdf_path:
                continue
            
            # Extract text
            print(f"   📝 Extracting text...")
            full_text = self.extract_text_from_pdf(pdf_path)
            
            if not full_text or len(full_text) < 100:
                print(f"   ⚠️  No text extracted (might be scanned images)")
                continue
            
            self.stats['extracted'] += 1
            print(f"   ✅ Extracted {len(full_text)} characters ({len(full_text.split())} words)")
            
            # Store in database
            self.store_document(doc, full_text)
            
            # Rate limiting
            time.sleep(1)
    
    def print_summary(self):
        """
        Print final statistics
        """
        print("\n" + "=" * 80)
        print("SUMMARY")
        print("=" * 80)
        print(f"📊 Statistics:")
        print(f"   Documents fetched: {self.stats['fetched']}")
        print(f"   PDFs downloaded: {self.stats['downloaded']}")
        print(f"   Text extracted: {self.stats['extracted']}")
        print(f"   Stored in database: {self.stats['inserted']}")
        print(f"   Errors: {self.stats['errors']}")
        print()
        print(f"✅ Success rate: {(self.stats['inserted'] / max(1, self.stats['fetched'])) * 100:.1f}%")
        print("=" * 80)

def main():
    """
    Main function
    """
    print("=" * 80)
    print("WORLD BANK DOCUMENT FETCHER WITH FULL PDF CONTENT")
    print("=" * 80)
    
    # Parse arguments
    query = sys.argv[1] if len(sys.argv) > 1 else "Ajay Banga"
    max_docs = int(sys.argv[2]) if len(sys.argv) > 2 else 20
    
    print(f"\n🎯 Query: '{query}'")
    print(f"📊 Max documents: {max_docs}")
    
    # Create fetcher
    fetcher = WorldBankDocumentFetcher()
    
    # Fetch documents from API
    documents = fetcher.fetch_documents(query, max_docs)
    
    if not documents:
        print("\n❌ No documents found")
        return
    
    # Process documents
    fetcher.process_documents(documents)
    
    # Print summary
    fetcher.print_summary()

if __name__ == '__main__':
    main()






