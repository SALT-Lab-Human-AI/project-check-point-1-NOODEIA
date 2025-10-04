# 🚀 Vercel Deployment Guide - Noodeia AI Tutor

This guide will help you deploy the Noodeia AI Tutor application to Vercel.

## 📋 Prerequisites

Before deploying to Vercel, ensure you have:

- ✅ GitHub repository with your code
- ✅ Supabase account and project credentials
- ✅ Neo4j AuraDB instance running
- ✅ All environment variables ready

## 🎯 Quick Deploy (5 Minutes)

### Step 1: Create Vercel Account

1. Go to https://vercel.com
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your repositories

### Step 2: Import Project

1. Click "Add New..." → "Project"
2. Find `project-check-point-1-NOODEIA` in the list
3. Click "Import"

### Step 3: Configure Project Settings

⚠️ **IMPORTANT: You must configure the Root Directory**

1. **Root Directory:**
   - Click "Edit" next to Root Directory
   - Enter: `frontend`
   - Click "Save"

2. **Framework Preset:** Next.js (should auto-detect)

3. **Build & Development Settings:**
   - Build Command: `npm run build` (leave default)
   - Output Directory: `.next` (leave default)
   - Install Command: `npm install --legacy-peer-deps`
   - Click "Override" next to Install Command to set this value

### Step 4: Add Environment Variables

Click "Environment Variables" and add these **5 variables**:

**Apply to:** All (Production, Preview, Development)

```
NEXT_PUBLIC_SUPABASE_URL
Value: your-supabase-url

NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: your-supabase-anon-key

NEXT_PUBLIC_NEO4J_URI
Value: neo4j+s://xxxxx.databases.neo4j.io

NEXT_PUBLIC_NEO4J_USERNAME
Value: neo4j

NEXT_PUBLIC_NEO4J_PASSWORD
Value: your-neo4j-password
```

**⚠️ Important:**
- All variables must start with `NEXT_PUBLIC_` to be available in the browser
- Use your actual credentials from `.env.local` file
- Check **Production**, **Preview**, and **Development** for each variable

### Step 5: Deploy!

Click "Deploy" button and wait 1-2 minutes.

Your app will be live at: `https://your-project-name.vercel.app`

---

## 🔄 How Deployments Work

### Automatic Deployments

**Every push to main branch:**
- Automatically builds and deploys to production
- Updates your main URL

**Every push to other branches:**
- Creates a preview deployment
- Gets a unique preview URL

**Every pull request:**
- Creates a preview deployment
- Adds preview URL as a comment on the PR

### Manual Deployments

You can also deploy manually from Vercel dashboard:
1. Go to your project
2. Click "Deployments"
3. Click "..." on any deployment → "Redeploy"

---

## 🌐 Custom Domain (Optional)

### Add Your Own Domain

1. Go to Project Settings → Domains
2. Add your domain (e.g., `noodeia.com`)
3. Follow DNS configuration instructions
4. Vercel automatically provisions SSL certificate

**Free SSL:** Automatic HTTPS with Let's Encrypt

---

## 📊 Environment Variables Management

### View Environment Variables

Project Settings → Environment Variables

### Update Variables

1. Edit the variable
2. Redeploy for changes to take effect

### Per-Environment Variables

You can set different values for:
- **Production** - Main deployment
- **Preview** - Branch deployments
- **Development** - Local development (optional)

---

## 🔍 Monitoring & Debugging

### View Build Logs

1. Go to Deployments
2. Click on any deployment
3. View "Building" logs for errors

### View Runtime Logs

1. Go to deployment
2. Click "Functions" tab
3. View real-time logs

### Analytics (Available on Pro plan)

- Page views
- Unique visitors
- Top pages
- Traffic sources

---

## ⚡ Performance Features

### Automatically Enabled

✅ **Edge Network** - Global CDN for fast loading
✅ **Image Optimization** - Automatic image optimization
✅ **Code Splitting** - Automatic bundle optimization
✅ **Compression** - Gzip and Brotli compression
✅ **Caching** - Smart caching headers

---

## 🐛 Troubleshooting

### Build Fails with "Cannot find module"

**Solution:** Ensure `vercel.json` has:
```json
"installCommand": "cd frontend && npm install --legacy-peer-deps"
```

### Environment Variables Not Working

**Check:**
1. Variables start with `NEXT_PUBLIC_`
2. Variables are added to all environments
3. Redeploy after adding variables

### "Neo4j driver not initialized" Error

**Solution:**
1. Verify all Neo4j environment variables are set
2. Check Neo4j instance is running in AuraDB console
3. Test connection locally first

### 404 on Deployment

**Solution:**
1. Verify `frontend` is set as root directory
2. Check build completed successfully
3. Look for errors in build logs

---

## 🔒 Security Best Practices

### Environment Variables

✅ **DO:**
- Use Vercel's environment variables feature
- Never commit `.env.local` to git
- Rotate credentials regularly

❌ **DON'T:**
- Hardcode credentials in code
- Share production credentials
- Use same credentials for dev/prod

### Neo4j Security

- Use strong passwords
- Restrict IP access if possible (Vercel uses dynamic IPs)
- Monitor connection logs in Neo4j console

---

## 📈 Vercel Free Tier Limits

- **Bandwidth:** 100GB/month
- **Build Time:** 6,000 minutes/month
- **Deployments:** Unlimited
- **Team Members:** 1 (on Hobby plan)

**For this app:** Free tier is more than sufficient!

---

## 🔄 Rollback Deployments

### Instant Rollback

If something goes wrong:

1. Go to Deployments
2. Find a previous working deployment
3. Click "..." → "Promote to Production"
4. Done! Instant rollback (no rebuild needed)

---

## 🚀 Advanced Configuration

### Build Performance

Edit `vercel.json` to optimize:

```json
{
  "version": 2,
  "buildCommand": "cd frontend && npm run build",
  "framework": "nextjs",
  "installCommand": "cd frontend && npm install --legacy-peer-deps"
}
```

### Redirect Rules

Add to `vercel.json`:

```json
{
  "redirects": [
    {
      "source": "/old-path",
      "destination": "/new-path",
      "permanent": true
    }
  ]
}
```

---

## 📞 Support & Resources

- **Vercel Documentation:** https://vercel.com/docs
- **Vercel Support:** https://vercel.com/support
- **Status Page:** https://vercel-status.com
- **Community:** https://github.com/vercel/vercel/discussions

---

## ✅ Post-Deployment Checklist

- [ ] Deployment succeeded
- [ ] Application loads at Vercel URL
- [ ] Can create an account (Supabase auth works)
- [ ] Can log in
- [ ] Can create new chat (Neo4j connection works)
- [ ] Can send messages
- [ ] Dark/Light theme works
- [ ] Mobile responsive works
- [ ] (Optional) Custom domain configured
- [ ] (Optional) Team members invited

---

## 🎉 Success!

Your Noodeia AI Tutor is now live on Vercel!

**Share your deployed app:**
- Production URL: `https://your-project.vercel.app`
- Share with users, add to README, promote on social media!

**Next Steps:**
- Monitor deployment logs
- Set up custom domain (optional)
- Invite team members (optional)
- Configure preview deployments for PRs

---

## 🆚 Vercel vs GitHub Pages

| Feature | GitHub Pages | Vercel |
|---------|--------------|--------|
| Setup Time | 10 min | 5 min |
| Static Export | Required | Not needed |
| basePath | Required | Not needed |
| Environment Vars | GitHub Secrets | Vercel Dashboard |
| Preview Deployments | No | Yes ✅ |
| Rollbacks | Manual | One-click ✅ |
| Build Time | 2-5 min | 1-2 min |
| Custom Domain | Free | Free |
| SSL Certificate | Automatic | Automatic |
| Analytics | No | Yes (Pro) |

**Winner:** Vercel provides better developer experience and more features! 🎯
