# API Documentation - Escrow Application

## 📚 API Reference

Base URL: `https://api.your-domain.com` (Production)  
Base URL: `http://localhost:5000` (Development)

---

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## 📋 Table of Contents

1. [Authentication](#authentication-endpoints)
2. [Users](#user-endpoints)
3. [Transactions](#transaction-endpoints)
4. [Payments](#payment-endpoints)
5. [Notifications](#notification-endpoints)
6. [Admin](#admin-endpoints)
7. [Health & Monitoring](#health-endpoints)

---

## 🔑 Authentication Endpoints

### Register User
Creates a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "buyer"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "buyer"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `400` - Validation error
- `409` - Email already exists

---

### Login
Authenticates a user and returns JWT token.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "buyer"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `401` - Invalid credentials
- `404` - User not found

---

### Verify Token
Validates JWT token and returns user info.

**Endpoint:** `GET /api/auth/verify`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

**Errors:**
- `401` - Invalid or expired token

---

## 👤 User Endpoints

### Get User Profile
Retrieves the authenticated user's profile.

**Endpoint:** `GET /api/users/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "buyer",
    "wallet": {
      "balance": 5000.00,
      "currency": "NGN"
    },
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### Update User Profile
Updates user profile information.

**Endpoint:** `PUT /api/users/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+2348012345678",
  "address": "123 Main St, Lagos"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": "user123",
    "firstName": "John",
    "lastName": "Smith",
    "phone": "+2348012345678",
    "address": "123 Main St, Lagos"
  }
}
```

---

### Get Wallet Balance
Retrieves user's wallet balance.

**Endpoint:** `GET /api/users/wallet`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "wallet": {
    "balance": 5000.00,
    "currency": "NGN",
    "transactions": [
      {
        "id": "txn123",
        "type": "credit",
        "amount": 10000.00,
        "description": "Wallet funding",
        "date": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

---

## 💼 Transaction Endpoints

### Create Transaction
Creates a new escrow transaction.

**Endpoint:** `POST /api/transactions`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Website Development",
  "description": "Full-stack web application",
  "amount": 50000.00,
  "sellerId": "seller123",
  "dueDate": "2024-02-15",
  "terms": "Payment upon project completion and approval"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Transaction created successfully",
  "transaction": {
    "id": "txn123",
    "title": "Website Development",
    "description": "Full-stack web application",
    "amount": 50000.00,
    "status": "pending",
    "buyerId": "buyer123",
    "sellerId": "seller123",
    "dueDate": "2024-02-15",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Errors:**
- `400` - Validation error
- `401` - Unauthorized
- `404` - Seller not found

---

### Get All Transactions
Retrieves all transactions for authenticated user.

**Endpoint:** `GET /api/transactions`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` - Filter by status (pending, active, completed, disputed, cancelled)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `sort` - Sort order (newest, oldest, amount_high, amount_low)

**Example:** `GET /api/transactions?status=active&page=1&limit=10`

**Response:** `200 OK`
```json
{
  "success": true,
  "transactions": [
    {
      "id": "txn123",
      "title": "Website Development",
      "amount": 50000.00,
      "status": "active",
      "buyer": {
        "id": "buyer123",
        "name": "John Doe"
      },
      "seller": {
        "id": "seller123",
        "name": "Jane Smith"
      },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

---

### Get Transaction Details
Retrieves a specific transaction by ID.

**Endpoint:** `GET /api/transactions/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "transaction": {
    "id": "txn123",
    "title": "Website Development",
    "description": "Full-stack web application",
    "amount": 50000.00,
    "status": "active",
    "buyer": {
      "id": "buyer123",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "seller": {
      "id": "seller123",
      "name": "Jane Smith",
      "email": "jane@example.com"
    },
    "dueDate": "2024-02-15",
    "terms": "Payment upon project completion and approval",
    "timeline": [
      {
        "status": "created",
        "timestamp": "2024-01-15T10:30:00Z",
        "note": "Transaction created"
      },
      {
        "status": "funded",
        "timestamp": "2024-01-15T11:00:00Z",
        "note": "Buyer funded escrow"
      }
    ],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

**Errors:**
- `404` - Transaction not found
- `403` - Not authorized to view this transaction

---

### Update Transaction Status
Updates the status of a transaction.

**Endpoint:** `PUT /api/transactions/:id/status`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "completed",
  "note": "Work completed and approved"
}
```

**Allowed Status Transitions:**
- `pending` → `active` (by buyer after funding)
- `active` → `completed` (by buyer after approval)
- `active` → `disputed` (by buyer or seller)
- `disputed` → `completed` or `cancelled` (by admin)
- Any → `cancelled` (by buyer before funding)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Transaction status updated",
  "transaction": {
    "id": "txn123",
    "status": "completed",
    "updatedAt": "2024-02-15T14:30:00Z"
  }
}
```

**Errors:**
- `400` - Invalid status transition
- `403` - Not authorized to update status
- `404` - Transaction not found

---

### Delete Transaction
Deletes a transaction (only pending transactions).

**Endpoint:** `DELETE /api/transactions/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Transaction deleted successfully"
}
```

**Errors:**
- `400` - Cannot delete non-pending transaction
- `403` - Not authorized to delete
- `404` - Transaction not found

---

## 💳 Payment Endpoints

### Initialize Payment
Initializes a payment for funding escrow.

**Endpoint:** `POST /api/payments/initialize`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "transactionId": "txn123",
  "amount": 50000.00,
  "paymentMethod": "paystack"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Payment initialized",
  "payment": {
    "id": "pay123",
    "transactionId": "txn123",
    "amount": 50000.00,
    "status": "pending",
    "paymentUrl": "https://checkout.paystack.com/xxx",
    "reference": "ref_xxx"
  }
}
```

---

### Verify Payment
Verifies payment after Paystack redirect.

**Endpoint:** `GET /api/payments/verify/:reference`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "payment": {
    "id": "pay123",
    "status": "success",
    "amount": 50000.00,
    "transactionId": "txn123"
  }
}
```

**Errors:**
- `400` - Payment verification failed
- `404` - Payment not found

---

### Get Payment History
Retrieves user's payment history.

**Endpoint:** `GET /api/payments/history`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Response:** `200 OK`
```json
{
  "success": true,
  "payments": [
    {
      "id": "pay123",
      "amount": 50000.00,
      "status": "success",
      "transactionId": "txn123",
      "transactionTitle": "Website Development",
      "date": "2024-01-15T11:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 25
  }
}
```

---

## 🔔 Notification Endpoints

### Get Notifications
Retrieves user's notifications.

**Endpoint:** `GET /api/notifications`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `unread` - Filter unread only (true/false)
- `page` - Page number
- `limit` - Items per page

**Response:** `200 OK`
```json
{
  "success": true,
  "notifications": [
    {
      "id": "notif123",
      "title": "Transaction Created",
      "message": "New transaction 'Website Development' created",
      "type": "transaction",
      "read": false,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "unreadCount": 5
}
```

---

### Mark as Read
Marks a notification as read.

**Endpoint:** `PUT /api/notifications/:id/read`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

## 👨‍💼 Admin Endpoints

### Get All Users
Retrieves all users (admin only).

**Endpoint:** `GET /api/admin/users`

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Query Parameters:**
- `role` - Filter by role (buyer, seller, admin)
- `page` - Page number
- `limit` - Items per page

**Response:** `200 OK`
```json
{
  "success": true,
  "users": [
    {
      "id": "user123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "buyer",
      "status": "active",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100
  }
}
```

---

### Resolve Dispute
Resolves a disputed transaction (admin only).

**Endpoint:** `POST /api/admin/disputes/:transactionId/resolve`

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "resolution": "completed",
  "note": "Dispute resolved in favor of buyer",
  "refundPercentage": 100
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Dispute resolved successfully",
  "transaction": {
    "id": "txn123",
    "status": "completed",
    "resolution": "Dispute resolved in favor of buyer"
  }
}
```

---

## 🏥 Health Endpoints

### Health Check
Checks if API is running.

**Endpoint:** `GET /health`

**Response:** `200 OK`
```json
{
  "status": "OK",
  "uptime": 123456,
  "timestamp": 1642234567890,
  "checks": {
    "database": "OK",
    "memory": {
      "rss": "150MB",
      "heapUsed": "75MB",
      "status": "OK"
    }
  }
}
```

---

### Readiness Check
Checks if API is ready to accept requests.

**Endpoint:** `GET /ready`

**Response:** `200 OK`
```json
{
  "status": "ready"
}
```

---

## 🔌 WebSocket Events

### Connect
```javascript
const socket = io('https://api.your-domain.com', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Events

#### `transaction:created`
Emitted when a new transaction is created.

**Payload:**
```json
{
  "transactionId": "txn123",
  "title": "Website Development",
  "amount": 50000.00,
  "buyerId": "buyer123",
  "sellerId": "seller123"
}
```

#### `transaction:updated`
Emitted when a transaction status changes.

**Payload:**
```json
{
  "transactionId": "txn123",
  "status": "completed",
  "updatedAt": "2024-02-15T14:30:00Z"
}
```

#### `payment:success`
Emitted when a payment is successful.

**Payload:**
```json
{
  "paymentId": "pay123",
  "transactionId": "txn123",
  "amount": 50000.00
}
```

#### `notification`
Emitted for new notifications.

**Payload:**
```json
{
  "id": "notif123",
  "title": "Transaction Completed",
  "message": "Transaction 'Website Development' completed",
  "type": "transaction"
}
```

---

## ⚠️ Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error message here",
  "error": "ERROR_CODE",
  "details": {}
}
```

### Common Error Codes:

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMIT` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |

---

## 🔒 Rate Limiting

**Limits:**
- Authentication endpoints: 5 requests per 15 minutes
- API endpoints: 100 requests per 15 minutes
- Payment endpoints: 10 requests per minute

**Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642234567890
```

---

## 📝 Pagination

All list endpoints support pagination:

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100,
    "itemsPerPage": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## 🧪 Testing

Use these test credentials in development:

**Buyer Account:**
```
Email: buyer@test.com
Password: Test123!
```

**Seller Account:**
```
Email: seller@test.com
Password: Test123!
```

**Test Card (Paystack):**
```
Card Number: 4084084084084081
CVV: 408
Expiry: Any future date
PIN: 0000
OTP: 123456
```

---

## 📞 Support

For API issues:
- Email: api-support@your-domain.com
- Documentation: https://docs.your-domain.com
- Status: https://status.your-domain.com

---

**Version:** 1.0.0  
**Last Updated:** January 2024
