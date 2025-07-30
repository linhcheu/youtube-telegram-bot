const ytdl = require('@distube/ytdl-core');
const fs = require('fs-extra');
const path = require('path');
const { sanitizeFilename } = require('./utils');

// Set environment variable to disable ytdl update check (this was causing 403 errors)
process.env.YTDL_NO_UPDATE = '1';

// Create agent with better configuration
const agent = ytdl.createAgent([
    {
        "name": "VISITOR_INFO1_LIVE",
        "value": "st_viewed_video_page",
        "domain": ".youtube.com",
        "path": "/",
        "expires": -1,
        "httpOnly": false,
        "secure": true,
        "sameSite": "None"
    }
]);

/**
 * Get video information from YouTube URL with enhanced retry logic
 */
async function getVideoInfo(url) {
    try {
        console.log('Getting video info for:', url);
        
        // Multiple retry strategies with different configurations
        const strategies = [
            // Strategy 1: Custom agent with comprehensive headers
            {
                agent,
                requestOptions: {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                        'Accept-Language': 'en-US,en;q=0.9',
                        'Accept-Encoding': 'gzip, deflate, br',
                        'DNT': '1',
                        'Connection': 'keep-alive',
                        'Upgrade-Insecure-Requests': '1',
                        'Sec-Fetch-Dest': 'document',
                        'Sec-Fetch-Mode': 'navigate',
                        'Sec-Fetch-Site': 'none',
                        'Sec-Fetch-User': '?1',
                        'Cache-Control': 'max-age=0'
                    }
                }
            },
            // Strategy 2: Different User-Agent (Mac Chrome)
            {
                requestOptions: {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept': '*/*',
                        'Accept-Language': 'en-US,en;q=0.9'
                    }
                }
            },
            // Strategy 3: Mobile User-Agent (iPhone)
            {
                requestOptions: {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
                    }
                }
            },
            // Strategy 4: Firefox
            {
                requestOptions: {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0'
                    }  
                }
            },
            // Strategy 5: Basic attempt (last resort)
            {}
        ];
        
        let info;
        let lastError;
        
        for (let i = 0; i < strategies.length; i++) {
            try {
                console.log(`🔄 Attempt ${i + 1}/${strategies.length}...`);
                
                info = await ytdl.getInfo(url, strategies[i]);
                console.log('✅ Successfully got video info:', info.videoDetails.title);
                break;
                
            } catch (error) {
                lastError = error;
                console.log(`❌ Attempt ${i + 1} failed:`, error.message);
                
                // Add progressive delays between attempts
                if (i < strategies.length - 1) {
                    const delay = (i + 1) * 1000; // 1s, 2s, 3s, 4s delays
                    console.log(`⏳ Waiting ${delay}ms before next attempt...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        
        if (!info) {
            console.error('❌ All attempts failed. Last error:', lastError?.message);
            return null;
        }
        
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
        console.error('❌ Critical error getting video info:', error.message);
        return null;
    }
}

/**
 * Download video from YouTube with enhanced error handling
 */
async function downloadVideo(url, downloadDir, title, format = 'mp4', progressCallback = null) {
    return new Promise(async (resolve, reject) => {
        try {
            console.log('🚀 Starting download for:', title);
            
            // Sanitize filename
            const filename = sanitizeFilename(title) + '.' + format;
            const filePath = path.join(downloadDir, filename);

            // Ensure download directory exists
            await fs.ensureDir(downloadDir);

            // Get video info with the same retry strategies as getVideoInfo
            let info;
            const getInfoOptions = [
                {
                    agent,
                    requestOptions: {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                            'Accept': '*/*',
                            'Accept-Language': 'en-US,en;q=0.9',
                            'Connection': 'keep-alive'
                        }
                    }
                },
                {
                    requestOptions: {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                        }
                    }
                },
                {
                    requestOptions: {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
                        }
                    }
                }
            ];
            
            let lastError;
            for (let i = 0; i < getInfoOptions.length; i++) {
                try {
                    info = await ytdl.getInfo(url, getInfoOptions[i]);
                    console.log('✅ Got video info for download');
                    break;
                } catch (error) {
                    lastError = error;
                    console.log(`🔄 Retrying with different options... (${i + 1}/${getInfoOptions.length})`);
                    if (i < getInfoOptions.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
            }
            
            if (!info) {
                throw new Error(`Unable to access video for download: ${lastError?.message || 'Unknown error'}`);
            }
            
            // Smart format selection
            let videoFormat;
            
            if (format === 'mp4') {
                // For MP4, prioritize formats with both video and audio
                const videoAudioFormats = info.formats.filter(f => f.hasVideo && f.hasAudio);
                
                if (videoAudioFormats.length > 0) {
                    // Prefer mp4 container, then sort by quality
                    const mp4Formats = videoAudioFormats.filter(f => f.container === 'mp4');
                    const sortedFormats = (mp4Formats.length > 0 ? mp4Formats : videoAudioFormats)
                        .sort((a, b) => {
                            const aHeight = parseInt(a.height) || 0;
                            const bHeight = parseInt(b.height) || 0;
                            return bHeight - aHeight;
                        });
                    
                    videoFormat = sortedFormats[0];
                } else {
                    // Fallback to ytdl's format selection
                    try {
                        videoFormat = ytdl.chooseFormat(info.formats, { 
                            quality: 'highest',
                            filter: 'audioandvideo'
                        });
                    } catch (err) {
                        console.log('⚠️ No audioandvideo format, trying highest quality...');
                        videoFormat = ytdl.chooseFormat(info.formats, { quality: 'highest' });
                    }
                }
            } else {
                // For other formats, get highest quality
                videoFormat = ytdl.chooseFormat(info.formats, { quality: 'highest' });
            }

            if (!videoFormat) {
                throw new Error('No suitable video format found for this video');  
            }

            console.log('📋 Selected format:', videoFormat.qualityLabel || videoFormat.quality, videoFormat.container);

            // Create streams
            const writeStream = fs.createWriteStream(filePath);
            const videoStream = ytdl(url, { 
                format: videoFormat,
                ...getInfoOptions[0] // Use the working configuration
            });

            let downloadedBytes = 0;
            const totalBytes = parseInt(videoFormat.contentLength) || 0;

            // Stream event handlers
            videoStream.on('data', (chunk) => {
                downloadedBytes += chunk.length;
                
                if (progressCallback && totalBytes > 0) {
                    const progress = Math.floor((downloadedBytes / totalBytes) * 100);
                    if (progress % 10 === 0) { // Report every 10%
                        progressCallback(progress);
                    }
                }
            });

            videoStream.on('error', (error) => {
                console.error('❌ Video stream error:', error.message);
                fs.remove(filePath).catch(() => {});
                reject(new Error(`Download stream failed: ${error.message}`));
            });

            writeStream.on('error', (error) => {
                console.error('❌ Write stream error:', error.message);
                fs.remove(filePath).catch(() => {});
                reject(new Error(`File write failed: ${error.message}`));
            });

            writeStream.on('finish', () => {
                console.log(`✅ Download completed: ${filename}`);
                resolve(filePath);
            });

            // Start the download
            videoStream.pipe(writeStream);

        } catch (error) {
            console.error('❌ Download error:', error.message);
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
