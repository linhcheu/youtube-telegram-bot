# 🚀 Installation Guide - YouTube Telegram Downloader Bot

This guide will help you set up and run the YouTube Telegram Downloader Bot on your system.

## 📋 Prerequisites

Before you begin, make sure you have the following installed on your system:

### 1. Node.js (Required)
- **Version**: Node.js 16 or higher
- **Download**: https://nodejs.org/
- **Verify installation**: Open terminal/command prompt and run:
  ```bash
  node --version
  npm --version
  ```

### 2. FFmpeg (Required for audio conversion)
- **Windows**: 
  - Download from https://ffmpeg.org/download.html
  - Extract and add to PATH, OR
  - The bot will use `ffmpeg-static` package automatically
- **macOS**: 
  ```bash
  brew install ffmpeg
  ```
- **Linux (Ubuntu/Debian)**:
  ```bash
  sudo apt update
  sudo apt install ffmpeg
  ```

### 3. Telegram Bot Token (Required)
- Open Telegram and search for `@BotFather`
- Send `/newbot` command
- Follow the instructions to create your bot
- Copy the bot token (you'll need this later)

## 📦 Installation Steps

### Option 1: Automated Setup (Recommended)

#### Windows:
1. Double-click `setup.bat` file
2. Follow the prompts

#### macOS/Linux:
1. Make the setup script executable:
   ```bash
   chmod +x setup.sh
   ```
2. Run the setup script:
   ```bash
   ./setup.sh
   ```

### Option 2: Manual Setup

#### Step 1: Install Dependencies
```bash
npm install
```

#### Step 2: Configure Environment
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file and add your configuration:
   ```env
   TELEGRAM_BOT_TOKEN=your_actual_bot_token_here
   MAX_FILE_SIZE_MB=50
   DOWNLOAD_DIR=./downloads
   DEBUG=false
   ```

#### Step 3: Run Setup Script (Optional)
```bash
npm run setup
```

## 🏃‍♂️ Running the Bot

### Development Mode (with auto-restart):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

### Using VS Code:
1. Open the project in VS Code
2. Press `F5` or go to Run → Start Debugging
3. Select "Launch YouTube Bot"

## ✅ Verification

1. Start the bot using one of the methods above
2. You should see:
   ```
   🤖 YouTube Telegram Bot started successfully!
   📁 Download directory: /path/to/downloads
   📊 Max file size: 50 MB
   ```

3. Open Telegram and find your bot
4. Send `/start` command
5. Send a YouTube URL to test

## 🔧 Configuration Options

Edit the `.env` file to customize the bot:

| Variable | Description | Default |
|----------|-------------|---------|
| `TELEGRAM_BOT_TOKEN` | Your bot token from @BotFather | Required |
| `MAX_FILE_SIZE_MB` | Maximum file size in MB | 50 |
| `DOWNLOAD_DIR` | Directory for temporary downloads | ./downloads |
| `DEBUG` | Enable debug logging | false |
| `PORT` | Port for health check endpoint | 3000 |

## 📁 Project Structure

```
youtube-telegram-downloader/
├── src/
│   ├── index.js         # Entry point
│   ├── bot.js           # Main bot logic
│   ├── downloader.js    # YouTube download functionality
│   ├── converter.js     # Audio/video conversion
│   ├── utils.js         # Helper functions
│   ├── config.js        # Configuration management
│   └── cleanup.js       # File cleanup manager
├── downloads/           # Temporary download directory
├── .vscode/            # VS Code configuration
├── setup.js            # Setup script
├── setup.bat           # Windows setup script
├── setup.sh            # Unix setup script
├── .env                # Environment variables
├── .env.example        # Environment template
├── package.json        # Node.js dependencies
└── README.md           # Documentation
```

## 🚨 Troubleshooting

### Common Issues:

#### "Error: 410: Gone" when downloading
- The video may be unavailable or region-restricted
- Try a different YouTube URL

#### "FFmpeg not found" error
- Install FFmpeg manually or ensure `ffmpeg-static` package is installed
- On Windows, add FFmpeg to your PATH

#### Bot doesn't respond to messages
- Check your bot token is correct
- Ensure the bot is not already running in another terminal
- Verify your internet connection

#### "File too large" error
- Increase `MAX_FILE_SIZE_MB` in `.env` file
- Note: Telegram has a 50MB limit for bot uploads

#### Permission errors on downloads directory
- Ensure the bot has write permissions to the download directory
- Try changing `DOWNLOAD_DIR` to a different location

### Debug Mode:
Enable debug mode in `.env`:
```env
DEBUG=true
```

This will show detailed logs to help diagnose issues.

### Getting Help:
1. Check the console output for error messages
2. Enable debug mode for more detailed logs
3. Ensure all dependencies are properly installed
4. Verify your bot token is correct

## 🔄 Updating

To update the bot:
1. Pull the latest changes (if using git)
2. Run `npm install` to update dependencies
3. Restart the bot

## 🛑 Stopping the Bot

- **Development mode**: Press `Ctrl + C` in the terminal
- **Production mode**: Press `Ctrl + C` or kill the process
- **VS Code**: Stop the debugging session

## 📝 Notes

- The bot automatically cleans up old downloaded files every hour
- Files are temporarily stored in the downloads directory
- Supported video formats: MP4, WebM, AVI, MKV
- Supported audio formats: MP3, WAV, FLAC, AAC, OGG
- The bot respects YouTube's terms of service

## 🎉 Success!

If everything is working correctly, you should be able to:
1. Send YouTube URLs to your bot
2. Choose between MP4 and MP3 formats
3. Receive the downloaded files in Telegram

Enjoy your YouTube Telegram Downloader Bot! 🎬🎵
