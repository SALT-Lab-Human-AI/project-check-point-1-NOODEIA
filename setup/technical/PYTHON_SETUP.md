# 🐍 Python Environment - Technical Reference

Comprehensive technical guide to Python dependencies and ACE agent testing.

For architecture details, see [ACE_README.md](./ACE_README.md) and [AGENT.md](./AGENT.md)

---

## 📋 Python Version Requirements

**Minimum**: Python 3.10.0
**Recommended**: Python 3.11.x or 3.12.x
**Maximum tested**: Python 3.12.x

**Why 3.10+?**
- LangGraph requires Python 3.10+ for type hint features
- Match annotations (PEP 604)
- Structural pattern matching
- Better type checking

### Version Check

```bash
python3 --version
```

**Must show**: `Python 3.10.0` or higher

### Upgrade Python if Needed

**macOS**:
```bash
brew install python@3.11
brew link python@3.11
```

**Ubuntu/Debian**:
```bash
sudo apt update
sudo apt install python3.11 python3.11-venv python3-pip
```

**Windows**:
- Download from https://www.python.org/downloads/
- Run installer, check "Add Python to PATH"

---

## 📦 Dependencies Overview

### requirements.txt Breakdown

Located at: `frontend/requirements.txt`

```python
gtts==2.5.0                    # Google Text-to-Speech (TTS feature)
langgraph>=0.2.0               # Multi-agent workflow framework
langchain>=0.2.0               # LLM application framework
langchain-community>=0.2.0     # Community integrations
langchain-core>=0.2.0          # Core abstractions
langchain-google-genai>=0.1.0  # Google Gemini integration
tavily-python>=0.3.4           # Web search API client
neo4j>=5.20.0                  # Neo4j Python driver
requests>=2.31.0               # HTTP client library
python-dotenv>=1.0.0           # Environment variable loader
mcp>=0.3.0                     # Model Context Protocol (future use)
```

### Dependency Purpose

**AI Agent Framework:**
- `langgraph` - Defines multi-agent workflow (router, planner, solver, critic)
- `langchain` - Base framework for LLM applications
- `langchain-core` - Core abstractions and interfaces
- `langchain-community` - Community-contributed integrations

**LLM Integration:**
- `langchain-google-genai` - Google Gemini API client
- Connects to Gemini 2.5 Flash model
- Handles API calls, streaming, function calling

**Tools:**
- `tavily-python` - Deep web search API (optional but recommended)
- `neo4j` - Database driver for memory storage and queries
- `requests` - HTTP client for API calls

**Utilities:**
- `python-dotenv` - Load environment variables from .env files
- `gtts` - Text-to-speech conversion (optional feature)
- `mcp` - Model Context Protocol (imported but not yet used)

### Installation Methods

**Method 1: pip install** (Simple):
```bash
pip3 install -r requirements.txt
```

**Method 2: Virtual Environment** (Recommended):
```bash
# Create virtual environment
python3 -m venv venv

# Activate
source venv/bin/activate  # On macOS/Linux
# OR
venv\Scripts\activate     # On Windows

# Install
pip3 install -r requirements.txt

# Deactivate when done
deactivate
```

**Method 3: User install** (No admin rights):
```bash
pip3 install --user -r requirements.txt
```

### Verify Installation

```bash
pip3 list | grep -E "(langgraph|langchain|genai|neo4j|tavily)"
```

**Should show all packages with versions:**
```
langgraph                0.2.45
langchain                0.3.7
langchain-community      0.3.5
langchain-core           0.3.15
langchain-google-genai   2.0.5
neo4j                    5.26.0
tavily-python            0.5.0
```

---

## 🧪 Testing ACE Agent

### Basic Functionality Test

```bash
cd frontend/scripts
export GEMINI_API_KEY="your-key"
python3 run_ace_agent.py <<'EOF'
{"messages":[{"role":"user","content":"Help me solve 2 + 2"}]}
EOF
```

**Expected output format:**
```json
{
  "answer": "Let's think about this! How many groups of 2 do we have? If we combine 2 and 2, what number do we get?",
  "mode": "cot",
  "scratch": {
    "ace_online_learning": true,
    "learner_id": null,
    "topic": "arithmetic",
    "ace_delta": {
      "num_new_bullets": 1,
      "num_updates": 0,
      "num_removals": 0
    }
  }
}
```

### Tool Testing

**Test Calculator Tool:**

Triggers: "calculate", "verify", "double check", "make sure", "confirm"

```bash
python3 run_ace_agent.py <<'EOF'
{"messages":[{"role":"user","content":"Verify that 25 * 4 equals 100"}]}
EOF
```

**Should:**
- Use `"mode": "react"` (tool-using mode)
- Show calculator tool in trace
- Return accurate calculation

**Test Web Search Tool:**

Triggers: "search", "online", "latest", "current", "look up"

Requires: `TAVILY_API_KEY` environment variable

```bash
export TAVILY_API_KEY="your-key"
python3 run_ace_agent.py <<'EOF'
{"messages":[{"role":"user","content":"Search online for latest AI breakthroughs"}]}
EOF
```

**Should:**
- Use `"mode": "react"`
- Call Tavily API
- Return current information with sources

**Test Neo4j Database Tool:**

Triggers: "database", "user", "quiz", "session", "graph"

Requires: Neo4j environment variables

```bash
export NEO4J_URI="neo4j+s://..."
export NEO4J_USERNAME="neo4j"
export NEO4J_PASSWORD="your-password"

python3 run_ace_agent.py <<'EOF'
{"messages":[{"role":"user","content":"How many users are in the database?"}]}
EOF
```

### Memory Testing

**Test memory learning:**

```bash
# First interaction - teach a concept
python3 run_ace_agent.py <<'EOF'
{"messages":[{"role":"user","content":"I struggle with 1/2 + 1/3, help me remember LCD"}]}
EOF
```

**Check learned:**
```bash
# Inspect memory (need actual user ID)
python3 analyze_ace_memory.py --learner <user-id>
```

**Should show:**
- New bullet about fraction addition
- Tags: semantic, procedural, or episodic
- Memory type inferred from interaction

**Second interaction - verify retrieval:**
```bash
python3 run_ace_agent.py <<'EOF'
{"messages":[{"role":"user","content":"I forgot how to add fractions"}]}
EOF
```

**Should:**
- Retrieve previous bullet about fractions
- Include that context in response
- Show memory injection in logs

---

## 🔍 Memory Analysis Tools

### analyze_ace_memory.py

**Purpose**: Inspect, search, and export learned memory

**Usage:**

```bash
cd frontend/scripts

# Summary (default)
python3 analyze_ace_memory.py --learner abc-123

# Search for keyword
python3 analyze_ace_memory.py search "fractions" --learner abc-123

# Export all bullets
python3 analyze_ace_memory.py export --learner abc-123 > memory-dump.txt

# Interactive exploration
python3 analyze_ace_memory.py interactive --learner abc-123

# Cleanup duplicates (dry run)
python3 analyze_ace_memory.py cleanup --learner abc-123 --dry-run

# Apply cleanup
python3 analyze_ace_memory.py cleanup --learner abc-123
```

**Finding learner IDs:**

In Neo4j Browser:
```cypher
MATCH (u:User)-[:HAS_ACE_MEMORY]->(m:AceMemoryState)
RETURN u.id, u.name, u.email, m.access_clock
ORDER BY m.updated_at DESC
```

Or via environment variable:
```bash
export ACE_ANALYZE_LEARNER_ID="abc-123"
python3 analyze_ace_memory.py  # Uses env variable
```

### compare_memory_systems.py

**Purpose**: Compare traditional vs ACE memory

```bash
python3 compare_memory_systems.py
```

Shows difference between:
- Traditional (transcript replay)
- ACE (structured memory bullets)

---

## 🏗️ Architecture Integration

### How Python Integrates with Next.js

**API Request Flow:**

```
1. User sends message
   ↓
2. Next.js API route (/api/ai/chat)
   ↓
3. Spawns Python subprocess:
   spawn('python3', ['frontend/scripts/run_ace_agent.py'])
   ↓
4. Streams JSON via stdin
   ↓
5. Python agent processes with LangGraph
   ↓
6. Returns JSON via stdout
   ↓
7. API forwards to frontend
```

**Code reference**: `frontend/app/api/ai/chat/route.js`

### Environment Variables in Python

**Python scripts load from:**
1. `os.environ` (exported variables)
2. `.env.local` via `python-dotenv`
3. Next.js passes via subprocess environment

**Loading pattern:**
```python
from dotenv import load_dotenv
import os

load_dotenv()  # Loads from .env.local
api_key = os.getenv("GEMINI_API_KEY")
```

---

## 🧪 Unit Testing

### System Prompts Verification

```bash
cd unitTests/prompts
./verify_all.sh
```

**Tests:**
- Prompts import correctly
- ACE components can access prompts
- LangGraph utilities work
- API simulation passes

**Expected**: All 4 tests pass

### Full Test Suite

```bash
cd unitTests
./run_all_tests.sh
```

**Includes:**
- System prompts (Python)
- Authentication (Node.js)
- Quiz scoring (Node.js)
- Gamification (Node.js)
- AI chat API (Node.js + Python)
- Group chat (Node.js)
- Data persistence (Node.js)

**Expected**: All 7 suites pass

---

## 🔧 Troubleshooting Python Issues

### Common Import Errors

**Error**: `ModuleNotFoundError: No module named 'langgraph'`

**Solution**:
```bash
# Reinstall requirements
pip3 install -r frontend/requirements.txt

# Verify installation
pip3 show langgraph
```

**Error**: `ImportError: cannot import name 'ClientSession'`

**Solution**:
```bash
# MCP version mismatch
pip3 install --upgrade mcp>=0.3.0
```

### Common Runtime Errors

**Error**: `GEMINI_API_KEY not configured`

**Solution**:
```bash
# Export key
export GEMINI_API_KEY="your-key"

# Or load from .env.local
cd frontend
source <(grep GEMINI_API_KEY .env.local | sed 's/^/export /')
```

**Error**: `Neo4j connection failed`

**Solution**:
```bash
# Check credentials
export NEO4J_URI="neo4j+s://..."
export NEO4J_USERNAME="neo4j"
export NEO4J_PASSWORD="your-password"

# Test connection
npm run setup-neo4j
```

**Error**: `TavilySearchAPIWrapper() missing required argument: 'tavily_api_key'`

**Solution**:
```bash
# Export Tavily key (if using web search)
export TAVILY_API_KEY="your-key"

# Or disable web search (remove from agent)
```

### JSON Input/Output Issues

**Error**: `json.decoder.JSONDecodeError`

**Solution**:
- Ensure input is valid JSON
- Use heredoc format: `<<'EOF' ... EOF`
- Check no extra characters before/after JSON
- Validate JSON at jsonlint.com

**Error**: `Unicode decode error`

**Solution**:
- Ensure UTF-8 encoding
- Use `encoding='utf-8'` when reading files
- Check terminal supports UTF-8

---

## 🎯 Performance Optimization

### Python Memory Usage

**Monitor memory:**
```python
import psutil
import os

process = psutil.Process(os.getpid())
print(f"Memory: {process.memory_info().rss / 1024 / 1024:.2f} MB")
```

**Typical memory usage:**
- Agent startup: 50-100 MB
- After loading LangChain: 150-250 MB
- During inference: 300-500 MB

### Optimize Agent Performance

**Reduce latency:**
1. Use `gemini-2.5-flash` instead of `pro` (faster)
2. Lower temperature for more consistent responses
3. Reduce max_turns in ReAct mode
4. Cache frequently used memory bullets

**Environment tuning:**
```env
GEMINI_MODEL=gemini-2.5-flash    # Faster model
ACE_LLM_TEMPERATURE=0.2          # More focused
ACE_CURATOR_USE_LLM=false        # Faster heuristic curation
```

---

## 📚 Related Documentation

### Python-Related Guides

- **ACE Memory Architecture**: [ACE_README.md](./ACE_README.md)
- **LangGraph Agent**: [AGENT.md](./AGENT.md)
- **Getting Started**: [../getting-started/05_PYTHON_ACE_SETUP.md](../getting-started/05_PYTHON_ACE_SETUP.md)

### Testing Documentation

- **Unit Tests**: `../../unitTests/README.md`
- **Prompt Tests**: `../../unitTests/prompts/verify_all.sh`
- **Manual Tests**: `../../docs/minimalTest/useCase.md`

---

## 🛠️ Development Tips

### Virtual Environment Best Practices

**Why use venv?**
- Isolates project dependencies
- Prevents version conflicts
- Easy to recreate environment
- Standard Python practice

**Setup:**
```bash
# Create once
python3 -m venv venv

# Activate every session
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Install dependencies
pip3 install -r requirements.txt

# Deactivate when done
deactivate
```

**Add to .gitignore:**
```
venv/
*.pyc
__pycache__/
```

### Dependency Freezing

**Create exact version lock:**
```bash
pip3 freeze > requirements-lock.txt
```

**Reinstall from lock:**
```bash
pip3 install -r requirements-lock.txt
```

**Use for:**
- Production deployments
- Reproducible environments
- CI/CD pipelines

### Linting and Type Checking

**Optional but recommended:**

**Install development tools:**
```bash
pip3 install black mypy pylint
```

**Format code:**
```bash
black frontend/scripts/*.py
```

**Type check:**
```bash
mypy frontend/scripts/run_ace_agent.py
```

**Lint:**
```bash
pylint frontend/scripts/ace_memory.py
```

---

## 🔍 Advanced Testing

### Pytest Integration (Optional)

**Install pytest:**
```bash
pip3 install pytest pytest-asyncio
```

**Create test file:**
```python
# test_ace_agent.py
import pytest
from run_ace_agent import main

def test_basic_question():
    result = main({"messages": [{"role": "user", "content": "2+2"}]})
    assert "answer" in result
    assert result["mode"] in ["cot", "tot", "react"]
```

**Run tests:**
```bash
pytest test_ace_agent.py
```

### Performance Profiling

**Profile agent execution:**
```bash
python3 -m cProfile -o agent.prof run_ace_agent.py <<'EOF'
{"messages":[{"role":"user","content":"Test"}]}
EOF
```

**Analyze profile:**
```bash
python3 -m pstats agent.prof
# In pstats prompt:
# stats 10    # Show top 10 slowest functions
# sort time   # Sort by time
```

---

## 🎯 Python Setup Complete!

You now understand:
✅ Python version requirements
✅ All dependencies and their purposes
✅ Installation methods
✅ Testing procedures
✅ Troubleshooting common issues
✅ Performance optimization
✅ Development best practices

---

## 📚 Next Steps

**For architecture details:**
- [ACE_README.md](./ACE_README.md) - Memory system internals
- [AGENT.md](./AGENT.md) - LangGraph multi-agent architecture

**For database:**
- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Neo4j schema

**For API:**
- [API_REFERENCE.md](./API_REFERENCE.md) - All endpoints

---

## ❓ Need Help?

**Python installation issues?**
- Check Python version (must be 3.10+)
- Try virtual environment approach
- See [../TROUBLESHOOTING.md](../TROUBLESHOOTING.md)

**Dependency conflicts?**
- Use virtual environment
- Try `pip3 install --upgrade pip`
- Check for conflicting global packages

**Agent not working?**
- Verify all dependencies installed
- Check environment variables
- Review agent logs for specific errors
- Test each tool individually
