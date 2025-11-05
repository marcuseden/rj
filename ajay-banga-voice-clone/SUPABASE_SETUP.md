# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to https://supabase.com
2. Sign up / Login
3. Click "New Project"
4. Fill in:
   - **Name:** CEO Alignment Checker (or your preferred name)
   - **Database Password:** (create a strong password)
   - **Region:** Choose closest to your users
5. Click "Create new project"

## 2. Get API Keys

Once your project is created:

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep secret!)

## 3. Create Database Tables

Go to **SQL Editor** and run this SQL:

```sql
-- Create users table extension (stores additional user data)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company TEXT,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create CEO profiles table (stores CEO speech data and configuration)
CREATE TABLE IF NOT EXISTS public.ceo_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  vision_statement TEXT,
  values TEXT[],
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create speeches table (stores uploaded CEO speeches for analysis)
CREATE TABLE IF NOT EXISTS public.speeches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ceo_profile_id UUID REFERENCES public.ceo_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  date DATE,
  word_count INTEGER,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create analysis history table (stores user content analysis results)
CREATE TABLE IF NOT EXISTS public.analysis_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ceo_profile_id UUID REFERENCES public.ceo_profiles(id),
  original_content TEXT NOT NULL,
  rewritten_content TEXT,
  alignment_score INTEGER,
  analysis_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ceo_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speeches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_history ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles (users can only see/edit their own profile)
CREATE POLICY "Users can view own profile" 
  ON public.user_profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.user_profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.user_profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Policies for ceo_profiles (all authenticated users can view)
CREATE POLICY "Anyone can view active CEO profiles" 
  ON public.ceo_profiles FOR SELECT 
  USING (is_active = true);

-- Policies for speeches (all authenticated users can view)
CREATE POLICY "Anyone can view speeches" 
  ON public.speeches FOR SELECT 
  USING (true);

-- Policies for analysis_history (users can only see their own history)
CREATE POLICY "Users can view own analysis" 
  ON public.analysis_history FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analysis" 
  ON public.analysis_history FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ceo_profiles_updated_at BEFORE UPDATE ON public.ceo_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 4. Enable Email Authentication

1. Go to **Authentication** → **Providers**
2. **Email** should be enabled by default
3. Configure email templates if desired under **Email Templates**

## 5. Insert Sample CEO Data (Ajay Banga)

```sql
-- Insert Ajay Banga CEO profile
INSERT INTO public.ceo_profiles (name, title, company, vision_statement, values, is_active)
VALUES (
  'Ajay Banga',
  'President',
  'World Bank Group',
  'Creating a world free of poverty on a livable planet through partnership, innovation, and measurable results.',
  ARRAY['Partnership', 'Accountability', 'Innovation', 'Equity', 'Sustainability', 'Results-Driven'],
  true
);

-- Note: Speeches will be auto-populated from your existing speech database
```

## 6. Update .env.local

Add these to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## 7. Test Authentication

1. Restart your dev server: `npm run dev`
2. Go to http://localhost:3001
3. Try signing up with a test email
4. Check Supabase dashboard → **Authentication** → **Users** to see the new user

## Database Structure

### Tables Created:

1. **user_profiles** - Extended user information beyond auth
2. **ceo_profiles** - CEO data, vision, values
3. **speeches** - Uploaded CEO speeches for analysis
4. **analysis_history** - User's content analysis results

### Security:

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Users can only access their own data
- ✅ CEO profiles and speeches are publicly readable (authenticated users)
- ✅ Service role key kept server-side only

## Next Steps

After setup:
1. ✅ Users can sign up/login
2. ✅ Upload CEO speeches for analysis
3. ✅ Test content alignment
4. ✅ View analysis history
5. ✅ Talk to CEO AI agent

Done! 🎉







