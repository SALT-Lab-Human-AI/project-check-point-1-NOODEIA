# 💻 Local Development Guide

Guide to running Noodeia locally and testing all features.

---

## ✅ Before You Begin

Ensure you have completed:
- ✅ [02_INSTALLATION.md](./02_INSTALLATION.md) - Dependencies installed
- ✅ [03_CONFIGURATION.md](./03_CONFIGURATION.md) - Environment configured
- ✅ [04_DATABASE_SETUP.md](./04_DATABASE_SETUP.md) - Database initialized
- ✅ [05_PYTHON_ACE_SETUP.md](./05_PYTHON_ACE_SETUP.md) - ACE agent tested

---

## 🚀 Starting the Development Server

### Navigate to Frontend

```bash
cd frontend
```

### Start Server

```bash
npm run dev
```

**Expected output:**
```
▲ Next.js 15.2.4
- Local:        http://localhost:3000
- Network:      http://192.168.1.x:3000

✓ Ready in 2.5s
```

**Server starts on**: http://localhost:3000

### Verify Server is Running

Open browser and navigate to:
```
http://localhost:3000
```

**Should see**: Landing page with "Learn Smarter with Noodeia AI" heading

---

## 🧪 Testing Features Locally

### 1. Authentication

**Test Sign Up:**
1. Click "Start Learning" or navigate to http://localhost:3000/login
2. Click toggle to "Sign Up"
3. Enter email and password
4. Click "Sign Up"
5. Should redirect to http://localhost:3000/ai

**Verify:**
- Check server logs for user creation
- Check Neo4j Browser:
  ```cypher
  MATCH (u:User) RETURN u ORDER BY u.createdAt DESC LIMIT 1
  ```
- Should see your new user node

**Test Login:**
1. Log out
2. Go to /login
3. Enter same credentials
4. Click "Login"
5. Should redirect to /ai

### 2. AI Tutor

**Test Basic Conversation:**
1. Navigate to http://localhost:3000/ai
2. Type a message: "Help me understand fractions"
3. Click send or press Enter

**Expected behavior:**
- Message appears instantly (optimistic update)
- AI responds within 5-15 seconds
- XP animation appears (+1.01-1.75 XP)
- Gamification bar updates in sidebar

**Check server logs for:**
```
[ACE Memory] Loaded N bullets from Neo4j for learner=...
[ACE Pipeline] Lesson extracted: ...
[ACE Runner] Memory delta summary new=1 updates=0 removals=0
```

**Test Multiple Messages:**
- Send 5-10 messages
- Verify conversation history persists
- Check XP accumulates
- Test edit message (three-dot menu)
- Test resend message

**Verify in Neo4j:**
```cypher
MATCH (u:User {email: 'your-email'})-[:HAS]->(s:Session)-[:OCCURRED]->(c:Chat)
RETURN s.title, count(c) as message_count
```

### 3. Gamification

**Test XP Earning:**
1. Send messages in AI tutor
2. Watch for XP animation above send button
3. Check gamification bar in sidebar updates
4. Send enough messages to level up

**Level up thresholds:**
- Level 1 → 2: 25 XP total
- Level 2 → 3: 64 XP total
- Level 3 → 4: 169 XP total

**Test leaderboard:**
1. Navigate to http://localhost:3000/achievements
2. Click leaderboard rank card
3. Should see rankings with your user

### 4. Quiz System

**Test Quiz:**
1. Navigate to http://localhost:3000/quiz
2. Click "Start New Quiz"
3. Answer 10 questions
4. Complete quiz

**Test scoring:**
- **100% (10/10)**: Should get Legendary node (25-30 XP)
- **90% (9/10)**: Should get Rare node (12-15 XP)
- **50% (5/10)**: Should get Common node (3-7 XP)

**Test reward animation:**
- Orb shakes (Pokemon GO style)
- Click orb to crack open
- Confetti celebration (400 particles)
- Card flip reveal
- XP animation

**Verify in Neo4j:**
```cypher
MATCH (u:User {email: 'your-email'})-[:COMPLETED]->(q:QuizSession)
RETURN q.score, q.totalQuestions, q.xpEarned, q.completedAt
ORDER BY q.completedAt DESC
LIMIT 5
```

### 5. Vocabulary Games

**Test games:**
1. Navigate to http://localhost:3000/games
2. Try all 4 game modes:
   - Word Match (10 pts)
   - Spelling Bee (15 pts)
   - Memory Cards (20 pts)
   - Word Builder (25 pts)

**Test features:**
- Confetti on correct answers (400 particles)
- XP animation displays
- Hint system (wrong answers show character hints)
- "Game Menu" button to switch modes

### 6. Todo/Kanban Board

**Test task management:**
1. Navigate to http://localhost:3000/todo
2. Create a task:
   - Title: "Test task"
   - Description: "Testing kanban"
   - Priority: High
   - Click "Add Task"
3. Drag task from "To Do" to "In Progress"
4. Drag to "Done"
5. Should see confetti + XP animation

**Test features:**
- Drag between columns
- Drag up/down within column (reordering)
- Delete task (trash icon)
- Task persistence (refresh page, tasks remain)

**Verify in Neo4j:**
```cypher
MATCH (u:User {email: 'your-email'})-[:HAS_TASK]->(t:Task)
RETURN t.title, t.status, t.priority
```

### 7. Group Chat

**Test group creation:**
1. Navigate to http://localhost:3000/groupchat
2. Create new group:
   - Name: "Test Study Group"
   - Access key: "test123"
3. Should see group in sidebar

**Test messaging:**
1. Send a message in main channel
2. Should appear instantly (optimistic update)
3. Refresh page - message persists

**Test threading:**
1. Click "Reply" on a message
2. Thread panel opens on right
3. Type reply
4. Reply appears in thread

**Test @ai mentions:**
1. Type: "@ai Can you help with math?"
2. Send message
3. AI should respond in thread
4. AI shows thread context

**Test with multiple browsers:**
- Open same group in incognito/another browser
- Join with same access key
- Messages should sync in real-time (with Pusher)

### 8. Theme Customization

**Test themes:**
1. Click theme cycle button (in header)
2. Should cycle through:
   - Cream (beige)
   - Lilac (purple)
   - Rose (pink)
   - Sky (blue)
3. All UI elements should update
4. Theme persists across page navigation

**Test avatar customization:**
1. Click profile button in header
2. Settings modal opens
3. Change between "Initials" and "Emoji"
4. Select emoji or color
5. Save changes
6. Avatar updates everywhere

### 9. Markdown Notes

**Test notes:**
1. In AI tutor, click "Notes" button
2. Markdown panel opens on right
3. Type some markdown
4. Auto-saves after 2 seconds
5. Switch between Edit/Preview/Mind Map tabs
6. Export as .md file

**Verify persistence:**
```cypher
MATCH (s:Session {id: 'session-id'})-[:HAS_NOTES]->(n:MarkdownNote)
RETURN n.content, n.lastModified
```

### 10. Leaderboard

**Test rankings:**
1. Navigate to http://localhost:3000/leaderboard
2. Toggle between XP and Accuracy
3. Select different timeframes:
   - Daily
   - Weekly
   - Monthly
   - All-Time
4. Rankings should update

**View your rank:**
- Should see rank card at bottom
- Shows your position among all users

---

## 🔍 Monitoring During Development

### Browser Console

**Open DevTools** (F12 or Cmd+Option+I):
- **Console tab**: Check for JavaScript errors
- **Network tab**: Monitor API requests
- **Application tab**: Check localStorage for theme

**Common logs:**
```
✅ User authenticated
✅ Conversation loaded
✅ XP updated: 125 (+1.5)
```

### Server Terminal

**Watch for logs:**
```
✅ Neo4j connection established
[ACE Memory] Loaded 12 bullets from Neo4j for learner=...
🤖 AI request processed in 8.5s
[ACE Memory][Inject] Retrieved 5 bullets for question: ...
[ACE Runner] Memory delta summary new=1 updates=2 removals=0
```

**Error indicators:**
```
❌ Neo4j connection failed
❌ GEMINI_API_KEY not configured
❌ [ACE Memory] ERROR: ...
```

### Neo4j Browser

**Monitor database:**
1. Open https://console.neo4j.io/
2. Access Neo4j Browser
3. Run queries to check data:

**Total nodes:**
```cypher
MATCH (n) RETURN count(n) as total
```

**Recent activity:**
```cypher
MATCH (u:User)-[:COMPLETED]->(q:QuizSession)
WHERE q.completedAt >= datetime() - duration({hours: 1})
RETURN u.name, q.score, q.completedAt
ORDER BY q.completedAt DESC
```

---

## 🔄 Development Best Practices

### Hot Module Replacement

Next.js automatically reloads when you edit files:
- **React components**: Instant reload
- **API routes**: Automatic restart
- **CSS/Tailwind**: Instant update
- **Environment variables**: Requires manual restart

### Restart Server When

You **must** restart the dev server when:
- Editing `.env.local`
- Changing Next.js config
- Installing new npm packages
- Updating Python dependencies

```bash
# Stop server: Ctrl+C
npm run dev  # Start again
```

### Clear Build Cache

If you encounter strange errors:

```bash
# Clear Next.js cache
rm -rf .next

# Clear npm cache
npm cache clean --force

# Reinstall
npm install --legacy-peer-deps

# Rebuild
npm run dev
```

---

## 🧪 Running Tests

### Automated Test Suite

```bash
cd unitTests
./run_all_tests.sh
```

**Tests run:**
- System prompts verification
- Authentication flows
- Quiz node assignment
- XP/leveling calculations
- Group chat @ai detection
- Data persistence
- Python ACE agent

**Expected**: All 7 test suites pass

### Individual Test Suites

```bash
cd unitTests

# System prompts
npm run test:prompts

# Authentication
npm run test:auth

# Quiz scoring
npm run test:quiz

# Gamification
npm run test:gamification

# AI chat (slow, 30-60s)
npm run test:ai-chat

# Group chat
npm run test:group-chat

# Database persistence
npm run test:persistence
```

### Manual Testing Checklist

Use this checklist to manually test all features:

- [ ] Sign up creates user in both Supabase and Neo4j
- [ ] Login works with existing user
- [ ] AI tutor responds to messages
- [ ] XP animation appears on each message
- [ ] Level up triggers sparkle animation
- [ ] Quiz completion awards correct node type
- [ ] Legendary node for 100% accuracy
- [ ] Task completion awards XP
- [ ] Group chat messages sync in real-time
- [ ] @ai mentions trigger AI response
- [ ] Leaderboard shows rankings
- [ ] Vocabulary games award XP
- [ ] Theme switching works
- [ ] Avatar customization persists
- [ ] Markdown notes auto-save

---

## 🎨 Development Tools

### Recommended VS Code Extensions

**Essential:**
- ESLint - JavaScript linting
- Prettier - Code formatting
- Tailwind CSS IntelliSense - Tailwind autocomplete

**Helpful:**
- Neo4j - Cypher syntax highlighting
- Python - Python support
- GitLens - Git integration

### Browser DevTools Usage

**React DevTools:**
- Install React DevTools extension
- Inspect component tree
- View props and state
- Profile performance

**Network Panel:**
- Monitor API requests
- Check request/response times
- Debug failed requests
- View WebSocket connections (Pusher)

---

## 🔧 Common Development Tasks

### Add New Feature

```bash
# Create new component
touch components/NewFeature.jsx

# Create new API route
mkdir -p app/api/newfeature
touch app/api/newfeature/route.js

# Test locally
npm run dev
```

### Debug Database Queries

**Add logging to service:**
```javascript
// In services/neo4j.service.js
console.log('Running query:', query);
const result = await session.run(query, params);
console.log('Result:', result.records.length, 'records');
```

### Debug ACE Agent

**Add logging to Python:**
```python
# In frontend/scripts/run_ace_agent.py
print(f"[DEBUG] Question: {question}", file=sys.stderr)
print(f"[DEBUG] Retrieved bullets: {len(bullets)}", file=sys.stderr)
```

View stderr in server terminal.

### Database Schema Changes

1. Update setup script (e.g., `scripts/setup-neo4j.js`)
2. Run setup script: `npm run setup-neo4j`
3. Verify in Neo4j Browser
4. Update TypeScript types if needed
5. Update documentation

---

## 🎯 Local Development Complete!

You can now:
✅ Run Noodeia locally
✅ Test all features
✅ Monitor with DevTools
✅ Run automated tests
✅ Debug issues
✅ Develop new features

---

## 📚 Next Steps

1. **Deploy to Production**: [07_DEPLOYMENT.md](./07_DEPLOYMENT.md)
2. **Complete Setup Reference**: [08_COMPLETE_SETUP.md](./08_COMPLETE_SETUP.md)
3. **Learn Features**: [../user-guides/](../user-guides/)

---

## ❓ Need Help?

**Development issues?**
- See [../TROUBLESHOOTING.md](../TROUBLESHOOTING.md)

**Want to understand architecture?**
- See [00_OVERVIEW.md](./00_OVERVIEW.md)
- See [../technical/](../technical/)

**Ready to deploy?**
- See [../deployment/RENDER.md](../deployment/RENDER.md)
