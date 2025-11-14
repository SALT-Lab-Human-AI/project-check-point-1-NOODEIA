# Telemetry & Observability - Logging Architecture

**Purpose:** Document what's logged in the database, how to debug test cases, and observability patterns across the Noodeia platform.

**Logging Architecture:** Console-based (development and production)
**Database:** Neo4j AuraDB for all application data
**Future State:** Robust abnormal activity detection in Neo4j database

---

## 1. Logging Architecture Overview

### Current Implementation

**Logging Stack:**
- **Frontend/API Routes:** `console.log`, `console.error`, `console.warn` (JavaScript)
- **Python ACE Agent:** `stderr` writes via `_log()` function
- **Database Events:** Implicitly logged via Neo4j node/relationship creation
- **Real-Time:** Pusher broadcasts (no persistent logs)

**Log Destinations:**
- **Development:** Browser console + Terminal (Next.js dev server)
- **Production:** Server logs (Railway/Render) - same console-based pattern
- **Persistence:** Neo4j database (application state, not request logs)

---

## 2. What Gets Logged - By Feature

### Feature 1: AI Chat (1-on-1 Tutoring)

**Location:** `frontend/app/api/ai/chat/route.js`

**Logged Events:**

| Event | Log Type | Line | Example Output |
|-------|----------|------|----------------|
| Route started | Info | 11 | `ACE chat route started` |
| GEMINI_API_KEY missing | Error | 41 | `GEMINI_API_KEY is not configured` |
| Python subprocess stderr | Info | 102-103 | `[ACE Agent logs]` |
| ACE agent error | Error | 147 | `ACE chat error: [error details]` |
| Response ready | Info | - | (No explicit log) |

**Python ACE Agent Logs** (`frontend/scripts/run_ace_agent.py`):
```python
def _log(message: str) -> None:
    """Write structured logs to stderr so Next.js shows workflow."""
    process.stderr.write(f"[ACE Agent] {message}\n")
    process.stderr.flush()
```

**Example stderr Output:**
```
[ACE Agent] Received input with 2 messages
[ACE Agent] Building ACE graph...
[ACE Agent] Router selected mode: cot
[ACE Agent] Solver executing...
[ACE Agent] ACE learning node updating memory...
[ACE Agent] Response complete
```

**Timing Instrumentation:** None currently (add if needed)

**What's NOT Logged:**
- Request/response size
- User ID or session ID
- Conversation history length
- ACE memory retrieval results
- LangGraph node execution times

---

### Feature 2: Group Chat with @ai Mentions

**Location:** `frontend/app/api/groupchat/[groupId]/messages/route.js`

**Logged Events:**

| Event | Log Type | Line | Format | Example |
|-------|----------|------|--------|---------|
| Message content inspection | Debug | 107-108 | `console.log` | Message content for @ai detection |
| @ai detected | Info | 111 | `🤖` | `🤖 @ai detected, processing AI response` |
| Gemini API call started | Info | 159 | `🤖` | `🤖 Calling Gemini...` |
| Gemini API responded | Info | 161 | `🤖` | `🤖 Gemini responded` |
| AI message persisted | Info | 206 | `🤖` | `🤖 AI response sent via Pusher` |
| Background AI error | Error | 211 | `🤖` | `🤖 Background AI error: [error]` |

**Group Chat AI Route** (`frontend/app/api/groupchat/[groupId]/ai/route.js`):

**Comprehensive Timing Logs:**

| Metric | Line | Format | Purpose |
|--------|------|--------|---------|
| Request start | 14 | `const startTime = Date.now()` | Total request time baseline |
| Parent fetch time | 38-40 | `🤖 Parent message fetched in Xms` | Neo4j query performance |
| Thread fetch time | 48-50 | `🤖 Thread messages fetched in Xms` | Context loading performance |
| Gemini API time | 88-90 | `🤖 Gemini API responded in Xms` | External API latency |
| Neo4j persist time | 117-119 | `🤖 AI message created in Neo4j in Xms` | Write performance |
| Pusher broadcast time | 122-124 | `🤖 Pusher broadcast completed in Xms` | Real-time delivery latency |
| Total request time | 126 | `🤖 Total AI request time: Xms` | End-to-end performance |

**Example Console Output:**
```
🤖 AI request started
🤖 Parent message fetched in 45ms
🤖 Thread messages fetched in 120ms
🤖 Gemini API responded in 3450ms
🤖 AI message created in Neo4j in 85ms
🤖 Pusher broadcast completed in 12ms
🤖 Total AI request time: 3712ms
```

**Performance Baseline:**
- Parent fetch: 20-100ms (depends on message count)
- Thread fetch: 50-200ms (depends on thread depth)
- Gemini API: 2000-8000ms (variable, can spike)
- Neo4j write: 50-150ms
- Pusher: 10-50ms
- **Total:** 5-10 seconds typical, **max 10 minutes** allowed

---

### Feature 3: Quiz System

**Location:** `frontend/app/api/quiz/submit/route.js`

**Logged Events:**

| Event | Log Type | Line | Format | Example |
|-------|----------|------|--------|---------|
| Legendary node debug | Debug | 26-30 | `🔍` | `🔍 LEGENDARY NODE DEBUG:` |
| Score details | Debug | 27-28 | Console | `score: 10 \| type: number` |
| Equality check | Debug | 29-30 | Console | `score === totalQuestions? true` |
| Legendary assigned | Info | 38 | `✅` | `✅ LEGENDARY assigned!` |
| Quiz submit error | Error | 153 | Console | `Quiz submit error: [error]` |

**Example Debug Output (Perfect Score):**
```
🔍 LEGENDARY NODE DEBUG:
  score: 10 | type: number
  totalQuestions: 10 | type: number
  score === totalQuestions? true
  score == totalQuestions? true
  ✅ LEGENDARY assigned!
```

**What's Logged in Neo4j:**
```cypher
(:User)-[:COMPLETED]->(:QuizSession {
  id: "quiz-session-id",
  userId: "user-id",
  score: 10,
  totalQuestions: 10,
  nodeType: "legendary",
  xpEarned: 27.5,
  streak: 10,
  completedAt: datetime()
})
```

**What's NOT Logged:**
- Individual answer correctness
- Time taken per question
- Question IDs answered
- Animation performance metrics

---

### Feature 4: Gamification (XP & Leveling)

**Location:** `frontend/app/api/user/xp/route.js`

**Logged Events:**

| Event | Log Type | Line | Example |
|-------|----------|------|---------|
| XP fetch error | Error | 98-102 | `Error fetching XP: [error]` |
| XP update error | Error | 154-158 | `Error updating XP: [error]` |

**⚠️ Notable Gap:** No logging for successful XP operations!

**What's Logged in Neo4j:**
```cypher
(:User {
  id: "user-id",
  xp: 150.5,        // Updated value
  level: 3,         // Calculated from xp
  updatedAt: datetime()
})
```

**What's NOT Logged:**
- XP delta per transaction (only total)
- Source of XP (quiz, chat, kanban)
- Level-up events
- XP calculation timing

**Recommended Addition:**
```javascript
// Line 60 (after SET query)
console.log(`💎 XP awarded: +${xpGained} → Total: ${newXp} (Level ${newLevel})`)
```

---

### Feature 5: Kanban Task Management

**Location:** `frontend/app/api/kanban/tasks/route.js`

**Logged Events:**

| Event | Log Type | Line | Example |
|-------|----------|------|---------|
| Task fetch error | Error | 56 | `Error fetching tasks: [error]` |
| Task creation error | Error | 118 | `Error creating task: [error]` |

**What's Logged in Neo4j:**
```cypher
(:User)-[:HAS_TASK]->(:Task {
  id: "task-id",
  title: "Task title",
  description: "Description",
  status: "todo" | "inprogress" | "done",
  priority: "low" | "medium" | "high",
  createdAt: datetime(),
  completedAt: datetime() | null,
  createdBy: "user-id"
})
```

**What's NOT Logged:**
- Task state transitions (todo → inprogress → done)
- XP awards for completion
- Time spent in each status
- Task completion rate per user

---

## 3. Database Logging - What's Persisted in Neo4j

### User Activity Data

**User Profile:**
```cypher
(:User {
  id: "supabase-user-id",
  email: "user@example.com",
  name: "User Name",
  iconType: "emoji" | "initials",
  iconEmoji: "🎮",
  iconColor: "#FF5733",
  xp: 150.5,
  level: 3,
  createdAt: datetime(),
  updatedAt: datetime()
})
```

**AI Tutor Conversations:**
```cypher
(:User)-[:HAS]->(:Session {
  id: "session-id",
  title: "Conversation title",
  created_at: datetime(),
  updated_at: datetime()
})

(:Session)-[:OCCURRED]->(:Chat {
  id: "chat-id",
  role: "user" | "assistant",
  content: "Message content",
  created_at: datetime()
})

(:Chat)-[:NEXT]->(:Chat)  // Sequential message chain
```

**Group Chat Messages:**
```cypher
(:GroupChat {
  id: "group-id",
  name: "Group name",
  accessKey: "unique-key",
  createdBy: "user-id",
  createdAt: datetime()
})

(:GroupChat)-[:CONTAINS]->(:Message {
  id: "message-id",
  content: "Message text",
  createdBy: "user-id" | "ai_assistant",
  createdAt: datetime(),
  edited: boolean,
  editedAt: datetime() | null,
  parentId: "parent-message-id" | null,
  isAI: boolean
})

(:Message)-[:REPLY_TO]->(:Message)  // Thread relationships
(:User)-[:POSTED]->(:Message)
```

**Quiz Sessions:**
```cypher
(:User)-[:COMPLETED]->(:QuizSession {
  id: "session-id",
  userId: "user-id",
  score: 10,
  totalQuestions: 10,
  nodeType: "common" | "rare" | "legendary",
  xpEarned: 27.5,
  streak: 10,
  completedAt: datetime()
})

(:User)-[:HAS_QUIZ_PROGRESS]->(:QuizProgress {
  userId: "user-id",
  totalQuizzes: 15,
  bestStreak: 10,
  totalXPFromQuiz: 150,
  commonCompleted: 5,
  rareCompleted: 8,
  legendaryCompleted: 2
})
```

**Kanban Tasks:**
```cypher
(:User)-[:HAS_TASK]->(:Task {
  id: "task-id",
  title: "Complete homework",
  description: "Math problems 1-10",
  status: "done",
  priority: "high",
  createdAt: datetime(),
  completedAt: datetime(),
  createdBy: "user-id"
})
```

**Markdown Notes:**
```cypher
(:Session)-[:HAS_NOTES]->(:MarkdownNote {
  conversationId: "session-id",
  content: "# Notes\n\nMarkdown content...",
  lastModified: datetime()
})
```

### Future: Robust Neo4j Monitoring System

**Planned Abnormal Activity Detection:**

We will implement a comprehensive monitoring system for the Neo4j database to detect and alert on:

1. **Data Integrity Issues:**
   - Orphaned nodes (User without email, Session without owner)
   - Broken relationship chains (:NEXT relationships with gaps)
   - Duplicate user records
   - XP/Level inconsistencies

2. **Performance Anomalies:**
   - Slow queries (>100ms for simple reads)
   - Connection pool exhaustion
   - Write lock contention
   - Large transaction rollbacks

3. **Business Logic Violations:**
   - Users with negative XP
   - Levels not matching XP formula
   - Quiz sessions with impossible scores
   - Messages without creators

4. **Security Events:**
   - Unauthorized group chat access attempts
   - Excessive failed login attempts
   - Unusual XP gain patterns (potential exploits)
   - Mass data deletion attempts

**Implementation Strategy:**
- Periodic Cypher queries to detect anomalies
- Automated alerts for critical violations
- Daily health check reports
- Audit trail for sensitive operations

---

## 4. Error Handling Patterns

### Standard API Route Pattern

**Used Across All API Routes:**
```javascript
export async function POST(request) {
  try {
    // Main logic here
    const result = await performOperation()
    return NextResponse.json(result, { status: 200 })

  } catch (error) {
    console.error('Context-specific error:', error)
    return NextResponse.json(
      { error: 'User-friendly message' },
      { status: 500 }
    )
  }
}
```

**Key Files Using This Pattern:**
- `frontend/app/api/ai/chat/route.js`
- `frontend/app/api/quiz/submit/route.js`
- `frontend/app/api/user/xp/route.js`
- `frontend/app/api/groupchat/[groupId]/messages/route.js`
- `frontend/app/api/kanban/tasks/route.js`
- All other API routes (20+ files)

**Error Response Format:**
```json
{
  "error": "User-friendly error message"
}
```

**Client-Side Handling:**
```javascript
// Frontend error display pattern
if (!response.ok) {
  const data = await response.json()
  alert(data.error || 'An error occurred')
}
```

---

### Neo4j Error Handling

**Connection Errors** (`frontend/lib/neo4j.js` lines 18-25):
```javascript
if (!uri || !username || !password) {
  console.error('Neo4j connection failed: Missing configuration', {
    hasUri: !!uri,
    hasUsername: !!username,
    hasPassword: !!password
  })
}
```

**Query Errors** (All service files):
```javascript
const session = driver.getSession()
try {
  const result = await session.run(cypherQuery, params)
  return processResult(result)
} catch (error) {
  console.error('Neo4j query error:', error)
  throw error
} finally {
  await session.close()  // Always close session
}
```

**Session Management:**
- All queries properly close sessions in `finally` blocks
- Connection pool size: 50 (neo4j.js:33)
- No session leak detection currently

---

### Python ACE Agent Error Handling

**Subprocess Execution** (`frontend/app/api/ai/chat/route.js` lines 86-156):
```javascript
py.on('close', (code) => {
  if (code !== 0) {
    // Try to parse stderr as JSON for structured errors
    try {
      const errorData = JSON.parse(err)
      reject(new Error(errorData.error || 'ACE agent failed'))
    } catch {
      reject(new Error(err || `ACE agent exited with code ${code}`))
    }
  } else {
    resolve(out)
  }
})
```

**Python Exception Handling** (`frontend/scripts/run_ace_agent.py`):
```python
try:
    # Execute agent
    result = app.invoke(payload, config=config)
except Exception as e:
    # Return structured error
    print(json.dumps({
        "error": str(e),
        "type": type(e).__name__
    }))
    sys.exit(1)
```

---

## 5. Debug Workflows - Step-by-Step

### Workflow 1: "AI Not Responding" Debug Process

**Symptom:** User sends message, no AI response appears

**Debug Steps:**

1. **Check Browser Console** (Client-side):
   ```
   Look for: Fetch errors, timeout errors, JSON parse errors
   Location: DevTools → Console tab
   ```

2. **Check Terminal Logs** (Server-side):
   ```
   Look for: "ACE chat route started"
   If missing: API route not hit, check frontend code
   ```

3. **Check Python Subprocess Logs**:
   ```
   Look for: [ACE Agent] logs in terminal
   If missing: Python not spawning, check python3 in PATH
   ```

4. **Check GEMINI_API_KEY**:
   ```bash
   # In .env.local
   grep GEMINI_API_KEY .env.local
   # Should show: GEMINI_API_KEY=sk-...
   ```

5. **Check Python Dependencies**:
   ```bash
   cd frontend
   pip3 list | grep -E "langgraph|langchain|google"
   # Should show all required packages
   ```

6. **Check ACE Agent Execution**:
   ```bash
   cd frontend/scripts
   python3 run_ace_agent.py <<'EOF'
   {"messages":[{"role":"user","content":"Test"}]}
   EOF
   # Should return JSON with answer
   ```

7. **Check Neo4j Connection**:
   ```javascript
   // Console should show if Neo4j fails
   Look for: "Neo4j connection failed"
   ```

**Common Causes:**
- GEMINI_API_KEY missing or invalid (40% of cases)
- Python dependencies not installed (30%)
- Neo4j credentials wrong (15%)
- Network timeout (10%)
- Python syntax error (5%)

---

### Workflow 2: "@ai Mention Not Triggering" Debug Process

**Symptom:** User types @ai in group chat, but AI doesn't respond

**Debug Steps:**

1. **Check Message Content**:
   ```
   Console: Look for "🤖 @ai detected, processing AI response"
   File: frontend/app/api/groupchat/[groupId]/messages/route.js line 111
   ```

2. **Verify Server-Side Detection**:
   ```javascript
   // Line 110
   if (content.includes('@ai')) {
     console.log('🤖 @ai detected...')  // Should see this
   }
   ```

3. **Check Async Processing Logs**:
   ```
   Look for: "🤖 Calling Gemini..." (line 159)
   If missing: triggerAIResponse() not executing
   ```

4. **Check Gemini API Logs**:
   ```
   Look for: "🤖 Gemini responded" (line 161)
   If missing: Gemini API call failed
   ```

5. **Check Pusher Broadcast**:
   ```
   Look for: "🤖 AI response sent via Pusher" (line 206)
   If missing: Pusher broadcast failed
   ```

6. **Check ThreadPanel Subscription** (Client-side):
   ```javascript
   // Frontend: components/ThreadPanel.jsx lines 35-50
   // Should bind to MESSAGE_SENT event
   ```

**Common Causes:**
- @ai not detected: Case sensitivity or spacing issues
- Gemini timeout: No timeout currently, can hang
- Pusher credentials wrong: Check PUSHER_SECRET vs NEXT_PUBLIC_PUSHER_KEY
- ThreadPanel not subscribed: Check channel name matches

---

### Workflow 3: "XP Not Awarded" Debug Process

**Symptom:** User completes action but XP doesn't increase

**Debug Steps:**

1. **Identify XP Source:**
   - AI Chat: Check `handleXpGain()` in AIAssistantUI.jsx line 253
   - Quiz: Check quiz/submit/route.js line 126
   - Kanban: Check KanbanBoard.tsx line 243

2. **Check XP API Call** (Network Tab):
   ```javascript
   POST /api/user/xp
   Request: { userId: "...", xpGained: 1.42 }
   Status: Should be 200
   ```

3. **Check API Response**:
   ```json
   {
     "userId": "user-id",
     "xp": 150.5,
     "level": 3,
     "levelProgress": 0.54,
     "leveledUp": false
   }
   ```

4. **Check Neo4j Update**:
   ```cypher
   MATCH (u:User {id: "user-id"})
   RETURN u.xp, u.level, u.updatedAt
   // updatedAt should be recent
   ```

5. **Check Frontend State Update**:
   ```javascript
   // Should see gamification bar update
   // Check setCurrentUser() called with new XP
   ```

**Common Causes:**
- API call fails silently: Check catch block
- Neo4j transaction fails: Check session closed properly
- Frontend state not updated: Check response parsing
- Race condition: Multiple XP awards simultaneously

---

### Workflow 4: "Legendary Node Not Assigned" Debug Process

**Symptom:** User gets 10/10 correct but receives "rare" node instead of "legendary"

**Debug Steps:**

1. **Check Console for Debug Logs**:
   ```
   Look for: "🔍 LEGENDARY NODE DEBUG:"
   Should show: score === totalQuestions? true
   ```

2. **Verify Score Calculation**:
   ```javascript
   // frontend/app/quiz/page.tsx line 253
   const finalScore = correct ? score + 1 : score
   // Should be 10 for perfect score
   ```

3. **Check API Request Payload**:
   ```javascript
   // Network tab → quiz/submit request body
   {
     "score": 10,  // Should be 10, not 9
     "totalQuestions": 10
   }
   ```

4. **Verify Node Type Logic**:
   ```javascript
   // quiz/submit/route.js lines 33-38
   if (score === totalQuestions) {  // Exact equality
     nodeType = 'legendary'
   }
   ```

5. **Check Neo4j Persistence**:
   ```cypher
   MATCH (qs:QuizSession)
   WHERE qs.score = 10 AND qs.totalQuestions = 10
   RETURN qs.nodeType
   // Should show 'legendary'
   ```

**Root Cause if Still Broken:**
- React state async issue: Check finalScore calculation
- Type coercion: Check both values are numbers
- Logic order wrong: Check legendary checked BEFORE rare

**Fixed On:** October 30, 2025 (React state timing bug fix)

---

## 6. Timing Instrumentation Details

### Group Chat AI - Performance Breakdown

**File:** `frontend/app/api/groupchat/[groupId]/ai/route.js`

**Instrumentation Points:**

```javascript
const startTime = Date.now()  // line 14

// Step 1: Fetch parent message
const result1 = await session.run(parentQuery)
const t1 = Date.now()
console.log(`🤖 Parent message fetched in ${t1 - startTime}ms`)  // line 40

// Step 2: Fetch thread messages
const result2 = await session.run(threadQuery)
const t2 = Date.now()
console.log(`🤖 Thread messages fetched in ${t2 - t1}ms`)  // line 50

// Step 3: Call Gemini API
const aiResponse = await geminiService.chat(prompt)
const t3 = Date.now()
console.log(`🤖 Gemini API responded in ${t3 - t2}ms`)  // line 90

// Step 4: Persist AI message to Neo4j
await session.run(createMessageQuery)
const t4 = Date.now()
console.log(`🤖 AI message created in Neo4j in ${t4 - t3}ms`)  // line 119

// Step 5: Broadcast via Pusher
await pusher.broadcast(...)
const t5 = Date.now()
console.log(`🤖 Pusher broadcast completed in ${t5 - t4}ms`)  // line 124

// Total
console.log(`🤖 Total AI request time: ${Date.now() - startTime}ms`)  // line 126
```

**Example Performance Breakdown:**
```
🤖 Parent message fetched in 45ms       (6%)
🤖 Thread messages fetched in 120ms    (17%)
🤖 Gemini API responded in 3450ms      (71%)
🤖 AI message created in Neo4j in 85ms (12%)
🤖 Pusher broadcast completed in 12ms   (2%)
🤖 Total AI request time: 3712ms       (100%)
```

**Performance Insights:**
- Gemini API dominates latency (70-80% of total time)
- Neo4j operations fast (<150ms typically)
- Pusher nearly instant (<50ms)
- Thread context loading scales with message count

**Red Flags:**
- Parent fetch >500ms: Database performance issue
- Thread fetch >1000ms: Too many messages, need pagination
- Gemini >10s: API throttling or complex query
- Neo4j persist >500ms: Write lock contention
- Total >10 minutes: System degraded, investigate immediately

---

### Prompts System Verification Timing

**File:** `unitTests/prompts/verify_all.sh`

**Purpose:** Verify all system prompts are correctly imported and accessible to the AI agent.

**Usage:**
```bash
cd unitTests/prompts/
./verify_all.sh
```

**What Gets Tested:**
1. **ACE Components Test** - Verifies REFLECTOR_PROMPT and CURATOR_PROMPT imports
2. **LangGraph Utilities Test** - Verifies all reasoning prompts (COT, TOT, REACT, CYPHER, QA)
3. **LangGraph Agent Test** - Verifies build_ace_graph() works with all dependencies
4. **API Simulation Test** - Simulates actual API environment and import resolution

**Expected Output:**
```
╔════════════════════════════════════════════════════════════════════╗
║         PROMPTS MIGRATION - COMPLETE VERIFICATION                  ║
╚════════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Test 1: Running Integration Tests...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ ACE Components: REFLECTOR_PROMPT and CURATOR_PROMPT accessible
✅ LangGraph Utils: All reasoning prompts accessible
✅ LangGraph Agent: build_ace_graph() ready
✅ Run ACE Agent: Entry point ready

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Test 2: Running API Simulation...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Successfully imported run_ace_agent.main
✅ All dependencies accessible
✅ All prompts have correct placeholders

╔════════════════════════════════════════════════════════════════════╗
║                      VERIFICATION SUMMARY                          ║
╚════════════════════════════════════════════════════════════════════╝

Tests Passed: 4 / 4

🎉 ALL TESTS PASSED!
✅ The prompts migration is working correctly.
✅ The AI agent is ready for use.
✅ No issues detected.
```

**When to Run:**
- After modifying any prompt file in `prompts/` directory
- After changing import paths in `ace_components.py` or `langgraph_utile.py`
- Before deploying to production
- After updating Python dependencies
- As part of pre-deployment checklist

**Execution Time:** ~3-5 seconds for all tests

**What It Verifies:**
- Prompts are accessible in runtime context (not just import-time)
- All placeholders exist in prompts (e.g., `{trace}`, `{schema}`)
- Import paths resolve correctly from `frontend/scripts/` working directory
- No circular dependency issues
- Python can import all required modules

**Failure Scenarios:**
- ❌ Import ModuleNotFoundError: sys.path not configured correctly
- ❌ Missing placeholder: Prompt content corrupted or incomplete
- ❌ API simulation fails: Working directory mismatch with production

**Debug Location:** `unitTests/prompts/test_prompts_integration.py` and `unitTests/prompts/test_api_simulation.py`

---

## 7. ACE Memory System Logging

### Memory Operations Logged

**File:** `frontend/scripts/ace_memory.py`

**Logged Events:**

| Operation | Log Format | Line | Example |
|-----------|-----------|------|---------|
| Bullet deduplication merge | `[ACE Memory][Dedup Merge]` | ~450 | `kept=bullet-123 merged=bullet-456` |
| Bullet pruning | `[ACE Memory][Prune]` | ~520 | Full score/helpful/harmful/tags |
| Context injection | `[ACE Memory][Inject]` | - | (Not explicitly logged) |
| Delta update | `[ACE Memory][Delta]` | - | (Not explicitly logged) |

**Deduplication Example:**
```
[ACE Memory][Dedup Merge] kept=bullet-abc123 merged=bullet-def456
Reason: Semantic similarity 0.92 > threshold 0.85
```

**Pruning Example:**
```
[ACE Memory][Prune] Removing bullet-xyz789:
  score: 0.15
  helpful: 1
  harmful: 5
  tags: ['multiplication', 'strategies']
Reason: Score below retention threshold
```

### ACE Learning Pipeline Logs

**File:** `frontend/scripts/langgraph_agent_ace.py`

**Node Execution Logs:**
- Router node: Mode selection (cot, tot, react)
- Planner node: Solver parameter configuration
- Solver node: ACE context injection + Gemini call
- Critic node: Answer extraction and cleaning
- ACE learning node: Memory reflection and curation

**To Enable Verbose Logging:**
```bash
export ACE_DEBUG=1
# Then run agent
```

### Memory Inspection Commands

**View Memory Summary:**
```bash
cd frontend/scripts
python3 analyze_ace_memory.py summary
```

**Output:**
```
=== ACE Memory Summary ===
Total bullets: 45
Total helpful: 123
Total harmful: 12
Average score: 0.68
Top tags: ['multiplication', 'fractions', 'problem-solving']
```

**Search Memory:**
```bash
python3 analyze_ace_memory.py search "multiplication"
```

**Export Memory:**
```bash
python3 analyze_ace_memory.py export memory_backup.json
```

---

## 8. Pusher Real-Time Event Logging

**File:** `frontend/services/pusher.service.js`

**Currently:** No explicit logging for broadcasts

**Events Broadcasted:**

| Event Name | Payload | Trigger |
|------------|---------|---------|
| `MESSAGE_SENT` | `{ message: {...} }` | New group chat message |
| `MESSAGE_EDITED` | `{ message: {...} }` | Message edited |
| `MESSAGE_DELETED` | `{ messageId: "..." }` | Message deleted |
| `TYPING_START` | `{ userId, userName }` | User typing |
| `TYPING_STOP` | `{ userId }` | User stopped typing |

**Client-Side Subscription Logging:**

```javascript
// GroupChat.jsx line 56
useEffect(() => {
  const channel = pusher.subscribe(`group-${groupId}`)

  channel.bind('MESSAGE_SENT', (data) => {
    console.log('📨 Pusher MESSAGE_SENT received:', data)  // Not currently logged
    // Add message to state
  })
})
```

**Recommended Addition:**
```javascript
// In pusher.service.js broadcast()
console.log(`📡 Pusher broadcast: ${eventName} to ${channelName}`)
```

---

## 9. Authentication Logging

**File:** `frontend/components/AIAssistantUI.jsx`

**Logged Events:**

| Event | Log Type | Line | Example |
|-------|----------|------|---------|
| Auth check start | None | - | (Not logged) |
| Neo4j user lookup | None | - | (Not logged) |
| User creation | None | 115 | (Only on error) |
| Auth success | None | - | (Not logged) |
| Auth failure | Error | 121, 129 | `Failed to check auth: [error]` |
| Database user fetch fail | Error | 148 | `Failed to fetch user data: [error]` |

**Supabase Auth Events:**
```javascript
// Line 135
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event)  // Not currently logged
})
```

**Recommended Additions:**
```javascript
// Line 96
console.log('🔐 Auth check started for session')

// Line 110
console.log('🔐 Neo4j user found:', userData.email)

// Line 115
console.log('🔐 Creating missing Neo4j user:', session.user.email)
```

---

## 10. Database Query Patterns (No Explicit Logging)

### Current State

**Service Files with Neo4j Queries:**
- `frontend/services/groupchat.service.js` (500+ lines)
- `frontend/services/neo4j.service.js` (200+ lines)
- `frontend/lib/database-adapter.js` (150+ lines)

**Pattern:**
```javascript
async function someOperation() {
  const session = driver.getSession()
  try {
    const result = await session.run(`
      MATCH (n:Node)
      WHERE ...
      RETURN n
    `, params)
    return processResults(result)
  } catch (error) {
    console.error('Error in operation:', error)
    throw error
  } finally {
    await session.close()
  }
}
```

**What's Missing:**
- Query execution time
- Query text (for slow query identification)
- Row count returned
- Parameter values (for debugging)

### Recommended Query Logging Template

```javascript
async function someOperation() {
  const session = driver.getSession()
  const queryStart = Date.now()
  const query = `MATCH (n:Node) ...`

  try {
    const result = await session.run(query, params)
    const duration = Date.now() - queryStart

    // Log slow queries
    if (duration > 100) {
      console.warn(`⚠️ Slow query (${duration}ms):`, query.substring(0, 100))
    }

    console.log(`📊 Query executed in ${duration}ms, returned ${result.records.length} rows`)
    return processResults(result)

  } catch (error) {
    console.error('❌ Query failed:', {
      query: query.substring(0, 200),
      params: JSON.stringify(params),
      error: error.message
    })
    throw error
  } finally {
    await session.close()
  }
}
```

---

## 11. Error Categories & Severity

### CRITICAL Errors (Requires Immediate Action)

| Error | Location | User Impact | Example |
|-------|----------|-------------|---------|
| Neo4j connection failure | lib/neo4j.js:18 | Cannot use app | `Neo4j connection failed: Missing configuration` |
| GEMINI_API_KEY missing | ai/chat/route.js:40 | No AI responses | `GEMINI_API_KEY is not configured` |
| Supabase auth failure | AIAssistantUI.jsx:121 | Cannot log in | `Failed to check auth` |
| Python subprocess crash | ai/chat/route.js:147 | No AI responses | `ACE chat error` |

### WARNING Errors (Degraded Performance)

| Error | Location | User Impact | Example |
|-------|----------|-------------|---------|
| Slow Gemini API | groupchat/ai/route.js:90 | Delayed responses | `Gemini API responded in 12000ms` |
| Pusher broadcast fail | pusher.service.js | Delayed real-time | (No current logging) |
| XP update fail | user/xp/route.js:154 | XP not awarded | `Error updating XP` |
| Quiz submit fail | quiz/submit/route.js:153 | Quiz not recorded | `Quiz submit error` |

### INFO Logs (Normal Operation)

| Event | Location | Purpose |
|-------|----------|---------|
| @ai detected | messages/route.js:111 | Trace AI triggers |
| Gemini responded | ai/route.js:161 | Confirm API success |
| Task created | kanban/tasks/route.js | Audit trail |
| User signed up | (Not logged) | Should add |

---

## 12. Debugging Test Cases - Practical Examples

### Debug Case 1: Quiz XP Mismatch

**Scenario:** User completes quiz but doesn't receive expected XP

**Investigation Steps:**

1. **Check Quiz Submission Response:**
   ```bash
   # DevTools Network tab
   POST /api/quiz/submit
   Response: { sessionId: "...", nodeType: "rare", xpEarned: 14.2 }
   ```

2. **Verify Neo4j QuizSession:**
   ```cypher
   MATCH (qs:QuizSession {id: "session-id"})
   RETURN qs.xpEarned, qs.nodeType, qs.score, qs.totalQuestions
   ```

3. **Check XP API Call:**
   ```bash
   # Network tab
   POST /api/user/xp
   Request: { userId: "...", xpGained: 14.2 }
   Response: Should be 200 status
   ```

4. **Verify User XP Updated:**
   ```cypher
   MATCH (u:User {id: "user-id"})
   RETURN u.xp, u.level
   ```

5. **Check Console for Errors:**
   ```
   Look for: "Error updating XP" or "Quiz submit error"
   ```

**Common Issue:** Quiz creates session but XP API call fails silently
**Fix:** Check XP API error handling at quiz/submit/route.js line 153

---

### Debug Case 2: Group Chat Messages Not Appearing

**Scenario:** User sends message but other users don't see it

**Investigation Steps:**

1. **Check Message Creation Response:**
   ```bash
   POST /api/groupchat/{groupId}/messages
   Response: Should be 201 status with message object
   ```

2. **Verify Neo4j Message Node:**
   ```cypher
   MATCH (m:Message {id: "message-id"})
   RETURN m.content, m.createdBy, m.createdAt
   ```

3. **Check Pusher Broadcast:**
   ```bash
   # No explicit logging currently
   # Should add: console.log('📡 Pusher broadcast sent')
   ```

4. **Check Client Subscription:**
   ```javascript
   // GroupChat.jsx should log:
   console.log('Subscribed to channel:', `group-${groupId}`)
   ```

5. **Verify Pusher Credentials:**
   ```bash
   # .env.local
   PUSHER_SECRET=... (server-only)
   NEXT_PUBLIC_PUSHER_KEY=... (client-accessible)
   NEXT_PUBLIC_PUSHER_CLUSTER=us2 (or your cluster)
   ```

**Common Issue:** Key and secret values swapped
**Fix:** Verify PUSHER_SECRET contains secret, NEXT_PUBLIC_PUSHER_KEY contains key

---

### Debug Case 3: ACE Memory Not Growing

**Scenario:** Agent has 20+ conversations but memory file shows only 5 bullets

**Investigation Steps:**

1. **Check Memory File Exists:**
   ```bash
    > _Legacy note:_ Before Nov 2025 the playbook was stored in `ace_memory.json`. The current build persists to Neo4j; use `analyze_ace_memory.py --learner <id>` instead of inspecting the file listed below.

    # Legacy example:
    # ls -lh frontend/scripts/ace_memory.json
   # Should exist and grow over time
   ```

2. **View Current Memory:**
   ```bash
   cd frontend/scripts
   python3 analyze_ace_memory.py summary
   ```

3. **Check ACE Learning Enabled:**
   ```python
   # run_ace_agent.py line 89
   enable_online_learning = payload.get("enableLearning", True)
   # Should be True by default
   ```

4. **Check Reflector/Curator Execution:**
   ```
   # Console should show ACE logs during agent execution
   [ACE Agent] ACE learning node updating memory...
   ```

5. **Verify Pruning Not Too Aggressive:**
   ```python
   # ace_memory.py - check retention threshold
   # Should keep bullets with score > 0.3
   ```

**Common Issue:** Online learning disabled or Curator JSON parsing fails
**Fix:** Check stderr for Python exceptions during curation

---

## 13. Logging by Component (Organized by Feature)

### AI Tutor (1-on-1 Chat)

**JavaScript Logging:**
- Route: `frontend/app/api/ai/chat/route.js`
  - Line 11: Route started
  - Line 41: Missing API key error
  - Lines 102-103: Python stderr passthrough
  - Line 147: General errors

**Python Logging:**
- Entry: `frontend/scripts/run_ace_agent.py`
  - Line 50: `_log()` function for all workflow steps
- Agent: `frontend/scripts/langgraph_agent_ace.py`
  - Node execution (not explicitly logged to stderr)
- Memory: `frontend/scripts/ace_memory.py`
  - Dedup/prune operations with detailed logging

**Frontend Component:**
- `frontend/components/AIAssistantUI.jsx`
  - Line 121: Auth check failure
  - Line 129: Auth state change error
  - Line 148: User data fetch error

---

### Group Chat (Multi-user)

**JavaScript Logging:**
- Message Creation: `frontend/app/api/groupchat/[groupId]/messages/route.js`
  - Lines 107-111: @ai detection (🤖 emoji markers)
  - Line 211: Background AI error
  - Line 326: Message creation error

- AI Processing: `frontend/app/api/groupchat/[groupId]/ai/route.js`
  - Lines 38-126: Comprehensive timing instrumentation (🤖 emoji)
  - All steps logged with millisecond precision

- Group Operations: `frontend/app/api/groupchat/[groupId]/route.js`
  - Line 68: Group creation error
  - Line 114: Group fetch error
  - Line 153: Group deletion error

**Frontend Components:**
- `frontend/components/GroupChat.jsx`
  - Line 56: Pusher message received (should add logging)
  - No explicit error logging

- `frontend/components/ThreadPanel.jsx`
  - Lines 35-50: Pusher thread events (should add logging)

---

### Quiz System

**JavaScript Logging:**
- Submit: `frontend/app/api/quiz/submit/route.js`
  - Lines 26-30: Legendary node debug (🔍 emoji)
  - Line 38: Legendary assignment confirmation (✅ emoji)
  - Line 153: General error

**Frontend Component:**
- `frontend/app/quiz/page.tsx`
  - No explicit logging (errors caught in API layer)

**What's in Neo4j (Queryable):**
```cypher
// View all quiz attempts
MATCH (u:User)-[:COMPLETED]->(qs:QuizSession)
RETURN u.name, qs.score, qs.totalQuestions, qs.nodeType, qs.xpEarned, qs.completedAt
ORDER BY qs.completedAt DESC
LIMIT 20

// Legendary node assignments
MATCH (u:User)-[:COMPLETED]->(qs:QuizSession {nodeType: 'legendary'})
RETURN u.name, count(qs) as legendary_count

// Quiz performance by user
MATCH (u:User)-[:HAS_QUIZ_PROGRESS]->(qp:QuizProgress)
RETURN u.name, qp.totalQuizzes, qp.bestStreak, qp.legendaryCompleted
```

---

### Gamification (XP & Leveling)

**JavaScript Logging:**
- XP API: `frontend/app/api/user/xp/route.js`
  - Line 98: XP fetch error
  - Line 154: XP update error
  - **Missing:** Success logging for XP operations

**Frontend Component:**
- `frontend/components/AIAssistantUI.jsx`
  - Line 253: `handleXpGain()` - No explicit logging
  - Should add: `console.log('💎 XP awarded:', xpEarned)`

**What's in Neo4j:**
```cypher
// User XP and level (current state only)
MATCH (u:User)
RETURN u.name, u.xp, u.level, u.updatedAt

// No XP transaction history currently stored
// Consider adding: (:XPTransaction {amount, source, timestamp})
```

---

### Kanban Tasks

**JavaScript Logging:**
- Tasks: `frontend/app/api/kanban/tasks/route.js`
  - Line 56: Task fetch error
  - Line 118: Task creation error
  - **Missing:** Success confirmations

**Frontend Component:**
- `frontend/components/KanbanBoard.tsx`
  - Line 243: `handleTaskComplete()` - No explicit logging
  - Should add: `console.log('✅ Task completed:', taskId)`

**What's in Neo4j:**
```cypher
// View task completion history
MATCH (u:User)-[:HAS_TASK]->(t:Task {status: 'done'})
RETURN u.name, t.title, t.completedAt
ORDER BY t.completedAt DESC

// Task completion rate
MATCH (u:User)-[:HAS_TASK]->(t:Task)
WITH u, count(t) as total,
     sum(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) as completed
RETURN u.name, completed, total,
       toFloat(completed) / total as completion_rate
```

---

## 14. Console Output Examples (By Scenario)

### Scenario: Successful AI Chat

**Terminal Output:**
```
ACE chat route started
[ACE Agent] Received input with 3 messages
[ACE Agent] Building ACE graph...
[ACE Agent] Router selected mode: cot
[ACE Agent] Planner configured solver params
[ACE Agent] Solver executing with ACE context...
[ACE Agent] Retrieved 3 relevant bullets from memory
[ACE Agent] Calling Gemini API...
[ACE Agent] Critic cleaning answer...
[ACE Agent] ACE learning node reflecting on execution...
[ACE Agent] Curator created 2 new bullets, updated 1 existing
[ACE Agent] Response complete in 4250ms
```

**Browser Console:**
```
💬 Message sent: "Help me with fractions"
⚡ XP animation triggered: +1.42 XP
📊 Gamification bar updated: 151.92 XP (Level 3)
```

---

### Scenario: Group Chat @ai Mention

**Terminal Output:**
```
🤖 @ai detected, processing AI response
🤖 AI request started
🤖 Parent message fetched in 45ms
🤖 Thread messages fetched in 120ms
🤖 Calling Gemini...
🤖 Gemini API responded in 3450ms
🤖 AI message created in Neo4j in 85ms
🤖 Pusher broadcast completed in 12ms
🤖 Total AI request time: 3712ms
```

**Browser Console (Client):**
```
📨 Pusher MESSAGE_SENT received for thread: parent-msg-123
ThreadPanel updated with 1 new reply
```

---

### Scenario: Quiz Perfect Score

**Terminal Output:**
```
🔍 LEGENDARY NODE DEBUG:
  score: 10 | type: number
  totalQuestions: 10 | type: number
  score === totalQuestions? true
  score == totalQuestions? true
  ✅ LEGENDARY assigned!

Quiz session created: quiz-session-abc123
XP awarded: 27.5 XP
```

**Browser Console:**
```
🎮 Quiz completed: 10/10 (100%)
👑 Legendary node earned!
💎 27.5 XP awarded
🎊 Confetti celebration triggered
```

---

## 15. Log Aggregation & Analysis (Future State)

### Recommended Centralized Logging Architecture

**Phase 1: Structured Logging**
```javascript
// Replace console.log with structured logger
import { logger } from '@/lib/logger'

logger.info('ai.chat.started', {
  userId: user.id,
  sessionId: session.id,
  messageLength: message.length,
  timestamp: new Date().toISOString()
})
```

**Phase 2: Log Aggregation Service**
- Options: Logtail, Datadog, New Relic, Papertrail
- Centralized dashboard for all logs
- Query and filter capabilities
- Retention: 30 days minimum

**Phase 3: Alerting Rules**
- Critical: Neo4j connection failures → immediate alert
- Warning: Gemini API >10s → alert after 3 occurrences
- Info: Daily summary of XP awarded, quizzes completed

---

## 16. Production Monitoring Checklist

### Current State (Console-Based)

**What We Can Monitor:**
- ✅ API errors (via console.error)
- ✅ AI processing time (via 🤖 timing logs)
- ✅ Neo4j connection status (via error logs)
- ✅ ACE memory operations (via analyze_ace_memory.py)
- ✅ Prompts system health (via `unitTests/prompts/verify_all.sh`)

**What We Cannot Monitor:**
- ❌ Request rates (req/sec)
- ❌ Error rates (%)
- ❌ User session duration
- ❌ Feature adoption metrics
- ❌ Database query performance trends
- ❌ Memory/CPU usage
- ❌ Uptime SLA

### Recommended Additions

**1. Health Check Endpoint:**
```javascript
// frontend/app/api/health/route.js
export async function GET() {
  const checks = {
    neo4j: await checkNeo4jConnection(),
    gemini: !!process.env.GEMINI_API_KEY,
    pusher: !!process.env.PUSHER_SECRET,
    timestamp: new Date().toISOString()
  }

  const healthy = Object.values(checks).every(c => c === true || c?.status === 'ok')

  return NextResponse.json(checks, {
    status: healthy ? 200 : 503
  })
}
```

**2. Request ID Correlation:**
```javascript
// Add to all API routes
const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
console.log(`[${requestId}] Request started`)
// Use requestId in all subsequent logs
```

**3. Performance Budgets:**
```javascript
const PERFORMANCE_BUDGETS = {
  'ai.chat': 600000,        // 10 minutes max
  'group.ai': 600000,       // 10 minutes max
  'quiz.submit': 5000,      // 5 seconds
  'xp.update': 2000,        // 2 seconds
  'task.create': 1000       // 1 second
}

// Log if exceeded
if (duration > PERFORMANCE_BUDGETS[operation]) {
  console.warn(`⚠️ Performance budget exceeded: ${operation} took ${duration}ms`)
}
```

---

## 17. Neo4j Database Observability

### What's Currently Queryable

**User Activity Metrics:**
```cypher
// Total users
MATCH (u:User) RETURN count(u) as total_users

// Active users (had conversations)
MATCH (u:User)-[:HAS]->(s:Session)
RETURN count(DISTINCT u) as active_users

// XP distribution
MATCH (u:User)
RETURN u.level, count(u) as users_at_level
ORDER BY u.level
```

**Quiz Analytics:**
```cypher
// Quiz completion rate
MATCH (u:User)-[:COMPLETED]->(qs:QuizSession)
WITH count(DISTINCT u) as users_who_took_quiz,
     (MATCH (u2:User) RETURN count(u2)) as total_users
RETURN users_who_took_quiz, total_users,
       toFloat(users_who_took_quiz) / total_users as completion_rate

// Node type distribution
MATCH (qs:QuizSession)
RETURN qs.nodeType, count(qs) as count
ORDER BY count DESC

// Average score by user
MATCH (u:User)-[:COMPLETED]->(qs:QuizSession)
RETURN u.name, avg(toFloat(qs.score) / qs.totalQuestions) as avg_accuracy
ORDER BY avg_accuracy DESC
```

**Group Chat Metrics:**
```cypher
// Most active groups
MATCH (g:GroupChat)-[:CONTAINS]->(m:Message)
RETURN g.name, count(m) as message_count
ORDER BY message_count DESC
LIMIT 10

// AI mention frequency
MATCH (m:Message)
WHERE m.content CONTAINS '@ai'
RETURN count(m) as ai_mentions

// Thread depth analysis
MATCH (parent:Message)<-[:REPLY_TO*]-(reply:Message)
RETURN parent.id, count(reply) as reply_count
ORDER BY reply_count DESC
LIMIT 10
```

### Future: Abnormal Activity Detection Queries

**Planned Weekly Health Checks:**

```cypher
// 1. Orphaned Nodes (Data Integrity)
MATCH (u:User)
WHERE NOT (u)-[:HAS]->(:Session)
  AND NOT (u)-[:COMPLETED]->(:QuizSession)
  AND NOT (u)-[:HAS_TASK]->(:Task)
  AND NOT (u)-[:MEMBER_OF]->(:GroupChat)
  AND u.createdAt < datetime() - duration({days: 7})
RETURN count(u) as inactive_users_7days

// 2. XP/Level Inconsistencies
MATCH (u:User)
WITH u, ((u.level - 1) * (u.level - 1) + 4) * ((u.level - 1) * (u.level - 1) + 4) as expected_xp
WHERE u.xp < expected_xp OR u.xp >= expected_xp * 2
RETURN u.name, u.xp, u.level, expected_xp,
       CASE WHEN u.xp < expected_xp THEN 'TOO_LOW' ELSE 'TOO_HIGH' END as issue

// 3. Broken Conversation Chains
MATCH (s:Session)-[:OCCURRED]->(first:Chat)
WHERE NOT ()-[:NEXT]->(first)  // First message should have no incoming NEXT
MATCH (s)-[:OCCURRED]->(last:Chat)
WHERE NOT (last)-[:NEXT]->()    // Last message should have no outgoing NEXT
WITH s, first, last
MATCH path = (first)-[:NEXT*]->(last)
WITH s, length(path) as chain_length
MATCH (s)-[:OCCURRED]->(c:Chat)
WITH s, chain_length, count(c) as total_messages
WHERE chain_length + 1 <> total_messages
RETURN s.id, chain_length, total_messages,
       'BROKEN_CHAIN' as issue

// 4. Impossible Quiz Scores
MATCH (qs:QuizSession)
WHERE qs.score > qs.totalQuestions
   OR qs.score < 0
   OR qs.totalQuestions <= 0
RETURN qs.id, qs.score, qs.totalQuestions, qs.userId

// 5. Suspicious XP Spikes
MATCH (u:User)
WHERE u.xp > 10000  // Threshold for investigation
  AND u.createdAt > datetime() - duration({days: 1})
RETURN u.name, u.xp, u.level, u.createdAt,
       'RAPID_XP_GAIN' as flag
```

**Alert Triggers:**
- More than 10 orphaned nodes
- Any XP/Level inconsistency
- Any broken conversation chains
- Any impossible quiz scores
- XP gain >10,000 in first 24 hours

---

## 18. Debug Tools & Commands

### Neo4j Database Inspection

**Connect to Database:**
```bash
# Via Neo4j Browser
# URL: https://console.neo4j.io
# Or use Cypher-shell
```

**Useful Debug Queries:**

```cypher
// 1. Recent activity (last hour)
MATCH (u:User)-[:HAS]->(s:Session)-[:OCCURRED]->(c:Chat)
WHERE c.created_at > datetime() - duration({hours: 1})
RETURN u.name, s.title, c.role, c.content, c.created_at
ORDER BY c.created_at DESC
LIMIT 20

// 2. Error patterns in AI responses
MATCH (c:Chat {role: 'assistant'})
WHERE c.content CONTAINS 'error' OR c.content CONTAINS 'failed'
RETURN c.content, c.created_at
LIMIT 10

// 3. XP audit trail (via updatedAt)
MATCH (u:User)
WHERE u.updatedAt > datetime() - duration({hours: 1})
RETURN u.name, u.xp, u.level, u.updatedAt
ORDER BY u.updatedAt DESC

// 4. Active group chats
MATCH (g:GroupChat)-[:CONTAINS]->(m:Message)
WHERE m.createdAt > datetime() - duration({days: 1})
RETURN g.name, count(m) as messages_24h
ORDER BY messages_24h DESC
```

### ACE Memory Inspection

**View Memory State:**
```bash
cd frontend/scripts

# Summary
python3 analyze_ace_memory.py summary

# Search for specific topics
python3 analyze_ace_memory.py search "multiplication"

# Interactive mode
python3 analyze_ace_memory.py interactive
```

**Output Example:**
```
=== ACE Memory Summary ===
Total bullets: 45
Total helpful: 123
Total harmful: 12
Average score: 0.68
Memory size: 245KB

Top Tags:
  multiplication: 12 bullets
  fractions: 8 bullets
  problem-solving: 15 bullets
```

### System Prompts Verification

**Verify Prompts Integration:**
```bash
cd unitTests/prompts/

# Run all verification tests
./verify_all.sh

# Or run individual tests
python3 test_prompts_integration.py
python3 test_api_simulation.py
```

**When to Run:**
- After any prompt modifications
- Before deployment
- After Python dependency updates
- If AI responses seem incorrect or using wrong templates

**What It Checks:**
- All 8 prompts (REFLECTOR, CURATOR, COT, TOT, REACT, CYPHER, QA) are importable
- Import paths resolve correctly from production context
- Prompts have all required placeholders
- ACE agent can build graph successfully
- No circular dependency issues

---

### Application Health Monitoring

**Check System Status:**
```bash
# 1. Neo4j connection
curl http://localhost:3000/api/health
# Should return: { neo4j: { status: 'ok' }, ... }

# 2. Python environment
cd frontend/scripts
python3 -c "import langgraph, langchain; print('OK')"

# 3. Environment variables
cd frontend
env | grep -E "GEMINI|NEO4J|PUSHER|SUPABASE"

# 4. ACE memory health
cd frontend/scripts
python3 analyze_ace_memory.py summary | grep "Total bullets"
# Should be <100
```

---

## 19. Known Issues & Workarounds

### Issue 1: AI Response Timeout (No Limit Currently)

**Problem:** Gemini API can hang indefinitely
**Impact:** User sees loading indicator forever
**Current State:** No timeout implemented

**Workaround:**
```javascript
// Recommended addition to gemini.service.js
const controller = new AbortController()
const timeoutId = setTimeout(() => controller.abort(), 600000) // 10 min

try {
  const response = await fetch(apiUrl, {
    signal: controller.signal,
    // ... other options
  })
} finally {
  clearTimeout(timeoutId)
}
```

**Debug:** Check if request exceeds 10 minutes in Network tab

---

### Issue 2: XP Race Condition (Concurrent Updates)

**Problem:** Multiple tabs can award XP simultaneously, last write wins
**Impact:** Potential XP loss
**Current State:** No transaction locking

**Workaround:** Users should avoid sending messages from multiple tabs simultaneously

**Proper Fix (Future):**
```cypher
// Use atomic increment
MATCH (u:User {id: $userId})
SET u.xp = u.xp + $xpGained
SET u.updatedAt = datetime()
RETURN u.xp
```

**Debug:** Compare expected XP (manual calculation) vs actual in database

---

### Issue 3: Pusher Delivery Failure (Silent)

**Problem:** If Pusher broadcast fails, no error logged
**Impact:** Messages only appear after refresh
**Current State:** No retry mechanism

**Workaround:** Refresh page to fetch from Neo4j

**Debug:**
1. Check Pusher credentials in .env.local
2. Verify channel name matches subscription
3. Check browser console for Pusher connection errors
4. Test with Pusher debug mode enabled

---

### Issue 4: ACE Memory File Permissions

**Legacy Problem (deprecated):** Prior builds used `ace_memory.json`; current Neo4j-backed deployments no longer read this file.
**Impact:** Memory doesn't grow, same responses over time
**Current State:** No permission check

**Debug:**
```bash
# Legacy example:
# ls -la frontend/scripts/ace_memory.json
# Should be writable: -rw-r--r--
```

**Fix:**
```bash
# Legacy example:
# chmod 644 frontend/scripts/ace_memory.json
```

---

## 20. Logging Checklist for New Features

When adding new features, ensure:

- [ ] API route has try/catch with console.error
- [ ] Success path has informational log (optional)
- [ ] Timing instrumentation for operations >1 second
- [ ] Neo4j queries properly close sessions
- [ ] Error responses return JSON with error field
- [ ] User-facing errors are friendly (hide internal details)
- [ ] Critical errors logged with stack trace
- [ ] Pusher broadcasts logged (if applicable)
- [ ] XP awards logged with source

**Template for New API Route:**
```javascript
export async function POST(request) {
  const startTime = Date.now()
  const operation = 'feature.operation'

  try {
    console.log(`📍 ${operation} started`)

    const result = await performOperation()

    const duration = Date.now() - startTime
    console.log(`✅ ${operation} completed in ${duration}ms`)

    return NextResponse.json(result, { status: 200 })

  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`❌ ${operation} failed after ${duration}ms:`, error)

    return NextResponse.json(
      { error: 'Operation failed. Please try again.' },
      { status: 500 }
    )
  }
}
```

---

## 21. Quick Reference: Log Locations

| Feature | File | Key Lines | What's Logged |
|---------|------|-----------|---------------|
| **AI Chat** | `app/api/ai/chat/route.js` | 11, 41, 102-103, 147 | Route start, errors, ACE logs |
| **ACE Agent** | `scripts/run_ace_agent.py` | 50 | All workflow steps via `_log()` |
| **Group @ai** | `api/groupchat/.../messages/route.js` | 107-111, 159-161, 206, 211 | Detection, Gemini, Pusher |
| **Group AI Timing** | `api/groupchat/.../ai/route.js` | 38-126 | Comprehensive timing (🤖) |
| **Quiz Debug** | `api/quiz/submit/route.js` | 26-30, 38 | Legendary node debug (🔍) |
| **XP Errors** | `api/user/xp/route.js` | 98, 154 | Fetch/update errors |
| **Auth** | `components/AIAssistantUI.jsx` | 121, 129, 148 | Auth failures |
| **Neo4j** | `lib/neo4j.js` | 18-25 | Connection errors |
| **Kanban** | `api/kanban/tasks/route.js` | 56, 118 | Task errors |
| **Prompts** | `unitTests/prompts/verify_all.sh` | - | Import verification |

---

## 22. Emoji Log Markers Guide

| Emoji | Meaning | Used In | Example |
|-------|---------|---------|---------|
| 🤖 | AI/Bot operation | Group chat AI | `🤖 Calling Gemini...` |
| 🔍 | Debug/Investigation | Quiz submission | `🔍 LEGENDARY NODE DEBUG:` |
| ✅ | Success/Confirmation | Quiz node assignment | `✅ LEGENDARY assigned!` |
| ❌ | Error/Failure | All error logs | `❌ Query failed` |
| ⚠️ | Warning/Degraded | Performance issues | `⚠️ Slow query` |
| 📍 | Location marker | Request tracking | `📍 Operation started` |
| 💎 | XP/Gamification | XP awards | `💎 XP awarded: +1.42` |
| 🎮 | Quiz/Game | Quiz completion | `🎮 Quiz completed` |
| 👑 | Legendary/Special | Legendary nodes | `👑 Legendary node earned!` |
| 📊 | Data/Metrics | Query results | `📊 Query returned 15 rows` |
| 📨 | Message/Real-time | Pusher events | `📨 Pusher MESSAGE_SENT` |
| 🔐 | Auth/Security | Authentication | `🔐 Auth check started` |
| 📡 | Broadcast/Network | Pusher broadcast | `📡 Pusher broadcast sent` |

**Usage Pattern:**
```javascript
console.log('🤖 AI request started')  // Info
console.error('❌ Operation failed:', error)  // Error
console.warn('⚠️ Performance degraded')  // Warning
```

---

## 23. Performance Baseline Reference

### Expected Latencies (Normal Operation)

| Operation | Target | Acceptable | Critical | Measured At |
|-----------|--------|------------|----------|-------------|
| Neo4j read (simple) | <50ms | <100ms | >500ms | groupchat/ai/route.js:40 |
| Neo4j read (complex) | <100ms | <200ms | >1000ms | groupchat/ai/route.js:50 |
| Neo4j write | <50ms | <150ms | >500ms | groupchat/ai/route.js:119 |
| Gemini API | 2-5s | <10s | >10min | groupchat/ai/route.js:90 |
| Pusher broadcast | <20ms | <50ms | >200ms | groupchat/ai/route.js:124 |
| Full AI request | 5-10s | <60s | >10min | groupchat/ai/route.js:126 |
| Quiz submission | <1s | <5s | >30s | (Not instrumented) |
| XP update | <500ms | <2s | >10s | (Not instrumented) |
| Task creation | <500ms | <1s | >5s | (Not instrumented) |
| Prompts verification | <5s | <10s | >30s | unitTests/prompts/verify_all.sh |

**Degradation Indicators:**
- Gemini consistently >30s: API throttling or quota exceeded
- Neo4j >1s: Database performance issue, connection pool exhaustion
- Pusher >200ms: Network issues or service degradation

---

## 24. Production Debugging Scenarios

### Scenario 1: Mass User Complaints "AI Not Working"

**Triage Steps:**
1. Check health endpoint: `curl https://your-domain.com/api/health`
2. Verify GEMINI_API_KEY set in production environment
3. Check Railway/Render logs for Python errors
4. Run prompts verification: `cd unitTests/prompts && ./verify_all.sh`
5. Test single request manually via curl

**Likely Causes:**
- Gemini API quota exceeded
- Environment variable not set in production
- Python dependencies missing in deployment
- Neo4j connection limit reached
- Prompts import errors (run `unitTests/prompts/verify_all.sh` to check)

---

### Scenario 2: Specific User Can't Log In

**Investigation:**
1. Search logs for user email
2. Check Supabase user exists: Supabase Dashboard → Auth → Users
3. Check Neo4j user exists:
   ```cypher
   MATCH (u:User {email: "user@example.com"})
   RETURN u
   ```
4. If mismatch: Should auto-create on next login attempt
5. Check console for "Failed to check auth" errors

---

### Scenario 3: XP Not Increasing Across Platform

**Investigation:**
1. Check `/api/user/xp` endpoint health
2. Verify Neo4j write permissions
3. Check for Neo4j transaction errors in logs
4. Test XP API directly:
   ```bash
   curl -X POST http://localhost:3000/api/user/xp \
     -H "Content-Type: application/json" \
     -d '{"userId":"test-user","xpGained":10}'
   ```
5. Verify response includes updated XP value

---

## 25. Log Retention & Cleanup

### Current State

**Console Logs:**
- Retained only during server runtime
- Lost on server restart
- No persistent storage

**Neo4j Data:**
- Retained indefinitely (no TTL)
- Manual cleanup required for old data

**ACE Memory:**
- Legacy note: earlier JSON store grew up to 100 bullets; Neo4j now enforces the same limit per learner.
- Automatic pruning keeps size bounded
- Should backup periodically

### Recommended Cleanup Schedule

**Weekly:**
```cypher
// Remove old quiz sessions (>90 days)
MATCH (qs:QuizSession)
WHERE qs.completedAt < datetime() - duration({days: 90})
DETACH DELETE qs

// Archive old group messages (>180 days)
MATCH (m:Message)
WHERE m.createdAt < datetime() - duration({days: 180})
  AND NOT (m)<-[:REPLY_TO]-()  // Keep if has recent replies
DETACH DELETE m
```

**Monthly:**
```bash
# Backup ACE memory (Neo4j)
python3 frontend/scripts/analyze_ace_memory.py export --learner <id> > backups/ace_memory_$(date +%Y%m%d)_<id>.txt
```

---

## 26. Summary: What to Check When Things Break

### Quick Diagnostic Checklist

**Problem: App won't start**
- [ ] Check .env.local has all required variables
- [ ] Check Neo4j credentials correct
- [ ] Check Python installed: `python3 --version`
- [ ] Check dependencies: `npm install && pip3 install -r requirements.txt`

**Problem: AI not responding**
- [ ] Check terminal for ACE logs
- [ ] Check GEMINI_API_KEY set
- [ ] Run `prompts/verify_all.sh` - should pass all tests
- [ ] Check Python can import: `python3 -c "from langgraph_agent_ace import build_ace_graph"`

**Problem: Real-time not working**
- [ ] Check Pusher credentials (key vs secret)
- [ ] Check NEXT_PUBLIC_PUSHER_CLUSTER matches dashboard
- [ ] Check browser console for Pusher connection errors

**Problem: XP not updating**
- [ ] Check Neo4j connection working
- [ ] Check `/api/user/xp` returns 200 status
- [ ] Check user exists in Neo4j

**Problem: Prompts not loading**
- [ ] Run `cd unitTests/prompts && ./verify_all.sh`
- [ ] Check import paths in ace_components.py and langgraph_utile.py
- [ ] Verify `sys.path` includes project root

---

**Architecture:** Console-based logging (dev = prod)
**Future:** Robust Neo4j abnormal activity detection
