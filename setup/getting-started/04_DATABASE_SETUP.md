# 🗄️ Database Setup Guide

Complete guide to initializing and configuring your Neo4j database.

---

## ✅ Before You Begin

Ensure you have:
- ✅ Neo4j AuraDB instance created ([01_PREREQUISITES.md](./01_PREREQUISITES.md))
- ✅ Environment variables configured ([03_CONFIGURATION.md](./03_CONFIGURATION.md))
- ✅ Dependencies installed ([02_INSTALLATION.md](./02_INSTALLATION.md))

---

## 🎯 Database Architecture Overview

Noodeia uses **Neo4j Graph Database** to store ALL application data.

**Why Graph Database?**
- Natural representation of learning relationships
- Fast traversal of conversation threads
- Flexible schema for educational data
- Powerful query language (Cypher)

**What's Stored:**
- User profiles and progress
- AI tutor conversations
- Group chat messages with threading
- Quiz sessions and scores
- Task/todo items
- Leaderboard data
- ACE memory (per-student learning insights)
- Markdown notes and mind maps

---

## 🚀 Step 1: Test Database Connection

### Verify Credentials

Check your `.env.local` has Neo4j variables:

```bash
cd frontend
cat .env.local | grep NEO4J
```

**Should show:**
```
NEXT_PUBLIC_NEO4J_URI=neo4j+s://xxxxx.databases.neo4j.io
NEXT_PUBLIC_NEO4J_USERNAME=neo4j
NEXT_PUBLIC_NEO4J_PASSWORD=your-password
```

### Test Connection

```bash
npm run setup-neo4j
```

**Expected output:**
```
🚀 Starting Neo4j AuraDB schema setup...
✅ Connection verified
✅ Creating constraints...
✅ Creating indexes...
✅ Neo4j schema setup complete!
```

**If connection fails:**
- Verify Neo4j instance is running (check Neo4j Aura Console)
- Check URI format includes `neo4j+s://` prefix
- Verify password is correct (no extra spaces)
- Try accessing Neo4j Browser to confirm instance is accessible

---

## 📊 Step 2: Initialize Core Schema

### Run Core Setup Script

```bash
npm run setup-neo4j
```

**What this creates:**

**Constraints** (ensure data uniqueness):
- User.id (unique)
- Session.id (unique)
- Chat.id (unique)

**Indexes** (for fast queries):
- User.email
- User.createdAt
- Session.createdAt
- Session.updatedAt
- Chat.createdAt
- Chat.role

**Script location**: `frontend/scripts/setup-neo4j.js`

### Verify Core Schema

**Check constraints:**
```cypher
SHOW CONSTRAINTS
```

**Check indexes:**
```cypher
SHOW INDEXES
```

Run these in Neo4j Browser: https://console.neo4j.io/ → Open your database

---

## 👥 Step 3: Initialize Group Chat Feature

### Run Group Chat Setup

```bash
npm run setup-groupchat
```

**What this creates:**

**Constraints:**
- GroupChat.id (unique)
- GroupChat.accessKey (unique)
- Message.id (unique)

**Indexes:**
- Message.createdAt
- Message.createdBy
- GroupChat.createdAt

**Script location**: `frontend/scripts/setup-groupchat.js`

---

## 📝 Step 4: Initialize Markdown Notes Feature

### Run Markdown Setup

```bash
npm run setup-markdown
```

**What this creates:**

**Constraints:**
- MarkdownNote.id (unique)
- MarkdownNote.conversationId (unique)
- MindMap.id (unique)
- MindMap.conversationId (unique)

**Indexes:**
- MarkdownNote.lastModified
- MindMap.lastModified

**Script location**: `frontend/scripts/setup-markdown.js`

---

## 📝 Step 5: Initialize Quiz System

### Run Quiz Setup

```bash
npm run setup-quiz
```

**What this creates:**

**Constraints:**
- QuizSession.id (unique)
- QuizProgress.userId (unique)

**Indexes:**
- QuizSession.completedAt
- QuizSession.score
- QuizProgress.totalCompleted

**Script location**: `frontend/scripts/setup-quiz.js`

---

## ✅ Step 6: Initialize All Features at Once

### Run All Setup Scripts

For convenience, run all initialization scripts sequentially:

```bash
npm run setup-neo4j && \
npm run setup-groupchat && \
npm run setup-markdown && \
npm run setup-quiz
```

**Expected output:**
```
🚀 Starting Neo4j AuraDB schema setup...
✅ Neo4j schema setup complete!

🚀 Starting Group Chat schema setup...
✅ Group Chat schema setup complete!

🚀 Starting Markdown schema setup...
✅ Markdown schema setup complete!

🚀 Starting Quiz schema setup...
✅ Quiz schema setup complete!
```

---

## 🔍 Step 7: Verify Database Initialization

### Method 1: Neo4j Browser

1. Go to https://console.neo4j.io/
2. Find your database instance
3. Click "Open" → Opens Neo4j Browser
4. Run verification queries

**Check if database is empty:**
```cypher
MATCH (n) RETURN count(n) as total_nodes
```

**Should show**: `total_nodes: 0` (no data yet, just schema)

**View all constraints:**
```cypher
SHOW CONSTRAINTS
```

**Should show**: 8+ constraints (User.id, Session.id, Chat.id, GroupChat.id, etc.)

**View all indexes:**
```cypher
SHOW INDEXES
```

**Should show**: 15+ indexes

### Method 2: From Application

Start the dev server:
```bash
npm run dev
```

Open http://localhost:3000/login and try:
1. Sign up with test account
2. Should create User node in Neo4j
3. Check Neo4j Browser:
   ```cypher
   MATCH (u:User) RETURN u
   ```
4. Should show your user node

---

## 🗺️ Database Schema Overview

For complete schema reference, see [../technical/DATABASE_SCHEMA.md](../technical/DATABASE_SCHEMA.md)

### Core Node Types

**User**
- Properties: id, email, name, xp, level, createdAt, updatedAt
- Purpose: User profiles and authentication

**Session** (AI Tutor)
- Properties: id, title, createdAt, updatedAt
- Purpose: Conversation containers

**Chat** (AI Tutor Messages)
- Properties: id, role, content, createdAt
- Purpose: Individual messages in AI tutor

**GroupChat**
- Properties: id, name, accessKey, createdAt, createdBy
- Purpose: Multi-user chat rooms

**Message** (Group Chat Messages)
- Properties: id, content, createdBy, createdAt, parentId, edited
- Purpose: Messages in group chat with threading

**Task** (Kanban)
- Properties: id, title, description, status, priority, createdAt
- Purpose: Todo items

**QuizSession**
- Properties: id, score, totalQuestions, xpEarned, completedAt
- Purpose: Quiz completion records

**AceMemoryState** (AI Memory)
- Properties: id, memory_json, access_clock, createdAt, updatedAt
- Purpose: Per-learner AI memory storage

### Key Relationships

```cypher
# AI Tutor
(:User)-[:HAS]->(:Session)-[:OCCURRED]->(:Chat)-[:NEXT]->(:Chat)

# Group Chat
(:User)-[:MEMBER_OF]->(:GroupChat)
(:GroupChat)-[:CONTAINS]->(:Message)
(:Message)-[:REPLY_TO]->(:Message)
(:User)-[:POSTED]->(:Message)

# Gamification
(:User)-[:COMPLETED]->(:QuizSession)
(:User)-[:HAS_QUIZ_PROGRESS]->(:QuizProgress)

# ACE Memory
(:User)-[:HAS_ACE_MEMORY]->(:AceMemoryState)

# Tasks
(:User)-[:HAS_TASK]->(:Task)
```

---

## 🧹 Cleanup and Reset

### Reset Database (Development Only)

**⚠️ WARNING**: This deletes ALL data!

```cypher
MATCH (n) DETACH DELETE n
```

Then re-run setup scripts:
```bash
npm run setup-neo4j && \
npm run setup-groupchat && \
npm run setup-markdown && \
npm run setup-quiz
```

### Delete Test Data

**Delete specific user:**
```cypher
MATCH (u:User {email: 'test@example.com'})
OPTIONAL MATCH (u)-[r]->(n)
DETACH DELETE u, n
```

**Delete old sessions:**
```cypher
MATCH (s:Session)
WHERE s.updatedAt < datetime() - duration({days: 30})
OPTIONAL MATCH (s)-[:OCCURRED]->(c:Chat)
DETACH DELETE s, c
```

---

## 🔧 Advanced Configuration

### Connection Pool Settings

The Neo4j driver uses default connection pooling. To customize (advanced users):

**Edit**: `frontend/lib/neo4j.js`

```javascript
const driver = neo4j.driver(
  uri,
  neo4j.auth.basic(username, password),
  {
    maxConnectionPoolSize: 50,      # Default: 100
    connectionAcquisitionTimeout: 60000,  # 60 seconds
    disableLosslessIntegers: true   # Return JavaScript numbers
  }
)
```

### Database Indexes Optimization

For large datasets (1000+ students), consider additional indexes:

```cypher
# Index for leaderboard queries
CREATE INDEX user_xp_index IF NOT EXISTS FOR (u:User) ON (u.xp);
CREATE INDEX quiz_completed_index IF NOT EXISTS FOR (q:QuizSession) ON (q.completedAt);

# Index for search
CREATE TEXT INDEX session_title_text IF NOT EXISTS FOR (s:Session) ON (s.title);
```

---

## 📊 Useful Database Queries

### Development Queries

**Count all nodes by type:**
```cypher
MATCH (u:User)
OPTIONAL MATCH (u)-[:HAS]->(s:Session)
OPTIONAL MATCH (s)-[:OCCURRED]->(c:Chat)
OPTIONAL MATCH (u)-[:HAS_TASK]->(t:Task)
OPTIONAL MATCH (u)-[:COMPLETED]->(q:QuizSession)
RETURN
  count(DISTINCT u) as users,
  count(DISTINCT s) as sessions,
  count(DISTINCT c) as chats,
  count(DISTINCT t) as tasks,
  count(DISTINCT q) as quizzes
```

**View user's data:**
```cypher
MATCH (u:User {email: 'user@example.com'})
OPTIONAL MATCH (u)-[:HAS]->(s:Session)
OPTIONAL MATCH (u)-[:COMPLETED]->(q:QuizSession)
RETURN u.name, u.xp, u.level, count(s) as sessions, count(q) as quizzes
```

**View recent activity:**
```cypher
MATCH (u:User)-[:COMPLETED]->(q:QuizSession)
WHERE q.completedAt >= datetime() - duration({days: 7})
RETURN u.name, q.score, q.totalQuestions, q.completedAt
ORDER BY q.completedAt DESC
LIMIT 10
```

### Maintenance Queries

**Find orphaned nodes:**
```cypher
MATCH (c:Chat)
WHERE NOT (c)<-[:OCCURRED]-()
RETURN count(c) as orphaned_chats
```

**Find users without profiles:**
```cypher
MATCH (u:User)
WHERE u.name IS NULL OR u.email IS NULL
RETURN u
```

**Database statistics:**
```cypher
CALL apoc.meta.stats()
```

Note: Requires APOC plugin (usually pre-installed on AuraDB)

---

## 🎯 Database Setup Complete!

Your Neo4j database is now ready for Noodeia!

✅ Core schema initialized
✅ All features configured
✅ Constraints and indexes created
✅ Connection verified

---

## 📚 Next Steps

1. **Test ACE Agent**: [05_PYTHON_ACE_SETUP.md](./05_PYTHON_ACE_SETUP.md)
2. **Start Development**: [06_LOCAL_DEVELOPMENT.md](./06_LOCAL_DEVELOPMENT.md)
3. **Complete Schema Reference**: [../technical/DATABASE_SCHEMA.md](../technical/DATABASE_SCHEMA.md)

---

## ❓ Need Help?

**Connection issues?**
- Verify credentials in `.env.local`
- Check Neo4j instance status in Aura Console
- See [../TROUBLESHOOTING.md](../TROUBLESHOOTING.md)

**Schema issues?**
- Scripts can be re-run safely (use IF NOT EXISTS)
- Check Neo4j Browser for constraint conflicts
- Review setup script logs for errors

**Want to learn Cypher?**
- Neo4j Cypher Guide: https://neo4j.com/docs/cypher-manual/current/
- Interactive tutorial: https://neo4j.com/graphacademy/
