const { getVideoInfo } = require('./src/downloader');

// Test with publicly accessible videos
const testUrls = [
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Rick Roll - always accessible
    'https://www.youtube.com/watch?v=9bZkp7q19f0', // PSY - Gangnam Style
    'https://www.youtube.com/watch?v=kJQP7kiw5Fk'  // Luis Fonsi - Despacito
];

async function testDownloader() {
    console.log('🧪 Testing YouTube downloader with known working videos...\n');
    
    for (let i = 0; i < testUrls.length; i++) {
        const url = testUrls[i];
        console.log(`📹 Testing video ${i + 1}: ${url}`);
        
        try {
            const info = await getVideoInfo(url);
            
            if (info) {
                console.log(`✅ SUCCESS! Method: ${info.method}`);
                console.log(`   Title: ${info.title}`);
                console.log(`   Author: ${info.author.name}`);
                console.log(`   Duration: ${Math.floor(info.lengthSeconds / 60)}:${(info.lengthSeconds % 60).toString().padStart(2, '0')}`);
                console.log('');
                break; // If one works, the system is functional
            } else {
                console.log('❌ Failed to get info');
                console.log('');
            }
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
            console.log('');
        }
    }
}

testDownloader();
