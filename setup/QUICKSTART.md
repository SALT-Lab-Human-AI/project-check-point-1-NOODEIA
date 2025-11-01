# ACE Quick Start (Project Edition)

Follow these steps to exercise the ACE + Gemini agent that powers `/api/ai/chat`.

---

## 1. Install Requirements

```bash
pip3 install -r frontend/requirements.txt   # LangGraph, LangChain, Gemini client, Neo4j, Tavily, MCP, gTTS
cd frontend
npm install                                 # Only needed for the Next.js UI
```

---

## 2. Set Environment Variables

```bash
export GEMINI_API_KEY="your-google-api-key"
export GEMINI_MODEL="gemini-2.5-flash"      # optional override
# Optional Neo4j tool configuration
export NEO4J_URI="bolt://localhost:7687"
export NEO4J_USERNAME="neo4j"
export NEO4J_PASSWORD="password"
```

`GEMINI_API_KEY` is mandatory—the Python runner raises a structured error if it is missing.

---

## 3. Run the Agent from the CLI

```bash
cd frontend/scripts
python3 run_ace_agent.py <<'EOF'
{"messages": [
  {"role": "system", "content": "You are a helpful math tutor."},
  {"role": "user", "content": "Show me two ways to multiply 12 by 5."}
]}
EOF
```

Expected result:
```json
{
  "answer": "Method 1: 12×5 = (10×5)+(2×5)=60. Method 2: Think of five groups of 12 → 60.",
  "mode": "react",
  "scratch": {
    "ace_delta": {"num_new_bullets": 1, "num_updates": 1, "num_removals": 0},
    "ace_online_learning": true,
    ...
  }
}
```

This verifies Gemini access, tool wiring, and ACE learning in a single command.

---

## 4. Optional – Start the Next.js UI

> The Codex sandbox refuses to bind to local ports (`listen EPERM`). Run the server on your own machine if you need the web UI.

```bash
cd frontend
export GEMINI_API_KEY="..."
npm run dev -- --hostname 127.0.0.1 --port 3001
```

Open the AI assistant, ask a question, and inspect the network response—`metadata.mode` and `metadata.scratch.ace_delta` confirm ACE participation.

---

## 5. Inspect Learned Memory

```bash
cd frontend/scripts
python3 analyze_ace_memory.py                     # overview
python3 analyze_ace_memory.py search "division"
python3 analyze_ace_memory.py export
python3 analyze_ace_memory.py interactive
```

The file `frontend/scripts/ace_memory.json` is created automatically on the first successful invocation.

---

## 6. Reset or Tune Memory

```python
from ace_memory import ACEMemory
mem = ACEMemory(memory_file="frontend/scripts/ace_memory.json")
mem.clear()   # wipe learned bullets
```

Tune parameters by editing the `ACEMemory(...)` call in `frontend/scripts/langgraph_agent_ace.py`:

```python
ACEMemory(
    memory_file="ace_memory.json",
    max_bullets=100,
    dedup_threshold=0.85,
    prune_threshold=0.3,
)
```

- Increase `max_bullets` for longer-lived playbooks.
- Raise `dedup_threshold` to merge bullets more aggressively.
- Raise `prune_threshold` to discard middling strategies faster.

---

## 7. Troubleshooting Cheat Sheet

| Issue | Fix |
|-------|-----|
| `GEMINI_API_KEY not configured` | Export the key in the same shell before running any Python scripts or the dev server. |
| `/api/ai/chat` returns 500 | The JSON body now contains the detailed error from the Python runner (`metadata.error`). |
| No `ace_memory.json` | Run the CLI test once; the file is created on the first successful invocation. |
| Dev server cannot start | Run Next.js outside the sandbox or choose an allowed port/host. |

That’s all you need to get ACE working in this directory. Start with the CLI test, watch `ace_memory.json` grow, then plug it into any workflow that can hit `/api/ai/chat`.***
