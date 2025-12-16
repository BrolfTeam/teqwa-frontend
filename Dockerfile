# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set environment variables
ENV NODE_ENV=development \
    NPM_CONFIG_LOGLEVEL=warn \
    NPM_CONFIG_COLOR=false

# Install system dependencies for better compatibility
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++

# Create non-root user for security (do this early)
RUN addgroup -g 1001 -S nodejs \
    && adduser -S nextjs -u 1001

# Set work directory and change ownership
WORKDIR /app
RUN chown nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Copy package files first for better Docker layer caching
COPY --chown=nextjs:nodejs package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy project files (node_modules excluded via .dockerignore)
COPY --chown=nextjs:nodejs . .

# Expose port
EXPOSE 5173

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5173 || exit 1

# Start development server with host binding for Docker
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]