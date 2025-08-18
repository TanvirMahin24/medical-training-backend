.PHONY: help install dev build test clean docker-up docker-down docker-logs db-migrate db-seed db-reset

# Default target
help:
	@echo "Medical Training Backend - Development Commands"
	@echo "=============================================="
	@echo ""
	@echo "Setup Commands:"
	@echo "  install        Install all dependencies"
	@echo "  setup-env      Copy and setup environment file"
	@echo ""
	@echo "Development Commands:"
	@echo "  dev            Start all services in development mode"
	@echo "  dev-backend    Start only backend service"
	@echo "  dev-client     Start only client service"
	@echo "  dev-admin      Start only admin service"
	@echo ""
	@echo "Docker Commands:"
	@echo "  docker-up      Start all Docker services"
	@echo "  docker-down    Stop all Docker services"
	@echo "  docker-logs    View Docker logs"
	@echo "  docker-clean   Clean up Docker containers and volumes"
	@echo "  docker-dev     Start development Docker services"
	@echo ""
	@echo "Database Commands:"
	@echo "  db-migrate     Run database migrations"
	@echo "  db-seed        Seed database with sample data"
	@echo "  db-reset       Reset database (drop and recreate)"
	@echo "  db-studio      Open Prisma Studio"
	@echo ""
	@echo "Build Commands:"
	@echo "  build          Build all services"
	@echo "  build-backend  Build backend service"
	@echo "  build-client   Build client service"
	@echo "  build-admin    Build admin service"
	@echo ""
	@echo "Testing Commands:"
	@echo "  test           Run all tests"
	@echo "  test-backend   Run backend tests"
	@echo "  test-client    Run client tests"
	@echo "  test-admin     Run admin tests"
	@echo ""
	@echo "Utility Commands:"
	@echo "  lint           Lint all services"
	@echo "  format         Format code for all services"
	@echo "  clean          Clean build artifacts and node_modules"

# Setup commands
install:
	@echo "Installing all dependencies..."
	npm run install:all

setup-env:
	@echo "Setting up environment file..."
	@if [ ! -f .env ]; then cp .env.example .env; echo "Created .env file from .env.example"; else echo ".env file already exists"; fi

# Development commands
dev:
	@echo "Starting all services in development mode..."
	npm run dev

dev-backend:
	@echo "Starting backend service..."
	npm run dev:backend

dev-client:
	@echo "Starting client service..."
	npm run dev:client

dev-admin:
	@echo "Starting admin service..."
	npm run dev:admin

# Docker commands
docker-up:
	@echo "Starting all Docker services..."
	npm run docker:up

docker-down:
	@echo "Stopping all Docker services..."
	npm run docker:down

docker-logs:
	@echo "Viewing Docker logs..."
	npm run docker:logs

docker-clean:
	@echo "Cleaning up Docker containers and volumes..."
	npm run docker:clean

docker-dev:
	@echo "Starting development Docker services..."
	docker-compose -f docker-compose.dev.yml up -d

# Database commands
db-migrate:
	@echo "Running database migrations..."
	npm run db:migrate

db-seed:
	@echo "Seeding database with sample data..."
	npm run db:seed

db-reset:
	@echo "Resetting database..."
	@echo "This will drop and recreate the database. Are you sure? [y/N]"
	@read -p " " -n 1 -r; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "Resetting database..."; \
		docker-compose exec postgres psql -U postgres -d medical_training_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"; \
		npm run db:migrate; \
		npm run db:seed; \
	else \
		echo "Database reset cancelled."; \
	fi

db-studio:
	@echo "Opening Prisma Studio..."
	npm run db:studio

# Build commands
build:
	@echo "Building all services..."
	npm run build

build-backend:
	@echo "Building backend service..."
	npm run build:backend

build-client:
	@echo "Building client service..."
	npm run build:client

build-admin:
	@echo "Building admin service..."
	npm run build:admin

# Testing commands
test:
	@echo "Running all tests..."
	npm run test

test-backend:
	@echo "Running backend tests..."
	npm run test:backend

test-client:
	@echo "Running client tests..."
	npm run test:client

test-admin:
	@echo "Running admin tests..."
	npm run test:admin

# Utility commands
lint:
	@echo "Linting all services..."
	npm run lint

format:
	@echo "Formatting code for all services..."
	npm run format

clean:
	@echo "Cleaning build artifacts and node_modules..."
	rm -rf backend/dist backend/node_modules
	rm -rf client/build client/node_modules
	rm -rf admin/dist admin/node_modules
	rm -rf node_modules
	@echo "Cleanup completed!"

# Quick start for new developers
quickstart: setup-env install docker-up
	@echo "Quick start completed!"
	@echo "Services are starting up..."
	@echo "Backend: http://localhost:3002"
	@echo "Client: http://localhost:3000"
	@echo "Admin: http://localhost:3001"
	@echo "pgAdmin: http://localhost:5050"
	@echo "Redis Commander: http://localhost:8081"
	@echo "Mailhog: http://localhost:8025"
