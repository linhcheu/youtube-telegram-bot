# Railway-optimized Dockerfile for YouTube Telegram Bot
FROM node:20-alpine

# Set Railway environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Install system dependencies optimized for Railway
RUN apk add --no-cache \
    ffmpeg \
    python3 \
    py3-pip \
    make \
    g++ \
    git \
    curl \
    ca-certificates \
    tzdata \
    && pip3 install --break-system-packages --no-cache-dir yt-dlp \
    && yt-dlp --version \
    && npm install -g npm@latest

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies with specific Railway optimizations
RUN npm ci --omit=dev --no-audit --no-fund

# Copy application code
COPY src/ ./src/
COPY .env.example ./.env.example

# Create necessary directories
RUN mkdir -p downloads logs \
    && chmod 755 downloads logs

# Expose port (Railway will use this)
EXPOSE 3000

# Start command
CMD ["npm", "start"]
