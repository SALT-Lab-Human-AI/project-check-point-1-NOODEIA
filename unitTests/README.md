# Unit Tests Directory

This directory contains all test files for the Noodeia project, organized by component.

---

## Directory Structure

```
unitTests/
├── README.md                               # This file
├── package.json                            # NPM dependencies for Node.js tests
├── run_all_tests.sh                        # Master test runner (runs all suites)
│
├── prompts/                                # System prompts tests (Suite 8)
│   ├── test_prompts_integration.py         # Integration tests
│   ├── test_api_simulation.py              # API environment simulation
│   └── verify_all.sh                       # Prompts verification
│
├── auth/                                   # Authentication tests (Suite 1)
│   ├── test-auth.js                        # Basic Supabase auth (legacy)
│   └── test_authentication_flows.js        # Complete auth flow tests (NEW)
│
├── quiz/                                   # Quiz system tests (Suite 3)
│   └── test_quiz_node_assignment.js        # Node type logic tests (NEW)
│
├── gamification/                           # XP & Leveling tests (Suite 5)
│   └── test_xp_leveling.js                 # XP formula & level-up tests (NEW)
│
├── ai_chat/                                # AI Chat tests (Suite 2)
│   └── test_ai_chat_api.js                 # ACE agent & API tests (NEW)
│
├── group_chat/                             # Group Chat tests (Suite 4)
│   └── test_ai_mentions.js                 # @ai detection tests (NEW)
│
├── data_persistence/                       # Data persistence tests (Suite 7)
│   └── test_neo4j_persistence.js           # Conversation & markdown tests (NEW)
│
└── ace_memory/                             # ACE memory tests (Suite 2.2, 10.2)
    ├── test_memory_comparison.py           # Memory comparison
    └── compare_memory_systems.py           # Side-by-side demo
```

---

## Test Categories

### 1. Prompts System Tests (`prompts/`)

**Purpose:** Verify that all system prompts are correctly imported and accessible to the AI agent.

**Files:**
- `test_prompts_integration.py` - Tests import paths and accessibility
- `test_api_simulation.py` - Simulates production API environment
- `verify_all.sh` - Runs all tests automatically

**How to Run:**
```bash
cd unitTests/prompts/
./verify_all.sh
```

**Expected Output:**
```
🎉 ALL TESTS PASSED!
✅ ACE Components Test - PASSED
✅ LangGraph Utilities Test - PASSED
✅ LangGraph Agent Test - PASSED
✅ API Simulation Test - PASSED
```

**What Gets Tested:**
- All 8 prompts (REFLECTOR, CURATOR, COT, TOT, REACT, CYPHER, QA) import correctly
- Import paths resolve from production context (`frontend/scripts/`)
- All prompts have required placeholders
- ACE agent can build graph successfully
- No circular dependency issues

**When to Run:**
- After modifying any prompt file
- Before deploying to production
- After updating Python dependencies
- After changing import paths

---

### 2. ACE Memory System Tests (`ace_memory/`)

**Purpose:** Compare and validate ACE memory system functionality.

**Files:**
- `test_memory_comparison.py` - Runs identical queries with/without ACE memory
- `compare_memory_systems.py` - Side-by-side demonstration of memory systems

**How to Run:**
```bash
cd unitTests/ace_memory/

# Run memory comparison
python3 test_memory_comparison.py

# Run side-by-side demo
python3 compare_memory_systems.py
```

**What Gets Tested:**
- ACE memory learning and retrieval
- Reflection and curation processes
- Memory deduplication and pruning
- Performance with/without memory enhancement

**When to Run:**
- After modifying ACE memory logic
- To verify memory learning is working
- When debugging memory-related issues
- For performance benchmarking

---

### 3. Authentication Tests (`auth/`) - Suite 1

**Purpose:** Test Supabase authentication and Neo4j user synchronization.

**Files:**
- `test-auth.js` - Basic Supabase auth (legacy)
- `test_authentication_flows.js` - **Complete auth flow tests (NEW)**

**How to Run:**
```bash
cd unitTests/auth/

# Run complete auth flow tests
node test_authentication_flows.js

# Or use npm
npm run test:auth
```

**What Gets Tested:**
- ✅ 1.1: New user signup flow → Supabase + Neo4j creation
- ✅ 1.2: Existing user login → Session validation
- ✅ 1.3: Supabase/Neo4j sync recovery → Auto-creation

**When to Run:**
- Before deploying auth changes
- After updating Supabase/Neo4j configuration
- When debugging login/signup issues

---

### 4. Quiz System Tests (`quiz/`) - Suite 3

**Purpose:** Validate quiz scoring and reward distribution logic.

**Files:**
- `test_quiz_node_assignment.js` - **Node type determination tests (NEW)**

**How to Run:**
```bash
cd unitTests/quiz/
node test_quiz_node_assignment.js

# Or use npm
npm run test:quiz
```

**What Gets Tested:**
- ✅ 3.1: Perfect score (10/10) → Legendary node assignment
- ✅ 3.2: High score (8-9/10) → Rare node assignment
- ✅ 3.3: Low score (3-7/10) → Common node assignment
- ✅ 3.4: React state timing bug prevention (fixed Oct 30, 2025)

**Critical Fix Tested:**
- finalScore calculation prevents async bug where 10/10 was recorded as 9/10

**When to Run:**
- After modifying quiz scoring logic
- Before deploying quiz changes
- When debugging legendary node assignment issues

---

### 5. Gamification Tests (`gamification/`) - Suite 5

**Purpose:** Validate XP awards and leveling formula.

**Files:**
- `test_xp_leveling.js` - **XP & leveling system tests (NEW)**

**How to Run:**
```bash
cd unitTests/gamification/
node test_xp_leveling.js

# Or use npm
npm run test:gamification
```

**What Gets Tested:**
- ✅ 5.1: XP award range (1.01-1.75 validation)
- ✅ 5.2: Level-up thresholds (24→25, 63→64, 168→169, 399→400)
- ✅ 5.3: Leveling formula verification: ((level-1)² + 4)²

**Formula Tested:**
- Level 1: 0 XP
- Level 2: 25 XP
- Level 3: 64 XP
- Level 4: 169 XP
- Level 5: 400 XP
- ... up to Level 10

**When to Run:**
- After modifying leveling formula
- Before deploying gamification changes
- When debugging XP/level inconsistencies

---

### 6. AI Chat Tests (`ai_chat/`) - Suite 2

**Purpose:** Validate AI chat API and Python ACE agent integration.

**Files:**
- `test_ai_chat_api.js` - **ACE agent execution tests (NEW)**

**How to Run:**
```bash
cd unitTests/ai_chat/
node test_ai_chat_api.js

# Or use npm
npm run test:ai-chat
```

**What Gets Tested:**
- ✅ 2.1: Python3 availability
- ✅ 2.1: ACE agent script exists
- ✅ 2.1: GEMINI_API_KEY configured
- ✅ 2.1: Python dependencies (langgraph, langchain)
- ✅ 2.1: ACE agent execution with simple query
- ✅ 2.3: Error handling for invalid input

**Note:** May take 30-60 seconds (includes Gemini API call)

**When to Run:**
- After modifying ACE agent code
- Before deploying AI changes
- When debugging "AI not responding" issues

---

### 7. Group Chat Tests (`group_chat/`) - Suite 4

**Purpose:** Validate @ai mention detection and thread context.

**Files:**
- `test_ai_mentions.js` - **@ai detection logic tests (NEW)**

**How to Run:**
```bash
cd unitTests/group_chat/
node test_ai_mentions.js

# Or use npm
npm run test:group-chat
```

**What Gets Tested:**
- ✅ 4.1: @ai detection patterns (7 test cases)
- ✅ 4.2: Sample message validation
- ✅ 4.3: Thread context requirements
- ✅ 4.4: Performance requirements (10 min max)

**Test Cases:**
- "@ai can you help?" → Detected ✅
- "Hey @ai, what is 2+2?" → Detected ✅
- "@AI help" → NOT detected (case sensitive) ❌
- And 4 more edge cases

**When to Run:**
- After modifying @ai detection logic
- Before deploying group chat changes
- When debugging @ai not triggering

---

### 8. Data Persistence Tests (`data_persistence/`) - Suite 7

**Purpose:** Validate Neo4j data persistence and integrity.

**Files:**
- `test_neo4j_persistence.js` - **Conversation & markdown persistence tests (NEW)**

**How to Run:**
```bash
cd unitTests/data_persistence/
node test_neo4j_persistence.js

# Or use npm
npm run test:persistence
```

**What Gets Tested:**
- ✅ 7.1: Conversation history with :NEXT chain integrity
- ✅ 7.2: Markdown notes auto-save and update

**Chain Validation:**
- Creates 5-message conversation
- Verifies :NEXT relationships
- Tests chain traversal
- Validates message count

**When to Run:**
- After modifying conversation storage logic
- Before deploying data schema changes
- When debugging message history issues

---

## Quick Commands

### Run All Tests (Master Runner)
```bash
cd unitTests/
./run_all_tests.sh

# Or use npm
npm test
```

### Run Individual Test Suites
```bash
# Prompts (most important - always run first)
npm run test:prompts

# Authentication flows
npm run test:auth

# Quiz node assignment
npm run test:quiz

# XP & leveling
npm run test:gamification

# AI chat (may take 30-60 seconds)
npm run test:ai-chat

# Group chat @ai mentions
npm run test:group-chat

# Data persistence
npm run test:persistence

# ACE memory (manual, can be slow)
cd ace_memory && python3 test_memory_comparison.py
```

---

## Installation

Before running tests, install Node.js dependencies:

```bash
cd unitTests/
npm install
```

**Required:**
- Node.js 18+
- Python 3.8+
- Neo4j credentials in `frontend/.env.local`
- Supabase credentials in `frontend/.env.local`
- Python packages: `pip3 install -r frontend/requirements.txt`

---

## Test Coverage

**Automated Tests (NEW):**
- ✅ Suite 1: Authentication flows (3 tests)
- ✅ Suite 2: AI chat API (2 tests)
- ✅ Suite 3: Quiz node assignment (4 tests)
- ✅ Suite 4: Group chat @ai mentions (4 test categories)
- ✅ Suite 5: XP & leveling (3 test categories)
- ✅ Suite 7: Data persistence (2 tests)
- ✅ Suite 8: System prompts (4 tests)
- ✅ ACE memory comparison (existing)

**Manual Testing Still Required:**
- Suite 6: Real-time Pusher features (requires multiple browsers)
- Suite 9: Edge cases (network interruption, concurrency)
- Suite 10.1: Large conversation performance (load testing)
- End-to-end user flows

See [docs/minimalTest/useCase.md](../docs/minimalTest/useCase.md) for complete manual test scenarios.

---

## Test Execution Time

| Test Suite | Expected Duration | Notes |
|------------|------------------|-------|
| Prompts | 3-5 seconds | Fast - import verification only |
| Authentication | 10-20 seconds | Creates test users in Supabase/Neo4j |
| Quiz | 2-5 seconds | Logic tests, no API calls |
| Gamification | 1-2 seconds | Formula validation only |
| AI Chat | 30-60 seconds | ⚠️ Includes Gemini API call |
| Group Chat | 1-2 seconds | Logic tests only |
| Data Persistence | 5-10 seconds | Neo4j read/write operations |
| **Total** | **~1-2 minutes** | Run all via `./run_all_tests.sh` |

---

## Related Documentation

- **Minimal Test Scenarios:** [docs/minimalTest/useCase.md](../docs/minimalTest/useCase.md)
- **Logging & Debug Guide:** [docs/telemetryAndObservability/log.md](../docs/telemetryAndObservability/log.md)
- **Prompts Documentation:** [prompts/README.md](../prompts/README.md)

---

## Pre-Deployment Checklist

Before deploying to production, run these critical tests:

```bash
cd unitTests/

# 1. System prompts (CRITICAL - always run first)
cd prompts && ./verify_all.sh && cd ..

# 2. Authentication flows
npm run test:auth

# 3. Quiz node assignment
npm run test:quiz

# 4. XP & leveling
npm run test:gamification

# 5. Data persistence
npm run test:persistence

# Or run all at once:
./run_all_tests.sh
```

**All tests must pass before deployment!**

---

## Adding New Tests

When adding new test files:

1. **Choose appropriate subdirectory:**
   - `auth/` - Authentication & user management
   - `ai_chat/` - AI responses & ACE agent
   - `quiz/` - Quiz scoring & rewards
   - `gamification/` - XP & leveling system
   - `group_chat/` - Group chat & @ai mentions
   - `data_persistence/` - Neo4j data integrity
   - `prompts/` - System prompts verification
   - `ace_memory/` - ACE memory system
   - Or create new subdirectory for new feature

2. **Follow naming convention:** `test_*.js` or `test_*.py`

3. **Add to `run_all_tests.sh`** if it's a critical path test

4. **Add npm script** to `package.json`

5. **Document in this README** with:
   - Purpose
   - How to run
   - What gets tested
   - When to run

6. **Update related documentation:**
   - docs/minimalTest/useCase.md
   - docs/telemetryAndObservability/log.md

---

## CI/CD Integration (Future)

These tests are designed to be integrated into a CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
name: Unit Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install Dependencies
        run: |
          cd unitTests && npm install
          pip3 install -r ../frontend/requirements.txt

      - name: Run All Tests
        run: cd unitTests && ./run_all_tests.sh
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          NEXT_PUBLIC_NEO4J_URI: ${{ secrets.NEO4J_URI }}
          NEXT_PUBLIC_NEO4J_USERNAME: ${{ secrets.NEO4J_USERNAME }}
          NEXT_PUBLIC_NEO4J_PASSWORD: ${{ secrets.NEO4J_PASSWORD }}
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
```

---

## Troubleshooting

**Tests fail with "Module not found":**
```bash
cd unitTests/
npm install
```

**Python tests fail:**
```bash
pip3 install -r frontend/requirements.txt
```

**Neo4j connection errors:**
- Check `frontend/.env.local` has correct credentials
- Verify Neo4j AuraDB is accessible
- Check firewall/network settings

**Supabase auth errors:**
- Check `frontend/.env.local` has correct URL and key
- Verify Supabase project is active
- Check for rate limiting

**Prompts tests fail:**
```bash
# Verify prompts exist
ls -la prompts/*.py

# Check Python can import
cd prompts && python3 -c "from ace_memory_prompts import REFLECTOR_PROMPT"
```

---

**Test Files:** 13 total (6 existing + 7 new)
**Test Suites:** 8 automated suites
**Coverage:** ~70% of critical paths (remaining 30% requires manual/E2E testing)
