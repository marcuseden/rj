# Ajay Banga Voice Clone - Next.js App

AI-powered speech generator that creates speeches in the style of Ajay Banga (World Bank Group President) with ElevenLabs voice cloning.

## Features

- 🎤 **Voice Cloning**: Integrate with ElevenLabs to generate authentic voice
- 📝 **Speech Style Analysis**: Based on 14 real speeches (2023-2025)
- 🤖 **AI Text Generation**: Creates speeches matching his speaking patterns
- 🎧 **Audio Playback**: Listen to generated speeches
- 💾 **Download Audio**: Save speeches as MP3 files

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure ElevenLabs API

Get your API key from: https://elevenlabs.io/app/settings/api-keys

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Clone Ajay Banga's Voice

### Step 1: Get Audio Samples

Find clear audio/video of Ajay Banga speaking:

**YouTube Sources:**
- World Bank YouTube: https://www.youtube.com/@WorldBank/search?query=Ajay+Banga
- Annual Meetings speeches
- Mission 300 Africa Energy Summit
- Georgetown University Commencement 2025

**Requirements:**
- 1-10 minutes of clear audio
- Minimal background noise
- Single speaker (Ajay Banga only)

### Step 2: Clone Voice in ElevenLabs

1. Go to https://elevenlabs.io/voice-lab
2. Click "Add Instant Voice Clone"
3. Upload your audio samples
4. Name it "Ajay Banga"
5. Copy the generated **Voice ID**

### Step 3: Use in App

1. Paste your ElevenLabs API Key in the app
2. Paste the Voice ID in the app
3. Generate speeches and hear them in his voice!

## Speaking Style Analysis

The generator uses patterns from 14 analyzed speeches:

**Common Themes:**
- Development and partnerships
- Private sector collaboration
- Reform and innovation
- Job creation and opportunity
- Climate and energy solutions

**Speaking Patterns:**
- Direct, action-oriented language
- Emphasis on collaboration
- Data-driven arguments
- Clear calls to action

## Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **ElevenLabs API** - Voice synthesis
- **@elevenlabs/react** - React SDK

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_api_key
NEXT_PUBLIC_AJAY_BANGA_VOICE_ID=your_voice_id
```

## API Costs

ElevenLabs pricing (as of 2024):
- **Free Tier**: 10,000 characters/month
- **Starter**: $5/month - 30,000 characters
- **Creator**: $22/month - 100,000 characters

Average speech = ~3,000 characters

## Project Structure

```
ajay-banga-voice-clone/
├── app/
│   ├── page.tsx          # Main application
│   └── layout.tsx        # App layout
├── .env.local            # Environment variables
└── README.md             # This file
```

## Development

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Recommended YouTube Videos for Voice Cloning

1. **World Bank Annual Meetings 2025**
   - Search: "Ajay Banga Annual Meetings 2025 plenary"
   
2. **Mission 300 Africa Energy Summit**
   - Search: "Ajay Banga Mission 300 Africa"
   
3. **Georgetown Commencement 2025**
   - Search: "Ajay Banga Georgetown commencement 2025"

## Legal & Ethics

- Voice cloning should be used responsibly
- Clearly label AI-generated content
- Respect intellectual property rights
- Use for research, education, or authorized purposes only

## Support

For issues or questions:
- ElevenLabs Docs: https://elevenlabs.io/docs
- Next.js Docs: https://nextjs.org/docs

## License

MIT License - See LICENSE file for details
