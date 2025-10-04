# Neo4j AuraDB Setup Guide for Noodeia AI Tutor

Complete setup guide for the Neo4j AuraDB graph database integration.

---

## 📋 Prerequisites

- Node.js installed (v18 or higher)
- Neo4j AuraDB account and instance created
- Supabase account (for authentication only)

---

## 🚀 Quick Setup

### Step 1: Get Your Credentials

**Neo4j AuraDB:**
1. Go to [Neo4j AuraDB Console](https://console.neo4j.io/)
2. Create or locate your database instance
3. Note down your connection details

**Supabase (Auth Only):**
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Navigate to Project Settings → API
3. Copy your project URL and anon key

### Step 2: Configure Environment Variables

Create/update `frontend/.env.local`:

```env
# Supabase Configuration (Authentication only)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Neo4j AuraDB Configuration (Data storage)
NEXT_PUBLIC_NEO4J_URI=neo4j+s://b2e42ec1.databases.neo4j.io
NEXT_PUBLIC_NEO4J_USERNAME=neo4j
NEXT_PUBLIC_NEO4J_PASSWORD=your_neo4j_password
```

### Step 3: Install Dependencies

```bash
cd frontend
npm install --legacy-peer-deps
```

Dependencies installed:
- `neo4j-driver` - Official Neo4j JavaScript driver
- `uuid` - For generating unique IDs
- `dotenv` - For environment variable loading

### Step 4: Initialize Database Schema

```bash
npm run setup-neo4j
```

This creates:
- Unique constraints on User.id, Session.id, Chat.id
- Indexes on email, created_at, updated_at, role fields
- Verifies schema setup

**Expected Output:**
```
🚀 Starting Neo4j AuraDB schema setup...
✅ Connection verified
✅ Constraints created (3)
✅ Indexes created (10)
✅ Neo4j schema setup complete!
```

### Step 5: Start the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🗺️ Database Architecture

### Graph Model

```
(:User {id, email, name, created_at, updated_at})
  |
  [:HAS]
  ↓
(:Session {id, title, created_at, updated_at})
  |
  [:OCCURRED]
  ↓
(:Chat {id, role, content, created_at})
  |
  [:NEXT]
  ↓
(:Chat {id, role, content, created_at})
```

### Node Properties

**User Node:**
- `id`: String (UUID from Supabase Auth)
- `email`: String (unique)
- `name`: String
- `created_at`: DateTime
- `updated_at`: DateTime

**Session Node (Conversation):**
- `id`: String (UUID)
- `title`: String
- `created_at`: DateTime
- `updated_at`: DateTime

**Chat Node (Message):**
- `id`: String (UUID)
- `role`: String ("user" | "assistant")
- `content`: String (message text)
- `created_at`: DateTime

### Relationships

| Relationship | From | To | Purpose |
|-------------|------|-----|---------|
| `HAS` | User | Session | User owns sessions |
| `OCCURRED` | Session | Chat | Session contains chats |
| `NEXT` | Chat | Chat | Maintains message order |

---

## 📁 Project Structure

```
frontend/
├── lib/
│   ├── neo4j.js                    # Neo4j driver & connection
│   ├── supabase.js                 # Supabase Auth only
│   └── database-adapter.js         # Database abstraction layer
├── services/
│   └── neo4j.service.js            # All Neo4j CRUD operations
├── scripts/
│   └── setup-neo4j.js              # Schema initialization
├── components/
│   ├── AIAssistantUI.jsx           # Main app (uses Neo4j)
│   ├── AuthForm.jsx                # Auth + user creation
│   ├── ChatPane.jsx                # Chat interface
│   ├── Sidebar.jsx                 # Session list
│   └── Header.jsx                  # Header with user info
└── .env.local                      # Environment config
```

---

## 🔧 Implementation Details

### 1. Connection Service (`lib/neo4j.js`)

Manages Neo4j driver lifecycle:
- Singleton pattern
- Connection pooling
- Type conversion helpers
- Connectivity verification

### 2. Data Service (`services/neo4j.service.js`)

All database operations:

**User Operations:**
- `createUser(id, email, name)`
- `getUserById(userId)`
- `getUserByEmail(email)`
- `updateUser(userId, updates)`

**Session Operations:**
- `createSession(userId, title)`
- `getUserSessions(userId)`
- `getSessionById(sessionId)`
- `getSessionWithChats(sessionId)`
- `updateSession(sessionId, title)`
- `deleteSession(sessionId)`

**Chat Operations:**
- `createChat(sessionId, role, content)`
- `getSessionChats(sessionId)`
- `updateChat(chatId, content)`
- `deleteChatsAfter(sessionId, chatId)`

**Analytics:**
- `getUserStats(userId)`
- `searchSessions(userId, searchTerm)`

### 3. Database Adapter (`lib/database-adapter.js`)

Abstraction layer for all database operations:
- Unified interface
- Easy rollback capability via `USE_NEO4J` flag
- All components use adapter instead of direct calls

### 4. Authentication Flow

**Hybrid Approach:**
1. User signs up/logs in → Supabase Auth validates
2. Auth success → Check if user exists in Neo4j
3. If not exists → Create User node in Neo4j
4. All data operations → Neo4j only

**Why Hybrid?**
- Supabase Auth: Mature, secure authentication
- Neo4j: Optimized for relationship-heavy data
- Best of both worlds

---

## 🔍 Verification & Testing

### Check Database in Neo4j Browser

1. Go to Neo4j AuraDB Console
2. Click "Open" on your instance
3. Run verification queries:

**View all nodes:**
```cypher
MATCH (n) RETURN n LIMIT 25
```

**View graph structure:**
```cypher
MATCH path = (u:User)-[:HAS]->(s:Session)-[:OCCURRED]->(c:Chat)
RETURN path
LIMIT 10
```

**Check message ordering:**
```cypher
MATCH (s:Session {id: 'session-id'})-[:OCCURRED]->(first:Chat)
WHERE NOT EXISTS((first)<-[:NEXT]-())
MATCH chain = (first)-[:NEXT*0..]->(c:Chat)
RETURN chain
```

### Test in the Application

1. **Sign up** with a new account
2. **Create a chat** session
3. **Send messages** and verify they appear
4. **Check Neo4j Browser** to see graph structure
5. **Log out and log in** to verify persistence

---

## 🛠️ Useful Cypher Queries

### Development Queries

**Count all nodes:**
```cypher
MATCH (u:User)
OPTIONAL MATCH (u)-[:HAS]->(s:Session)
OPTIONAL MATCH (s)-[:OCCURRED]->(c:Chat)
RETURN
  count(DISTINCT u) as users,
  count(DISTINCT s) as sessions,
  count(c) as chats
```

**View user's sessions:**
```cypher
MATCH (u:User {email: 'user@example.com'})-[:HAS]->(s:Session)
RETURN s.title, s.created_at, s.updated_at
ORDER BY s.updated_at DESC
```

**View session with all chats:**
```cypher
MATCH (s:Session {id: 'session-id'})-[:OCCURRED]->(c:Chat)
RETURN c.role, c.content, c.created_at
ORDER BY c.created_at ASC
```

**Search sessions by title:**
```cypher
MATCH (u:User {id: 'user-id'})-[:HAS]->(s:Session)
WHERE toLower(s.title) CONTAINS toLower('search term')
RETURN s
ORDER BY s.updated_at DESC
```

### Maintenance Queries

**Delete a specific user and all data:**
```cypher
MATCH (u:User {id: 'user-id'})
OPTIONAL MATCH (u)-[:HAS]->(s:Session)
OPTIONAL MATCH (s)-[:OCCURRED]->(c:Chat)
DETACH DELETE u, s, c
```

**Delete all data (⚠️ CAUTION):**
```cypher
MATCH (n)
DETACH DELETE n
```

**Verify constraints:**
```cypher
SHOW CONSTRAINTS
```

**Verify indexes:**
```cypher
SHOW INDEXES
```

---

## ❓ Troubleshooting

### Connection Issues

**Error:** "Neo4j credentials not configured"

**Solutions:**
1. Check `.env.local` exists in `frontend/` directory
2. Verify all environment variables are set correctly
3. Restart dev server after changing `.env.local`
4. Check Neo4j instance is running in AuraDB Console

### Schema Setup Fails

**Error:** "Constraint already exists"

**Solution:** This is normal if running setup multiple times. The script uses `IF NOT EXISTS`.

### Module Import Errors

**Error:** "Cannot use import statement outside a module"

**Solutions:**
1. Ensure `"type": "module"` in `frontend/package.json`
2. Use `.js` extensions in import statements
3. Run `npm install` again

### Authentication Works But Data Not Saving

**Checklist:**
1. Verify Neo4j connection: `npm run setup-neo4j`
2. Check browser console for errors
3. Verify `USE_NEO4J = true` in `database-adapter.js`
4. Check Neo4j Browser for created nodes

---

## 📚 Additional Resources

- [Neo4j AuraDB Documentation](https://neo4j.com/docs/aura/)
- [Cypher Query Language Guide](https://neo4j.com/docs/cypher-manual/current/)
- [Neo4j JavaScript Driver Manual](https://neo4j.com/docs/javascript-manual/current/)
- [Graph Database Concepts](https://neo4j.com/docs/getting-started/current/graphdb-concepts/)
- [Neo4j Community Forum](https://community.neo4j.com/)

---

## 🎯 What's Working

✅ **User Management**: Sign up, login, profile storage
✅ **Session Management**: Create, list, update, delete conversations
✅ **Chat Messages**: Send, receive, order maintained via NEXT relationships
✅ **Authentication**: Hybrid Supabase Auth + Neo4j data
✅ **Real-time Updates**: Optimistic UI updates with database sync
✅ **Search**: Find sessions by title
✅ **Analytics**: User statistics and activity tracking

---

**Setup Complete! Your Noodeia AI Tutor now runs on Neo4j AuraDB 🚀**
