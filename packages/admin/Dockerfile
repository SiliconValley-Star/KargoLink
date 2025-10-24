# Multi-stage build for production optimization
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package*.json pnpm-lock.yaml* ./
COPY packages/admin/package.json ./packages/admin/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Development stage
FROM base AS development
WORKDIR /app

# Copy source code
COPY . .

# Expose port
EXPOSE 3002

# Start development server
CMD ["pnpm", "run", "dev:admin"]

# Build stage
FROM base AS builder
WORKDIR /app

# Copy source code
COPY . .

# Set production build environment variables
ARG VITE_API_URL=http://localhost:3001
ARG VITE_APP_NAME="CargoLink Admin"
ARG VITE_APP_VERSION=1.0.0

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_APP_VERSION=$VITE_APP_VERSION

# Build the application
RUN pnpm run build:admin

# Production stage with Nginx
FROM nginx:alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Create non-root user
RUN addgroup --system --gid 1001 admin
RUN adduser --system --uid 1001 admin

# Copy built application to Nginx html directory
COPY --from=builder /app/packages/admin/dist /usr/share/nginx/html

# Copy Nginx configuration
COPY docker/admin/nginx.conf /etc/nginx/nginx.conf
COPY docker/admin/default.conf /etc/nginx/conf.d/default.conf

# Copy custom error pages
COPY docker/admin/error-pages/ /usr/share/nginx/html/error-pages/

# Set proper permissions
RUN chown -R admin:admin /usr/share/nginx/html
RUN chown -R admin:admin /var/cache/nginx
RUN chown -R admin:admin /var/log/nginx
RUN chown -R admin:admin /etc/nginx/conf.d
RUN touch /var/run/nginx.pid
RUN chown admin:admin /var/run/nginx.pid

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost || exit 1

# Expose port
EXPOSE 80

# Switch to non-root user
USER admin

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]