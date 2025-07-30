const ytdl = require('@distube/ytdl-core');
const youtubedl = require('youtube-dl-exec');
const fs = require('fs-extra');
const path = require('path');
const { sanitizeFilename } = require('./utils');

// Set environment variable to disable ytdl update check
process.env.YTDL_NO_UPDATE = '1';

// Create multiple agents with different session data
const createRandomAgent = () => {
    const sessionData = [
        {
            "name": "VISITOR_INFO1_LIVE",
            "value": `st_viewed_video_page_${Math.random().toString(36).substring(7)}`,
            "domain": ".youtube.com",
            "path": "/",
            "expires": -1,
            "httpOnly": false,
            "secure": true,
            "sameSite": "None"
        },
        {
            "name": "CONSENT",
            "value": `PENDING+${Math.floor(Math.random() * 1000)}`,
            "domain": ".youtube.com",
            "path": "/",
            "expires": -1,
            "httpOnly": false,
            "secure": true,
            "sameSite": "None"
        },
        {
            "name": "PREF",
            "value": `tz=UTC&f1=50000000&f6=8&f5=30&f4=4000000`,
            "domain": ".youtube.com",
            "path": "/",
            "expires": -1,
            "httpOnly": false,
            "secure": true,
            "sameSite": "None"
        }
    ];
    
    return ytdl.createAgent(sessionData);
};

// Random delay function
const randomDelay = (min = 1000, max = 3000) => {
    return new Promise(resolve => {
        const delay = Math.floor(Math.random() * (max - min + 1)) + min;
        setTimeout(resolve, delay);
    });
};

// User agents pool
const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
];

const getRandomUserAgent = () => userAgents[Math.floor(Math.random() * userAgents.length)];

/**
 * Method 1: Ultra-enhanced ytdl-core with anti-detection
 */
async function getVideoInfoYtdlCore(url) {
    console.log('🔧 Trying ytdl-core method with anti-detection...');
    
    for (let i = 0; i < 5; i++) {
        try {
            console.log(`🔄 ytdl-core attempt ${i + 1}/5...`);
            
            // Add random delay to avoid rate limiting
            if (i > 0) {
                await randomDelay(2000 + (i * 1000), 4000 + (i * 1000));
            }
            
            const agent = createRandomAgent();
            const userAgent = getRandomUserAgent();
            
            const options = {
                agent,
                requestOptions: {
                    headers: {
                        'User-Agent': userAgent,
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
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache',
                        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                        'sec-ch-ua-mobile': '?0',
                        'sec-ch-ua-platform': userAgent.includes('Windows') ? '"Windows"' : userAgent.includes('Mac') ? '"macOS"' : '"Linux"',
                        'X-Forwarded-For': `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
                        'X-Real-IP': `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
                    },
                    timeout: 15000
                }
            };
            
            const info = await ytdl.getInfo(url, options);
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
            
            // If rate limited, wait longer
            if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
                console.log('⏳ Rate limited, waiting longer...');
                await randomDelay(5000 + (i * 2000), 8000 + (i * 2000));
            }
        }
    }
    
    return null;
}

/**
 * Method 2: Enhanced yt-dlp with proxy simulation
 */
async function getVideoInfoYtDlp(url) {
    try {
        console.log('🔧 Trying yt-dlp method with enhanced options...');
        
        const userAgent = getRandomUserAgent();
        
        const info = await youtubedl(url, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            skipDownload: true,
            extractFlat: false,
            addHeader: [
                `User-Agent:${userAgent}`,
                'Accept:text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language:en-us,en;q=0.5',
                'Accept-Encoding:gzip,deflate',
                'Accept-Charset:ISO-8859-1,utf-8;q=0.7,*;q=0.7',
                'Keep-Alive:300',
                'Connection:keep-alive'
            ],
            sleepInterval: Math.floor(Math.random() * 3) + 1,
            maxSleepInterval: 5,
            geoBypass: true,
            geoBypassCountry: ['US', 'GB', 'CA', 'AU'][Math.floor(Math.random() * 4)]
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
 * Method 3: youtube-dl-exec with geo-bypass
 */
async function getVideoInfoYoutubeDlExec(url) {
    try {
        console.log('🔧 Trying youtube-dl-exec with geo-bypass...');
        
        const userAgent = getRandomUserAgent();
        
        const info = await youtubedl(url, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            youtubeSkipDashManifest: true,
            userAgent: userAgent,
            referer: 'https://www.google.com/',
            geoBypass: true,
            sleepInterval: 2,
            addHeader: [
                `User-Agent:${userAgent}`,
                'Referer:https://www.google.com/'
            ]
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
 * Master function with intelligent retry and method selection
 */
async function getVideoInfo(url) {
    try {
        console.log('🎯 Getting video info for:', url);
        
        // Add initial random delay to avoid detection patterns
        await randomDelay(500, 1500);
        
        // Try yt-dlp first (most resistant to blocking)
        console.log('🔄 Starting with yt-dlp (most reliable)...');
        let info = await getVideoInfoYtDlp(url);
        if (info) return info;
        
        // Add delay before next method
        await randomDelay(3000, 5000);
        
        // Try youtube-dl-exec
        console.log('🔄 Switching to youtube-dl-exec...');
        info = await getVideoInfoYoutubeDlExec(url);
        if (info) return info;
        
        // Add longer delay before ytdl-core (most likely to be blocked)
        await randomDelay(5000, 8000);
        
        // Try ytdl-core last
        console.log('🔄 Switching to ytdl-core...');
        info = await getVideoInfoYtdlCore(url);
        if (info) return info;
        
        console.error('❌ All methods failed to get video info');
        return null;
        
    } catch (error) {
        console.error('❌ Critical error in getVideoInfo:', error.message);
        return null;
    }
}

/**
 * Enhanced download function
 */
async function downloadVideo(url, downloadDir, title, format = 'mp4', progressCallback = null) {
    return new Promise(async (resolve, reject) => {
        try {
            console.log('🚀 Starting download for:', title);
            
            const filename = sanitizeFilename(title) + '.' + format;
            const filePath = path.join(downloadDir, filename);

            await fs.ensureDir(downloadDir);

            // Get info first
            const info = await getVideoInfo(url);
            if (!info) {
                throw new Error('Unable to get video information for download');
            }
            
            console.log(`📋 Using ${info.method} for download`);
            
            // Always use yt-dlp for downloads (most reliable)
            return downloadWithYtDlp(url, filePath, format, progressCallback, resolve, reject);
            
        } catch (error) {
            console.error('❌ Download error:', error.message);
            reject(new Error(`Download failed: ${error.message}`));
        }
    });
}

/**
 * Enhanced yt-dlp download
 */
async function downloadWithYtDlp(url, filePath, format, progressCallback, resolve, reject) {
    try {
        const outputTemplate = filePath.replace(path.extname(filePath), '') + '.%(ext)s';
        const userAgent = getRandomUserAgent();
        
        const options = {
            output: outputTemplate,
            format: format === 'mp4' ? 'best[ext=mp4]/best' : 'best',
            noCheckCertificates: true,
            noWarnings: true,
            geoBypass: true,
            geoBypassCountry: ['US', 'GB', 'CA'][Math.floor(Math.random() * 3)],
            addHeader: [
                `User-Agent:${userAgent}`,
                'Referer:https://www.google.com/'
            ],
            sleepInterval: 1,
            maxSleepInterval: 3
        };
        
        console.log('🔄 Starting yt-dlp download...');
        
        await youtubedl(url, options);
        
        // Find the downloaded file
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
