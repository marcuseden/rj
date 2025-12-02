# Avatar URL Fix Guide

## Issues Fixed ✅

### 1. **Mobile Header Covering H1 Headings**
- ✅ Fixed: Added `pt-16` (padding-top: 4rem) to main content on mobile
- ✅ Desktop unaffected: Uses `md:pt-0` to remove padding on larger screens
- **Result**: All h1 headings are now visible below the fixed mobile menu

### 2. **Avatar Image Paths Not Working**
- ✅ Fixed: Updated RJ Agent avatar from `/ajay-banga-avatar.jpg` to `/avatars/ajay-banga.jpg`
- ✅ Fixed: Added automatic URL fixing in API for all org chart avatars
- ✅ Created: SQL script to permanently fix database URLs

## How to Permanently Fix Database Avatar URLs

### Option 1: SQL Script (Recommended)
1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Open the file `FIX_AVATAR_URLS.sql`
4. Copy and paste the entire SQL script
5. Click **Run** to execute
6. Verify results in the output

### Option 2: API Auto-Fix (Already Active)
The API now automatically fixes any incorrect avatar URLs on the fly!
- If avatar_url doesn't start with `/avatars/`, it extracts the filename and adds the correct path
- This works as a fallback even if the database isn't updated

## What Was Changed

### Files Modified:
1. **`app/(authenticated)/layout.tsx`**
   - Added `pt-16 md:pt-0` to main element
   - Pushes content down 64px on mobile to clear fixed header

2. **`app/(authenticated)/rj-agent/page.tsx`**
   - Fixed avatar path from `/ajay-banga-avatar.jpg` to `/avatars/ajay-banga.jpg`

3. **`app/api/orgchart/route.ts`**
   - Added automatic URL fixing for all avatars
   - Ensures `/avatars/` prefix on all avatar URLs

### Files Created:
1. **`FIX_AVATAR_URLS.sql`**
   - SQL script to update all avatar URLs in database
   - Updates 16 leadership team member avatars

## Available Avatars

Located in `/public/avatars/`:
- ajay-banga.jpg
- anna-bjerde.jpg
- anshula-kant.jpg
- arup-banerji.jpg
- axel-van-trotsenburg.jpg
- christopher-stephens.jpg
- ernesto-silva.jpg
- ferid-belhaj.jpg
- hailegabriel-abegaz.jpg
- hartwig-schafer.jpg
- indermit-gill.jpg
- jaime-saavedra.jpg
- juergen-voegele.jpg
- junaid-kamal-ahmad.jpg
- makhtar-diop.jpg
- mamta-murthi.jpg

## Testing

1. **Test Mobile Header Spacing**:
   - Open any page on mobile (or use browser DevTools mobile view)
   - Check that h1 heading is visible below the top menu
   - Scroll to verify content is not cut off

2. **Test Avatar Images**:
   - Open `/rj-agent` page - should show Ajay Banga's photo
   - Open `/contacts` page - should show all leader photos
   - Open `/worldbank-orgchart` - should show org chart with photos

## Result
✅ Mobile h1 headings now visible  
✅ Avatar images loading correctly  
✅ Database can be permanently fixed with SQL script  
✅ API auto-fixes any remaining issues  






