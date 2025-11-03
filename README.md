# CEO Alignment Checker

AI-powered tool to test if your content aligns with CEO values, vision, and communication style.

## Features

✅ **Authentication** - Email/password login with Supabase  
✅ **Landing Page** - Professional homepage with feature showcase  
✅ **Voice Call** - Talk to CEO AI in their authentic voice (ElevenLabs)  
✅ **Content Analysis** - Test alignment with CEO style (score + feedback)  
✅ **AI Rewriting** - Get content rewritten in CEO's voice  
✅ **Vision Page** - Explore CEO values, vision & communication patterns  
✅ **Analysis Database** - 14 real speeches, 19,904 words analyzed  

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI components
- **Supabase** - Authentication & database
- **ElevenLabs** - Voice AI agent
- **OpenAI** - Enhanced speech analysis

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Then fill in your API keys:

```env
# ElevenLabs
NEXT_PUBLIC_ELEVENLABS_API_KEY=sk_...
NEXT_PUBLIC_AGENT_ID=agent_...

# OpenAI (optional)
OPENAI_API_KEY=sk-proj-...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Setup Supabase

Follow `SUPABASE_SETUP.md` for complete instructions:

1. Create Supabase project
2. Run SQL to create tables
3. Configure authentication
4. Add API keys to `.env.local`

### 4. Run Development Server

```bash
npm run dev
```

Open http://localhost:3001

## Project Structure

```
ajay-banga-voice-clone/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── login/page.tsx           # Authentication
│   ├── dashboard/
│   │   ├── layout.tsx           # Protected route wrapper
│   │   └── page.tsx             # Main app (voice + analysis)
│   ├── vision/page.tsx          # CEO vision & values
│   └── api/
│       └── analyze-speech/      # AI analysis endpoint
├── components/ui/               # Shadcn components
├── lib/
│   ├── supabase.ts             # Supabase client
│   └── speech-analyzer.ts      # Speech analysis logic
├── public/
│   ├── speeches_database.json  # 14 speeches data
│   └── banga_style_guide.json  # Style patterns
└── SUPABASE_SETUP.md           # Database setup guide
```

## Pages

### Landing Page (`/`)
- Hero section with CEO profile
- Feature cards (Call, Test, Vision, Rewrite)
- How it works section
- CTA for sign up

### Login (`/login`)
- Email/password authentication
- Sign up / Sign in toggle
- Protected by Supabase Auth

### Dashboard (`/dashboard`)
- Protected route (requires login)
- iPhone-style call interface
- CEO alignment checker modal
- Voice conversation with AI agent

### Vision (`/vision`)
- CEO biography & vision statement
- Core values with icons
- Communication style guide
- Key themes & statistics

## Features in Detail

### 🎤 Voice Call
- Real-time conversation with AI agent
- Speaks in CEO's authentic voice
- Discuss content, get feedback
- Powered by ElevenLabs

### 📊 Content Analysis
- Upload speech/article/statement
- Get alignment score (0-100%)
- See strengths & gaps
- AI rewriting in CEO's voice
- Pattern matching + GPT-4 analysis

### 📖 Vision & Values
- CEO biography
- Vision statement
- 6 core values
- Communication style guide
- Key themes from speeches

### 🔐 Authentication
- Email/password login
- Supabase Auth
- Protected routes
- User session management

## Database Schema

### Tables:
- `user_profiles` - User information
- `ceo_profiles` - CEO data & configuration
- `speeches` - CEO speech database
- `analysis_history` - User analysis results

See `SUPABASE_SETUP.md` for complete schema.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_ELEVENLABS_API_KEY` | ElevenLabs API key |
| `NEXT_PUBLIC_AGENT_ID` | ElevenLabs agent ID |
| `OPENAI_API_KEY` | OpenAI API key (optional) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!

### Manual

```bash
npm run build
npm start
```

## Support

For issues:
- Check `SUPABASE_SETUP.md` for database setup
- Verify all environment variables are set
- Check browser console for errors

## License

MIT

## Credits

- ElevenLabs - Voice AI
- OpenAI - Text analysis
- Supabase - Auth & database
- Shadcn/ui - Components
- World Bank - Speech data
