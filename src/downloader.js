const ytdl = require('@distube/ytdl-core');
const fs = require('fs-extra');
const path = require('path');
const { sanitizeFilename } = require('./utils');

/**
 * Get video information from YouTube URL
 */
async function getVideoInfo(url) {
    try {
        console.log('Getting video info for:', url);
        
        // Add retry mechanism with different options
        let info;
        let lastError;
        
        // Try with different options
        const options = [
            {},
            { requestOptions: { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } } },
            { requestOptions: { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' } } }
        ];
        
        for (const option of options) {
            try {
                info = await ytdl.getInfo(url, option);
                break;
            } catch (error) {
                lastError = error;
                console.log(`Attempt failed, trying next option...`);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
            }
        }
        
        if (!info) {
            throw lastError || new Error('Failed to get video info');
        }
        
        console.log('Successfully got video info:', info.videoDetails.title);
        
        return {
            title: info.videoDetails.title || 'Unknown Title',
            author: {
                name: info.videoDetails.author?.name || 'Unknown Channel',
                channel_url: info.videoDetails.author?.channel_url || ''
            },
            lengthSeconds: parseInt(info.videoDetails.lengthSeconds) || 0,
            description: info.videoDetails.description || '',
            thumbnail: info.videoDetails.thumbnails?.[0]?.url || '',
            viewCount: parseInt(info.videoDetails.viewCount) || 0,
            uploadDate: info.videoDetails.uploadDate || ''
        };
    } catch (error) {
        console.error('Error getting video info:', error.message);
        console.error('Full error:', error);
        return null;
    }
}

/**
 * Download video from YouTube
 */
async function downloadVideo(url, downloadDir, title, format = 'mp4', progressCallback = null) {
    return new Promise(async (resolve, reject) => {
        try {
            console.log('Starting download for:', title);
            
            // Sanitize filename
            const filename = sanitizeFilename(title) + '.' + format;
            const filePath = path.join(downloadDir, filename);

            // Ensure download directory exists
            await fs.ensureDir(downloadDir);

            // Get video info to select best quality
            let info;
            try {
                info = await ytdl.getInfo(url, {
                    requestOptions: { 
                        headers: { 
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                        }
                    }
                });
            } catch (error) {
                console.error('Failed to get video info for download:', error.message);
                throw new Error('Unable to access video. It may be private, deleted, or region-blocked.');
            }
            
            let videoFormat;
            
            if (format === 'mp4') {
                // For MP4, try to get the best quality with both video and audio
                const formats = info.formats.filter(f => f.hasVideo && f.hasAudio && f.container === 'mp4');
                if (formats.length > 0) {
                    videoFormat = formats.reduce((best, current) => {
                        const bestHeight = parseInt(best.height) || 0;
                        const currentHeight = parseInt(current.height) || 0;
                        return currentHeight > bestHeight ? current : best;
                    });
                } else {
                    // Fallback to any format with video and audio
                    videoFormat = ytdl.chooseFormat(info.formats, { 
                        quality: 'highest',
                        filter: 'audioandvideo'
                    });
                }
            } else {
                // For other formats, get highest quality
                videoFormat = ytdl.chooseFormat(info.formats, { quality: 'highest' });
            }

            if (!videoFormat) {
                throw new Error('No suitable video format found');
            }

            console.log('Selected format:', videoFormat.qualityLabel || videoFormat.quality, videoFormat.container);

            const writeStream = fs.createWriteStream(filePath);
            const videoStream = ytdl(url, { 
                format: videoFormat,
                requestOptions: { 
                    headers: { 
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                }
            });

            let downloadedBytes = 0;
            const totalBytes = parseInt(videoFormat.contentLength) || 0;

            videoStream.on('data', (chunk) => {
                downloadedBytes += chunk.length;
                
                if (progressCallback && totalBytes > 0) {
                    const progress = Math.floor((downloadedBytes / totalBytes) * 100);
                    progressCallback(progress);
                }
            });

            videoStream.on('error', (error) => {
                console.error('Video stream error:', error);
                fs.remove(filePath).catch(() => {});
                reject(new Error(`Download failed: ${error.message}`));
            });

            writeStream.on('error', (error) => {
                console.error('Write stream error:', error);
                fs.remove(filePath).catch(() => {});
                reject(new Error(`File write failed: ${error.message}`));
            });

            writeStream.on('finish', () => {
                console.log(`✅ Download completed: ${filename}`);
                resolve(filePath);
            });

            videoStream.pipe(writeStream);

        } catch (error) {
            console.error('Download error:', error);
            reject(new Error(`Download failed: ${error.message}`));
        }
    });
}

/**
 * Check if a YouTube URL is valid and accessible
 */
async function validateYouTubeUrl(url) {
    try {
        if (!ytdl.validateURL(url)) {
            return { valid: false, error: 'Invalid YouTube URL' };
        }

        const info = await ytdl.getInfo(url);
        
        // Check if video is available
        if (!info.videoDetails.isLiveContent && info.videoDetails.lengthSeconds) {
            return { valid: true, info };
        } else {
            return { valid: false, error: 'Video not available for download' };
        }
    } catch (error) {
        return { valid: false, error: error.message };
    }
}

/**
 * Get available formats for a YouTube video
 */
async function getAvailableFormats(url) {
    try {
        const info = await ytdl.getInfo(url);
        const formats = info.formats;

        const videoFormats = formats.filter(f => f.hasVideo && f.hasAudio);
        const audioFormats = formats.filter(f => f.hasAudio && !f.hasVideo);

        return {
            video: videoFormats.map(f => ({
                itag: f.itag,
                quality: f.qualityLabel || f.quality,
                container: f.container,
                filesize: f.contentLength
            })),
            audio: audioFormats.map(f => ({
                itag: f.itag,
                quality: f.audioQuality,
                container: f.container,
                filesize: f.contentLength
            }))
        };
    } catch (error) {
        console.error('Error getting formats:', error);
        return { video: [], audio: [] };
    }
}

/**
 * Get video duration in seconds
 */
async function getVideoDuration(url) {
    try {
        const info = await ytdl.getInfo(url);
        return parseInt(info.videoDetails.lengthSeconds);
    } catch (error) {
        console.error('Error getting video duration:', error);
        return 0;
    }
}

/**
 * Get estimated file size for a video
 */
async function getEstimatedFileSize(url, quality = 'highest') {
    try {
        const info = await ytdl.getInfo(url);
        const format = ytdl.chooseFormat(info.formats, { quality });
        
        if (format.contentLength) {
            return parseInt(format.contentLength);
        }
        
        // Estimate based on duration and bitrate
        const duration = parseInt(info.videoDetails.lengthSeconds);
        const bitrate = format.bitrate || 1000000; // Default 1Mbps
        return Math.floor((duration * bitrate) / 8); // Convert to bytes
        
    } catch (error) {
        console.error('Error estimating file size:', error);
        return 0;
    }
}

module.exports = {
    getVideoInfo,
    downloadVideo,
    validateYouTubeUrl,
    getAvailableFormats,
    getVideoDuration,
    getEstimatedFileSize
};
