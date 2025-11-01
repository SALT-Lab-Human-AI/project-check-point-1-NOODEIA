# Memory Enhanced ACE (Agentic Context Engineering)

## Current Agent memory system



## Baseline: Original Workflow in ACE 

### Current Pruning Behaviour(Create and Delete)

The playbook is capped by `ACEMemory._prune_bullets()`. The exact logic is:

```python
def _prune_bullets(self):
    # Rank bullets by helpful ratio (score) and how often they've been marked helpful.
    bullets_list = sorted(
        self.bullets.values(),
        key=lambda b: (b.score(), b.helpful_count),
        reverse=True
    )

    # Retain only the IDs in the top window defined by max_bullets.
    to_keep = set(b.id for b in bullets_list[: self.max_bullets])
    # Everything else falls outside the window and should be removed.
    to_remove = set(self.bullets.keys()) - to_keep

    # Delete each pruned bullet and clean up any tag indices that reference it.
    for bullet_id in to_remove:
        bullet = self.bullets.pop(bullet_id)
        for tag in bullet.tags:
            if bullet_id in self.categories[tag]:
                self.categories[tag].remove(bullet_id)

    # Report how many bullets were pruned so the logs show retention events.
    if to_remove:
        print(f"[ACE Memory] Pruned {len(to_remove)} low-quality bullets")
```

Scoring is defined in `Bullet.score()`:

```python
def score(self) -> float:
    total = self.helpful_count + self.harmful_count
    if total == 0:
        return 0.5
    return self.helpful_count / total
```

Behaviour summary:

1. **Ranking** – Bullets are sorted by helpful ratio first and then by raw helpful count. Untouched bullets default to `0.5`.
2. **Retention window** – Only the first `max_bullets` survive; the rest are removed in one sweep.
3. **Tag cleanup** – Removed bullets are also dropped from every tag bucket in `self.categories`.
4. **Logging** – Pruning emits `[ACE Memory] Pruned …` which the runner now surfaces in stderr logs.

`prune_threshold` is not used in pruning; it only filters retrieval results in `retrieve_relevant_bullets()`. Any new pruning strategy should document how these rules change.

This README represents the original, unmodified ACE workflow in this repository. Use it as the baseline before experimenting with custom pruning heuristics.

---

## Proposed Method: Memory Enhanced ACE

Building on the baseline, the playbook now applies an exponential decay model inspired by human memory systems:

$$\boxed{\mathrm{Score}_{\mathrm{memory}} = S\,(1 - r_{\mathrm{semantic}})^{t_{\mathrm{semantic}}} + E\,(1 - r_{\mathrm{episodic}})^{t_{\mathrm{episodic}}} + P\,(1 - r_{\mathrm{procedural}})^{t_{\mathrm{procedural}}}}$$

Where:

| Symbol | Meaning |
|--------|---------|
| `S`, `E`, `P` | Base strengths for semantic, episodic, and procedural memory components stored on the bullet (`semantic_strength`, `episodic_strength`, `procedural_strength`). |
| `r_*` | Component-specific decay rates configured on `ACEMemory` (`decay_rates={"semantic": 0.01, "episodic": 0.05, "procedural": 0.002}` by default). |
| `$$t_*$$` | Number of access events processed since the component was last retrieved (derived from a global access counter). |

### Implementation Notes

* **Bullet fields** – Each bullet serialises strengths and per-component access counters. Tags (`semantic`, `episodic`, `procedural`) are auto-synchronised with the active strengths so every retrieved bullet advertises its memory type.
* **Access tracking** – Every time a bullet is retrieved or reinforced, `_touch_bullet` increments a global access counter and stamps the component’s access index. Decay now depends on event order instead of wall-clock time.
* **Scoring API** – A new `ACEMemory._compute_score()` helper evaluates the formula. Pruning, deduplication, retrieval filtering, and statistics all consume this unified score.
* **Category hygiene** – Whenever strengths change (including deduplication merges) the memory-type tags and `self.categories` index stay in sync so future lookups remain accurate.
* **Decay configuration** – Override via constructor:
  ```python
  memory = ACEMemory(decay_rates={"episodic": 0.08, "semantic": 0.005})
  ```
  Values are clamped to `[0.0, 1.0]`. Lower rates retain knowledge longer; higher rates forget faster.
* **Default ordering** – During pruning bullets are ordered by the decay score and then `helpful_count` to resolve ties. Tag indices remain consistent when entries are removed.

### Key Implementation Snippets

```python
class ACEMemory:
    def __init__(..., decay_rates=None):
        default_decay = {"semantic": 0.01, "episodic": 0.05, "procedural": 0.002}
        ...
        self.decay_rates = {k: max(0.0, min(1.0, v)) for k, v in default_decay.items()}
        self.access_clock = 0  # Global counter used for decay instead of wall-clock time

    def _component_score(self, strength, last_index, decay_key):
        if strength <= 0:
            return 0.0
        base = max(0.0, min(1.0, 1.0 - self.decay_rates.get(decay_key, 0.0)))
        last_index = last_index if last_index is not None else self.access_clock
        t = max(self.access_clock - last_index, 0)
        return strength * base**t  # (1 - r)^t decay

    def _touch_bullet(self, bullet, timestamp=None):
        self.access_clock += 1
        idx = self.access_clock
        ...  # Update last_used timestamps
        if bullet.semantic_strength > 0:
            bullet.semantic_access_index = idx
        if bullet.episodic_strength > 0:
            bullet.episodic_access_index = idx
        if bullet.procedural_strength > 0:
            bullet.procedural_access_index = idx

    def _ensure_memory_tags(self, bullet):
        ...  # Ensures semantic/episodic/procedural tags exist when strengths are non-zero
```

* `access_clock` increments on every retrieval or update, making `t` the number of accesses since last use.
* Each memory component stores its own access index so its decay is independent.
* `_ensure_memory_tags` keeps the bullet labelled with the correct memory types, and `_sync_categories` mirrors those labels inside the tag index.

### Memory Types Reference

| Type | Stores | Human Analogy | Agent Analogy | Default Decay per Access |
|------|--------|---------------|---------------|-------------------------|
| Semantic | Facts / concepts | School knowledge | Domain strategies | 1% per access |
| Episodic | Experiences | Recent events | Tool traces / user-specific events | 5% per access |
| Procedural | Instructions | Instincts / motor skills | System prompts / policies | 0.2% per access |

## Set up

---

## 1. Module Layout

| Purpose | File |
|---------|------|
| ACE memory store | `frontend/scripts/ace_memory.py` |
| Reflector / Curator / Pipeline | `frontend/scripts/ace_components.py` |
| LangGraph graph with ACE nodes | `frontend/scripts/langgraph_agent_ace.py` |
| Gemini + tool utilities | `frontend/scripts/langgraph_utile.py` |
| Runner invoked by Next.js | `frontend/scripts/run_ace_agent.py` |
| Memory analysis helpers | `frontend/scripts/analyze_ace_memory.py`, `compare_memory_systems.py`, `test_memory_comparison.py` |
| Stored bullets (runtime) | `frontend/scripts/ace_memory.json` |

These files were copied verbatim from `../ace memory` with only two syntax fixes in `langgraph_agent_ace.py` (missing `]`). Everything else is unchanged from the upstream version.

---

## 2. Runtime Workflow

1. **UI Request** – `/api/ai/chat` receives `{ message, conversationHistory }`.
2. **API Bridge** – `frontend/app/api/ai/chat/route.js` adds the system prompt, spawns `python3 frontend/scripts/run_ace_agent.py`, and streams the payload over stdin.
3. **Runner** – `run_ace_agent.py` normalises the state, enables online learning, logs the workflow to stderr, and calls `build_ace_graph()`.
4. **LangGraph Execution**:
   - `router_node` chooses the reasoning mode (`cot`, `tot`, `react`).
   - `planner_node` sets solver parameters.
   - `solver_node_with_ace` injects relevant bullets via `ACEMemory.format_context()` and calls Gemini through the `LLM` class.
   - `critic_node` cleans the answer.
   - `ace_learning_node` runs Reflector + Curator and updates `ace_memory.json`.
5. **Response** – Runner prints `{answer, mode, result, scratch}` as JSON; the API returns it to the client. Errors are surfaced to the UI.

---

## 3. Gemini Integration

- `frontend/scripts/langgraph_utile.py` posts directly to `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent` with function-calling support.
- Neo4j chain uses `ChatGoogleGenerativeAI` (same API key).
- Required environment variables:
  ```bash
  export GEMINI_API_KEY="sk-..."            # required
  export GEMINI_MODEL="gemini-2.5-flash"    # optional override
  export ACE_MEMORY_FILE="frontend/scripts/ace_memory.json"  # optional override

  # Optional Neo4j tool configuration
  export NEO4J_URI="bolt://localhost:7687"
  export NEO4J_USERNAME="neo4j"
  export NEO4J_PASSWORD="password"
  ```

---

## 4. Verification Checklist

```bash
pip3 install -r frontend/requirements.txt      # LangGraph, LangChain, Gemini, Tavily, Neo4j, MCP
export GEMINI_API_KEY="sk-..."
cd frontend/scripts
python3 run_ace_agent.py <<'EOF'
{"messages":[{"role":"user","content":"Help me multiply 12 by 5."}]}
EOF
python3 analyze_ace_memory.py                  # Inspect learned bullets
```

> If `npm run dev` cannot bind to a port because of local restrictions (`listen EPERM`), run the dev server in an environment where you can open the chosen port.

---

## 5. Inspection & Maintenance Tools

| Command | Purpose |
|---------|---------|
| `python3 analyze_ace_memory.py` | Overview, categories, top bullets |
| `python3 analyze_ace_memory.py search "division"` | Keyword search |
| `python3 analyze_ace_memory.py export` | Export bullets to text |
| `python3 analyze_ace_memory.py interactive` | Guided CLI exploration |
| `python3 compare_memory_systems.py` | Original vs ACE comparison |
| `python3 test_memory_comparison.py` | Side-by-side agent run |

Reset memory:
```python
from ace_memory import ACEMemory
mem = ACEMemory(memory_file="frontend/scripts/ace_memory.json")
mem.clear()
```

---



Tuning decay rates lets you emphasise recent struggles (episodic) without rapidly discarding core knowledge (semantic/procedural).
