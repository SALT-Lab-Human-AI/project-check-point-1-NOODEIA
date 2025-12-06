# 🗄️ Neo4j Database Schema - Complete Reference

Comprehensive documentation of Noodeia's Neo4j graph database structure.

---

## 📊 Schema Overview

**Total Components:**
- **Node Types**: 11
- **Relationship Types**: 13
- **Constraints**: 10
- **Indexes**: 13+

**Schema Purpose:**
Stores all application data in graph format for efficient relationship traversal and educational data modeling.

---

## 🔷 Node Types

### 1. User (Core Profile)

**Label**: `User`

**Purpose**: Stores user profiles, authentication data, and gamification state

**Properties:**
```cypher
id: String (unique)           # User ID from Supabase Auth
email: String (indexed)       # User email address
name: String                  # Display name
xp: Integer (default: 0)      # Total experience points
level: Integer (default: 1)   # Current level
iconType: String (optional)   # Avatar type: 'initials' or 'emoji'
iconEmoji: String (optional)  # Selected emoji (if type=emoji)
iconColor: String (optional)  # Hex color (if type=initials)
createdAt: DateTime           # Account creation
updatedAt: DateTime           # Last profile update
```

**Constraints:**
```cypher
CREATE CONSTRAINT user_id_unique IF NOT EXISTS
FOR (u:User) REQUIRE u.id IS UNIQUE
```

**Indexes:**
```cypher
CREATE INDEX user_email_idx IF NOT EXISTS
FOR (u:User) ON (u.email)
```

**Relationships:**
- `(User)-[:HAS]->(Session)` - Owns AI tutor conversations
- `(User)-[:MEMBER_OF]->(GroupChat)` - Group memberships
- `(User)-[:POSTED]->(Message)` - Group chat messages
- `(User)-[:HAS_TASK]->(Task)` - Kanban tasks
- `(User)-[:COMPLETED]->(QuizSession)` - Completed quizzes
- `(User)-[:HAS_QUIZ_PROGRESS]->(QuizProgress)` - Quiz statistics
- `(User)-[:HAS_ACE_MEMORY]->(AceMemoryState)` - AI memory

**Example:**
```cypher
MATCH (u:User {email: 'student@example.com'})
RETURN u.name, u.xp, u.level
```

---

### 2. Session (AI Tutor Conversation)

**Label**: `Session`

**Purpose**: Containers for AI tutor 1-on-1 conversations

**Properties:**
```cypher
id: String (unique)           # UUID session identifier
title: String                 # Conversation title (auto-generated)
createdAt: DateTime (indexed) # Session creation
updatedAt: DateTime (indexed) # Last interaction
hasMarkdown: Boolean          # Whether notes exist (default: false)
```

**Constraints:**
```cypher
CREATE CONSTRAINT session_id_unique IF NOT EXISTS
FOR (s:Session) REQUIRE s.id IS UNIQUE
```

**Indexes:**
```cypher
CREATE INDEX session_created_at_idx IF NOT EXISTS
FOR (s:Session) ON (s.createdAt)

CREATE INDEX session_updated_at_idx IF NOT EXISTS
FOR (s:Session) ON (s.updatedAt)
```

**Relationships:**
- `(User)-[:HAS]->(Session)` - User owns session
- `(Session)-[:OCCURRED]->(Chat)` - Contains messages
- `(Session)-[:HAS_NOTES]->(MarkdownNote)` - Associated notes
- `(Session)-[:HAS_MINDMAP]->(MindMap)` - Associated mind map

**Example:**
```cypher
MATCH (u:User {id: $userId})-[:HAS]->(s:Session)
RETURN s.title, s.updatedAt
ORDER BY s.updatedAt DESC
LIMIT 10
```

---

### 3. Chat (AI Tutor Message)

**Label**: `Chat`

**Purpose**: Individual messages in AI tutor conversations

**Properties:**
```cypher
id: String (unique)           # UUID message identifier
role: String (indexed)        # 'user' or 'assistant'
content: String               # Message text
createdAt: DateTime (indexed) # Message timestamp
```

**Constraints:**
```cypher
CREATE CONSTRAINT chat_id_unique IF NOT EXISTS
FOR (c:Chat) REQUIRE c.id IS UNIQUE
```

**Indexes:**
```cypher
CREATE INDEX chat_created_at_idx IF NOT EXISTS
FOR (c:Chat) ON (c.createdAt)

CREATE INDEX chat_role_idx IF NOT EXISTS
FOR (c:Chat) ON (c.role)
```

**Relationships:**
- `(Session)-[:OCCURRED]->(Chat)` - Belongs to session
- `(Chat)-[:NEXT]->(Chat)` - Sequential ordering

**Chain Structure:**
```cypher
# Messages form linked list
(first:Chat)-[:NEXT]->(second:Chat)-[:NEXT]->(third:Chat)
```

**Example:**
```cypher
# Get full conversation in order
MATCH (s:Session {id: $sessionId})-[:OCCURRED]->(first:Chat)
WHERE NOT EXISTS((first)<-[:NEXT]-())
MATCH path = (first)-[:NEXT*0..]->(c:Chat)
RETURN c.role, c.content, c.createdAt
ORDER BY c.createdAt ASC
```

---

### 4. GroupChat (Chat Room)

**Label**: `GroupChat`

**Purpose**: Multi-user chat rooms with access control

**Properties:**
```cypher
id: String (unique)              # UUID group identifier
name: String                     # Group name
description: String (optional)   # Group description
accessKey: String (unique)       # Join key
createdAt: DateTime (indexed)    # Creation timestamp
createdBy: String                # Creator user ID
```

**Constraints:**
```cypher
CREATE CONSTRAINT groupchat_id_unique IF NOT EXISTS
FOR (g:GroupChat) REQUIRE g.id IS UNIQUE

CREATE CONSTRAINT groupchat_accessKey_unique IF NOT EXISTS
FOR (g:GroupChat) REQUIRE g.accessKey IS UNIQUE
```

**Indexes:**
```cypher
CREATE INDEX groupchat_access_key_idx IF NOT EXISTS
FOR (g:GroupChat) ON (g.accessKey)

CREATE INDEX groupchat_created_idx IF NOT EXISTS
FOR (g:GroupChat) ON (g.createdAt)
```

**Relationships:**
- `(User)-[:MEMBER_OF]->(GroupChat)` - Memberships
- `(GroupChat)-[:CONTAINS]->(Message)` - Messages

**Example:**
```cypher
# Find group by access key
MATCH (g:GroupChat {accessKey: $accessKey})
RETURN g.id, g.name, g.createdBy
```

---

### 5. Message (Group Chat Message)

**Label**: `Message`

**Purpose**: Messages in group chats with threading support

**Properties:**
```cypher
id: String (unique)           # UUID message identifier
content: String               # Message text
createdAt: DateTime (indexed) # Sent timestamp
createdBy: String             # Author user ID
groupId: String               # Associated group
edited: Boolean (default: false) # Edit status
parentId: String (optional)   # Parent message for threads
isAI: Boolean (optional)      # Whether from AI assistant
```

**Constraints:**
```cypher
CREATE CONSTRAINT message_id_unique IF NOT EXISTS
FOR (m:Message) REQUIRE m.id IS UNIQUE
```

**Indexes:**
```cypher
CREATE INDEX message_created_idx IF NOT EXISTS
FOR (m:Message) ON (m.createdAt)

CREATE INDEX message_created_by_idx IF NOT EXISTS
FOR (m:Message) ON (m.createdBy)
```

**Relationships:**
- `(GroupChat)-[:CONTAINS]->(Message)` - Belongs to group
- `(User)-[:POSTED]->(Message)` - Author
- `(Message)-[:REPLY_TO]->(Message)` - Threading

**Threading Structure:**
```cypher
# Main channel messages (no parent)
MATCH (g:GroupChat)-[:CONTAINS]->(m:Message)
WHERE m.parentId IS NULL
RETURN m

# Thread replies
MATCH (parent:Message {id: $messageId})<-[:REPLY_TO]-(reply:Message)
RETURN reply
ORDER BY reply.createdAt ASC
```

**Example:**
```cypher
# Get message with reply count
MATCH (g:GroupChat {id: $groupId})-[:CONTAINS]->(m:Message)
WHERE m.parentId IS NULL
OPTIONAL MATCH (m)<-[:REPLY_TO]-(reply:Message)
RETURN m, count(reply) as replyCount
ORDER BY m.createdAt DESC
```

---

### 6. Task (Kanban Item)

**Label**: `Task`

**Purpose**: Todo/task items in Kanban board

**Properties:**
```cypher
id: String                    # Format: task-{timestamp}-{random}
title: String                 # Task name
description: String (optional) # Details
status: String (default: 'todo') # 'todo', 'inprogress', 'done'
priority: String (default: 'medium') # 'low', 'medium', 'high'
createdAt: DateTime           # Creation timestamp
completedAt: DateTime (optional) # Completion timestamp
createdBy: String             # User ID
```

**No explicit constraints** (uses composite unique ID)

**Relationships:**
- `(User)-[:HAS_TASK]->(Task)` - Task ownership

**Example:**
```cypher
# Get user's active tasks
MATCH (u:User {id: $userId})-[:HAS_TASK]->(t:Task)
WHERE t.status IN ['todo', 'inprogress']
RETURN t.title, t.status, t.priority
ORDER BY t.createdAt DESC
```

---

### 7. QuizSession (Quiz Attempt)

**Label**: `QuizSession`

**Purpose**: Records individual quiz attempts and results

**Properties:**
```cypher
id: String (unique)           # Session identifier
userId: String (indexed)      # User who completed
score: Integer                # Correct answers count
totalQuestions: Integer       # Total questions (usually 10)
streak: Integer               # Highest streak achieved
xpEarned: Integer             # XP awarded
nodeType: String (indexed)    # 'common', 'rare', 'legendary'
completedAt: DateTime (indexed) # Completion timestamp
```

**Constraints:**
```cypher
CREATE CONSTRAINT quiz_session_id_unique IF NOT EXISTS
FOR (qs:QuizSession) REQUIRE qs.id IS UNIQUE
```

**Indexes:**
```cypher
CREATE INDEX quiz_session_user_idx IF NOT EXISTS
FOR (qs:QuizSession) ON (qs.userId)

CREATE INDEX quiz_session_completed_at_idx IF NOT EXISTS
FOR (qs:QuizSession) ON (qs.completedAt)

CREATE INDEX quiz_session_node_type_idx IF NOT EXISTS
FOR (qs:QuizSession) ON (qs.nodeType)
```

**Relationships:**
- `(User)-[:COMPLETED]->(QuizSession)` - User completed quiz

**Node Type Determination:**
```
100% accuracy (10/10) → legendary (25-30 XP)
80-99% accuracy (8-9/10) → rare (12-15 XP)
30-79% accuracy (3-7/10) → common (3-7 XP)
```

**Example:**
```cypher
# Get user's quiz history
MATCH (u:User {id: $userId})-[:COMPLETED]->(qs:QuizSession)
RETURN qs.score, qs.totalQuestions, qs.nodeType, qs.xpEarned, qs.completedAt
ORDER BY qs.completedAt DESC
LIMIT 10
```

---

### 8. QuizProgress (Quiz Statistics)

**Label**: `QuizProgress`

**Purpose**: Aggregate quiz statistics per user

**Properties:**
```cypher
userId: String (unique)       # Associated user
totalQuizzes: Integer         # Total completed
bestStreak: Integer           # Best streak achieved
totalXPFromQuiz: Integer      # Cumulative quiz XP
commonCompleted: Integer      # Common nodes earned
rareCompleted: Integer        # Rare nodes earned
legendaryCompleted: Integer   # Legendary nodes earned
```

**Constraints:**
```cypher
CREATE CONSTRAINT quiz_progress_user_id_unique IF NOT EXISTS
FOR (qp:QuizProgress) REQUIRE qp.userId IS UNIQUE
```

**Relationships:**
- `(User)-[:HAS_QUIZ_PROGRESS]->(QuizProgress)` - Statistics

**Example:**
```cypher
# Get user quiz stats
MATCH (u:User {id: $userId})-[:HAS_QUIZ_PROGRESS]->(qp:QuizProgress)
RETURN qp.totalQuizzes, qp.legendaryCompleted, qp.totalXPFromQuiz
```

---

### 9. MarkdownNote (Session Notes)

**Label**: `MarkdownNote`

**Purpose**: Markdown notes attached to AI tutor sessions

**Properties:**
```cypher
id: String (indexed)          # UUID note identifier
content: String               # Markdown text
lastModified: DateTime        # Last edit timestamp
userId: String (optional)     # Editor (usually session owner)
```

**Indexes:**
```cypher
CREATE INDEX markdown_note_id IF NOT EXISTS
FOR (n:MarkdownNote) ON (n.id)
```

**Relationships:**
- `(Session)-[:HAS_NOTES]->(MarkdownNote)` - Notes for session

**Auto-save**: Updates every 2 seconds when editing

**Example:**
```cypher
# Get session notes
MATCH (s:Session {id: $sessionId})-[:HAS_NOTES]->(n:MarkdownNote)
RETURN n.content, n.lastModified
```

---

### 10. MindMap (Visual Notes)

**Label**: `MindMap`

**Purpose**: Generated mind maps from markdown notes

**Properties:**
```cypher
id: String (indexed)          # UUID mind map identifier
data: String (JSON)           # Mind map structure
markdown: String              # Source markdown
lastGenerated: DateTime       # Generation timestamp
```

**Indexes:**
```cypher
CREATE INDEX mindmap_id IF NOT EXISTS
FOR (m:MindMap) ON (m.id)
```

**Relationships:**
- `(Session)-[:HAS_MINDMAP]->(MindMap)` - Mind map for session

**Example:**
```cypher
# Get session mind map
MATCH (s:Session {id: $sessionId})-[:HAS_MINDMAP]->(m:MindMap)
RETURN m.data, m.lastGenerated
```

---

### 11. AceMemoryState (AI Learning Memory)

**Label**: `AceMemoryState`

**Purpose**: Stores per-learner ACE memory bullets for personalized AI tutoring

**Properties:**
```cypher
id: String                    # UUID state identifier
memory_json: String (JSON)    # Serialized memory bullets
access_clock: Integer         # Access counter for decay calculation
createdAt: DateTime           # Memory state creation
updatedAt: DateTime           # Last memory update
```

**Relationships:**
- `(User)-[:HAS_ACE_MEMORY]->(AceMemoryState)` - Per-learner memory

**Memory JSON Structure:**
```json
{
  "bullets": [
    {
      "id": "bullet-123",
      "content": "Student struggles with LCD in fractions",
      "tags": ["fractions", "semantic"],
      "helpful_count": 3,
      "harmful_count": 0,
      "memory_type": "episodic",
      "learner_id": "user-abc",
      "topic": "fractions",
      "semantic_strength": 100,
      "episodic_strength": 80,
      "procedural_strength": 0
    }
  ],
  "access_clock": 42
}
```

**Memory Types:**
- **Semantic**: General knowledge and strategies
- **Episodic**: Specific student experiences
- **Procedural**: Step-by-step instructions

**Example:**
```cypher
# Get user's memory state
MATCH (u:User {id: $userId})-[:HAS_ACE_MEMORY]->(m:AceMemoryState)
RETURN m.memory_json, m.access_clock, m.updatedAt
```

**Detailed architecture**: See [ACE_README.md](./ACE_README.md)

---

## 🔗 Relationship Types

### AI Tutor System

#### HAS (User → Session)
```cypher
Pattern: (u:User)-[:HAS]->(s:Session)
Purpose: User owns AI tutor conversation sessions
Properties: None
Cardinality: One user to many sessions
```

**Example:**
```cypher
# Get user's sessions
MATCH (u:User {id: $userId})-[:HAS]->(s:Session)
RETURN s.id, s.title, s.updatedAt
ORDER BY s.updatedAt DESC
```

#### OCCURRED (Session → Chat)
```cypher
Pattern: (s:Session)-[:OCCURRED]->(c:Chat)
Purpose: Session contains individual chat messages
Properties: None
Cardinality: One session to many chats
```

**Example:**
```cypher
# Count messages in session
MATCH (s:Session {id: $sessionId})-[:OCCURRED]->(c:Chat)
RETURN count(c) as messageCount
```

#### NEXT (Chat → Chat)
```cypher
Pattern: (c1:Chat)-[:NEXT]->(c2:Chat)
Purpose: Sequential ordering of messages in conversation
Properties: None
Cardinality: One-to-one (forms linked list)
```

**Important**: Messages form a linked list structure. The first message has no incoming NEXT relationship.

**Example:**
```cypher
# Traverse conversation in order
MATCH (s:Session {id: $sessionId})-[:OCCURRED]->(first:Chat)
WHERE NOT EXISTS((first)<-[:NEXT]-())
MATCH path = (first)-[:NEXT*0..]->(c:Chat)
RETURN c.role, c.content, c.createdAt
ORDER BY c.createdAt ASC
```

---

### Group Chat System

#### MEMBER_OF (User → GroupChat)
```cypher
Pattern: (u:User)-[:MEMBER_OF {role, joinedAt}]->(g:GroupChat)
Purpose: Defines group membership
Properties:
  - role: String ('admin' or 'member')
  - joinedAt: DateTime
Cardinality: Many users to many groups
```

**Example:**
```cypher
# Get user's groups
MATCH (u:User {id: $userId})-[m:MEMBER_OF]->(g:GroupChat)
RETURN g.id, g.name, m.role, m.joinedAt
ORDER BY m.joinedAt DESC
```

#### CONTAINS (GroupChat → Message)
```cypher
Pattern: (g:GroupChat)-[:CONTAINS]->(m:Message)
Purpose: Group contains messages
Properties: None
Cardinality: One group to many messages
```

#### POSTED (User → Message)
```cypher
Pattern: (u:User)-[:POSTED]->(m:Message)
Purpose: Links messages to authors
Properties: None
Cardinality: One user to many messages
```

**Note**: AI messages use `createdBy: 'ai_assistant'` but don't have POSTED relationship

#### REPLY_TO (Message → Message)
```cypher
Pattern: (reply:Message)-[:REPLY_TO]->(parent:Message)
Purpose: Creates threaded message replies
Properties: None
Cardinality: Many replies to one parent
```

**Threading structure:**
```
Main message
  ├── Reply 1
  ├── Reply 2
  └── Reply 3
```

**Example:**
```cypher
# Get thread with replies
MATCH (parent:Message {id: $messageId})
OPTIONAL MATCH (parent)<-[:REPLY_TO]-(reply:Message)
RETURN parent, collect(reply) as replies
```

---

### Task Management

#### HAS_TASK (User → Task)
```cypher
Pattern: (u:User)-[:HAS_TASK]->(t:Task)
Purpose: User owns Kanban tasks
Properties: None
Cardinality: One user to many tasks
```

**Example:**
```cypher
# Get user's tasks by status
MATCH (u:User {id: $userId})-[:HAS_TASK]->(t:Task)
WHERE t.status = 'todo'
RETURN t.title, t.priority, t.createdAt
ORDER BY t.createdAt DESC
```

---

### Quiz System

#### COMPLETED (User → QuizSession)
```cypher
Pattern: (u:User)-[:COMPLETED]->(qs:QuizSession)
Purpose: User completed quiz session
Properties: None
Cardinality: One user to many quiz sessions
```

#### HAS_QUIZ_PROGRESS (User → QuizProgress)
```cypher
Pattern: (u:User)-[:HAS_QUIZ_PROGRESS]->(qp:QuizProgress)
Purpose: User has aggregate quiz statistics
Properties: None
Cardinality: One user to one progress node
```

**Example:**
```cypher
# Get quiz history with stats
MATCH (u:User {id: $userId})
OPTIONAL MATCH (u)-[:COMPLETED]->(qs:QuizSession)
OPTIONAL MATCH (u)-[:HAS_QUIZ_PROGRESS]->(qp:QuizProgress)
RETURN qp.totalQuizzes, qp.legendaryCompleted,
       collect(qs.score) as recent_scores
```

---

### Notes & Memory

#### HAS_NOTES (Session → MarkdownNote)
```cypher
Pattern: (s:Session)-[:HAS_NOTES]->(n:MarkdownNote)
Purpose: Session has markdown notes
Properties: None
Cardinality: One session to zero-or-one note
```

#### HAS_MINDMAP (Session → MindMap)
```cypher
Pattern: (s:Session)-[:HAS_MINDMAP]->(m:MindMap)
Purpose: Session has mind map visualization
Properties: None
Cardinality: One session to zero-or-one mind map
```

#### HAS_ACE_MEMORY (User → AceMemoryState)
```cypher
Pattern: (u:User)-[:HAS_ACE_MEMORY]->(m:AceMemoryState)
Purpose: User has personalized AI memory
Properties: None
Cardinality: One user to zero-or-one memory state
```

**Example:**
```cypher
# Get user's AI memory
MATCH (u:User {id: $userId})-[:HAS_ACE_MEMORY]->(m:AceMemoryState)
RETURN m.memory_json, m.access_clock, m.updatedAt
```

---

## 🎯 Common Query Patterns

### User Profile with Stats

```cypher
MATCH (u:User {id: $userId})
OPTIONAL MATCH (u)-[:HAS]->(s:Session)
OPTIONAL MATCH (u)-[:COMPLETED]->(qs:QuizSession)
OPTIONAL MATCH (u)-[:HAS_TASK]->(t:Task)
WHERE t.status = 'done'
RETURN u.name, u.xp, u.level,
       count(DISTINCT s) as totalSessions,
       count(DISTINCT qs) as totalQuizzes,
       count(DISTINCT t) as completedTasks
```

### Leaderboard Query (XP Rankings)

```cypher
MATCH (u:User)
WHERE u.xp IS NOT NULL
RETURN u.id, u.name, u.xp, u.level,
       u.iconType, u.iconEmoji, u.iconColor
ORDER BY u.xp DESC
LIMIT 20
```

### Leaderboard Query (Accuracy Rankings)

```cypher
MATCH (u:User)
OPTIONAL MATCH (u)-[:COMPLETED]->(qs:QuizSession)
WHERE qs.totalQuestions > 0
WITH u,
     sum(toFloat(qs.score)) as totalScore,
     sum(toFloat(qs.totalQuestions)) as totalQuestions
WITH u,
     CASE WHEN totalQuestions > 0
          THEN (totalScore / totalQuestions) * 100.0
          ELSE 0.0
     END as overallAccuracy
RETURN u.id, u.name, overallAccuracy
ORDER BY overallAccuracy DESC
LIMIT 20
```

### Recent Activity (Past 7 Days)

```cypher
MATCH (u:User)-[:COMPLETED]->(qs:QuizSession)
WHERE qs.completedAt >= datetime() - duration({days: 7})
RETURN u.name, qs.score, qs.totalQuestions, qs.completedAt
ORDER BY qs.completedAt DESC
```

### Group Chat with Threads

```cypher
# Get main messages with reply counts
MATCH (g:GroupChat {id: $groupId})-[:CONTAINS]->(m:Message)
WHERE m.parentId IS NULL
OPTIONAL MATCH (m)<-[:REPLY_TO]-(reply:Message)
RETURN m, count(reply) as replyCount
ORDER BY m.createdAt DESC
LIMIT 50
```

---

## 🏗️ Schema Initialization

### Setup Scripts

**Run in order:**

```bash
npm run setup-neo4j       # Core: User, Session, Chat
npm run setup-groupchat   # Group: GroupChat, Message
npm run setup-markdown    # Notes: MarkdownNote, MindMap
npm run setup-quiz        # Quiz: QuizSession, QuizProgress
```

**Script locations:**
- `frontend/scripts/setup-neo4j.js`
- `frontend/scripts/setup-groupchat.js`
- `frontend/scripts/setup-markdown.js`
- `frontend/scripts/setup-quiz.js`

### Manual Schema Creation

**If needed, create schema manually in Neo4j Browser:**

```cypher
# User constraints
CREATE CONSTRAINT user_id_unique IF NOT EXISTS
FOR (u:User) REQUIRE u.id IS UNIQUE;

# Session constraints
CREATE CONSTRAINT session_id_unique IF NOT EXISTS
FOR (s:Session) REQUIRE s.id IS UNIQUE;

# Chat constraints
CREATE CONSTRAINT chat_id_unique IF NOT EXISTS
FOR (c:Chat) REQUIRE c.id IS UNIQUE;

# GroupChat constraints
CREATE CONSTRAINT groupchat_id_unique IF NOT EXISTS
FOR (g:GroupChat) REQUIRE g.id IS UNIQUE;

CREATE CONSTRAINT groupchat_accessKey_unique IF NOT EXISTS
FOR (g:GroupChat) REQUIRE g.accessKey IS UNIQUE;

# Message constraints
CREATE CONSTRAINT message_id_unique IF NOT EXISTS
FOR (m:Message) REQUIRE m.id IS UNIQUE;

# Quiz constraints
CREATE CONSTRAINT quiz_session_id_unique IF NOT EXISTS
FOR (qs:QuizSession) REQUIRE qs.id IS UNIQUE;

CREATE CONSTRAINT quiz_progress_user_id_unique IF NOT EXISTS
FOR (qp:QuizProgress) REQUIRE qp.userId IS UNIQUE;

# Indexes (see previous sections for complete list)
```

---

## 🔍 Maintenance Queries

### Database Statistics

```cypher
# Count all nodes by type
MATCH (u:User)
OPTIONAL MATCH (u)-[:HAS]->(s:Session)
OPTIONAL MATCH (s)-[:OCCURRED]->(c:Chat)
OPTIONAL MATCH (u)-[:MEMBER_OF]->(g:GroupChat)
OPTIONAL MATCH (g)-[:CONTAINS]->(m:Message)
OPTIONAL MATCH (u)-[:HAS_TASK]->(t:Task)
OPTIONAL MATCH (u)-[:COMPLETED]->(qs:QuizSession)
OPTIONAL MATCH (u)-[:HAS_ACE_MEMORY]->(am:AceMemoryState)
RETURN
  count(DISTINCT u) as users,
  count(DISTINCT s) as sessions,
  count(DISTINCT c) as chats,
  count(DISTINCT g) as groups,
  count(DISTINCT m) as messages,
  count(DISTINCT t) as tasks,
  count(DISTINCT qs) as quizzes,
  count(DISTINCT am) as memory_states
```

### Find Orphaned Nodes

```cypher
# Chats without sessions
MATCH (c:Chat)
WHERE NOT (c)<-[:OCCURRED]-()
RETURN count(c) as orphaned_chats

# Messages without groups
MATCH (m:Message)
WHERE NOT (m)<-[:CONTAINS]-()
RETURN count(m) as orphaned_messages

# Tasks without users
MATCH (t:Task)
WHERE NOT (t)<-[:HAS_TASK]-()
RETURN count(t) as orphaned_tasks
```

### Cleanup Queries

```cypher
# Delete user and all associated data
MATCH (u:User {id: $userId})
OPTIONAL MATCH (u)-[:HAS]->(s:Session)-[:OCCURRED]->(c:Chat)
OPTIONAL MATCH (s)-[:HAS_NOTES]->(n:MarkdownNote)
OPTIONAL MATCH (s)-[:HAS_MINDMAP]->(mm:MindMap)
OPTIONAL MATCH (u)-[:HAS_TASK]->(t:Task)
OPTIONAL MATCH (u)-[:COMPLETED]->(qs:QuizSession)
OPTIONAL MATCH (u)-[:HAS_QUIZ_PROGRESS]->(qp:QuizProgress)
OPTIONAL MATCH (u)-[:HAS_ACE_MEMORY]->(am:AceMemoryState)
DETACH DELETE u, s, c, n, mm, t, qs, qp, am
```

### Verify Constraints

```cypher
SHOW CONSTRAINTS
```

**Should show all 10 constraints**

### Verify Indexes

```cypher
SHOW INDEXES
```

**Should show 13+ indexes**

---

## 📚 Schema Resources

**Getting Started:**
- [04_DATABASE_SETUP.md](../getting-started/04_DATABASE_SETUP.md) - Initial setup

**Related Documentation:**
- [ACE_README.md](./ACE_README.md) - ACE memory architecture
- [API_REFERENCE.md](./API_REFERENCE.md) - API endpoints using this schema

**Neo4j Resources:**
- Cypher Reference: https://neo4j.com/docs/cypher-manual/current/
- Graph Modeling: https://neo4j.com/docs/getting-started/data-modeling/
- Best Practices: https://neo4j.com/developer/guide-data-modeling/

---

## ❓ Schema Questions

**Why separate Chat and Message nodes?**
- Chat: AI tutor 1-on-1 (sequential with :NEXT)
- Message: Group chat (threaded with :REPLY_TO)
- Different use cases need different structures

**Why store memory_json as string?**
- Neo4j map properties have limitations
- JSON allows flexible bullet structure
- Easier to serialize/deserialize
- Python can directly load as dict

**Why both createdAt and created_at?**
- Legacy compatibility
- Some old code uses created_at
- New code uses createdAt
- Both are supported

**Why no foreign keys?**
- Graph databases use relationships instead
- More flexible than FK constraints
- Easier to traverse relationships
- Better query performance for connected data
