const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs-extra');
const path = require('path');
require('dotenv').config();

const { downloadVideo, getVideoInfo } = require('./downloader');
const { convertToMp3 } = require('./converter');
const { formatFileSize, isValidYouTubeUrl, sanitizeFilename } = require('./utils');
const CleanupManager = require('./cleanup');
const config = require('./config');

class YouTubeTelegramBot {
    constructor() {
        this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
        this.downloadDir = process.env.DOWNLOAD_DIR || './downloads';
        this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE_MB) * 1024 * 1024 || 50 * 1024 * 1024;
        this.activeDownloads = new Map();
        this.urlStorage = new Map();
        this.cleanupManager = new CleanupManager(this.downloadDir);
        
        this.initializeBot();
        this.setupEventHandlers();
    }

    async initializeBot() {
        // Ensure download directory exists
        await fs.ensureDir(this.downloadDir);
        
        // Start cleanup manager
        this.cleanupManager.start();
        
        console.log('🤖 YouTube Telegram Bot started successfully!');
        console.log('📁 Download directory:', path.resolve(this.downloadDir));
        console.log('📊 Max file size:', formatFileSize(this.maxFileSize));
    }

    setupEventHandlers() {
        // Start command
        this.bot.onText(/\/start/, (msg) => {
            this.handleStart(msg);
        });

        // Help command
        this.bot.onText(/\/help/, (msg) => {
            this.handleHelp(msg);
        });

        // Cancel command
        this.bot.onText(/\/cancel/, (msg) => {
            this.handleCancel(msg);
        });

        // Handle YouTube URLs
        this.bot.on('message', (msg) => {
            if (msg.text && !msg.text.startsWith('/')) {
                this.handleMessage(msg);
            }
        });

        // Handle callback queries (inline keyboard buttons)
        this.bot.on('callback_query', (query) => {
            this.handleCallbackQuery(query);
        });

        // Error handling
        this.bot.on('error', (error) => {
            console.error('❌ Bot error:', error);
        });
    }

    async handleStart(msg) {
        const chatId = msg.chat.id;
        const welcomeMessage = `
🎬 *Welcome to YouTube Downloader Bot!*

Send me any YouTube URL and I'll help you download it as:
• 📹 *MP4* - Video with audio
• 🎵 *MP3* - Audio only

*How to use:*
1. Send a YouTube URL
2. Choose your preferred format
3. Wait for the download
4. Enjoy your file!

*Commands:*
/help - Show this help message
/cancel - Cancel active download

*Note:* Files larger than ${Math.floor(this.maxFileSize / 1024 / 1024)}MB may be compressed or unavailable due to Telegram limits.
        `.trim();

        await this.bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
    }

    async handleHelp(msg) {
        const chatId = msg.chat.id;
        const helpMessage = `
🆘 *Help & Instructions*

*Supported URLs:*
• youtube.com/watch?v=...
• youtu.be/...
• m.youtube.com/watch?v=...

*Available Formats:*
• *MP4* - Full video with audio (original quality)
• *MP3* - Audio only (320kbps when possible)

*File Size Limits:*
• Maximum: ${Math.floor(this.maxFileSize / 1024 / 1024)}MB
• Larger files will be compressed automatically

*Tips:*
• Shorter videos download faster
• MP3 files are usually much smaller than MP4
• The bot works with most public YouTube videos

*Commands:*
/start - Welcome message
/help - This help message
/cancel - Cancel active download

Need more help? Contact the bot administrator.
        `.trim();

        await this.bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
    }

    async handleCancel(msg) {
        const chatId = msg.chat.id;
        
        if (this.activeDownloads.has(chatId)) {
            this.activeDownloads.delete(chatId);
            await this.bot.sendMessage(chatId, '❌ Active download cancelled.');
        } else {
            await this.bot.sendMessage(chatId, 'ℹ️ No active download to cancel.');
        }
    }

    async handleMessage(msg) {
        const chatId = msg.chat.id;
        const text = msg.text;

        console.log(`📨 Received message from ${msg.from.username || msg.from.first_name}: ${text}`);

        if (!isValidYouTubeUrl(text)) {
            await this.bot.sendMessage(chatId, 
                '❌ Please send a valid YouTube URL.\n\nExample: https://www.youtube.com/watch?v=dQw4w9WgXcQ'
            );
            return;
        }

        try {
            // Show loading message
            const loadingMsg = await this.bot.sendMessage(chatId, '🔍 Analyzing video...');

            console.log('🔍 Getting video info for:', text);
            // Get video information
            const videoInfo = await getVideoInfo(text);
            
            if (!videoInfo) {
                console.log('❌ Failed to get video info');
                await this.bot.editMessageText('❌ Unable to get video information. This could be due to:\n\n• Video is private or deleted\n• Region restrictions\n• YouTube rate limiting\n• Network issues\n\nPlease try:\n• A different video URL\n• Waiting a few minutes and trying again', {
                    chat_id: chatId,
                    message_id: loadingMsg.message_id
                });
                return;
            }

            console.log('✅ Got video info:', videoInfo.title);
            // Delete loading message
            await this.bot.deleteMessage(chatId, loadingMsg.message_id);

            // Show video info and format selection
            await this.showVideoInfo(chatId, text, videoInfo);

        } catch (error) {
            console.error('Error handling message:', error);
            await this.bot.sendMessage(chatId, '❌ An error occurred while processing your request. Please try again.');
        }
    }

    async showVideoInfo(chatId, url, videoInfo) {
        const duration = videoInfo.lengthSeconds ? this.formatDuration(videoInfo.lengthSeconds) : 'Unknown';
        const title = videoInfo.title || 'Unknown Title';
        const author = videoInfo.author?.name || 'Unknown Channel';

        const infoMessage = `
📹 *Video Found!*

*Title:* ${title}
*Channel:* ${author}
*Duration:* ${duration}

Choose your preferred format:
        `.trim();

        // Create a short hash from the URL instead of encoding the full URL
        const urlHash = Buffer.from(url).toString('base64').substring(0, 20);
        
        // Store the URL temporarily with the hash as key
        this.urlStorage = this.urlStorage || new Map();
        this.urlStorage.set(urlHash, url);
        
        // Clean old entries (keep only last 100)
        if (this.urlStorage.size > 100) {
            const entries = Array.from(this.urlStorage.entries());
            const oldEntries = entries.slice(0, entries.length - 50);
            oldEntries.forEach(([key]) => this.urlStorage.delete(key));
        }

        const keyboard = {
            inline_keyboard: [
                [
                    { text: '📹 MP4 (Video)', callback_data: `mp4_${urlHash}` },
                    { text: '🎵 MP3 (Audio)', callback_data: `mp3_${urlHash}` }
                ],
                [
                    { text: '❌ Cancel', callback_data: `cancel_${urlHash}` }
                ]
            ]
        };

        await this.bot.sendMessage(chatId, infoMessage, {
            parse_mode: 'Markdown',
            reply_markup: keyboard
        });
    }

    async handleCallbackQuery(query) {
        const chatId = query.message.chat.id;
        const data = query.data;

        try {
            await this.bot.answerCallbackQuery(query.id);

            if (data.startsWith('mp4_') || data.startsWith('mp3_')) {
                const [format, urlHash] = data.split('_');
                
                // Retrieve the URL from storage
                const url = this.urlStorage?.get(urlHash);
                if (!url) {
                    await this.bot.editMessageText('❌ Session expired. Please send the YouTube URL again.', {
                        chat_id: chatId,
                        message_id: query.message.message_id
                    });
                    return;
                }
                
                await this.processDownload(chatId, url, format, query.message.message_id);
            } else if (data.startsWith('cancel_')) {
                const [action, urlHash] = data.split('_');
                
                // Cancel any active download
                if (this.activeDownloads.has(chatId)) {
                    this.activeDownloads.delete(chatId);
                }
                
                await this.bot.editMessageText('❌ Cancelled. Send another YouTube URL to start over.', {
                    chat_id: chatId,
                    message_id: query.message.message_id
                });
            } else if (data.startsWith('stop_')) {
                // Handle cancellation during download
                const downloadId = data.split('_')[1];
                
                if (this.activeDownloads.has(chatId)) {
                    this.activeDownloads.delete(chatId);
                    await this.bot.editMessageText('❌ Download cancelled by user.', {
                        chat_id: chatId,
                        message_id: query.message.message_id
                    });
                } else {
                    await this.bot.answerCallbackQuery(query.id, { text: 'No active download to cancel.' });
                }
            }
        } catch (error) {
            console.error('Error handling callback query:', error);
            await this.bot.answerCallbackQuery(query.id, { text: 'An error occurred. Please try again.' });
        }
    }

    async processDownload(chatId, url, format, messageId) {
        const downloadId = `${chatId}_${Date.now()}`;
        
        try {
            // Check if user already has an active download
            if (this.activeDownloads.has(chatId)) {
                await this.bot.sendMessage(chatId, '⏳ You already have an active download. Please wait for it to complete.');
                return;
            }

            this.activeDownloads.set(chatId, downloadId);

            // Update message to show download started with cancel button
            const cancelKeyboard = {
                inline_keyboard: [
                    [{ text: '❌ Cancel Download', callback_data: `stop_${downloadId}` }]
                ]
            };

            await this.bot.editMessageText('⬇️ Starting download...', {
                chat_id: chatId,
                message_id: messageId,
                reply_markup: cancelKeyboard
            });

            // Check for cancellation before proceeding
            if (!this.activeDownloads.has(chatId)) {
                return; // Download was cancelled
            }

            // Get video info for filename
            const videoInfo = await getVideoInfo(url);
            const title = sanitizeFilename(videoInfo.title || 'video');

            let filePath;
            let finalFormat = format;

            if (format === 'mp4') {
                // Download video
                const progressCallback = (progress) => {
                    // Check for cancellation during download
                    if (!this.activeDownloads.has(chatId)) {
                        return; // Download was cancelled
                    }
                    
                    // Throttle progress updates (every 10%)
                    if (progress % 10 === 0) {
                        this.bot.editMessageText(`⬇️ Downloading video... ${progress}%`, {
                            chat_id: chatId,
                            message_id: messageId,
                            reply_markup: cancelKeyboard
                        }).catch(() => {}); // Ignore edit errors
                    }
                };

                filePath = await downloadVideo(url, this.downloadDir, title, 'mp4', progressCallback);
            } else if (format === 'mp3') {
                // Download video first, then convert to MP3
                await this.bot.editMessageText('⬇️ Downloading video for conversion...', {
                    chat_id: chatId,
                    message_id: messageId,
                    reply_markup: cancelKeyboard
                });

                // Check for cancellation
                if (!this.activeDownloads.has(chatId)) {
                    return;
                }

                const tempVideoPath = await downloadVideo(url, this.downloadDir, title, 'mp4');
                
                // Check for cancellation before conversion
                if (!this.activeDownloads.has(chatId)) {
                    // Clean up downloaded video if cancelled
                    await fs.remove(tempVideoPath).catch(() => {});
                    return;
                }
                
                await this.bot.editMessageText('🔄 Converting to MP3...', {
                    chat_id: chatId,
                    message_id: messageId,
                    reply_markup: cancelKeyboard
                });

                filePath = await convertToMp3(tempVideoPath, this.downloadDir, title);
                
                // Clean up temporary video file
                await fs.remove(tempVideoPath);
            }

            // Final check for cancellation
            if (!this.activeDownloads.has(chatId)) {
                // Clean up file if cancelled
                if (filePath) {
                    await fs.remove(filePath).catch(() => {});
                }
                return;
            }

            // Check file size
            const fileStats = await fs.stat(filePath);
            if (fileStats.size > this.maxFileSize) {
                await this.bot.editMessageText(
                    `❌ File too large (${formatFileSize(fileStats.size)}). Maximum allowed: ${formatFileSize(this.maxFileSize)}`,
                    { chat_id: chatId, message_id: messageId }
                );
                await fs.remove(filePath);
                return;
            }

            // Send file
            await this.bot.editMessageText('📤 Uploading file...', {
                chat_id: chatId,
                message_id: messageId
            });

            const fileOptions = {
                caption: `🎬 ${videoInfo.title}\n📊 Size: ${formatFileSize(fileStats.size)}`
            };

            if (format === 'mp4') {
                await this.bot.sendVideo(chatId, filePath, fileOptions);
            } else {
                await this.bot.sendAudio(chatId, filePath, {
                    ...fileOptions,
                    title: videoInfo.title,
                    performer: videoInfo.author?.name || 'Unknown Artist'
                });
            }

            // Delete the processing message
            await this.bot.deleteMessage(chatId, messageId);

            // Clean up file
            await fs.remove(filePath);

        } catch (error) {
            console.error('Download error:', error);
            await this.bot.editMessageText('❌ Download failed. Please try again later.', {
                chat_id: chatId,
                message_id: messageId
            });
        } finally {
            this.activeDownloads.delete(chatId);
        }
    }

    formatDuration(seconds) {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// Start the bot
if (require.main === module) {
    new YouTubeTelegramBot();
}

module.exports = YouTubeTelegramBot;
