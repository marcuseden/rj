import os
from bs4 import BeautifulSoup
from weasyprint import HTML, CSS
from pathlib import Path
import re

def clean_text(text):
    """Clean up text by removing extra whitespace."""
    return re.sub(r'\s+', ' ', text).strip()

def extract_speech_content(html_file):
    """Extract the main speech content from HTML."""
    with open(html_file, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')
    
    # Try to find the main title
    title = "Speech by Ajay Banga"
    title_elem = soup.find('h1')
    if title_elem:
        title = clean_text(title_elem.get_text())
    
    # Try to find the date
    date = ""
    date_patterns = [
        soup.find('time'),
        soup.find(class_=re.compile(r'date', re.I)),
        soup.find('span', class_=re.compile(r'meta|publish', re.I))
    ]
    for elem in date_patterns:
        if elem:
            date = clean_text(elem.get_text())
            break
    
    # Try to find the main speech content - multiple strategies
    content_html = ""
    
    # Strategy 1: Look for article with class lp__body_content (World Bank speeches)
    article_elem = soup.find('article', class_=re.compile(r'lp__body_content|body_content', re.I))
    if article_elem:
        content_html = str(article_elem)
    
    # Strategy 2: Look for main content div
    if not content_html:
        content_div = soup.find('div', class_=re.compile(r'article-body|speech-body|content-body|main-content', re.I))
        if content_div:
            content_html = str(content_div)
    
    # Strategy 3: Look for any article tag
    if not content_html:
        article = soup.find('article')
        if article:
            # Remove navigation, headers, footers
            for tag in article.find_all(['nav', 'header', 'footer', 'aside']):
                tag.decompose()
            content_html = str(article)
    
    # Strategy 4: Look in main tag
    if not content_html:
        main = soup.find('main')
        if main:
            # Remove unwanted elements
            for tag in main.find_all(['script', 'style', 'nav', 'footer', 'header', 'aside']):
                tag.decompose()
            content_html = str(main)
    
    # Strategy 5: Last resort - get all paragraph text
    if not content_html:
        paragraphs = soup.find_all('p')
        if paragraphs:
            content_html = ''.join([str(p) for p in paragraphs])
    
    return title, date, content_html

def create_pdf(html_file, output_folder):
    """Convert HTML speech to a clean PDF."""
    try:
        title, date, content = extract_speech_content(html_file)
        
        # Create HTML structure for PDF
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                @page {{
                    size: A4;
                    margin: 2.5cm;
                }}
                body {{
                    font-family: Georgia, serif;
                    font-size: 12pt;
                    line-height: 1.6;
                    color: #333;
                    max-width: 100%;
                }}
                h1 {{
                    font-size: 20pt;
                    color: #1a1a1a;
                    margin-bottom: 0.5em;
                    line-height: 1.3;
                }}
                .date {{
                    font-size: 11pt;
                    color: #666;
                    margin-bottom: 1.5em;
                    font-style: italic;
                }}
                .header {{
                    border-bottom: 2px solid #0071bc;
                    padding-bottom: 1em;
                    margin-bottom: 2em;
                }}
                .speaker {{
                    font-size: 13pt;
                    color: #0071bc;
                    font-weight: bold;
                    margin-bottom: 0.3em;
                }}
                p {{
                    margin-bottom: 1em;
                    text-align: justify;
                }}
                h2 {{
                    font-size: 14pt;
                    margin-top: 1.5em;
                    margin-bottom: 0.5em;
                    color: #1a1a1a;
                }}
                h3 {{
                    font-size: 12pt;
                    margin-top: 1em;
                    margin-bottom: 0.5em;
                    color: #333;
                }}
                ul, ol {{
                    margin-bottom: 1em;
                }}
                li {{
                    margin-bottom: 0.3em;
                }}
                .footer {{
                    margin-top: 2em;
                    padding-top: 1em;
                    border-top: 1px solid #ccc;
                    font-size: 10pt;
                    color: #666;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <div class="speaker">Ajay Banga</div>
                <div style="font-size: 10pt; color: #666;">President, World Bank Group</div>
            </div>
            <h1>{title}</h1>
            {f'<div class="date">{date}</div>' if date else ''}
            <div class="content">
                {content}
            </div>
            <div class="footer">
                <p>Source: {os.path.basename(html_file)}</p>
            </div>
        </body>
        </html>
        """
        
        # Generate filename
        base_name = Path(html_file).stem
        pdf_filename = f"{base_name}.pdf"
        pdf_path = os.path.join(output_folder, pdf_filename)
        
        # Convert to PDF
        HTML(string=html_content).write_pdf(pdf_path)
        
        print(f"✓ Created: {pdf_filename}")
        return True
        
    except Exception as e:
        print(f"✗ Error processing {os.path.basename(html_file)}: {e}")
        return False

# Main execution
speeches_folder = "Ajay_Banga_Speeches"
pdf_folder = "Ajay_Banga_Speeches_PDFs"

# Create PDF output folder
os.makedirs(pdf_folder, exist_ok=True)

# Process all HTML files
html_files = [f for f in os.listdir(speeches_folder) if f.endswith('.html')]
converted_count = 0

print(f"Converting {len(html_files)} speeches to PDF...\n")

for html_file in sorted(html_files):
    html_path = os.path.join(speeches_folder, html_file)
    if create_pdf(html_path, pdf_folder):
        converted_count += 1

print(f"\n✅ Successfully converted {converted_count}/{len(html_files)} speeches to PDF!")
print(f"📁 PDFs saved in '{pdf_folder}' folder")
print("\nThese PDFs are now easy to share via email, Dropbox, or any file-sharing service.")

