#!/bin/bash

# VPS Setup Script
# This script should be run on a fresh VPS to prepare it for deployment

set -e

echo "🔧 Setting up VPS for Medical Training Platform..."

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
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root (use sudo)"
   exit 1
fi

# Update system packages
print_status "Updating system packages..."
apt update && apt upgrade -y

# Install essential packages
print_status "Installing essential packages..."
apt install -y \
    curl \
    wget \
    git \
    vim \
    htop \
    ufw \
    fail2ban \
    nginx \
    certbot \
    python3-certbot-nginx \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release

# Install Docker
print_status "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    
    # Add current user to docker group
    usermod -aG docker $SUDO_USER
    
    # Start and enable Docker
    systemctl start docker
    systemctl enable docker
else
    print_status "Docker is already installed"
fi

# Install Docker Compose
print_status "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    # Create symlink for compatibility
    ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
else
    print_status "Docker Compose is already installed"
fi

# Configure firewall
print_status "Configuring firewall..."
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 4001/tcp
ufw allow 4002/tcp
ufw allow 4005/tcp
ufw allow 5432/tcp
ufw allow 6379/tcp

# Configure fail2ban
print_status "Configuring fail2ban..."
systemctl enable fail2ban
systemctl start fail2ban

# Create application directory
print_status "Creating application directory..."
mkdir -p /opt/medical-training-backend
chown $SUDO_USER:$SUDO_USER /opt/medical-training-backend

# Create systemd service for auto-restart
print_status "Creating systemd service..."
cat > /etc/systemd/system/medical-training.service << EOF
[Unit]
Description=Medical Training Platform
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/medical-training-backend
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Enable the service
systemctl enable medical-training.service

# Create log rotation configuration
print_status "Configuring log rotation..."
cat > /etc/logrotate.d/medical-training << EOF
/opt/medical-training-backend/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 root root
}
EOF

# Create monitoring script
print_status "Creating monitoring script..."
cat > /opt/medical-training-backend/monitor.sh << 'EOF'
#!/bin/bash

# Simple monitoring script
LOG_FILE="/opt/medical-training-backend/logs/monitor.log"
mkdir -p $(dirname $LOG_FILE)

echo "$(date): Checking services..." >> $LOG_FILE

# Check Docker containers
if ! docker ps | grep -q "medical_"; then
    echo "$(date): ERROR - Some containers are not running" >> $LOG_FILE
    # Restart the service
    systemctl restart medical-training.service
else
    echo "$(date): All containers are running" >> $LOG_FILE
fi

# Check disk space
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "$(date): WARNING - Disk usage is ${DISK_USAGE}%" >> $LOG_FILE
fi

# Check memory usage
MEM_USAGE=$(free | grep Mem | awk '{printf("%.0f", $3/$2 * 100.0)}')
if [ $MEM_USAGE -gt 80 ]; then
    echo "$(date): WARNING - Memory usage is ${MEM_USAGE}%" >> $LOG_FILE
fi
EOF

chmod +x /opt/medical-training-backend/monitor.sh

# Add monitoring to crontab
print_status "Setting up monitoring cron job..."
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/medical-training-backend/monitor.sh") | crontab -

# Create backup script
print_status "Creating backup script..."
cat > /opt/medical-training-backend/backup.sh << 'EOF'
#!/bin/bash

# Backup script for database and files
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

echo "Creating backup: $DATE"

# Backup database
docker exec medical_postgres_prod pg_dump -U $DB_USER $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Backup uploaded files (if any)
if [ -d "/opt/medical-training-backend/uploads" ]; then
    tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz -C /opt/medical-training-backend uploads
fi

# Keep only last 7 backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /opt/medical-training-backend/backup.sh

# Add backup to crontab (daily at 2 AM)
print_status "Setting up backup cron job..."
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/medical-training-backend/backup.sh") | crontab -

# Create environment file template
print_status "Creating environment file template..."
cat > /opt/medical-training-backend/production.env.template << 'EOF'
# Production Environment Configuration
NODE_ENV=production
PORT=4005

# Database
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public"
DB_HOST=localhost
DB_PORT=5432
DB_NAME=medical_project_prod
DB_USER=medical_user
DB_PASSWORD=secure_production_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your_super_secure_jwt_secret_for_production
JWT_EXPIRES_IN=24h

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Stripe
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Frontend URLs
CLIENT_URL=https://yourdomain.com
ADMIN_URL=https://admin.yourdomain.com

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
EOF

# Set proper permissions
chown -R $SUDO_USER:$SUDO_USER /opt/medical-training-backend

# Create logs directory
mkdir -p /opt/medical-training-backend/logs
chown $SUDO_USER:$SUDO_USER /opt/medical-training-backend/logs

print_status "✅ VPS setup completed successfully!"
print_status ""
print_status "Next steps:"
print_status "1. Clone your repository to /opt/medical-training-backend"
print_status "2. Copy production.env.template to .env.production and configure it"
print_status "3. Run the deployment script: ./scripts/deploy.sh"
print_status ""
print_status "Services will be available on:"
print_status "- Backend API: http://your-vps-ip:4005"
print_status "- Client Frontend: http://your-vps-ip:4001"
print_status "- Admin Panel: http://your-vps-ip:4002"
print_status ""
print_status "Don't forget to:"
print_status "- Configure your domain DNS to point to this VPS"
print_status "- Set up SSL certificates with Let's Encrypt"
print_status "- Configure your firewall rules"
print_status "- Set up monitoring and alerting"
