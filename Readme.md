# Medical Training Backend

A comprehensive medical training platform built with modern technologies to provide interactive medical case simulations for healthcare professionals.

## 🏗️ Project Structure

```
medical-training-backend/
├── backend/           # NestJS backend API
├── client/            # React frontend for medical trainees
├── admin/             # React + Vite admin panel
├── docker/            # Docker configuration files
├── .env.example       # Environment variables template
├── docker-compose.yml # Multi-service orchestration
└── package.json       # Root package.json with workspace scripts
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (if running locally without Docker)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd medical-training-backend
cp .env.example .env
# Edit .env with your configuration values
```

### 2. Install Dependencies

```bash
npm run install:all
```

### 3. Start with Docker (Recommended)

```bash
# Start all services
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down
```

### 4. Start Development Servers

```bash
# Start all services in development mode
npm run dev

# Or start individually:
npm run dev:backend    # Backend API (port 3002)
npm run dev:client     # Client frontend (port 3000)
npm run dev:admin      # Admin panel (port 3001)
```

## 🐳 Docker Services

| Service    | Port | Description    |
| ---------- | ---- | -------------- |
| PostgreSQL | 5432 | Main database  |
| Redis      | 6379 | Caching layer  |
| Backend    | 3002 | NestJS API     |
| Client     | 3000 | React frontend |
| Admin      | 3001 | Admin panel    |

## 🔧 Development Commands

### Root Level Commands

```bash
npm run dev              # Start all services in development
npm run build            # Build all services
npm run test             # Run tests for all services
npm run lint             # Lint all services
npm run format           # Format code for all services
```

### Database Commands

```bash
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database with sample data
npm run db:studio        # Open Prisma Studio
```

### Docker Commands

```bash
npm run docker:up        # Start all containers
npm run docker:down      # Stop all containers
npm run docker:build     # Build all containers
npm run docker:logs      # View container logs
npm run docker:clean     # Clean up containers and volumes
```

## 🌍 Environment Variables

Copy `.env.example` to `.env` and configure:

- **Database**: PostgreSQL connection string
- **JWT**: Secret keys for authentication
- **Email**: SMTP configuration for Nodemailer
- **Stripe**: Payment processing API keys
- **Redis**: Caching configuration

## 🏥 Features

### Core Functionality

- **User Authentication**: Registration, login, password reset
- **Medical Case Simulations**: Interactive patient scenarios
- **Progress Tracking**: User performance analytics
- **Badge System**: Achievement recognition
- **Subscription Management**: Stripe integration with trial periods

### Admin Panel

- **User Management**: View and manage user accounts
- **Content Management**: Create and edit medical cases
- **Analytics Dashboard**: Platform usage statistics
- **System Configuration**: Feature toggles and settings

## 🛠️ Technology Stack

### Backend

- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + bcrypt
- **Email**: Nodemailer SMTP
- **Payments**: Stripe API
- **Caching**: Redis (optional)

### Frontend

- **Client**: React 18 + TypeScript + Tailwind CSS
- **Admin**: React 18 + TypeScript + Vite + Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router
- **HTTP Client**: Axios

### Infrastructure

- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions (planned)
- **Monitoring**: Application performance monitoring

## 📚 API Documentation

Once the backend is running, visit:

- **Swagger UI**: `http://localhost:3002/api/docs`
- **Health Check**: `http://localhost:3002/health`

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests for specific service
npm run test:backend
npm run test:client
npm run test:admin

# Run tests with coverage
npm run test:coverage
```

## 📦 Deployment

### Production Build

```bash
npm run build
```

### Docker Production

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Development Workflow

1. **Setup**: Follow the Quick Start guide
2. **Development**: Use `npm run dev` for local development
3. **Testing**: Run tests before committing changes
4. **Database**: Use migrations for schema changes
5. **Docker**: Use Docker for consistent environments
6. **Deployment**: Follow the deployment guide for production

---

**Note**: This is a development version. For production deployment, ensure proper security configurations and environment variables are set.
