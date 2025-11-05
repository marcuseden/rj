# 🎥 Video Transcription Guide for RJ Banga Content

## Overview

This guide helps you download and transcribe Ajay Banga video speeches to add to the knowledge base.

## 📹 Best Video Sources

### 1. World Bank YouTube Channel
- **URL**: https://www.youtube.com/@WorldBank/search?query=Ajay+Banga
- **Content**: Official speeches, events, interviews
- **Quality**: High quality audio, professional recordings

### 2. Recommended Videos to Transcribe

**High Priority:**
1. **Annual Meetings 2024 Plenary**
   - Search: "Ajay Banga Annual Meetings 2024"
   - Duration: ~15-20 minutes
   - Key topics: Climate, IDA, reform

2. **Mission 300 Africa Energy Summit**
   - Search: "Ajay Banga Mission 300 Africa"
   - Duration: ~10 minutes
   - Key topics: Energy access, jobs

3. **Georgetown University Commencement 2025**
   - Search: "Ajay Banga Georgetown 2025"
   - Duration: ~20 minutes
   - Key topics: Leadership, values, vision

4. **Lowy Institute Sydney**
   - Search: "Ajay Banga Lowy Institute Sydney"
   - Duration: ~30 minutes
   - Key topics: Reform, climate, partnerships

5. **G20 Summits**
   - Search: "Ajay Banga G20"
   - Various lengths
   - Key topics: Global cooperation

---

## 🔧 Method 1: Automated (Recommended)

### Step 1: Install yt-dlp

```bash
brew install yt-dlp
```

### Step 2: Download Audio from Videos

```bash
# Create audio directory
mkdir -p data/audio

# Download single video
yt-dlp -x --audio-format mp3 -o "data/audio/%(title)s.%(ext)s" "YOUTUBE_URL_HERE"

# Download playlist
yt-dlp -x --audio-format mp3 -o "data/audio/%(playlist_index)s-%(title)s.%(ext)s" "PLAYLIST_URL"
```

### Step 3: Transcribe

```bash
npm run transcribe
```

The script will:
- ✅ Find all MP3 files in `data/audio/`
- ✅ Transcribe using OpenAI Whisper
- ✅ Save transcripts to `data/transcripts/`
- ✅ Save to Supabase database
- ✅ Update CEO profile speech count

---

## 🔧 Method 2: Manual Download

### Step 1: Download Videos

Use online tool:
- **ytmp3.nu**: https://ytmp3.nu/
- **y2mate**: https://www.y2mate.com/

Steps:
1. Copy YouTube URL
2. Paste into converter
3. Click "Convert to MP3"
4. Download the file

### Step 2: Move Files

```bash
# Create directory
mkdir -p data/audio

# Move downloaded files
mv ~/Downloads/ajay-banga-*.mp3 data/audio/
```

### Step 3: Transcribe

```bash
npm run transcribe
```

---

## 🎯 Example: Complete Workflow

```bash
# 1. Download audio from a specific video
yt-dlp -x --audio-format mp3 \
  -o "data/audio/ajay-banga-annual-meetings-2024.mp3" \
  "https://www.youtube.com/watch?v=VIDEO_ID"

# 2. Transcribe
npm run transcribe

# 3. Check results
npm run db:stats
```

---

## 📊 What Gets Saved

### Files Created:
```
data/
  audio/
    *.mp3                    # Downloaded audio files
  transcripts/
    *.txt                    # Transcribed text
  html/
    *.html                   # Downloaded web pages
  pdfs/
    *.pdf                    # Downloaded PDFs
  rj-banga-complete.json    # Master index
```

### Database Tables Updated:
1. **worldbank_documents**
   - Full transcript as content
   - Tagged with sectors, themes, initiatives
   - Source tracking

2. **speeches**
   - Linked to CEO profile
   - Full text searchable
   - Word count, reading time

3. **ceo_profiles**
   - Updated speech count
   - Last activity timestamp

---

## 🏷️ Automatic Tagging

Each transcript gets tagged with:

### Geographic Tags:
- Regions: Africa, Asia, Latin America, etc.
- Countries: Specific countries mentioned

### Thematic Tags:
- Sectors: Climate, Agriculture, Finance, Energy, etc.
- Themes: Partnership, Reform, Accountability, etc.
- Topics: IDA Replenishment, Mission 300, etc.

### Strategic Elements:
- Key Messages
- Action Items  
- Commitments (financial and policy)
- Partnerships mentioned
- Targets (dates, numbers)

### World Bank Specific:
- Initiatives: Mission 300, IDA21, etc.
- Project Codes: P-codes
- Departments
- Related documents

---

## 💡 Pro Tips

### Best Videos for Voice Cloning:
- ✅ Clear audio (no music/background noise)
- ✅ Single speaker (Ajay Banga only)
- ✅ At least 2-3 minutes long
- ✅ Recent (2023-2025)

### Best Videos for Knowledge Base:
- ✅ Policy speeches (Annual Meetings, G20)
- ✅ Strategic announcements
- ✅ Vision statements
- ✅ Q&A sessions

---

## 🚀 Quick Start

```bash
# Install yt-dlp
brew install yt-dlp

# Download top 5 speeches
yt-dlp -x --audio-format mp3 \
  -o "data/audio/%(title)s.%(ext)s" \
  "https://www.youtube.com/playlist?list=YOUR_PLAYLIST"

# Transcribe all
npm run transcribe

# Check results
npm run db:stats
```

---

## 📈 Expected Results

After transcribing 10 videos:
- 📊 **~50,000 words** added to knowledge base
- 📊 **~250 minutes** of reading time
- 📊 **10x more** context for AI analysis
- 📊 **Better alignment** scoring
- 📊 **More accurate** CEO voice cloning

---

## ⚠️ Important Notes

### API Costs (OpenAI Whisper):
- **$0.006 per minute** of audio
- 10 minute video = $0.06
- 1 hour of content = $0.36
- Very affordable!

### Audio Format Requirements:
- Supported: mp3, mp4, mpeg, mpga, m4a, wav, webm
- Max file size: 25 MB
- If larger, split into chunks

### Quality Tips:
- Clear speech > background music
- Recent recordings > older ones
- Official sources > third-party uploads

---

## 🎯 Recommended Videos to Start With

1. **World Bank Annual Meetings 2024** (Must have)
2. **Mission 300 Launch** (Energy focus)
3. **IDA Replenishment Events** (Finance focus)
4. **Georgetown Commencement** (Leadership vision)
5. **G20 Speeches** (Global strategy)

---

## 📞 Next Steps

1. ✅ Install yt-dlp: `brew install yt-dlp`
2. ✅ Download 3-5 key videos
3. ✅ Run: `npm run transcribe`
4. ✅ Check: `npm run db:stats`
5. ✅ Test alignment checker with new data!

The more transcripts you add, the better the AI understanding! 🚀







