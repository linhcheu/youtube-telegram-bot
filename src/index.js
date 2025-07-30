#!/usr/bin/env node

/**
 * YouTube Telegram Downloader Bot
 * Entry point for the application
 */

const path = require('path');
const fs = require('fs');

// Load environment variables (for local development)
// In production, environment variables are set by the hosting platform
require('dotenv').config();

// Check if .env file exists (only for local development)
const envPath = path.join(__dirname, '..', '.env');
const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction && !fs.existsSync(envPath)) {
    console.error('❌ .env file not found!');
    console.log('📝 Please create a .env file with your Telegram bot token:');
    console.log('   TELEGRAM_BOT_TOKEN=your_bot_token_here');
    console.log('   MAX_FILE_SIZE_MB=50');
    console.log('   DOWNLOAD_DIR=./downloads');
    process.exit(1);
}

// Check if bot token is provided
if (!process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN === 'your_bot_token_here') {
    console.error('❌ Please set your Telegram bot token in the .env file');
    console.log('📝 Get your token from @BotFather on Telegram');
    process.exit(1);
}

// Add HTTP server for health checks (required by most hosting platforms)
const http = require('http');

// Create health check server
const server = http.createServer((req, res) => {
    if (req.url === '/health' || req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            status: 'healthy', 
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            service: 'youtube-telegram-bot'
        }));
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🏥 Health check server running on port ${PORT}`);
});

// Start the bot
const YouTubeTelegramBot = require('./bot');

try {
    const bot = new YouTubeTelegramBot();
    console.log('🤖 YouTube Telegram Bot started successfully!');
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('📴 Received SIGTERM, shutting down gracefully...');
        server.close(() => {
            console.log('🔴 Server closed');
            process.exit(0);
        });
    });
    
    process.on('SIGINT', () => {
        console.log('📴 Received SIGINT, shutting down gracefully...');
        server.close(() => {
            console.log('🔴 Server closed');
            process.exit(0);
        });
    });
    
} catch (error) {
    console.error('❌ Failed to start bot:', error.message);
    process.exit(1);
}
