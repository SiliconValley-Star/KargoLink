# Multi-stage build for production optimization
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies needed for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    sqlite \
    libc6-compat

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package*.json pnpm-lock.yaml* ./
COPY packages/backend/package.json ./packages/backend/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Development stage
FROM base AS development
WORKDIR /app

# Copy source code
COPY . .

# Generate Prisma client
RUN cd packages/backend && pnpm prisma generate

# Expose port
EXPOSE 3001

# Start development server
CMD ["pnpm", "run", "dev:backend"]

# Build stage
FROM base AS builder
WORKDIR /app

# Copy source code
COPY . .

# Generate Prisma client
RUN cd packages/backend && pnpm prisma generate

# Build the application
RUN pnpm run build:backend

# Production stage
FROM node:18-alpine AS production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 backend

# Install production dependencies
RUN apk add --no-cache \
    postgresql-client \
    redis \
    libc6-compat

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/packages/backend/package.json ./packages/backend/
COPY --from=builder /app/packages/shared/package.json ./packages/shared/

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built application
COPY --from=builder --chown=backend:nodejs /app/packages/backend/dist ./packages/backend/dist
COPY --from=builder --chown=backend:nodejs /app/packages/backend/prisma ./packages/backend/prisma
COPY --from=builder --chown=backend:nodejs /app/packages/shared/dist ./packages/shared/dist

# Copy environment and startup files
COPY --from=builder --chown=backend:nodejs /app/packages/backend/.env.example ./packages/backend/.env
COPY --chown=backend:nodejs docker/backend/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Switch to non-root user
USER backend

# Set working directory to backend
WORKDIR /app/packages/backend

# Generate Prisma client for production
RUN pnpm prisma generate

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Expose port
EXPOSE 3001

# Set environment
ENV NODE_ENV=production
ENV PORT=3001

# Start the application
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "dist/index.js"]