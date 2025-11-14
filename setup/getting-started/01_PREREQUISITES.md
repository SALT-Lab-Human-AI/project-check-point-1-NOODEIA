# 📋 Prerequisites

Before setting up Noodeia, ensure you have the following system requirements and accounts ready.

---

## 💻 System Requirements

### Required Software

**Node.js** (Version 18 or higher, **20 recommended**)
- Download from: https://nodejs.org/
- Verify installation:
  ```bash
  node --version  # Should show v18.0.0 or higher
  npm --version   # Should show 9.0.0 or higher
  ```

**Python** (Version 3.10 or higher)
- Required for ACE (Agentic Context Engineering) AI agent
- Download from: https://www.python.org/downloads/
- Verify installation:
  ```bash
  python3 --version  # Should show Python 3.10.0 or higher
  pip3 --version     # Should be available
  ```

**Git**
- Required for cloning the repository
- Download from: https://git-scm.com/
- Verify installation:
  ```bash
  git --version  # Should show git version 2.0.0 or higher
  ```

### Optional Software

**Code Editor** (Recommended)
- Visual Studio Code: https://code.visualstudio.com/
- Or any editor of your choice

---

## 🔑 Required Accounts (All Free Tier Available)

### 1. Supabase (Authentication)

**Purpose**: Handles user authentication (sign up, login, JWT tokens)

**Setup:**
1. Go to https://supabase.com/
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email
4. Create a new project:
   - Choose a project name (e.g., "noodeia-auth")
   - Set a database password (you won't need this)
   - Select a region (choose closest to your users)
   - Click "Create new project"
5. Wait 2-3 minutes for project to provision

**What You'll Need:**
- Project URL (format: `https://xxxxx.supabase.co`)
- Anon public key (long JWT token starting with `eyJ...`)

**Where to Find Credentials:**
- Go to Project Settings → API
- Copy "Project URL" and "anon public" key

**Note**: We only use Supabase for authentication. No database tables are created in Supabase.

---

### 2. Neo4j AuraDB (Database)

**Purpose**: Stores ALL application data in graph database format

**Setup:**
1. Go to https://console.neo4j.io/
2. Sign up (email or Google sign-in)
3. Click "Create database" → "AuraDB Free"
4. Configure database:
   - Instance name: `noodeia-db` (or your choice)
   - Region: Select closest to your users
   - Click "Create"
5. **IMPORTANT**: Download credentials immediately
   - Username: `neo4j` (default)
   - Password: Auto-generated, shown once
   - Connection URI: `neo4j+s://xxxxx.databases.neo4j.io`
6. Save credentials securely (you'll need them for configuration)

**What You'll Need:**
- Connection URI (starts with `neo4j+s://`)
- Username (default: `neo4j`)
- Password (generated during setup)

**Free Tier Limits:**
- 50,000 nodes
- 175,000 relationships
- 200MB storage
- Should be sufficient for development and small deployments

---

### 3. Google AI Studio (Gemini API)

**Purpose**: Powers the AI tutor responses using Google Gemini 2.5 Flash

**Setup:**
1. Go to https://aistudio.google.com/
2. Sign in with your Google account
3. Click "Get API key" in the sidebar
4. Click "Create API key"
5. Select a Google Cloud project (or create new one)
6. Copy the generated API key (starts with `AIza...`)

**What You'll Need:**
- API Key (format: `AIzaSy...`)

**Free Tier Limits:**
- 15 requests per minute
- 1,500 requests per day
- Should be sufficient for development

**Important Notes:**
- Keep your API key secure
- Don't commit it to git
- Rate limits apply on free tier

---

### 4. Render (Deployment Platform)

**Purpose**: Hosts the production application

**Setup:**
1. Go to https://render.com/
2. Sign up with GitHub (recommended)
3. No configuration needed yet (done during deployment)

**Free Tier:**
- 512MB RAM
- Auto-sleep after 15 minutes of inactivity
- Sufficient for testing and low-traffic deployments

**Paid Plans** (Optional):
- Starter: $7/month (no sleep, faster)
- Standard: $25/month (2GB RAM, priority builds)

---

## ⚠️ Optional Accounts

### Pusher (Real-time Messaging)

**Purpose**: Enables real-time message updates in group chat

**Setup:**
1. Go to https://dashboard.pusher.com/
2. Sign up (email or GitHub)
3. Create new app:
   - App name: `noodeia-realtime`
   - Cluster: Choose closest (e.g., `us2`)
   - Create app
4. Go to "App Keys" tab
5. Copy credentials

**What You'll Need:**
- App ID
- Key
- Secret
- Cluster

**Can be disabled**: The app works without Pusher, but group chat messages won't update in real-time (require page refresh).

---

### Tavily (Web Search Tool)

**Purpose**: Enables the ACE agent's web research tool for answering current events questions

**Setup:**
1. Go to https://tavily.com/
2. Sign up for free trial
3. Get API key from dashboard

**What You'll Need:**
- API Key

**Can be disabled**: The app works without Tavily, but the AI agent won't be able to search the web for current information.

---

## ✅ Prerequisites Checklist

Before proceeding to installation, verify you have:

- [ ] Node.js 18+ installed and verified
- [ ] Python 3.10+ installed and verified
- [ ] Git installed and verified
- [ ] Supabase account created
- [ ] Supabase project URL and anon key saved
- [ ] Neo4j AuraDB instance created
- [ ] Neo4j connection URI, username, password saved
- [ ] Google AI Studio API key created and saved
- [ ] Render account created (for deployment)
- [ ] (Optional) Pusher credentials if using real-time features
- [ ] (Optional) Tavily API key if using web search

---

## 📚 Next Steps

Once you have all prerequisites ready:
1. **Installation**: See [02_INSTALLATION.md](./02_INSTALLATION.md)
2. **Configuration**: See [03_CONFIGURATION.md](./03_CONFIGURATION.md)
3. **Quick Start**: See [../QUICKSTART.md](../QUICKSTART.md)

---

## ❓ Need Help?

- **Supabase Issues**: https://supabase.com/docs
- **Neo4j Issues**: https://neo4j.com/docs/aura/
- **Google AI Studio**: https://ai.google.dev/docs
- **General Setup Issues**: See [../TROUBLESHOOTING.md](../TROUBLESHOOTING.md)
