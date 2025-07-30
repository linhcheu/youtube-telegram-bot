// Quick test to verify callback data length
const testUrl = 'https://youtu.be/rvY9huGLGvY?list=RDrvY9huGLGvY';
const urlHash = Buffer.from(testUrl).toString('base64').substring(0, 20);

console.log('Original URL:', testUrl);
console.log('URL length:', testUrl.length);
console.log('Full base64:', Buffer.from(testUrl).toString('base64'));
console.log('Full base64 length:', Buffer.from(testUrl).toString('base64').length);
console.log('Short hash:', urlHash);
console.log('Short hash length:', urlHash.length);

const callbackData1 = `mp4_${urlHash}`;
const callbackData2 = `mp3_${urlHash}`;

console.log('MP4 callback data:', callbackData1);
console.log('MP4 callback length:', callbackData1.length);
console.log('MP3 callback data:', callbackData2);
console.log('MP3 callback length:', callbackData2.length);

console.log('✅ Both callback data lengths are under 64 bytes:', 
    callbackData1.length < 64 && callbackData2.length < 64 ? 'YES' : 'NO');
