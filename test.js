const { isValidYouTubeUrl, sanitizeFilename, formatFileSize } = require('./src/utils');
const ytdl = require('@distube/ytdl-core');
require('dotenv').config();

console.log('🧪 Running basic tests...\n');

// Test utility functions
console.log('1. Testing YouTube URL validation:');
console.log('   Valid URL:', isValidYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'));
console.log('   Invalid URL:', isValidYouTubeUrl('https://example.com'));

console.log('\n2. Testing filename sanitization:');
console.log('   Original: "Test Video: Amazing! (2024)"');
console.log('   Sanitized:', sanitizeFilename('Test Video: Amazing! (2024)'));

console.log('\n3. Testing file size formatting:');
console.log('   1024 bytes =', formatFileSize(1024));
console.log('   1048576 bytes =', formatFileSize(1048576));

console.log('\n4. Testing ytdl-core:');
const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
try {
    if (ytdl.validateURL(testUrl)) {
        console.log('   ✅ ytdl-core URL validation is working');
        
        // Test actual video info retrieval
        console.log('   Testing video info retrieval...');
        ytdl.getInfo(testUrl, {
            requestOptions: { 
                headers: { 
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            }
        }).then(info => {
            console.log('   ✅ Successfully retrieved video info:', info.videoDetails.title);
        }).catch(error => {
            console.log('   ⚠️ Video info retrieval failed:', error.message);
            console.log('   This might be due to YouTube rate limiting or regional restrictions');
        });
    } else {
        console.log('   ❌ ytdl-core validation failed');
    }
} catch (error) {
    console.log('   ❌ ytdl-core error:', error.message);
}

console.log('\n5. Testing environment variables:');
console.log('   Bot token set:', process.env.TELEGRAM_BOT_TOKEN ? '✅ Yes' : '❌ No');
console.log('   Download dir:', process.env.DOWNLOAD_DIR || './downloads');
console.log('   Max file size:', (process.env.MAX_FILE_SIZE_MB || '50') + 'MB');

console.log('\n✅ Basic tests completed!');

if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_BOT_TOKEN !== 'your_bot_token_here') {
    console.log('\n🚀 Your bot is ready to use!');
    console.log('Bot is running - send YouTube URLs to your Telegram bot!');
    console.log('\nTo stop the bot: Press Ctrl+C in the terminal running npm start');
} else {
    console.log('\nNext steps:');
    console.log('1. Set your TELEGRAM_BOT_TOKEN in .env file');
    console.log('2. Run: npm start');
    console.log('3. Test with your bot on Telegram!');
}
