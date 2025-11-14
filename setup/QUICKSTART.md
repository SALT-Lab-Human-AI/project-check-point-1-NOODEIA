# ⚡ Quick Start Guide

5-minute setup for experienced developers.

For detailed step-by-step instructions, see [getting-started/](./getting-started/) folder.

---

## 🎯 Prerequisites

Have these ready:
- ✅ Node.js 18+ and Python 3.10+ installed
- ✅ Supabase account with project created
- ✅ Neo4j AuraDB instance created
- ✅ Google AI Studio API key

**Need accounts?** See [getting-started/01_PREREQUISITES.md](./getting-started/01_PREREQUISITES.md)

---

## 🚀 Setup (5 Minutes)

### 1. Clone and Install

```bash
git clone https://github.com/SALT-Lab-Human-AI/project-check-point-1-NOODEIA.git
cd project-check-point-1-NOODEIA/frontend

# Install Node.js dependencies
npm install --legacy-peer-deps

# Install Python dependencies
pip3 install -r requirements.txt
```

### 2. Configure

```bash
# Create environment file
cp .env.local.example .env.local

# Edit .env.local with your credentials
nano .env.local  # or use your preferred editor
```

**Add:**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Neo4j
NEXT_PUBLIC_NEO4J_URI=neo4j+s://xxxxx.databases.neo4j.io
NEXT_PUBLIC_NEO4J_USERNAME=neo4j
NEXT_PUBLIC_NEO4J_PASSWORD=your-password

# Gemini
GEMINI_API_KEY=your-gemini-key
```

### 3. Initialize Database

```bash
# Run all setup scripts
npm run setup-neo4j && \
npm run setup-groupchat && \
npm run setup-markdown && \
npm run setup-quiz
```

**Expected**: ✅ for each script

### 4. Test ACE Agent

```bash
cd scripts
export GEMINI_API_KEY="your-key"
python3 run_ace_agent.py <<'EOF'
{"messages":[{"role":"user","content":"Help me with 2+2"}]}
EOF
cd ..
```

**Expected**: JSON response with answer

### 5. Start Development

```bash
npm run dev
# Open http://localhost:3000
```

**Test:**
- Sign up at `/login`
- Send AI message at `/ai`
- Take quiz at `/quiz`

---

## ✅ Verification

Quick checks:

```bash
# 1. Dependencies installed
npm list next neo4j-driver
pip3 show langgraph

# 2. Database connected
npm run setup-neo4j

# 3. Server starts
npm run dev

# 4. Tests pass
cd ../unitTests && ./run_all_tests.sh
```

---

## 🚀 Deploy to Render (5 Minutes)

```bash
# 1. Push to GitHub
git push origin main

# 2. Go to https://render.com/
# 3. New + → Web Service
# 4. Connect repository
# 5. Add environment variables (same as .env.local)
# 6. Deploy!
```

**Complete guide**: [deployment/RENDER.md](./deployment/RENDER.md)

---

## 🔧 Common Quick Fixes

**AI not responding:**
```bash
export GEMINI_API_KEY="your-key" && npm run dev
```

**Neo4j connection failed:**
```bash
# Check URI format: neo4j+s://...
npm run setup-neo4j
```

**Build fails:**
```bash
npm install --legacy-peer-deps
```

**Python errors:**
```bash
pip3 install -r requirements.txt
```

---

## 🎯 You're Ready!

**You now have:**
- ✅ Noodeia running locally
- ✅ All features functional
- ✅ Tests passing
- ✅ Ready to deploy

**Start building and learning!** 🚀✨
