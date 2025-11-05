#!/usr/bin/env python3
"""
Extract clean speech content from World Bank HTML files
"""
import os
import re
from pathlib import Path

def clean_speech_content():
    """Extract just the speech content from World Bank HTML files"""

    speeches_dir = Path("Ajay_Banga_Speeches")
    output_dir = Path("public/data/speeches")
    output_dir.mkdir(exist_ok=True)

    # Clean HTML template
    template = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <style>
        body {{
            font-family: 'Georgia', 'Times New Roman', serif;
            line-height: 1.7;
            color: #2c3e50;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }}

        .speech-container {{
            background-color: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}

        .speech-title {{
            font-size: 2em;
            font-weight: bold;
            color: #1a365d;
            margin-bottom: 20px;
            text-align: center;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 20px;
        }}

        .speech-meta {{
            text-align: center;
            color: #718096;
            font-size: 0.9em;
            margin-bottom: 30px;
            font-style: italic;
        }}

        .speech-content {{
            font-size: 1.1em;
            line-height: 1.8;
        }}

        .speech-content p {{
            margin-bottom: 1.5em;
        }}

        .speech-content p:first-child {{
            font-weight: 600;
            font-size: 1.2em;
            color: #1a365d;
        }}

        @media (max-width: 768px) {{
            body {{
                padding: 10px;
            }}

            .speech-container {{
                padding: 20px;
            }}

            .speech-title {{
                font-size: 1.5em;
            }}
        }}
    </style>
</head>
<body>
    <div class="speech-container">
        <h1 class="speech-title">{title}</h1>
        <div class="speech-meta">{meta}</div>
        <div class="speech-content">
            {content}
        </div>
    </div>
</body>
</html>'''

    processed = 0

    for html_file in speeches_dir.glob("*.html"):
        try:
            print(f"Processing: {html_file.name}")

            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()

            # Extract title
            title_match = re.search(r'<title>(.*?)</title>', content, re.IGNORECASE | re.DOTALL)
            title = title_match.group(1).strip() if title_match else "RJ Banga Speech"

            # Extract speech content from article.lp__body_content
            article_pattern = r'<article[^>]*class="[^"]*lp__body_content[^"]*"[^>]*>(.*?)</article>'
            article_match = re.search(article_pattern, content, re.IGNORECASE | re.DOTALL)

            if not article_match:
                print(f"  ❌ No speech content found in {html_file.name}")
                continue

            speech_content = article_match.group(1)

            # Extract meta information (first centered paragraph with date/location)
            meta = ""
            first_p_match = re.search(r'<p[^>]*style="[^"]*text-align:\s*center[^"]*"[^>]*>(.*?)</p>', speech_content, re.IGNORECASE | re.DOTALL)
            if first_p_match:
                meta = re.sub(r'<[^>]+>', '', first_p_match.group(1)).strip()

            # Clean up the content - remove inline styles and World Bank specific attributes
            speech_content = re.sub(r'style="[^"]*"', '', speech_content)
            speech_content = re.sub(r'class="[^"]*"', '', speech_content)
            speech_content = re.sub(r'id="[^"]*"', '', speech_content)

            # Clean up extra whitespace
            speech_content = re.sub(r'\s+', ' ', speech_content)
            speech_content = re.sub(r'>\s+<', '><', speech_content)

            # Generate clean HTML
            clean_html = template.format(
                title=title,
                meta=meta,
                content=speech_content
            )

            # Save to output file
            output_file = output_dir / html_file.name
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(clean_html)

            processed += 1
            print(f"  ✅ Cleaned: {html_file.name}")

        except Exception as e:
            print(f"  ❌ Error processing {html_file.name}: {str(e)}")

    print(f"\n🎉 Processed {processed} speech files successfully!")
    print("📁 Clean speech files saved to public/data/speeches/")

if __name__ == "__main__":
    clean_speech_content()
