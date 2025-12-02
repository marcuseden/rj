import pdfplumber
from bs4 import BeautifulSoup
import re

# Extract text from PDF
pdf_path = "Ajay_Banga_Speeches_PDFs/01_Remarks by World Bank Group President Ajay Banga a.pdf"
html_path = "Ajay_Banga_Speeches/01_Remarks by World Bank Group President Ajay Banga a.html"

print("=" * 80)
print("EXTRACTING TEXT FROM PDF")
print("=" * 80)

with pdfplumber.open(pdf_path) as pdf:
    pdf_text = ""
    for page in pdf.pages:
        pdf_text += page.extract_text() + "\n"

print(f"\nPDF Total Characters: {len(pdf_text)}")
print(f"PDF Total Words: {len(pdf_text.split())}")
print(f"PDF Total Pages: {len(pdf.pages)}")

print("\n" + "=" * 80)
print("FIRST 1000 CHARACTERS OF PDF:")
print("=" * 80)
print(pdf_text[:1000])

print("\n" + "=" * 80)
print("EXTRACTING SPEECH FROM HTML")
print("=" * 80)

with open(html_path, 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

# Find the article with speech content
article = soup.find('article', class_=re.compile(r'lp__body_content'))
if article:
    # Get all paragraph text
    paragraphs = article.find_all('p')
    html_text = ' '.join([p.get_text() for p in paragraphs])
    
    print(f"\nHTML Speech Characters: {len(html_text)}")
    print(f"HTML Speech Words: {len(html_text.split())}")
    print(f"Number of Paragraphs: {len(paragraphs)}")
    
    print("\n" + "=" * 80)
    print("FIRST 500 CHARACTERS OF HTML SPEECH:")
    print("=" * 80)
    print(html_text[:500])
    
    print("\n" + "=" * 80)
    print("KEY PHRASES VERIFICATION:")
    print("=" * 80)
    
    key_phrases = [
        "Over the next decade, 360 million young people in Africa",
        "Forecasts are not destiny",
        "Mission 300 electrification effort",
        "record $100 billion for IDA",
        "Thank you."
    ]
    
    for phrase in key_phrases:
        in_pdf = phrase in pdf_text
        in_html = phrase in html_text
        status = "✓" if in_pdf else "✗"
        print(f"{status} PDF contains: '{phrase[:50]}...'")
        print(f"  HTML has it: {in_html}")
    
    print("\n" + "=" * 80)
    print("COMPARISON SUMMARY:")
    print("=" * 80)
    print(f"PDF has {len(pdf_text)} characters")
    print(f"HTML has {len(html_text)} characters")
    
    if len(pdf_text) > 1000 and "360 million young people" in pdf_text and "Thank you" in pdf_text:
        print("\n✅ SUCCESS: PDF contains the full speech content!")
    else:
        print("\n❌ WARNING: PDF may be missing content!")
else:
    print("Could not find speech content in HTML")














