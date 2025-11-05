import os
from bs4 import BeautifulSoup
import re
import json

def extract_media_links(html_file):
    """Extract video and audio links from speech HTML files."""
    with open(html_file, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')
    
    media_links = {
        'file': os.path.basename(html_file),
        'videos': [],
        'audio': [],
        'youtube': [],
        'other_media': []
    }
    
    # Find video tags
    for video in soup.find_all('video'):
        src = video.get('src')
        if src:
            media_links['videos'].append(src)
        # Check for source tags inside video
        for source in video.find_all('source'):
            src = source.get('src')
            if src:
                media_links['videos'].append(src)
    
    # Find audio tags
    for audio in soup.find_all('audio'):
        src = audio.get('src')
        if src:
            media_links['audio'].append(src)
        for source in audio.find_all('source'):
            src = source.get('src')
            if src:
                media_links['audio'].append(src)
    
    # Find YouTube embeds
    for iframe in soup.find_all('iframe'):
        src = iframe.get('src', '')
        if 'youtube' in src or 'youtu.be' in src:
            media_links['youtube'].append(src)
    
    # Find links to video/audio files
    for link in soup.find_all('a'):
        href = link.get('href', '')
        if any(ext in href.lower() for ext in ['.mp4', '.mp3', '.wav', '.m4a', '.webm', '.ogg']):
            media_links['other_media'].append(href)
    
    # Look for data attributes or JSON with media
    scripts = soup.find_all('script', type='application/ld+json')
    for script in scripts:
        try:
            data = json.loads(script.string)
            if isinstance(data, dict):
                if 'video' in data:
                    media_links['other_media'].append(str(data['video']))
                if 'audio' in data:
                    media_links['other_media'].append(str(data['audio']))
        except:
            pass
    
    return media_links

# Process all HTML files
speeches_folder = "Ajay_Banga_Speeches"
html_files = [f for f in os.listdir(speeches_folder) if f.endswith('.html')]

all_media = []
total_videos = 0
total_audio = 0
total_youtube = 0

print("=" * 80)
print("SEARCHING FOR AUDIO/VIDEO LINKS IN AJAY BANGA SPEECHES")
print("=" * 80)

for html_file in sorted(html_files):
    html_path = os.path.join(speeches_folder, html_file)
    media = extract_media_links(html_path)
    
    if media['videos'] or media['audio'] or media['youtube'] or media['other_media']:
        all_media.append(media)
        total_videos += len(media['videos'])
        total_audio += len(media['audio'])
        total_youtube += len(media['youtube'])
        
        print(f"\n📄 {media['file']}")
        if media['videos']:
            print(f"   Videos: {len(media['videos'])}")
            for v in media['videos']:
                print(f"      - {v}")
        if media['audio']:
            print(f"   Audio: {len(media['audio'])}")
            for a in media['audio']:
                print(f"      - {a}")
        if media['youtube']:
            print(f"   YouTube: {len(media['youtube'])}")
            for y in media['youtube']:
                print(f"      - {y}")
        if media['other_media']:
            print(f"   Other: {len(media['other_media'])}")
            for o in media['other_media']:
                print(f"      - {o}")

print("\n" + "=" * 80)
print("SUMMARY")
print("=" * 80)
print(f"Total files with media: {len(all_media)}")
print(f"Total videos: {total_videos}")
print(f"Total audio: {total_audio}")
print(f"Total YouTube: {total_youtube}")

# Save results
with open('media_links.json', 'w', encoding='utf-8') as f:
    json.dump(all_media, f, indent=2)

print(f"\n✅ Results saved to media_links.json")

print("\n" + "=" * 80)
print("RECOMMENDED SOURCES FOR VOICE CLONING:")
print("=" * 80)
print("1. World Bank YouTube Channel:")
print("   https://www.youtube.com/@WorldBank/search?query=Ajay+Banga")
print("\n2. World Bank Live Events:")
print("   https://live.worldbank.org/")
print("\n3. Search for specific speeches:")
for i, media in enumerate(all_media[:5], 1):
    print(f"   {i}. {media['file']}")








