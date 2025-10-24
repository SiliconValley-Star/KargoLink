#!/bin/bash
set -e

echo "🚀 Starting CargoLink Backend..."

# Function to wait for database
wait_for_db() {
    echo "⏳ Waiting for PostgreSQL database..."
    while ! pg_isready -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "$DB_USER" 2>/dev/null; do
        echo "Database is unavailable - sleeping"
        sleep 2
    done
    echo "✅ PostgreSQL database is ready!"
}

# Function to wait for Redis
wait_for_redis() {
    if [ -n "$REDIS_HOST" ]; then
        echo "⏳ Waiting for Redis..."
        while ! redis-cli -h "$REDIS_HOST" -p "${REDIS_PORT:-6379}" ping 2>/dev/null | grep -q PONG; do
            echo "Redis is unavailable - sleeping"
            sleep 2
        done
        echo "✅ Redis is ready!"
    fi
}

# Function to run database migrations
run_migrations() {
    echo "🔄 Running database migrations..."
    if pnpm prisma migrate deploy; then
        echo "✅ Database migrations completed successfully"
    else
        echo "❌ Database migrations failed"
        exit 1
    fi
}

# Function to generate Prisma client
generate_prisma() {
    echo "🔧 Generating Prisma client..."
    if pnpm prisma generate; then
        echo "✅ Prisma client generated successfully"
    else
        echo "❌ Prisma client generation failed"
        exit 1
    fi
}

# Function to seed database (optional)
seed_database() {
    if [ "$ENABLE_SEEDING" = "true" ] && [ "$NODE_ENV" != "production" ]; then
        echo "🌱 Seeding database with initial data..."
        if pnpm run db:seed; then
            echo "✅ Database seeding completed"
        else
            echo "⚠️  Database seeding failed (non-critical)"
        fi
    fi
}

# Function to validate environment variables
validate_env() {
    echo "🔍 Validating environment variables..."
    
    # Required variables
    local required_vars=(
        "DATABASE_URL"
        "JWT_SECRET"
        "NODE_ENV"
    )
    
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        echo "❌ Missing required environment variables:"
        printf '%s\n' "${missing_vars[@]}"
        exit 1
    fi
    
    echo "✅ Environment variables validated"
}

# Parse DATABASE_URL to extract connection details
parse_database_url() {
    if [ -n "$DATABASE_URL" ]; then
        # Extract database connection details from DATABASE_URL
        # Format: postgresql://user:password@host:port/database
        DB_USER=$(echo "$DATABASE_URL" | sed -n 's|postgresql://\([^:]*\):.*|\1|p')
        DB_HOST=$(echo "$DATABASE_URL" | sed -n 's|postgresql://[^@]*@\([^:]*\):.*|\1|p')
        DB_PORT=$(echo "$DATABASE_URL" | sed -n 's|postgresql://[^@]*@[^:]*:\([0-9]*\)/.*|\1|p')
        
        export DB_USER DB_HOST DB_PORT
    fi
}

# Main startup sequence
main() {
    echo "🐳 CargoLink Backend Container Starting..."
    echo "Environment: $NODE_ENV"
    echo "Port: ${PORT:-3001}"
    
    # Validate environment
    validate_env
    
    # Parse database URL
    parse_database_url
    
    # Wait for dependencies
    wait_for_db
    wait_for_redis
    
    # Setup database
    generate_prisma
    run_migrations
    seed_database
    
    echo "🎉 Initialization complete! Starting application..."
    
    # Execute the main command
    exec "$@"
}

# Run main function
main "$@"