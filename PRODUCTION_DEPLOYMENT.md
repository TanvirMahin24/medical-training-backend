# Production Deployment Guide

## Overview
This guide covers the complete production deployment process for the Medical Training Platform using Docker, GitHub Actions CI/CD, and a VPS.

## Prerequisites

### VPS Requirements
- **OS**: Ubuntu 20.04 LTS or later
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: Minimum 50GB SSD
- **CPU**: 2+ cores
- **Network**: Public IP address

### Domain Configuration
- Domain name pointing to your VPS IP
- DNS records configured for:
  - `yourdomain.com` → VPS IP
  - `admin.yourdomain.com` → VPS IP
  - `api.yourdomain.com` → VPS IP

## Step 1: VPS Setup

### 1.1 Initial Server Setup
```bash
# SSH into your VPS
ssh root@your-vps-ip

# Run the setup script
wget https://raw.githubusercontent.com/yourusername/medical-training-backend/production/scripts/setup-vps.sh
chmod +x setup-vps.sh
./setup-vps.sh
```

### 1.2 Manual Setup (Alternative)
If you prefer manual setup:

```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker $USER

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Configure firewall
ufw enable
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 4001/tcp
ufw allow 4002/tcp
ufw allow 4005/tcp
```

## Step 2: GitHub Repository Setup

### 2.1 Create Production Branch
```bash
# Create and switch to production branch
git checkout -b production

# Push to remote
git push -u origin production
```

### 2.2 Configure GitHub Secrets
Go to your GitHub repository → Settings → Secrets and variables → Actions

Add the following secrets:
- `SSH_HOST`: Your VPS IP address
- `SSH_USER`: Your VPS username
- `SSH_PASSWORD`: Your VPS password
- `GITHUB_ACCESS_KEY`: GitHub personal access token with repo access

### 2.3 Personal Access Token
Create a GitHub personal access token:
1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Select scopes: `repo`, `workflow`
4. Copy the token and add it to `GITHUB_ACCESS_KEY` secret

## Step 3: Environment Configuration

### 3.1 Create Production Environment File
```bash
# On your VPS
cd /opt/medical-training-backend
cp production.env.template .env.production
nano .env.production
```

### 3.2 Configure Environment Variables
```bash
# Database
DB_NAME=medical_project_prod
DB_USER=medical_user
DB_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your_super_secure_jwt_secret_for_production

# Email
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Stripe
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# URLs
CLIENT_URL=https://yourdomain.com
ADMIN_URL=https://admin.yourdomain.com
```

## Step 4: Database Setup

### 4.1 Create Production Database
```bash
# Connect to PostgreSQL
docker exec -it medical_postgres_prod psql -U postgres

# Create database and user
CREATE DATABASE medical_project_prod;
CREATE USER medical_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE medical_project_prod TO medical_user;
\q
```

### 4.2 Run Migrations
```bash
# Run database migrations
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# Seed the database
docker-compose -f docker-compose.prod.yml exec backend npx prisma db seed
```

## Step 5: Deployment

### 5.1 Automatic Deployment (Recommended)
Push to production branch:
```bash
git add .
git commit -m "Deploy to production"
git push origin production
```

The GitHub Actions workflow will automatically:
1. Run tests
2. Deploy to VPS
3. Build and start containers
4. Perform health checks

### 5.2 Manual Deployment
```bash
# On your VPS
cd /opt/medical-training-backend

# Clone repository
git clone https://github.com/yourusername/medical-training-backend.git .

# Run deployment script
./scripts/deploy.sh
```

## Step 6: Verification

### 6.1 Check Service Status
```bash
# Check running containers
docker-compose -f docker-compose.prod.yml ps

# Check service logs
docker-compose -f docker-compose.prod.yml logs -f

# Check service health
curl http://localhost:4005/api/health
curl http://localhost/health
```

### 6.2 Test Endpoints
```bash
# Test backend API
curl http://yourdomain.com/api/health

# Test admin login
curl -X POST http://yourdomain.com/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@medicaltraining.com","password":"admin123"}'
```

## Step 7: Domain Configuration

### 7.1 Update Nginx Configuration
Edit `/opt/medical-training-backend/docker/nginx/conf.d/default.conf`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    # ... existing configuration
}

server {
    listen 80;
    server_name admin.yourdomain.com;
    # ... existing configuration
}

server {
    listen 80;
    server_name api.yourdomain.com;
    # ... existing configuration
}
```

### 7.2 Reload Nginx
```bash
docker-compose -f docker-compose.prod.yml restart nginx
```

## Step 8: SSL Configuration (Optional)

### 8.1 Install Certbot
```bash
# Install certbot
apt install certbot python3-certbot-nginx

# Get SSL certificates
certbot --nginx -d yourdomain.com -d www.yourdomain.com
certbot --nginx -d admin.yourdomain.com
certbot --nginx -d api.yourdomain.com
```

### 8.2 Auto-renewal
```bash
# Test auto-renewal
certbot renew --dry-run

# Add to crontab
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
```

## Monitoring and Maintenance

### 8.1 Service Monitoring
```bash
# Check service status
systemctl status medical-training.service

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Monitor resources
htop
docker stats
```

### 8.2 Backup and Recovery
```bash
# Manual backup
./scripts/backup.sh

# Restore database
docker exec -i medical_postgres_prod psql -U medical_user medical_project_prod < backup_file.sql
```

### 8.3 Updates and Maintenance
```bash
# Update system packages
apt update && apt upgrade -y

# Update Docker images
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# Clean up old images
docker system prune -f
```

## Troubleshooting

### Common Issues

#### 1. Services Not Starting
```bash
# Check container logs
docker-compose -f docker-compose.prod.yml logs [service_name]

# Check container status
docker-compose -f docker-compose.prod.yml ps

# Restart specific service
docker-compose -f docker-compose.prod.yml restart [service_name]
```

#### 2. Database Connection Issues
```bash
# Check database status
docker exec medical_postgres_prod pg_isready -U medical_user

# Check database logs
docker-compose -f docker-compose.prod.yml logs postgres
```

#### 3. Port Conflicts
```bash
# Check port usage
netstat -tulpn | grep :4005

# Kill process using port
sudo kill -9 [PID]
```

#### 4. Permission Issues
```bash
# Fix file permissions
sudo chown -R $USER:$USER /opt/medical-training-backend
chmod +x scripts/*.sh
```

### Performance Optimization

#### 1. Database Indexes
The schema already includes performance indexes for:
- User queries (email, role, subscription status)
- Payment queries (status, amount, dates)
- Case queries (difficulty, category, tags)
- Progress queries (user, case, scores)

#### 2. Nginx Optimization
- Gzip compression enabled
- Static file caching
- Rate limiting configured
- Security headers enabled

#### 3. Docker Optimization
- Multi-stage builds
- Health checks
- Resource limits (configurable)
- Auto-restart policies

## Security Considerations

### 1. Firewall Configuration
- Only necessary ports open
- SSH access restricted
- Fail2ban protection

### 2. Docker Security
- Non-root users in containers
- Resource limits
- Network isolation
- Regular security updates

### 3. Application Security
- JWT token validation
- Role-based access control
- Input validation
- Rate limiting

## Scaling Considerations

### 1. Horizontal Scaling
- Load balancer configuration
- Multiple backend instances
- Database read replicas

### 2. Vertical Scaling
- Increase VPS resources
- Optimize database queries
- Add caching layers

### 3. Monitoring and Alerting
- Resource usage monitoring
- Performance metrics
- Error tracking
- Uptime monitoring

## Support and Maintenance

### 1. Regular Tasks
- Weekly security updates
- Monthly backup verification
- Quarterly performance review
- Annual security audit

### 2. Emergency Procedures
- Service restart procedures
- Database recovery
- Rollback procedures
- Contact information

## Conclusion

This deployment setup provides a robust, scalable, and maintainable production environment for the Medical Training Platform. The automated CI/CD pipeline ensures consistent deployments, while the monitoring and backup systems provide reliability and recovery capabilities.

For additional support or questions, refer to the project documentation or create an issue in the GitHub repository.
