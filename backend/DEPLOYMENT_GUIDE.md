# 🚀 Lifeline Backend Deployment Guide

This guide outlines the steps to deploy the Lifeline backend to a production environment.

## 📋 Prerequisites

- **Node.js**: v18 or higher
- **PostgreSQL**: v14 or higher (Managed service recommended)
- **Redis**: v6 or higher (Managed service recommended)
- **Domain Name**: For SSL/HTTPS
- **Process Manager**: PM2 (recommended) or Docker

## 🛠️ Option 1: Docker Deployment (Recommended)

### 1. Build the Image
```bash
docker build -t lifeline-backend:latest .
```

### 2. Run the Container
```bash
docker run -d \
  --name lifeline-backend \
  -p 3000:3000 \
  --env-file .env.production \
  lifeline-backend:latest
```

### 3. Docker Compose (Production)
Create a `docker-compose.prod.yml`:
```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    env_file: .env.production
    restart: always
    depends_on:
      - redis
      # - db (If hosting DB in docker, otherwise remove)

  redis:
    image: redis:alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: always

volumes:
  redis_data:
```

---

## 🛠️ Option 2: VPS / Manual Deployment (Ubuntu/Debian)

### 1. Prepare the Server
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2
```

### 2. Clone & Install
```bash
git clone https://github.com/Jay11KE/Lifeline.git
cd Lifeline/backend

# Install dependencies
npm ci --only=production
npm install typescript -g  # Needed for build
npm install  # Install dev deps to build
```

### 3. Build the Application
```bash
npm run build
# This creates the /dist directory
```

### 4. Configure Environment
Copy the production env example and fill it in:
```bash
cp .env.production.example .env
nano .env
```

### 5. Database Migration
Run migrations against the production database:
```bash
npx prisma migrate deploy
```

### 6. Start with PM2
```bash
pm2 start dist/server.js --name "lifeline-api"
pm2 save
pm2 startup
```

---

## 🔒 Security Checklist

1. **HTTPS**: Use Nginx as a reverse proxy with Let's Encrypt.
   ```nginx
   server {
       server_name api.lifeline.com;
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

2. **Firewall**:
   - Allow SSH (22)
   - Allow HTTP (80)
   - Allow HTTPS (443)
   - Block port 3000 (only accessible via Nginx)

3. **Database**:
   - Ensure DB is not accessible from the public internet (use VPC or firewall rules).

---

## 📈 Monitoring & Maintenance

### Logs
```bash
# View logs with PM2
pm2 logs lifeline-api

# View logs with Docker
docker logs -f lifeline-backend
```

### Updates
To update the application:
1. `git pull`
2. `npm install`
3. `npm run build`
4. `npx prisma migrate deploy` (if schema changed)
5. `pm2 restart lifeline-api`

### Backups
Ensure the automated backup cron job is running correctly. Check `backups/` directory or configure off-site backups to S3.

## 🆘 Troubleshooting

- **502 Bad Gateway**: Check if Node.js process is running (`pm2 status`).
- **Database Connection Error**: Verify `DATABASE_URL` and firewall rules.
- **Redis Error**: Verify Redis password and host.
