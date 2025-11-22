# 🔧 Troubleshooting Guide

Complete guide to solving common issues in Noodeia.

---

## 📑 Quick Index

**Installation & Setup:**
- [Node.js installation issues](#nodejs-installation-issues)
- [Python installation issues](#python-installation-issues)
- [Dependency installation fails](#dependency-installation-fails)

**Configuration:**
- [Environment variables not loading](#environment-variables-not-loading)
- [Pusher credentials swapped](#pusher-credentials-swapped)
- [Neo4j URI format wrong](#neo4j-uri-format-wrong)

**Authentication:**
- [Cannot sign up or login](#cannot-sign-up-or-login)
- [Supabase/Neo4j sync mismatch](#supabaseneo4j-sync-mismatch)
- [Redirect loop between /login and /ai](#redirect-loop-between-login-and-ai)

**AI Tutor:**
- [AI not responding](#ai-not-responding)
- [AI timeout (no response after 10 minutes)](#ai-timeout-no-response)
- [Python ACE agent errors](#python-ace-agent-errors)

**Database:**
- [Neo4j connection failed](#neo4j-connection-failed)
- [Schema setup fails](#schema-setup-fails)
- [Data not persisting](#data-not-persisting)

**Features:**
- [Group chat messages not appearing](#group-chat-messages-not-appearing)
- [@ai mentions not triggering](#ai-mentions-not-triggering)
- [Quiz legendary node not assigned](#quiz-legendary-node-not-assigned)
- [XP not being awarded](#xp-not-being-awarded)
- [Real-time updates not working](#real-time-updates-not-working)

**Build & Deployment:**
- [Build failures](#build-failures)
- [Deployment issues on Render](#deployment-issues-on-render)

---

## 💻 Installation & Setup Issues

### Node.js Installation Issues

**Problem**: `npm: command not found`

**Solution:**
1. Install Node.js from https://nodejs.org/
2. Restart terminal
3. Verify: `node --version`

---

**Problem**: Node.js version too old

**Solution:**
```bash
# Check current version
node --version

# If less than v18, upgrade:
# macOS:
brew upgrade node

# Windows:
# Download latest from nodejs.org

# Linux (Ubuntu):
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

### Python Installation Issues

**Problem**: `python3: command not found`

**Solution:**
```bash
# macOS:
brew install python@3.11

# Windows:
# Download from python.org

# Linux (Ubuntu):
sudo apt update
sudo apt install python3.11 python3-pip
```

---

**Problem**: Python version too old

**Solution:**
```bash
# Check version
python3 --version

# Must be 3.10.0 or higher
# If not, install newer version (see above)
```

---

### Dependency Installation Fails

**Problem**: `npm ERR! code ERESOLVE`

**Solution:**
```bash
# Must use --legacy-peer-deps for React 19
npm install --legacy-peer-deps

# If still fails:
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

---

**Problem**: `pip: command not found` or `pip3: command not found`

**Solution:**
```bash
# Install pip
python3 -m ensurepip --upgrade

# Or on Linux:
sudo apt install python3-pip
```

---

**Problem**: `Permission denied` when installing packages

**Solution:**
```bash
# For npm (don't use sudo!):
sudo chown -R $(whoami) ~/.npm
npm install --legacy-peer-deps

# For pip:
pip3 install --user -r requirements.txt
```

---

## ⚙️ Configuration Issues

### Environment Variables Not Loading

**Problem**: Application can't find `.env.local` variables

**Symptoms:**
- "GEMINI_API_KEY not configured"
- "Neo4j credentials not found"
- App works sometimes but not others

**Solutions:**

1. **Check file name** (common mistake):
   ```bash
   ls -la frontend/.env.local
   # Must be exactly ".env.local" (note the dot!)
   ```

2. **Check file location**:
   ```bash
   # Must be in frontend/ directory
   cd project-check-point-1-noodeia/frontend
   cat .env.local  # Should show your variables
   ```

3. **Restart dev server**:
   ```bash
   # Stop server (Ctrl+C)
   npm run dev  # Start again
   ```
   Environment variables only load on server start!

4. **Check for typos**:
   - Variable names are case-sensitive
   - No spaces around `=`
   - No quotes around values
   - No comments on same line

---

### Pusher Credentials Swapped

**Problem**: `400 Bad Request - App key not in this cluster`

**Root cause**: `PUSHER_SECRET` and `NEXT_PUBLIC_PUSHER_KEY` values are swapped!

**How to identify:**
- Secret is usually longer and more random
- Key often has some readable pattern
- Dashboard clearly labels them

**Solution:**
```env
# ❌ WRONG:
PUSHER_SECRET=be045a5b3ce8f55949bd        # This is the KEY!
NEXT_PUBLIC_PUSHER_KEY=6f7f7f4e68f7892e333d  # This is the SECRET!

# ✅ CORRECT:
PUSHER_SECRET=6f7f7f4e68f7892e333d        # Secret (server-only)
NEXT_PUBLIC_PUSHER_KEY=be045a5b3ce8f55949bd  # Key (public)
NEXT_PUBLIC_PUSHER_CLUSTER=us2            # Must match your cluster
```

**After fixing:**
1. Save `.env.local`
2. Restart dev server
3. Clear browser cache
4. Test group chat

---

### Neo4j URI Format Wrong

**Problem**: "Neo4j connection failed"

**Common mistakes:**
```env
# ❌ WRONG:
NEXT_PUBLIC_NEO4J_URI=bolt://xxxxx.databases.neo4j.io
NEXT_PUBLIC_NEO4J_URI=neo4j://xxxxx.databases.neo4j.io
NEXT_PUBLIC_NEO4J_URI=https://xxxxx.databases.neo4j.io

# ✅ CORRECT:
NEXT_PUBLIC_NEO4J_URI=neo4j+s://xxxxx.databases.neo4j.io
```

**Must include:**
- `neo4j+s://` prefix (s = secure)
- Full hostname ending in `.databases.neo4j.io`
- No trailing slash

**Test connection:**
```bash
npm run setup-neo4j
# Should show "Connection verified"
```

---

## 🔐 Authentication Issues

### Cannot Sign Up or Login

**Problem**: Sign up button doesn't work or errors occur

**Checklist:**

1. **Check Supabase credentials:**
   ```bash
   cat frontend/.env.local | grep SUPABASE
   # Should show URL and anon key
   ```

2. **Verify Supabase project is active:**
   - Go to https://supabase.com/dashboard
   - Check project status (should be "Active")

3. **Check browser console:**
   - Open DevTools (F12)
   - Look for errors
   - Common: "Failed to fetch" (network issue)

4. **Test Supabase directly:**
   ```bash
   curl https://your-project.supabase.co/auth/v1/health
   # Should return {"status":"ok"}
   ```

---

### Supabase/Neo4j Sync Mismatch

**Problem**: User exists in Supabase but not Neo4j

**Symptoms:**
- Can log in, but app doesn't work
- "User not found" errors
- Blank dashboards

**Solution**: Application auto-creates missing Neo4j users!

**If auto-creation fails:**
1. Check Neo4j connection
2. Run `npm run setup-neo4j` to ensure schema exists
3. Try logging out and back in
4. Check server logs for Neo4j errors

**Manual fix (in Neo4j Browser):**
```cypher
MERGE (u:User {id: "supabase-user-id"})
SET u.email = "user@example.com",
    u.name = "User Name",
    u.xp = 0,
    u.level = 1,
    u.createdAt = datetime()
```

---

### Redirect Loop Between /login and /ai

**Problem**: Stuck redirecting between login and AI tutor

**Root cause**: User authenticated in Supabase but missing in Neo4j

**Solution**: Fixed automatically! App now auto-creates Neo4j user.

**If still occurs:**
1. Clear browser cache
2. Log out completely
3. Clear Supabase session: `localStorage.clear()`
4. Sign up fresh
5. Check server logs for specific error

---

## 🤖 AI Tutor Issues

### AI Not Responding

**Problem**: Send message, but no AI response appears

**Diagnosis steps:**

**1. Check GEMINI_API_KEY:**
```bash
cat frontend/.env.local | grep GEMINI_API_KEY
# Should show your key
```

**2. Verify key is valid:**
- Go to https://aistudio.google.com/app/apikey
- Check key is active (not revoked)
- Check rate limits not exceeded

**3. Check server logs:**
```bash
# Look for:
❌ GEMINI_API_KEY not configured
❌ Python spawn error
❌ [ACE Agent] Error: ...
```

**4. Test ACE agent directly:**
```bash
cd frontend/scripts
export GEMINI_API_KEY="your-key"
python3 run_ace_agent.py <<'EOF'
{"messages":[{"role":"user","content":"Test"}]}
EOF
```

**Solutions:**
- Add GEMINI_API_KEY to `.env.local`
- Restart dev server
- Verify no extra spaces or quotes in key
- Check API key quotas not exceeded

---

### AI Timeout (No Response)

**Problem**: AI request takes forever (>10 minutes)

**Causes:**
- Complex reasoning requiring many steps
- Tool calls failing and retrying
- Neo4j query timeout
- Memory retrieval slow

**Solutions:**

**Immediate:**
- Refresh page
- Try simpler question
- Check server logs for hung process

**Long-term:**
- Optimize Neo4j queries
- Add timeout to Gemini calls
- Reduce ACE memory retrieval size
- Use faster model (gemini-2.5-flash)

**Check logs for:**
```
[ACE Memory] Loaded ... bullets  # Should be < 5 seconds
[Gemini API] Request took ...    # Should be < 30 seconds
```

---

### Python ACE Agent Errors

**Problem**: Python errors in server logs

**Common errors:**

**"ModuleNotFoundError":**
```bash
# Install missing Python dependencies
pip3 install -r frontend/requirements.txt
```

**"GEMINI_API_KEY not configured":**
```bash
# Export key in terminal where dev server runs
export GEMINI_API_KEY="your-key"
npm run dev
```

**"Neo4j connection failed":**
```bash
# Set Neo4j environment variables
export NEO4J_URI="neo4j+s://..."
export NEO4J_USERNAME="neo4j"
export NEO4J_PASSWORD="your-password"
```

**"JSON decode error":**
- Check API route is sending valid JSON to Python
- Review run_ace_agent.py input handling
- Check for Unicode issues

---

## 🗄️ Database Issues

### Neo4j Connection Failed

**Problem**: "Cannot connect to Neo4j"

**Diagnosis:**

**1. Check Neo4j instance is running:**
- Go to https://console.neo4j.io/
- Find your database
- Status should be "Running"
- If paused, click "Resume"

**2. Test connection:**
```bash
npm run setup-neo4j
```

**3. Check credentials:**
```bash
cat frontend/.env.local | grep NEO4J
# Verify URI, username, password
```

**4. Verify URI format:**
```env
# Must be:
NEXT_PUBLIC_NEO4J_URI=neo4j+s://xxxxx.databases.neo4j.io

# NOT:
# neo4j://...
# bolt://...
# https://...
```

**5. Test from Neo4j Browser:**
- Open your database in Aura Console
- If you can access Browser, credentials are correct
- If not, reset password in Aura Console

---

### Schema Setup Fails

**Problem**: `npm run setup-neo4j` fails

**Common errors:**

**"Constraint already exists":**
- **Normal!** Scripts use `IF NOT EXISTS`
- Can run multiple times safely
- Warnings are okay if constraints exist

**"Permission denied":**
- Check database is not in read-only mode
- Verify user has admin rights (default user does)

**"Connection timeout":**
- Check internet connection
- Verify Neo4j instance region (use closest)
- Try again (may be temporary network issue)

---

### Data Not Persisting

**Problem**: Create data, refresh, data gone

**Diagnosis:**

**1. Check data was created:**
```cypher
# In Neo4j Browser
MATCH (n) RETURN count(n) as total_nodes
# Should be > 0 after creating data
```

**2. Check user ID matches:**
- Supabase user ID must match Neo4j User.id
- Check browser console for user ID
- Verify in Neo4j:
  ```cypher
  MATCH (u:User {id: "supabase-user-id"}) RETURN u
  ```

**3. Check database adapter:**
- File: `frontend/lib/database-adapter.js`
- Verify: `const USE_NEO4J = true`

**4. Check API route errors:**
- Browser DevTools → Network tab
- Look for failed requests (red)
- Check response for error messages

---

## 💬 Feature-Specific Issues

### Group Chat Messages Not Appearing

**Problem**: Send message, doesn't appear for others

**Diagnosis:**

**1. Check Pusher (if using real-time):**
```bash
cat frontend/.env.local | grep PUSHER
# All 4 variables should be set
```

**2. Test without Pusher:**
- Have other user refresh page
- Message should appear after refresh
- If yes: Pusher issue
- If no: Database/API issue

**3. Check server logs:**
```
🤖 AI request processed    # Should see for @ai
MESSAGE_SENT broadcast     # Should see for Pusher
```

**Solutions:**
- Verify Pusher credentials not swapped
- Check Pusher dashboard shows activity
- Refresh both browsers
- Check Neo4j stores message:
  ```cypher
  MATCH (m:Message) RETURN m ORDER BY m.createdAt DESC LIMIT 5
  ```

---

### @ai Mentions Not Triggering

**Problem**: Type "@ai" but no AI response

**Diagnosis:**

**1. Check exact format:**
- Must be lowercase: `@ai` ✅
- Not uppercase: `@AI` ❌
- Case-sensitive!

**2. Check GEMINI_API_KEY:**
```bash
cat frontend/.env.local | grep GEMINI_API_KEY
```

**3. Check server logs:**
```
🤖 @ai mention detected
🤖 AI request processing
🤖 AI response sent
```

**4. Wait longer:**
- AI responses take 5-15 seconds
- Complex questions may take 30+ seconds
- Check server terminal for progress

**5. Check group chat initialized:**
```bash
npm run setup-groupchat
```

---

### Quiz Legendary Node Not Assigned

**Problem**: Get 100% (10/10) but receive Rare node instead of Legendary

**This was a bug - should be fixed!**

**Verify fix:**
1. Take quiz
2. Answer all 10 correctly
3. Should see "Legendary" reward with crown 👑
4. XP should be 25-30

**If still broken:**

Check server logs for debug info:
```
🔍 LEGENDARY NODE DEBUG:
  score: 10 | type: number
  totalQuestions: 10 | type: number
  score === totalQuestions? true
  ✅ LEGENDARY assigned!
```

**If shows `score === totalQuestions? false`:**
- Bug may have returned
- Report to developers
- Include screenshots and logs

**Workaround**: No easy workaround, needs code fix

---

### XP Not Being Awarded

**Problem**: Do actions but XP doesn't increase

**Diagnosis:**

**1. Check gamification bar shows:**
- Is it visible in sidebar?
- Does it show your level and XP?

**2. Test XP award:**
- Send AI message
- Watch for XP animation above send button
- Check if gamification bar updates

**3. Check server logs:**
```
# Should NOT see:
❌ Failed to update XP
```

**4. Check Neo4j:**
```cypher
MATCH (u:User {id: "your-id"}) RETURN u.xp, u.level
```

**Solutions:**
- Refresh page to sync XP
- Check API endpoint: GET `/api/user/xp?userId=xxx`
- Verify user exists in Neo4j
- Check no JavaScript errors in browser console

---

### Real-Time Updates Not Working

**Problem**: Messages/updates require page refresh

**Expected with Pusher:**
- Messages appear instantly
- No refresh needed
- Changes sync across tabs

**Without Pusher:**
- Must refresh to see updates
- This is normal if Pusher not configured

**Diagnosis:**

**1. Check Pusher configured:**
```bash
cat frontend/.env.local | grep PUSHER
# Should show 4 variables
```

**2. Check Pusher dashboard:**
- Go to https://dashboard.pusher.com/
- Select your app
- Go to "Debug Console"
- Send message in Noodeia
- Should see events in console

**3. Check browser console:**
```
Pusher: connected
Pusher: subscribed to channel
```

**4. Check credentials:**
- Not swapped (see above)
- Cluster matches app (e.g., us2)
- App ID correct

**Solutions:**
- Fix Pusher credentials
- Restart dev server
- Clear browser cache
- Or disable Pusher (refresh will work)

---

## 🏗️ Build & Deployment Issues

### Build Failures

**Problem**: `npm run build` fails

**Common causes:**

**1. TypeScript errors:**
```bash
# Build shows type errors
# Fix each error or:
npm run build 2>&1 | grep error
```

**2. Missing dependencies:**
```bash
npm install --legacy-peer-deps
npm run build
```

**3. Out of memory:**
```bash
# Increase Node.js memory
export NODE_OPTIONS=--max-old-space-size=8192
npm run build
```

**4. Cache corruption:**
```bash
# Clear and rebuild
rm -rf .next
npm run build
```

---

### Deployment Issues on Render

**Problem**: Deploy fails on Render

**Common errors:**

**"Module not found":**
- Check `package.json` includes dependency
- Example: `react-is` must be in dependencies
- Verify build command uses `--legacy-peer-deps`

**"Python command not found":**
- Render should auto-install Python
- Check `requirements.txt` exists in frontend/
- Verify render.yaml or build settings

**"Neo4j connection timeout":**
- Check Neo4j instance is running
- Verify environment variables set in Render dashboard
- Check Neo4j allows connections from Render IPs

**"Build exceeded memory limit":**
- Upgrade Render plan (more memory)
- Or optimize build:
  ```bash
  NODE_OPTIONS=--max-old-space-size=8192
  ```

**"Health check failed":**
- App might be starting slowly
- Increase health check timeout
- Or add health check endpoint: `/api/health`

**Solutions:**
1. Check Render logs for specific error
2. Verify all environment variables set
3. Test build locally first: `npm run build`
4. Use "Clear build cache & deploy"
5. Check Render status page: https://status.render.com

---

## 🔍 Debugging Techniques

### Browser DevTools

**Console tab:**
```javascript
// Check for errors
// Look for:
✅ User authenticated
✅ Conversation loaded
❌ Failed to fetch
❌ Uncaught TypeError
```

**Network tab:**
- Monitor API requests
- Check status codes (200 = success, 400/500 = error)
- View request/response bodies
- Check timing (slow requests)

**Application tab:**
- Check localStorage for theme, session data
- Clear if needed: `localStorage.clear()`

### Server Terminal Logs

**What to look for:**
```bash
# Good signs:
✅ Neo4j connection established
✅ Supabase auth configured
[ACE Memory] Loaded 12 bullets
🤖 AI request processed in 8.5s

# Bad signs:
❌ Connection failed
❌ Module not found
❌ GEMINI_API_KEY not configured
Error: ...
```

### Neo4j Browser

**Direct database inspection:**
1. Go to https://console.neo4j.io/
2. Open Neo4j Browser
3. Run queries to debug:

```cypher
# Check user exists
MATCH (u:User {email: "user@example.com"}) RETURN u

# Check sessions
MATCH (u:User)-[:HAS]->(s:Session) RETURN count(s)

# Check recent activity
MATCH (n)
WHERE n.createdAt > datetime() - duration({hours: 1})
RETURN labels(n), count(n)
```

---

## 🆘 Still Having Issues?

### When to Seek Help

If you've tried:
- ✅ Checking this troubleshooting guide
- ✅ Reviewing relevant setup documentation
- ✅ Examining logs (browser + server)
- ✅ Testing individual components
- ✅ Restarting services

And still have issues:

**1. Gather information:**
- Exact error message
- Steps to reproduce
- Browser and OS
- Screenshots
- Server logs
- Network tab if applicable

**2. Check existing issues:**
- GitHub Issues page
- Search for similar problems
- Read solutions

**3. Open new issue:**
- Provide all gathered information
- Clear description
- Steps to reproduce
- Expected vs actual behavior

### Useful Debugging Commands

```bash
# Check all versions
node --version
python3 --version
npm --version
pip3 --version

# Check environment variables loaded
npm run dev | grep "Environments loaded"

# Test Neo4j
npm run setup-neo4j

# Test Python
cd frontend/scripts && python3 run_ace_agent.py <<'EOF'
{"messages":[{"role":"user","content":"test"}]}
EOF

# Run tests
cd unitTests && ./run_all_tests.sh

# Check ports in use
lsof -i :3000  # Check if port 3000 is in use
```

---

## 📚 Additional Resources

**Setup Documentation:**
- [Getting Started Guides](./getting-started/) - Complete setup
- [Configuration Guide](./getting-started/03_CONFIGURATION.md) - Environment variables
- [Database Setup](./getting-started/04_DATABASE_SETUP.md) - Neo4j

**Technical Documentation:**
- [Database Schema](./technical/DATABASE_SCHEMA.md) - Complete schema
- [API Reference](./technical/API_REFERENCE.md) - All endpoints
- [Python Setup](./technical/PYTHON_SETUP.md) - Python environment

**External Resources:**
- Neo4j Docs: https://neo4j.com/docs/
- Supabase Docs: https://supabase.com/docs
- Google AI Docs: https://ai.google.dev/docs
- Render Docs: https://render.com/docs

---

## ✅ Prevention Tips

**Avoid common issues:**
- ✅ Always use `--legacy-peer-deps` for npm install
- ✅ Restart dev server after editing `.env.local`
- ✅ Keep Node.js and Python up to date
- ✅ Verify environment variables before running
- ✅ Run setup scripts before first use
- ✅ Test locally before deploying
- ✅ Monitor logs during development
- ✅ Keep dependencies updated
- ✅ Back up `.env.local` securely
- ✅ Document any custom configurations

**This saves time and prevents frustration!** 🎯
