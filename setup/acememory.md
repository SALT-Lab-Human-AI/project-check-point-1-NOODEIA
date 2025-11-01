# ACE Memory Architecture

This note tracks the baseline ACE implementation that shipped with the upstream
`ace memory` project and the enhanced variant now running inside
`project-check-point-1-noodeia`. Use it as the canonical reference when you
inspect logs, tweak hyper-parameters, or document future experiments.

---

## 1. Baseline (Upstream) Behaviour

* **Scoring** – Each bullet relied on the simple helpful ratio
  `helpful_count / (helpful_count + harmful_count)` with a neutral prior of
  `0.5` for untouched entries.
* **Pruning** – `_prune_bullets()` sorted by the ratio and helpful count,
  retained the top `max_bullets`, and deleted everything else. No decay or
  personalisation metadata was considered.
* **Deduplication** – Only exact string matches were skipped when new bullets
  were added; there was no merge path for semantically similar items.
* **Metadata** – Bullets had `tags`, helpful counters, and timestamps, but no
  notion of learner, topic, or memory type.

This approach was easy to reason about but tended to forget durable strategies
as soon as the helpful ratio dipped below competing entries.

---

## 2. Enhanced Memory (Current Repo)

### 2.1 Scoring Formula

We now evaluate each bullet with an exponential decay model that mirrors the
semantic/episodic/procedural split in human memory:

$$\mathrm{Score_{memory}} = S(1-r_{\mathrm{semantic}})^{t_{\mathrm{semantic}}} + E(1-r_{\mathrm{episodic}})^{t_{\mathrm{episodic}}} + P(1-r_{\mathrm{procedural}})^{t_{\mathrm{procedural}}}$$

* `S` / `E` / `P` are the per-component base strengths stored on the bullet.
* `r_*` comes from `ACEMemory(decay_rates=...)`, clamped to `[0, 1]`.
* `t_*` counts **access events** (not wall-clock time) since the component was
  last retrieved; `_touch_bullet()` advances a global `access_clock` and stamps
  the indices.

### 2.2 Metadata & Personalisation

* Bullets now carry `memory_type`, `learner_id`, `topic`, and optional
  `concept` hints. Tags are auto-synchronised so retrieval queries can filter
  for `["semantic"]`, `["episodic"]`, or `["procedural"]`.
* `ACEMemory._is_duplicate()` compares the normalised content hash **and** the
  `(memory_type, learner_id, topic)` tuple, letting the store keep separate
  versions per learner while deduping identical knowledge.

### 2.3 Deduplication & Pruning

```python
def _deduplicate_bullets(self):
    ...  # Jaccard similarity over text
    if similarity > self.dedup_threshold:
        self._register_bullet(primary)  # Re-register hash after the merge
        print(f"[ACE Memory][Dedup Merge] kept={primary.id} merged={other.id}")
        to_remove.add(other.id)
```

* The merge keeps the higher-scoring bullet, accumulates helpful counters, and
  propagates learner/topic metadata.
* When the retention cap is hit, `_prune_bullets()` ranks by the decay-aware
  score plus `helpful_count`. Every removal logs the bullet ID, score,
  memory type, learner, topic, and tags before unregistering it from the tag
  index and hash cache.

### 2.4 Curator & Pipeline Updates

* `Curator.curate()` now accepts `learner_id` / `topic`, builds prompt context
  with the retrieved bullets, and records those attributes on every heuristic
  bullet. Unknown keyword arguments are ignored so legacy callers remain
  compatible.
* `_lessons_to_delta()` converted from a static method to an instance helper and
  injects metadata on every deterministic bullet. The fallback path is used by
  default (`ACE_CURATOR_USE_LLM=false`) and whenever the Gemini response cannot
  be parsed as JSON.
* All add/merge/remove/dedup/prune operations emit structured log lines so the
  terminal shows the exact evolution of `ace_memory.json` during `npm run dev`.

### 2.5 Retrieval Ordering

`ACEMemory.retrieve_relevant_bullets()` boosts procedural memories first, then
episodic, then semantic while also rewarding learner/topic matches. Accessing a
bullet updates its `*_access_index`, which in turn slows decay for frequently
used strategies.

---

## 3. Configuration Cheatsheet

```python
memory = ACEMemory(
    memory_file="frontend/scripts/ace_memory.json",
    max_bullets=120,                      # raise cap if you need a larger playbook
    dedup_threshold=0.82,                 # tighten to merge more aggressively
    decay_rates={"episodic": 0.07},       # forget episodic bullets slightly faster
)
```

* Set `ACE_CURATOR_USE_LLM=true` to re-enable Gemini-based curation once the
  JSON schema is stable; the system will retry three times and then fall back to
  the deterministic path, so no lessons are lost.
* Override `GEMINI_MODEL` / `ACE_LLM_TEMPERATURE` to keep the curator in sync
  with the primary solver.

---

## 4. Observability & Testing

* When the Next.js server spawns the runner you should see lines such as:
  ```
  [ACE Memory][Inject] Retrieved 6 bullets for question: ...
  [ACE Memory][Bullet 1] id=... score=... type=procedural learner=mia topic=fraction_addition tags=[...]
  [ACE Pipeline][Lesson 1] type=success tags=['common_denominator'] content=...
  [Curator][Heuristic New 1] type=episodic tags=['misconception', ...] content=...
  [ACE Memory][Dedup Merge] kept=... merged=...
  [ACE Memory][Prune] Removing id=... score=...
  ```
* To inspect the stored bullets directly:
  ```bash
  cd frontend/scripts
  python3 analyze_ace_memory.py summary
  python3 analyze_ace_memory.py search "fraction addition"
  ```
* Integration smoke test (requires `GEMINI_API_KEY` and the repo’s `.env.local`)
  ```bash
  npm run dev
  # In another terminal
  curl -s http://localhost:3001/api/ai/chat \
    -H "Content-Type: application/json" \
    -d '{"message":"I keep messing up 1/2 + 1/3."}'
  ```

Document every additional tweak back in this file so future sessions inherit the
full context.
