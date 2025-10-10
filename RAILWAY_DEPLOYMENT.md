# Railway Deployment Guide

## Prerequisites
- Railway account (https://railway.app)
- GitHub repository connected to Railway
- All environment variables ready

## Quick Deploy

### Step 1: Create New Project on Railway

1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select your repository: `SALT-Lab-Human-AI/project-check-point-1-NOODEIA`
4. Railway will automatically detect the configuration files

### Step 2: Configure Environment Variables

In Railway Dashboard → Your Project → Variables, add these:

```env
# Supabase Authentication
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Neo4j AuraDB
NEXT_PUBLIC_NEO4J_URI=neo4j+s://xxxxx.databases.neo4j.io
NEXT_PUBLIC_NEO4J_USERNAME=neo4j
NEXT_PUBLIC_NEO4J_PASSWORD=your-password

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Pusher Real-time
PUSHER_APP_ID=your-app-id
PUSHER_SECRET=your-secret
NEXT_PUBLIC_PUSHER_KEY=your-key
NEXT_PUBLIC_PUSHER_CLUSTER=us2

# Node Environment
NODE_ENV=production
PORT=3000
```

### Step 3: Deploy

1. Click "Deploy" in Railway Dashboard
2. Wait for build to complete (~3-5 minutes)
3. Railway will provide a public URL (e.g., `your-app.railway.app`)

### Step 4: Set Custom Domain (Optional)

1. Go to Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

## Configuration Files

- `railway.toml` - Railway build and deploy configuration
- `nixpacks.toml` - Build environment (Node.js 18 + Python 3.11)
- `Procfile` - Start command

## Features on Railway

✅ **Advantages over Vercel:**
- Long-running processes supported (no 10s timeout)
- Python support for voice cloning
- WebSocket support
- Background jobs
- Persistent storage

✅ **Performance:**
- 60-second function timeout (vs Vercel's 10s on free tier)
- Better for AI processing
- No cold starts with persistent instances

## Troubleshooting

### Build Fails
- Check that `frontend/package.json` exists
- Verify `requirements.txt` is in `frontend/` directory
- Check Railway build logs

### App Crashes on Start
- Verify all environment variables are set
- Check that PORT is set to 3000
- Review Railway deployment logs

### Database Connection Issues
- Verify Neo4j credentials
- Check Neo4j AuraDB is running
- Test connection from Railway IP

## Voice Cloning Setup

The Python environment is configured for voice cloning:
- Python 3.11 installed
- `gtts` for text-to-speech
- Ready for advanced voice cloning libraries

## Monitoring

- **Logs**: Railway Dashboard → Your Project → Deployments → Logs
- **Metrics**: CPU, Memory, Network usage available in dashboard
- **Health**: Railway automatically restarts on failures

## Rollback

If deployment fails:
1. Go to Deployments tab
2. Click on previous successful deployment
3. Click "Redeploy"

## Cost

- **Free Tier**: $5 credit/month (enough for development)
- **Hobby Plan**: $5/month for more resources
- **Pro Plan**: $20/month for production apps

## Support

- Railway Discord: https://discord.gg/railway
- Documentation: https://docs.railway.app
