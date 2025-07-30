#!/bin/bash

# 🚀 Deploy YouTube Telegram Bot to Render

echo "🚀 Deploying YouTube Telegram Bot to Render..."

# Check if Render CLI is installed
if ! command -v render &> /dev/null; then
    echo "❌ Render CLI not found. Installing..."
    npm install -g @render/cli
fi

# Check if git repository is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit for deployment"
fi

echo "🔧 Deployment Instructions for Render:"
echo "1. Go to https://render.com and sign up/login"
echo "2. Connect your GitHub repository"
echo "3. Create a new Web Service"
echo "4. Use these settings:"
echo "   - Build Command: npm install"
echo "   - Start Command: npm start"
echo "   - Environment: Node"
echo "5. Add environment variables:"
echo "   - TELEGRAM_BOT_TOKEN: $TELEGRAM_BOT_TOKEN"
echo "   - MAX_FILE_SIZE_MB: 50"
echo "   - DOWNLOAD_DIR: ./downloads"
echo "   - DEBUG: false"
echo "   - NODE_ENV: production"

echo "✅ Your render.yaml file is already configured!"
echo "📝 Push your code to GitHub and deploy through Render dashboard."
