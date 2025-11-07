#!/usr/bin/env python3
"""
Hide or fix dynamic sections in speech HTML files that won't work locally
"""
import re

def fix_dynamic_sections():
    filename = "public/data/speeches/02_Remarks by Ajay Banga at the 2024 G20 Finance Mini.html"

    # Read the file
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # Pattern to match the entire blogs section (from heading to closing div)
    blogs_pattern = r'(\s*<div class="research_auto_manual parbase section">\s*<div class="lp__heading_v1">\s*<h2[^>]*>Blogs</h2>\s*</div>\s*<input[^>]*class="compType"[^>]*data-type = "blogs"[^>]*>.*?)(<script[^>]*>.*?)</script>'

    # Replace blogs section with hidden div
    content = re.sub(blogs_pattern, r'\n    <!-- Blogs section hidden - requires World Bank API -->\n    <div style="display: none;">\2</div>', content, flags=re.DOTALL)

    # Pattern to match the entire "WHAT'S NEW" section
    whatsnew_pattern = r'(\s*<div class="research_auto_manual parbase section">\s*<div class="lp__heading_v1">\s*<h2[^>]*>WHAT\'S NEW</h2>\s*</div>\s*<input[^>]*class="compType"[^>]*data-type = "whatsnew"[^>]*>.*?)(<script[^>]*>.*?)</script>'

    # Replace "WHAT'S NEW" section with hidden div
    content = re.sub(whatsnew_pattern, r'\n    <!-- What\'s New section hidden - requires World Bank API -->\n    <div style="display: none;">\2</div>', content, flags=re.DOTALL)

    # Alternative approach: remove the sections entirely
    # Find and remove the entire blogs section
    blogs_section_pattern = r'<div class="research_auto_manual parbase section">\s*<div class="lp__heading_v1">\s*<h2[^>]*>Blogs</h2>\s*</div>\s*<input[^>]*class="compType"[^>]*data-type = "blogs"[^>]*>.*?</div>\s*<script[^>]*>.*?</script>\s*</div>'
    content = re.sub(blogs_section_pattern, '', content, flags=re.DOTALL)

    # Find and remove the entire "WHAT'S NEW" section
    whatsnew_section_pattern = r'<div class="research_auto_manual parbase section">\s*<div class="lp__heading_v1">\s*<h2[^>]*>WHAT\'S NEW</h2>\s*</div>\s*<input[^>]*class="compType"[^>]*data-type = "whatsnew"[^>]*>.*?</div>\s*<script[^>]*>.*?</script>\s*</div>'
    content = re.sub(whatsnew_section_pattern, '', content, flags=re.DOTALL)

    # Write back
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

    print("✅ Removed problematic dynamic sections from speech file")

if __name__ == "__main__":
    fix_dynamic_sections()







