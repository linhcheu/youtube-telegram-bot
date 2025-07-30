const fs = require('fs-extra');
const path = require('path');

/**
 * Validate YouTube URL
 */
function isValidYouTubeUrl(url) {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/|m\.youtube\.com\/watch\?v=)[\w-]+/;
    return youtubeRegex.test(url);
}

/**
 * Sanitize filename by removing invalid characters
 */
function sanitizeFilename(filename) {
    // Remove or replace invalid characters
    return filename
        .replace(/[<>:"/\\|?*]/g, '') // Remove invalid characters
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim()
        .substring(0, 100); // Limit length to 100 characters
}

/**
 * Format file size in human readable format
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format duration from seconds to human readable format
 */
function formatDuration(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Clean up old files in directory
 */
async function cleanupOldFiles(directory, maxAgeHours = 24) {
    try {
        const files = await fs.readdir(directory);
        const now = Date.now();
        const maxAge = maxAgeHours * 60 * 60 * 1000; // Convert to milliseconds

        for (const file of files) {
            const filePath = path.join(directory, file);
            const stats = await fs.stat(filePath);
            
            if (now - stats.mtime.getTime() > maxAge) {
                await fs.remove(filePath);
                console.log(`🗑️ Cleaned up old file: ${file}`);
            }
        }
    } catch (error) {
        console.error('Error during cleanup:', error);
    }
}

/**
 * Get available disk space
 */
async function getAvailableSpace(directory) {
    try {
        const stats = await fs.statSync(directory);
        // This is a simple check - in production you might want to use a library like 'check-disk-space'
        return Infinity; // Assume unlimited space for now
    } catch (error) {
        console.error('Error checking disk space:', error);
        return 0;
    }
}

/**
 * Validate file size against limits
 */
function validateFileSize(fileSize, maxSize, filename = 'file') {
    if (fileSize > maxSize) {
        return {
            valid: false,
            error: `${filename} is too large (${formatFileSize(fileSize)}). Maximum allowed: ${formatFileSize(maxSize)}`
        };
    }
    return { valid: true };
}

/**
 * Generate unique filename to avoid conflicts
 */
async function generateUniqueFilename(directory, baseName, extension) {
    let counter = 1;
    let filename = `${sanitizeFilename(baseName)}.${extension}`;
    let filePath = path.join(directory, filename);

    while (await fs.pathExists(filePath)) {
        filename = `${sanitizeFilename(baseName)}_${counter}.${extension}`;
        filePath = path.join(directory, filename);
        counter++;
    }

    return { filename, filePath };
}

/**
 * Extract video ID from YouTube URL
 */
function extractVideoId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

/**
 * Throttle function calls
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Debounce function calls
 */
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * Retry function with exponential backoff
 */
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            
            const delay = baseDelay * Math.pow(2, i);
            console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

/**
 * Get file extension from filename
 */
function getFileExtension(filename) {
    return path.extname(filename).toLowerCase().substring(1);
}

/**
 * Check if file is a video format
 */
function isVideoFormat(filename) {
    const videoExtensions = ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', '3gp'];
    const extension = getFileExtension(filename);
    return videoExtensions.includes(extension);
}

/**
 * Check if file is an audio format
 */
function isAudioFormat(filename) {
    const audioExtensions = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a'];
    const extension = getFileExtension(filename);
    return audioExtensions.includes(extension);
}

/**
 * Create progress bar string
 */
function createProgressBar(progress, width = 20) {
    const filled = Math.floor((progress / 100) * width);
    const empty = width - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
}

/**
 * Log with timestamp
 */
function logWithTimestamp(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}] ${message}`);
}

/**
 * Parse quality from string (e.g., "720p", "1080p")
 */
function parseQuality(qualityString) {
    const match = qualityString.match(/(\d+)p/);
    return match ? parseInt(match[1]) : 0;
}

/**
 * Convert bytes to megabytes
 */
function bytesToMB(bytes) {
    return bytes / (1024 * 1024);
}

/**
 * Convert megabytes to bytes
 */
function mbToBytes(mb) {
    return mb * 1024 * 1024;
}

/**
 * Sleep function for delays
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    isValidYouTubeUrl,
    sanitizeFilename,
    formatFileSize,
    formatDuration,
    cleanupOldFiles,
    getAvailableSpace,
    validateFileSize,
    generateUniqueFilename,
    extractVideoId,
    throttle,
    debounce,
    retryWithBackoff,
    getFileExtension,
    isVideoFormat,
    isAudioFormat,
    createProgressBar,
    logWithTimestamp,
    parseQuality,
    bytesToMB,
    mbToBytes,
    sleep
};
