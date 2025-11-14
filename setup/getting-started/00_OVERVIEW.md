# 🌟 Noodeia - Project Overview

**Making learning addictive in the best possible way**

---

## 📖 What is Noodeia?

**N**ode **O**ptimized **O**rchestration **D**esign for **E**ducational **I**ntelligence **A**rchitecture

Noodeia is a personalized AI tutor application that combines cutting-edge AI technology with proven educational techniques and game-based learning. Unlike traditional AI chatbots that simply answer questions, Noodeia:

✅ **Remembers each student** - Uses advanced memory system to track learning patterns
✅ **Guides, doesn't tell** - Employs Socratic method to teach critical thinking
✅ **Makes learning fun** - Gamification with XP, levels, quizzes, and competitions
✅ **Adapts to each learner** - Personalizes teaching strategies based on struggles and successes
✅ **Supports collaboration** - Group study with AI assistance

---

## 🎯 Why Noodeia Exists

### The Problem

American education faces a crisis:
- Less than 50% of kids can read at grade level
- 400,000+ teaching positions unfulfilled or filled by uncertified teachers
- Students falling behind, tutors burning out

### The Solution

Noodeia provides an AI-powered educational companion that:
- Scales personalized 1-on-1 tutoring to unlimited students
- Never gets tired or frustrated
- Remembers every student's unique learning journey
- Makes learning engaging through games and rewards
- Supports after-school programs and teachers

---

## 👥 Target Users

### Students (Middle & High School)

**What they get:**
- Homework help that guides instead of just giving answers
- Engaging gamification (XP, levels, quizzes)
- Fun vocabulary games
- Study groups with friends
- Personalized learning that adapts to their struggles

### Parents

**What they get:**
- Visibility into child's learning progress
- Assurance that AI is teaching, not cheating
- Weekly achievement reports
- Safe, monitored learning environment

### Teachers & After-School Staff

**What they get:**
- Individual student progress tracking
- Automated quizzes and assessments
- Student activity dashboards
- Communication tools for parents
- Reduced administrative burden

---

## 🏗️ Technology Stack

### Frontend
- **Framework**: Next.js 15.2.4 with App Router
- **UI Library**: React 19
- **Styling**: Tailwind CSS + Radix UI components
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Real-time**: Pusher (optional)

### Backend
- **Database**: Neo4j AuraDB (Graph Database)
- **Authentication**: Supabase Auth (JWT tokens)
- **API**: Next.js API Routes (serverless functions)

### AI Engine
- **LLM**: Google Gemini 2.5 Flash
- **Agent Framework**: LangGraph (multi-agent reasoning)
- **Memory System**: ACE (Agentic Context Engineering)
- **Tools**: Calculator (AST-based), Web Search (Tavily), Database Query (Neo4j)

### Python Stack (ACE Agent)
- **Workflow**: LangGraph
- **LLM Integration**: LangChain + langchain-google-genai
- **Memory**: Custom ACE implementation with Neo4j persistence
- **Tools**: Tavily Search, Neo4j driver

### Deployment
- **Platform**: Render (recommended)
- **Alternative**: Railway
- **Not supported**: Vercel (timeout and Python limitations)

---

## 🏛️ Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                           │
│  (Next.js 15 + React 19 + Tailwind CSS + Framer Motion)        │
└────────────┬──────────────────────────────────┬─────────────────┘
             │                                  │
             ↓                                  ↓
    ┌────────────────┐                 ┌───────────────────┐
    │  Supabase Auth │                 │   Next.js API     │
    │  (JWT Tokens)  │                 │     Routes        │
    └────────────────┘                 └────────┬──────────┘
                                                 │
                      ┌──────────────────────────┼──────────────────────┐
                      │                          │                      │
                      ↓                          ↓                      ↓
            ┌──────────────────┐      ┌────────────────┐    ┌──────────────────┐
            │   Neo4j AuraDB   │      │  Python Agent  │    │   Gemini API     │
            │  (Graph Database)│      │  (Subprocess)  │    │ (Google AI)      │
            └──────────────────┘      └────────┬───────┘    └──────────────────┘
                                                │
                                                ↓
                                    ┌────────────────────────┐
                                    │   LangGraph + ACE      │
                                    │  (Reasoning + Memory)  │
                                    └────────────────────────┘
```

### Data Flow: AI Tutor Request

```
1. User sends message
   ↓
2. Frontend → /api/ai/chat (with auth token)
   ↓
3. API validates token (Supabase)
   ↓
4. API spawns Python subprocess (run_ace_agent.py)
   ↓
5. LangGraph agent:
   - Router: Choose reasoning mode (COT/TOT/ReAct)
   - Planner: Configure parameters
   - Memory: Retrieve 10 relevant bullets from Neo4j
   - Solver: Generate response with memory context
   - Critic: Clean and format answer
   - Learning: Reflect and update memory (Neo4j)
   ↓
6. Response returned to frontend
   ↓
7. UI displays answer + awards XP
   ↓
8. Conversation saved to Neo4j
```

### Database Architecture

**Neo4j Graph Structure:**

#### AI Tutor (1-on-1)
```
(:User)-[:HAS]->(:Session)-[:OCCURRED]->(:Chat)-[:NEXT]->(:Chat)
```
- Sequential conversation messages
- Each session is isolated
- Messages linked with :NEXT relationships

#### Group Chat (Multi-user)
```
(:User)-[:MEMBER_OF]->(:GroupChat)-[:CONTAINS]->(:Message)
(:Message)-[:REPLY_TO]->(:Message)
(:User)-[:POSTED]->(:Message)
```
- Slack-style threading
- Multiple users per group
- Messages can reply to other messages

#### ACE Memory (Per-learner)
```
(:User)-[:HAS_ACE_MEMORY]->(:AceMemoryState {
  memory_json: {...},  # Structured bullets
  access_clock: 0
})
```
- Per-student memory isolation
- Stores learning insights as "bullets"
- Semantic, episodic, procedural memory types

**Complete schema**: See [../technical/DATABASE_SCHEMA.md](../technical/DATABASE_SCHEMA.md)

---

## ✨ Key Features

### 1. AI Tutor with Memory

**Personalized 1-on-1 tutoring:**
- AI remembers each student's struggles and successes
- Adapts teaching strategies based on past interactions
- Uses Socratic method (guides with questions, not direct answers)
- Maintains conversation context across sessions

**Memory System (ACE):**
- Stores teaching strategies as retrievable "bullets"
- 3 memory types: Semantic (facts), Episodic (experiences), Procedural (instructions)
- Automatically learns from every interaction
- Retrieves relevant insights for each question

### 2. Gamification System

**Earn XP and Level Up:**
- 1.01-1.75 XP per AI interaction
- Advanced leveling formula: ((level-1)² + 4)²
- Animated XP gains and level-up celebrations
- Visual progress tracking in sidebar

**Leaderboard Competition:**
- XP rankings (who's earned most experience)
- Accuracy rankings (who's best at quizzes)
- Timeframes: Daily, Weekly, Monthly, All-Time
- Top 3 players get special animated cards

### 3. Quiz System

**Test Knowledge:**
- Multiple-choice questions
- Automatic scoring and feedback
- Earn rewards based on performance:
  - 100% accuracy → Legendary node (25-30 XP)
  - 80-99% accuracy → Rare node (12-15 XP)
  - 30-79% accuracy → Common node (3-7 XP)

**Gacha-Style Rewards:**
- Interactive orb animation
- Click to crack open reward
- Confetti celebrations
- Card flip reveal animation

### 4. Vocabulary Games for Kids

**4 Game Modes:**
- **Word Match**: Match words with emoji pictures (10 pts)
- **Spelling Bee**: Type correct spelling (15 pts)
- **Memory Cards**: Classic memory matching (20 pts)
- **Word Builder**: Build words from scrambled letters (25 pts)

**108 Vocabulary Items:**
- Animals, fruits, vegetables, weather
- Body parts, school items, transportation
- Kid-friendly definitions
- Intelligent hint system

### 5. Todo/Kanban Board

**Task Management:**
- Create tasks with title, description, priority
- Drag-and-drop between columns (To Do, In Progress, Done)
- Reorder tasks within columns
- Earn XP when completing tasks
- Glass morphism design

### 6. Group Chat & Collaboration

**Multi-User Features:**
- Create/join groups with access keys
- Slack-style threading (reply to any message)
- @ai mentions for AI assistance in conversations
- Real-time updates (with Pusher)
- Edit/delete messages

**AI in Group Chat:**
- Type @ai to invoke AI assistant
- AI reads full thread context
- AI responds with personalized greeting
- Works in main channel and thread replies

### 7. Theme Customization

**4 Color Themes:**
- Cream (default) - Warm beige tones
- Lilac - Soft purple
- Rose - Gentle pink
- Sky - Light blue

**Avatar Customization:**
- Choose emoji or initials
- 48 popular emojis + custom emoji input
- 12 preset colors + custom color picker
- Consistent display across all pages

### 8. Additional Features

- **Markdown Notes**: Per-conversation note-taking with auto-save
- **Mind Maps**: Visual note organization
- **Achievements**: Track milestones and progress
- **Text-to-Speech**: Listen to AI responses (optional)
- **Admin Dashboard**: For teachers to monitor all students

---

## 🎓 Educational Philosophy

### Socratic Teaching Method

Noodeia doesn't just give answers - it teaches:

**Traditional AI**: "What's 1/2 + 1/3?"
→ Answer: "5/6"

**Noodeia**: "What's 1/2 + 1/3?"
→ "Great question! What do you think we need to do first when adding fractions with different denominators?"

### Research-Backed Approach

Based on studies showing:
- AI tutors that give direct answers harm learning
- Socratic questioning improves critical thinking
- Gamification increases engagement and retention
- Personalized learning improves outcomes
- Memory-enhanced AI provides better educational support

**References:**
- Generative AI Can Harm Learning (Bastani et al.)
- AI-Powered Math Tutoring Platform Research (Chudziak & Kostka)
- Agentic Workflow for Education (Jiang et al.)

---

## 🔬 Advanced Features

### ACE Memory System

**Long-Term Memory Based Self-Evolving Agentic Context Engineering**

**How it works:**
1. Student interacts with AI tutor
2. AI responds with personalized guidance
3. After interaction, **Reflector** analyzes what happened
4. **Curator** extracts lessons and insights
5. Lessons stored as "bullets" in student's memory (Neo4j)
6. Next time student asks similar question, AI retrieves relevant bullets
7. AI response is informed by past struggles and successes

**Memory Types:**
- **Semantic**: General knowledge and strategies (e.g., "Find LCD for fractions")
- **Episodic**: Specific student experiences (e.g., "Student confused about 1/2 + 1/3")
- **Procedural**: Step-by-step instructions (e.g., "Visual pie charts help this student")

**Decay Model:**

Memory fades over time using formula:
```
Score = S(1-r_semantic)^t + E(1-r_episodic)^t + P(1-r_procedural)^t
```
- Recent struggles prioritized
- Core knowledge retained longer
- Balances short-term needs with long-term learning

**Details**: See [../technical/ACE_README.md](../technical/ACE_README.md)

### Multi-Agent LangGraph System

**Intelligent routing and reasoning:**

**Router** → Chooses strategy:
- COT (Chain of Thought): Step-by-step for straightforward questions
- TOT (Tree of Thought): Multiple paths for complex problems
- ReAct (Reasoning + Acting): Tool use for calculations and research

**Planner** → Configures parameters

**Solver** → Executes with memory-enriched context

**Critic** → Cleans and formats answer

**ACE Learning** → Updates memory for future use

**Tools Available:**
- Calculator (secure AST parser for math)
- Web Search (Tavily for current information)
- Database Query (Neo4j for student data)

**Details**: See [../technical/AGENT.md](../technical/AGENT.md)

---

## 🎮 Gamification Design

### XP System

**Earning XP:**
- AI Tutor message: 1.01-1.75 XP (random)
- Complete task: 1.01-1.75 XP
- Quiz rewards:
  - Legendary (100%): 25-30 XP
  - Rare (80-99%): 12-15 XP
  - Common (30-79%): 3-7 XP
- Vocabulary games: 2-24 XP depending on mode

**Leveling Formula:**

Level X requires: **((X-1)² + 4)²** total XP

**Level Requirements:**
```
Level 1: 0 XP (starting point)
Level 2: 25 XP (+25 to advance)
Level 3: 64 XP (+39 to advance)
Level 4: 169 XP (+105 to advance)
Level 5: 400 XP (+231 to advance)
Level 10: 7,200 XP
Level 20: 148,225 XP
Level 30: 722,500 XP
```

**Why exponential?**
- Prevents power-leveling
- Creates long-term goals
- Encourages consistent engagement
- Rewards persistence

**Guide**: See [../user-guides/GAMIFICATION.md](../user-guides/GAMIFICATION.md)

---

## 🗄️ Database Design Philosophy

### Why Neo4j Graph Database?

**Traditional databases (SQL)**:
- Store data in tables with rows and columns
- Relationships are foreign keys
- Complex queries require many JOINs
- Hard to model educational relationships

**Neo4j Graph Database:**
- Stores data as nodes (entities) and relationships (connections)
- Naturally models learning pathways
- Fast traversal of relationships
- Perfect for:
  - Conversation threads (message → message)
  - Learning prerequisites (concept → concept)
  - Student progress tracking
  - Memory retrieval (similar concepts)

**Example Queries:**

**Get full conversation:**
```cypher
MATCH path = (s:Session)-[:OCCURRED]->(first:Chat)-[:NEXT*0..]->(c:Chat)
RETURN path
```
- One query, no JOINs
- Fast traversal
- Natural representation

**Find similar learning experiences:**
```cypher
MATCH (u:User {id: $userId})-[:HAS_ACE_MEMORY]->(m:AceMemoryState)
RETURN bullets WHERE bullet.topic = 'fractions'
```

---

## 🔐 Security & Privacy

### Authentication
- **Supabase Auth**: Industry-standard JWT tokens
- **Secure storage**: Passwords never stored locally
- **Session management**: Automatic token refresh

### Data Storage
- **Neo4j AuraDB**: Enterprise-grade security
- **Encrypted connections**: All data transmitted over TLS
- **Access control**: Per-user data isolation

### API Security
- **Authentication required**: All endpoints verify JWT
- **Ownership validation**: Users can only access their own data
- **Input sanitization**: XSS and injection prevention
- **Rate limiting**: Prevents abuse

### AI Safety
- **No code execution**: Calculator uses AST parser (no eval())
- **Content filtering**: Appropriate for educational use
- **Memory isolation**: Students can't access others' data
- **Audit logs**: All interactions can be reviewed

---

## 📊 Performance Characteristics

### Response Times (Typical)

- **Page load**: 1-2 seconds
- **AI response**: 5-15 seconds (includes reasoning + memory retrieval)
- **Database query**: 50-150ms
- **Real-time message**: Instant (with Pusher)
- **Quiz completion**: <1 second
- **Task creation**: <500ms

### Scalability

**Free tier limits:**
- Neo4j: 50,000 nodes, 175,000 relationships
- Gemini: 15 requests/minute
- Render: 512MB RAM, auto-sleep after 15 min

**Production capacity** (paid plans):
- ~100-500 concurrent students
- Unlimited database (paid Neo4j)
- Higher Gemini rate limits
- 2-4GB RAM on Render

---

## 🔄 Development Workflow

### Local Development

```bash
# Install dependencies
npm install --legacy-peer-deps
pip3 install -r requirements.txt

# Initialize database
npm run setup-neo4j

# Start dev server
npm run dev
```

### Testing

```bash
# Automated tests
cd unitTests
./run_all_tests.sh

# Manual testing
npm run dev
# Test all features in browser
```

### Deployment

```bash
# Push to GitHub
git push origin main

# Render auto-deploys
# Monitor at dashboard.render.com
```

---

## 📚 Documentation Structure

This setup documentation is organized into folders:

### getting-started/ (You are here!)
**Step-by-step setup guides** (read in order):
- 00_OVERVIEW.md ← You are here
- 01_PREREQUISITES.md → System requirements and accounts
- 02_INSTALLATION.md → Install dependencies
- 03_CONFIGURATION.md → Environment variables
- 04_DATABASE_SETUP.md → Initialize Neo4j
- 05_PYTHON_ACE_SETUP.md → Setup ACE agent
- 06_LOCAL_DEVELOPMENT.md → Run and test
- 07_DEPLOYMENT.md → Deploy to production
- 08_COMPLETE_SETUP.md → All-in-one guide

### deployment/
**Platform-specific deployment guides:**
- RENDER.md → Complete Render deployment (recommended)

### technical/
**Deep-dive technical references:**
- DATABASE_SCHEMA.md → Complete Neo4j schema
- API_REFERENCE.md → All API endpoints
- PYTHON_SETUP.md → Python environment details
- ACE_README.md → ACE memory architecture
- AGENT.md → LangGraph agent architecture

### user-guides/
**Feature usage guides:**
- GAMIFICATION.md → XP and leveling
- QUIZ_SYSTEM.md → Taking quizzes
- KANBAN.md → Task management
- LEADERBOARD.md → Rankings
- VOCABULARY_GAMES.md → Word games
- GROUP_CHAT.md → Collaboration
- THEMES.md → Customization

### Root level
- README.rst → This navigation guide
- TROUBLESHOOTING.md → Common issues
- QUICKSTART.md → 5-minute quick start

---

## 🎯 Quick Links

**For first-time developers:**
→ Start with [01_PREREQUISITES.md](./01_PREREQUISITES.md)

**For experienced developers:**
→ Jump to [QUICKSTART.md](../QUICKSTART.md)

**For complete reference:**
→ Read [08_COMPLETE_SETUP.md](./08_COMPLETE_SETUP.md)

**Having issues?**
→ Check [TROUBLESHOOTING.md](../TROUBLESHOOTING.md)

**Want to deploy?**
→ See [deployment/RENDER.md](../deployment/RENDER.md)

---

## 🚀 Next Steps

1. **Read Prerequisites**: [01_PREREQUISITES.md](./01_PREREQUISITES.md)
2. **Install Software**: [02_INSTALLATION.md](./02_INSTALLATION.md)
3. **Configure Environment**: [03_CONFIGURATION.md](./03_CONFIGURATION.md)
4. **Setup Database**: [04_DATABASE_SETUP.md](./04_DATABASE_SETUP.md)
5. **Start Building!**

---

## 📞 Support & Resources

**Documentation:**
- Complete setup guides in `getting-started/`
- User guides for each feature in `user-guides/`
- Technical references in `technical/`

**Testing:**
- Manual test scenarios: `docs/minimalTest/useCase.md`
- Automated tests: `unitTests/`
- Logging guide: `docs/telemetryAndObservability/log.md`

**Community:**
- GitHub Issues: Bug reports and feature requests
- GitHub Discussions: Questions and ideas

**External Resources:**
- Neo4j Documentation: https://neo4j.com/docs/
- Supabase Docs: https://supabase.com/docs
- Google AI: https://ai.google.dev/docs
- Render Docs: https://render.com/docs
