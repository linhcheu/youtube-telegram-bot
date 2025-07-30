# 🚀 Deployment Guide - Host Your YouTube Telegram Bot 24/7

This guide will help you deploy your YouTube Telegram bot to various cloud platforms so it runs 24/7 without needing your laptop.

## 📋 Prerequisites

- Your bot token: `7990081875:AAEpBixExCwVTgW5o2jJAwVVvIWohBOve-w`
- Git installed on your computer
- GitHub account (recommended)

## 🎯 Quick Deploy Options

### Option 1: Railway (Recommended) 🚂
**Free tier: 500 hours/month, perfect for personal use**

1. **Setup Railway:**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Deploy:**
   ```bash
   railway create
   railway up
   ```

3. **Set Environment Variables:**
   - Go to [railway.app](https://railway.app)
   - Open your project
   - Go to Variables tab
   - Add: `TELEGRAM_BOT_TOKEN` = `7990081875:AAEpBixExCwVTgW5o2jJAwVVvIWohBOve-w`

4. **Done!** Your bot is now running 24/7!

### Option 2: Render 🎨
**Free tier: 750 hours/month**

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **Deploy on Render:**
   - Go to [render.com](https://render.com)
   - Click "New Web Service"
   - Connect your GitHub repo
   - Use these settings:
     - Build Command: `npm install`
     - Start Command: `npm start`
   - Add environment variable:
     - `TELEGRAM_BOT_TOKEN` = `7990081875:AAEpBixExCwVTgW5o2jJAwVVvIWohBOve-w`

### Option 3: Heroku 🟣
**Free tier discontinued, but has affordable paid plans**

1. **Install Heroku CLI and login:**
   ```bash
   npm install -g heroku
   heroku login
   ```

2. **Deploy:**
   ```bash
   heroku create your-bot-name
   heroku config:set TELEGRAM_BOT_TOKEN=7990081875:AAEpBixExCwVTgW5o2jJAwVVvIWohBOve-w
   git push heroku main
   ```

### Option 4: DigitalOcean App Platform 🌊
**$5/month minimum**

1. Push your code to GitHub
2. Go to DigitalOcean App Platform
3. Create new app from GitHub repo
4. Set environment variables
5. Deploy

## 🛠️ Platform Comparison

| Platform | Free Tier | Sleep Policy | Best For |
|----------|-----------|-------------|----------|
| Railway | 500h/month | No sleep | Personal use |
| Render | 750h/month | Sleeps after 15min | Light usage |
| Heroku | Paid only | No sleep (paid) | Production |
| DigitalOcean | $5/month | No sleep | Serious projects |

## 🚀 Automated Deployment with GitHub

1. **Create GitHub Repository:**
   ```bash
   git init
   git add .
   git commit -m "YouTube Telegram Bot"
   git remote add origin https://github.com/YOUR_USERNAME/youtube-bot.git
   git push -u origin main
   ```

2. **Enable Auto-Deploy:**
   - Railway: Connect GitHub repo in dashboard
   - Render: Connect GitHub repo during setup
   - Set up GitHub Actions (files already included)

## 📊 Monitoring Your Bot

### Health Check Endpoint
Your bot includes a health check at `/health` that returns:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "uptime": 3600,
  "service": "youtube-telegram-bot"
}
```

### Monitoring Services
- Railway: Built-in metrics and logs
- Render: Dashboard with resource usage
- UptimeRobot: External monitoring (free)

## 🔧 Environment Variables

Make sure to set these on your hosting platform:

```env
TELEGRAM_BOT_TOKEN=7990081875:AAEpBixExCwVTgW5o2jJAwVVvIWohBOve-w
MAX_FILE_SIZE_MB=50
DOWNLOAD_DIR=./downloads
DEBUG=false
NODE_ENV=production
PORT=3000
```

## 🐳 Docker Deployment

If your platform supports Docker:

```bash
docker build -t youtube-bot .
docker run -e TELEGRAM_BOT_TOKEN=7990081875:AAEpBixExCwVTgW5o2jJAwVVvIWohBOve-w youtube-bot
```

## 🆘 Troubleshooting

### Bot Not Responding
1. Check logs on your platform dashboard
2. Verify bot token is correct
3. Ensure health check endpoint is accessible

### Deployment Failed
1. Check Node.js version (requires 16+)
2. Verify all dependencies are in package.json
3. Check platform-specific logs

### High Resource Usage
1. Monitor memory usage
2. Check for memory leaks in downloads
3. Consider upgrading plan if needed

## 📈 Scaling for Heavy Usage

If you expect many users:

1. **Use paid plans** for better resources
2. **Add Redis** for session management
3. **Implement rate limiting** to prevent abuse
4. **Use CDN** for file serving
5. **Consider queue system** for downloads

## 🎉 Success Checklist

- [ ] Bot responds to messages
- [ ] Downloads work correctly  
- [ ] Conversions complete successfully
- [ ] Health check returns 200 OK
- [ ] Environment variables are set
- [ ] Monitoring is working

## 📞 Need Help?

If you encounter issues:
1. Check the platform's documentation
2. Review error logs in the dashboard
3. Test locally with `npm start`
4. Verify all environment variables

Your bot is now ready to serve users 24/7! 🎉
