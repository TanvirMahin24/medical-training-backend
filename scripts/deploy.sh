#!/bin/bash

# Production Deployment Script
# This script should be run on the VPS after pulling the latest code

set -e

echo "🚀 Starting production deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env.production exists
if [ ! -f .env.production ]; then
    print_error ".env.production file not found. Please create it from production.env.template"
    exit 1
fi

# Load environment variables
print_status "Loading environment variables..."
source .env.production

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# Remove old images to free up space
print_status "Cleaning up old Docker images..."
docker system prune -f

# Pull latest images (if using external images)
print_status "Pulling latest base images..."
docker-compose -f docker-compose.prod.yml pull

# Build and start new containers
print_status "Building and starting new containers..."
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for services to be healthy
print_status "Waiting for services to be healthy..."
sleep 30

# Health checks
print_status "Performing health checks..."

# Check backend API
if curl -f http://localhost:4005/api/health > /dev/null 2>&1; then
    print_status "✅ Backend API is healthy"
else
    print_error "❌ Backend API health check failed"
    docker-compose -f docker-compose.prod.yml logs backend
    exit 1
fi

# Check Nginx
if curl -f http://localhost/health > /dev/null 2>&1; then
    print_status "✅ Nginx is healthy"
else
    print_error "❌ Nginx health check failed"
    docker-compose -f docker-compose.prod.yml logs nginx
    exit 1
fi

# Check database
if docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U $DB_USER > /dev/null 2>&1; then
    print_status "✅ PostgreSQL is healthy"
else
    print_error "❌ PostgreSQL health check failed"
    docker-compose -f docker-compose.prod.yml logs postgres
    exit 1
fi

# Check Redis
if docker-compose -f docker-compose.prod.yml exec -T redis redis-cli ping > /dev/null 2>&1; then
    print_status "✅ Redis is healthy"
else
    print_error "❌ Redis health check failed"
    docker-compose -f docker-compose.prod.yml logs redis
    exit 1
fi

# Run database migrations if needed
print_status "Checking database migrations..."
if docker-compose -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy > /dev/null 2>&1; then
    print_status "✅ Database migrations completed"
else
    print_warning "⚠️  Database migrations failed or not needed"
fi

# Show running containers
print_status "Current running containers:"
docker-compose -f docker-compose.prod.yml ps

# Show resource usage
print_status "Resource usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

# Show recent logs
print_status "Recent logs (last 20 lines):"
docker-compose -f docker-compose.prod.yml logs --tail=20

print_status "🚀 Deployment completed successfully!"
print_status "Services are now running on:"
echo "  - Backend API: http://localhost:4005"
echo "  - Client Frontend: http://localhost:4001"
echo "  - Admin Panel: http://localhost:4002"
echo "  - Nginx: http://localhost"

# Optional: Send notification
if command -v curl &> /dev/null; then
    print_status "Sending deployment notification..."
    # You can add webhook notifications here
    # curl -X POST "YOUR_WEBHOOK_URL" -d "Deployment completed successfully"
fi

echo ""
print_status "Deployment script completed!"
