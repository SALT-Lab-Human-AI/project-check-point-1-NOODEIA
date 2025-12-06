# 🚀 Deployment Overview

Guide to deploying Noodeia to production.

---

## 🎯 Recommended Platform: Render

Noodeia is designed to be deployed on **Render**.

**Why Render?**
- ✅ Python support (required for ACE agent)
- ✅ No timeout limits (AI requests can take 10+ minutes)
- ✅ Auto-deploy on git push to main
- ✅ Better Next.js integration
- ✅ Free tier available
- ✅ Easy environment variable management

**Not recommended:**
- ❌ Vercel: 10-second timeout limit, no Python support

**Alternative:**
- ⚠️ Railway: Also supported (see railway.toml), but Render is recommended

---

## 📋 Pre-Deployment Checklist

Before deploying to production, ensure:

**Code:**
- [ ] All features tested locally
- [ ] No console errors in browser
- [ ] No server errors in terminal
- [ ] Python ACE agent working
- [ ] Automated tests passing

**Database:**
- [ ] Neo4j AuraDB instance created
- [ ] Schema initialized (all setup scripts run locally)
- [ ] Connection tested
- [ ] Credentials secured

**Configuration:**
- [ ] All environment variables documented
- [ ] No secrets in git repository
- [ ] `.env.local` in `.gitignore`
- [ ] Production credentials ready (separate from dev)

**External Services:**
- [ ] Supabase project created and configured
- [ ] Gemini API key obtained and tested
- [ ] Pusher configured (if using real-time features)
- [ ] Tavily key obtained (if using web search)

**Testing:**
- [ ] Unit tests pass: `cd unitTests && ./run_all_tests.sh`
- [ ] Manual tests complete: See `docs/minimalTest/useCase.md`
- [ ] ACE agent tested: `cd frontend/scripts && python3 run_ace_agent.py`

---

## 🚀 Quick Deploy to Render

### 1. Prepare Repository

```bash
# Ensure code is pushed to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Create Render Service

1. Go to https://render.com/
2. Sign up/login with GitHub
3. Click "New +" → "Web Service"
4. Connect repository: `SALT-Lab-Human-AI/project-check-point-1-NOODEIA`
5. Click "Connect"

### 3. Configure Service

**Settings** (Render auto-detects from render.yaml):
- Name: `noodeia`
- Region: Oregon (or closest to users)
- Branch: `main`
- Build Command: `cd frontend && npm install --legacy-peer-deps && npm run build`
- Start Command: `cd frontend && npm start`

### 4. Add Environment Variables

Copy all variables from your local `.env.local` to Render dashboard.

**Required:**
```
NODE_ENV=production
NODE_OPTIONS=--max-old-space-size=8192
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_NEO4J_URI=...
NEXT_PUBLIC_NEO4J_USERNAME=neo4j
NEXT_PUBLIC_NEO4J_PASSWORD=...
GEMINI_API_KEY=...
```

**Optional:**
```
PUSHER_APP_ID=...
PUSHER_SECRET=...
NEXT_PUBLIC_PUSHER_KEY=...
NEXT_PUBLIC_PUSHER_CLUSTER=us2
TAVILY_API_KEY=...
GEMINI_MODEL=gemini-2.5-flash
```

### 5. Deploy

1. Click "Create Web Service"
2. Wait 5-10 minutes for build
3. Service goes live!

**Your app will be at**: `https://your-app.onrender.com`

---

## ✅ Post-Deployment Verification

### 1. Test Landing Page

```
https://your-app.onrender.com/
```

**Should show**: Landing page with "Learn Smarter with Noodeia AI"

### 2. Test Authentication

```
https://your-app.onrender.com/login
```

- Sign up with test account
- Should redirect to /ai
- Verify user created in Neo4j

### 3. Test AI Tutor

- Send a message
- Should get response within 10-15 seconds
- Check Render logs for ACE agent activity

### 4. Test Features

- [ ] Quiz system works
- [ ] Vocabulary games work
- [ ] Todo/Kanban works
- [ ] Leaderboard displays
- [ ] Group chat works (create group, send messages)
- [ ] @ai mentions trigger AI responses
- [ ] XP and leveling work

### 5. Monitor Logs

**In Render dashboard:**
1. Click your service
2. Go to "Logs" tab
3. Watch for:
   ```
   ✅ Server started
   ✅ Neo4j connected
   [ACE Memory] Loaded ... bullets
   🤖 AI request processed
   ```

**Error indicators:**
```
❌ Connection failed
❌ API key not found
❌ Module not found
```

---

## 🔄 Continuous Deployment

### Auto-Deploy on Git Push

Already enabled by default:

```bash
# Make changes
git add .
git commit -m "Add new feature"
git push origin main

# Render auto-deploys in 5-10 minutes
```

**Monitor deploy:**
- Go to Render dashboard
- Watch "Events" tab
- See build progress and logs

### Manual Deploy

When needed:
1. Go to Render dashboard
2. Click "Manual Deploy" → "Deploy latest commit"
3. Or "Clear build cache & deploy" for fresh build

---

## 💰 Pricing Considerations

### Free Tier

**Suitable for:**
- Development testing
- Small demos
- Low-traffic use

**Limitations:**
- 512MB RAM
- Spins down after 15 minutes inactivity
- 30-60 second cold starts
- May struggle with complex AI requests

### Starter Plan ($7/month)

**Suitable for:**
- Small after-school programs (10-50 students)
- Pilot deployments
- Better user experience

**Benefits:**
- No spin down (always warm)
- Instant responses
- More reliable

**Recommended for**: Any serious use beyond testing

### Standard Plan ($25/month)

**Suitable for:**
- Large after-school programs (50-200 students)
- School-wide deployments
- High-traffic use

**Benefits:**
- 2GB RAM (handles concurrent AI requests)
- Dedicated CPU
- Better performance

---

## 📊 Monitoring Production

### Key Metrics to Watch

**In Render Dashboard:**
- **CPU Usage**: Should be <70% average
- **Memory Usage**: Should be <80% of limit
- **Response Times**: Should be <2s for non-AI endpoints
- **Error Rate**: Should be <1%

**In Neo4j Console:**
- Database size (aim to stay under free tier limits)
- Query performance
- Connection pool usage

### Set Up Alerts

1. Render dashboard → Settings → Notifications
2. Add email for:
   - Deploy failures
   - Service crashes
   - High error rates

### Uptime Monitoring (Optional)

External services to keep your app warm and monitor uptime:
- UptimeRobot: https://uptimerobot.com/ (free)
- Pingdom: https://www.pingdom.com/
- StatusCake: https://www.statuscake.com/

Ping your app every 10-15 minutes to prevent cold starts.

---

## 🎯 Deployment Complete!

✅ Application deployed to Render
✅ All environment variables configured
✅ Features tested in production
✅ Monitoring configured

**Your live app**: `https://your-app.onrender.com`

---

## 📚 Detailed Deployment Guide

For complete step-by-step deployment instructions:
→ [../deployment/RENDER.md](../deployment/RENDER.md)

Includes:
- Detailed configuration
- Troubleshooting deployment issues
- Custom domain setup
- Performance optimization
- Security best practices

---

## 📚 Next Steps

1. **Share with users**: Send them your Render URL
2. **Monitor logs**: Watch for errors and usage patterns
3. **Plan scaling**: Upgrade plan as users grow
4. **Set up custom domain** (optional): See deployment/RENDER.md

---

## ❓ Need Help?

**Deployment failing?**
- Check Render logs for specific errors
- Verify all environment variables are set
- See [../deployment/RENDER.md](../deployment/RENDER.md)
- See [../TROUBLESHOOTING.md](../TROUBLESHOOTING.md)

**App deployed but not working?**
- Test each feature individually
- Check Render logs for runtime errors
- Verify database connection
- Ensure all services (Supabase, Neo4j, Gemini) are accessible
