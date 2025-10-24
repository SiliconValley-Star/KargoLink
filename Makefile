# CargoLink Docker Management Makefile
.PHONY: help dev prod build up down logs clean install test

# Default target
.DEFAULT_GOAL := help

# Colors for output
RED=\033[0;31m
GREEN=\033[0;32m
YELLOW=\033[1;33m
BLUE=\033[0;34m
NC=\033[0m # No Color

help: ## Show this help message
	@echo "$(BLUE)CargoLink Docker Management$(NC)"
	@echo "$(YELLOW)Usage: make [target]$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

# Development Commands
dev: ## Start development environment
	@echo "$(BLUE)Starting CargoLink development environment...$(NC)"
	docker-compose up -d --build

dev-logs: ## Show development logs
	@echo "$(BLUE)Showing development logs...$(NC)"
	docker-compose logs -f

dev-stop: ## Stop development environment
	@echo "$(YELLOW)Stopping development environment...$(NC)"
	docker-compose down

dev-restart: dev-stop dev ## Restart development environment

dev-tools: ## Start development with tools (pgAdmin, Redis Commander, etc.)
	@echo "$(BLUE)Starting development environment with tools...$(NC)"
	docker-compose --profile dev-tools up -d --build

# Production Commands
prod: ## Start production environment
	@echo "$(BLUE)Starting CargoLink production environment...$(NC)"
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

prod-logs: ## Show production logs
	@echo "$(BLUE)Showing production logs...$(NC)"
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

prod-stop: ## Stop production environment
	@echo "$(YELLOW)Stopping production environment...$(NC)"
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml down

# Build Commands
build: ## Build all Docker images
	@echo "$(BLUE)Building all Docker images...$(NC)"
	docker-compose build --no-cache

build-backend: ## Build backend Docker image
	@echo "$(BLUE)Building backend Docker image...$(NC)"
	docker-compose build --no-cache backend

build-admin: ## Build admin Docker image
	@echo "$(BLUE)Building admin Docker image...$(NC)"
	docker-compose build --no-cache admin

# Database Commands
db-migrate: ## Run database migrations
	@echo "$(BLUE)Running database migrations...$(NC)"
	docker-compose exec backend pnpm prisma migrate deploy

db-seed: ## Seed database with initial data
	@echo "$(BLUE)Seeding database...$(NC)"
	docker-compose exec backend pnpm run db:seed

db-reset: ## Reset database (WARNING: This will delete all data)
	@echo "$(RED)WARNING: This will delete all database data!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo ""; \
		echo "$(YELLOW)Resetting database...$(NC)"; \
		docker-compose exec backend pnpm prisma migrate reset --force; \
	else \
		echo ""; \
		echo "$(GREEN)Cancelled.$(NC)"; \
	fi

db-studio: ## Open Prisma Studio
	@echo "$(BLUE)Opening Prisma Studio...$(NC)"
	docker-compose exec backend pnpm prisma studio

# Container Management
up: ## Start all services
	@echo "$(BLUE)Starting all services...$(NC)"
	docker-compose up -d

down: ## Stop all services
	@echo "$(YELLOW)Stopping all services...$(NC)"
	docker-compose down

restart: down up ## Restart all services

logs: ## Show logs for all services
	@echo "$(BLUE)Showing logs...$(NC)"
	docker-compose logs -f

logs-backend: ## Show backend logs
	@echo "$(BLUE)Showing backend logs...$(NC)"
	docker-compose logs -f backend

logs-admin: ## Show admin logs
	@echo "$(BLUE)Showing admin logs...$(NC)"
	docker-compose logs -f admin

logs-postgres: ## Show PostgreSQL logs
	@echo "$(BLUE)Showing PostgreSQL logs...$(NC)"
	docker-compose logs -f postgres

logs-redis: ## Show Redis logs
	@echo "$(BLUE)Showing Redis logs...$(NC)"
	docker-compose logs -f redis

# Shell Access
shell-backend: ## Access backend container shell
	@echo "$(BLUE)Accessing backend container shell...$(NC)"
	docker-compose exec backend sh

shell-admin: ## Access admin container shell
	@echo "$(BLUE)Accessing admin container shell...$(NC)"
	docker-compose exec admin sh

shell-postgres: ## Access PostgreSQL shell
	@echo "$(BLUE)Accessing PostgreSQL shell...$(NC)"
	docker-compose exec postgres psql -U cargolink -d cargolink

shell-redis: ## Access Redis shell
	@echo "$(BLUE)Accessing Redis shell...$(NC)"
	docker-compose exec redis redis-cli

# Testing
test: ## Run all tests
	@echo "$(BLUE)Running all tests...$(NC)"
	docker-compose exec backend pnpm test

test-watch: ## Run tests in watch mode
	@echo "$(BLUE)Running tests in watch mode...$(NC)"
	docker-compose exec backend pnpm run test:watch

test-coverage: ## Run tests with coverage
	@echo "$(BLUE)Running tests with coverage...$(NC)"
	docker-compose exec backend pnpm run test:coverage

# Dependencies
install: ## Install dependencies in containers
	@echo "$(BLUE)Installing dependencies...$(NC)"
	docker-compose exec backend pnpm install
	docker-compose exec admin pnpm install

# Maintenance Commands
clean: ## Clean up Docker images and volumes
	@echo "$(YELLOW)Cleaning up Docker images and volumes...$(NC)"
	docker-compose down -v
	docker system prune -f
	docker volume prune -f

clean-all: ## Clean up everything (images, containers, volumes, networks)
	@echo "$(RED)WARNING: This will remove all Docker images, containers, volumes and networks!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo ""; \
		echo "$(YELLOW)Cleaning up everything...$(NC)"; \
		docker-compose down -v --rmi all; \
		docker system prune -af; \
		docker volume prune -f; \
		docker network prune -f; \
	else \
		echo ""; \
		echo "$(GREEN)Cancelled.$(NC)"; \
	fi

# Backup & Restore
backup-db: ## Backup PostgreSQL database
	@echo "$(BLUE)Backing up database...$(NC)"
	docker-compose exec postgres pg_dump -U cargolink cargolink > backups/cargolink_$(shell date +%Y%m%d_%H%M%S).sql

restore-db: ## Restore PostgreSQL database from backup (set BACKUP_FILE=path/to/backup.sql)
	@if [ -z "$(BACKUP_FILE)" ]; then \
		echo "$(RED)ERROR: Please specify BACKUP_FILE. Example: make restore-db BACKUP_FILE=backup.sql$(NC)"; \
		exit 1; \
	fi
	@echo "$(BLUE)Restoring database from $(BACKUP_FILE)...$(NC)"
	docker-compose exec -T postgres psql -U cargolink -d cargolink < $(BACKUP_FILE)

# Health Checks
health: ## Check health of all services
	@echo "$(BLUE)Checking health of all services...$(NC)"
	@docker-compose ps

status: ## Show status of all containers
	@echo "$(BLUE)Container Status:$(NC)"
	@docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

# Mobile App Build (for mobile team reference)
mobile-setup: ## Setup mobile development (requires Expo CLI)
	@echo "$(BLUE)Setting up mobile development...$(NC)"
	@echo "$(YELLOW)Note: Make sure you have Expo CLI installed: npm install -g @expo/cli$(NC)"
	cd packages/mobile && npm install

mobile-start: ## Start mobile development server
	@echo "$(BLUE)Starting mobile development server...$(NC)"
	cd packages/mobile && npx expo start

# Docker Image Management
pull: ## Pull latest images
	@echo "$(BLUE)Pulling latest Docker images...$(NC)"
	docker-compose pull

push: ## Push images to registry (requires proper registry configuration)
	@echo "$(BLUE)Pushing images to registry...$(NC)"
	docker-compose push

# Quick Start Commands
quick-start: ## Quick start for new developers
	@echo "$(GREEN)🚀 CargoLink Quick Start$(NC)"
	@echo "$(BLUE)1. Starting development environment...$(NC)"
	@make dev
	@echo "$(BLUE)2. Running database migrations...$(NC)"
	@make db-migrate
	@echo "$(BLUE)3. Seeding database...$(NC)"
	@make db-seed
	@echo "$(GREEN)✅ CargoLink is ready!$(NC)"
	@echo "$(YELLOW)🌐 Backend API: http://localhost:3001$(NC)"
	@echo "$(YELLOW)🔧 Admin Panel: http://localhost:3002$(NC)"
	@echo "$(YELLOW)📱 Mobile: cd packages/mobile && npx expo start$(NC)"

version: ## Show version information
	@echo "$(GREEN)CargoLink Version Information$(NC)"
	@echo "Docker: $$(docker --version)"
	@echo "Docker Compose: $$(docker-compose --version)"
	@echo "Node.js (in container): $$(docker-compose exec backend node --version 2>/dev/null || echo 'N/A - Container not running')"