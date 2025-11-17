# MERN Escrow Application 🚀

> A secure, full-stack escrow service application built with MongoDB, Express.js, React, and Node.js

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green)](https://www.mongodb.com/)

## 📖 About The Project

The Escrow Application is a comprehensive full-stack solution that enables secure online transactions between buyers and sellers. Acting as a trusted third party, the platform holds funds in escrow until both parties fulfill their obligations, ensuring safety and transparency in digital commerce.

### ✨ Key Features

- 🔐 **Secure Authentication** - JWT-based auth with Clerk integration
- 💳 **Payment Integration** - M-Pesa STK Push integration
- ⚡ **Real-time Updates** - Socket.IO for instant notifications
- 💰 **Wallet System** - Built-in wallet for fund management
- ⚖️ **Dispute Resolution** - Admin-mediated dispute handling
- 📊 **Transaction Management** - Complete transaction lifecycle tracking
- 🎨 **Modern UI** - Responsive design with Tailwind CSS
- 🔔 **Notifications** - Real-time alerts and email notifications
- 📱 **Mobile Responsive** - Works seamlessly on all devices

### 🎯 Use Cases

- Freelance work payments
- E-commerce transactions
- Service delivery payments
- Digital product sales
- Milestone-based projects

---

## 🖼️ Screenshots

### Dashboard

![Dashboard](docs/images/dashboard.png)

### Transaction Details

![Transaction](docs/images/transaction.png)

### Payment Flow

![Payment](docs/images/payment.png)

---

## 🏗️ Tech Stack

### Frontend

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time communication
- **Framer Motion** - Animation library
- **React Hot Toast** - Toast notifications
- **Clerk** - Authentication UI

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Socket.IO** - Real-time server
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Winston** - Logging
- **Helmet** - Security headers
- **Express Rate Limit** - Rate limiting
- **Joi** - Validation

### DevOps & Tools

- **Git & GitHub** - Version control
- **GitHub Actions** - CI/CD
- **Heroku/Railway** - Backend hosting
- **Vercel** - Frontend hosting
- **MongoDB Atlas** - Database hosting
- **Sentry** - Error tracking
- **Postman** - API testing
- **Jest** - Backend testing
- **Vitest** - Frontend testing
- **Playwright** - E2E testing

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.x or higher)
- **npm** or **yarn**
- **MongoDB** (local or Atlas account)
- **Git**

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/your-username/mern-escrow-application.git
cd mern-escrow-application
```

#### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

**Backend Environment Variables (.env):**

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/escrow-db
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/escrow-db

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this

# Clerk (Authentication)
CLERK_SECRET_KEY=your-clerk-secret-key


# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Sentry (Error Tracking - Optional)
SENTRY_DSN=your-sentry-dsn

# New Relic (Monitoring - Optional)
NEW_RELIC_LICENSE_KEY=your-newrelic-key
```

```bash
# Start development server
npm run dev

# Or start production server
npm start
```

Backend should now be running on `http://localhost:5000`

#### 3. Frontend Setup

```bash
# Navigate to frontend directory (from root)
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

**Frontend Environment Variables (.env):**

```env
# API URL
VITE_API_URL=http://localhost:5000

# Clerk (Authentication)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key

# M-Pesa Configuration
VITE_MPESA_ENVIRONMENT=sandbox
VITE_MPESA_SHORTCODE=your-mpesa-shortcode

# Sentry (Error Tracking - Optional)
VITE_SENTRY_DSN=your-sentry-dsn
```

```bash
# Start development server
npm run dev

# Or build for production
npm run build
npm run preview
```

Frontend should now be running on `http://localhost:5173`

#### 4. Database Setup

**Option A: Local MongoDB**

```bash
# Start MongoDB service
# On macOS
brew services start mongodb-community

# On Linux
sudo systemctl start mongod

# On Windows
net start MongoDB
```

**Option B: MongoDB Atlas (Recommended)**

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Replace `MONGODB_URI` in backend `.env`

---

## 📱 Usage

### User Roles

#### Buyer

1. **Sign up/Login**
2. **Create Transaction** - Specify details and select seller
3. **Fund Escrow** - Pay using M-Pesa STK Push
4. **Monitor Progress** - Track transaction status
5. **Release Payment** - Approve work and release funds

#### Seller

1. **Sign up/Login**
2. **Accept Transaction** - Review and accept buyer's request
3. **Deliver Work** - Complete agreed services/products
4. **Request Payment** - Submit work for approval
5. **Receive Funds** - Get paid to wallet

#### Admin

1. **Monitor Transactions** - View all platform activity
2. **Resolve Disputes** - Mediate between parties
3. **Manage Users** - User administration
4. **View Analytics** - Platform metrics and reports

### Quick Start Guide

**For Buyers:**

```
1. Register → 2. Create Transaction → 3. Fund Escrow → 4. Approve Work
```

**For Sellers:**

```
1. Register → 2. Accept Transaction → 3. Deliver Work → 4. Get Paid
```

---

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- user.model.test.js
```

### Frontend Tests

```bash
cd frontend

# Run unit tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

### Test Coverage

- Backend: 85% coverage
- Frontend: 70% coverage
- E2E: Critical user flows covered

---

## 📚 API Documentation

Comprehensive API documentation is available at:

- **Local**: `http://localhost:5000/api-docs`
- **Production**: `https://api.your-domain.com/api-docs`
- **Documentation File**: [API-DOCUMENTATION.md](./API-DOCUMENTATION.md)

### Quick API Reference

**Authentication:**

```
POST   /api/auth/register     - Register new user
POST   /api/auth/login        - Login user
GET    /api/auth/verify       - Verify token
```

**Transactions:**

```
GET    /api/transactions      - List transactions
POST   /api/transactions      - Create transaction
GET    /api/transactions/:id  - Get transaction
PUT    /api/transactions/:id  - Update transaction
DELETE /api/transactions/:id  - Delete transaction
```

**Payments:**

```
POST   /api/payments/initialize  - Initialize payment
GET    /api/payments/verify/:ref - Verify payment
GET    /api/payments/history     - Payment history
```

---

## 🚀 Deployment (Vercel + Render)

This application is configured for deployment on **Vercel** (frontend) and **Render** (backend) for optimal performance and reliability.

### 🏗️ Architecture

```
┌─────────────────┐    HTTP/HTTPS    ┌─────────────────┐
│     Vercel      │ ◄──────────────► │     Render      │
│   (Frontend)    │   API Calls      │   (Backend)     │
│   Static Site   │                  │   API Server    │
└─────────────────┘                  └─────────────────┘
```

### 🎯 Deployment Strategy

- **Frontend**: Deploy React app on Vercel (optimized for static sites)
- **Backend**: Deploy Node.js API on Render (optimized for servers)
- **Database**: MongoDB Atlas (cloud-hosted)
- **Environment**: Production-ready with proper CORS and environment variables

---

### ⚡ Quick Deploy

#### 1. Backend Deployment (Render)

**Step 1: Create Render Account**

1. Go to [render.com](https://render.com)
2. Sign up with GitHub/Google
3. Connect your repository

**Step 2: Create Backend Service**

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure settings:

```
Build Command: cd backend && npm install
Start Command: npm start
```

**Step 3: Environment Variables (Render)**
Add these in Render dashboard:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/escrow-app
JWT_SECRET=your-super-secret-jwt-key-change-this
CLERK_SECRET_KEY=your-clerk-secret-key
ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
```

**Step 4: Deploy**

- Click **"Create Web Service"**
- Wait for deployment to complete
- Note your Render URL: `https://your-app-name.onrender.com`

#### 2. Frontend Deployment (Vercel)

**Step 1: Create Vercel Account**

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Import your repository

**Step 2: Configure Frontend Build**

- Framework: **Vite**
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

**Step 3: Environment Variables (Vercel)**
Add in Vercel dashboard → Settings → Environment Variables:

```env
VITE_API_URL=https://your-render-backend-url.onrender.com
VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_clerk_publishable_key
VITE_MPESA_ENVIRONMENT=production
```

**Step 4: Deploy**

- Click **"Deploy"**
- Your app will be live at: `https://your-project-name.vercel.app`

---

### 🔧 Manual Deployment (CLI)

#### Backend (Render)

```bash
# Install Render CLI
npm install -g @render/cli

# Login
render login

# Create service
render create service --name escrow-api --type web --plan free --env node

# Set environment variables
render config:set NODE_ENV=production
render config:set MONGODB_URI="your-mongodb-uri"
render config:set JWT_SECRET="your-jwt-secret"

# Deploy
render deploy
```

#### Frontend (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy frontend
cd frontend
vercel

# Set environment variables
vercel env add VITE_API_URL production
# Enter: https://your-render-backend-url.onrender.com

# Deploy to production
vercel --prod
```

---

### 🌐 Environment Configuration

#### Backend (.env) - Render

```env
# Production Environment
NODE_ENV=production
PORT=5000

# Database (MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/escrow-app

# Authentication (Clerk)
CLERK_SECRET_KEY=sk_live_your_clerk_secret_key

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this

# CORS Configuration
ALLOWED_ORIGINS=https://your-frontend-vercel-url.vercel.app

# M-Pesa Configuration
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_SHORTCODE=your_mpesa_shortcode
MPESA_PASSKEY=your_mpesa_passkey
```

#### Frontend (.env) - Vercel

```env
# Production Environment
VITE_API_URL=https://your-render-backend-url.onrender.com

# Authentication (Clerk)
VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_clerk_publishable_key

# M-Pesa Configuration (Frontend)
VITE_MPESA_ENVIRONMENT=production
VITE_MPESA_SHORTCODE=your_mpesa_shortcode

# Analytics (Optional)
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
```

---

### 🔍 Testing Deployment

#### Health Checks

- **Backend**: `GET https://your-render-url.onrender.com/health`
- **Frontend**: `GET https://your-vercel-url.vercel.app`

#### API Endpoints

- **Root**: `GET https://your-render-url.onrender.com/`
- **Docs**: `GET https://your-render-url.onrender.com/api/docs`
- **Health**: `GET https://your-render-url.onrender.com/api/health`

#### Common Issues & Solutions

**CORS Errors:**

- Ensure `ALLOWED_ORIGINS` in backend includes your Vercel URL
- Check `VITE_API_URL` matches your Render URL exactly

**Build Failures:**

- Verify Node.js version compatibility (18.x recommended)
- Check all environment variables are set

**Database Connection:**

- Ensure MongoDB Atlas IP whitelist includes Render IPs
- Use connection string with username/password

---

### 📊 Monitoring & Logs

#### Render Logs

```bash
# View logs
render logs -f <service-id>

# Or in dashboard: Services → Your Service → Logs
```

#### Vercel Logs

```bash
# View function logs
vercel logs

# Or in dashboard: Deployments → Function Logs
```

#### Health Monitoring

Set up monitoring for:

- Backend health endpoint
- Database connectivity
- Frontend availability
- API response times

---

**Detailed deployment guides:**

- [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)
- [CI-CD-SETUP.md](./CI-CD-SETUP.md)

---

## 📊 Project Structure

```
mern-escrow-application/
├── backend/
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   ├── tests/            # Test files
│   ├── logs/             # Log files
│   ├── .env.example      # Environment variables template
│   ├── server.js         # Entry point
│   └── package.json
│
├── frontend/
│   ├── public/           # Static files
│   ├── src/
│   │   ├── api/          # API services
│   │   ├── assets/       # Images, fonts, etc.
│   │   ├── components/   # React components
│   │   ├── context/      # Context providers
│   │   ├── hooks/        # Custom hooks
│   │   ├── pages/        # Page components
│   │   ├── styles/       # Global styles
│   │   ├── ui/           # UI components
│   │   ├── utils/        # Utility functions
│   │   ├── App.jsx       # Root component
│   │   └── main.jsx      # Entry point
│   ├── tests/            # Test files
│   ├── .env.example      # Environment variables template
│   ├── vite.config.js    # Vite configuration
│   └── package.json
│
├── docs/                 # Documentation
│   ├── API-DOCUMENTATION.md
│   ├── USER-GUIDE.md
│   ├── TECHNICAL-ARCHITECTURE.md
│   └── images/
│
├── .github/
│   └── workflows/        # CI/CD workflows
│
├── README.md             # This file
├── DEPLOYMENT-GUIDE.md   # Deployment instructions
├── CI-CD-SETUP.md        # CI/CD setup guide
├── PRESENTATION-GUIDE.md # Presentation template
└── LICENSE               # MIT License
```

---

## 🔐 Security

### Security Measures Implemented

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Input validation and sanitization
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ CSRF protection
- ✅ Rate limiting
- ✅ Helmet security headers
- ✅ CORS configuration
- ✅ HTTPS enforcement
- ✅ Secure session management

### Reporting Security Issues

If you discover a security vulnerability, please email:
**security@your-domain.com**

Do not open public issues for security concerns.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the Project**
2. **Create Feature Branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit Changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to Branch** (`git push origin feature/AmazingFeature`)
5. **Open Pull Request**

### Contribution Guidelines

- Follow existing code style
- Write tests for new features
- Update documentation
- Ensure all tests pass
- Keep commits atomic and well-described

---

## 🐛 Bug Reports

Found a bug? Please open an issue with:

- Bug description
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment details

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team / Author

**Your Name**

- GitHub: [@your-username](https://github.com/your-username)
- LinkedIn: [your-profile](https://linkedin.com/in/your-profile)
- Email: your-email@example.com

---

## 🙏 Acknowledgments

- [Node.js](https://nodejs.org/)
- [React](https://reactjs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Express.js](https://expressjs.com/)
- [Clerk](https://clerk.com/)
- [M-Pesa (Safaricom)](https://developer.safaricom.co.ke/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Socket.IO](https://socket.io/)

---

## 📞 Support

For support and questions:

- 📧 Email: support@your-domain.com
- 💬 Discord: [Join our server](https://discord.gg/your-server)
- 📖 Documentation: [docs.your-domain.com](https://docs.your-domain.com)
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/repo/issues)

---

## 🔗 Links

- **Live Demo**: [https://your-domain.com](https://your-domain.com)
- **API**: [https://api.your-domain.com](https://api.your-domain.com)
- **Documentation**: [Full Documentation](./docs/)
- **Status**: [https://status.your-domain.com](https://status.your-domain.com)

---

## 📈 Project Status

- ✅ **Backend**: Completed
- ✅ **Frontend**: Completed
- ✅ **Testing**: 85% Coverage
- ✅ **Documentation**: Completed
- ✅ **Deployment**: Completed
- 🔄 **Mobile App**: In Progress
- 📅 **API v2**: Planned

---
