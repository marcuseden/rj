# 🎯 CEO Alignment Checker - Complete System Guide

## System Overview

This is a comprehensive CEO alignment and knowledge management system with:

### ✅ **5 Main Features:**

1. **Voice Call** (`/dashboard`) - Talk to CEO AI in their voice
2. **Test Alignment** (`/rj-writing-assistant`) - AI-powered content analysis
3. **Browse Speeches** (`/rj-faq`) - Search & filter speeches by tags
4. **AI Chat Agent** (`/rj-agent`) - Chat with AI trained on CEO knowledge
5. **Vision & Values** (`/vision`) - Explore CEO leadership principles

---

## 📦 What's Included

### Frontend Applications (5 pages)
- `/` - Landing page with feature showcase
- `/login` - Authentication (email/password)
- `/dashboard` - iPhone-style voice call interface
- `/rj-faq` - FAQ browser with tag filtering
- `/rj-writing-assistant` - Writing alignment checker
- `/rj-agent` - AI chat interface
- `/vision` - CEO vision & values

### Backend APIs
- `/api/analyze-speech` - AI analysis endpoint (OpenAI)
- `/api/rj-writing-analysis` - Writing analysis with references

### Data & Knowledge Base
- **14 speeches from PDFs** (speeches_database.json)
- **4 scraped speeches with full metadata** (worldbank-strategy/)
- **Style guide** with patterns & vocabulary
- **Complete tagging system**

### Scripts
- `worldbank-scraper.ts` - Scrape speeches
- `scrape-rj-speeches-direct.ts` - Direct scraping
- `scrape-and-index.ts` - Scrape + save to DB
- More helper scripts in `/scripts`

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Update `.env.local` with your keys:

```env
# ElevenLabs (Voice)
NEXT_PUBLIC_ELEVENLABS_API_KEY=sk_your_elevenlabs_key_here
NEXT_PUBLIC_AGENT_ID=agent_your_agent_id_here

# OpenAI (Analysis)
OPENAI_API_KEY=sk-proj-your_openai_key_here

# Supabase (Database & Auth)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 3. Setup Supabase Database

Go to your Supabase SQL Editor and run:

**Option A - Simple Auth (from SUPABASE_SETUP.md):**
```sql
-- Basic user profiles and CEO alignment tables
-- (See SUPABASE_SETUP.md for full schema)
```

**Option B - Full Knowledge System (from supabase/migrations/):**
```sql
-- Complete worldbank_documents table with tagging
-- (See supabase/migrations/create_worldbank_documents.sql)
```

### 4. Run the Server

```bash
npm run dev
```

Open http://localhost:3001

---

## 🎯 Page-by-Page Guide

### Landing Page (`/`)

**What it shows:**
- CEO profile with avatar
- 4 feature cards
- How it works section
- Sign up CTA

**Features:**
- Responsive design
- World Bank colors
- Auto-detects if user is logged in

### Login (`/login`)

**Features:**
- Email/password signup
- Email/password signin  
- Toggle between modes
- Error handling
- Supabase Auth integration

### Dashboard (`/dashboard`)

**Protected route** - requires login

**Features:**
- iPhone-style call interface
- Large CEO avatar
- Green call button
- Red hang up button
- Call duration timer
- Speaking/Listening status
- CEO Alignment Checker modal
- Upload button for analysis

**How to use:**
1. Click green phone button
2. Talk to AI in CEO's voice
3. Click upload icon for alignment check

### RJ FAQ Browser (`/rj-faq`)

**Features:**
- Browse all CEO speeches
- **Advanced Filtering:**
  - Document Type
  - Sector (Climate, Finance, Agriculture, etc.)
  - Region (Africa, Asia, Global, etc.)
  - Priority (High, Medium, Low)
  - Initiative tags
- Real-time search
- Modal detail views
- Links to original sources

**Use Cases:**
- Research CEO positions on topics
- Find speeches by sector/region
- Quick reference lookup

### Writing Assistant (`/rj-writing-assistant`)

**Purpose:** Test content alignment with CEO style

**Process:**
1. Paste your content
2. Click "Analyze"
3. Get:
   - Alignment score (0-100%)
   - What's aligned ✅
   - Alignment gaps ⚠️
   - Specific suggestions
   - Rewritten version
   - Document references

**Every suggestion includes:**
- Which CEO document it references
- Exact quote from CEO
- Why it matters
- How to fix it

### AI Chat Agent (`/rj-agent`)

**Features:**
- Chat with AI trained on CEO knowledge
- Ask questions about strategy
- Get answers with source references
- Text and voice modes (optional)
- Claude-style UI

**Sample Questions:**
- "What is RJ Banga's vision for climate finance?"
- "How does he approach private sector partnerships?"
- "What are his views on Africa development?"

### Vision Page (`/vision`)

**Content:**
- CEO biography
- Vision statement
- 6 core values with icons
- Communication style guide
- Key themes
- Database statistics

---

## 📊 Knowledge Base

### Speeches Database

**From PDFs (14 speeches):**
- Total: 19,904 words
- Period: 2023-2025
- Format: speeches_database.json
- Used for: Pattern matching, style analysis

**From Scraping (4 speeches):**
- Full metadata with tags
- Complete source tracking
- Sectors, regions, initiatives
- Format: data/worldbank-strategy/documents.json
- Used for: FAQ browser, AI references

---

## 🗄️ Database Schema

### Tables in Supabase:

#### 1. `user_profiles`
- Extended user info
- Company, role, etc.

#### 2. `ceo_profiles`
- CEO data
- Vision, values
- Configuration

#### 3. `speeches`
- Uploaded speeches
- Full text content

#### 4. `analysis_history`
- User analysis results
- Alignment scores
- Saved for later review

#### 5. `worldbank_documents` (Optional - Advanced)
- Full scraped documents
- Complete tagging system
- GIN indexes for fast search
- Full-text search support

---

## 🔧 Scripts Available

### Data Collection:

```bash
# Scrape RJ Banga speeches
npm run scrape:rj

# Scrape and index to database
npm run scrape:index

# Test database connection
npm run test:db
```

### Development:

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Start production
npm start
```

---

## 🎨 Design System

### Colors (World Bank Official):
- Primary Blue: `#0071bc`
- Light Blue: `#009fdb`
- Success Green: `#4caf50`
- Destructive Red: `#eb1c2d`
- Background: Dark slate (950-900)

### Components (shadcn/ui):
- Button, Card, Avatar, Badge
- Input, Dialog
- All styled with World Bank colors

### Layout:
- iPhone-inspired call interface
- Claude-inspired minimal design
- Professional, clean, accessible

---

## 🔐 Authentication Flow

1. User visits `/`
2. Clicks "Sign In" → `/login`
3. Signs up or signs in
4. Redirected to `/dashboard`
5. Dashboard layout checks auth
6. If not authenticated → back to `/login`

All protected routes use `dashboard/layout.tsx` wrapper.

---

## 📡 API Integration

### ElevenLabs (Voice):
- Conversational AI agent
- Real-time voice synthesis
- Agent ID: `agent_2101k94jg1rpfef8hrt86n3qrm5q`

### OpenAI (Analysis):
- GPT-4o-mini for text analysis
- Speech alignment scoring
- Content rewriting
- Pattern matching

### Supabase (Database & Auth):
- PostgreSQL database
- Row Level Security
- Email/password auth
- Storage buckets

---

## 🎯 Use Cases

### 1. Communications Teams
Test press releases, speeches, statements against CEO style

### 2. Speechwriters
Ensure alignment with CEO values and vision

### 3. Policy Teams
Check strategy documents for consistency

### 4. Leadership
Quick reference for CEO positions on topics

### 5. Research
Browse and search CEO speeches by topic/sector

---

## 📚 Documentation Files

- `README.md` - Main project readme
- `SUPABASE_SETUP.md` - Database setup guide
- `SETUP_GUIDE.md` - ElevenLabs voice cloning
- `RJ_BANGA_COMPLETE_SYSTEM.md` - Full system overview
- `FINAL_SYSTEM_SUMMARY.md` - Features summary
- `COMPLETE_SYSTEM_GUIDE.md` - This file

---

## 🚀 Deployment

### Vercel (Recommended):

1. Push to GitHub ✅ (already done)
2. Import to Vercel
3. Add environment variables
4. Deploy

### Manual:

```bash
npm run build
npm start
```

---

## 🔄 Data Flow

```
User Input → Analysis
           ↓
     OpenAI Processing
           ↓
   Pattern Matching (speeches_database.json)
           ↓
   Document References (worldbank-strategy/)
           ↓
   Alignment Score + Feedback
           ↓
   Rewritten Version
           ↓
   Save to analysis_history (optional)
```

---

## ✨ Key Differentiators

1. **Document References** - Every suggestion cites a specific speech
2. **Dual Knowledge Base** - PDFs + scraped metadata
3. **Voice Integration** - Talk to CEO AI
4. **Complete Tagging** - Sector, region, initiative filtering
5. **Source Tracking** - Full reference chain
6. **AI Rewriting** - Get improved version automatically

---

## 🆘 Troubleshooting

### "Can't find documents"
- Check `/public/data/worldbank-strategy/documents.json` exists
- Check `/public/speeches_database.json` exists

### "Authentication not working"
- Verify Supabase keys in `.env.local`
- Check Supabase project is running
- Run SQL to create tables

### "Voice call fails"
- Check ElevenLabs API key is valid
- Verify Agent ID is correct
- Check browser allows microphone access

### "Analysis fails"
- Verify OpenAI API key is set
- Check API has credits
- Try client-side analysis fallback

---

## 📊 Current Status

✅ **Working:**
- Landing page
- Authentication system
- Voice call interface
- Speech analyzer (free pattern matching)
- FAQ browser
- Writing assistant
- AI chat agent
- Vision page

🔧 **Needs Configuration:**
- Supabase URL & keys
- (ElevenLabs & OpenAI keys already set)

📝 **Optional Enhancements:**
- Add more speeches to database
- Customize CEO profile (make it generic)
- Add analysis history dashboard
- Export/share features

---

## 🎉 You're Ready!

The system is complete and production-ready. Just add your Supabase credentials and you can start using all features!

**GitHub Repo:** https://github.com/marcuseden/rj
**Local Dev:** http://localhost:3001

