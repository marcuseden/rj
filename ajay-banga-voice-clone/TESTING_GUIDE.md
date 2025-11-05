# Testing Guide - New Minimal Design

## Quick Start

1. **Start the development server:**
```bash
cd ajay-banga-voice-clone
npm run dev
```

2. **Open your browser:**
```
http://localhost:3000
```

## Pages to Test

### 1. Landing Page (`/`)
**What to check:**
- [ ] Off-white background (stone-50)
- [ ] White header with "CEO Alignment Checker" title
- [ ] CEO profile card with avatar
- [ ] Stone-colored text and badges
- [ ] "Get Started" button (stone-900)
- [ ] Two feature cards (Upload, Browse Speeches)
- [ ] "How It Works" section with 3 steps
- [ ] Clean footer
- [ ] **Auto-redirect**: If logged in, should redirect to `/dashboard`

### 2. Login Page (`/login`)
**What to check:**
- [ ] Off-white background
- [ ] White card with stone borders
- [ ] Email and password inputs with stone styling
- [ ] Stone-900 submit button
- [ ] Toggle between Sign In / Sign Up
- [ ] Error messages display in red-50 background

### 3. Dashboard (`/dashboard`)
**What to check:**
- [ ] Sidebar on the left (fixed, 264px wide on desktop)
- [ ] "Welcome back" heading
- [ ] 2 main cards: "Browse CEO Speeches" and "CEO Vision & Values"
- [ ] Both cards should be clickable and navigate properly
- [ ] "About this Collection" info card at bottom
- [ ] Sidebar contains:
  - [ ] Logo and title at top
  - [ ] CEO profile (Ajay Banga with avatar)
  - [ ] Navigation links (Home, Browse Speeches, Vision)
  - [ ] User info at bottom
  - [ ] Sign Out button

### 4. Browse CEO Speeches (`/rj-faq`)
**What to check:**
- [ ] Sidebar present and functional
- [ ] "Browse CEO Speeches" heading
- [ ] Search bar with stone styling
- [ ] Theme filter buttons (All Themes, plus individual themes)
- [ ] Results count display
- [ ] Speech cards showing:
  - [ ] Date and word count
  - [ ] Title
  - [ ] Location
  - [ ] Summary text
  - [ ] Theme badges
  - [ ] "Read full speech" link
- [ ] Hover effects on cards (border changes to stone-300)

### 5. CEO Vision & Values (`/vision`)
**What to check:**
- [ ] Sidebar present and functional
- [ ] Page heading "CEO Vision & Values"
- [ ] CEO profile card with avatar and vision statement
- [ ] Core Values section (6 values in 2 columns):
  - [ ] Partnership, Accountability, Innovation
  - [ ] Equity, Sustainability, Results-Driven
- [ ] Communication Style section (4 items)
- [ ] Key Themes badges
- [ ] Analysis Database stats (3 cards)

## Mobile Testing

### Responsive Breakpoints
Test at these widths:
- [ ] **Mobile**: 375px, 414px
- [ ] **Tablet**: 768px
- [ ] **Desktop**: 1024px, 1440px

### Mobile-Specific Features
- [ ] Hamburger menu button appears on mobile (top-left)
- [ ] Clicking hamburger opens sidebar
- [ ] Overlay appears behind sidebar
- [ ] Clicking overlay closes sidebar
- [ ] Sidebar slides in/out smoothly
- [ ] Content is not cut off
- [ ] Touch targets are large enough (min 44px)

## Navigation Flow Test

1. Start at `/` (landing page)
2. Click "Sign In" → Should go to `/login`
3. Sign in with credentials
4. Should auto-redirect to `/dashboard`
5. Click "Browse CEO Speeches" card → Should go to `/rj-faq`
6. Use sidebar to navigate to "CEO Vision & Values" → Should go to `/vision`
7. Use sidebar to navigate to "Home" → Should go to `/dashboard`
8. Click "Sign Out" in sidebar → Should go back to `/`

## Visual Regression Checks

### Color Palette
- [ ] No blue colors anywhere (except maybe in content)
- [ ] All backgrounds are stone-50 or white
- [ ] All borders are stone-200 or stone-300
- [ ] All text is stone-900, stone-700, stone-600, or stone-500
- [ ] All buttons are stone-900 with white text

### Typography
- [ ] Font family is Inter throughout
- [ ] Headings use font-semibold (not font-bold)
- [ ] Body text has proper line-height (leading-relaxed where appropriate)
- [ ] Text hierarchy is clear (h1 > h2 > h3 > body)

### Spacing
- [ ] Generous padding on cards (p-6 or p-8)
- [ ] Consistent gaps between sections (mb-6, mb-12)
- [ ] Content max-width is reasonable (max-w-5xl)
- [ ] Mobile padding is appropriate (px-6)

### Components
- [ ] All cards have consistent styling
- [ ] All badges use stone colors
- [ ] All buttons use stone-900 background
- [ ] All inputs have stone-200 borders
- [ ] Icons are monochrome (no colored icons)

## Interaction Tests

### Hover States
- [ ] Cards: border changes to stone-300, subtle shadow appears
- [ ] Buttons: background darkens to stone-800
- [ ] Links: text color changes
- [ ] Sidebar items: background changes to stone-100

### Focus States
- [ ] Form inputs show focus ring (ring-stone-400)
- [ ] Buttons show focus state
- [ ] Keyboard navigation works
- [ ] Tab order is logical

## Browser Testing

Test in:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Performance Checks

- [ ] Page loads quickly
- [ ] No layout shift on load
- [ ] Sidebar animation is smooth
- [ ] No console errors
- [ ] No 404s for assets
- [ ] Images load properly (or show fallback)

## Known Issues to Watch For

1. **Avatar image**: External URL may fail to load, should show fallback (AB initials)
2. **Speeches data**: Ensure `speeches_database.json` is accessible
3. **Auth redirects**: May need to clear localStorage if testing repeatedly
4. **Sidebar state**: Should not persist incorrectly on desktop/mobile switches

## Success Criteria

✅ **The redesign is successful if:**
1. All pages use off-white (stone-50) background
2. No blue colors visible in the UI
3. Sidebar navigation works on all authenticated pages
4. "Browse CEO Speeches" and "CEO Vision & Values" links work
5. Mobile menu (hamburger) functions properly
6. Typography is clean and readable
7. All interactions are smooth
8. No linting or console errors
9. Design feels minimal and professional (Claude-like)
10. All content is accessible and properly formatted

