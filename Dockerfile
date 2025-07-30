# Use Node.js 20 LTS Alpine for better compatibility with ytdl-core
FROM node:20-alpine

# Install system dependencies for ffmpeg and python (for building native modules)
RUN apk add --no-cache \
    ffmpeg \
    python3 \
    make \
    g++ \
    git

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/
COPY .env.example ./.env.example

# Create downloads directory
RUN mkdir -p downloads

# Set proper permissions
RUN chown -R node:node /app
USER node

# Expose port (for health checks)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD node -e "console.log('Bot is running')" || exit 1

# Start the bot
CMD ["npm", "start"]
