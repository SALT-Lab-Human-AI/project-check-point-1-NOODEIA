# ⚙️ Configuration Guide

Complete guide to configuring environment variables for Noodeia.

---

## 📄 Environment File Setup

### Step 1: Create Configuration File

Navigate to the frontend directory and create your environment file:

```bash
cd frontend
cp .env.local.example .env.local
```

### Step 2: Edit Configuration

Open `frontend/.env.local` in your text editor and add your credentials.

---

## 🔐 Required Environment Variables

### Authentication (Supabase)

```env
# Supabase - Authentication Only
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**NEXT_PUBLIC_SUPABASE_URL**
- **Purpose**: Your Supabase project URL
- **Format**: `https://xxxxx.supabase.co`
- **Where to find**:
  1. Go to https://supabase.com/dashboard
  2. Select your project
  3. Go to Settings → API
  4. Copy "Project URL"
- **Example**: `https://wwuhgudenirecbvlraya.supabase.co`

**NEXT_PUBLIC_SUPABASE_ANON_KEY**
- **Purpose**: Public API key for client-side authentication
- **Format**: Long JWT token starting with `eyJ...`
- **Where to find**:
  1. Same location as URL (Settings → API)
  2. Copy "anon public" key
- **Security**: Safe to expose in browser (public key)

---

### Database (Neo4j AuraDB)

```env
# Neo4j AuraDB - All Data Storage
NEXT_PUBLIC_NEO4J_URI=neo4j+s://xxxxx.databases.neo4j.io
NEXT_PUBLIC_NEO4J_USERNAME=neo4j
NEXT_PUBLIC_NEO4J_PASSWORD=your-password-here
```

**NEXT_PUBLIC_NEO4J_URI**
- **Purpose**: Connection string to your Neo4j database
- **Format**: `neo4j+s://xxxxx.databases.neo4j.io` (must include `neo4j+s://` prefix)
- **Where to find**:
  1. Go to https://console.neo4j.io/
  2. Find your database instance
  3. Copy "Connection URI"
- **Important**: Must use `neo4j+s://` (secure connection), not `neo4j://` or `bolt://`

**NEXT_PUBLIC_NEO4J_USERNAME**
- **Purpose**: Database username
- **Default value**: `neo4j`
- **Note**: Almost always `neo4j` unless you created a custom user

**NEXT_PUBLIC_NEO4J_PASSWORD**
- **Purpose**: Database password
- **Format**: Auto-generated alphanumeric string
- **Where to find**: Provided when you created the database instance
- **Security**: Treat as sensitive, never commit to git

---

### AI Model (Google Gemini)

```env
# Google Gemini AI - Required for AI features
GEMINI_API_KEY=your-gemini-api-key-here
```

**GEMINI_API_KEY**
- **Purpose**: Enables AI tutor responses via Google Gemini 2.5 Flash
- **Format**: Starts with `AIza...`
- **Where to find**:
  1. Go to https://aistudio.google.com/app/apikey
  2. Sign in with Google account
  3. Click "Create API key"
  4. Copy generated key
- **Security**: Server-side only (not exposed to browser)
- **Important**:
  - Do not include quotes around the key
  - No extra spaces before or after
  - Keep this secret

---

## ⚙️ Optional Environment Variables

### ACE Agent Configuration

```env
# ACE Agent Optional Settings
GEMINI_MODEL=gemini-2.5-flash
ACE_LLM_TEMPERATURE=0.2
ACE_CURATOR_USE_LLM=false
```

**GEMINI_MODEL**
- **Purpose**: Specify which Gemini model to use
- **Default**: `gemini-2.5-flash` (if not set)
- **Options**: `gemini-2.5-flash`, `gemini-2.5-pro`
- **Recommendation**: Use flash for speed, pro for complex reasoning

**ACE_LLM_TEMPERATURE**
- **Purpose**: Controls AI response randomness
- **Default**: `0.2` (focused, consistent)
- **Range**: 0.0 (deterministic) to 1.0 (creative)
- **Recommendation**: Keep at 0.2 for educational content

**ACE_CURATOR_USE_LLM**
- **Purpose**: Use LLM for memory curation vs heuristic rules
- **Default**: `false` (uses heuristic curation)
- **Options**: `true` or `false`
- **Recommendation**: Keep `false` for faster, more predictable behavior

---

### Real-time Messaging (Pusher)

```env
# Pusher - Real-time Messaging (Optional)
PUSHER_APP_ID=your-app-id
PUSHER_SECRET=your-secret
NEXT_PUBLIC_PUSHER_KEY=your-key
NEXT_PUBLIC_PUSHER_CLUSTER=us2
```

**PUSHER_APP_ID**
- **Purpose**: Identifies your Pusher application
- **Where to find**: Pusher dashboard → App Keys tab
- **Format**: Numeric ID

**PUSHER_SECRET**
- **Purpose**: Server-side secret for secure broadcasts
- **Where to find**: Pusher dashboard → App Keys tab
- **Security**: Server-side only, never expose to browser
- **⚠️ Common Mistake**: Do NOT swap this with PUSHER_KEY!

**NEXT_PUBLIC_PUSHER_KEY**
- **Purpose**: Client-side key for subscribing to channels
- **Where to find**: Pusher dashboard → App Keys tab
- **Security**: Safe to expose (public key)
- **⚠️ Common Mistake**: This is different from PUSHER_SECRET!

**NEXT_PUBLIC_PUSHER_CLUSTER**
- **Purpose**: Geographic cluster for Pusher service
- **Where to find**: Pusher dashboard → App Keys tab
- **Common values**: `us2`, `us3`, `eu`, `ap1`, `ap2`
- **Must match**: The cluster you selected when creating the app

**Disabling Pusher:**
If you don't want real-time features, simply:
- Leave all Pusher variables empty, OR
- Comment them out with `#` in `.env.local`
- Group chat will still work, but messages require page refresh to appear

---

### Web Search Tool (Tavily)

```env
# Tavily - Web Search Tool (Optional)
TAVILY_API_KEY=your-tavily-api-key
```

**TAVILY_API_KEY**
- **Purpose**: Enables ACE agent to search the web for current information
- **Where to find**: https://tavily.com/ → Sign up → Dashboard
- **When needed**: Only if you want AI to answer questions about current events
- **Without it**: AI can still answer based on training data, just not current news

---

## 🔒 Security Best Practices

### Environment Variable Security

**Variables Exposed to Browser** (NEXT_PUBLIC_ prefix):
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `NEXT_PUBLIC_NEO4J_URI`
- ✅ `NEXT_PUBLIC_NEO4J_USERNAME`
- ✅ `NEXT_PUBLIC_NEO4J_PASSWORD`
- ✅ `NEXT_PUBLIC_PUSHER_KEY`
- ✅ `NEXT_PUBLIC_PUSHER_CLUSTER`

**Server-Only Variables** (never exposed):
- 🔒 `GEMINI_API_KEY`
- 🔒 `PUSHER_SECRET`
- 🔒 `PUSHER_APP_ID`
- 🔒 `TAVILY_API_KEY`

### Git Security

**Never commit `.env.local` to git!**

The `.gitignore` file already includes:
```
.env*.local
.env
```

Verify:
```bash
git status
# Should NOT show .env.local as untracked
```

---

## 🎯 Example Complete Configuration

Here's what a properly configured `.env.local` looks like:

```env
# ============================================
# REQUIRED CONFIGURATION
# ============================================

# Supabase - Authentication Only
NEXT_PUBLIC_SUPABASE_URL=https://wwuhgudenirecbvlraya.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3dWhndWRlbmlyZWNidmxyYXlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1Mzk4MTMsImV4cCI6MjA3NTExNTgxM30.ZBgiIxuZ3qPzW6JDmAcFSyyMUuA0_zLV5k4iWN5DJrQ

# Neo4j AuraDB - All Data Storage
NEXT_PUBLIC_NEO4J_URI=neo4j+s://a1b2c3d4.databases.neo4j.io
NEXT_PUBLIC_NEO4J_USERNAME=neo4j
NEXT_PUBLIC_NEO4J_PASSWORD=your-generated-password-here

# Google Gemini AI - Required for AI features
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# ============================================
# OPTIONAL CONFIGURATION
# ============================================

# Pusher - Real-time Messaging (Optional)
# Leave empty to disable real-time features
PUSHER_APP_ID=2059509
PUSHER_SECRET=your-pusher-secret-here
NEXT_PUBLIC_PUSHER_KEY=your-pusher-key-here
NEXT_PUBLIC_PUSHER_CLUSTER=us2

# Tavily - Web Search (Optional)
# Leave empty to disable web search tool
TAVILY_API_KEY=your-tavily-key-here

# ACE Agent Tuning (Optional)
GEMINI_MODEL=gemini-2.5-flash
ACE_LLM_TEMPERATURE=0.2
ACE_CURATOR_USE_LLM=false
```

---

## ⚠️ Common Configuration Mistakes

### Mistake 1: Swapping Pusher Credentials

**❌ Wrong:**
```env
PUSHER_SECRET=be045a5b3ce8f55949bd        # This is actually the KEY!
NEXT_PUBLIC_PUSHER_KEY=6f7f7f4e68f7892e333d  # This is actually the SECRET!
```

**✅ Correct:**
```env
PUSHER_SECRET=6f7f7f4e68f7892e333d        # Secret is server-only
NEXT_PUBLIC_PUSHER_KEY=be045a5b3ce8f55949bd  # Key is public
```

**How to tell them apart:**
- Pusher dashboard shows them clearly labeled
- Secret is usually longer and more random-looking
- Key often has readable pattern

**Error if wrong**: `400 Bad Request - App key not in this cluster`

### Mistake 2: Wrong Neo4j URI Format

**❌ Wrong:**
```env
NEXT_PUBLIC_NEO4J_URI=bolt://xxxxx.databases.neo4j.io
NEXT_PUBLIC_NEO4J_URI=neo4j://xxxxx.databases.neo4j.io
NEXT_PUBLIC_NEO4J_URI=https://xxxxx.databases.neo4j.io
```

**✅ Correct:**
```env
NEXT_PUBLIC_NEO4J_URI=neo4j+s://xxxxx.databases.neo4j.io
```

**Must include:**
- `neo4j+s://` prefix (s = secure connection)
- Full hostname ending in `.databases.neo4j.io`

### Mistake 3: Extra Quotes or Spaces

**❌ Wrong:**
```env
GEMINI_API_KEY="AIzaSy..."     # Don't include quotes
GEMINI_API_KEY= AIzaSy...      # Don't include space after =
```

**✅ Correct:**
```env
GEMINI_API_KEY=AIzaSy...
```

### Mistake 4: Missing NEXT_PUBLIC_ Prefix

**❌ Wrong:**
```env
NEO4J_URI=neo4j+s://...        # Missing NEXT_PUBLIC_ prefix
SUPABASE_URL=https://...       # Missing NEXT_PUBLIC_ prefix
```

**✅ Correct:**
```env
NEXT_PUBLIC_NEO4J_URI=neo4j+s://...
NEXT_PUBLIC_SUPABASE_URL=https://...
```

**Why it matters**: Variables without `NEXT_PUBLIC_` prefix are only available on the server, not in the browser.

---

## 🧪 Verify Configuration

After setting up `.env.local`, verify your configuration:

### Test Neo4j Connection

```bash
npm run setup-neo4j
```

**Expected output:**
```
🚀 Starting Neo4j AuraDB schema setup...
✅ Connection verified
✅ Constraints created
✅ Indexes created
✅ Neo4j schema setup complete!
```

**If it fails**: Check your Neo4j credentials in `.env.local`

### Test Supabase Connection

Start the dev server and try to sign up:
```bash
npm run dev
# Open http://localhost:3000/login
# Try creating an account
```

**If it fails**: Check Supabase credentials and network

### Test Gemini API

The AI will fail to respond if Gemini API key is wrong:
```bash
npm run dev
# Open http://localhost:3000/ai
# Send a message
```

**Expected**: AI responds within 5-10 seconds

**If it fails**:
- Check GEMINI_API_KEY has no extra spaces or quotes
- Verify key is valid at https://aistudio.google.com/app/apikey
- Check server console for error messages

---

## 🔄 Restart After Changes

**Important**: After editing `.env.local`, you MUST restart the development server:

```bash
# Stop server (Ctrl+C)
npm run dev  # Start again
```

Environment variables are loaded only on server start, not hot-reloaded.

---

## 📚 Next Steps

Once configuration is complete:
1. **Database Setup**: See [04_DATABASE_SETUP.md](./04_DATABASE_SETUP.md)
2. **Python Setup**: See [05_PYTHON_ACE_SETUP.md](./05_PYTHON_ACE_SETUP.md)
3. **Start Development**: See [06_LOCAL_DEVELOPMENT.md](./06_LOCAL_DEVELOPMENT.md)

---

## ❓ Need Help?

- **Can't find credentials?**: Review [01_PREREQUISITES.md](./01_PREREQUISITES.md)
- **Configuration errors?**: See [../TROUBLESHOOTING.md](../TROUBLESHOOTING.md)
- **Environment not loading?**: Make sure file is named exactly `.env.local` (note the dot at start)
