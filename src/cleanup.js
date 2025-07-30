const { cleanupOldFiles, logWithTimestamp } = require('./utils');
const fs = require('fs-extra');

class CleanupManager {
    constructor(downloadDir, cleanupIntervalHours = 1, maxFileAgeHours = 24) {
        this.downloadDir = downloadDir;
        this.cleanupIntervalHours = cleanupIntervalHours;
        this.maxFileAgeHours = maxFileAgeHours;
        this.cleanupInterval = null;
    }

    start() {
        logWithTimestamp(`Starting cleanup manager - checking every ${this.cleanupIntervalHours}h, removing files older than ${this.maxFileAgeHours}h`);
        
        // Run cleanup immediately
        this.runCleanup();
        
        // Schedule periodic cleanup
        this.cleanupInterval = setInterval(() => {
            this.runCleanup();
        }, this.cleanupIntervalHours * 60 * 60 * 1000);
    }

    stop() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
            logWithTimestamp('Cleanup manager stopped');
        }
    }

    async runCleanup() {
        try {
            logWithTimestamp('Running scheduled cleanup...');
            await fs.ensureDir(this.downloadDir);
            await cleanupOldFiles(this.downloadDir, this.maxFileAgeHours);
            logWithTimestamp('Cleanup completed');
        } catch (error) {
            logWithTimestamp(`Cleanup error: ${error.message}`, 'ERROR');
        }
    }
}

module.exports = CleanupManager;
