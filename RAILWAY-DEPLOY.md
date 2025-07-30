# 🚂 Railway Deployment Guide for YouTube Telegram Bot

## Prerequisites
1. GitHub account with your code pushed
2. Railway account (free tier available)
3. Telegram Bot Token

## Step-by-Step Deployment

### 1. Setup Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with your GitHub account
3. Verify your account

### 2. Deploy Your Bot
1. Click "New Project" on Railway dashboard
2. Choose "Deploy from GitHub repo"
3. Select your repository: `linhcheu/youtube-telegram-bot`
4. Railway will automatically detect the Dockerfile

### 3. Configure Environment Variables
Add these environment variables in Railway dashboard:

**Required:**
```
BOT_TOKEN=7990081875:AAEpBixExCwVTgW5o2jJAwVVvIWohBOve-w
NODE_ENV=production
PORT=3000
```

**Optional (with defaults):**
```
MAX_FILE_SIZE_MB=50
DOWNLOAD_DIR=./downloads
DEBUG=false
```

### 4. Domain Setup (Optional)
1. Go to Settings → Networking
2. Generate domain or add custom domain
3. Your bot will be accessible via HTTPS

### 5. Monitor Deployment
1. Check Deployments tab for build logs
2. View Metrics for performance
3. Check Logs for runtime information

## Railway vs Render Advantages

✅ **Better for YouTube downloaders:**
- More lenient with video downloading
- Better IP reputation with YouTube
- Faster build times
- More reliable networking

✅ **Better performance:**
- Faster container startup
- Better memory management  
- More stable connections
- Less rate limiting

✅ **Easier management:**
- Better dashboard interface
- Simpler environment variable setup
- Better logging and monitoring
- Automatic SSL certificates

## Expected Results
After deployment, your bot should:
- Start faster (30-60 seconds vs 3-5 minutes on Render)
- Handle YouTube downloads more reliably
- Have better uptime and stability
- Show clearer logs and metrics

## Troubleshooting
- Check build logs if deployment fails
- Verify environment variables are set correctly
- Monitor resource usage in dashboard
- Check application logs for runtime errors

## Cost Information
- **Free Tier**: $5/month execution time credit
- **Pro Plan**: $20/month for unlimited execution
- Usually the free tier is sufficient for personal use

---

Your bot will be deployed automatically once you connect the GitHub repository to Railway!
