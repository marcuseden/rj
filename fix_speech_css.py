#!/usr/bin/env python3
"""
Fix CSS links in speech HTML files
"""
import os
import re
from pathlib import Path

def fix_css_links():
    speeches_dir = Path("public/data/speeches")

    if not speeches_dir.exists():
        print(f"Directory {speeches_dir} does not exist")
        return

    # CSS links to remove
    css_links_to_remove = [
        r'<link rel="stylesheet" href="/etc\.clientlibs/worldbankgroup/clientlibs/clientlib-base\.css"[^>]*>',
        r'<link rel="stylesheet" href="/etc\.clientlibs/worldbankgroup/components/content/redesign_title_meta/clientlibs/site\.css"[^>]*>',
        r'<link rel="stylesheet" href="/etc\.clientlibs/worldbankgroup/components/content/redesign_related/clientlibs/site\.css"[^>]*>',
        r'<link rel="stylesheet" href="/etc\.clientlibs/worldbankgroup/components/content/redesign_static_content/clientlibs/site\.css"[^>]*>',
        r'<link rel="stylesheet" href="/etc\.clientlibs/worldbankgroup/components/content/autopull_metadata/clientlibs/site\.css"[^>]*>',
        r'<link rel="stylesheet" href="/etc\.clientlibs/worldbankgroup/components/content/f03v1_pagetools/clientlibs/site\.css"[^>]*>',
        r'<link rel="stylesheet" href="/etc\.clientlibs/worldbankgroup/components/content/research_auto_manual/clientlibs-base/site\.css"[^>]*>',
        r'<link rel="stylesheet" href="/etc\.clientlibs/worldbankgroup/components/content/redesign_title/clientlibs/site\.css"[^>]*>',
        r'<link rel="stylesheet" href="/etc\.clientlibs/worldbankgroup/components/content/lp__media_components/clientlibs/site\.css"[^>]*>',
        r'<link rel="stylesheet" href="/etc\.clientlibs/worldbankgroup/components/content/c02v2_multimedia/clientlibs/site\.css"[^>]*>',
    ]

    # New CSS link to add
    new_css_link = '<link rel="stylesheet" href="speech-styles.css" type="text/css">'

    for html_file in speeches_dir.glob("*.html"):
        print(f"Processing {html_file.name}")

        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Remove all the World Bank CSS links
        for css_link_pattern in css_links_to_remove:
            content = re.sub(css_link_pattern, '', content, flags=re.MULTILINE | re.DOTALL)

        # Add our local CSS link after the favicon
        favicon_pattern = r'(<link rel="shortcut icon"[^>]*>)'
        if re.search(favicon_pattern, content):
            content = re.sub(favicon_pattern, r'\1\n    ' + new_css_link, content, count=1)
        else:
            # If no favicon found, add after charset
            charset_pattern = r'(<meta charset="[^"]*"\s*/>)'
            content = re.sub(charset_pattern, r'\1\n    ' + new_css_link, content, count=1)

        # Write back the modified content
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(content)

    print("✅ CSS links fixed in all speech HTML files")

if __name__ == "__main__":
    fix_css_links()


