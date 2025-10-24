#!/bin/bash

# =====================================================
# CARGOLINK PRODUCTION DEPLOYMENT SCRIPT
# =====================================================

set -euo pipefail

# Configuration
PROJECT_NAME="cargolink"
COMPOSE_FILES="-f docker-compose.yml -f docker-compose.website.yml"
BACKUP_DIR="/var/backups/cargolink"
LOG_DIR="/var/log/cargolink"
DOCKER_REGISTRY="ghcr.io/cargolink"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

log_deploy() {
    echo -e "${CYAN}[DEPLOY]${NC} $1"
}

# Function to check prerequisites
check_prerequisites() {
    log_step "Checking prerequisites..."
    
    # Check if Docker is running
    if ! docker info &> /dev/null; then
        log_error "Docker is not running or not accessible"
        exit 1
    fi
    
    # Check if Docker Compose is available
    if ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not available"
        exit 1
    fi
    
    # Check if required environment files exist
    if [ ! -f .env.production ]; then
        log_error "Production environment file (.env.production) not found"
        exit 1
    fi
    
    # Create directories if they don't exist
    mkdir -p "$BACKUP_DIR" "$LOG_DIR"
    
    log_success "Prerequisites checked successfully"
}

# Function to backup current deployment
backup_current_deployment() {
    log_step "Creating backup of current deployment..."
    
    local backup_timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_path="$BACKUP_DIR/cargolink_backup_$backup_timestamp"
    
    mkdir -p "$backup_path"
    
    # Backup database if running
    if docker compose $COMPOSE_FILES ps postgres | grep -q "Up"; then
        log_info "Backing up PostgreSQL database..."
        docker compose $COMPOSE_FILES exec -T postgres pg_dumpall -U postgres > "$backup_path/database_backup.sql"
    fi
    
    # Backup uploaded files
    if [ -d "./uploads" ]; then
        log_info "Backing up uploaded files..."
        cp -r ./uploads "$backup_path/"
    fi
    
    # Backup current configuration
    cp -r ./docker "$backup_path/" 2>/dev/null || true
    cp .env.production "$backup_path/" 2>/dev/null || true
    
    log_success "Backup created at $backup_path"
    echo "$backup_path" > /tmp/cargolink_backup_path
}

# Function to pull latest images
pull_latest_images() {
    log_step "Pulling latest Docker images..."
    
    # Pull from registry if specified
    if [ "${USE_REGISTRY:-false}" == "true" ]; then
        log_info "Pulling from Docker registry..."
        docker pull "$DOCKER_REGISTRY/cargolink-backend:latest"
        docker pull "$DOCKER_REGISTRY/cargolink-website:latest"
        docker pull "$DOCKER_REGISTRY/cargolink-admin:latest"
    else
        log_info "Building images locally..."
        docker compose $COMPOSE_FILES build --no-cache
    fi
    
    log_success "Images updated successfully"
}

# Function to run database migrations
run_migrations() {
    log_step "Running database migrations..."
    
    # Start only database services for migration
    docker compose $COMPOSE_FILES up -d postgres redis
    
    # Wait for database to be ready
    log_info "Waiting for database to be ready..."
    sleep 10
    
    # Run migrations
    docker compose $COMPOSE_FILES run --rm backend npm run migrate:prod
    
    if [ $? -eq 0 ]; then
        log_success "Database migrations completed successfully"
    else
        log_error "Database migrations failed"
        return 1
    fi
}

# Function to deploy services
deploy_services() {
    log_step "Deploying CargoLink services..."
    
    # Deploy in stages to ensure smooth transition
    local services=("postgres" "redis" "backend" "website" "admin" "nginx" "prometheus" "grafana")
    
    for service in "${services[@]}"; do
        log_deploy "Deploying $service..."
        
        docker compose $COMPOSE_FILES up -d "$service"
        
        # Wait a moment between services
        sleep 5
        
        # Check if service is healthy
        if check_service_health "$service"; then
            log_success "$service deployed successfully"
        else
            log_warning "$service may not be fully ready yet"
        fi
    done
    
    log_success "All services deployed"
}

# Function to check service health
check_service_health() {
    local service=$1
    local max_attempts=6
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker compose $COMPOSE_FILES ps "$service" | grep -q "Up"; then
            return 0
        fi
        
        log_info "Waiting for $service to start (attempt $attempt/$max_attempts)..."
        sleep 10
        ((attempt++))
    done
    
    return 1
}

# Function to run health checks
run_health_checks() {
    log_step "Running health checks..."
    
    local health_endpoints=(
        "http://localhost:3001/health"
        "http://localhost:3000/api/health"
        "http://localhost:3002/health"
    )
    
    for endpoint in "${health_endpoints[@]}"; do
        log_info "Checking $endpoint..."
        
        if curl -f -s "$endpoint" > /dev/null; then
            log_success "✓ $endpoint is healthy"
        else
            log_warning "⚠ $endpoint may not be ready"
        fi
    done
}

# Function to run smoke tests
run_smoke_tests() {
    log_step "Running smoke tests..."
    
    # Test database connectivity
    if docker compose $COMPOSE_FILES exec -T postgres psql -U postgres -c "SELECT 1;" > /dev/null; then
        log_success "✓ Database connectivity test passed"
    else
        log_error "✗ Database connectivity test failed"
        return 1
    fi
    
    # Test Redis connectivity
    if docker compose $COMPOSE_FILES exec -T redis redis-cli ping | grep -q "PONG"; then
        log_success "✓ Redis connectivity test passed"
    else
        log_error "✗ Redis connectivity test failed"
        return 1
    fi
    
    # Test API endpoints
    local test_results=0
    
    # Test backend API
    if curl -f -s "http://localhost:3001/api/v1/health" > /dev/null; then
        log_success "✓ Backend API test passed"
    else
        log_error "✗ Backend API test failed"
        ((test_results++))
    fi
    
    # Test website
    if curl -f -s "http://localhost:3000/" > /dev/null; then
        log_success "✓ Website test passed"
    else
        log_error "✗ Website test failed"
        ((test_results++))
    fi
    
    if [ $test_results -eq 0 ]; then
        log_success "All smoke tests passed"
        return 0
    else
        log_error "$test_results smoke tests failed"
        return 1
    fi
}

# Function to cleanup old images and containers
cleanup_old_resources() {
    log_step "Cleaning up old Docker resources..."
    
    # Remove old images (keep last 3 versions)
    docker image prune -f
    
    # Remove unused volumes (be careful with this in production)
    if [ "${CLEANUP_VOLUMES:-false}" == "true" ]; then
        docker volume prune -f
    fi
    
    # Remove unused networks
    docker network prune -f
    
    log_success "Cleanup completed"
}

# Function to setup monitoring alerts
setup_monitoring() {
    log_step "Configuring monitoring and alerts..."
    
    # Wait for Prometheus to be ready
    sleep 30
    
    # Check if Prometheus is accessible
    if curl -f -s "http://localhost:9090/-/healthy" > /dev/null; then
        log_success "✓ Prometheus is healthy"
    else
        log_warning "⚠ Prometheus may not be ready"
    fi
    
    # Check if Grafana is accessible
    if curl -f -s "http://localhost:3000/api/health" > /dev/null; then
        log_success "✓ Grafana is healthy"
    else
        log_warning "⚠ Grafana may not be ready"
    fi
    
    log_success "Monitoring setup completed"
}

# Function to rollback deployment
rollback_deployment() {
    log_error "Rolling back deployment..."
    
    if [ -f /tmp/cargolink_backup_path ]; then
        local backup_path=$(cat /tmp/cargolink_backup_path)
        log_info "Restoring from backup: $backup_path"
        
        # Stop current services
        docker compose $COMPOSE_FILES down
        
        # Restore database if backup exists
        if [ -f "$backup_path/database_backup.sql" ]; then
            log_info "Restoring database..."
            docker compose $COMPOSE_FILES up -d postgres
            sleep 10
            cat "$backup_path/database_backup.sql" | docker compose $COMPOSE_FILES exec -T postgres psql -U postgres
        fi
        
        # Restore uploaded files
        if [ -d "$backup_path/uploads" ]; then
            log_info "Restoring uploaded files..."
            rm -rf ./uploads
            cp -r "$backup_path/uploads" ./
        fi
        
        # Start services with previous configuration
        docker compose $COMPOSE_FILES up -d
        
        log_success "Rollback completed"
    else
        log_error "No backup path found for rollback"
        exit 1
    fi
}

# Function to show deployment status
show_deployment_status() {
    log_info "=== CARGOLINK DEPLOYMENT STATUS ==="
    echo
    
    # Show running containers
    log_info "Running containers:"
    docker compose $COMPOSE_FILES ps
    echo
    
    # Show service URLs
    log_info "Service URLs:"
    echo "🌐 Website:     http://localhost:3000"
    echo "🔧 Admin:       http://localhost:3002"
    echo "🚀 API:         http://localhost:3001"
    echo "📊 Grafana:     http://localhost:3000 (Grafana port)"
    echo "📈 Prometheus:  http://localhost:9090"
    echo
    
    # Show logs command
    log_info "To view logs: docker compose $COMPOSE_FILES logs -f [service]"
    log_info "To stop all:  docker compose $COMPOSE_FILES down"
    echo
}

# Main deployment function
main() {
    local deployment_start_time=$(date +%s)
    
    log_info "🚀 Starting CargoLink Production Deployment"
    echo "==================================================="
    
    # Parse command line arguments
    case "${1:-deploy}" in
        "deploy")
            log_deploy "Starting full deployment..."
            
            # Run deployment steps
            check_prerequisites
            backup_current_deployment
            pull_latest_images
            run_migrations
            deploy_services
            run_health_checks
            
            # Wait for services to stabilize
            log_info "Waiting for services to stabilize..."
            sleep 30
            
            # Run smoke tests
            if run_smoke_tests; then
                setup_monitoring
                cleanup_old_resources
                
                local deployment_end_time=$(date +%s)
                local deployment_duration=$((deployment_end_time - deployment_start_time))
                
                log_success "🎉 Deployment completed successfully in ${deployment_duration}s"
                show_deployment_status
            else
                log_error "Smoke tests failed. Consider rollback."
                exit 1
            fi
            ;;
            
        "rollback")
            rollback_deployment
            ;;
            
        "status")
            show_deployment_status
            ;;
            
        "health")
            run_health_checks
            run_smoke_tests
            ;;
            
        *)
            log_error "Usage: $0 [deploy|rollback|status|health]"
            log_info "  deploy:   Full production deployment"
            log_info "  rollback: Rollback to previous version"
            log_info "  status:   Show current deployment status"
            log_info "  health:   Run health checks and smoke tests"
            exit 1
            ;;
    esac
}

# Trap errors and provide rollback option
trap 'log_error "Deployment failed! Consider running: $0 rollback"' ERR

# Run main function with all arguments
main "$@"