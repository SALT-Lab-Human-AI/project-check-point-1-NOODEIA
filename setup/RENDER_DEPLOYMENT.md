# Render Deployment Guide

## Quick Deploy

### Option 1: Deploy via Render Dashboard (Recommended)

1. Go to https://render.com/
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `SALT-Lab-Human-AI/project-check-point-1-NOODEIA`
4. Render will auto-detect the `render.yaml` configuration

### Configure Build Settings:

**If render.yaml is not detected, manually configure:**

- **Name**: noodeia
- **Runtime**: Node
- **Region**: Oregon (US West) or closest to you
- **Branch**: main
- **Root Directory**: (leave blank)
- **Build Command**:
  ```bash
  cd frontend && npm install --legacy-peer-deps && npm run build
  ```
- **Start Command**:
  ```bash
  cd frontend && npm start
  ```

### Add Environment Variables:

In the "Environment" section, add these variables:

```env
NODE_ENV=production
NODE_OPTIONS=--max-old-space-size=8192

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://wwuhgudenirecbvlraya.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3dWhndWRlbmlyZWNidmxyYXlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1Mzk4MTMsImV4cCI6MjA3NTExNTgxM30.ZBgiIxuZ3qPzW6JDmAcFSyyMUuA0_zLV5k4iWN5DJrQ

# Neo4j
NEXT_PUBLIC_NEO4J_URI=your-neo4j-uri
NEXT_PUBLIC_NEO4J_USERNAME=neo4j
NEXT_PUBLIC_NEO4J_PASSWORD=your-neo4j-password

# Gemini
GEMINI_API_KEY=your-gemini-api-key

# Pusher
PUSHER_APP_ID=2059509
PUSHER_SECRET=6f7f7f4e68f7892e333d
NEXT_PUBLIC_PUSHER_KEY=be045a5b3ce8f55949bd
NEXT_PUBLIC_PUSHER_CLUSTER=us2
```

### Deploy:

1. Click "Create Web Service"
2. Render will build and deploy automatically
3. You'll get a URL like: `https://noodeia.onrender.com`

---

## Option 2: Deploy via CLI

### Install Render CLI:

```bash
# macOS/Linux
brew tap render-oss/render
brew install render

# Or download from: https://render.com/docs/cli
```

### Deploy:

```bash
# Login
render login

# Deploy
render deploy
```

---

## Advantages of Render:

✅ **Better Next.js Support**: Optimized for Node.js apps
✅ **Free SSL**: Automatic HTTPS
✅ **Auto-deploy**: Deploys on git push
✅ **Python Support**: Can run Python for TTS
✅ **Persistent Storage**: Available on paid plans
✅ **No Cold Starts**: On paid plans

---

## Pricing:

- **Free Tier**:
  - 512MB RAM
  - Services spin down after 15 minutes of inactivity
  - Slow cold starts

- **Starter Plan** ($7/month):
  - No spin down
  - Faster builds
  - More memory

- **Standard Plan** ($25/month):
  - 2GB RAM
  - Priority builds
  - Best for production

---

## Troubleshooting:

### Build Fails:
- Check build logs in Render dashboard
- Verify all environment variables are set
- Check Node.js version (should be 20+)

### App Crashes:
- View logs in Render dashboard
- Check database connections
- Verify environment variables

### Slow Performance:
- Free tier has cold starts
- Upgrade to Starter or Standard plan
- Consider using CDN for static assets

---

## Monitoring:

- **Logs**: Available in dashboard (last 7 days on free tier)
- **Metrics**: CPU, Memory, Network usage
- **Alerts**: Set up notifications for crashes

---

## Custom Domain:

1. Go to Settings → Custom Domain
2. Add your domain
3. Update DNS records as instructed
4. SSL certificate provisioned automatically

---

## Support:

- Documentation: https://render.com/docs
- Community: https://community.render.com
- Support: support@render.com
