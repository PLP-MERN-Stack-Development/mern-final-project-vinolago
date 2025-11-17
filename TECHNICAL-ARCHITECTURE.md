# Technical Architecture - Escrow Application

## 🏗️ System Architecture Overview

This document provides a comprehensive technical overview of the MERN Escrow Application architecture, design decisions, and implementation details.

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Patterns](#architecture-patterns)
4. [Database Design](#database-design)
5. [API Architecture](#api-architecture)
6. [Frontend Architecture](#frontend-architecture)
7. [Authentication & Authorization](#authentication--authorization)
8. [Real-time Communication](#real-time-communication)
9. [Payment Integration](#payment-integration)
10. [Security](#security)
11. [Performance Optimization](#performance-optimization)
12. [Deployment](#deployment)
13. [Monitoring & Logging](#monitoring--logging)
14. [Scalability](#scalability)

---

## 🎯 System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Browser    │  │    Mobile    │  │  Third-party │      │
│  │  (React SPA) │  │   (Future)   │  │     APIs     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                          ↕ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                      Load Balancer / CDN                      │
└─────────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Express.js API Server                    │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐             │   │
│  │  │  Routes  │ │Middleware│ │Controllers│             │   │
│  │  └──────────┘ └──────────┘ └──────────┘             │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │             Socket.IO Server                          │   │
│  │  (Real-time Communication)                            │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────────┐
│                       Data Layer                              │
│  ┌────────────┐  ┌──────────┐  ┌──────────┐                │
│  │  MongoDB   │  │  Redis   │  │   S3     │                │
│  │ (Primary)  │  │ (Cache)  │  │ (Files)  │                │
│  └────────────┘  └──────────┘  └──────────┘                │
└─────────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────────┐
│                   External Services                           │
│  ┌────────────┐  ┌──────────┐  ┌──────────┐                │
│  │   Mpesa    │  │  Clerk   │  │  Sentry  │                │
│  │ (Payments) │  │  (Auth)  │  │ (Errors) │                │
│  └────────────┘  └──────────┘  └──────────┘                │
└─────────────────────────────────────────────────────────────┘
```

### Request Flow

```
1. User Request
   ↓
2. Load Balancer (Cloudflare/AWS ALB)
   ↓
3. API Gateway / Rate Limiter
   ↓
4. Authentication Middleware (JWT validation)
   ↓
5. Authorization Middleware (Role/permission check)
   ↓
6. Request Validation (Input sanitization)
   ↓
7. Controller (Business logic)
   ↓
8. Service Layer (Data operations)
   ↓
9. Database / Cache
   ↓
10. Response (JSON)
```

---

## 🛠️ Technology Stack

### Backend

| Technology             | Version | Purpose                 |
| ---------------------- | ------- | ----------------------- |
| **Node.js**            | 18.x    | Runtime environment     |
| **Express.js**         | 4.18.x  | Web framework           |
| **MongoDB**            | 6.x     | Primary database        |
| **Mongoose**           | 8.x     | ODM for MongoDB         |
| **Socket.IO**          | 4.x     | Real-time communication |
| **JWT**                | 9.x     | Authentication          |
| **Bcrypt**             | 5.x     | Password hashing        |
| **Helmet**             | 7.x     | Security headers        |
| **Express-rate-limit** | 6.x     | Rate limiting           |
| **Winston**            | 3.x     | Logging                 |
| **Joi**                | 17.x    | Validation              |

### Frontend

| Technology           | Version | Purpose           |
| -------------------- | ------- | ----------------- |
| **React**            | 18.x    | UI library        |
| **Vite**             | 5.x     | Build tool        |
| **React Router**     | 6.x     | Routing           |
| **Axios**            | 1.x     | HTTP client       |
| **Socket.IO Client** | 4.x     | Real-time client  |
| **Tailwind CSS**     | 3.x     | Styling           |
| **Framer Motion**    | 11.x    | Animations        |
| **React Hot Toast**  | 2.x     | Notifications     |
| **Clerk**            | 4.x     | Authentication UI |

### DevOps & Tools

| Technology         | Purpose                |
| ------------------ | ---------------------- |
| **Git**            | Version control        |
| **GitHub Actions** | CI/CD                  |
| **Docker**         | Containerization       |
| **Heroku/Railway** | Backend hosting        |
| **Vercel**         | Frontend hosting       |
| **MongoDB Atlas**  | Database hosting       |
| **Sentry**         | Error tracking         |
| **New Relic**      | Performance monitoring |
| **Postman**        | API testing            |

---

## 🏛️ Architecture Patterns

### 1. MVC Pattern (Backend)

```
Model (Data)
   ↓
Controller (Logic)
   ↓
View (Response)
```

**Implementation:**

```javascript
// Model: User.model.js
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

// Controller: user.controller.js
exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ user });
};

// Route: user.routes.js
router.get("/profile", auth, userController.getProfile);
```

### 2. Component-Based Architecture (Frontend)

```
App
├── Pages
│   ├── Dashboard
│   ├── Transactions
│   └── Profile
├── Components
│   ├── Header
│   ├── TransactionCard
│   └── Button
└── Utils
    ├── api.js
    └── helpers.js
```

### 3. RESTful API Design

**Resource-Based URLs:**

```
GET    /api/transactions      - List transactions
POST   /api/transactions      - Create transaction
GET    /api/transactions/:id  - Get transaction
PUT    /api/transactions/:id  - Update transaction
DELETE /api/transactions/:id  - Delete transaction
```

### 4. Middleware Pipeline

```javascript
app.use(helmet()); // Security
app.use(cors()); // CORS
app.use(express.json()); // Body parser
app.use(rateLimiter); // Rate limiting
app.use(auth); // Authentication
app.use(logger); // Logging
```

---

## 🗄️ Database Design

### Schema Design

#### User Schema

```javascript
{
  _id: ObjectId,
  email: String (unique, indexed),
  password: String (hashed),
  firstName: String,
  lastName: String,
  role: Enum['buyer', 'seller', 'admin'],
  wallet: {
    balance: Number,
    currency: String
  },
  profile: {
    phone: String,
    address: String,
    avatar: String
  },
  verification: {
    email: Boolean,
    phone: Boolean,
    kyc: Boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### Transaction Schema

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  amount: Number,
  status: Enum['pending', 'active', 'completed', 'disputed', 'cancelled'],
  buyer: ObjectId (ref: 'User', indexed),
  seller: ObjectId (ref: 'User', indexed),
  payment: {
    method: String,
    reference: String,
    status: String,
    paidAt: Date
  },
  timeline: [{
    status: String,
    timestamp: Date,
    note: String
  }],
  dueDate: Date,
  terms: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### Payment Schema

```javascript
{
  _id: ObjectId,
  transaction: ObjectId (ref: 'Transaction'),
  user: ObjectId (ref: 'User'),
  amount: Number,
  method: String,
  provider: String,
  reference: String (unique, indexed),
  status: Enum['pending', 'success', 'failed'],
  metadata: Object,
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

```javascript
// User indexes
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

// Transaction indexes
transactionSchema.index({ buyer: 1, status: 1 });
transactionSchema.index({ seller: 1, status: 1 });
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ status: 1, dueDate: 1 });

// Payment indexes
paymentSchema.index({ reference: 1 }, { unique: true });
paymentSchema.index({ transaction: 1 });
paymentSchema.index({ user: 1, createdAt: -1 });
```

### Data Relationships

```
User (1) ←──→ (Many) Transaction (as buyer)
User (1) ←──→ (Many) Transaction (as seller)
Transaction (1) ←──→ (Many) Payment
User (1) ←──→ (Many) Notification
Transaction (1) ←──→ (1) Dispute
```

---

## 🔌 API Architecture

### Layered Architecture

```
┌─────────────────────────────────┐
│         Routes Layer            │  (URL mapping)
├─────────────────────────────────┤
│       Middleware Layer          │  (Auth, validation)
├─────────────────────────────────┤
│       Controller Layer          │  (Request handling)
├─────────────────────────────────┤
│       Service Layer             │  (Business logic)
├─────────────────────────────────┤
│         Model Layer             │  (Data access)
└─────────────────────────────────┘
```

### Example Implementation

**Route:**

```javascript
// routes/transaction.routes.js
const router = require("express").Router();
const { auth, validateTransaction } = require("../middleware");
const transactionController = require("../controllers/transaction.controller");

router.post("/", auth, validateTransaction, transactionController.create);
```

**Controller:**

```javascript
// controllers/transaction.controller.js
const transactionService = require("../services/transaction.service");

exports.create = async (req, res, next) => {
  try {
    const transaction = await transactionService.createTransaction(
      req.user.id,
      req.body
    );
    res.status(201).json({ success: true, transaction });
  } catch (error) {
    next(error);
  }
};
```

**Service:**

```javascript
// services/transaction.service.js
const Transaction = require("../models/Transaction");
const notificationService = require("./notification.service");

exports.createTransaction = async (buyerId, data) => {
  // Business logic
  const transaction = await Transaction.create({
    ...data,
    buyer: buyerId,
    status: "pending",
  });

  // Side effects
  await notificationService.notifySellerOfNewTransaction(transaction);

  return transaction;
};
```

### API Response Format

**Success Response:**

```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Error Response:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {...}
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## 🎨 Frontend Architecture

### Component Structure

```
src/
├── pages/
│   ├── Dashboard/
│   │   ├── index.jsx
│   │   ├── Dashboard.module.css
│   │   └── useDashboard.js (custom hook)
│   └── Transactions/
├── components/
│   ├── layout/
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   └── Footer.jsx
│   ├── ui/
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   └── Card.jsx
│   └── features/
│       ├── TransactionCard.jsx
│       └── PaymentModal.jsx
├── context/
│   ├── AuthContext.jsx
│   └── TransactionContext.jsx
├── hooks/
│   ├── useAuth.js
│   └── useTransactions.js
├── services/
│   ├── api.js
│   └── socket.js
├── utils/
│   ├── helpers.js
│   └── validators.js
└── styles/
    └── global.css
```

### State Management

**Context API for Global State:**

```javascript
// context/AuthContext.jsx
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auth functions
  const login = async (credentials) => {...};
  const logout = () => {...};

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Usage
const { user, login } = useAuth();
```

**Local State for Component State:**

```javascript
const [formData, setFormData] = useState({});
const [errors, setErrors] = useState({});
```

### Routing Structure

```javascript
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Layout />}>
      <Route index element={<Home />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="transactions/:id" element={<TransactionDetail />} />
        <Route path="wallet" element={<Wallet />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Route>
  </Routes>
</BrowserRouter>
```

---

## 🔐 Authentication & Authorization

### Flow Diagram

```
1. User enters credentials
   ↓
2. Frontend sends to /api/auth/login
   ↓
3. Backend validates credentials
   ↓
4. Backend generates JWT token
   ↓
5. Frontend stores token (memory + httpOnly cookie)
   ↓
6. Frontend includes token in subsequent requests
   ↓
7. Backend validates token on protected routes
```

### JWT Structure

```javascript
// Token payload
{
  "userId": "user123",
  "email": "user@example.com",
  "role": "buyer",
  "iat": 1642234567,
  "exp": 1642320967
}
```

### Implementation

**Backend Middleware:**

```javascript
const jwt = require("jsonwebtoken");

exports.auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select("-password");

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
};
```

**Frontend API Client:**

```javascript
// services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Logout user
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

---

## ⚡ Real-time Communication

### Socket.IO Architecture

```
┌──────────────┐         ┌──────────────┐
│   Client     │◄───────►│  Socket.IO   │
│  (Browser)   │  Events │   Server     │
└──────────────┘         └──────────────┘
                               ↕
                         ┌──────────────┐
                         │   Redis      │
                         │   (Adapter)  │
                         └──────────────┘
```

### Events

**Server-side:**

```javascript
// socket/index.js
const socketIO = require("socket.io");

function initSocket(server) {
  const io = socketIO(server, {
    cors: { origin: process.env.FRONTEND_URL },
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    // Verify token
    next();
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.userId);

    // Join user's room
    socket.join(`user:${socket.userId}`);

    // Handle events
    socket.on("transaction:update", handleTransactionUpdate);

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  return io;
}
```

**Client-side:**

```javascript
// services/socket.js
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL, {
  auth: {
    token: localStorage.getItem("token"),
  },
});

// Listen for events
socket.on("transaction:created", (transaction) => {
  // Update UI
});

socket.on("notification", (notification) => {
  // Show notification
});
```

---

## 💳 Payment Integration

### Mpesa Integration Flow

```
1. User initiates payment
   ↓
2. Backend calls Mpesa API to generate access token
   ↓
3. Backend calls Mpesa STK Push API
   ↓
4. Mpesa sends STK push to user's phone
   ↓
5. User enters PIN on their phone
   ↓
6. Mpesa processes payment and sends callback
   ↓
7. Backend receives and processes callback
   ↓
8. Backend verifies payment with Mpesa
   ↓
9. Backend updates transaction status
   ↓
10. User receives confirmation
```

### Implementation

```javascript
// services/mpesa.service.js
const axios = require("axios");

// Generate access token
async function getAccessToken() {
  const auth = Buffer.from(
    `${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`
  ).toString("base64");
  const response = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      headers: { Authorization: `Basic ${auth}` },
    }
  );
  return response.data.access_token;
}

// Initiate STK Push
exports.initiateStkPush = async (req, res) => {
  try {
    const { phone, amount, transactionId } = req.body;

    const access_token = await getAccessToken();

    const timestamp = new Date()
      .toISOString()
      .replace(/[-T:\.Z]/g, "")
      .slice(0, 14);
    const password = Buffer.from(
      `${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`
    ).toString("base64");

    const stkRequest = {
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(amount),
      PartyA: phone,
      PartyB: MPESA_SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: MPESA_CALLBACK_URL,
      AccountReference: `Escrow-${transactionId}`,
      TransactionDesc: `Invoice Payment - ${transactionId}`,
    };

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      stkRequest,
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    res.json({
      success: true,
      message: "STK push sent successfully. Enter PIN to complete.",
      MerchantRequestID: response.data.MerchantRequestID,
      CheckoutRequestID: response.data.CheckoutRequestID,
      transactionId: transactionId,
    });
  } catch (err) {
    console.error("STK Push error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to initiate STK push",
      error: err.message,
    });
  }
};

// Environment Variables Required:
// MPESA_CONSUMER_KEY
// MPESA_CONSUMER_SECRET
// MPESA_PASSKEY
// MPESA_SHORTCODE
// MPESA_CALLBACK_URL
```

---

## 🔒 Security

### Security Measures

1. **Input Validation**

   - Joi validation
   - Mongoose schema validation
   - Sanitization against XSS

2. **Authentication**

   - JWT tokens
   - HttpOnly cookies
   - Token expiration
   - Refresh tokens

3. **Authorization**

   - Role-based access control
   - Resource-based permissions
   - Route protection

4. **Data Protection**

   - Password hashing (bcrypt)
   - Encryption at rest
   - HTTPS only
   - CORS configuration

5. **Rate Limiting**

   ```javascript
   const rateLimit = require("express-rate-limit");

   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100, // limit each IP to 100 requests per windowMs
   });

   app.use("/api/", limiter);
   ```

6. **Security Headers**

   ```javascript
   const helmet = require("helmet");
   app.use(helmet());
   ```

7. **SQL Injection Prevention**

   - Mongoose parameterized queries
   - Input sanitization

8. **XSS Prevention**
   - Content Security Policy
   - Input escaping
   - Output encoding

---

## ⚡ Performance Optimization

### Backend

1. **Database Optimization**

   - Proper indexing
   - Query optimization
   - Connection pooling
   - Lean queries

2. **Caching**

   ```javascript
   const redis = require("redis");
   const client = redis.createClient();

   // Cache middleware
   const cache = (duration) => async (req, res, next) => {
     const key = `cache:${req.originalUrl}`;
     const cached = await client.get(key);

     if (cached) {
       return res.json(JSON.parse(cached));
     }

     res.sendResponse = res.json;
     res.json = (body) => {
       client.setex(key, duration, JSON.stringify(body));
       res.sendResponse(body);
     };

     next();
   };
   ```

3. **Compression**
   ```javascript
   const compression = require("compression");
   app.use(compression());
   ```

### Frontend

1. **Code Splitting**

   ```javascript
   const Dashboard = lazy(() => import("./pages/Dashboard"));
   ```

2. **Image Optimization**

   - WebP format
   - Lazy loading
   - Responsive images

3. **Bundle Optimization**
   - Tree shaking
   - Minification
   - Gzip compression

---

## 🚀 Deployment

### Deployment Architecture

```
┌─────────────────────────────────────────┐
│            Cloudflare CDN               │
└─────────────────────────────────────────┘
                  ↕
┌─────────────────────┐   ┌─────────────────────┐
│   Vercel (Frontend) │   │  Render (Backend)   │
│   - Static hosting  │   │  - API server       │
│   - Edge functions  │   │  - Socket.IO        │
└─────────────────────┘   └─────────────────────┘
                               ↕
                      ┌─────────────────────┐
                      │   MongoDB Atlas     │
                      │   - Replica set     │
                      │   - Auto-scaling    │
                      └─────────────────────┘
```

---

## 📊 Monitoring & Logging

### Logging Strategy

```
ERROR → Critical issues requiring immediate attention
WARN  → Potential problems
INFO  → General application flow
DEBUG → Detailed debugging information
```

---

## 📈 Scalability

### Horizontal Scaling

- Multiple backend instances
- Load balancer distribution
- Stateless application design

### Vertical Scaling

- Increase server resources
- Database optimization
- Caching layers

---

**Document Version:** 1.0.0  
**Last Updated:** Nov 2025
