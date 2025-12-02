import os
from bs4 import BeautifulSoup
import re
from collections import Counter
import json

def extract_speech_text(html_file):
    """Extract clean speech text from HTML."""
    with open(html_file, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')
    
    article = soup.find('article', class_=re.compile(r'lp__body_content|body_content'))
    if article:
        paragraphs = article.find_all('p')
        return ' '.join([p.get_text() for p in paragraphs])
    return ""

def analyze_style(text):
    """Analyze speaking style patterns."""
    sentences = [s.strip() for s in re.split(r'[.!?]+', text) if s.strip()]
    words = text.split()
    
    # Common phrases
    phrases_2 = [' '.join(words[i:i+2]) for i in range(len(words)-1)]
    phrases_3 = [' '.join(words[i:i+3]) for i in range(len(words)-2)]
    
    # Sentence starters
    sentence_starters = [s.split()[0] if s.split() else '' for s in sentences]
    
    return {
        'total_sentences': len(sentences),
        'total_words': len(words),
        'avg_sentence_length': len(words) / len(sentences) if sentences else 0,
        'common_2word_phrases': Counter(phrases_2).most_common(20),
        'common_3word_phrases': Counter(phrases_3).most_common(20),
        'sentence_starters': Counter(sentence_starters).most_common(20)
    }

# Analyze all speeches
speeches_folder = "Ajay_Banga_Speeches"
html_files = [f for f in os.listdir(speeches_folder) if f.endswith('.html')]

all_text = ""
speech_count = 0

print("=" * 80)
print("ANALYZING AJAY BANGA'S SPEAKING STYLE")
print("=" * 80)

for html_file in sorted(html_files):
    html_path = os.path.join(speeches_folder, html_file)
    text = extract_speech_text(html_path)
    if text:
        all_text += " " + text
        speech_count += 1
        print(f"✓ Analyzed: {html_file[:60]}")

style_analysis = analyze_style(all_text)

print("\n" + "=" * 80)
print("SPEAKING STYLE ANALYSIS")
print("=" * 80)
print(f"Speeches analyzed: {speech_count}")
print(f"Total words: {style_analysis['total_words']:,}")
print(f"Total sentences: {style_analysis['total_sentences']:,}")
print(f"Average sentence length: {style_analysis['avg_sentence_length']:.1f} words")

print("\n📝 COMMON 2-WORD PHRASES:")
for phrase, count in style_analysis['common_2word_phrases'][:15]:
    print(f"   {count:3d}x  '{phrase}'")

print("\n📝 COMMON 3-WORD PHRASES:")
for phrase, count in style_analysis['common_3word_phrases'][:15]:
    print(f"   {count:3d}x  '{phrase}'")

print("\n📝 COMMON SENTENCE STARTERS:")
for starter, count in style_analysis['sentence_starters'][:15]:
    print(f"   {count:3d}x  '{starter}'")

# Extract key themes and vocabulary
print("\n" + "=" * 80)
print("KEY THEMES & VOCABULARY")
print("=" * 80)

key_words = [
    'development', 'bank', 'world', 'countries', 'people', 'investment',
    'climate', 'energy', 'jobs', 'reform', 'private', 'sector', 'mission',
    'africa', 'poverty', 'finance', 'opportunity', 'future', 'together'
]

word_counts = Counter(all_text.lower().split())
for word in key_words:
    count = word_counts.get(word, 0)
    if count > 0:
        print(f"   {count:3d}x  {word}")

# Save full analysis
analysis_data = {
    'speeches_analyzed': speech_count,
    'total_words': style_analysis['total_words'],
    'total_sentences': style_analysis['total_sentences'],
    'avg_sentence_length': style_analysis['avg_sentence_length'],
    'common_phrases': {
        '2_word': style_analysis['common_2word_phrases'][:30],
        '3_word': style_analysis['common_3word_phrases'][:30]
    },
    'sentence_starters': style_analysis['sentence_starters'][:30],
    'full_text_sample': all_text[:5000]
}

with open('speaking_style_analysis.json', 'w', encoding='utf-8') as f:
    json.dump(analysis_data, f, indent=2)

print("\n✅ Full analysis saved to speaking_style_analysis.json")














