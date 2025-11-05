#!/usr/bin/env python3
"""
SPEECH HTML CLEANER
===================

This script extracts clean text content from HTML speech files,
removing all CSS, JavaScript, and HTML markup.

USAGE:
- Run locally: python clean_speech_html.py
- Run in Colab: Copy and paste the function into a Colab cell

OUTPUT:
- Creates a 'cleaned_speeches' directory
- Converts each .html file to clean .txt format
- Extracts only h1, h2, and p content
- Removes all styling and scripts
"""

import os
from bs4 import BeautifulSoup

def clean_speech_html():
    """Extract clean text content from HTML speech files"""
    speeches_dir = "Ajay_Banga_Speeches"
    cleaned_dir = "cleaned_speeches"

    # Create cleaned directory
    os.makedirs(cleaned_dir, exist_ok=True)

    if not os.path.exists(speeches_dir):
        print(f"❌ Speeches directory not found: {speeches_dir}")
        return

    files_processed = 0

    for filename in os.listdir(speeches_dir):
        if filename.endswith('.html'):
            html_path = os.path.join(speeches_dir, filename)
            txt_filename = filename.replace('.html', '.txt')
            txt_path = os.path.join(cleaned_dir, txt_filename)

            try:
                with open(html_path, 'r', encoding='utf-8') as f:
                    html_content = f.read()

                soup = BeautifulSoup(html_content, 'html.parser')

                # Extract title
                title = ""
                title_elem = soup.select_one('h1, .speech-title, title')
                if title_elem:
                    title = title_elem.get_text(strip=True)

                # Extract meta info
                meta = ""
                meta_elem = soup.select_one('.speech-meta')
                if meta_elem:
                    meta = meta_elem.get_text(strip=True)

                # Extract content from speech-content div or main content areas
                content_parts = []

                # Get speech content
                speech_content = soup.select_one('.speech-content')
                if speech_content:
                    # Get all h1, h2, p elements
                    for elem in speech_content.find_all(['h1', 'h2', 'p']):
                        text = elem.get_text(strip=True)
                        if text and len(text) > 10:  # Filter out very short fragments
                            content_parts.append(text)

                # If no speech-content found, try general content extraction
                if not content_parts:
                    for elem in soup.find_all(['h1', 'h2', 'p']):
                        text = elem.get_text(strip=True)
                        if text and len(text) > 10 and not any(skip in text.lower() for skip in ['cookie', 'privacy', 'terms', 'copyright']):
                            content_parts.append(text)

                # Create clean text content
                clean_content = []

                if title:
                    clean_content.append(f"TITLE: {title}")
                    clean_content.append("")  # Empty line

                if meta:
                    clean_content.append(f"META: {meta}")
                    clean_content.append("")  # Empty line

                clean_content.append("CONTENT:")
                clean_content.append("=" * 50)

                for part in content_parts:
                    # Clean up extra whitespace and normalize
                    part = ' '.join(part.split())  # Normalize whitespace
                    if part:
                        clean_content.append(part)
                        clean_content.append("")  # Empty line between paragraphs

                # Write clean text file
                with open(txt_path, 'w', encoding='utf-8') as f:
                    f.write('\n'.join(clean_content))

                print(f"✅ Cleaned: {filename} → {txt_filename}")
                files_processed += 1

            except Exception as e:
                print(f"❌ Error cleaning {filename}: {str(e)}")

    print(f"\n🎉 CLEANING COMPLETE: {files_processed} speech files processed")
    print(f"📁 Cleaned files saved to: {cleaned_dir}")

    # Show example of cleaned content
    if files_processed > 0:
        example_file = os.path.join(cleaned_dir, os.listdir(cleaned_dir)[0])
        try:
            with open(example_file, 'r', encoding='utf-8') as f:
                full_content = f.read()
                preview = full_content[:500] + "..." if len(full_content) > 500 else full_content
            print(f"\n📖 Example cleaned content from {os.path.basename(example_file)}:")
            print("-" * 50)
            print(preview[:300] + "..." if len(preview) > 300 else preview)
        except Exception as e:
            print(f"❌ Could not show preview: {str(e)}")

if __name__ == "__main__":
    print("🧹 SPEECH HTML CLEANER")
    print("=" * 30)
    clean_speech_html()