const fs = require('fs-extra');
const path = require('path');

class Config {
    constructor() {
        this.loadConfig();
    }

    loadConfig() {
        // Default configuration
        this.config = {
            telegram: {
                botToken: process.env.TELEGRAM_BOT_TOKEN,
                maxFileSize: parseInt(process.env.MAX_FILE_SIZE_MB) * 1024 * 1024 || 50 * 1024 * 1024,
                polling: true
            },
            download: {
                directory: process.env.DOWNLOAD_DIR || './downloads',
                cleanupInterval: 1, // hours
                maxFileAge: 24, // hours
                maxConcurrentDownloads: 3
            },
            video: {
                defaultQuality: 'highest',
                formats: ['mp4', 'webm', 'avi'],
                maxDuration: 3600 // seconds (1 hour)
            },
            audio: {
                defaultBitrate: 320,
                formats: ['mp3', 'wav', 'flac', 'aac'],
                defaultFormat: 'mp3'
            },
            ffmpeg: {
                timeout: 300000, // 5 minutes
                preset: 'medium'
            },
            logging: {
                level: process.env.DEBUG === 'true' ? 'debug' : 'info',
                logToFile: false,
                logFile: './logs/bot.log'
            }
        };
    }

    get(key) {
        return this.getNestedValue(this.config, key);
    }

    set(key, value) {
        this.setNestedValue(this.config, key, value);
    }

    getNestedValue(obj, key) {
        return key.split('.').reduce((o, k) => (o && o[k] !== undefined) ? o[k] : undefined, obj);
    }

    setNestedValue(obj, key, value) {
        const keys = key.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((o, k) => o[k] = o[k] || {}, obj);
        target[lastKey] = value;
    }

    validate() {
        const errors = [];

        if (!this.config.telegram.botToken) {
            errors.push('Telegram bot token is required');
        }

        if (this.config.telegram.maxFileSize <= 0) {
            errors.push('Max file size must be greater than 0');
        }

        if (!this.config.download.directory) {
            errors.push('Download directory is required');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    async ensureDirectories() {
        await fs.ensureDir(this.config.download.directory);
        
        if (this.config.logging.logToFile) {
            const logDir = path.dirname(this.config.logging.logFile);
            await fs.ensureDir(logDir);
        }
    }
}

module.exports = new Config();
