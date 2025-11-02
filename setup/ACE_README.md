#  Long Term Memory Based Self Evolving Agentic Context Engineering

### Visual Overview

```text
Traditional Memory Agent (Transcript Replay)

                +--------------------+
                | User Question      |
                | "I keep messing up |
                | 1/2 + 1/3."        |
                +--------------------+
                             |
                             v
         +--------------------------------------------+
         | Prompt Transcript                          |
         | (entire chat replayed; tutor restates the  |
         | fraction steps inside the prompt)          |
         +--------------------------------------------+
                             |
                             v
                      +--------------+
                      |   LLM Model  |
                      +--------------+
                             |
                             v
                +------------------------+
                |      Model's Output    |
                | (answers based only on |
                | this single session)   |
                +------------------------+
```

```text
ACE Framework (Baseline)

              +--------------------+
              |  User Question     |
              +---------+----------+
                        |
                        v
          +------------------------------+
          | Prompt = Transcript + Notes  |<-----------------+
          +------------------------------+                  |
                        |                                   |
                        v                          retrieved notes
                  +--------------+                          |
                  |   LLM Model  |                          |
                  +--------------+                          |
                        |                                   |
                        v                                   |
              +------------------------+                    |
              |    Model's Output      |                    |
              +------------------------+                    |
                        |                                   |
                        v                                   |
                  +------------+                            |
                  | Reflector  |                            |
                  | (writes a  |                            |
                  | plain recap|                            |
                  | of actions)|                            |
                  +-----+------+                            |
                        |                                   |
                        v                                   |
                  +------------+                            |
                  | Generator  |                            |
                  | (plans out |                            |
                  |  a detailed|                            |
                  |  approach) |                            |
                  +-----+------+                            |
                        |                                   |
                        v                                   |
                  +-------------+                           |
                  |  Curator    |                           |
                  | (turns that |                           |
                  | recap into  |                           |
                  | handy notes)|                           |
                  +-----+-------+                           |
                        |                                   |
                        +----------------+                  |
                                         |                  |
                                         v                  |
                                  +--------------------+    |
                                  |   Memory Store     |----+
                                  |  (fixed approach   |
                                  |  to update and     |
                                  |   delete notes)    |      
                                  +--------------------+
```

```text
LTMBSE ACE Framework (Proposed Method)

              +--------------------+
              |  User Question     |
              +---------+----------+
                        |
                        v
          +--------------------------------------------+
          | Prompt = Transcript + Per-Learner Notes   |<-------------+
          |      (user's memory across all chats)      |              |
          +--------------------------------------------+              |
                        |                                             |
                        v                                    retrieved notes
                  +--------------+                                    |
                  |   LLM Model  |                                    |
                  +--------------+                                    |
                        |                                             |
                        v                                             |
              +--------------------------+                            |
              | Model's Output (sanitised|                            |
              |      and logged)         |                            |
              +--------------------------+                            |
                        |                                             |
                        v                                             |
                  +------------+                                      |
                  | Reflector  |                                      |
                  | (explains  |                                      |
                  | in plain   |                                      |
                  | words what |                                      |
                  | happened)  |                                      |
                  +-----+------+                                      |
                        |                                             |
                        v                                             |
                  +------------+                                      |
                  | Generator  |                                      |
                  | (plans out |                                      |
                  | a detailed |                                      |
                  | approach)  |                                      |
                  +-----+------+                                      |
                        |                                             |
                        v                                             |
                  +------------+                                      |
                  |  Curator   |                                      |
                  | (adds that |                                      |
                  | lesson to  |                                      |
                  | long-term  |                                      |
                  |  memory)   |                                      |
                  +-----+------+                                      |
                        |                                             |
                        +----------------+                            |
                                         |                            |
                                         v                            |
                                  +------------------------+          |
                                  |  LTMB Memory Store     |----------+
                                  |  (Merge similar notes  |
                                  |  and proposed method   |
                                  |  to dynamically update | 
                                  |    and delete notes)   |
                                  +------------------------+
```

## Current agent memory system

Before ACE, the agent “memory” just appended every exchange to the prompt: the model re-read the entire conversation transcript on each turn. This yields short-lived context while the chat is active, but it comes with major limitations:

- **No consolidation** – Notes disappear once the thread ends; past sessions provide no signal for future ones.
- **Token bloat** – Long chats exhaust the model’s context window because raw transcripts are replayed verbatim.
- **Zero personalisation** – We can’t capture the user's information and preference in a reusable way.
- **No learning** – The agent never reflects on success/failure, so it can’t refine its strategy.

**Traditional Memory Agent example:** imagine a tutoring session where the student says, “I get confused when adding fractions with different denominators—please remind me that 1/2 becomes 3/6.” In the traditional setup, that fact only lives inside the running transcript. If the student opens a fresh conversation later, the prompt starts from scratch, the model never sees the earlier remark, and it has to rebuild the same context manually. That is the baseline this LTMB upgrade replaces.

The rest of this document explains how ACE replaces that transient transcript with a structured, per-learner memory that actively enriches prompts and learns over time.

## Baseline: Agentic Context Engineering

### Current Pruning Behaviour(Create and Delete)

The playbook is capped by `ACEMemory._prune_bullets()`. Each line below is commented so it is easy to follow:

```python
def _prune_bullets(self):
    now = datetime.now()  # snapshot once so every log line shares the same timestamp
    bullets_list = sorted(  # rank bullets by decay-aware score, then helpful count for tiebreaks
        self.bullets.values(),
        key=lambda b: (self._compute_score(b, now), b.helpful_count),
        reverse=True,
    )
    to_keep = set(b.id for b in bullets_list[: self.max_bullets])  # keep only the strongest window
    to_remove = set(self.bullets.keys()) - to_keep  # everything else falls outside the window
    for bullet_id in to_remove:
        bullet = self.bullets.pop(bullet_id)  # drop the bullet from the main dictionary
        try:
            score = self._compute_score(bullet, now)  # log the decay-aware score that triggered pruning
        except Exception:
            score = bullet.score()  # fallback for legacy bullets that predate the new counters
        print(
            f"[ACE Memory][Prune] Removing id={bullet_id} score={score:.3f} "
            f"helpful={bullet.helpful_count} harmful={bullet.harmful_count} "
            f"tags={bullet.tags} content={bullet.content}",
            flush=True,
        )
        for tag in bullet.tags:
            if bullet_id in self.categories[tag]:
                self.categories[tag].remove(bullet_id)  # keep the tag index in sync
        self._unregister_bullet(bullet_id)  # release the normalised hash so dedupe stays accurate
    if to_remove:
        print(f"[ACE Memory] Pruned {len(to_remove)} low-quality bullets")  # surface the retention event
```

Scoring comes from the component-strength equation implemented in `_compute_score`:

```python
def _component_score(self, strength, last_index, decay_key):
    if strength <= 0:
        return 0.0  # nothing to decay for this component
    decay_rate = self.decay_rates.get(decay_key, 0.0)
    base = max(0.0, min(1.0, 1.0 - decay_rate))  # clamp 1 - r between 0 and 1
    last_index = last_index if last_index is not None else self.access_clock  # default to current index
    t = max(self.access_clock - last_index, 0)  # accesses since the memory was last touched
    return strength * base**t  # S(1-r)^t / E(1-r)^t / P(1-r)^t
```

Behaviour summary:

1. **Ranking** – Bullets are sorted by the exponential decay score and then by raw helpful count to choose a survivor set.
2. **Retention window** – Only the first `max_bullets` survive; the rest are removed in one sweep, so the playbook never grows beyond the configured capacity.
3. **Tag cleanup** – Removed bullets are dropped from every tag bucket and the dedupe hash index, keeping retrieval and merge logic stable.
4. **Logging** – Every removal emits `[ACE Memory][Prune] …`; the runner forwards this to stderr so you can observe which entries leave the playbook.

`prune_threshold` does not participate in pruning; it filters retrieval results in `retrieve_relevant_bullets()`. Any new pruning strategy should document how these rules change.

This README represents the original, unmodified ACE workflow in this repository. Use it as the baseline before experimenting with custom pruning heuristics.

---

## Proposed Method: Long Term Memory Based Self Evolving Agentic Context Engineering

To deliver long-term personalisation we extend the baseline ACE stack with an LTMB-ACE layer. Authenticated Supabase users keep the same `learner_id`, so every new conversation reuses the existing AceMemory state. The Next.js API populates `scratch["learner_id"]`, and the LangGraph nodes read/write the corresponding Neo4j `AceMemoryState`, allowing prior lessons to inform future sessions even when `conversationId` changes.

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
existing, score = self.memory.find_similar_bullet(
    content,
    learner_id=learner_id,
    topic=topic,
    threshold=0.9,
    return_score=True,
)
if existing:
    entry = delta.update_bullets.setdefault(existing.id, {"helpful": 0, "harmful": 0})
    entry["helpful"] += 1  # increment helpful instead of cloning
    print(f"[Curator][Heuristic Reinforce] id={existing.id} score={score:.3f} content={content}")
    continue
```
* The curator now bumps `helpful` on semantically similar bullets instead of adding near-duplicates, and caps new bullet creation (`ACE_CURATOR_MAX_NEW`, default 2). When the cap is hit, lessons fall back to reinforcement and the overflow is logged as `Heuristic ReinforceOverflow`.
* Tags are normalised to snake_case and stripped of class keywords so retrieval filters stay consistent.

#### Sanitised outputs & telemetry

```python
# frontend/scripts/run_ace_agent.py
response = {
    "answer": _sanitize_answer(_clean_answer(output.get(\"result\", {}).get(\"answer\"))),
    ...
}
_log(f\"[ACE Runner] Memory delta summary new={ace_delta.get('num_new_bullets', 0)} updates={ace_delta.get('num_updates', 0)} removals={ace_delta.get('num_removals', 0)}\")
```
* `_sanitize_answer` trims stray numeric fragments (e.g., a lone `10`) before the response is sent.
* Each turn logs the totals for new bullets, reinforcements, and removals so latency regressions can be correlated with memory growth.

#### Reflection fallback

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

### Comparison: Traditional ACE Framework vs. Proposed LTMB-ACE Framework

| Area | ACE Framework | LTMBSE ACE Framework |
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

These modules were sourced from `../ace memory` and then extended here with the LTMB upgrades (Neo4j persistence, merge-on-write dedupe, curator reinforcement heuristics, cleanup tooling, and logging improvements) described in the following sections.

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

- `python3 analyze_ace_memory.py` – full stats/top/recent summaries.
- `python3 analyze_ace_memory.py search "<query>"` – semantic search.
- `python3 analyze_ace_memory.py export` – dump bullets to text for auditing.
- `python3 analyze_ace_memory.py cleanup [--dry-run]` – cluster near-duplicates and merge older bullets into the newest survivor (use `--dry-run` to preview without writing).

### Built-in cleanup command

```python
# Example: dry run
python3 analyze_ace_memory.py cleanup --dry-run

# Example: apply merges
python3 analyze_ace_memory.py cleanup
```

* Checks cosine similarity ≥ 0.90, keeps the newest/highest-signal bullet (based on created_at/helpful-harmful), and merges older entries into it via the same `_merge_bullet_into` helper used at runtime.
* After non-dry runs the tool saves the updated `ace_memory.json` (or Neo4j state if configured), so take a backup before large cleanups.

## Observability & Testing

* **Expected logs** (when `npm run dev` forwards stderr):
  ```
  [ACE Memory] Loaded N bullets from Neo4j for learner=...
  [ACE Memory][Inject] Retrieved K bullets for question: ...
  [Curator][Heuristic Reinforce] id=... score=0.9xx content=...
  [ACE Memory][Delta Merge] kept=... merged_score=0.9xx
  [ACE Runner] Memory delta summary new=1 updates=4 removals=0
  ```
  You should see exactly one “Loaded …” line per HTTP request; repeated “Reloaded …” lines indicate the scratch memoisation guard is missing. The delta summary should show mostly updates with new ≤ 2 per turn.
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
* Sanitised replies should no longer emit isolated numeric lines (for example, a lone `10`). If they do, review `_sanitize_answer` and ensure premature reveals are still masked in the tutoring plan.

| Command | Purpose |
|---------|---------|
| `python3 analyze_ace_memory.py` | Overview, categories, top bullets |
| `python3 analyze_ace_memory.py search "division"` | Keyword search |
| `python3 analyze_ace_memory.py export` | Export bullets to text |
| `python3 analyze_ace_memory.py interactive` | Guided CLI exploration |
| `python3 analyze_ace_memory.py cleanup [--dry-run]` | Merge older duplicates into newest survivor |
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
