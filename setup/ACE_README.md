#  Long Term Memory Based Agentic Context Engineering

## Current agent memory system

Before the introduction of ACE, the memory systems for agents were simply the adding conversations into the context window where sthe model retrive the latest  messages and resent the entire thread to the model. That yields short term context memory when the chat is active. However, it has significant significant limits:

- **No consolidation** – Notes disappear once the thread ends; past sessions provide no signal for future ones.
- **Token bloat** – Long chats exhaust the model’s context window because raw transcripts are replayed verbatim.
- **Zero personalisation** – We can’t capture the user's information and perference in a reusable way.
- **No learning** – The agent never reflects on success/failure, so it can’t refine its strategy.

The rest of this document explains how ACE replaces that transient transcript with a structured, per-learner memory that actively enriches prompts and learns over time.

## Baseline: Agentic Context Engineering

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

## Proposed Method: Long Term Memory Based Agentic Context Engineering

Building on the baseline, the playbook now applies an exponential decay model inspired by human memory systems:

$$\boxed{\mathrm{Score}_{\mathrm{memory}} = S\,(1 - r_{\mathrm{semantic}})^{t_{\mathrm{semantic}}} + E\,(1 - r_{\mathrm{episodic}})^{t_{\mathrm{episodic}}} + P\,(1 - r_{\mathrm{procedural}})^{t_{\mathrm{procedural}}}}$$

Where:

| Symbol | Meaning |
|--------|---------|
| `S`, `E`, `P` | Base strengths for semantic, episodic, and procedural memory components stored on the bullet (`semantic_strength`, `episodic_strength`, `procedural_strength`). |
| `r_*` | Component-specific decay rates configured on `ACEMemory` (`decay_rates={"semantic": 0.01, "episodic": 0.05, "procedural": 0.002}` by default). |
| `t_*` | Number of access events processed since the component was last retrieved (derived from a global access counter). |

### Implementation Notes

* **Bullet fields** – Each bullet serialises strengths and per-component access counters. Tags (`semantic`, `episodic`, `procedural`) are auto-synchronised with the active strengths so every retrieved bullet advertises its memory type. Additional metadata now includes learner IDs, topic, concept, memory_type, TTL, and a dedupe hash.
* **Access tracking** – Every time a bullet is retrieved or reinforced, `_touch_bullet` increments a global access counter and stamps the component’s access index. Decay now depends on event order instead of wall-clock time.
* **Scoring API** – A new `ACEMemory._compute_score()` helper evaluates the formula. Pruning, deduplication, retrieval filtering, and statistics all consume this unified score.
* **Category hygiene** – Whenever strengths change (including deduplication merges) the memory-type tags and `self.categories` index stay in sync so future lookups remain accurate.
* **Dedupe & hashing** – Every bullet maintains a normalised content hash; duplicates (same learner/topic/memory_type) are merged and logged before write-back while the hash index keeps tag/category maps tidy.
* **Dedup logging** – Whenever two bullets collapse into one, the memory prints `[ACE Memory][Dedup Merge] kept=… merged=…` so you can confirm which entry survived.
* **Retrieval ranking** – Queries can pass `learner_id`, `topic`, and `memory_types`; ranking prioritises procedural > episodic > semantic memories while boosting learner/topic matches, ensuring stateful facts surface first.
* **Decay configuration** – Override via constructor:
  ```python
  memory = ACEMemory(decay_rates={"episodic": 0.08, "semantic": 0.005})
  ```
  Values are clamped to `[0.0, 1.0]`. Lower rates retain knowledge longer; higher rates forget faster.
* **Default ordering** – During pruning bullets are ordered by the decay score and then `helpful_count` to resolve ties. Tag indices remain consistent when entries are removed.
* **Pipeline LLM** – The ACE pipeline now reads the same Gemini configuration (`GEMINI_MODEL`, `ACE_LLM_TEMPERATURE`) used by the primary agent, so reflector/curator calls stay on the supported model set.
* **Thought logging** – The CoT/ToT/ReAct solvers emit `[ACE Thought]` lines showing scratchpads, branch scores, and tool outputs, mirroring the agent’s reasoning in the terminal while user-facing replies stay concise.
* **Memory logging** – Context injection prints each retrieved bullet (ID, decay score, helpful/harmful counts, tags, content). Pruning and delta application log every removal/addition/update so you can watch the playbook evolve in real time.
* **Lesson/delta logging** – After reflection the pipeline lists every lesson. If `ACE_CURATOR_USE_LLM=true`, the curator calls Gemini (JSON-only mode), retries on parse errors, logs the raw output, and otherwise falls back to heuristic lessons; with the default heuristic mode, no LLM call is made.
* **Fallback curation** – When the heuristic path is used (default) or Gemini still fails after retries, each lesson is automatically turned into a new bullet (with inferred tags, learner/topic/concept, and memory type) so the playbook continues to grow, and that fallback action is logged.
* **Curator modes** – `ACE_CURATOR_USE_LLM=false` (default) keeps curation heuristic and deterministic; flipping it on uses Gemini with schema retries, then gracefully falls back to the heuristic so no delta is ever lost.

### Key Implementation Snippets

```python
class ACEMemory:
    def _component_score(self, strength, last_index, decay_key):
        if strength <= 0:  # Component not active → no contribution
            return 0.0
        base = max(0.0, min(1.0, 1.0 - self.decay_rates.get(decay_key, 0.0)))  # Clamp 1 - r
        last_index = last_index if last_index is not None else self.access_clock  # Default to current access index
        t = max(self.access_clock - last_index, 0)  # Number of accesses since we last saw this memory
        return strength * base**t  # Implements S(1-r)^t / E(1-r)^t / P(1-r)^t

    def _prune_bullets(self):
        now = datetime.now()  # Timestamp used only for logging/debug output
        bullets_list = sorted(  # Rank bullets by decay-aware score, then helpful count
            self.bullets.values(),
            key=lambda b: (self._compute_score(b, now), b.helpful_count),
            reverse=True,
        )
        to_keep = set(b.id for b in bullets_list[: self.max_bullets])  # Retain highest-scoring window
        to_remove = set(self.bullets.keys()) - to_keep  # Everything else is pruned
        for bullet_id in to_remove:
            bullet = self.bullets.pop(bullet_id)  # Drop bullet from main store
            try:
                score = self._compute_score(bullet, now)  # Log decay-aware score for visibility
            except Exception:
                score = bullet.score()  # Fallback to legacy ratio if needed
            print(
                f"[ACE Memory][Prune] Removing id={bullet_id} score={score:.3f} "
                f"helpful={bullet.helpful_count} harmful={bullet.harmful_count} "
                f"tags={bullet.tags} content={bullet.content}",
                flush=True,
            )
            for tag in bullet.tags:
                if bullet_id in self.categories[tag]:  # Keep tag index consistent
                    self.categories[tag].remove(bullet_id)
            self._unregister_bullet(bullet_id)  # Remove hash/index entry so dedupe stays accurate
        if to_remove:
            print(f"[ACE Memory] Pruned {len(to_remove)} low-quality bullets")

    def _deduplicate_bullets(self):
        ...
            if similarity > self.dedup_threshold:
                ...
                self._register_bullet(bullets_list[i])  # Re-register hash after merge
                print(f"[ACE Memory][Dedup Merge] kept={bullets_list[i].id} merged={bullets_list[j].id}", flush=True)
                ...

class Curator:
    def _lessons_to_delta(self, lessons, learner_id=None, topic=None):
        delta = DeltaUpdate()  # Deterministic fallback when Gemini is unavailable
        for lesson in lessons:
            ...
            bullet = Bullet(
                id="",
                content=content,
                tags=tags,
                helpful_count=1,
                learner_id=learner_id,
                topic=topic,
                concept=concept,
                memory_type=memory_type,
            )
            delta.new_bullets.append(bullet)  # Attach metadata so retrieval can prioritise it later

    def curate(self, lessons, query, learner_id=None, topic=None, **_):
        if not lessons:
            return DeltaUpdate()  # Fast no-op guard
        relevant = self.memory.retrieve_relevant_bullets(
            query,
            top_k=10,
            learner_id=learner_id,
            topic=topic,
        )  # Pull bullets for prompt context
        current_bullets_str = "\n".join(
            f"ID: {b.id}\n{b.format_for_prompt()}\nType: {b.memory_type} | Learner: {b.learner_id} | Topic: {b.topic}"
            for b in relevant
        ) if relevant else "No existing bullets"
        prompt = CURATOR_PROMPT.format(
            lessons=json.dumps(lessons, indent=2),
            current_bullets=current_bullets_str,
        )
        if not use_llm:
            return self._lessons_to_delta(lessons, learner_id=learner_id, topic=topic)
        # Gemini path: JSON-only call with retries, then fallback if parsing fails

class ACEPipeline:
    def process_execution(...):
        learner_id = scratch.get("learner_id")
        topic = scratch.get("topic") or _infer_topic_from_text(question)
        delta = self.curator.curate(lessons, question, learner_id=learner_id, topic=topic)
        self.memory.apply_delta(delta)  # Every delta application prints add/update/remove + dedupe logs
```

#### Neo4j-backed, per-learner memory store

```python
# frontend/scripts/ace_memory_store.py
with driver.session(database=self._database) as session:
    record = session.run(
        """
        MATCH (u:User {id: $userId})
        MERGE (u)-[:HAS_ACE_MEMORY]->(m:AceMemoryState)  # ensure node + rel exist
        ON CREATE SET                                           # bootstrap payload once
            m.id = coalesce($memoryId, randomUUID()),
            m.memory_json = $emptyPayload,
            m.access_clock = 0,
            m.created_at = datetime(),
            m.updated_at = datetime()
        RETURN m.memory_json AS memory_json,
               m.access_clock AS access_clock
        """,
        {...},
    ).single()
```
* Learner-specific playbooks persist in Neo4j so Render dynos share state.
* The `MERGE` ensures the relationship and node exist before reads, eliminating warning spam.
* Each turn reloads at most once (`router_node` tags `_ace_memory_loaded` in `scratch`).

#### Canonical dedup & taxonomy cleanup

```python
# frontend/scripts/ace_memory.py
def _select_canonical_bullet(self, a, b):
    score_a = (a.helpful_count - a.harmful_count)
    score_b = (b.helpful_count - b.harmful_count)
    if score_a != score_b:
        return (a, b) if score_a > score_b else (b, a)  # keep higher-signal bullet
    created_a = self._parse_created_at(a)
    created_b = self._parse_created_at(b)
    return (a, b) if created_a >= created_b else (b, a)  # newest wins tie

def _merge_bullet_into(self, keep, drop):
    keep.helpful_count += drop.helpful_count            # accumulate counters
    keep.harmful_count += drop.harmful_count
    if not keep.learner_id:
        keep.learner_id = drop.learner_id               # prefer survivor metadata
    ...
    self._finalize_bullet(keep)                         # enforce single memory class + hash
```
* Only one memory class (semantic/episodic/procedural) is retained per bullet.
* Duplicate content merges into the newest/highest-signal bullet, keeping IDs stable.

#### Reinforce-over-clone curator heuristics

```python
# frontend/scripts/ace_components.py
existing = self.memory.find_similar_bullet(
    content, learner_id=learner_id, topic=topic, threshold=0.9
)
if existing:
    entry = delta.update_bullets.setdefault(existing.id, {"helpful": 0, "harmful": 0})
    entry["helpful"] += 1                              # increment helpful instead of cloning
    print(f"[Curator][Heuristic Reinforce] id={existing.id} content={content}")
    continue
```
* The curator now bumps `helpful` on semantically similar bullets instead of adding near-duplicates.
* Memory growth stabilises (few new bullets per session).

#### Safer logging previews

```python
# frontend/scripts/run_ace_agent.py
def _preview(text: Any, limit: int = 120) -> str:
    text = str(text)
    if len(text) <= limit:
        return text
    return f"{text[:limit]}… [len={len(text)}]"  # show head + full length
```
* Logs remain readable without losing the ability to gauge full message size.

### Comparison: Traditional ACE Framework vs. Proposed LMB-ACE Framework

| Area | ACE Framework | Noodeia (`frontend/scripts/`) |
|------|--------------------------|-------------------------------|
| Storage | JSON file shared by all sessions | Per-learner `AceMemoryState` node in Neo4j; JSON fallback only in local dev |
| Memory load cadence | Reloaded on every access | Single reload per turn (`_ace_memory_loaded` guard) |
| Dedup policy | Jaccard similarity kept first bullet it saw | Canonical survivor = highest helpful/ newest; merges transfer metadata and tags |
| Bullet taxonomy | Tags often carried `semantic/episodic/procedural` simultaneously | `_sync_strengths` enforces one class; tags stripped of class keywords |
| Curator heuristic | Always appended new bullet for each lesson | Reinforces existing bullets (`helpful += 1`) when content ≈ 90% similar |
| Latency profile | Single process, JSON I/O | Neo4j reads/writes with request cache; duplicate reads removed to cut I/O |
| Logging | Truncated strings without length info | `_preview()` prints prefix + `[len=…]`; easier to spot truncated contexts |
| Safety rails | No learner-specific guardrails | `/api/ai/chat` validates Supabase token + conversation ownership before invoking ACE |
| Documentation | Focused on baseline ACE internals | Adds per-learner workflow, Neo4j bootstrap, canonical dedup, reinforcement logic |

> **Migration tip**: If you copy these enhancements back upstream, ensure the `AceMemoryState` schema and hash uniqueness constraint exist (`CREATE CONSTRAINT ace_bullet_hash_unique IF NOT EXISTS FOR (b:AceBullet) REQUIRE b.hash IS UNIQUE;`) before deploying.

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
  export ACE_LLM_TEMPERATURE="0.2"          # optional override for ACE pipeline LLM
  export ACE_CURATOR_USE_LLM="false"         # disable LLM-based curation (use heuristic bullets)
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

## Observability & Testing

* **Expected logs** (when `npm run dev` forwards stderr):
  ```
  [ACE Memory] Loaded 8 bullets from Neo4j for learner=...
  [ACE Memory][Inject] Retrieved 6 bullets for question: ...
  [Curator][Heuristic Reinforce] id=... content=...
  [ACE Memory][Dedup Merge] kept=... merged=...
  [ACE Memory][Delta Add] id=...
  ```
  You should see exactly one “Loaded …” line per HTTP request; repeated “Reloaded …” lines indicate the scratch memoisation guard is missing.
* **CLI inspection**:
  ```bash
  cd frontend/scripts
  python3 analyze_ace_memory.py summary                 # overview
  python3 analyze_ace_memory.py search "fraction"       # filter by keyword
  ```
* **End-to-end smoke test**:
  ```bash
  npm run dev
  # In another terminal
  curl -s http://localhost:3001/api/ai/chat \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <SUPABASE_ACCESS_TOKEN>" \
    -d '{"message":"I keep messing up 1/2 + 1/3.","conversationId":"<session-id>"}'
  ```
  Expect the response JSON to include `metadata.scratch.ace_delta`.

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
