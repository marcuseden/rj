import pdfplumber
import json
import os
from pathlib import Path

def extract_speeches_from_pdfs():
    """Extract all speech text from PDFs and save to JSON."""
    pdf_folder = "Ajay_Banga_Speeches_PDFs"
    output_file = "ajay-banga-voice-clone/public/speeches_database.json"
    
    speeches = []
    
    print("=" * 80)
    print("EXTRACTING ALL SPEECHES FROM PDFs")
    print("=" * 80)
    
    pdf_files = sorted([f for f in os.listdir(pdf_folder) if f.endswith('.pdf')])
    
    for pdf_file in pdf_files:
        pdf_path = os.path.join(pdf_folder, pdf_file)
        
        try:
            with pdfplumber.open(pdf_path) as pdf:
                full_text = ""
                for page in pdf.pages:
                    full_text += page.extract_text() + "\n"
                
                # Clean up the text
                full_text = full_text.strip()
                
                # Extract metadata from filename
                filename_parts = pdf_file.replace('.pdf', '').split('_', 1)
                date_prefix = filename_parts[0] if filename_parts else "unknown"
                title = filename_parts[1] if len(filename_parts) > 1 else pdf_file
                
                speech_data = {
                    "id": len(speeches) + 1,
                    "filename": pdf_file,
                    "date_prefix": date_prefix,
                    "title": title,
                    "text": full_text,
                    "word_count": len(full_text.split()),
                    "char_count": len(full_text)
                }
                
                speeches.append(speech_data)
                print(f"✓ Extracted: {pdf_file}")
                print(f"   Words: {speech_data['word_count']:,} | Characters: {speech_data['char_count']:,}")
        
        except Exception as e:
            print(f"✗ Error with {pdf_file}: {e}")
    
    # Create output directory if needed
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    # Save to JSON
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({
            "total_speeches": len(speeches),
            "total_words": sum(s['word_count'] for s in speeches),
            "speeches": speeches
        }, f, indent=2, ensure_ascii=False)
    
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"Total speeches extracted: {len(speeches)}")
    print(f"Total words: {sum(s['word_count'] for s in speeches):,}")
    print(f"Total characters: {sum(s['char_count'] for s in speeches):,}")
    print(f"\n✅ Database saved to: {output_file}")
    
    # Also create a condensed version for style analysis
    style_data = {
        "common_phrases": extract_common_phrases(speeches),
        "vocabulary": extract_key_vocabulary(speeches),
        "sentence_patterns": extract_sentence_patterns(speeches),
        "full_corpus": " ".join([s['text'] for s in speeches])[:50000]  # First 50k chars
    }
    
    style_file = "ajay-banga-voice-clone/public/banga_style_guide.json"
    with open(style_file, 'w', encoding='utf-8') as f:
        json.dump(style_data, f, indent=2)
    
    print(f"✅ Style guide saved to: {style_file}")

def extract_common_phrases(speeches):
    """Extract common multi-word phrases."""
    from collections import Counter
    
    all_text = " ".join([s['text'] for s in speeches])
    words = all_text.lower().split()
    
    # Get 2-word phrases
    phrases_2 = [' '.join(words[i:i+2]) for i in range(len(words)-1)]
    # Get 3-word phrases
    phrases_3 = [' '.join(words[i:i+3]) for i in range(len(words)-2)]
    
    common_2 = Counter(phrases_2).most_common(50)
    common_3 = Counter(phrases_3).most_common(50)
    
    return {
        "2_word": [{"phrase": p, "count": c} for p, c in common_2],
        "3_word": [{"phrase": p, "count": c} for p, c in common_3]
    }

def extract_key_vocabulary(speeches):
    """Extract key thematic vocabulary."""
    key_terms = [
        'development', 'bank', 'world', 'countries', 'people', 'investment',
        'climate', 'energy', 'jobs', 'reform', 'private', 'sector', 'mission',
        'africa', 'poverty', 'finance', 'opportunity', 'future', 'together',
        'partnership', 'government', 'infrastructure', 'growth', 'sustainable'
    ]
    
    from collections import Counter
    all_text = " ".join([s['text'] for s in speeches]).lower()
    words = all_text.split()
    word_counts = Counter(words)
    
    return {term: word_counts.get(term, 0) for term in key_terms}

def extract_sentence_patterns(speeches):
    """Extract common sentence starting patterns."""
    from collections import Counter
    import re
    
    all_text = " ".join([s['text'] for s in speeches])
    sentences = [s.strip() for s in re.split(r'[.!?]+', all_text) if s.strip()]
    
    starters = []
    for sentence in sentences:
        words = sentence.split()
        if len(words) >= 2:
            starters.append(' '.join(words[:2]))
    
    common_starters = Counter(starters).most_common(30)
    return [{"starter": s, "count": c} for s, c in common_starters]

if __name__ == "__main__":
    extract_speeches_from_pdfs()








