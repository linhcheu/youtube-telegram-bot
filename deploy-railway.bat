@echo off
REM 🚀 Deploy YouTube Telegram Bot to Railway (Windows)

echo 🚀 Deploying YouTube Telegram Bot to Railway...

REM Check if Railway CLI is installed
railway --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Railway CLI not found. Installing...
    npm install -g @railway/cli
)

REM Login to Railway
echo 🔐 Please login to Railway...
railway login

REM Create new project
echo 📦 Setting up Railway project...
railway create

REM Set environment variables
echo 🔧 Setting environment variables...
railway variables set TELEGRAM_BOT_TOKEN=%TELEGRAM_BOT_TOKEN%
railway variables set MAX_FILE_SIZE_MB=50
railway variables set DOWNLOAD_DIR=./downloads
railway variables set DEBUG=false
railway variables set NODE_ENV=production

REM Deploy
echo 🚢 Deploying to Railway...
railway up

echo ✅ Deployment completed!
echo 📝 Your bot is now running 24/7 on Railway!
echo 🔗 Visit the Railway dashboard to monitor your bot.
pause
