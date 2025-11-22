# 🐍 Python ACE Agent Setup

Guide to setting up and testing the Python-based ACE agent that powers Noodeia's intelligent tutoring.

---

## 📖 What is the ACE Agent?

**ACE** = **A**gentic **C**ontext **E**ngineering

The ACE agent is a sophisticated AI system that:
- Uses LangGraph for multi-agent reasoning
- Maintains per-student memory in Neo4j
- Chooses optimal reasoning strategies (COT/TOT/ReAct)
- Learns from every interaction
- Provides personalized tutoring

**Why Python?**
- LangGraph and LangChain are Python frameworks
- Better AI tooling ecosystem
- Runs as subprocess spawned by Next.js API routes

---

## ✅ Before You Begin

Ensure you have:
- ✅ Python 3.10+ installed
- ✅ Python dependencies installed ([02_INSTALLATION.md](./02_INSTALLATION.md))
- ✅ Environment variables configured ([03_CONFIGURATION.md](./03_CONFIGURATION.md))
- ✅ GEMINI_API_KEY set

---

## 🧪 Step 1: Verify Python Environment

### Check Python Version

```bash
python3 --version
```

**Must show**: Python 3.10.0 or higher

### Check Installed Packages

```bash
pip3 list | grep -E "(langgraph|langchain|genai|neo4j|tavily)"
```

**Should show:**
```
langgraph                0.2.45
langchain                0.3.7
langchain-google-genai   2.0.5
neo4j                    5.26.0
tavily-python            0.5.0
```

**If missing packages:**
```bash
cd frontend
pip3 install -r requirements.txt
```

---

## 🔑 Step 2: Configure Environment Variables

### Required for ACE Agent

The ACE agent needs these environment variables:

```bash
export GEMINI_API_KEY="your-gemini-api-key"
```

**For Neo4j tool** (optional but recommended):
```bash
export NEO4J_URI="neo4j+s://xxxxx.databases.neo4j.io"
export NEO4J_USERNAME="neo4j"
export NEO4J_PASSWORD="your-password"
```

Or use NEXT_PUBLIC_ prefixed versions:
```bash
export NEXT_PUBLIC_NEO4J_URI="neo4j+s://xxxxx.databases.neo4j.io"
export NEXT_PUBLIC_NEO4J_USERNAME="neo4j"
export NEXT_PUBLIC_NEO4J_PASSWORD="your-password"
```

**For web search tool** (optional):
```bash
export TAVILY_API_KEY="your-tavily-key"
```

### Load from .env.local (Recommended)

Instead of exporting manually, load from `.env.local`:

```bash
cd frontend
source <(grep -v '^#' .env.local | sed 's/^/export /')
```

**Or create a helper script** (`load-env.sh`):
```bash
#!/bin/bash
set -a
source frontend/.env.local
set +a
```

Then use:
```bash
source load-env.sh
```

---

## 🧪 Step 3: Test ACE Agent CLI

### Basic Test

Navigate to scripts directory:
```bash
cd frontend/scripts
```

Test agent with simple question:
```bash
python3 run_ace_agent.py <<'EOF'
{"messages":[{"role":"user","content":"Help me multiply 12 by 5"}]}
EOF
```

**Expected output** (JSON format):
```json
{
  "answer": "To multiply 12 by 5, you can use repeated addition: 12 + 12 + 12 + 12 + 12 = 60. Or think of it as 10×5=50 plus 2×5=10, giving you 60 total.",
  "mode": "react",
  "scratch": {
    "ace_online_learning": true,
    "ace_delta": {
      "num_new_bullets": 1,
      "num_updates": 0,
      "num_removals": 0
    }
  }
}
```

**What this tests:**
- ✅ Python environment working
- ✅ Gemini API key valid
- ✅ LangGraph executing
- ✅ ACE memory learning
- ✅ JSON input/output working

### Test Calculator Tool

Test the secure calculator (no code execution risk):

```bash
python3 run_ace_agent.py <<'EOF'
{"messages":[{"role":"user","content":"Verify that 25 * 4 equals 100"}]}
EOF
```

**Should trigger**: ReAct mode with calculator tool

**Look for** in output:
- `"mode": "react"` (tool-using mode)
- Calculator tool usage in trace

### Test Web Search Tool

Test web research (requires TAVILY_API_KEY):

```bash
python3 run_ace_agent.py <<'EOF'
{"messages":[{"role":"user","content":"Search online for latest AI news"}]}
EOF
```

**Should trigger**: ReAct mode with web search tool

**If you don't have Tavily key**, you'll see error but agent will still try to answer without search.

### Test Memory Persistence

First interaction:
```bash
python3 run_ace_agent.py <<'EOF'
{"messages":[{"role":"user","content":"Help me understand 1/2 + 1/3"}]}
EOF
```

Second interaction (should remember):
```bash
python3 run_ace_agent.py <<'EOF'
{"messages":[{"role":"user","content":"I'm still confused about fractions"}]}
EOF
```

**Check memory learned:**
```bash
python3 analyze_ace_memory.py --learner test-user-123
```

Note: Replace `test-user-123` with actual Supabase user ID from your application.

---

## 🔍 Step 4: Inspect ACE Memory

### Memory Analysis Tool

```bash
cd frontend/scripts
python3 analyze_ace_memory.py --learner <user-id>
```

**Available commands:**

**Summary** (default):
```bash
python3 analyze_ace_memory.py --learner abc123
```

Shows:
- Total bullets
- Memory types breakdown
- Top categories
- Recent bullets

**Search for keywords:**
```bash
python3 analyze_ace_memory.py search "fractions" --learner abc123
```

**Export all bullets:**
```bash
python3 analyze_ace_memory.py export --learner abc123 > memory.txt
```

**Interactive mode:**
```bash
python3 analyze_ace_memory.py interactive --learner abc123
```

**Cleanup duplicates:**
```bash
# Dry run (preview only)
python3 analyze_ace_memory.py cleanup --learner abc123 --dry-run

# Apply cleanup
python3 analyze_ace_memory.py cleanup --learner abc123
```

### Finding User IDs

To find learner IDs in Neo4j:

```cypher
MATCH (u:User)-[:HAS_ACE_MEMORY]->(m:AceMemoryState)
RETURN u.id AS learner_id,
       u.name,
       u.email,
       m.access_clock,
       m.updated_at
ORDER BY m.updated_at DESC
```

---

## 🛠️ Step 5: Troubleshooting

### Common Issues

**Error**: `GEMINI_API_KEY not configured`

**Solution**:
```bash
export GEMINI_API_KEY="your-key-here"
# Or load from .env.local
```

**Error**: `ModuleNotFoundError: No module named 'langgraph'`

**Solution**:
```bash
pip3 install -r frontend/requirements.txt
```

**Error**: `Neo4j connection failed`

**Solution**:
- Check Neo4j credentials exported
- Verify instance is running
- Test with: `npm run setup-neo4j`

**Error**: `JSON decode error`

**Solution**:
- Ensure input is valid JSON
- Use heredoc format (`<<'EOF' ... EOF`)
- Check no extra characters before/after JSON

### Verbose Logging

To see detailed agent logs:

```bash
# The agent logs to stderr, redirect to see:
python3 run_ace_agent.py <<'EOF' 2>&1 | tee agent.log
{"messages":[{"role":"user","content":"Test question"}]}
EOF
```

**Logs show:**
```
[ACE Memory] Loaded 5 bullets from Neo4j for learner=...
[ACE Memory][Inject] Retrieved 3 bullets for question: ...
[ACE Runner] Memory delta summary new=1 updates=2 removals=0
```

---

## ✅ Step 6: Integration Test

### Test Through API Route

Start the dev server:
```bash
cd frontend
npm run dev
```

In another terminal, test the API:
```bash
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <SUPABASE_TOKEN>" \
  -d '{"message":"Help me with 2+2","conversationHistory":[]}'
```

**Expected**: JSON response with answer

**If it fails**:
- Check dev server logs for Python errors
- Verify GEMINI_API_KEY is loaded
- Check Python is in PATH

### Full Integration Test

1. Open http://localhost:3000
2. Sign up / Login
3. Go to AI Tutor
4. Send a message
5. Check server terminal for:
   ```
   [ACE Memory] Loaded ... bullets
   [ACE Pipeline] ...
   [ACE Runner] ...
   ```

**Success indicators:**
- AI responds within 10-15 seconds
- Response is relevant and educational
- No Python errors in server logs
- Memory delta summary appears

---

## 🎯 Python Setup Complete!

✅ Python environment verified
✅ ACE dependencies installed
✅ Gemini API key configured
✅ Agent tested successfully
✅ Memory system working
✅ Integration verified

---

## 📚 Next Steps

1. **Local Development**: [06_LOCAL_DEVELOPMENT.md](./06_LOCAL_DEVELOPMENT.md)
2. **ACE Architecture Deep-Dive**: [../technical/ACE_README.md](../technical/ACE_README.md)
3. **Agent Reference**: [../technical/AGENT.md](../technical/AGENT.md)
4. **Python Details**: [../technical/PYTHON_SETUP.md](../technical/PYTHON_SETUP.md)

---

## ❓ Need Help?

**Python issues?**
- Check Python version (must be 3.10+)
- Verify all dependencies installed
- See [../technical/PYTHON_SETUP.md](../technical/PYTHON_SETUP.md)

**ACE agent not working?**
- Check GEMINI_API_KEY is valid
- Verify Neo4j connection for memory storage
- Review agent logs for specific errors
- See [../TROUBLESHOOTING.md](../TROUBLESHOOTING.md)

**Want to learn more?**
- ACE Memory System: [../technical/ACE_README.md](../technical/ACE_README.md)
- Agent Architecture: [../technical/AGENT.md](../technical/AGENT.md)
- Memory formula and decay: [../technical/ACE_README.md#memory-types](../technical/ACE_README.md)
