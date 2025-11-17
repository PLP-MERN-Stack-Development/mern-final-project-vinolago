# CI/CD Pipeline Setup

## 🔄 Continuous Integration & Continuous Deployment

This guide covers setting up automated testing and deployment pipelines for our MERN escrow application.

---

## 📋 Current Project Status

**✅ Deployment Architecture:**

- **Frontend**: Vercel (static site deployment)
- **Backend**: Render (API server hosting)
- **Database**: MongoDB Atlas (cloud database)
- **Payments**: M-Pesa STK Push integration

**❌ CI/CD Status:**

- No GitHub Actions workflows currently implemented
- Manual deployment process currently used
- Automated testing not yet configured

---

## 🎯 Recommended CI/CD Approach

### Option 1: GitHub Actions (Recommended)

This project is well-suited for GitHub Actions with Vercel + Render deployment.

### Option 2: Platform-Native CI/CD

- **Vercel**: Automatic deployment from GitHub (easiest for frontend)
- **Render**: Automatic deployment from GitHub (easiest for backend)

---

## 🚀 Simple CI/CD Setup (Platform Native)

### Frontend (Vercel) - Automatic

1. **Connect to Vercel:**

   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Select `frontend` directory as root
   - Set build command: `npm run build`
   - Set output directory: `dist`

2. **Environment Variables in Vercel:**

   ```
   VITE_API_URL=https://your-render-backend-url.onrender.com
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
   VITE_MPESA_ENVIRONMENT=production
   ```

3. **Automatic Deployment:**
   - Every push to `main` triggers production deployment
   - Every push to other branches creates preview deployments

### Backend (Render) - Automatic

1. **Connect to Render:**

   - Go to [render.com](https://render.com)
   - Create new Web Service
   - Connect your GitHub repository
   - Set root directory: `backend`

2. **Build Settings:**

   ```
   Build Command: npm install
   Start Command: npm start
   ```

3. **Environment Variables in Render:**
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_jwt_secret
   CLERK_SECRET_KEY=your_clerk_secret
   MPESA_CONSUMER_KEY=your_mpesa_key
   MPESA_CONSUMER_SECRET=your_mpesa_secret
   ALLOWED_ORIGINS=https://your-vercel-url.vercel.app
   ```

---

## 🔧 GitHub Actions Setup (Advanced)

### Prerequisites

1. **Repository Structure Check:**

   ```bash
   # Ensure your repo has:
   ├── frontend/
   │   ├── package.json
   │   └── vite.config.js
   ├── backend/
   │   ├── package.json
   │   └── server.js
   ├── .env.example
   └── README.md
   ```

2. **Test Scripts Check:**

   ```json
   // backend/package.json should have:
   {
     "scripts": {
       "test": "jest",
       "test:coverage": "jest --coverage"
     }
   }

   // frontend/package.json should have:
   {
     "scripts": {
       "test": "vitest",
       "test:coverage": "vitest --coverage"
     }
   }
   ```

### Step 1: Create Workflow Directory

```bash
mkdir -p .github/workflows
```

### Step 2: Frontend CI/CD Workflow

Create `.github/workflows/frontend-ci-cd.yml`:

```yaml
name: Frontend CI/CD

on:
  push:
    branches: [main, develop]
    paths:
      - "frontend/**"
      - ".github/workflows/frontend-ci-cd.yml"
  pull_request:
    branches: [main]
    paths:
      - "frontend/**"

jobs:
  test-and-build:
    name: Test & Build Frontend
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: |
          cd frontend
          npm ci

      - name: Run linter
        run: |
          cd frontend
          npm run lint
        continue-on-error: true

      - name: Run tests
        run: |
          cd frontend
          npm test
        env:
          CI: true

      - name: Generate coverage
        run: |
          cd frontend
          npm run test:coverage

      - name: Build application
        run: |
          cd frontend
          npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
          VITE_CLERK_PUBLISHABLE_KEY: ${{ secrets.VITE_CLERK_PUBLISHABLE_KEY }}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: frontend-build
          path: frontend/dist
          retention-days: 7
```

### Step 3: Backend CI/CD Workflow

Create `.github/workflows/backend-ci-cd.yml`:

```yaml
name: Backend CI/CD

on:
  push:
    branches: [main, develop]
    paths:
      - "backend/**"
      - ".github/workflows/backend-ci-cd.yml"
  pull_request:
    branches: [main]
    paths:
      - "backend/**"

jobs:
  test:
    name: Test Backend
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        run: |
          cd backend
          npm ci

      - name: Run linter
        run: |
          cd backend
          npm run lint
        continue-on-error: true

      - name: Run tests
        run: |
          cd backend
          npm test
        env:
          NODE_ENV: test
          MONGODB_URI: ${{ secrets.MONGODB_URI_TEST }}
          JWT_SECRET: ${{ secrets.JWT_SECRET_TEST }}

      - name: Generate coverage
        run: |
          cd backend
          npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          directory: ./backend/coverage
```

### Step 4: Deployment Workflow (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Application

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    name: Deploy Frontend to Vercel
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./frontend
          vercel-args: "--prod"
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
          VITE_CLERK_PUBLISHABLE_KEY: ${{ secrets.VITE_CLERK_PUBLISHABLE_KEY }}
```

---

## 🔐 GitHub Secrets Setup

### Required Secrets

Navigate to: **Repository Settings → Secrets and variables → Actions**

#### Frontend Secrets:

```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
VITE_API_URL=https://your-backend.onrender.com
VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_clerk_key
```

#### Backend Secrets:

```
MONGODB_URI_TEST=mongodb+srv://test_user:test_pass@test_cluster/test_db
JWT_SECRET_TEST=test_jwt_secret_for_ci
```

#### Getting Secrets:

**Vercel:**

1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Create new token
3. Get Org ID and Project ID from dashboard

**Test Database:**

1. Create separate MongoDB Atlas cluster for testing
2. Get connection string without sensitive data

---

## 📊 Testing Strategy

### Frontend Tests

- Unit tests with Vitest
- Component tests with Testing Library
- E2E tests with Playwright (optional)

### Backend Tests

- Unit tests with Jest
- Integration tests for API endpoints
- Database tests with test database

### Test Commands

```bash
# Frontend
cd frontend && npm test
cd frontend && npm run test:coverage
cd frontend && npm run test:e2e

# Backend
cd backend && npm test
cd backend && npm run test:coverage
```

---

## 🎯 Recommended Branch Strategy

```
main                 # Production code
├── develop          # Integration branch
    ├── feature/xxx  # Feature branches
    └── hotfix/xxx   # Hotfix branches
```

**Workflow:**

1. Create feature branch from `develop`
2. Make changes and push
3. Create PR to `develop`
4. CI runs tests automatically
5. Merge to `develop` after review
6. Create PR from `develop` to `main` for production
7. Deploy to production on merge to `main`

---

## 🛠️ Quick Setup Guide

### For Immediate CI/CD Setup:

1. **Frontend (Vercel):**

   - Connect GitHub repo to Vercel
   - Set root directory to `frontend`
   - Add environment variables
   - Deploy automatically on push

2. **Backend (Render):**

   - Connect GitHub repo to Render
   - Set root directory to `backend`
   - Add environment variables
   - Deploy automatically on push

3. **Tests:**

   ```bash
   # Add test scripts to package.json files
   # Ensure tests pass locally before setting up CI
   ```

4. **Optional GitHub Actions:**
   - Create workflow files
   - Add secrets to GitHub
   - Enable Actions in repository

---

## ✅ CI/CD Checklist

### Immediate Setup:

- [ ] Connect frontend to Vercel
- [ ] Connect backend to Render
- [ ] Add environment variables to both platforms
- [ ] Test manual deployments

### Advanced Setup:

- [ ] Create GitHub Actions workflows
- [ ] Add test scripts to package.json
- [ ] Configure GitHub secrets
- [ ] Set up branch protection rules
- [ ] Configure required status checks
- [ ] Add code coverage reporting

---

## 🐛 Troubleshooting

### Common Issues:

**1. Build Failures:**

```bash
# Check Node.js version compatibility
node --version  # Should be 18.x or higher

# Check package.json scripts
npm run build   # Test locally first
```

**2. Environment Variables:**

```bash
# Verify all required env vars are set
echo $VITE_API_URL
echo $MONGODB_URI
```

**3. Test Failures:**

```bash
# Run tests locally first
npm test
npm run test:coverage
```

**4. Deployment Issues:**

- Check platform-specific logs
- Verify environment variables
- Test build process locally

---

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Render Deployment Guide](https://render.com/docs)
- [MongoDB Atlas Connection Guide](https://docs.atlas.mongodb.com/)

---

## 🚀 Current Status

**This project currently uses manual deployment.**

To set up automated CI/CD:

1. Start with platform-native deployment (Vercel + Render)
2. Add GitHub Actions for testing and advanced workflows
3. Implement branch protection and required checks
4. Set up monitoring and notifications

**Next Steps:**

1. Follow the Quick Setup Guide above
2. Test deployments manually first
3. Add automated testing
4. Configure GitHub Actions workflows

---

**🎉 Ready to automate your deployments!**
