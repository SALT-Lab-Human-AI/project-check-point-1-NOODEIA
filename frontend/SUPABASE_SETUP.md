# Supabase + GitHub Pages Setup Guide

## Part 1: Set Up Supabase Database

### 1. Create Supabase Account
1. Go to https://supabase.com
2. Sign up with GitHub (recommended) or email
3. Click "New project"
4. Fill in:
   - Project name: `noodeia`
   - Database password: [Save this password!]
   - Region: Select closest to you
   - Plan: Free tier

### 2. Get Your API Keys
1. Wait for project to initialize (2-3 minutes)
2. Go to **Settings** → **API**
3. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGc...` (long string)

### 3. Create Database Tables
1. Go to **SQL Editor** in Supabase dashboard
2. Click "New Query"
3. Copy and paste this SQL:

```sql
-- Create users table
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create conversations table
CREATE TABLE conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create messages table
CREATE TABLE messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for performance
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Allow public access (for demo - in production use proper auth)
CREATE POLICY "Public access" ON users FOR ALL USING (true);
CREATE POLICY "Public access" ON conversations FOR ALL USING (true);
CREATE POLICY "Public access" ON messages FOR ALL USING (true);
```

4. Click **Run** to execute

## Part 2: Configure Your App

### 1. Update Environment Variables
Edit `.env.local` and replace with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
```

### 2. Test Locally
```bash
npm run dev
```
- Open http://localhost:3000
- Send a test message
- Check Supabase dashboard → Table Editor to see your data

## Part 3: Deploy to GitHub Pages

### 1. Push to GitHub
```bash
git add .
git commit -m "Add Supabase integration"
git push origin main
```

### 2. Deploy to GitHub Pages
```bash
npm run deploy
```

This will:
- Build the static site
- Create `gh-pages` branch
- Deploy to GitHub Pages

### 3. Enable GitHub Pages
1. Go to your GitHub repository
2. Settings → Pages
3. Source: Deploy from branch
4. Branch: `gh-pages` / `root`
5. Save

### 4. Access Your Site
Your site will be available at:
```
https://[your-username].github.io/project-check-point-1-noodiea
```

## Troubleshooting

### "Supabase credentials not found"
- Make sure `.env.local` has correct values
- No quotes needed around the values
- Restart dev server after changing env vars

### Tables don't exist
- Run the SQL script in Supabase SQL Editor
- Check for any error messages
- Make sure all three tables were created

### Data not persisting
- Check browser console for errors
- Verify Supabase URL and key are correct
- Check Table Editor in Supabase dashboard

### GitHub Pages 404
- Wait 10 minutes for initial deployment
- Check `gh-pages` branch exists
- Verify GitHub Pages is enabled in settings

## Features
✅ Each user gets a unique ID (stored in browser)
✅ All conversations saved to Supabase cloud
✅ Messages persist across page refreshes
✅ Works as static site on GitHub Pages
✅ Free hosting + free database

## Limitations
- 500MB database storage (free tier)
- 2GB bandwidth/month (free tier)
- No server-side rendering
- No real AI responses (just demo messages)