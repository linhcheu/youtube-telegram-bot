#!/usr/bin/env node

/**
 * Setup script for YouTube Telegram Downloader Bot
 */

const fs = require('fs-extra');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, (answer) => {
            resolve(answer);
        });
    });
}

async function setup() {
    console.log('🤖 YouTube Telegram Downloader Bot Setup\n');

    // Check if .env already exists
    const envPath = path.join(__dirname, '..', '.env');
    if (await fs.pathExists(envPath)) {
        const overwrite = await question('.env file already exists. Overwrite? (y/N): ');
        if (overwrite.toLowerCase() !== 'y') {
            console.log('Setup cancelled.');
            rl.close();
            return;
        }
    }

    console.log('Please provide the following information:\n');

    // Get Telegram bot token
    let botToken = '';
    while (!botToken) {
        botToken = await question('Telegram Bot Token (from @BotFather): ');
        if (!botToken) {
            console.log('❌ Bot token is required!');
        }
    }

    // Get max file size
    const maxFileSize = await question('Max file size in MB (default: 50): ') || '50';

    // Get download directory
    const downloadDir = await question('Download directory (default: ./downloads): ') || './downloads';

    // Get debug mode
    const debug = await question('Enable debug mode? (y/N): ');

    // Create .env file
    const envContent = `# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=${botToken}
MAX_FILE_SIZE_MB=${maxFileSize}
DOWNLOAD_DIR=${downloadDir}
DEBUG=${debug.toLowerCase() === 'y' ? 'true' : 'false'}

# Optional: Custom FFmpeg path (if not using ffmpeg-static)
# FFMPEG_PATH=/path/to/ffmpeg

# Port for health check endpoint (optional)
PORT=3000
`;

    await fs.writeFile(envPath, envContent);

    // Create download directory
    await fs.ensureDir(downloadDir);

    console.log('\n✅ Setup completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   Bot Token: ${botToken.substring(0, 10)}...`);
    console.log(`   Max File Size: ${maxFileSize}MB`);
    console.log(`   Download Directory: ${downloadDir}`);
    console.log(`   Debug Mode: ${debug.toLowerCase() === 'y' ? 'Enabled' : 'Disabled'}`);

    console.log('\n🚀 Next steps:');
    console.log('   1. Run: npm install');
    console.log('   2. Start the bot: npm start');
    console.log('   3. Send a YouTube URL to your bot on Telegram!');

    rl.close();
}

// Handle Ctrl+C
rl.on('SIGINT', () => {
    console.log('\n\nSetup cancelled by user.');
    process.exit(0);
});

setup().catch(error => {
    console.error('❌ Setup failed:', error.message);
    rl.close();
    process.exit(1);
});
