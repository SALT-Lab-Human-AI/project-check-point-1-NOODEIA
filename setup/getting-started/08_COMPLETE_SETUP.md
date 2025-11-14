# 📚 Complete Setup Guide

All-in-one comprehensive guide for setting up Noodeia from start to finish.

This guide consolidates all setup steps into a single document for easy reference.

---

## 📑 Table of Contents

1. [Prerequisites](#-prerequisites)
2. [Installation](#-installation)
3. [Configuration](#-configuration)
4. [Database Setup](#-database-setup)
5. [Python ACE Setup](#-python-ace-setup)
6. [Local Development](#-local-development)
7. [Deployment](#-deployment)
8. [Verification](#-verification)

---

## 📋 Prerequisites

### System Requirements

**Install the following software:**

**Node.js** (Version 18+, **20 recommended**):
- Download: https://nodejs.org/
- Verify: `node --version` (should show v18.0.0+)

**Python** (Version 3.10+):
- Download: https://www.python.org/downloads/
- Verify: `python3 --version` (should show 3.10.0+)

**Git**:
- Download: https://git-scm.com/
- Verify: `git --version`

### Create Required Accounts

All services have free tiers:

**1. Supabase** (Authentication):
- Sign up: https://supabase.com/
- Create new project
- Get: Project URL and anon key (Settings → API)

**2. Neo4j AuraDB** (Database):
- Sign up: https://console.neo4j.io/
- Create AuraDB Free instance
- Save: Connection URI, username (neo4j), password

**3. Google AI Studio** (AI Model):
- Sign up: https://aistudio.google.com/
- Create API key: https://aistudio.google.com/app/apikey
- Save: API key (starts with AIza...)

**4. Render** (Deployment):
- Sign up: https://render.com/
- Connect GitHub account
- No configuration needed yet

### Optional Accounts

**Pusher** (Real-time messaging):
- Sign up: https://dashboard.pusher.com/
- Create app, get: App ID, Secret, Key, Cluster

**Tavily** (Web search):
- Sign up: https://tavily.com/
- Get: API key from dashboard

---

## 📦 Installation

### Clone Repository

```bash
git clone https://github.com/SALT-Lab-Human-AI/project-check-point-1-NOODEIA.git
cd project-check-point-1-NOODEIA/frontend
```

### Install Node.js Dependencies

**Important**: Must use `--legacy-peer-deps` for React 19:

```bash
npm install --legacy-peer-deps
```

**Time**: 2-5 minutes

### Install Python Dependencies

```bash
pip3 install -r requirements.txt
```

**Time**: 3-10 minutes

**Installs:**
- langgraph (agent framework)
- langchain + langchain-google-genai (LLM framework)
- neo4j (database driver)
- tavily-python (web search)
- gtts (text-to-speech)
- Other dependencies

### Verify Installation

```bash
# Check Node.js
node --version        # v18.0.0+
npm list next         # Should show next@15.2.4

# Check Python
python3 --version     # 3.10.0+
pip3 show langgraph   # Should show version info
```

---

## ⚙️ Configuration

### Create Environment File

```bash
cd frontend
cp .env.local.example .env.local
```

### Edit Configuration

Open `.env.local` in your text editor and add credentials:

```env
# ============================================
# REQUIRED CONFIGURATION
# ============================================

# Supabase - Authentication
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Neo4j AuraDB - Database
NEXT_PUBLIC_NEO4J_URI=neo4j+s://xxxxx.databases.neo4j.io
NEXT_PUBLIC_NEO4J_USERNAME=neo4j
NEXT_PUBLIC_NEO4J_PASSWORD=your-password-here

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key-here

# ============================================
# OPTIONAL CONFIGURATION
# ============================================

# Pusher - Real-time (Optional)
PUSHER_APP_ID=your-app-id
PUSHER_SECRET=your-secret
NEXT_PUBLIC_PUSHER_KEY=your-key
NEXT_PUBLIC_PUSHER_CLUSTER=us2

# Tavily - Web Search (Optional)
TAVILY_API_KEY=your-tavily-key

# ACE Agent Tuning (Optional)
GEMINI_MODEL=gemini-2.5-flash
ACE_LLM_TEMPERATURE=0.2
ACE_CURATOR_USE_LLM=false
```

**Important notes:**
- No quotes around values
- No spaces after `=`
- Neo4j URI must start with `neo4j+s://`
- Don't swap Pusher secret and key!

---

## 🗄️ Database Setup

### Initialize All Schemas

Run all setup scripts:

```bash
npm run setup-neo4j       # Core schema (User, Session, Chat)
npm run setup-groupchat   # Group chat (GroupChat, Message)
npm run setup-markdown    # Notes (MarkdownNote, MindMap)
npm run setup-quiz        # Quiz (QuizSession, QuizProgress)
```

**Or run all at once:**
```bash
npm run setup-neo4j && npm run setup-groupchat && npm run setup-markdown && npm run setup-quiz
```

**Expected output for each:**
```
🚀 Starting ... schema setup...
✅ Connection verified
✅ Constraints created
✅ Indexes created
✅ ... schema setup complete!
```

### Verify Database

**Test connection:**
```bash
npm run setup-neo4j
# Should show "Connection verified"
```

**Check in Neo4j Browser:**
1. Open https://console.neo4j.io/
2. Select your database
3. Click "Open"
4. Run:
   ```cypher
   SHOW CONSTRAINTS
   # Should show 8+ constraints

   SHOW INDEXES
   # Should show 15+ indexes
   ```

---

## 🐍 Python ACE Setup

### Configure Environment

Export Gemini API key:

```bash
export GEMINI_API_KEY="your-key"
```

**Or load from .env.local:**
```bash
cd frontend
source <(grep -v '^#' .env.local | sed 's/^/export /')
```

### Test ACE Agent

```bash
cd frontend/scripts
python3 run_ace_agent.py <<'EOF'
{"messages":[{"role":"user","content":"Help me multiply 12 by 5"}]}
EOF
```

**Expected**: JSON response with answer and ACE metadata

**Success indicators:**
- Agent responds with educational answer
- Output includes `"ace_online_learning": true`
- Shows `"ace_delta"` with memory updates
- No Python errors

### Inspect Memory (Optional)

```bash
# After using the app, inspect learned memory
python3 analyze_ace_memory.py --learner <user-id>
```

To get user ID, check Neo4j:
```cypher
MATCH (u:User) RETURN u.id, u.email LIMIT 5
```

---

## 💻 Local Development

### Start Development Server

```bash
cd frontend
npm run dev
```

**Server starts at**: http://localhost:3000

### Test Features

**1. Authentication:**
- Go to http://localhost:3000/login
- Sign up with test account
- Should redirect to /ai

**2. AI Tutor:**
- Send message: "Help me with fractions"
- Should get response in 5-15 seconds
- XP animation appears
- Conversation saves to Neo4j

**3. Gamification:**
- Check XP bar in sidebar
- Send messages to earn XP
- Level up at 25 XP (Level 2)

**4. Quiz:**
- Go to http://localhost:3000/quiz
- Take quiz (10 questions)
- Get reward based on score
- Legendary node for 100%

**5. Vocabulary Games:**
- Go to http://localhost:3000/games
- Try Word Match, Spelling Bee, Memory Cards, Word Builder
- Earn XP for correct answers

**6. Todo/Kanban:**
- Go to http://localhost:3000/todo
- Create task
- Drag to "Done"
- Get XP reward

**7. Group Chat:**
- Go to http://localhost:3000/groupchat
- Create group with access key
- Send messages
- Try @ai mention

**8. Leaderboard:**
- Go to http://localhost:3000/leaderboard
- View XP and accuracy rankings
- Check different timeframes

### Run Tests

```bash
cd unitTests
./run_all_tests.sh
```

**Should show**: All 7 test suites pass

---

## 🚀 Deployment to Render

### Prepare for Deployment

```bash
# Push code to GitHub
git add .
git commit -m "Ready for production"
git push origin main
```

### Deploy

**Option 1: Dashboard** (Recommended):

1. Go to https://render.com/
2. New + → Web Service
3. Connect your GitHub repository
4. Configure:
   - Build: `cd frontend && npm install --legacy-peer-deps && npm run build`
   - Start: `cd frontend && npm start`
5. Add ALL environment variables from `.env.local`
6. Create Web Service
7. Wait 5-10 minutes

**Option 2: render.yaml** (Auto-detected):

Render automatically detects `render.yaml` at project root and uses those settings.

### Verify Deployment

1. Visit your Render URL: `https://your-app.onrender.com`
2. Test authentication
3. Test AI tutor
4. Test all features
5. Check logs in Render dashboard

### Production Environment Variables

**Add to Render dashboard:**

```env
NODE_ENV=production
NODE_OPTIONS=--max-old-space-size=8192
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_NEO4J_URI=...
NEXT_PUBLIC_NEO4J_USERNAME=neo4j
NEXT_PUBLIC_NEO4J_PASSWORD=...
GEMINI_API_KEY=...
```

Plus any optional variables (Pusher, Tavily, etc.)

---

## ✅ Complete Setup Verification

### Functionality Checklist

Test all features in production:

**Core:**
- [ ] Landing page loads
- [ ] Sign up creates account
- [ ] Login works
- [ ] Logout works

**AI Tutor:**
- [ ] Send message gets AI response
- [ ] Conversation persists across sessions
- [ ] Edit message works
- [ ] Resend generates new response
- [ ] Multiple conversations can be created
- [ ] Conversations can be deleted

**Gamification:**
- [ ] XP earned on AI messages (1.01-1.75)
- [ ] XP animation displays
- [ ] Level up triggers celebration
- [ ] Gamification bar shows progress

**Quiz:**
- [ ] Quiz can be started
- [ ] Questions are answerable
- [ ] Scoring is correct
- [ ] 100% gives Legendary node
- [ ] Reward animation works
- [ ] XP is awarded

**Vocabulary Games:**
- [ ] All 4 game modes work
- [ ] XP awarded on correct answers
- [ ] Hint system works
- [ ] Confetti appears

**Todo/Kanban:**
- [ ] Tasks can be created
- [ ] Drag-and-drop works
- [ ] Completing task awards XP
- [ ] Tasks persist

**Group Chat:**
- [ ] Groups can be created
- [ ] Messages send and receive
- [ ] Threading works
- [ ] @ai mentions trigger AI
- [ ] Real-time updates (with Pusher)

**Leaderboard:**
- [ ] Rankings display
- [ ] Timeframe filters work
- [ ] XP and Accuracy modes work

**UI/UX:**
- [ ] Theme switching works
- [ ] Avatar customization works
- [ ] Mobile responsive
- [ ] No console errors

### Performance Checklist

- [ ] Landing page loads < 3 seconds
- [ ] AI responses within 15 seconds
- [ ] Database queries < 500ms
- [ ] No memory leaks
- [ ] Animations smooth (60fps)

### Security Checklist

- [ ] All API endpoints require authentication
- [ ] Users can only access their own data
- [ ] No secrets exposed in browser
- [ ] HTTPS enabled (automatic on Render)
- [ ] Input sanitization working

---

## 🎯 Setup Complete!

Congratulations! You have successfully:

✅ Installed all dependencies
✅ Configured environment variables
✅ Initialized Neo4j database
✅ Setup Python ACE agent
✅ Tested locally
✅ Deployed to production
✅ Verified all features

**Your Noodeia app is ready to use!**

---

## 📚 Additional Resources

### User Guides

Learn how to use each feature:
- [Gamification](../user-guides/GAMIFICATION.md) - XP and leveling
- [Quiz System](../user-guides/QUIZ_SYSTEM.md) - Taking quizzes
- [Kanban](../user-guides/KANBAN.md) - Task management
- [Leaderboard](../user-guides/LEADERBOARD.md) - Rankings
- [Vocabulary Games](../user-guides/VOCABULARY_GAMES.md) - Word games
- [Group Chat](../user-guides/GROUP_CHAT.md) - Collaboration
- [Themes](../user-guides/THEMES.md) - Customization

### Technical Documentation

Deep-dive into architecture:
- [ACE Memory System](../technical/ACE_README.md) - Memory architecture
- [Agent System](../technical/AGENT.md) - LangGraph agent
- [Database Schema](../technical/DATABASE_SCHEMA.md) - Complete schema
- [API Reference](../technical/API_REFERENCE.md) - All endpoints
- [Python Setup](../technical/PYTHON_SETUP.md) - Python details

### Troubleshooting

**Having issues?** See [../TROUBLESHOOTING.md](../TROUBLESHOOTING.md)

Common problems and solutions for:
- Authentication issues
- AI not responding
- Database connection errors
- Python/ACE agent errors
- Deployment failures

---

## ⏱️ Estimated Time

**First-time setup:**
- Prerequisites: 15-30 minutes (creating accounts)
- Installation: 5-10 minutes (downloading dependencies)
- Configuration: 5-10 minutes (adding credentials)
- Database setup: 2-5 minutes (running scripts)
- Python setup: 5-10 minutes (testing agent)
- Local testing: 10-20 minutes (testing features)
- Deployment: 10-15 minutes (Render configuration)

**Total**: 50-90 minutes for complete setup

**Experienced developers**: 20-30 minutes with Quick Start guide

---

## 🎓 Learning Path

### For Developers

**Recommended order:**
1. Read [00_OVERVIEW.md](./00_OVERVIEW.md) - Understand architecture
2. Follow this guide step-by-step
3. Test all features locally
4. Deploy to Render
5. Read technical docs for deep understanding

### For After-School Staff

**Recommended order:**
1. Read [00_OVERVIEW.md](./00_OVERVIEW.md) - Understand what Noodeia does
2. Follow this guide for deployment
3. Read user guides to understand features
4. Set up for your students
5. Monitor via admin dashboard

---

## 🆘 Get Help

**Setup issues?**
- Check [../TROUBLESHOOTING.md](../TROUBLESHOOTING.md)
- Review specific guide for your issue
- Check logs (browser console + server terminal)

**Questions?**
- Open GitHub issue
- Check existing documentation
- Review Neo4j/Supabase/Gemini official docs

**Found a bug?**
- Open GitHub issue with:
  - Description of problem
  - Steps to reproduce
  - Error messages
  - Environment details

---

## 🎯 Success!

You now have a fully functional Noodeia installation!

**What you can do:**
- Use AI tutor for personalized learning
- Create quizzes and track progress
- Play vocabulary games
- Manage tasks with Kanban
- Compete on leaderboards
- Collaborate in group chats
- Customize themes and avatars

**Share with students and watch them learn!** 🎓✨
