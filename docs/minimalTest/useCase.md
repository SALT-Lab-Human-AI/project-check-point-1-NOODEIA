# Minimal Test Cases - Critical Paths

**Purpose:** Document minimal test scenarios for critical functionality that MUST work in production.

**Test Strategy:** Generic test scenarios without hardcoded data. Each test should be repeatable with any valid user/content.

**Performance Requirements:**
- AI responses: Maximum 10 minutes timeout
- Other operations: No specific baseline (best effort)

---

## Test Suite 1: Authentication & User Initialization (MISSION CRITICAL)

### Test 1.1: New User Signup Flow
**Priority:** CRITICAL
**Path:** Supabase Auth → Neo4j User Creation → Session Initialization

**Steps:**
1. Navigate to `/login`
2. Click "Don't have an account? Sign up"
3. Enter any email (e.g., `newuser@example.com`)
4. Enter any password (minimum 6 characters)
5. Click "Sign up"

**Expected Outcome:**
- ✅ Redirected to `/ai` (AI Tutor interface)
- ✅ User appears in Supabase `auth.users` table
- ✅ User auto-created in Neo4j with matching ID
- ✅ User profile shows in header (name/email)
- ✅ Gamification bar shows Level 1, 0 XP
- ✅ No console errors

**Neo4j Verification:**
```cypher
MATCH (u:User {email: "newuser@example.com"})
RETURN u.id, u.name, u.email, u.xp, u.level, u.createdAt
```

**Failure Scenarios:**
- ❌ If Neo4j creation fails: Redirect loop between `/login` and `/ai`
- ❌ If Supabase fails: Stays on login page with error message
- ❌ If no GEMINI_API_KEY: Can log in but AI chat won't work

**Debug Location:** `frontend/components/AIAssistantUI.jsx` lines 96-133 (`checkAuth()`)

---

### Test 1.2: Existing User Login Flow
**Priority:** CRITICAL
**Path:** Supabase Session Check → Neo4j User Lookup → Profile Load

**Steps:**
1. Navigate to `/login`
2. Enter existing user credentials
3. Click "Log in"

**Expected Outcome:**
- ✅ Redirected to `/ai` immediately
- ✅ No "Loading..." stuck screen
- ✅ User profile loads with correct XP/Level
- ✅ Previous conversation history appears in sidebar
- ✅ No console errors

**Neo4j Verification:**
```cypher
MATCH (u:User)-[:HAS]->(s:Session)
WHERE u.email = "existinguser@example.com"
RETURN u.name, u.xp, u.level, count(s) as total_sessions
```

**Failure Scenarios:**
- ❌ If session check fails: Stays on login page
- ❌ If Neo4j lookup fails: Returns to login page
- ❌ If XP data corrupted: Shows Level 1, 0 XP (default fallback)

**Debug Location:** `frontend/components/AIAssistantUI.jsx` lines 96-133

---

### Test 1.3: Supabase/Neo4j Sync Recovery
**Priority:** HIGH
**Path:** User exists in Supabase but missing in Neo4j → Auto-creation

**Steps:**
1. Manually create user in Supabase (via Supabase dashboard)
2. Do NOT create corresponding Neo4j user
3. Log in with those credentials

**Expected Outcome:**
- ✅ Auto-creates Neo4j user on first login
- ✅ Extracts name from Supabase metadata or email prefix
- ✅ Initializes with default values: `xp: 0`, `level: 1`
- ✅ Redirects to `/ai` successfully
- ✅ No infinite redirect loop

**Neo4j Verification:**
```cypher
MATCH (u:User {email: "mismatcheduser@example.com"})
RETURN u.id, u.name, u.xp, u.level, u.createdAt
// Should show newly created user
```

**Implementation:** `frontend/components/AIAssistantUI.jsx` lines 104-115

---

## Test Suite 2: AI Chat Completion (MISSION CRITICAL)

### Test 2.1: Basic AI Chat Response
**Priority:** CRITICAL
**Path:** User Message → ACE Agent (Python) → LangGraph → Gemini API → Response Display

**Steps:**
1. Log in and navigate to `/ai`
2. Type any question in chat input (e.g., "Help me with multiplication")
3. Click Send or press Enter
4. Wait for response (max 10 minutes)

**Expected Outcome:**
- ✅ User message appears immediately in chat
- ✅ AI shows "thinking" indicator
- ✅ AI response appears within 10 minutes
- ✅ Response is relevant to question
- ✅ XP animation shows +1.01-1.75 XP above send button
- ✅ Gamification bar updates with new XP
- ✅ Message persisted in Neo4j

**Console Logs to Check:**
```
ACE chat route started
Python subprocess spawned
[ACE Agent logs from stderr]
ACE chat response ready
```

**Neo4j Verification:**
```cypher
MATCH (u:User)-[:HAS]->(s:Session)-[:OCCURRED]->(c:Chat)
WHERE u.email = "testuser@example.com"
RETURN s.id, c.role, c.content, c.created_at
ORDER BY c.created_at DESC
LIMIT 10
```

**Failure Scenarios:**
- ❌ Python not installed: "spawn python3 ENOENT" error
- ❌ No GEMINI_API_KEY: JSON error in response, check line 40 in route.js
- ❌ ACE agent crashes: Check stderr for Python traceback
- ❌ Timeout (>10 min): Should implement timeout, currently none

**Debug Locations:**
- API Route: `frontend/app/api/ai/chat/route.js` (entire file)
- Python Entry: `frontend/scripts/run_ace_agent.py`
- Agent Logic: `frontend/scripts/langgraph_agent_ace.py`

---

### Test 2.2: ACE Memory Learning Verification
**Priority:** HIGH
**Path:** Conversation → Reflection → Curation → Memory Update

**Steps:**
1. Have a multi-turn conversation (3+ messages)
2. Ask about a topic the AI hasn't seen before
3. Inspect the learner's `AceMemoryState` in Neo4j (run `python3 analyze_ace_memory.py --learner <id>`)

**Expected Outcome:**
- ✅ Neo4j playbook shows new bullets for the learner
- ✅ New bullets added to memory after conversation
- ✅ Bullets have relevant tags
- ✅ Memory stays under 100 bullets (pruning works)

**Verification Command:**
```bash
cd frontend/scripts
python3 analyze_ace_memory.py summary
```

**Expected Output:**
```
Total bullets: X
Total helpful: Y
Total harmful: Z
Top tags: [list of tags]
```

**Failure Scenarios:**
- ❌ Memory file not created: Check write permissions
- ❌ Bullets not growing: Check ACE learning node execution
- ❌ Memory exceeds 100 bullets: Pruning mechanism failed

**Debug Location:** `frontend/scripts/ace_memory.py` (dedup/prune functions)

---

### Test 2.3: Python Subprocess Error Handling
**Priority:** HIGH
**Path:** AI Route → Python Subprocess Failure → Error Recovery

**Steps:**
1. Temporarily rename `frontend/scripts/run_ace_agent.py` to simulate missing file
2. Send AI chat message
3. Observe error handling

**Expected Outcome:**
- ✅ Returns JSON error response (not crash)
- ✅ User sees error message in UI
- ✅ Console logs error with context
- ✅ Subsequent requests work after file restored

**Failure Scenarios:**
- ❌ Server crashes: Check Next.js process doesn't terminate
- ❌ No error message: Check lines 146-156 in route.js

---

## Test Suite 3: Quiz Completion & Reward Distribution (MISSION CRITICAL)

### Test 3.1: Perfect Score → Legendary Node Assignment
**Priority:** CRITICAL
**Path:** 10/10 Correct → Score Calculation → Node Type Logic → XP Award

**Steps:**
1. Navigate to `/quiz`
2. Start any quiz (10 questions)
3. Answer all 10 questions correctly
4. Click through to completion

**Expected Outcome:**
- ✅ Final score shows: 10/10 (100%)
- ✅ Node type assigned: **LEGENDARY** 👑
- ✅ XP earned: 25-30 XP (random in range)
- ✅ Orb color: Hot pink (`#F58FA8`)
- ✅ Quiz session persisted with `nodeType: 'legendary'`
- ✅ User's total XP increases by 25-30

**Critical Code Path:**
```javascript
// frontend/app/quiz/page.tsx line 253
const finalScore = correct ? score + 1 : score;

// frontend/app/api/quiz/submit/route.js lines 33-38
if (score === totalQuestions) {
  nodeType = 'legendary'  // ✅ Exact match prevents bugs
}
```

**Neo4j Verification:**
```cypher
MATCH (u:User)-[:COMPLETED]->(qs:QuizSession)
WHERE qs.score = qs.totalQuestions
RETURN u.name, qs.score, qs.totalQuestions, qs.nodeType, qs.xpEarned
ORDER BY qs.completedAt DESC
LIMIT 5
// All should show nodeType: 'legendary'
```

**Failure Scenarios:**
- ❌ Shows "rare" instead of "legendary": Bug in lines 33-38 (was fixed Oct 30)
- ❌ XP not awarded: Check XP API call at quiz/submit/route.js line 126
- ❌ React state timing issue: finalScore not calculated correctly

**Debug Locations:**
- Quiz Page: `frontend/app/quiz/page.tsx` lines 245-318
- API Route: `frontend/app/api/quiz/submit/route.js` lines 26-41
- Console: Look for `🔍 LEGENDARY NODE DEBUG:` logs

---

### Test 3.2: High Score → Rare Node Assignment
**Priority:** HIGH
**Path:** 8-9/10 Correct → Rare Node

**Steps:**
1. Complete quiz with 8 or 9 correct answers
2. Verify node assignment

**Expected Outcome:**
- ✅ Score: 80-90%
- ✅ Node type: **RARE** 💎
- ✅ XP earned: 12-15 XP
- ✅ Orb color: Pink (`#FAB9CA`)

**Neo4j Verification:**
```cypher
MATCH (u:User)-[:COMPLETED]->(qs:QuizSession)
WHERE qs.score >= 8 AND qs.score < 10
RETURN qs.nodeType, qs.xpEarned
// Should show nodeType: 'rare', xpEarned between 12-15
```

---

### Test 3.3: Low Score → Common Node Assignment
**Priority:** MEDIUM
**Path:** 3-7/10 Correct → Common Node

**Steps:**
1. Complete quiz with 3-7 correct answers
2. Verify node assignment

**Expected Outcome:**
- ✅ Score: 30-70%
- ✅ Node type: **COMMON** ⚪
- ✅ XP earned: 3-7 XP
- ✅ Orb color: Gold (`#E4B953`)

---

### Test 3.4: Quiz Animation Performance
**Priority:** MEDIUM
**Path:** Orb Opening → Card Flip → Reward Reveal

**Steps:**
1. Complete any quiz
2. Click the shaking orb (Pokemon GO-style 3-shake animation)
3. Observe animations

**Expected Outcome:**
- ✅ Orb shakes continuously before click (3.5s cycle)
- ✅ Click triggers burst animation (24 particles)
- ✅ Card flips 720° over 2.5 seconds
- ✅ Animations run at 50-60fps (smooth)
- ✅ No lag or jank
- ✅ Confetti celebration (300 particles)

**Performance Check:**
- Open DevTools → Performance tab
- Record during animation
- Verify frame rate stays above 50fps

**Debug Location:** `frontend/app/quiz/reveal/page.tsx` lines 147-440

---

## Test Suite 4: Group Chat @ai Mentions (MISSION CRITICAL)

### Test 4.1: @ai in Main Channel → Creates Thread
**Priority:** CRITICAL
**Path:** Message with @ai → Server Detection → Async AI Processing → Thread Creation

**Sample Messages to Test:**
```
"@ai can you help me understand fractions?"
"Hey @ai, what's 12 x 5?"
"@ai explain the water cycle"
```

**Steps:**
1. Navigate to `/groupchat`
2. Create or join a group
3. Type message containing `@ai` in main channel
4. Send message

**Expected Outcome:**
- ✅ User message appears immediately in main channel
- ✅ AI response appears within 10 minutes (asynchronously)
- ✅ AI message appears as new thread (shows "X replies" badge)
- ✅ Click thread opens ThreadPanel with AI's response
- ✅ AI response includes context summary (e.g., "@John, Hi!")
- ✅ Both messages broadcast via Pusher in real-time

**Console Logs to Check:**
```javascript
🤖 @ai detected, processing AI response
🤖 Calling Gemini...
🤖 Gemini responded
🤖 AI response sent via Pusher
```

**Neo4j Verification:**
```cypher
MATCH (g:GroupChat)-[:CONTAINS]->(m:Message)
WHERE m.content CONTAINS '@ai'
OPTIONAL MATCH (m)<-[:REPLY_TO]-(reply:Message)
WHERE reply.createdBy = 'ai_assistant'
RETURN m.content, reply.content, reply.createdAt
// Should show AI reply in thread
```

**Failure Scenarios:**
- ❌ @ai not detected: Check server-side detection at messages/route.js line 110
- ❌ AI never responds: Check Gemini API key, check async function didn't error
- ❌ Response not visible: Check Pusher broadcast, check ThreadPanel subscription

**Debug Locations:**
- Message Creation: `frontend/app/api/groupchat/[groupId]/messages/route.js` lines 110-212
- AI Processing: `frontend/app/api/groupchat/[groupId]/ai/route.js` entire file
- Pusher: `frontend/services/pusher.service.js`

---

### Test 4.2: @ai in Thread → Replies in Same Thread
**Priority:** CRITICAL
**Path:** Thread Reply with @ai → Context Loading → AI Response in Thread

**Sample Messages:**
```
"@ai can you clarify that?"
"@ai what about the next step?"
"thanks @ai, but what if..."
```

**Steps:**
1. Open existing thread (click message with replies)
2. Type reply containing `@ai` in thread input
3. Send message

**Expected Outcome:**
- ✅ User reply appears in thread immediately
- ✅ AI response appears in same thread (not new thread)
- ✅ AI reads full thread context (parent + all replies)
- ✅ AI shows context in response: "**Thread context (previous messages):**"
- ✅ Real-time update via Pusher in ThreadPanel

**Console Logs to Check:**
```javascript
🤖 @ai detected, processing AI response
🤖 Parent message fetched in Xms
🤖 Thread messages fetched in Xms
🤖 Gemini API responded in Xms
```

**Neo4j Verification:**
```cypher
MATCH (parent:Message)<-[:REPLY_TO*]-(reply:Message)
WHERE parent.id = "parent-message-id"
RETURN parent.content, reply.content, reply.createdBy, reply.createdAt
ORDER BY reply.createdAt
// Should show AI reply in thread with correct parentId
```

**Failure Scenarios:**
- ❌ AI creates new thread instead: Check parentId passed correctly
- ❌ No context shown: Check thread loading at ai/route.js lines 42-56
- ❌ Only visible after refresh: Check Pusher subscription in ThreadPanel.jsx

**Debug Locations:**
- AI Route: `frontend/app/api/groupchat/[groupId]/ai/route.js` lines 42-56 (context)
- Thread Panel: `frontend/components/ThreadPanel.jsx` lines 24-64 (Pusher subscription)

---

## Test Suite 5: Gamification System (CRITICAL)

### Test 5.1: XP Award on AI Interaction
**Priority:** CRITICAL
**Path:** Send Message → XP Calculation → API Call → Neo4j Update → UI Update

**Steps:**
1. Note current XP value in gamification bar
2. Send any message to AI
3. Observe XP animation

**Expected Outcome:**
- ✅ "+X.XX XP" animation appears above send button
- ✅ XP value between 1.01-1.75 XP
- ✅ Animation floats upward with spring physics
- ✅ Gamification bar progress updates smoothly
- ✅ New XP total reflected in sidebar

**API Call Verification:**
```javascript
// Check Network tab in DevTools
POST /api/user/xp
Request: { userId: "...", xpGained: 1.42 }
Response: { xp: 150.5, level: 3, levelProgress: 0.54, ... }
```

**Neo4j Verification:**
```cypher
MATCH (u:User {id: "user-id"})
RETURN u.xp, u.level
// XP should increase by 1.01-1.75
```

**Failure Scenarios:**
- ❌ No animation: Check xpGain prop passed to Composer
- ❌ XP not updated: Check API response status
- ❌ Level doesn't update: Check level calculation in levelingSystem.js

**Debug Location:** `frontend/components/AIAssistantUI.jsx` lines 253-284 (`handleXpGain()`)

---

### Test 5.2: Level-Up Threshold Crossing
**Priority:** CRITICAL
**Path:** XP Award → Level Calculation → Level-Up Detection → Sparkle Animation

**Test Cases (Specific XP Thresholds):**

| Current XP | Current Level | Add XP | Expected Level | Should Level Up? |
|-----------|---------------|--------|----------------|------------------|
| 24 | 1 | 1.5 | 2 | ✅ YES (25 XP threshold) |
| 63 | 2 | 1.5 | 3 | ✅ YES (64 XP threshold) |
| 168 | 3 | 1.5 | 4 | ✅ YES (169 XP threshold) |
| 399 | 4 | 1.5 | 5 | ✅ YES (400 XP threshold) |
| 20 | 1 | 1.5 | 1 | ❌ NO (still below 25) |

**Steps:**
1. Set user XP to value near threshold (e.g., 24 XP)
2. Send AI message to earn XP
3. Observe level-up

**Expected Outcome:**
- ✅ Gamification bar shows sparkle animation
- ✅ Level badge updates from "Lvl 1" to "Lvl 2"
- ✅ Progress bar resets to 0% for new level
- ✅ Neo4j user.level increments

**Level Formula Verification:**
```
Level 1: 0 XP
Level 2: 25 XP (+25 from Level 1)
Level 3: 64 XP (+39 from Level 2)
Level 4: 169 XP (+105 from Level 3)
Level 5: 400 XP (+231 from Level 4)
Formula: ((level-1)² + 4)²
```

**Neo4j Setup (for testing):**
```cypher
MATCH (u:User {email: "testuser@example.com"})
SET u.xp = 24, u.level = 1
RETURN u.xp, u.level
```

**Debug Location:** `frontend/utils/levelingSystem.js` (all functions)

---

### Test 5.3: Kanban Task Completion XP Award
**Priority:** HIGH
**Path:** Drag Task to Done → XP Calculation → Confetti → API Update

**Steps:**
1. Navigate to `/todo`
2. Create a new task (any title)
3. Drag task from "To Do" to "Done" column

**Expected Outcome:**
- ✅ Task appears in Done column with crossed-out text
- ✅ Confetti bursts (50 particles, gold/orange/pink)
- ✅ "+X.XX XP" popup appears at top center
- ✅ XP awarded: 1.01-1.75 (random)
- ✅ Task marked as non-draggable
- ✅ `completedAt` timestamp set in Neo4j

**Neo4j Verification:**
```cypher
MATCH (u:User)-[:HAS_TASK]->(t:Task {status: 'done'})
WHERE u.email = "testuser@example.com"
RETURN t.title, t.completedAt, t.status
// completedAt should not be null
```

**Failure Scenarios:**
- ❌ No XP awarded: Check handleTaskComplete() in KanbanBoard.tsx line 243
- ❌ No confetti: Check confetti library import
- ❌ Task still draggable: Check isDone condition

**Debug Location:** `frontend/components/KanbanBoard.tsx` lines 243-268

---

## Test Suite 6: Real-Time Features (Pusher) (IMPORTANT)

### Test 6.1: Real-Time Message Delivery
**Priority:** HIGH
**Path:** User A Sends Message → Pusher Broadcast → User B Receives

**Steps:**
1. Open group chat in two different browsers/tabs
2. User A sends a message
3. Observe User B's screen

**Expected Outcome:**
- ✅ User B sees message appear instantly (no refresh needed)
- ✅ Message appears within 1-2 seconds
- ✅ Order is correct (no message reordering)

**Pusher Configuration Check:**
```javascript
// frontend/lib/pusher.js
NEXT_PUBLIC_PUSHER_KEY: Check .env.local
NEXT_PUBLIC_PUSHER_CLUSTER: Should match Pusher dashboard
```

**Failure Scenarios:**
- ❌ "App key not in this cluster": Wrong cluster or key/secret swapped
- ❌ Messages not appearing: Check Pusher subscription in GroupChat.jsx
- ❌ Duplicate messages: Deduplication logic at GroupChat.jsx lines 56-66

**Debug Locations:**
- Pusher Service: `frontend/services/pusher.service.js`
- Group Chat: `frontend/components/GroupChat.jsx` lines 56-66
- Thread Panel: `frontend/components/ThreadPanel.jsx` lines 24-64

---

### Test 6.2: Thread Reply Real-Time Updates
**Priority:** HIGH
**Path:** Reply in Thread → Pusher → ThreadPanel Updates

**Steps:**
1. User A has thread open in ThreadPanel
2. User B sends reply to same thread
3. Observe User A's ThreadPanel

**Expected Outcome:**
- ✅ Reply appears in User A's ThreadPanel instantly
- ✅ No page refresh required
- ✅ Reply count badge updates on main message

**Pusher Event Check:**
```javascript
// ThreadPanel.jsx lines 35-50
channel.bind('MESSAGE_SENT', (data) => {
  if (data.message.parentId === parentMessage.id) {
    setMessages(prev => [...prev, data.message])
  }
})
```

**Failure Scenarios:**
- ❌ Reply not appearing: Check parentId matches
- ❌ Only after refresh: Check Pusher subscription active
- ❌ Appears in wrong thread: Check parentId filtering

---

## Test Suite 7: Data Persistence (IMPORTANT)

### Test 7.1: Conversation History Persistence
**Priority:** HIGH
**Path:** Chat Messages → Neo4j :NEXT Relationships → Retrieval

**Steps:**
1. Have a conversation (5+ messages)
2. Navigate away from `/ai`
3. Return to `/ai`
4. Check conversation history

**Expected Outcome:**
- ✅ All messages preserved in correct order
- ✅ Conversation appears in sidebar
- ✅ Can select and view old conversations
- ✅ Edit/resend functions work on old messages

**Neo4j Verification:**
```cypher
MATCH (s:Session)-[:OCCURRED]->(c:Chat)
WHERE s.id = "session-id"
MATCH path = (first:Chat)-[:NEXT*]->(last:Chat)
WHERE first.id = c.id
RETURN length(path) as message_count
// Should match number of messages in conversation
```

---

### Test 7.2: Markdown Notes Auto-Save
**Priority:** MEDIUM
**Path:** Edit Markdown → 2-Second Delay → Auto-Save to Neo4j

**Steps:**
1. Open AI chat, click "Notes" button
2. Type content in markdown editor
3. Wait 2 seconds
4. Refresh page

**Expected Outcome:**
- ✅ Content persisted after refresh
- ✅ No data loss
- ✅ `lastModified` timestamp updated

**Neo4j Verification:**
```cypher
MATCH (s:Session)-[:HAS_NOTES]->(n:MarkdownNote)
WHERE s.id = "session-id"
RETURN n.content, n.lastModified
```

---

## Test Suite 8: System Prompts Verification (NEW)

### Test 8.1: Prompts Import Correctly
**Priority:** CRITICAL
**Path:** API Call → Python Import → Prompts Accessible

**Steps:**
1. Navigate to `unitTests/prompts/` directory
2. Run verification script

**Command:**
```bash
cd unitTests/prompts/
./verify_all.sh
```

**Expected Outcome:**
```
🎉 ALL TESTS PASSED!
✅ ACE Components Test         - PASSED
✅ LangGraph Utilities Test    - PASSED
✅ LangGraph Agent Test        - PASSED
✅ API Simulation Test         - PASSED
```

**What This Verifies:**
- ✅ All 8 prompts accessible from centralized location
- ✅ Import paths configured correctly
- ✅ ACE agent can build graph with dependencies
- ✅ run_ace_agent.py entry point works
- ✅ No import errors in production context

**Failure Scenarios:**
- ❌ Import ModuleNotFoundError: Check sys.path configuration
- ❌ Missing placeholders: Check prompt content
- ❌ API simulation fails: Check working directory setup

**Files Verified:**
- `prompts/ace_memory_prompts.py` (REFLECTOR_PROMPT, CURATOR_PROMPT)
- `prompts/reasoning_prompts.py` (COT, TOT, REACT prompts)
- `prompts/neo4j_prompts.py` (CYPHER, QA prompts)

**Debug Location:**
- Test Suite: `unitTests/prompts/test_prompts_integration.py`
- API Simulation: `unitTests/prompts/test_api_simulation.py`
- Verification: `unitTests/prompts/verify_all.sh`

**When to Run:**
- After any changes to prompt files
- After modifying import paths in ace_components.py or langgraph_utile.py
- Before deployment to verify all dependencies resolve
- As part of CI/CD pipeline (if implemented)

**Integration with AI Agent:**
The verify_all.sh script ensures that when users interact with the AI:
1. The ACE memory system can access REFLECTOR_PROMPT and CURATOR_PROMPT
2. The LangGraph agent can use COT_PROMPT, REACT_SYSTEM, etc.
3. The Neo4j integration has CYPHER_PROMPT for query generation
4. All components in the reasoning pipeline have their required prompts

---

## Test Suite 9: Edge Cases & Error Recovery

### Test 9.1: Concurrent User Actions
**Priority:** MEDIUM
**Path:** Multiple tabs → Simultaneous XP awards → Race condition

**Steps:**
1. Open `/ai` in two browser tabs with same user
2. Send message in Tab 1
3. Immediately send message in Tab 2

**Expected Outcome:**
- ✅ Both XP awards processed
- ✅ Final XP = initial + (XP1 + XP2)
- ✅ No lost updates
- ✅ Gamification bars sync across tabs

**Known Issue:** No transaction locking in XP updates
**Risk:** Last write wins (potential XP loss)

---

### Test 9.2: Network Interruption Recovery
**Priority:** MEDIUM
**Path:** Network Failure During API Call → Error Handling

**Steps:**
1. Open DevTools → Network tab
2. Set throttling to "Offline"
3. Try sending AI message
4. Re-enable network

**Expected Outcome:**
- ✅ User sees error message
- ✅ Message not lost (can retry)
- ✅ UI doesn't break
- ✅ Subsequent messages work after network restored

---

### Test 9.3: Invalid Neo4j Credentials
**Priority:** HIGH
**Path:** Startup with Wrong Credentials → Error Detection

**Steps:**
1. Set invalid `NEXT_PUBLIC_NEO4J_PASSWORD` in `.env.local`
2. Restart dev server
3. Try to access any feature

**Expected Outcome:**
- ✅ Error logged: "Neo4j connection failed"
- ✅ User sees meaningful error message
- ✅ App doesn't crash silently

**Debug Location:** `frontend/lib/neo4j.js` lines 18-25

---

## Test Suite 10: Performance & Scalability

### Test 10.1: Large Conversation History Load
**Priority:** MEDIUM
**Path:** Session with 100+ Messages → Retrieval Performance

**Steps:**
1. Create session with 100+ chat messages (use script or manually)
2. Navigate to `/ai`
3. Select that conversation

**Expected Outcome:**
- ✅ Loads within 5 seconds
- ✅ Infinite scroll works smoothly
- ✅ No memory leaks
- ✅ UI remains responsive

**Performance Budget:**
- 100 messages: <5 seconds
- 500 messages: <15 seconds
- 1000+ messages: Consider pagination

---

### Test 10.2: ACE Memory Growth Over Time
**Priority:** MEDIUM
**Path:** Continuous Usage → Memory Accumulation → Pruning

**Steps:**
1. Have 50+ conversations with AI
2. Inspect the learner's `AceMemoryState` via `analyze_ace_memory.py --learner <id>`
3. Verify pruning mechanism

**Expected Outcome:**
- ✅ Memory stays under 100 bullets
- ✅ Low-scoring bullets pruned automatically
- ✅ Most helpful bullets retained
- ✅ File size remains manageable (<500KB)

**Verification Command:**
```bash
cd frontend/scripts
python3 analyze_ace_memory.py summary
```

**Expected Output:**
```
Total bullets: <100
Avg score: >0.5
Most helpful: List of top bullets
```

---

## Smoke Test Checklist (Quick Verification)

Run these 5 tests to verify core functionality:

- [ ] **Auth:** Sign up new user → Redirects to `/ai` ✅
- [ ] **AI Chat:** Send message → Response within 10 min ✅
- [ ] **Quiz:** Complete quiz → Correct node type assigned ✅
- [ ] **@ai:** Mention @ai in group chat → AI responds ✅
- [ ] **XP:** Send message → XP animation appears ✅
- [ ] **Prompts:** Run `unitTests/prompts/verify_all.sh` → All tests pass ✅

**Time Required:** ~15 minutes for full smoke test

---

## Critical Failure Indicators

**🚨 System is DOWN if:**
1. Cannot create new users (Supabase or Neo4j failure)
2. AI chat returns errors consistently
3. Quiz submissions return 500 errors
4. Pusher broadcasts fail (messages only visible after refresh)
5. Prompts import errors in `unitTests/prompts/verify_all.sh`

**⚠️ System is DEGRADED if:**
1. AI responses take >5 minutes (should be 5-10 seconds normally)
2. XP updates delayed by >10 seconds
3. Pusher delivery delayed by >5 seconds
4. Memory growing beyond 100 bullets (pruning not working)

---

## Test Execution Priority

**Pre-Deployment (Must Pass):**
1. Authentication Tests (1.1, 1.2, 1.3)
2. AI Chat Test (2.1)
3. Quiz Perfect Score Test (3.1)
4. @ai Detection Tests (4.1, 4.2)
5. XP Award Test (5.1)
6. **Prompts Verification Test (8.1)** ← NEW: Run `unitTests/prompts/verify_all.sh`

**Post-Deployment (Monitor):**
1. Performance Tests (10.1, 10.2)
2. Edge Cases (9.1, 9.2, 9.3)
3. Real-time Features (6.1, 6.2)

---

## Test Data Cleanup

After testing, clean up test data:

```cypher
// Remove test users
MATCH (u:User)
WHERE u.email CONTAINS "test" OR u.email CONTAINS "example.com"
DETACH DELETE u

// Remove test quiz sessions
MATCH (qs:QuizSession)
WHERE qs.userId CONTAINS "test"
DELETE qs

// Remove test group chats
MATCH (g:GroupChat)
WHERE g.name CONTAINS "Test"
DETACH DELETE g
```

---

**Status:** Production-ready minimal test suite
