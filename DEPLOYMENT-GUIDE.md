# Deployment Guide - MERN Escrow Application

## 🚀 Production Deployment Checklist

This guide covers deploying both backend and frontend to production environments.

---

## 📋 Pre-Deployment Checklist

### Security
- [ ] All environment variables set
- [ ] API keys secured (not in code)
- [ ] Database credentials secured
- [ ] CORS configured for production domain
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] SQL injection protection enabled
- [ ] XSS protection enabled

### Testing
- [ ] All tests passing (backend & frontend)
- [ ] Integration tests completed
- [ ] E2E tests passed
- [ ] Performance tested
- [ ] Security audit completed

### Configuration
- [ ] Production environment variables set
- [ ] Database migrations ready
- [ ] Build process tested
- [ ] Logging configured
- [ ] Error tracking set up

---

## 🔧 Backend Deployment

### Option 1: Heroku (Recommended for Quick Deploy)

#### 1. Prerequisites
```bash
# Install Heroku CLI
# Download from: https://devcenter.heroku.com/articles/heroku-cli

# Login to Heroku
heroku login
```

#### 2. Create Heroku App
```bash
cd backend

# Create app
heroku create your-escrow-api

# Add MongoDB Atlas add-on (or use existing connection)
heroku addons:create mongolab:sandbox
# OR set your MongoDB URI
heroku config:set MONGODB_URI="your-mongodb-atlas-uri"
```

#### 3. Set Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set PORT=5000
heroku config:set JWT_SECRET="your-secure-jwt-secret"
heroku config:set CLERK_SECRET_KEY="your-clerk-secret-key"
heroku config:set FRONTEND_URL="https://your-frontend-domain.com"
heroku config:set PAYSTACK_SECRET_KEY="your-paystack-secret"
```

#### 4. Create Procfile
```bash
# In backend folder
echo "web: node server.js" > Procfile
```

#### 5. Deploy
```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Deploy backend to Heroku"

# Deploy
git push heroku main

# Or if on different branch
git push heroku your-branch:main

# Check logs
heroku logs --tail
```

#### 6. Scale Dynos
```bash
heroku ps:scale web=1
```

---

### Option 2: Railway

#### 1. Setup
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login
```

#### 2. Deploy
```bash
cd backend

# Initialize project
railway init

# Add environment variables in Railway dashboard
# Deploy
railway up
```

#### 3. Set Variables in Railway Dashboard
- `MONGODB_URI`
- `JWT_SECRET`
- `CLERK_SECRET_KEY`
- `FRONTEND_URL`
- `PAYSTACK_SECRET_KEY`
- `NODE_ENV=production`

---

### Option 3: DigitalOcean App Platform

#### 1. Create App
- Go to DigitalOcean Dashboard
- Click "Create" → "Apps"
- Connect GitHub repository
- Select backend folder

#### 2. Configure Build
```yaml
# App Spec
name: escrow-api
services:
  - name: api
    source_dir: /backend
    build_command: npm install
    run_command: node server.js
    environment_slug: node-js
    envs:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        value: ${MONGODB_URI}
      - key: JWT_SECRET
        value: ${JWT_SECRET}
```

---

### Option 4: AWS EC2 (Full Control)

#### 1. Launch EC2 Instance
- Ubuntu 22.04 LTS
- t2.micro (free tier) or larger
- Configure security groups (ports 22, 80, 443, 5000)

#### 2. SSH and Setup
```bash
# Connect to instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

#### 3. Deploy Application
```bash
# Clone repository
git clone https://github.com/your-username/your-repo.git
cd your-repo/backend

# Install dependencies
npm install --production

# Create .env file
nano .env
# Add your environment variables

# Start with PM2
pm2 start server.js --name escrow-api
pm2 save
pm2 startup
```

#### 4. Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/escrow-api
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/escrow-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. SSL with Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

---

## 🎨 Frontend Deployment

### Option 1: Vercel (Recommended)

#### 1. Install Vercel CLI
```bash
npm i -g vercel
```

#### 2. Deploy
```bash
cd frontend

# Login
vercel login

# Deploy
vercel

# For production
vercel --prod
```

#### 3. Set Environment Variables
In Vercel Dashboard:
- `VITE_API_URL` → Your backend URL
- `VITE_CLERK_PUBLISHABLE_KEY` → Your Clerk key
- `VITE_PAYSTACK_PUBLIC_KEY` → Your Paystack key

#### 4. Configure vercel.json
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

---

### Option 2: Netlify

#### 1. Install Netlify CLI
```bash
npm i -g netlify-cli
```

#### 2. Build and Deploy
```bash
cd frontend

# Build
npm run build

# Login
netlify login

# Deploy
netlify deploy

# For production
netlify deploy --prod
```

#### 3. Configure _redirects
```bash
# In frontend/public/_redirects
/*    /index.html   200
```

#### 4. Set Environment Variables
In Netlify Dashboard → Site Settings → Environment Variables:
- `VITE_API_URL`
- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_PAYSTACK_PUBLIC_KEY`

---

### Option 3: AWS S3 + CloudFront

#### 1. Build
```bash
cd frontend
npm run build
```

#### 2. Create S3 Bucket
- Enable static website hosting
- Set bucket policy for public read
- Upload dist/ folder contents

#### 3. Create CloudFront Distribution
- Origin: S3 bucket
- Default root object: index.html
- Error pages: 404 → /index.html (for SPA routing)

---

## 🔄 CI/CD Setup

### GitHub Actions (Recommended)

#### Backend CI/CD
```yaml
# .github/workflows/backend-deploy.yml
name: Backend CI/CD

on:
  push:
    branches: [ main ]
    paths:
      - 'backend/**'

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: |
        cd backend
        npm ci
    
    - name: Run tests
      run: |
        cd backend
        npm test
      env:
        MONGODB_URI: ${{ secrets.MONGODB_URI_TEST }}
        JWT_SECRET: ${{ secrets.JWT_SECRET }}
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
        heroku_app_name: your-escrow-api
        heroku_email: your-email@example.com
        appdir: backend
```

#### Frontend CI/CD
```yaml
# .github/workflows/frontend-deploy.yml
name: Frontend CI/CD

on:
  push:
    branches: [ main ]
    paths:
      - 'frontend/**'

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: |
        cd frontend
        npm ci
    
    - name: Run tests
      run: |
        cd frontend
        npm test
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: |
        cd frontend
        npm ci
    
    - name: Build
      run: |
        cd frontend
        npm run build
      env:
        VITE_API_URL: ${{ secrets.VITE_API_URL }}
        VITE_CLERK_PUBLISHABLE_KEY: ${{ secrets.VITE_CLERK_PUBLISHABLE_KEY }}
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        working-directory: ./frontend
```

---

## 📊 Monitoring Setup

### 1. Error Tracking - Sentry

#### Backend Setup
```bash
cd backend
npm install @sentry/node
```

```javascript
// server.js
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// Add error handler
app.use(Sentry.Handlers.errorHandler());
```

#### Frontend Setup
```bash
cd frontend
npm install @sentry/react
```

```javascript
// main.jsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

---

### 2. Performance Monitoring - New Relic

```bash
npm install newrelic
```

```javascript
// newrelic.js
exports.config = {
  app_name: ['Escrow API'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  logging: {
    level: 'info'
  }
}

// server.js (first line)
require('newrelic');
```

---

### 3. Uptime Monitoring

**Options:**
- **UptimeRobot** (Free) - https://uptimerobot.com
- **Pingdom** - https://www.pingdom.com
- **Better Uptime** - https://betteruptime.com

Setup monitors for:
- Backend API health endpoint
- Frontend homepage
- Critical API endpoints

---

### 4. Log Management

#### Using Winston (Already implemented)
```javascript
// Ensure logs are sent to external service
const winston = require('winston');
const { Loggly } = require('winston-loggly-bulk');

winston.add(new Loggly({
  token: process.env.LOGGLY_TOKEN,
  subdomain: process.env.LOGGLY_SUBDOMAIN,
  tags: ["Winston-NodeJS"],
  json: true
}));
```

---

## 📈 Performance Optimization

### Backend
- [ ] Enable compression
- [ ] Implement Redis caching
- [ ] Database indexing
- [ ] Connection pooling
- [ ] Load balancing (if needed)

### Frontend
- [ ] Code splitting
- [ ] Lazy loading
- [ ] Image optimization
- [ ] CDN for static assets
- [ ] Service worker for caching

---

## 🔐 Security Hardening

### Backend
```javascript
// Already implemented via helmet middleware
// Add rate limiting per route
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many login attempts'
});

app.post('/api/auth/login', authLimiter, loginController);
```

### Frontend
- [ ] Content Security Policy
- [ ] HTTPS only
- [ ] Secure cookies
- [ ] XSS protection
- [ ] CSRF tokens

---

## 📱 Post-Deployment Testing

### 1. Smoke Tests
```bash
# Test backend health
curl https://your-api.com/health

# Test frontend
curl https://your-app.com
```

### 2. Critical Path Testing
- [ ] User registration
- [ ] User login
- [ ] Transaction creation
- [ ] Payment processing
- [ ] Real-time updates

### 3. Performance Testing
```bash
# Using Apache Bench
ab -n 1000 -c 10 https://your-api.com/api/transactions

# Using autocannon
npx autocannon -c 10 -d 30 https://your-api.com
```

---

## 🚨 Rollback Procedure

### Heroku
```bash
# View releases
heroku releases

# Rollback to previous version
heroku rollback v123
```

### Vercel
```bash
# View deployments
vercel ls

# Promote previous deployment
vercel promote deployment-url
```

---

## 📊 Monitoring Dashboard

Create a dashboard to monitor:
- API response times
- Error rates
- Active users
- Transaction success rate
- Database performance
- Server CPU/Memory usage

**Tools:**
- Grafana + Prometheus
- New Relic Dashboard
- Datadog
- CloudWatch (AWS)

---

## ✅ Final Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Environment variables set
- [ ] Database connected
- [ ] SSL certificates installed
- [ ] CI/CD pipeline working
- [ ] Monitoring configured
- [ ] Error tracking active
- [ ] Logging working
- [ ] Backups configured
- [ ] Documentation updated
- [ ] Team notified
- [ ] Performance baseline established

---

## 🆘 Troubleshooting

### Common Issues

**1. Environment Variables Not Loading**
- Check variable names (case-sensitive)
- Restart application after setting
- Verify in hosting platform dashboard

**2. CORS Errors**
- Update FRONTEND_URL in backend
- Check CORS middleware configuration
- Verify protocol (http vs https)

**3. Database Connection Failed**
- Check MongoDB URI format
- Verify network access in MongoDB Atlas
- Check firewall rules

**4. Build Failures**
- Clear node_modules and reinstall
- Check Node version compatibility
- Review build logs for specific errors

---

## 📞 Support

For deployment issues:
1. Check application logs
2. Review monitoring dashboards
3. Check CI/CD pipeline status
4. Verify environment variables
5. Test locally with production config

---

**🎉 Your application is now ready for production!**
