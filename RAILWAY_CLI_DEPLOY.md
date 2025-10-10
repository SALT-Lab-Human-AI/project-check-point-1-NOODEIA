# Railway CLI Deployment Guide

## Install Railway CLI

```bash
# macOS/Linux
brew install railway

# or npm
npm install -g @railway/cli

# or using curl
curl -fsSL https://railway.app/install.sh | sh
```

## Deploy Steps

### 1. Login to Railway
```bash
railway login
```
This will open a browser window to authenticate.

### 2. Initialize Project
```bash
cd /Users/edwardhu/Desktop/IS492/project-check-point-1-noodiea
railway init
```

Select "Create new project" when prompted.

### 3. Link to Project
```bash
railway link
```

### 4. Set Environment Variables

You can set them one by one:
```bash
railway variables set NEXT_PUBLIC_SUPABASE_URL="your-url"
railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY="your-key"
railway variables set NEXT_PUBLIC_NEO4J_URI="your-uri"
railway variables set NEXT_PUBLIC_NEO4J_USERNAME="neo4j"
railway variables set NEXT_PUBLIC_NEO4J_PASSWORD="your-password"
railway variables set GEMINI_API_KEY="your-key"
railway variables set PUSHER_APP_ID="your-id"
railway variables set PUSHER_SECRET="your-secret"
railway variables set NEXT_PUBLIC_PUSHER_KEY="your-key"
railway variables set NEXT_PUBLIC_PUSHER_CLUSTER="us2"
railway variables set NODE_ENV="production"
railway variables set PORT="3000"
```

Or upload from a file:
```bash
# Create a .env file with all your variables
railway variables set --from-file .env.railway
```

### 5. Deploy
```bash
railway up
```

This will:
- Upload your code
- Build using nixpacks configuration
- Deploy to Railway
- Provide you with a URL

### 6. View Logs
```bash
railway logs
```

### 7. Open in Browser
```bash
railway open
```

## Useful Commands

```bash
# Check deployment status
railway status

# View variables
railway variables

# Restart service
railway restart

# Open Railway dashboard
railway open

# Run commands in Railway environment
railway run npm start

# SSH into container
railway shell
```

## Alternative: Use Railway Dashboard

If CLI doesn't work, you can also:

1. Go to https://railway.app/new
2. Click "Empty Project"
3. Click "Deploy from GitHub repo"
4. Manually paste your GitHub URL: `https://github.com/SALT-Lab-Human-AI/project-check-point-1-NOODEIA`
5. Or use "Deploy from local directory" and upload your code

## Troubleshooting

### "railway: command not found"
- Make sure Railway CLI is installed correctly
- Add to PATH: `export PATH="$HOME/.railway/bin:$PATH"`

### Build Fails
- Check logs: `railway logs --build`
- Verify nixpacks.toml is correct
- Ensure all dependencies are in package.json

### App Crashes
- Check runtime logs: `railway logs`
- Verify environment variables: `railway variables`
- Test locally first: `cd frontend && npm start`

## Get Your Public URL

After deployment:
```bash
railway domain
```

This shows your public Railway URL (e.g., `your-app.up.railway.app`)
