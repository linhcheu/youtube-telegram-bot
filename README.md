# YouTube Telegram Downloader Bot

A powerful Telegram bot that allows users to download YouTube videos in MP4 format or extract MP3 audio from YouTube videos.

## Features

- 📹 Download YouTube videos in MP4 format
- 🎵 Extract MP3 audio from YouTube videos
- 🤖 Easy-to-use Telegram bot interface
- 📱 Interactive inline keyboard for format selection
- 🔄 Real-time progress updates
- 📊 File size validation and optimization
- 🚀 Fast and reliable downloads

## Prerequisites

- Node.js (v16 or higher)
- FFmpeg (for audio conversion)
- Telegram Bot Token (from @BotFather)

## Installation

1. Clone this repository:
```bash
git clone <your-repo-url>
cd youtube-telegram-downloader
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
MAX_FILE_SIZE_MB=50
DOWNLOAD_DIR=./downloads
```

4. Get your Telegram Bot Token:
   - Message @BotFather on Telegram
   - Create a new bot with `/newbot`
   - Copy the token to your `.env` file

## Usage

1. Start the bot:
```bash
npm start
```

2. For development (with auto-restart):
```bash
npm run dev
```

3. Send a YouTube URL to your bot on Telegram
4. Choose between MP4 (video) or MP3 (audio) format
5. Wait for the download and receive your file!

## Supported Formats

- **MP4**: Video format with audio
- **MP3**: Audio-only format (converted from video)

## Commands

- `/start` - Welcome message and instructions
- `/help` - Show help information
- Send any YouTube URL to download

## File Size Limits

The bot automatically handles Telegram's file size limits:
- Files larger than 50MB are compressed or split
- Users are notified if a video is too large to process

## Project Structure

```
├── src/
│   ├── bot.js              # Main bot logic
│   ├── downloader.js       # YouTube download functionality
│   ├── converter.js        # Audio conversion utilities
│   └── utils.js           # Helper functions
├── downloads/             # Temporary download directory
├── .env                   # Environment variables
├── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Disclaimer

This tool is for educational purposes. Please respect YouTube's Terms of Service and copyright laws when downloading content.
