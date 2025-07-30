# 🤖 YouTube Telegram Downloader Bot

A powerful Telegram bot that downloads YouTube videos and converts them to MP3/MP4 formats.

## ✨ Features

- 📹 Download YouTube videos in various qualities
- 🎵 Convert videos to MP3 audio
- 📱 User-friendly Telegram interface
- 🚫 Cancel downloads anytime
- 🔒 File size limits and security
- 🧹 Automatic cleanup
- ⚡ Fast and reliable

## 🚀 One-Click Deployment

Deploy your bot instantly to these platforms:

### Railway (Recommended)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/youtube-telegram-bot)

### Render
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/YOUR_USERNAME/youtube-telegram-bot)

### Heroku
[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/YOUR_USERNAME/youtube-telegram-bot)

## 🛠️ Manual Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/youtube-telegram-bot.git
   cd youtube-telegram-bot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your bot token
   ```

4. **Start the bot:**
   ```bash
   npm start
   ```

## 🔧 Configuration

Set these environment variables:

- `TELEGRAM_BOT_TOKEN`: Your bot token from @BotFather
- `MAX_FILE_SIZE_MB`: Maximum file size (default: 50)
- `DOWNLOAD_DIR`: Download directory (default: ./downloads)
- `DEBUG`: Enable debug mode (default: false)

## 📱 Usage

1. Start a chat with your bot
2. Send a YouTube URL
3. Choose your preferred format (MP3/MP4)
4. Wait for download and conversion
5. Receive your file!

## 🔄 Commands

- `/start` - Welcome message and instructions
- `/help` - Show help information
- `/cancel` - Cancel current download

## 🤝 Support

Need help? Check out:
- [Deployment Guide](DEPLOYMENT.md)
- [Installation Instructions](INSTALL.md)
- [Quick Start Guide](QUICKSTART.md)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**⚠️ Disclaimer:** This bot is for personal use only. Respect YouTube's Terms of Service and copyright laws.
