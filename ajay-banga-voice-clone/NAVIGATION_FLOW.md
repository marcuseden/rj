# 🗺️ Application Navigation Flow

## Overview

This document explains the complete navigation flow and how authentication protection works.

---

## 🏠 Page Structure

### Public Pages (No Login Required)

| URL | Page | Purpose |
|-----|------|---------|
| `/` | Landing Page | Main entry point, shows features |
| `/login` | Login/Signup | Authentication page |

### Protected Pages (Login Required)

| URL | Page | Purpose |
|-----|------|---------|
| `/dashboard` | Main Dashboard | Voice call with CEO AI |
| `/rj-agent` | AI Chat Agent | Text chat with CEO AI |
| `/rj-faq` | Speech Browser | Browse CEO speeches |
| `/rj-writing-assistant` | Writing Assistant | Check content alignment |
| `/vision` | Vision Page | CEO vision and values |
| `/worldbank-search` | World Bank Search | Search strategy documents |

---

## 🔐 How Protection Works

### 1. Landing Page (/)

**When you visit http://localhost:3001:**

```
1. You see the landing page with:
   ✅ CEO profile (Ajay Banga)
   ✅ Feature cards (Voice Call, Test Alignment, etc.)
   ✅ "Sign In" button in header
   ✅ "Get Started" button

2. If you click any feature card or "Go to Dashboard":
   ❌ You're NOT logged in
   → Middleware checks authentication
   → Redirects to /login
```

### 2. Login Flow

**When you click "Sign In" or "Get Started":**

```
1. Redirected to /login
2. You can:
   - Sign In (if you have account)
   - Sign Up (create new account)
3. After successful login:
   → Redirected to /dashboard
```

### 3. Protected Routes

**When you try to access /dashboard without login:**

```
1. Browser requests http://localhost:3001/dashboard
2. Middleware intercepts the request
3. Checks: Is user authenticated?
   ❌ No → Redirect to /login?redirect=/dashboard
   ✅ Yes → Allow access to /dashboard
```

### 4. Staying Logged In

**Session Management:**

```
✅ Sessions stored in secure HTTP-only cookies
✅ Middleware automatically refreshes expired tokens
✅ Session persists across page refreshes
✅ Session expires after ~1 hour of inactivity (configurable)
```

---

## 🎯 User Journey Examples

### New User Journey

```
1. Visit http://localhost:3001
   → Landing page shown

2. Click "Get Started" or "Sign In"
   → Redirected to /login

3. Click "Don't have an account? Sign Up"
   → Sign up form shown

4. Enter email + password (min 6 chars)
   → Account created
   → (Optional) Email confirmation required

5. Sign in with credentials
   → Redirected to /dashboard
   → ✅ Full access to all features

6. Click features in header/cards
   → Access all protected pages
```

### Returning User Journey

```
1. Visit http://localhost:3001
   → Landing page shown

2. Click "Sign In"
   → Redirected to /login

3. Enter credentials
   → Signed in
   → Redirected to /dashboard

4. Navigate between features
   → ✅ All protected routes accessible
```

### Logged Out User Journey

```
1. Visit http://localhost:3001/dashboard directly
   → Middleware intercepts
   → ❌ Not authenticated
   → Redirected to /login?redirect=/dashboard

2. After login:
   → Redirected back to /dashboard
   → ✅ Access granted
```

---

## 🔍 Testing Protection

### Test 1: Try Accessing Dashboard Without Login

**Steps:**
1. Open browser in incognito/private mode
2. Navigate to: http://localhost:3001/dashboard
3. **Expected:** Redirected to /login
4. **If not working:** Restart server (`npm run dev`)

### Test 2: Login and Access Dashboard

**Steps:**
1. Go to: http://localhost:3001/login
2. Sign in with credentials
3. Should redirect to: /dashboard
4. **Expected:** Dashboard loads successfully
5. Refresh page → Should stay logged in

### Test 3: Try Other Protected Routes

**Steps:**
1. Without login, try each URL:
   - http://localhost:3001/rj-agent
   - http://localhost:3001/rj-faq
   - http://localhost:3001/rj-writing-assistant
2. **Expected:** All redirect to /login

### Test 4: Session Persistence

**Steps:**
1. Sign in
2. Close browser tab
3. Open new tab
4. Go to: http://localhost:3001/dashboard
5. **Expected:** Still logged in (if session not expired)

---

## 🛠️ Troubleshooting

### Issue: Can Access /dashboard Without Login

**Possible Causes:**
1. Middleware not loaded (server needs restart)
2. Environment variables missing
3. Supabase configuration incomplete

**Fix:**
```bash
# 1. Kill and restart server
lsof -ti:3001 | xargs kill -9
npm run dev

# 2. Verify .env.local exists
cat .env.local | grep NEXT_PUBLIC_SUPABASE

# 3. Check middleware.ts exists in root
ls -la middleware.ts

# 4. Clear browser cookies
# Browser DevTools → Application → Cookies → Clear All

# 5. Try in incognito mode
```

### Issue: Infinite Redirect Loop

**Cause:** Session cookies not being set properly

**Fix:**
```bash
# 1. Clear all browser cookies
# 2. Restart server
npm run dev

# 3. Try signing up with new account
```

### Issue: Can't Stay Logged In

**Cause:** Session expiring too quickly or cookies not persisting

**Fix:**
1. Check browser settings allow cookies
2. Verify Supabase project is active
3. Check Supabase Dashboard → Authentication → Settings
4. Increase JWT expiry time if needed

---

## 📋 Navigation Components

### Header (All Pages)

**When Logged Out:**
```
[Logo] CEO Alignment Checker        [Sign In Button]
```

**When Logged In:**
```
[Logo] CEO Alignment Checker        [Go to Dashboard Button]
```

### Landing Page Feature Cards

All cards redirect through authentication:

1. **Voice Call** → `/dashboard` (protected)
2. **Test Alignment** → `/rj-writing-assistant` (protected)
3. **Browse Speeches** → `/rj-faq` (protected)
4. **AI Chat Agent** → `/rj-agent` (protected)

---

## 🎯 Best Practices

### For Users

1. **Always start at** http://localhost:3001
2. **Sign in** through the login page
3. **Don't bookmark** /dashboard directly (will redirect if logged out)
4. **Use "Sign Out"** button when done (not yet implemented)

### For Developers

1. **Test in incognito** to verify protection works
2. **Restart server** after middleware changes
3. **Check browser console** for auth errors
4. **Verify environment variables** are set correctly

---

## 🔄 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│           User visits http://localhost:3001         │
│                                                     │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
            ┌────────────────┐
            │  Landing Page  │
            │      (/)       │
            └────────┬───────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
   ┌──────────┐          ┌──────────────┐
   │ Sign In  │          │ Try Feature  │
   │  Button  │          │    Card      │
   └─────┬────┘          └──────┬───────┘
         │                      │
         │                      ▼
         │            ┌──────────────────┐
         │            │   Middleware     │
         │            │  Check Auth?     │
         │            └─────┬────────────┘
         │                  │
         │            ┌─────┴─────┐
         │            │           │
         │           NO          YES
         │            │           │
         └────────────┤           │
                      │           │
                      ▼           ▼
              ┌──────────┐   ┌──────────┐
              │  /login  │   │Protected │
              │          │   │  Page    │
              └────┬─────┘   └──────────┘
                   │
                   ▼
          ┌────────────────┐
          │  Sign In Form  │
          └────────┬───────┘
                   │
                   ▼
          ┌────────────────┐
          │  Authenticate  │
          └────────┬───────┘
                   │
            ┌──────┴──────┐
            │             │
           FAIL         SUCCESS
            │             │
            ▼             ▼
      ┌──────────┐   ┌──────────┐
      │  Error   │   │Redirect  │
      │ Message  │   │Dashboard │
      └──────────┘   └──────────┘
```

---

## 📞 Quick Reference

### URLs

| Purpose | URL | Auth Required |
|---------|-----|---------------|
| Landing | http://localhost:3001 | ❌ No |
| Login | http://localhost:3001/login | ❌ No |
| Dashboard | http://localhost:3001/dashboard | ✅ Yes |
| All Features | /rj-*, /vision, /worldbank-search | ✅ Yes |

### Environment Variables Required

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### Key Files

- `middleware.ts` - Route protection
- `app/page.tsx` - Landing page (/)
- `app/login/page.tsx` - Authentication
- `app/dashboard/page.tsx` - Main app (protected)

---

**The navigation flow is secure and properly protected! 🔒**

Start at the landing page, sign in, and access all features!







