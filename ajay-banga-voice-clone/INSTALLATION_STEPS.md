# 🎯 Installation Steps - CEO Alignment Checker

Follow these steps in order to set up your secure application.

---

## ✅ Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- Basic terminal knowledge

---

## 📝 Step-by-Step Installation

### Step 1: Clone & Install Dependencies

```bash
# Navigate to project directory
cd "ajay-banga-voice-clone"

# Install dependencies
npm install

# Expected output: Dependencies installed successfully
```

**Status:** ⏳ Waiting for dependencies...

---

### Step 2: Create Supabase Project

1. **Go to** https://supabase.com/dashboard
2. **Click** "New Project"
3. **Fill in:**
   - Project Name: `ceo-alignment-checker`
   - Database Password: (save this!)
   - Region: Choose closest to you
4. **Wait** 2-3 minutes for project to initialize

**Status:** ⏳ Creating Supabase project...

---

### Step 3: Get Supabase Credentials

1. **In Supabase Dashboard:**
   - Go to **Settings** → **API**
   - Copy these values:
     - `Project URL`
     - `anon public key`
     - `service_role key`

**Status:** 📋 Copy credentials...

---

### Step 4: Create Environment File

Create `.env.local` in project root:

```bash
# Method 1: Using terminal
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=paste_your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=paste_your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=paste_your_service_role_key_here
EOF

# Method 2: Create manually
# Create file .env.local and paste the content above
```

**Replace** the placeholder values with your actual credentials.

**Status:** ✅ Environment variables set

---

### Step 5: Configure Supabase URLs

1. **In Supabase Dashboard:**
   - Go to **Authentication** → **URL Configuration**
   
2. **Add these URLs:**
   ```
   Site URL: http://localhost:3001
   
   Redirect URLs (click "Add URL" for each):
   - http://localhost:3001/**
   - http://localhost:3001/dashboard
   - http://localhost:3001/auth/callback
   ```

3. **Save changes**

**Status:** ✅ URLs configured

---

### Step 6: Run Database Migration

1. **In Supabase Dashboard:**
   - Go to **SQL Editor**
   - Click **New Query**

2. **Copy & Paste** the entire contents of:
   ```
   supabase/migrations/00_complete_schema.sql
   ```

3. **Click "Run"** (bottom right)

4. **Verify Success:**
   - Should see "Success. No rows returned"
   - Check tables exist: Run `SELECT tablename FROM pg_tables WHERE schemaname = 'public';`
   - Should see: user_profiles, ceo_profiles, speeches, worldbank_documents, analysis_history

**Status:** ✅ Database schema created

---

### Step 7: Verify RLS is Enabled

**In Supabase SQL Editor, run:**

```sql
-- Should show 't' (true) for all tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Expected Output:**
```
analysis_history        | t
ceo_profiles           | t
speeches               | t
user_profiles          | t
worldbank_documents    | t
```

**Status:** ✅ Row Level Security verified

---

### Step 8: Start the Application

```bash
npm run dev
```

**Expected Output:**
```
▲ Next.js 15.1.5
- Local:        http://localhost:3001
- Ready in 2.3s
```

**Status:** ✅ Server running

---

### Step 9: Test the Application

1. **Open Browser:**
   - Navigate to http://localhost:3001

2. **Sign Up:**
   - Click "Sign Up"
   - Enter email and password (min 6 characters)
   - Submit

3. **Check Email:**
   - If email confirmation is enabled, check your email
   - Click confirmation link
   - (For development, you can disable this in Supabase Dashboard)

4. **Sign In:**
   - Enter your credentials
   - Should redirect to `/dashboard`

5. **Test Protected Routes:**
   - While logged in, visit:
     - http://localhost:3001/dashboard ✅ Should work
     - http://localhost:3001/rj-agent ✅ Should work
   - Log out and try again ❌ Should redirect to login

**Status:** ✅ Application working!

---

## 🎉 Installation Complete!

### What You Now Have:

✅ Secure Next.js application
✅ Supabase database with RLS
✅ Authentication system
✅ Protected routes
✅ Session management
✅ CORS configured
✅ Security headers
✅ Error handling

---

## 🔍 Verification Checklist

Run through this checklist to ensure everything is working:

- [ ] Environment variables set (`.env.local` exists)
- [ ] Supabase URLs configured (Authentication → URL Configuration)
- [ ] Database migration completed (tables exist)
- [ ] RLS enabled (all tables show 't')
- [ ] Application starts (`npm run dev` works)
- [ ] Can sign up (create account)
- [ ] Can sign in (login works)
- [ ] Dashboard accessible when logged in
- [ ] Redirects to login when logged out
- [ ] No console errors in browser

---

## 🐛 Troubleshooting

### Issue: npm install fails

**Fix:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Issue: "Failed to fetch" when logging in

**Causes & Fixes:**
1. **Wrong Supabase URL:**
   - Check `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL`
   
2. **URLs not configured:**
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add `http://localhost:3001/**`

3. **Supabase project inactive:**
   - Check Supabase Dashboard
   - Verify project is running

### Issue: Can't access protected routes

**Fix:**
```bash
# 1. Clear browser cookies
# 2. Restart dev server
Ctrl+C (to stop)
npm run dev (to start)
```

### Issue: Database queries return no rows

**Possible causes:**
1. Not authenticated (sign in first)
2. RLS policies not applied (re-run migration)
3. Wrong user context (check `SELECT auth.uid()`)

**Fix:**
```sql
-- In Supabase SQL Editor
-- Should return your user ID (not null)
SELECT auth.uid();

-- If null, you're not authenticated
-- Sign in through the app first
```

---

## 📚 Next Steps

1. **Read the docs:**
   - `QUICK_REFERENCE.md` - Quick lookup
   - `SETUP_COMPLETE.md` - Detailed guide
   - `SECURITY_BEST_PRACTICES.md` - Security details

2. **Customize the app:**
   - Add your own features
   - Modify the UI
   - Add more protected routes

3. **Prepare for production:**
   - Review `SETUP_COMPLETE.md` → Deployment Checklist
   - Enable email confirmation
   - Set up custom domain
   - Configure production URLs

---

## 🆘 Still Having Issues?

### Check these files:
1. Browser Console (F12) - Check for JavaScript errors
2. Terminal - Check for server errors
3. Supabase Logs - Authentication → Logs

### Common solutions:
1. Restart dev server
2. Clear browser cache
3. Re-run database migration
4. Verify environment variables
5. Check Supabase project is active

---

## 📞 Support Resources

- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Project Docs:** See documentation files in project root

---

**Congratulations! Your secure application is ready to use! 🎉**

Start building amazing features with confidence! 🚀







