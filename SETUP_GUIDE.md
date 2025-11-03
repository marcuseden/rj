# 🎤 Ajay Banga Voice Clone - Complete Setup Guide

## What This App Does

This Next.js application generates speeches in the style of Ajay Banga (World Bank Group President) and converts them to audio using ElevenLabs voice cloning technology.

## Step-by-Step Setup

### 1️⃣ Get ElevenLabs API Key (Required)

1. Go to https://elevenlabs.io/
2. Sign up for a free account
3. Navigate to Settings → API Keys
4. Click "Create API Key"
5. Copy your API key (starts with `sk_...`)

### 2️⃣ Clone Ajay Banga's Voice (Recommended)

#### Find Audio Samples

You need 1-10 minutes of clear audio of Ajay Banga speaking.

**Best Sources:**

1. **YouTube - World Bank Channel**
   ```
   https://www.youtube.com/@WorldBank/search?query=Ajay+Banga
   ```

2. **Recommended Videos:**
   - "Remarks by World Bank Group President Ajay Banga - Annual Meetings 2025"
   - "Mission 300 Africa Energy Summit - Ajay Banga"
   - "Georgetown University Commencement 2025"

#### Download Audio from YouTube

Using online tool:
```
https://ytmp3.nu/
```
Or command line:
```bash
# Install yt-dlp
brew install yt-dlp

# Download audio
yt-dlp -x --audio-format mp3 [YOUTUBE_URL]
```

#### Clone Voice in ElevenLabs

1. Go to https://elevenlabs.io/voice-lab
2. Click "Add Instant Voice Clone"
3. Upload your audio file(s)
4. Name: "Ajay Banga"
5. Click "Add Voice"
6. Copy the **Voice ID** (important!)

### 3️⃣ Run the Application

```bash
# Navigate to project
cd ajay-banga-voice-clone

# Install dependencies (if not done)
npm install

# Start development server
npm run dev
```

Open http://localhost:3000

### 4️⃣ Use the App

1. **Enter your ElevenLabs API Key** in the first field
2. **Enter your Voice ID** in the second field (optional - uses default voice if empty)
3. **Type a topic** (e.g., "climate finance reform")
4. Click **"Generate Speech Text"**
5. Click **"Generate Voice with ElevenLabs"**
6. Listen and download!

## ElevenLabs Pricing

| Plan | Price | Characters/Month | ~Speeches |
|------|-------|------------------|-----------|
| Free | $0 | 10,000 | ~3 speeches |
| Starter | $5 | 30,000 | ~10 speeches |
| Creator | $22 | 100,000 | ~30 speeches |

Average speech ≈ 3,000 characters

## Troubleshooting

### "Error: Invalid API key"
- Check your API key is correct
- Make sure it starts with `sk_`
- Verify your ElevenLabs account is active

### "Voice generation failed"
- Check you have credits remaining
- Try a shorter text
- Verify Voice ID is correct

### "No audio playing"
- Check browser allows audio playback
- Try downloading the file instead
- Check console for errors

## Finding Good YouTube Videos

**Search Terms:**
```
"Ajay Banga World Bank speech"
"Ajay Banga Annual Meetings"
"Ajay Banga Mission 300"
"Ajay Banga commencement"
```

**What Makes Good Training Audio:**
- Clear speech (no music/background noise)
- Single speaker
- At least 1 minute long
- High quality recording

## Project Files

```
ajay-banga-voice-clone/
├── app/
│   └── page.tsx              # Main app (single file!)
├── .env.local                # Your API keys (create this)
├── package.json              # Dependencies
└── README.md                 # Documentation
```

## Quick Tips

✅ **DO:**
- Use clear, well-recorded audio for voice cloning
- Start with free tier to test
- Keep API keys private
- Label AI-generated content clearly

❌ **DON'T:**
- Share your API keys publicly
- Use poor quality audio for cloning
- Generate inappropriate content
- Claim AI content is real

## Next Steps

1. ✅ Get ElevenLabs API key
2. ✅ Clone voice (or use default)
3. ✅ Run `npm run dev`
4. ✅ Generate your first speech!
5. 🎉 Share responsibly

## Resources

- ElevenLabs Docs: https://elevenlabs.io/docs
- Voice Lab: https://elevenlabs.io/voice-lab
- Next.js Docs: https://nextjs.org/docs
- World Bank YouTube: https://www.youtube.com/@WorldBank

## Support

Need help? Check:
1. Console errors in browser (F12)
2. Terminal output for errors
3. ElevenLabs status page
4. This guide's troubleshooting section

---

**Ready to start? Run `npm run dev` and open http://localhost:3000** 🚀

