import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import time

# List of speech URLs (compiled from World Bank archive; add more if needed)
speech_urls = [
    "https://www.worldbank.org/en/news/speech/2025/10/17/remarks-by-world-bank-group-president-ajay-banga-at-the-2025-annual-meetings-plenary",
    "https://www.worldbank.org/en/news/speech/2025/10/14/remarks-by-world-bank-group-president-ajay-banga-at-the-agriconnect-flagship-event-during-the-2025-world-bank-imf-annual",
    "https://www.worldbank.org/en/news/speech/2025/06/30/4th-international-conference-on-financing-for-development-opening-remarks",
    "https://www.worldbank.org/en/news/speech/2025/06/26/remarks-by-world-bank-group-president-ajay-banga-at-the-signing-of-a-partnership-agreement-with-iaea",
    "https://msb.georgetown.edu/news-story/student-experience/student-experience-ajay-banga-to-graduates-seize-luck-chase-curiosity-and-lead-with-decency/",  # May 2025 commencement
    "https://www.istana.gov.sg/Newsroom/Speeches/2025/04/23/Transcript-of-Panel-Discussion-on-Jobs---The-Path-to-Prosperity",  # April 2025 panel
    "https://www.worldbank.org/en/news/speech/2025/01/28/remarks-by-world-bank-group-president-ajay-banga-at-the-mission-300-africa-energy-summit",
    "https://www.worldbank.org/en/news/speech/2024/10/25/remarks-by-world-bank-group-president-ajay-banga-at-the-2024-annual-meetings-plenary",
    "https://www.worldbank.org/en/news/speech/2024/10/23/-remarks-by-world-bank-group-president-ajay-banga-at-the-agriculture-flagship-event",
    "https://www.worldbank.org/en/news/speech/2024/09/10/remarks-by-world-bank-group-president-ajay-banga-at-lowy-institute-in-sydney-australia",
    "https://www.worldbank.org/en/news/speech/2024/07/24/remarks-by-world-bank-group-president-ajay-banga-at-g20-global-alliance-against-hunger-poverty",
    "https://www.worldbank.org/en/news/speech/2024/04/29/world-bank-group-president-ajay-banga-s-remarks-at-ida-heads-of-state-summit",
    "https://www.worldbank.org/en/news/speech/2024/03/24/remarks-by-world-bank-group-president-ajay-banga-at-the-china-development-forum",
    "https://www.worldbank.org/en/news/speech/2024/02/28/remarks-by-ajay-banga-at-the-2024-g20-finance-ministers-session-1-the-role-of-economic-policies-in-addressing-inequaliti",
    "https://www.worldbank.org/en/news/speech/2023/12/06/ajay-banga-remarks-international-development-association-ida-midterm-review",
    "https://www.worldbank.org/en/news/speech/2023/12/01/remarks-by-world-bank-president-ajay-banga-at-transforming-climate-finance-event",
    "https://www.worldbank.org/en/news/speech/2023/10/13/remarks-by-world-bank-group-president-ajay-banga-at-the-2023-annual-meetings-plenary",
    "https://www.worldbank.org/en/news/speech/2023/09/10/remarks-by-world-bank-president-ajay-banga-at-the-2023-g20-india-one-future-session"
    # Add any additional URLs here as new speeches are released
]

def download_speech(url, folder):
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract title for filename (fallback to URL if no title)
        title_elem = soup.find('h1') or soup.find('title')
        title = title_elem.get_text().strip() if title_elem else urlparse(url).path.split('/')[-1].replace('-', '_')
        # Clean filename: remove invalid chars, limit length
        title = "".join(c for c in title if c.isalnum() or c in (' ', '-', '_')).rstrip()
        date = url.split('/')[-3] if '/speech/' in url else 'unknown_date'
        filename = f"{date}_{title[:50]}.html"
        
        filepath = os.path.join(folder, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(response.text)
        
        print(f"Downloaded: {filename}")
        return True
    except Exception as e:
        print(f"Error downloading {url}: {e}")
        return False

# Main execution
folder = "Ajay_Banga_Speeches"
os.makedirs(folder, exist_ok=True)
downloaded_count = 0

for url in speech_urls:
    if download_speech(url, folder):
        downloaded_count += 1
    time.sleep(1)  # Polite delay to avoid overwhelming servers

print(f"\nDownloaded {downloaded_count} speeches to '{folder}' folder!")
print("Open the .html files in your browser to read the full transcripts.")








