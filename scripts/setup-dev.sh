#!/bin/bash

# CargoLink MVP - Development Environment Setup Script

set -e

echo "🚀 Setting up CargoLink development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command_exists node; then
    print_error "Node.js is required but not installed."
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"
if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    print_error "Node.js version $NODE_VERSION is too old. Required: $REQUIRED_VERSION+"
    exit 1
fi
print_status "Node.js $(node --version) is installed"

if ! command_exists npm; then
    print_error "npm is required but not installed."
    exit 1
fi
print_status "npm $(npm --version) is installed"

if ! command_exists docker; then
    print_error "Docker is required but not installed."
    echo "Please install Docker from https://docs.docker.com/get-docker/"
    exit 1
fi
print_status "Docker $(docker --version | cut -d' ' -f3 | cut -d',' -f1) is installed"

if ! command_exists docker-compose; then
    print_error "Docker Compose is required but not installed."
    exit 1
fi
print_status "Docker Compose $(docker-compose --version | cut -d' ' -f4 | cut -d',' -f1) is installed"

# Create necessary directories
echo ""
echo "📁 Creating project directories..."

directories=(
    "backend/src/controllers"
    "backend/src/services" 
    "backend/src/routes"
    "backend/src/middleware"
    "backend/src/models"
    "backend/src/utils"
    "backend/src/config"
    "backend/src/types"
    "backend/src/integrations/carriers"
    "backend/src/integrations/payments" 
    "backend/src/integrations/notifications"
    "backend/src/jobs"
    "backend/src/websocket"
    "backend/prisma"
    "backend/tests/unit"
    "backend/tests/integration"
    "backend/tests/e2e"
    "mobile/src/components/common"
    "mobile/src/components/forms"
    "mobile/src/screens/auth"
    "mobile/src/screens/main"
    "mobile/src/screens/shipment"
    "mobile/src/navigation"
    "mobile/src/store/slices"
    "mobile/src/services/api"
    "mobile/src/hooks"
    "mobile/src/utils"
    "mobile/src/types"
    "mobile/src/assets/images"
    "mobile/src/assets/icons"
    "mobile/src/styles"
    "mobile/__tests__"
    "admin/src/components"
    "admin/src/pages"
    "admin/src/services"
    "admin/src/utils"
    "admin/src/types"
    "admin/src/styles"
    "admin/public"
    "docs"
    "k8s"
    ".github/workflows"
)

for dir in "${directories[@]}"; do
    mkdir -p "$dir"
done
print_status "Project directories created"

# Install root dependencies
echo ""
echo "📦 Installing root dependencies..."
npm install
print_status "Root dependencies installed"

# Setup environment files
echo ""
echo "🔧 Setting up environment files..."

# Backend .env
if [ ! -f "backend/.env" ]; then
    cat > backend/.env << 'EOF'
# Database
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/cargolink_dev"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT Secrets
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-jwt-key-change-in-production"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV=development

# External APIs
# Yurtiçi Kargo
YURTICI_API_URL="https://api.yurticikargo.com"
YURTICI_API_KEY="your-yurtici-api-key"

# Aras Kargo  
ARAS_API_URL="https://api.araskargo.com.tr"
ARAS_API_KEY="your-aras-api-key"

# Payment Gateways
IYZICO_API_KEY="your-iyzico-api-key"
IYZICO_SECRET_KEY="your-iyzico-secret-key"
IYZICO_BASE_URL="https://sandbox-api.iyzipay.com"

# AWS
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="eu-west-1"
AWS_S3_BUCKET_NAME="cargolink-dev-files"

# Notifications
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"
TWILIO_PHONE_NUMBER="+1234567890"

SENDGRID_API_KEY="your-sendgrid-api-key"
SENDGRID_FROM_EMAIL="noreply@cargolink.com"

# Firebase
FIREBASE_PROJECT_ID="cargolink-dev"
FIREBASE_PRIVATE_KEY="your-firebase-private-key"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk@cargolink-dev.iam.gserviceaccount.com"
EOF
    print_status "Backend .env file created"
else
    print_info "Backend .env file already exists"
fi

# Mobile .env
if [ ! -f "mobile/.env" ]; then
    cat > mobile/.env << 'EOF'
API_URL=http://localhost:3000/api/v1
WS_URL=ws://localhost:3000
ENV=development
EOF
    print_status "Mobile .env file created"
else
    print_info "Mobile .env file already exists"
fi

# Admin .env
if [ ! -f "admin/.env" ]; then
    cat > admin/.env << 'EOF'
REACT_APP_API_URL=http://localhost:3000/api/v1
REACT_APP_WS_URL=ws://localhost:3000
REACT_APP_ENV=development
EOF
    print_status "Admin .env file created"
else  
    print_info "Admin .env file already exists"
fi

# Create gitignore
echo ""
echo "📝 Creating .gitignore..."

if [ ! -f ".gitignore" ]; then
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
backend/dist/
admin/build/
mobile/android/app/build/
mobile/ios/build/

# Database
*.db
*.sqlite

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Coverage
coverage/
.nyc_output/

# Temporary files
tmp/
temp/

# Mobile specific
mobile/android/.gradle/
mobile/android/app/build/
mobile/ios/build/
mobile/ios/Pods/
mobile/metro.config.js

# Docker
.docker/

# Kubernetes secrets
k8s/secrets/
EOF
    print_status ".gitignore created"
else
    print_info ".gitignore already exists"
fi

echo ""
echo "🐳 Starting Docker services..."
docker-compose up -d postgres redis mailhog
print_status "Docker services started"

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

echo ""
print_status "🎉 Development environment setup completed!"
echo ""
print_info "Next steps:"
echo "1. cd backend && npm install && npm run dev"
echo "2. cd mobile && npm install && npm run ios/android"
echo "3. cd admin && npm install && npm start"
echo ""
print_info "Services:"
echo "- Backend API: http://localhost:3000"
echo "- Admin Panel: http://localhost:3001" 
echo "- MailHog UI: http://localhost:8025"
echo "- PostgreSQL: localhost:5432"
echo "- Redis: localhost:6379"
echo ""
print_info "Useful commands:"
echo "- npm run dev: Start backend + admin"
echo "- npm run docker:logs: View Docker logs"
echo "- npm run db:studio: Open Prisma Studio"
EOF

chmod +x scripts/setup-dev.sh

print_status "Development setup script created"