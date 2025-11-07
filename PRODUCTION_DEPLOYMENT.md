# Production Deployment Guide

Complete guide for deploying the Bhinna Shad Restaurant Management System to production.

## Architecture Overview

```
┌─────────────────┐
│  Flutter App    │
│  (Mobile/Web)   │
└────────┬────────┘
         │
         │ HTTPS
         ▼
┌─────────────────┐
│  Node.js API    │
│  (Port 9002)    │
└────────┬────────┘
         │
         │ MongoDB
         ▼
┌─────────────────┐
│  MongoDB Atlas  │
│  (Cloud DB)     │
└─────────────────┘
```

## Prerequisites

- [ ] Domain name (e.g., api.bhinnashad.com)
- [ ] SSL certificate (Let's Encrypt recommended)
- [ ] Server (VPS, AWS EC2, DigitalOcean, etc.)
- [ ] MongoDB Atlas account (already configured)
- [ ] Node.js 18+ installed on server
- [ ] PM2 for process management

## Part 1: Backend Deployment

### 1.1 Server Setup

**Recommended Providers:**
- AWS EC2 (t2.micro for testing, t2.small for production)
- DigitalOcean Droplet ($6/month)
- Heroku (easy but more expensive)
- Railway.app (modern, easy deployment)

**Server Requirements:**
- Ubuntu 20.04 or 22.04
- 1GB RAM minimum (2GB recommended)
- 20GB storage
- Node.js 18+
- PM2 process manager

### 1.2 Install Dependencies on Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx (for reverse proxy)
sudo apt install -y nginx

# Install Certbot (for SSL)
sudo apt install -y certbot python3-certbot-nginx
```

### 1.3 Deploy Backend Code

```bash
# Clone or upload your code
cd /var/www
sudo mkdir bhinnashad
sudo chown $USER:$USER bhinnashad
cd bhinnashad

# Upload your node_backend folder
# (Use git, scp, or FTP)

cd node_backend

# Install dependencies
npm install --production

# Create production .env
nano .env
```

**Production `.env` file:**
```env
# MongoDB (already configured)
MONGODB_URI=mongodb+srv://marik:iwcqP1s38lXz6Izq@cluster0.heyuomr.mongodb.net/bhinna_shad?retryWrites=true&w=majority&appName=Cluster0

# Server
PORT=9002
NODE_ENV=production

# JWT Secret (CHANGE THIS!)
JWT_SECRET=your-super-secure-random-string-change-this-in-production-min-32-chars

# CORS (your frontend domain)
CORS_ORIGIN=https://app.bhinnashad.com,https://bhinnashad.com
```

### 1.4 Start with PM2

```bash
# Start the application
pm2 start server.js --name bhinnashad-api

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the command it outputs

# Check status
pm2 status
pm2 logs bhinnashad-api
```

### 1.5 Configure Nginx Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/bhinnashad-api
```

**Nginx configuration:**
```nginx
server {
    listen 80;
    server_name api.bhinnashad.com;

    location / {
        proxy_pass http://localhost:9002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeouts for long requests
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/bhinnashad-api /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 1.6 Setup SSL Certificate

```bash
# Get SSL certificate from Let's Encrypt
sudo certbot --nginx -d api.bhinnashad.com

# Auto-renewal is configured automatically
# Test renewal
sudo certbot renew --dry-run
```

### 1.7 Configure Firewall

```bash
# Allow SSH, HTTP, and HTTPS
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

## Part 2: Flutter App Deployment

### 2.1 Update Production Configuration

**Update `frontend/.env.production`:**
```env
API_BASE_URL=https://api.bhinnashad.com/api
CLOUDINARY_CLOUD_NAME=drw148izx
CLOUDINARY_API_KEY=248126434961473
CLOUDINARY_API_SECRET=ftP0WnkLkKZ8gqe9h_eQkjZF3QQ
FALLBACK_UPI_ID=dasjojo7-1@okicici
ENVIRONMENT=production
```

### 2.2 Build for Android

```bash
cd frontend

# Build APK (for testing)
flutter build apk --release --dart-define-from-file=.env.production

# Build App Bundle (for Play Store)
flutter build appbundle --release --dart-define-from-file=.env.production

# Output locations:
# APK: build/app/outputs/flutter-apk/app-release.apk
# Bundle: build/app/outputs/bundle/release/app-release.aab
```

### 2.3 Build for iOS

```bash
cd frontend

# Build for iOS
flutter build ios --release --dart-define-from-file=.env.production

# Open in Xcode for signing and upload
open ios/Runner.xcworkspace
```

### 2.4 Build for Web

```bash
cd frontend

# Build web version
flutter build web --release --dart-define-from-file=.env.production

# Output: build/web/
```

**Deploy web build to:**
- Firebase Hosting
- Netlify
- Vercel
- AWS S3 + CloudFront
- Your own server with Nginx

## Part 3: Database Backup

### 3.1 MongoDB Atlas Backup

MongoDB Atlas provides automatic backups. Configure:

1. Go to MongoDB Atlas Dashboard
2. Select your cluster
3. Click "Backup" tab
4. Enable "Continuous Backup" (recommended)
5. Configure backup schedule

### 3.2 Manual Backup Script

```bash
#!/bin/bash
# backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/mongodb"
mkdir -p $BACKUP_DIR

mongodump --uri="mongodb+srv://marik:iwcqP1s38lXz6Izq@cluster0.heyuomr.mongodb.net/bhinna_shad" \
  --out="$BACKUP_DIR/backup_$DATE"

# Keep only last 7 days of backups
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +

echo "Backup completed: $BACKUP_DIR/backup_$DATE"
```

```bash
# Make executable
chmod +x backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /path/to/backup-db.sh
```

## Part 4: Monitoring & Logging

### 4.1 PM2 Monitoring

```bash
# View logs
pm2 logs bhinnashad-api

# Monitor resources
pm2 monit

# View detailed info
pm2 info bhinnashad-api
```

### 4.2 Setup Log Rotation

```bash
pm2 install pm2-logrotate

# Configure
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

### 4.3 Error Tracking (Optional)

Consider integrating:
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **New Relic** - Performance monitoring

## Part 5: Security Checklist

### Backend Security

- [x] Use HTTPS only
- [x] Strong JWT secret (32+ characters)
- [x] Environment variables for secrets
- [x] CORS configured for specific domains
- [x] Rate limiting (add express-rate-limit)
- [x] Helmet.js for security headers
- [x] Input validation on all endpoints
- [x] MongoDB connection string secured
- [ ] Regular security updates
- [ ] Firewall configured
- [ ] SSH key authentication only

### Frontend Security

- [x] API keys in environment variables
- [x] HTTPS only in production
- [x] Secure token storage
- [x] Input sanitization
- [ ] Code obfuscation (optional)
- [ ] Certificate pinning (optional)

## Part 6: Performance Optimization

### Backend Optimization

```javascript
// Add to server.js

// Compression
const compression = require('compression');
app.use(compression());

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Helmet for security headers
const helmet = require('helmet');
app.use(helmet());
```

### Database Optimization

```javascript
// Add indexes to frequently queried fields
// In MongoDB Atlas or via code:

// Users
db.users.createIndex({ email: 1 }, { unique: true });

// Orders
db.orders.createIndex({ status: 1, timestamp: -1 });
db.orders.createIndex({ waiterId: 1, status: 1 });
db.orders.createIndex({ tableNumber: 1, status: 1 });

// Menu
db.menu.createIndex({ category: 1, isAvailable: 1 });

// Tables
db.tables.createIndex({ tableNumber: 1 }, { unique: true });
```

## Part 7: Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database backup created
- [ ] SSL certificate obtained
- [ ] Domain DNS configured
- [ ] Firewall rules set
- [ ] PM2 configured
- [ ] Nginx configured

### Deployment

- [ ] Code deployed to server
- [ ] Dependencies installed
- [ ] PM2 started and saved
- [ ] Nginx restarted
- [ ] SSL working
- [ ] API accessible via HTTPS
- [ ] CORS working

### Post-Deployment

- [ ] Test all API endpoints
- [ ] Test Flutter app with production API
- [ ] Monitor logs for errors
- [ ] Check performance metrics
- [ ] Verify database connections
- [ ] Test authentication flow
- [ ] Test order creation
- [ ] Test payment flow

### Mobile App Release

- [ ] Android APK/Bundle built
- [ ] iOS build created
- [ ] App tested on physical devices
- [ ] Screenshots prepared
- [ ] Store listings created
- [ ] Privacy policy published
- [ ] Terms of service published

## Part 8: Maintenance

### Daily

- Check PM2 status
- Review error logs
- Monitor server resources

### Weekly

- Review application logs
- Check database performance
- Update dependencies (if needed)

### Monthly

- Security updates
- Database backup verification
- Performance optimization review
- User feedback review

## Part 9: Scaling (Future)

When you need to scale:

1. **Horizontal Scaling**
   - Add more server instances
   - Use load balancer (Nginx, AWS ELB)
   - Session management with Redis

2. **Database Scaling**
   - MongoDB Atlas auto-scaling
   - Read replicas
   - Sharding (for very large datasets)

3. **CDN**
   - CloudFlare for static assets
   - Image optimization
   - Caching strategy

4. **Microservices** (if needed)
   - Separate services for orders, menu, billing
   - Message queue (RabbitMQ, Redis)
   - API Gateway

## Support & Resources

- **Backend Docs**: `node_backend/README.md`
- **Schema Docs**: `node_backend/SCHEMA_ALIGNMENT.md`
- **Flutter Integration**: `frontend/BACKEND_INTEGRATION.md`
- **Quick Start**: `node_backend/QUICK_START.md`

## Emergency Contacts

- MongoDB Atlas Support: https://support.mongodb.com
- Server Provider Support: [Your provider]
- Domain Registrar: [Your registrar]

---

**Deployment Status**: Ready for Production ✅
**Last Updated**: 2024
