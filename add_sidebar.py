#!/usr/bin/env python3
"""
Add sidebar navigation to speech HTML file
"""
import re

def add_sidebar_to_speech():
    filename = "public/data/speeches/02_Remarks by Ajay Banga at the 2024 G20 Finance Mini.html"

    sidebar_html = '''

    <!-- Professional Sidebar Navigation -->
    <div class="sidebar">
        <div class="sidebar-header">
            <h2>RJ Banga Speeches</h2>
            <p>World Bank Leadership</p>
        </div>
        <nav class="sidebar-nav">
            <div class="nav-section">
                <div class="nav-title">Recent Speeches</div>
                <ul>
                    <li><a href="02_Remarks%20by%20Ajay%20Banga%20at%20the%202024%20G20%20Finance%20Mini.html" class="active">G20 Finance Ministers Session</a></li>
                    <li><a href="01_Remarks%20by%20World%20Bank%20Group%20President%20Ajay%20Banga%20a.html">Annual Meetings Opening</a></li>
                    <li><a href="03_Remarks%20by%20World%20Bank%20Group%20President%20Ajay%20Banga%20a.html">Agriculture & Food Event</a></li>
                    <li><a href="04_World%20Bank%20Group%20President%20Ajay%20Bangas%20Remarks%20at%20.html">Board of Governors</a></li>
                    <li><a href="06_Remarks%20by%20Ajay%20Banga%20at%20the%20Opening%20of%20the%204th%20In.html">4th Industrial Revolution</a></li>
                </ul>
            </div>
            <div class="nav-section">
                <div class="nav-title">Navigation</div>
                <ul>
                    <li><a href="/worldbank-search">← Back to Search</a></li>
                    <li><a href="/">Home</a></li>
                </ul>
            </div>
        </nav>
    </div>

    <div class="content-wrapper">'''

    # Read the file
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace the body tag with body tag + sidebar
    content = content.replace('<body>', '<body>' + sidebar_html, 1)

    # Find the closing body tag and add closing div before it
    content = content.replace('</body>', '    </div>\n</body>', 1)

    # Write back
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

    print("✅ Sidebar added to speech file")

if __name__ == "__main__":
    add_sidebar_to_speech()


