@echo off
echo 🚀 YouTube Telegram Bot - Quick Deploy Setup
echo ============================================
echo.

echo 🔧 Setting up your bot for 24/7 hosting...
echo.

REM Update .env with the correct token
echo Updating environment configuration...
echo TELEGRAM_BOT_TOKEN=7990081875:AAEpBixExCwVTgW5o2jJAwVVvIWohBOve-w > .env
echo MAX_FILE_SIZE_MB=50 >> .env
echo DOWNLOAD_DIR=./downloads >> .env
echo DEBUG=false >> .env
echo PORT=3000 >> .env
echo NODE_ENV=production >> .env

echo ✅ Environment configured with your bot token!
echo.

echo 📦 Installing dependencies...
call npm install

echo.
echo 🧪 Testing bot locally...
call npm test

echo.
echo 🎉 Your bot is ready for deployment!
echo.
echo 📋 Next Steps:
echo    1. Choose a hosting platform:
echo       • Railway (Recommended): https://railway.app
echo       • Render: https://render.com
echo       • Heroku: https://heroku.com
echo.
echo    2. For Railway (easiest):
echo       • Run: npm install -g @railway/cli
echo       • Run: railway login
echo       • Run: railway create
echo       • Run: railway up
echo.
echo    3. Your bot will be online 24/7!
echo.
echo 💡 Check DEPLOYMENT.md for detailed instructions
echo.
pause
