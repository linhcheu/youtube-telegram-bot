#!/bin/bash

# 🚀 Deploy YouTube Telegram Bot to Railway

echo "🚀 Deploying YouTube Telegram Bot to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway (if not already logged in)
echo "🔐 Please login to Railway..."
railway login

# Create new project or link existing
echo "📦 Setting up Railway project..."
railway create

# Set environment variables
echo "🔧 Setting environment variables..."
railway variables set TELEGRAM_BOT_TOKEN=$TELEGRAM_BOT_TOKEN
railway variables set MAX_FILE_SIZE_MB=50
railway variables set DOWNLOAD_DIR=./downloads
railway variables set DEBUG=false
railway variables set NODE_ENV=production

# Deploy
echo "🚢 Deploying to Railway..."
railway up

echo "✅ Deployment completed!"
echo "📝 Your bot is now running 24/7 on Railway!"
echo "🔗 Visit the Railway dashboard to monitor your bot."
