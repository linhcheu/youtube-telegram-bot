const ytdl = require('@distube/ytdl-core');
const youtubedl = require('youtube-dl-exec');
const fs = require('fs-extra');
const path = require('path');
const { sanitizeFilename } = require('./utils');

// Set environment variable to disable ytdl update check
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
    },
    {
        "name": "CONSENT",
        "value": "PENDING+987",
        "domain": ".youtube.com",
        "path": "/",
        "expires": -1,
        "httpOnly": false,
        "secure": true,
        "sameSite": "None"
    }
]);

/**
 * Method 1: Enhanced ytdl-core with multiple strategies
 */
async function getVideoInfoYtdlCore(url) {
    console.log('🔧 Trying ytdl-core method...');
    
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
                    'Cache-Control': 'max-age=0',
                    'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Windows"'
                }
            }
        },
        // Strategy 2: Different User-Agent (Mac Chrome)
        {
            requestOptions: {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': '*/*',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"macOS"'
                }
            }
        },
        // Strategy 3: Mobile User-Agent (iPhone)
        {
            requestOptions: {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5'
                }
            }
        }
    ];
    
    for (let i = 0; i < strategies.length; i++) {
        try {
            console.log(`🔄 ytdl-core attempt ${i + 1}/${strategies.length}...`);
            
            const info = await ytdl.getInfo(url, strategies[i]);
            console.log('✅ ytdl-core success:', info.videoDetails.title);
            
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
                uploadDate: info.videoDetails.uploadDate || '',
                method: 'ytdl-core'
            };
            
        } catch (error) {
            console.log(`❌ ytdl-core attempt ${i + 1} failed:`, error.message);
            
            if (i < strategies.length - 1) {
                const delay = (i + 1) * 1000;
                console.log(`⏳ Waiting ${delay}ms before next attempt...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    return null;
}

/**
 * Method 2: yt-dlp fallback
 */
async function getVideoInfoYtDlp(url) {
    try {
        console.log('🔧 Trying yt-dlp method...');
        
        const info = await youtubedl(url, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            addHeader: [
                'User-Agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            ]
        });
        
        console.log('✅ yt-dlp success:', info.title);
        
        return {
            title: info.title || 'Unknown Title',
            author: {
                name: info.uploader || info.channel || 'Unknown Channel',
                channel_url: info.uploader_url || info.channel_url || ''
            },
            lengthSeconds: parseInt(info.duration) || 0,
            description: info.description || '',
            thumbnail: info.thumbnail || '',
            viewCount: parseInt(info.view_count) || 0,
            uploadDate: info.upload_date || '',
            method: 'yt-dlp'
        };
        
    } catch (error) {
        console.log('❌ yt-dlp failed:', error.message);
        return null;
    }
}

/**
 * Method 3: youtube-dl-exec with different configuration
 */
async function getVideoInfoYoutubeDlExec(url) {
    try {
        console.log('🔧 Trying youtube-dl-exec method...');
        
        const info = await youtubedl(url, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            youtubeSkipDashManifest: true,
            userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });
        
        console.log('✅ youtube-dl-exec success:', info.title);
        
        return {
            title: info.title || 'Unknown Title',
            author: {
                name: info.uploader || info.channel || 'Unknown Channel',
                channel_url: info.uploader_url || info.channel_url || ''
            },
            lengthSeconds: parseInt(info.duration) || 0,
            description: info.description || '',
            thumbnail: info.thumbnail || '',
            viewCount: parseInt(info.view_count) || 0,
            uploadDate: info.upload_date || '',
            method: 'youtube-dl-exec'
        };
        
    } catch (error) {
        console.log('❌ youtube-dl-exec failed:', error.message);
        return null;
    }
}

/**
 * Master function that tries all methods
 */
async function getVideoInfo(url) {
    try {
        console.log('🎯 Getting video info for:', url);
        
        // Method 1: Try ytdl-core first (fastest when it works)
        let info = await getVideoInfoYtdlCore(url);
        if (info) return info;
        
        // Method 2: Try yt-dlp (most reliable)
        console.log('🔄 Switching to yt-dlp...');
        info = await getVideoInfoYtDlp(url);
        if (info) return info;
        
        // Method 3: Try youtube-dl-exec with different config
        console.log('🔄 Switching to youtube-dl-exec...');
        info = await getVideoInfoYoutubeDlExec(url);
        if (info) return info;
        
        console.error('❌ All methods failed to get video info');
        return null;
        
    } catch (error) {
        console.error('❌ Critical error in getVideoInfo:', error.message);
        return null;
    }
}

/**
 * Smart download function that chooses the best method based on what worked for info
 */
async function downloadVideo(url, downloadDir, title, format = 'mp4', progressCallback = null) {
    return new Promise(async (resolve, reject) => {
        try {
            console.log('🚀 Starting download for:', title);
            
            const filename = sanitizeFilename(title) + '.' + format;
            const filePath = path.join(downloadDir, filename);

            await fs.ensureDir(downloadDir);

            // First try to get info to determine which method works
            const info = await getVideoInfo(url);
            if (!info) {
                throw new Error('Unable to get video information for download');
            }
            
            console.log(`📋 Using ${info.method} for download`);
            
            // Use the method that worked for getting info
            if (info.method === 'ytdl-core') {
                return downloadWithYtdlCore(url, filePath, progressCallback, resolve, reject);
            } else {
                return downloadWithYtDlp(url, filePath, format, progressCallback, resolve, reject);
            }
            
        } catch (error) {
            console.error('❌ Download error:', error.message);
            reject(new Error(`Download failed: ${error.message}`));
        }
    });
}

/**
 * Download using ytdl-core
 */
async function downloadWithYtdlCore(url, filePath, progressCallback, resolve, reject) {
    try {
        const info = await ytdl.getInfo(url, {
            agent,
            requestOptions: {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            }
        });
        
        let videoFormat;
        try {
            videoFormat = ytdl.chooseFormat(info.formats, { 
                quality: 'highest',
                filter: 'audioandvideo'
            });
        } catch (err) {
            videoFormat = ytdl.chooseFormat(info.formats, { quality: 'highest' });
        }
        
        const writeStream = fs.createWriteStream(filePath);
        const videoStream = ytdl(url, { 
            format: videoFormat,
            agent,
            requestOptions: {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            }
        });

        let downloadedBytes = 0;
        const totalBytes = parseInt(videoFormat.contentLength) || 0;

        videoStream.on('data', (chunk) => {
            downloadedBytes += chunk.length;
            if (progressCallback && totalBytes > 0) {
                const progress = Math.floor((downloadedBytes / totalBytes) * 100);
                if (progress % 10 === 0) {
                    progressCallback(progress);
                }
            }
        });

        videoStream.on('error', (error) => {
            fs.remove(filePath).catch(() => {});
            reject(new Error(`ytdl-core download failed: ${error.message}`));
        });

        writeStream.on('error', (error) => {
            fs.remove(filePath).catch(() => {});
            reject(new Error(`File write failed: ${error.message}`));
        });

        writeStream.on('finish', () => {
            console.log(`✅ ytdl-core download completed: ${path.basename(filePath)}`);
            resolve(filePath);
        });

        videoStream.pipe(writeStream);
        
    } catch (error) {
        reject(new Error(`ytdl-core download setup failed: ${error.message}`));
    }
}

/**
 * Download using yt-dlp
 */
async function downloadWithYtDlp(url, filePath, format, progressCallback, resolve, reject) {
    try {
        const outputTemplate = filePath.replace(path.extname(filePath), '') + '.%(ext)s';
        
        const options = {
            output: outputTemplate,
            format: format === 'mp4' ? 'best[ext=mp4]/best' : 'best',
            noCheckCertificates: true,
            noWarnings: true,
            addHeader: [
                'User-Agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            ]
        };
        
        console.log('🔄 Starting yt-dlp download...');
        
        await youtubedl(url, options);
        
        // Find the actual downloaded file
        const dir = path.dirname(filePath);
        const baseNameWithoutExt = path.basename(filePath, path.extname(filePath));
        const files = await fs.readdir(dir);
        const downloadedFile = files.find(file => file.startsWith(baseNameWithoutExt));
        
        if (downloadedFile) {
            const actualFilePath = path.join(dir, downloadedFile);
            console.log(`✅ yt-dlp download completed: ${downloadedFile}`);
            resolve(actualFilePath);
        } else {
            reject(new Error('Downloaded file not found'));
        }
        
    } catch (error) {
        reject(new Error(`yt-dlp download failed: ${error.message}`));
    }
}

/**
 * Validate YouTube URL
 */
async function validateYouTubeUrl(url) {
    try {
        if (!ytdl.validateURL(url)) {
            return { valid: false, error: 'Invalid YouTube URL' };
        }

        const info = await getVideoInfo(url);
        if (info) {
            return { valid: true, info };
        } else {
            return { valid: false, error: 'Video not accessible' };
        }
    } catch (error) {
        return { valid: false, error: error.message };
    }
}

module.exports = {
    getVideoInfo,
    downloadVideo,
    validateYouTubeUrl
};
