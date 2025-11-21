# 🚀 Render Deployment Guide

Complete guide to deploying Noodeia on Render.

---

## 📋 Why Render?

**Render was chosen over other platforms because:**

✅ **Excellent Next.js Support**: Optimized for modern Node.js applications
✅ **Python Support**: Can run Python scripts for ACE agent and TTS features
✅ **No Timeout Limits**: Supports long-running AI requests (10+ minutes)
✅ **Auto-Deploy**: Automatically deploys on git push to main branch
✅ **Free SSL**: Automatic HTTPS certificates
✅ **Simple Configuration**: Uses `render.yaml` for infrastructure as code

**Not suitable for this project:**
- Vercel: 10-second timeout limit, no Python support
- Railway: Works but Render has better Next.js integration

---

## 🎯 Quick Deploy (Recommended Method)

### Step 1: Prepare Your Repository

Ensure your code is pushed to GitHub:
```bash
git push origin main
```

### Step 2: Create Render Account

1. Go to https://render.com/
2. Click "Get Started"
3. Sign up with GitHub (recommended)
4. Authorize Render to access your GitHub repositories

### Step 3: Deploy from Dashboard

1. Click "New +" → "Web Service"
2. Select "Build and deploy from a Git repository"
3. Find and connect: `SALT-Lab-Human-AI/project-check-point-1-NOODEIA`
4. Click "Connect"

### Step 4: Configure Service

Render auto-detects `render.yaml`, but verify settings:

**Basic Settings:**
- **Name**: `noodeia` (or your choice)
- **Region**: Oregon (US West) or closest to you
- **Branch**: `main`
- **Root Directory**: *(leave blank)*
- **Runtime**: Node

**Build Settings:**
- **Build Command**:
  ```bash
  cd frontend && npm install --legacy-peer-deps && pip install -r requirements.txt && npm run build
  ```
- **Start Command**:
  ```bash
  cd frontend && npm start
  ```

**Advanced Settings:**
- **Node Version**: 20 (auto-detected from render.yaml)
- **Auto-Deploy**: Yes (deploys on git push)

### Step 5: Add Environment Variables

In the "Environment" section, add ALL variables from your `.env.local`:

**Required Variables:**

```env
NODE_ENV=production
NODE_OPTIONS=--max-old-space-size=8192

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Neo4j
NEXT_PUBLIC_NEO4J_URI=neo4j+s://xxxxx.databases.neo4j.io
NEXT_PUBLIC_NEO4J_USERNAME=neo4j
NEXT_PUBLIC_NEO4J_PASSWORD=your-password

# Gemini AI
GEMINI_API_KEY=your-gemini-key
```

**Optional Variables:**

```env
# Pusher (real-time features)
PUSHER_APP_ID=your-app-id
PUSHER_SECRET=your-secret
NEXT_PUBLIC_PUSHER_KEY=your-key
NEXT_PUBLIC_PUSHER_CLUSTER=us2

# Tavily (web search)
TAVILY_API_KEY=your-tavily-key

# ACE Agent tuning
GEMINI_MODEL=gemini-2.5-flash
ACE_LLM_TEMPERATURE=0.2
```

**How to add:**
1. Click "Add Environment Variable"
2. Enter key name (e.g., `GEMINI_API_KEY`)
3. Enter value
4. Repeat for all variables

**⚠️ Important:**
- Copy exact values from your local `.env.local`
- No quotes around values
- No spaces after `=`

### Step 6: Deploy

1. Click "Create Web Service"
2. Render will start building (5-10 minutes)
3. Watch the build logs in real-time

**Build Steps:**
1. Clone repository
2. Install Node.js dependencies (npm packages)
3. Install Python dependencies (from requirements.txt)
4. Build Next.js application
5. Start server

### Step 7: Verify Deployment

Once deploy completes:

1. **Get Your URL**: Render provides a URL like `https://noodeia.onrender.com`

2. **Test Basic Access**:
   - Visit your Render URL
   - Should see landing page

3. **Test Authentication**:
   - Click "Login" or "Start Learning"
   - Try signing up with test account
   - Should redirect to AI tutor interface

4. **Test AI Features**:
   - Send a message in AI tutor
   - Should get response within 10-15 seconds
   - Check for any errors

5. **Check Logs**:
   - Go to Render dashboard → Logs tab
   - Look for startup messages
   - Verify no error messages

---

## 🔧 Configuration Files

### render.yaml

Located at project root: `/render.yaml`

```yaml
services:
  - type: web
    name: noodeia
    runtime: node
    plan: starter
    region: oregon
    buildCommand: cd frontend && npm install --legacy-peer-deps && pip install -r requirements.txt && npm run build
    startCommand: cd frontend && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: NODE_OPTIONS
        value: --max-old-space-size=8192
      # ... (additional env vars from dashboard)
```

**Purpose**: Infrastructure as code, makes deployments reproducible

**Key Settings:**
- `plan: starter` - Can change to `free` for testing
- `region: oregon` - Can change to your preferred region
- `NODE_OPTIONS` - Allocates 8GB memory for builds

### .next.config.mjs

The Next.js config includes standalone output mode for Render:

```javascript
output: 'standalone'
```

This optimizes the production build for server deployment.

---

## 📊 Deployment Monitoring

### View Logs

**Real-time Logs:**
1. Go to Render dashboard
2. Select your service
3. Click "Logs" tab
4. Watch live server output

**What to look for:**
```
✓ Ready in 2.3s
  ○ Compiling / ...
  ✓ Compiled in 876ms

[ACE Memory] Loaded 15 bullets from Neo4j for learner=...
🤖 AI request processed in 8.2s
✅ Quiz submitted successfully
```

**Error indicators:**
```
❌ Neo4j connection failed
❌ GEMINI_API_KEY not configured
❌ [ACE Memory] ERROR: ...
```

### Performance Metrics

**Dashboard Metrics:**
- CPU usage
- Memory usage
- Network bandwidth
- Request count
- Response times

**Typical Performance:**
- Cold start (free tier): 30-60 seconds
- Warm response: 1-2 seconds
- AI request: 5-15 seconds
- Database query: 50-150ms

---

## 🔄 Auto-Deploy on Git Push

### Setup

Auto-deploy is enabled by default. Every push to `main` branch triggers deployment.

```bash
git add .
git commit -m "Update feature"
git push origin main
```

**Render automatically:**
1. Detects the push
2. Starts a new build
3. Runs tests (if configured)
4. Deploys if build succeeds
5. Switches traffic to new version

### Disable Auto-Deploy

If you want manual control:
1. Go to Settings
2. Scroll to "Auto-Deploy"
3. Toggle off

### Manual Deploy

To deploy manually:
1. Go to Render dashboard
2. Click "Manual Deploy" → "Deploy latest commit"
3. Or click "Clear build cache & deploy" for fresh build

---

## 🌐 Custom Domain (Optional)

### Add Your Domain

1. Go to Settings → Custom Domain
2. Click "Add Custom Domain"
3. Enter your domain (e.g., `noodeia.com`)
4. Render provides DNS instructions

### DNS Configuration

**For root domain** (e.g., noodeia.com):
```
Type: A
Name: @
Value: [Render provides IP]
```

**For subdomain** (e.g., app.noodeia.com):
```
Type: CNAME
Name: app
Value: [your-service].onrender.com
```

**SSL Certificate:**
- Provisioned automatically
- Takes 2-5 minutes after DNS propagates
- Free Let's Encrypt certificate

---

## 💰 Pricing & Plans

### Free Tier

**Includes:**
- 512MB RAM
- Shared CPU
- 100GB bandwidth/month
- Services spin down after 15 minutes inactivity
- Cold starts: 30-60 seconds

**Limitations:**
- Slow cold starts impact user experience
- Limited memory for large AI requests
- May time out on complex operations

**Best for**: Testing, development, demos

### Starter Plan ($7/month per service)

**Includes:**
- 512MB RAM
- Shared CPU
- No spin down (always warm)
- Faster builds
- 100GB bandwidth/month

**Benefits:**
- No cold starts
- Better user experience
- Still affordable

**Best for**: Small production deployments, after-school programs

### Standard Plan ($25/month per service)

**Includes:**
- 2GB RAM
- Dedicated CPU
- Priority builds
- 100GB bandwidth/month
- Better performance

**Best for**: Production deployments with many users

---

## 🛠️ Advanced Configuration

### Build Optimizations

**Increase Build Memory:**

Already configured in `render.yaml`:
```yaml
envVars:
  - key: NODE_OPTIONS
    value: --max-old-space-size=8192  # 8GB for builds
```

**Speed Up Builds:**
1. Go to Settings → Build & Deploy
2. Enable "Build Cache"
3. Subsequent builds will be faster

### Health Checks

**Configure health check endpoint:**
1. Go to Settings → Health Check
2. Path: `/api/health` (if you create this endpoint)
3. Expected status: 200

### Environment Groups

For multiple services:
1. Create environment group with shared variables
2. Link to multiple services
3. Update once, applies everywhere

---

## 🐛 Troubleshooting

### Build Failures

**Error**: `npm ERR! code ERESOLVE`

**Solution:**
Ensure build command includes `--legacy-peer-deps`:
```bash
cd frontend && npm install --legacy-peer-deps && pip install -r requirements.txt && npm run build
```

**Error**: `ModuleNotFoundError: No module named 'langgraph'`

**Solution:**
Python dependencies aren't being installed. Update build command to include:
```bash
cd frontend && npm install --legacy-peer-deps && pip install -r requirements.txt && npm run build
```
This installs Python packages from `frontend/requirements.txt` which includes langgraph, langchain, neo4j driver, and other Python dependencies needed for the ACE agent.

**Error**: `Module not found: Can't resolve 'react-is'`

**Solution:**
Check `package.json` includes:
```json
"dependencies": {
  "react-is": "^18.3.1"
}
```

### Deploy Succeeds But App Crashes

**Check logs for:**
```
❌ Neo4j connection failed
```

**Solution**: Verify Neo4j environment variables are set correctly

**Check logs for:**
```
❌ GEMINI_API_KEY not configured
```

**Solution**: Add GEMINI_API_KEY to environment variables

### Slow Performance

**Free tier spin down:**
- First request after inactivity: 30-60 seconds
- Subsequent requests: Normal speed

**Solutions:**
1. Upgrade to Starter plan ($7/month) - removes spin down
2. Use external uptime monitor to keep service warm
3. Optimize app performance

### "Clear Build Cache & Deploy"

If strange errors occur:
1. Go to Manual Deploy
2. Click "Clear build cache & deploy"
3. Performs fresh build without cache
4. Resolves most caching issues

---

## 📈 Monitoring & Maintenance

### Check Service Health

**Dashboard Overview:**
- Service status (Running/Failed/Deploying)
- Recent deploys
- Resource usage
- Error rate

### Set Up Alerts

1. Go to Settings → Notifications
2. Add email for:
   - Deploy failures
   - Service crashes
   - High error rates

### View Analytics

**Metrics Tab:**
- Request volume
- Response times
- Memory usage over time
- CPU usage patterns

**Use for:**
- Identify performance bottlenecks
- Plan capacity upgrades
- Monitor user growth

---

## 🔐 Security Best Practices

### Environment Variables

**Never commit sensitive data:**
- Use Render's environment variable system
- Don't hardcode keys in code
- Use `.env.local` locally, Render dashboard for production

### Access Control

**Limit repository access:**
- Only authorized team members
- Use GitHub branch protection
- Require pull request reviews

### Database Security

**Neo4j:**
- Use strong password
- Rotate credentials periodically
- Enable IP whitelist (paid plans)

### API Keys

**Rotate regularly:**
- Supabase keys can be regenerated
- Gemini API keys can be rotated
- Pusher credentials can be reset

---

## 🔄 Deployment Workflow

### Standard Workflow

```
Code Changes → Git Commit → Push to main → Render Auto-Deploy → Verify
```

### Rollback Strategy

**If deployment fails:**

1. **Automatic Rollback**: Render keeps previous version running
2. **Manual Rollback**:
   - Go to "Events" tab
   - Find previous successful deploy
   - Click "Rollback to this deploy"

### Staged Deployments

**Preview Deployments:**
1. Create pull request
2. Render creates preview deployment
3. Test on preview URL
4. Merge to main for production deploy

---

## 📚 Additional Resources

### Render Documentation
- Main docs: https://render.com/docs
- Node.js guide: https://render.com/docs/deploy-node-express-app
- Environment variables: https://render.com/docs/environment-variables
- Custom domains: https://render.com/docs/custom-domains

### Render Community
- Community forum: https://community.render.com
- Discord: https://render.com/discord
- Support: support@render.com

### Render Status
- Status page: https://status.render.com
- Incident history
- Scheduled maintenance

---

## ✅ Deployment Checklist

Before deploying to production:

**Code:**
- [ ] All features tested locally
- [ ] No console errors in browser
- [ ] No server errors in terminal
- [ ] Python ACE agent tested
- [ ] Unit tests passing (`cd unitTests && ./run_all_tests.sh`)

**Configuration:**
- [ ] All environment variables documented
- [ ] No secrets in git repository
- [ ] `.env.local` in `.gitignore`
- [ ] render.yaml configured correctly

**Database:**
- [ ] Neo4j instance created
- [ ] Schema initialized (all setup-*.js scripts run)
- [ ] Connection tested locally
- [ ] Credentials secured

**External Services:**
- [ ] Supabase project created
- [ ] Gemini API key obtained
- [ ] Pusher configured (if using)
- [ ] Tavily key obtained (if using web search)

**Render:**
- [ ] Account created
- [ ] Repository connected
- [ ] All environment variables added
- [ ] Build command verified
- [ ] Start command verified

**Post-Deploy:**
- [ ] Service shows "Live" status
- [ ] App accessible via Render URL
- [ ] Authentication works (sign up/login)
- [ ] AI tutor responds to messages
- [ ] Database persistence verified
- [ ] No errors in logs

---

## 🎓 First Deployment Guide

Step-by-step for first-time deployers:

### 1. Pre-Deployment Preparation (Local)

**Test everything works locally:**
```bash
cd frontend
npm run dev
# Test all features in browser
# Verify AI responds
# Check Neo4j stores data
```

**Verify environment:**
```bash
# Check .env.local has all required variables
cat .env.local | grep -E "(SUPABASE|NEO4J|GEMINI)"

# Should show all required credentials (values hidden for security)
```

### 2. Initialize Render Service

**From Render Dashboard:**
1. New + → Web Service
2. Connect GitHub repo
3. Service name: `noodeia`
4. Region: Oregon (or closest)
5. Branch: `main`
6. DO NOT click "Create Web Service" yet

### 3. Configure Build

**Verify settings:**
- Build Command: `cd frontend && npm install --legacy-peer-deps && pip install -r requirements.txt && npm run build`
- Start Command: `cd frontend && npm start`
- Node Version: 20

**Add environment variables** (click "Add Environment Variable" for each):

```
NODE_ENV → production
NODE_OPTIONS → --max-old-space-size=8192
NEXT_PUBLIC_SUPABASE_URL → [paste from .env.local]
NEXT_PUBLIC_SUPABASE_ANON_KEY → [paste from .env.local]
NEXT_PUBLIC_NEO4J_URI → [paste from .env.local]
NEXT_PUBLIC_NEO4J_USERNAME → neo4j
NEXT_PUBLIC_NEO4J_PASSWORD → [paste from .env.local]
GEMINI_API_KEY → [paste from .env.local]
```

**Optional** (if using):
```
PUSHER_APP_ID → [your ID]
PUSHER_SECRET → [your secret]
NEXT_PUBLIC_PUSHER_KEY → [your key]
NEXT_PUBLIC_PUSHER_CLUSTER → us2
TAVILY_API_KEY → [your key]
```

### 4. Start First Deploy

1. Double-check all variables are correct
2. Click "Create Web Service"
3. Build starts automatically

**Watch build logs:**
```
==> Cloning from GitHub...
==> Installing Node.js 20...
==> Running build command...
    npm install --legacy-peer-deps
    pip install -r requirements.txt
    npm run build
==> Build successful!
==> Starting service...
    Server listening on port 3000
==> Deploy live!
```

**Typical build time**: 5-10 minutes for first deploy

### 5. Post-Deployment Verification

**Check Service Status:**
- Dashboard should show green "Live" indicator
- No error badges

**Test Application:**

1. **Landing Page**:
   ```
   https://your-app.onrender.com/
   ```
   Should load with landing page

2. **Authentication**:
   ```
   https://your-app.onrender.com/login
   ```
   Create test account, verify it works

3. **AI Tutor**:
   ```
   https://your-app.onrender.com/ai
   ```
   Send a message, should get AI response

4. **Database Persistence**:
   - Send several messages
   - Refresh page
   - Messages should still be there
   - Verifies Neo4j connection

**Check Logs** (in Render dashboard):
```
✅ Neo4j connection established
✅ Supabase auth configured
🤖 AI request processed in 8.5s
[ACE Memory] Loaded 12 bullets from Neo4j
```

### 6. Common First-Deploy Issues

**Issue**: Build fails with dependency errors

**Solution**:
```bash
# Locally, regenerate package-lock.json
cd frontend
rm package-lock.json
npm install --legacy-peer-deps
git add package-lock.json
git commit -m "Update package-lock"
git push
```

**Issue**: App crashes with "Cannot connect to Neo4j"

**Solution**:
- Verify `NEXT_PUBLIC_NEO4J_URI` format is `neo4j+s://...`
- Check Neo4j instance is running in Aura console
- Verify password is correct (no extra spaces)

**Issue**: AI doesn't respond

**Solution**:
- Check `GEMINI_API_KEY` is set in Render environment
- Verify key is valid at https://aistudio.google.com/app/apikey
- Check logs for Gemini API errors

---

## 🔄 Updating Your Deployment

### Auto-Deploy Workflow

**Automatic** (enabled by default):
```bash
# Make changes locally
git add .
git commit -m "Add new feature"
git push origin main
# Render deploys automatically in 5-10 minutes
```

**Monitor deploy:**
1. Go to Render dashboard
2. Watch "Events" tab
3. See build progress
4. Verify deploy succeeds

### Manual Deploy

**When to use**: Testing without pushing to main

1. Go to dashboard
2. Click "Manual Deploy"
3. Select "Deploy latest commit"
4. Or "Clear build cache & deploy" for fresh build

### Preview Deploys

**For pull requests:**
1. Enable preview deploys in Settings
2. Each PR gets unique URL
3. Test before merging to main

---

## 📱 Production Optimization

### Improve Performance

**1. Upgrade Plan:**
- Free → Starter ($7/mo): Removes cold starts
- Starter → Standard ($25/mo): More memory and CPU

**2. Enable Caching:**
- Build cache: Faster subsequent builds
- CDN: Faster static asset delivery (paid plans)

**3. Database Optimization:**
- Add indexes to Neo4j queries
- Optimize Cypher queries
- Use connection pooling

### Monitor and Alert

**Set up monitoring:**
1. Go to Settings → Notifications
2. Add email address
3. Enable alerts for:
   - Deploy failures
   - Service crashes
   - High CPU/memory usage

**External monitoring** (optional):
- UptimeRobot: https://uptimerobot.com/
- Pingdom: https://www.pingdom.com/
- StatusCake: https://www.statuscake.com/

### Scaling Considerations

**When to scale up:**
- Response times > 5 seconds consistently
- Memory usage > 80%
- Frequent crashes
- User complaints about slowness

**Scaling options:**
1. Upgrade plan (more RAM/CPU)
2. Optimize code (reduce memory usage)
3. Add caching (Redis on paid plans)
4. Optimize database queries

---

## 🔍 Debugging Production Issues

### Access Logs

**View recent logs:**
```
Dashboard → Logs tab → Last 24 hours
```

**Download logs:**
```
Dashboard → Logs → Download
```

### Shell Access

**Access service shell** (paid plans):
```
Dashboard → Shell tab
```

Run commands directly on server:
```bash
ls -la
env | grep GEMINI
node --version
python3 --version
```

### Database Inspection

**Check Neo4j data:**
1. Open Neo4j Aura Console
2. Access Neo4j Browser
3. Run queries to inspect data:
   ```cypher
   MATCH (n) RETURN count(n) as total_nodes
   ```

### Rollback Procedure

**If production has issues:**

1. **Immediate rollback:**
   - Dashboard → Events tab
   - Find last working deploy
   - Click "Rollback to this deploy"
   - Restores in 1-2 minutes

2. **Fix and redeploy:**
   - Fix issue locally
   - Test thoroughly
   - Push to main
   - Render auto-deploys

3. **Emergency:**
   - Suspend service temporarily
   - Fix critical issue
   - Resume service

---

## 🎯 Production Checklist

Before going live with real users:

**Security:**
- [ ] All API keys are secret (not in code)
- [ ] HTTPS enabled (automatic on Render)
- [ ] Supabase RLS policies configured
- [ ] Neo4j password is strong
- [ ] No debug logs exposing sensitive data

**Performance:**
- [ ] Tested with 10+ concurrent users
- [ ] AI responses < 15 seconds
- [ ] Database queries < 500ms
- [ ] No memory leaks

**Reliability:**
- [ ] Error handling on all API routes
- [ ] Database connection retry logic
- [ ] Graceful degradation if Pusher fails
- [ ] Monitoring and alerts configured

**User Experience:**
- [ ] All features work on production URL
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Fast page loads

**Documentation:**
- [ ] User guides available
- [ ] Admin documentation ready
- [ ] Troubleshooting guide complete

---

## 📞 Support

### Render Support

- **Free tier**: Community support only
- **Paid plans**: Email support
- **Community**: https://community.render.com
- **Status**: https://status.render.com

### Noodeia Issues

- **Bug reports**: Check logs first, then create GitHub issue
- **Feature requests**: Open GitHub discussion
- **Setup help**: See [../TROUBLESHOOTING.md](../TROUBLESHOOTING.md)

---

## ✅ Deployment Complete!

Your Noodeia app is now live on Render!

**Next steps:**
1. Share URL with users
2. Monitor logs for errors
3. Set up custom domain (optional)
4. Configure alerts
5. Plan for scaling as users grow

**Your app is accessible at**: `https://your-app.onrender.com`

---

## 📚 Related Documentation

- **Prerequisites**: [../getting-started/01_PREREQUISITES.md](../getting-started/01_PREREQUISITES.md)
- **Configuration**: [../getting-started/03_CONFIGURATION.md](../getting-started/03_CONFIGURATION.md)
- **Troubleshooting**: [../TROUBLESHOOTING.md](../TROUBLESHOOTING.md)
- **Local Development**: [../getting-started/06_LOCAL_DEVELOPMENT.md](../getting-started/06_LOCAL_DEVELOPMENT.md)
