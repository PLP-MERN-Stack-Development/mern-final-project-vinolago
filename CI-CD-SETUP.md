# CI/CD Pipeline Setup

## 🔄 Continuous Integration & Continuous Deployment

This guide covers setting up automated testing and deployment pipelines.

---

## 📋 Overview

**CI/CD Flow:**
1. Developer pushes code to GitHub
2. CI runs tests automatically
3. On success, deploys to staging
4. Manual approval for production
5. Automated deployment to production

---

## 🚀 GitHub Actions Setup

### Step 1: Create Workflow Files

Create `.github/workflows/` directory in your repository root.

---

## 🔧 Backend CI/CD Pipeline

### File: `.github/workflows/backend-ci-cd.yml`

```yaml
name: Backend CI/CD

on:
  push:
    branches: [ main, develop ]
    paths:
      - 'backend/**'
      - '.github/workflows/backend-ci-cd.yml'
  pull_request:
    branches: [ main ]
    paths:
      - 'backend/**'

env:
  NODE_VERSION: '18.x'

jobs:
  # Job 1: Run Tests
  test:
    name: Test Backend
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Setup Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
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
    
    - name: Run unit tests
      run: |
        cd backend
        npm test
      env:
        NODE_ENV: test
        MONGODB_URI: ${{ secrets.MONGODB_URI_TEST }}
        JWT_SECRET: ${{ secrets.JWT_SECRET_TEST }}
    
    - name: Run integration tests
      run: |
        cd backend
        npm run test:integration
      env:
        NODE_ENV: test
        MONGODB_URI: ${{ secrets.MONGODB_URI_TEST }}
    
    - name: Generate coverage report
      run: |
        cd backend
        npm run test:coverage
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        directory: ./backend/coverage
        flags: backend
        name: backend-coverage
  
  # Job 2: Security Scan
  security:
    name: Security Scan
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Run npm audit
      run: |
        cd backend
        npm audit --audit-level=moderate
      continue-on-error: true
    
    - name: Run Snyk security scan
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      with:
        args: --severity-threshold=high
        command: test
      continue-on-error: true
  
  # Job 3: Build
  build:
    name: Build Backend
    needs: [test]
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
    
    - name: Install dependencies
      run: |
        cd backend
        npm ci --production
    
    - name: Create build artifact
      run: |
        cd backend
        tar -czf backend-build.tar.gz .
    
    - name: Upload artifact
      uses: actions/upload-artifact@v3
      with:
        name: backend-build
        path: backend/backend-build.tar.gz
        retention-days: 7
  
  # Job 4: Deploy to Staging
  deploy-staging:
    name: Deploy to Staging
    needs: [build, security]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    environment:
      name: staging
      url: https://staging-api.your-domain.com
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Deploy to Heroku Staging
      uses: akhileshns/heroku-deploy@v3.12.14
      with:
        heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
        heroku_app_name: escrow-api-staging
        heroku_email: ${{ secrets.HEROKU_EMAIL }}
        appdir: backend
        healthcheck: https://staging-api.your-domain.com/health
        rollbackonhealthcheckfailed: true
    
    - name: Run smoke tests
      run: |
        sleep 30
        curl -f https://staging-api.your-domain.com/health || exit 1
  
  # Job 5: Deploy to Production
  deploy-production:
    name: Deploy to Production
    needs: [build, security]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment:
      name: production
      url: https://api.your-domain.com
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Download artifact
      uses: actions/download-artifact@v3
      with:
        name: backend-build
        path: ./backend
    
    - name: Deploy to Heroku Production
      uses: akhileshns/heroku-deploy@v3.12.14
      with:
        heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
        heroku_app_name: escrow-api-production
        heroku_email: ${{ secrets.HEROKU_EMAIL }}
        appdir: backend
        healthcheck: https://api.your-domain.com/health
        rollbackonhealthcheckfailed: true
    
    - name: Run smoke tests
      run: |
        sleep 30
        curl -f https://api.your-domain.com/health || exit 1
    
    - name: Notify team on Slack
      uses: slackapi/slack-github-action@v1.24.0
      with:
        webhook-url: ${{ secrets.SLACK_WEBHOOK }}
        payload: |
          {
            "text": "✅ Backend deployed to production successfully!",
            "blocks": [
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "*Backend Deployment*\n✅ Successfully deployed to production\n*Commit:* ${{ github.sha }}\n*Author:* ${{ github.actor }}"
                }
              }
            ]
          }
```

---

## 🎨 Frontend CI/CD Pipeline

### File: `.github/workflows/frontend-ci-cd.yml`

```yaml
name: Frontend CI/CD

on:
  push:
    branches: [ main, develop ]
    paths:
      - 'frontend/**'
      - '.github/workflows/frontend-ci-cd.yml'
  pull_request:
    branches: [ main ]
    paths:
      - 'frontend/**'

env:
  NODE_VERSION: '18.x'

jobs:
  # Job 1: Run Tests
  test:
    name: Test Frontend
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
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
    
    - name: Run unit tests
      run: |
        cd frontend
        npm test
    
    - name: Generate coverage report
      run: |
        cd frontend
        npm run test:coverage
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        directory: ./frontend/coverage
        flags: frontend
        name: frontend-coverage
    
    - name: Run E2E tests
      run: |
        cd frontend
        npm run test:e2e
      env:
        CI: true
  
  # Job 2: Build
  build:
    name: Build Frontend
    needs: [test]
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
    
    - name: Install dependencies
      run: |
        cd frontend
        npm ci
    
    - name: Build application
      run: |
        cd frontend
        npm run build
      env:
        VITE_API_URL: ${{ secrets.VITE_API_URL }}
        VITE_CLERK_PUBLISHABLE_KEY: ${{ secrets.VITE_CLERK_PUBLISHABLE_KEY }}
        VITE_PAYSTACK_PUBLIC_KEY: ${{ secrets.VITE_PAYSTACK_PUBLIC_KEY }}
    
    - name: Upload build artifact
      uses: actions/upload-artifact@v3
      with:
        name: frontend-build
        path: frontend/dist
        retention-days: 7
    
    - name: Analyze bundle size
      run: |
        cd frontend
        npm run build -- --stats
      continue-on-error: true
  
  # Job 3: Deploy to Staging
  deploy-staging:
    name: Deploy to Staging
    needs: [build]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    environment:
      name: staging
      url: https://staging.your-domain.com
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Download artifact
      uses: actions/download-artifact@v3
      with:
        name: frontend-build
        path: ./frontend/dist
    
    - name: Deploy to Vercel Staging
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        working-directory: ./frontend
        vercel-args: '--prod --env VITE_API_URL=${{ secrets.VITE_API_URL_STAGING }}'
  
  # Job 4: Deploy to Production
  deploy-production:
    name: Deploy to Production
    needs: [build]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment:
      name: production
      url: https://your-domain.com
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Download artifact
      uses: actions/download-artifact@v3
      with:
        name: frontend-build
        path: ./frontend/dist
    
    - name: Deploy to Vercel Production
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        working-directory: ./frontend
        vercel-args: '--prod'
    
    - name: Run Lighthouse CI
      uses: treosh/lighthouse-ci-action@v10
      with:
        urls: |
          https://your-domain.com
        uploadArtifacts: true
    
    - name: Notify team on Slack
      uses: slackapi/slack-github-action@v1.24.0
      with:
        webhook-url: ${{ secrets.SLACK_WEBHOOK }}
        payload: |
          {
            "text": "✅ Frontend deployed to production successfully!",
            "blocks": [
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "*Frontend Deployment*\n✅ Successfully deployed to production\n*URL:* https://your-domain.com\n*Commit:* ${{ github.sha }}\n*Author:* ${{ github.actor }}"
                }
              }
            ]
          }
```

---

## 🔐 GitHub Secrets Setup

### Required Secrets

Navigate to: **Repository Settings → Secrets and variables → Actions**

#### Backend Secrets:
```
HEROKU_API_KEY=your-heroku-api-key
HEROKU_EMAIL=your-heroku-email
MONGODB_URI_TEST=mongodb://test-db-uri
JWT_SECRET_TEST=test-jwt-secret
SNYK_TOKEN=your-snyk-token
SLACK_WEBHOOK=https://hooks.slack.com/services/xxx
```

#### Frontend Secrets:
```
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
VITE_API_URL=https://api.your-domain.com
VITE_API_URL_STAGING=https://staging-api.your-domain.com
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxx
VITE_PAYSTACK_PUBLIC_KEY=pk_live_xxx
```

---

## 📊 Monitoring & Notifications

### Slack Integration

1. Create Slack Incoming Webhook
2. Add to GitHub Secrets as `SLACK_WEBHOOK`
3. Notifications will be sent on:
   - Deployment success
   - Deployment failure
   - Test failures

### Email Notifications

GitHub Actions automatically sends emails on:
- Workflow failures
- First workflow run
- Re-enabled workflows

---

## 🔍 Code Quality Checks

### Add CodeClimate

```yaml
- name: Test & publish code coverage
  uses: paambaati/codeclimate-action@v5.0.0
  env:
    CC_TEST_REPORTER_ID: ${{ secrets.CC_TEST_REPORTER_ID }}
  with:
    coverageCommand: npm run test:coverage
    coverageLocations: |
      ${{github.workspace}}/backend/coverage/lcov.info:lcov
      ${{github.workspace}}/frontend/coverage/lcov.info:lcov
```

---

## 🚀 Alternative: GitLab CI/CD

### File: `.gitlab-ci.yml`

```yaml
stages:
  - test
  - build
  - deploy

variables:
  NODE_VERSION: "18"

# Backend Tests
backend-test:
  stage: test
  image: node:${NODE_VERSION}
  script:
    - cd backend
    - npm ci
    - npm test
    - npm run test:coverage
  coverage: '/Statements\s*:\s*(\d+\.?\d*)%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: backend/coverage/cobertura-coverage.xml

# Frontend Tests
frontend-test:
  stage: test
  image: node:${NODE_VERSION}
  script:
    - cd frontend
    - npm ci
    - npm test
    - npm run test:coverage
  coverage: '/All files\s*\|\s*(\d+\.?\d*)/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: frontend/coverage/cobertura-coverage.xml

# Build Backend
backend-build:
  stage: build
  image: node:${NODE_VERSION}
  script:
    - cd backend
    - npm ci --production
  artifacts:
    paths:
      - backend/node_modules/
    expire_in: 1 hour
  only:
    - main
    - develop

# Build Frontend
frontend-build:
  stage: build
  image: node:${NODE_VERSION}
  script:
    - cd frontend
    - npm ci
    - npm run build
  artifacts:
    paths:
      - frontend/dist/
    expire_in: 1 hour
  only:
    - main
    - develop

# Deploy Backend to Production
deploy-backend-production:
  stage: deploy
  image: ruby:latest
  script:
    - gem install dpl
    - dpl --provider=heroku --app=escrow-api-production --api-key=$HEROKU_API_KEY
  only:
    - main
  environment:
    name: production
    url: https://api.your-domain.com

# Deploy Frontend to Production
deploy-frontend-production:
  stage: deploy
  image: node:${NODE_VERSION}
  script:
    - npm install -g vercel
    - cd frontend
    - vercel --prod --token=$VERCEL_TOKEN
  only:
    - main
  environment:
    name: production
    url: https://your-domain.com
```

---

## 🎯 Best Practices

### 1. Branch Strategy

**Main Branches:**
- `main` - Production code
- `develop` - Staging/development code
- `feature/*` - Feature branches

**Workflow:**
1. Create feature branch from `develop`
2. Make changes and commit
3. Create PR to `develop`
4. CI runs tests automatically
5. On approval, merge to `develop`
6. Deploy to staging automatically
7. Create PR from `develop` to `main`
8. Deploy to production on merge

### 2. Environment Variables

- Never commit secrets
- Use separate configs for staging/production
- Rotate keys regularly
- Use secret scanning tools

### 3. Testing Strategy

- Run tests on every PR
- Require passing tests before merge
- Include linting in CI
- Run E2E tests before deployment

### 4. Deployment Strategy

- Deploy to staging first
- Run smoke tests after deployment
- Use health checks
- Implement rollback procedures
- Monitor deployments

---

## ✅ CI/CD Checklist

- [ ] GitHub Actions workflows created
- [ ] All secrets configured
- [ ] Branch protection rules set
- [ ] Required status checks enabled
- [ ] Code review required
- [ ] Tests run automatically
- [ ] Deployments automated
- [ ] Monitoring configured
- [ ] Notifications set up
- [ ] Rollback procedure tested

---

## 🐛 Troubleshooting

### Common Issues:

**1. Workflow not triggering**
- Check branch name matches workflow config
- Verify path filters
- Check if Actions enabled in repo settings

**2. Tests failing in CI but passing locally**
- Check environment variables
- Verify Node version matches
- Check for timing issues

**3. Deployment fails**
- Verify deployment secrets
- Check application logs
- Verify build artifacts

**4. Secrets not working**
- Check secret names (case-sensitive)
- Verify they're set at correct level
- Ensure no trailing spaces

---

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitLab CI/CD Docs](https://docs.gitlab.com/ee/ci/)
- [Heroku CI/CD](https://devcenter.heroku.com/articles/github-integration)
- [Vercel Deployment](https://vercel.com/docs/concepts/deployments/overview)

---

**🎉 Your CI/CD pipeline is now ready!**
