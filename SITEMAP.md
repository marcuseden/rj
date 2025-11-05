# RJ Banga System - Sitemap & Menu Structure

## Public Pages (No Sidebar)
- `/` - Landing page with features overview and sign-up CTA
- `/login` - Login/Sign-up page

## Authenticated Pages (With Left Sidebar)

All pages below require authentication and show the global left sidebar menu:

### Main Navigation

1. **Dashboard** - `/dashboard`
   - Overview page with stats and feature cards
   - Quick links to all sections
   - User welcome message

2. **AI Agent** - `/rj-agent`
   - Chat interface with RJ Banga AI
   - Voice conversation capability (ElevenLabs)
   - Knowledge base trained on speeches and documents

3. **Knowledge Base** - `/rj-faq`
   - Browse World Bank documents and speeches
   - Search and filter functionality
   - Document categories and tags

4. **Document Search** - `/worldbank-search`
   - Comprehensive search through World Bank docs
   - Advanced filtering options
   - Detail view at `/worldbank-search/[id]`

5. **Writing Assistant** - `/rj-writing-assistant`
   - AI-powered text analysis
   - Alignment checker with RJ Banga's style
   - Feedback and suggestions

6. **Organization Chart** - `/worldbank-orgchart`
   - World Bank department structure
   - Leadership profiles
   - Department metrics and info
   - Detail pages at `/department/[id]`

7. **Strategic Vision** - `/vision`
   - RJ Banga's vision for the World Bank
   - Strategic priorities
   - Future direction

## Sidebar Menu Structure

```
┌─ RJ Banga ─────────────────┐
│ World Bank Assistant       │
├────────────────────────────┤
│ 🏠 Dashboard              │
│ 💬 AI Agent               │
│ 📚 Knowledge Base         │
│ 🔍 Document Search        │
│ ✏️  Writing Assistant     │
│ 🏢 Organization Chart     │
│ 👁️  Vision                │
├────────────────────────────┤
│ 🚪 Logout                 │
└────────────────────────────┘
```

## API Routes

- `/api/analyze-speech` - Speech analysis endpoint
- `/api/rj-writing-analysis` - Writing alignment checker
- `/api/worldbank-orgchart` - Organization data

## Color Scheme

- **Primary**: World Bank Blue (#0071bc)
- **Backgrounds**: Light beige (#faf8f3), White (#ffffff)
- **Text**: Stone colors (stone-600, stone-700, stone-800, stone-900)
- **Borders**: Stone-200 (#e7e5e4)

## Authentication Flow

1. User visits `/` (landing page)
2. Clicks "Get Started" → redirects to `/login`
3. Signs up or logs in via Supabase
4. Redirects to `/dashboard`
5. All authenticated pages show sidebar navigation

## Notes

- All authenticated pages use the same layout with sidebar
- Sidebar is fixed on the left (264px wide)
- Main content area has `ml-64` margin
- Mobile responsive (sidebar should collapse on mobile)

