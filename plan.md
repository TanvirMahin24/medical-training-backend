# Medical Training Backend - Development Plan

## Project Overview

Building a comprehensive medical training platform with three main components:

- **Backend**: NestJS + PostgreSQL + Prisma ORM
- **Client**: React frontend for medical trainees
- **Admin**: React + Vite admin panel for content management

## Phase 1: Project Setup & Infrastructure

### 1.1 Project Structure Setup

```
medical-training-backend/
├── backend/           # NestJS backend API
├── client/            # React frontend for trainees
├── admin/             # React + Vite admin panel
├── docker/            # Docker configuration files
├── .env.example       # Environment variables template
└── docker-compose.yml # Multi-service orchestration
```

### 1.2 Docker Configuration

- Create Dockerfile for each service (backend, client, admin)
- Setup docker-compose.yml for local development
- Configure PostgreSQL container
- Setup Redis container for caching (optional)

### 1.3 Environment Configuration

- Database connection strings
- JWT secrets
- SMTP configuration for Nodemailer
- Stripe API keys
- Redis configuration

## Phase 2: Backend Development (NestJS)

### 2.1 Project Initialization

- Initialize NestJS project with TypeScript
- Setup Prisma ORM with PostgreSQL
- Configure JWT authentication
- Setup validation pipes and interceptors

### 2.2 Database Schema Design

```sql
-- Core tables
- users (id, email, password, role, subscription_status, trial_expires_at)
- subscriptions (id, user_id, stripe_subscription_id, plan_type, status, expires_at)
- medical_cases (id, title, description, difficulty, category, content)
- user_progress (id, user_id, case_id, score, completed_at, attempts)
- badges (id, name, description, criteria, image_url)
- user_badges (id, user_id, badge_id, earned_at)

-- Payment tables
- payments (id, user_id, stripe_payment_intent_id, amount, status, created_at)
- payment_methods (id, user_id, stripe_payment_method_id, type, last4)
```

### 2.3 Core Modules Implementation

- **Auth Module**: Registration, login, password reset, email verification
- **User Module**: Profile management, subscription handling
- **Case Module**: Medical case CRUD, progress tracking
- **Payment Module**: Stripe integration, subscription management
- **Badge Module**: Achievement system, criteria evaluation

### 2.4 Authentication & Security

- JWT token generation and validation
- Password hashing with bcrypt
- Role-based access control (User, Admin, SuperAdmin)
- Rate limiting and request validation
- CORS configuration

### 2.5 Email Integration

- Nodemailer setup with SMTP
- Email templates for:
  - Account verification
  - Password reset
  - Subscription confirmations
  - Trial expiration reminders

### 2.6 Stripe Integration

- Customer creation and management
- Subscription plan setup
- Payment processing
- Webhook handling for subscription events
- Trial period management

## Phase 3: Client Frontend Development (React)

### 3.1 Project Setup

- Initialize React project with TypeScript
- Setup Tailwind CSS for styling
- Configure routing with React Router
- Setup state management (Zustand/Redux)

### 3.2 Core Pages

- **Landing Page**: Marketing content, pricing, features
- **Authentication**: Login, Register, Password Reset
- **Dashboard**: User progress, recent cases, achievements
- **Case Library**: Browse available medical cases
- **Case Simulation**: Interactive medical training scenarios
- **Progress Tracking**: Detailed performance analytics
- **Badges**: Achievement showcase
- **Profile**: User settings, subscription management

### 3.3 Medical Case Simulation Engine

- Interactive patient scenarios
- Decision tree implementation
- Score calculation system
- Progress persistence
- Real-time feedback

### 3.4 User Experience Features

- Responsive design for all devices
- Dark/light theme toggle
- Accessibility compliance
- Loading states and error handling
- Offline capability for completed cases

## Phase 3.5: Interactive Case Simulation Engine (NEW)

### 3.5.1 Enhanced Database Schema

```sql
-- Enhanced medical_cases table
- content: JSON structure for interactive scenarios
  - clinic_layout: Interactive clinic map with objects
  - patient_info: Patient demographics and medical history
  - visits: Array of patient visits with evolving conditions
  - tasks_for_visit: Interactive tasks with dialogue options
  - expected_vitals: Dynamic vital signs per visit
  - medical_history: Patient medical background
  - patient_arrivals: Scheduled appointment times

-- New simulation_sessions table
- id, user_id, case_id, current_visit, current_task
- player_position: {x, y} coordinates
- game_state: JSON with current simulation state
- score: Real-time scoring
- time_spent: Session duration
- completed_tasks: Array of finished tasks
- patient_state: Current patient status
```

### 3.5.2 Interactive Simulation Features

- **Top-down Clinic Layout**: 2D clinic environment with interactive objects
- **Player Movement System**: WASD key controls with smooth animation
- **Interactive Objects**: Front desk, exam rooms, medical equipment, staff NPCs
- **Dynamic Task Progression**: Tasks unlock based on previous actions
- **Patient Interaction System**: Dialogue choices with consequences
- **Real-time Scoring**: Points for correct actions, penalties for mistakes
- **Clinic Environment**: Exam rooms, waiting areas, medical equipment

### 3.5.3 Mini-Game Integration

- **EKG Mini-Game**: Interactive EKG interpretation
- **Blood Pressure Mini-Game**: Simulated BP measurement
- **Vital Signs Recording**: Interactive vital signs input
- **Patient Charting**: Electronic medical record simulation
- **Procedure Simulations**: Step-by-step medical procedures

### 3.5.4 Case Scenario Structure

```json
{
  "case_id": "uuid",
  "case_name": "John Smith - Hypertension Management",
  "description": "Multi-visit case with evolving condition",
  "patient_info": {
    "id": "patient-smith",
    "name": "John Smith",
    "age": 45,
    "gender": "Male",
    "chief_complaint": "Hypertension follow-up"
  },
  "visits": [
    {
      "visit_number": 1,
      "tasks_for_visit": [
        {
          "id": "task-check-in",
          "type": "front_desk_check_in",
          "dialogue_options": [],
          "expected_patient_id": "patient-smith"
        },
        {
          "id": "task-greet",
          "type": "patient_interaction",
          "dialogue_options": [
            {
              "text": "Hello, Mr. Smith? My name is Alex...",
              "score_impact": 50,
              "consequence": "patient_follows"
            }
          ]
        }
      ],
      "expected_vitals": {...},
      "medical_history": {...}
    }
  ],
  "patient_arrivals": [...]
}
```

### 3.5.5 Simulation State Management

- **Game Loop**: Real-time game loop with requestAnimationFrame
- **State Persistence**: Save/load simulation progress
- **Task Management**: Dynamic task list with completion tracking
- **Score System**: Real-time scoring with multipliers and bonuses
- **Time Management**: Shift-based timing with patient arrivals

## Phase 4: Admin Panel Development (React + Vite)

### 4.1 Project Setup

- Initialize Vite + React project
- Setup Tailwind CSS
- Configure routing and state management
- Setup admin authentication

### 4.2 Admin Features

- **Dashboard**: Overview of platform usage, user statistics
- **User Management**: View, edit, suspend users
- **Case Management**: Create, edit, delete medical cases
- **Content Management**: Manage case scenarios, images, media
- **Subscription Management**: Monitor payments, handle disputes
- **Analytics**: User performance metrics, case completion rates
- **System Settings**: Platform configuration, feature toggles

### 4.3 Content Creation Tools

- Rich text editor for case descriptions
- Media upload and management
- Case template system
- Bulk import/export functionality
- **Interactive Case Builder**: Visual case creation tool for simulation scenarios

## Phase 5: Integration & Testing

### 5.1 API Integration

- Connect frontend to backend APIs
- Implement error handling and retry logic
- Setup API response caching
- Implement real-time updates (WebSocket if needed)

### 5.2 Testing Strategy

- **Backend**: Unit tests with Jest, E2E tests with Supertest
- **Frontend**: Component testing with React Testing Library
- **Integration**: API endpoint testing
- **Performance**: Load testing for simulation engine
- **Simulation Testing**: Interactive case scenario testing

### 5.3 Security Testing

- Authentication flow testing
- Authorization testing
- Input validation testing
- SQL injection prevention
- XSS protection

## Phase 6: Deployment & DevOps

### 6.1 Production Environment

- Production Docker configurations
- Environment-specific configurations
- Database migration scripts
- Backup and recovery procedures

### 6.2 CI/CD Pipeline

- Automated testing on pull requests
- Build and deployment automation
- Environment promotion (dev → staging → production)
- Rollback procedures

### 6.3 Monitoring & Logging

- Application performance monitoring
- Error tracking and alerting
- User analytics and insights
- System health monitoring

## Phase 7: Advanced Features & Optimization

### 7.1 Performance Optimization

- Database query optimization
- Frontend bundle optimization
- Image compression and lazy loading
- CDN integration for static assets

### 7.2 Advanced Analytics

- User behavior tracking
- Learning path recommendations
- Performance benchmarking
- A/B testing framework

### 7.3 Mobile Optimization

- Progressive Web App (PWA) features
- Mobile-specific UI improvements
- Offline functionality enhancement

## Development Timeline

### Week 1-2: Project Setup & Backend Foundation

- Project structure setup
- Docker configuration
- Basic NestJS setup with Prisma
- Database schema design

### Week 3-4: Backend Core Features

- Authentication system
- User management
- Basic CRUD operations
- Email integration

### Week 5-6: Payment & Subscription

- Stripe integration
- Subscription management
- Trial period handling

### Week 7-8: Client Frontend

- React project setup
- Core pages and routing
- Authentication integration

### Week 9-10: Case Simulation Engine

- Interactive case system
- Progress tracking
- Score calculation

### Week 11-12: Interactive Simulation Engine (NEW)

- Enhanced database schema for interactive cases
- Top-down clinic layout system
- Player movement and interaction system
- Dynamic task progression
- Mini-game integration

### Week 13-14: Admin Panel

- Vite + React setup
- Admin authentication
- Basic CRUD operations
- Interactive case builder

### Week 15-16: Integration & Testing

- API integration
- End-to-end testing
- Bug fixes and optimization

### Week 17-18: Deployment & Polish

- Production deployment
- Performance optimization
- Final testing and bug fixes

## Technology Stack Summary

### Backend

- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + bcrypt
- **Email**: Nodemailer
- **Payments**: Stripe
- **Validation**: class-validator, class-transformer

### Frontend (Client)

- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router
- **HTTP Client**: Axios
- **Build Tool**: Create React App
- **Animation**: Framer Motion
- **Game Engine**: Custom 2D simulation engine

### Frontend (Admin)

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router

### Infrastructure

- **Containerization**: Docker + Docker Compose
- **Database**: PostgreSQL
- **Caching**: Redis (optional)
- **Environment**: Node.js 18+

## Success Criteria

1. **Functional Requirements**
   - Complete user authentication system
   - Working subscription management
   - Interactive medical case simulations
   - Comprehensive admin panel
   - Email notifications working
   - **Interactive simulation engine with clinic environment**
   - **Mini-games for medical procedures**
   - **Dynamic case progression system**

2. **Non-Functional Requirements**
   - Response time < 200ms for API calls
   - 99.9% uptime
   - Mobile-responsive design
   - Accessibility compliance (WCAG 2.1 AA)
   - Security best practices implementation
   - **Smooth 60fps simulation performance**
   - **Real-time interactive responsiveness**

3. **Quality Assurance**
   - 90%+ test coverage
   - No critical security vulnerabilities
   - Performance optimization completed
   - Cross-browser compatibility verified
   - **Simulation engine thoroughly tested**
   - **Mini-games validated for accuracy**

## Risk Mitigation

1. **Technical Risks**
   - Regular code reviews and pair programming
   - Comprehensive testing strategy
   - Performance monitoring from early stages
   - **Simulation engine performance profiling**
   - **Mini-game complexity management**

2. **Timeline Risks**
   - Buffer time included in estimates
   - Parallel development where possible
   - Regular progress tracking and adjustments
   - **Phased simulation feature rollout**

3. **Security Risks**
   - Security review at each phase
   - Regular dependency updates
   - Penetration testing before production

This plan provides a structured approach to building a robust, scalable medical training platform while maintaining code quality and security standards. The new Phase 3.5 specifically addresses the interactive simulation requirements that were missing from the current implementation.
