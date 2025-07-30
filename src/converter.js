const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const fs = require('fs-extra');
const path = require('path');
const { sanitizeFilename } = require('./utils');

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic);

/**
 * Convert video file to MP3
 */
async function convertToMp3(inputPath, outputDir, title) {
    return new Promise(async (resolve, reject) => {
        try {
            const filename = sanitizeFilename(title) + '.mp3';
            const outputPath = path.join(outputDir, filename);

            // Ensure output directory exists
            await fs.ensureDir(outputDir);

            console.log(`🔄 Converting: ${path.basename(inputPath)} -> ${filename}`);

            ffmpeg(inputPath)
                .audioCodec('libmp3lame')
                .audioBitrate(320)
                .audioChannels(2)
                .audioFrequency(44100)
                .format('mp3')
                .on('start', (commandLine) => {
                    console.log('FFmpeg command:', commandLine);
                })
                .on('progress', (progress) => {
                    if (progress.percent) {
                        console.log(`Conversion progress: ${Math.floor(progress.percent)}%`);
                    }
                })
                .on('error', (error) => {
                    console.error('Conversion error:', error);
                    fs.remove(outputPath).catch(() => {});
                    reject(new Error(`Conversion failed: ${error.message}`));
                })
                .on('end', () => {
                    console.log(`✅ Conversion completed: ${filename}`);
                    resolve(outputPath);
                })
                .save(outputPath);

        } catch (error) {
            console.error('Conversion setup error:', error);
            reject(new Error(`Conversion setup failed: ${error.message}`));
        }
    });
}

/**
 * Convert video file to specific format
 */
async function convertVideo(inputPath, outputDir, title, targetFormat, options = {}) {
    return new Promise(async (resolve, reject) => {
        try {
            const filename = sanitizeFilename(title) + '.' + targetFormat;
            const outputPath = path.join(outputDir, filename);

            await fs.ensureDir(outputDir);

            console.log(`🔄 Converting: ${path.basename(inputPath)} -> ${filename}`);

            let ffmpegCommand = ffmpeg(inputPath);

            // Apply format-specific settings
            switch (targetFormat.toLowerCase()) {
                case 'mp4':
                    ffmpegCommand = ffmpegCommand
                        .videoCodec('libx264')
                        .audioCodec('aac')
                        .format('mp4');
                    break;
                case 'avi':
                    ffmpegCommand = ffmpegCommand
                        .videoCodec('libx264')
                        .audioCodec('libmp3lame')
                        .format('avi');
                    break;
                case 'mkv':
                    ffmpegCommand = ffmpegCommand
                        .videoCodec('libx264')
                        .audioCodec('aac')
                        .format('matroska');
                    break;
                case 'webm':
                    ffmpegCommand = ffmpegCommand
                        .videoCodec('libvpx')
                        .audioCodec('libvorbis')
                        .format('webm');
                    break;
                default:
                    ffmpegCommand = ffmpegCommand.format(targetFormat);
            }

            // Apply custom options
            if (options.videoBitrate) {
                ffmpegCommand = ffmpegCommand.videoBitrate(options.videoBitrate);
            }
            if (options.audioBitrate) {
                ffmpegCommand = ffmpegCommand.audioBitrate(options.audioBitrate);
            }
            if (options.size) {
                ffmpegCommand = ffmpegCommand.size(options.size);
            }

            ffmpegCommand
                .on('start', (commandLine) => {
                    console.log('FFmpeg command:', commandLine);
                })
                .on('progress', (progress) => {
                    if (progress.percent) {
                        console.log(`Conversion progress: ${Math.floor(progress.percent)}%`);
                    }
                })
                .on('error', (error) => {
                    console.error('Conversion error:', error);
                    fs.remove(outputPath).catch(() => {});
                    reject(new Error(`Conversion failed: ${error.message}`));
                })
                .on('end', () => {
                    console.log(`✅ Conversion completed: ${filename}`);
                    resolve(outputPath);
                })
                .save(outputPath);

        } catch (error) {
            console.error('Conversion setup error:', error);
            reject(new Error(`Conversion setup failed: ${error.message}`));
        }
    });
}

/**
 * Extract audio from video in various formats
 */
async function extractAudio(inputPath, outputDir, title, audioFormat = 'mp3', options = {}) {
    return new Promise(async (resolve, reject) => {
        try {
            const filename = sanitizeFilename(title) + '.' + audioFormat;
            const outputPath = path.join(outputDir, filename);

            await fs.ensureDir(outputDir);

            console.log(`🔄 Extracting audio: ${path.basename(inputPath)} -> ${filename}`);

            let ffmpegCommand = ffmpeg(inputPath);

            // Apply format-specific settings
            switch (audioFormat.toLowerCase()) {
                case 'mp3':
                    ffmpegCommand = ffmpegCommand
                        .audioCodec('libmp3lame')
                        .audioBitrate(options.bitrate || 320)
                        .audioChannels(2)
                        .audioFrequency(44100);
                    break;
                case 'wav':
                    ffmpegCommand = ffmpegCommand
                        .audioCodec('pcm_s16le')
                        .audioChannels(2)
                        .audioFrequency(44100);
                    break;
                case 'flac':
                    ffmpegCommand = ffmpegCommand
                        .audioCodec('flac')
                        .audioChannels(2)
                        .audioFrequency(44100);
                    break;
                case 'aac':
                    ffmpegCommand = ffmpegCommand
                        .audioCodec('aac')
                        .audioBitrate(options.bitrate || 256)
                        .audioChannels(2)
                        .audioFrequency(44100);
                    break;
                case 'ogg':
                    ffmpegCommand = ffmpegCommand
                        .audioCodec('libvorbis')
                        .audioBitrate(options.bitrate || 256)
                        .audioChannels(2)
                        .audioFrequency(44100);
                    break;
                default:
                    ffmpegCommand = ffmpegCommand.audioCodec('libmp3lame');
            }

            ffmpegCommand
                .noVideo()
                .format(audioFormat)
                .on('start', (commandLine) => {
                    console.log('FFmpeg command:', commandLine);
                })
                .on('progress', (progress) => {
                    if (progress.percent) {
                        console.log(`Audio extraction progress: ${Math.floor(progress.percent)}%`);
                    }
                })
                .on('error', (error) => {
                    console.error('Audio extraction error:', error);
                    fs.remove(outputPath).catch(() => {});
                    reject(new Error(`Audio extraction failed: ${error.message}`));
                })
                .on('end', () => {
                    console.log(`✅ Audio extraction completed: ${filename}`);
                    resolve(outputPath);
                })
                .save(outputPath);

        } catch (error) {
            console.error('Audio extraction setup error:', error);
            reject(new Error(`Audio extraction setup failed: ${error.message}`));
        }
    });
}

/**
 * Compress video to reduce file size
 */
async function compressVideo(inputPath, outputDir, title, targetSizeMB) {
    return new Promise(async (resolve, reject) => {
        try {
            const filename = sanitizeFilename(title) + '_compressed.mp4';
            const outputPath = path.join(outputDir, filename);

            await fs.ensureDir(outputDir);

            // Get video info first
            ffmpeg.ffprobe(inputPath, (err, metadata) => {
                if (err) {
                    reject(new Error(`Failed to get video info: ${err.message}`));
                    return;
                }

                const duration = metadata.format.duration;
                const targetSizeBytes = targetSizeMB * 1024 * 1024;
                const targetBitrate = Math.floor((targetSizeBytes * 8) / duration / 1000); // kbps

                console.log(`🗜️ Compressing video to ~${targetSizeMB}MB (${targetBitrate}kbps)`);

                ffmpeg(inputPath)
                    .videoCodec('libx264')
                    .audioCodec('aac')
                    .videoBitrate(targetBitrate)
                    .audioBitrate(128)
                    .format('mp4')
                    .addOptions(['-preset', 'medium', '-crf', '28'])
                    .on('start', (commandLine) => {
                        console.log('FFmpeg command:', commandLine);
                    })
                    .on('progress', (progress) => {
                        if (progress.percent) {
                            console.log(`Compression progress: ${Math.floor(progress.percent)}%`);
                        }
                    })
                    .on('error', (error) => {
                        console.error('Compression error:', error);
                        fs.remove(outputPath).catch(() => {});
                        reject(new Error(`Compression failed: ${error.message}`));
                    })
                    .on('end', () => {
                        console.log(`✅ Compression completed: ${filename}`);
                        resolve(outputPath);
                    })
                    .save(outputPath);
            });

        } catch (error) {
            console.error('Compression setup error:', error);
            reject(new Error(`Compression setup failed: ${error.message}`));
        }
    });
}

/**
 * Get media file information
 */
async function getMediaInfo(filePath) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) {
                reject(new Error(`Failed to get media info: ${err.message}`));
                return;
            }

            const videoStream = metadata.streams.find(s => s.codec_type === 'video');
            const audioStream = metadata.streams.find(s => s.codec_type === 'audio');

            resolve({
                format: metadata.format,
                duration: metadata.format.duration,
                size: metadata.format.size,
                bitrate: metadata.format.bit_rate,
                video: videoStream ? {
                    codec: videoStream.codec_name,
                    width: videoStream.width,
                    height: videoStream.height,
                    fps: eval(videoStream.r_frame_rate)
                } : null,
                audio: audioStream ? {
                    codec: audioStream.codec_name,
                    bitrate: audioStream.bit_rate,
                    sampleRate: audioStream.sample_rate,
                    channels: audioStream.channels
                } : null
            });
        });
    });
}

module.exports = {
    convertToMp3,
    convertVideo,
    extractAudio,
    compressVideo,
    getMediaInfo
};
