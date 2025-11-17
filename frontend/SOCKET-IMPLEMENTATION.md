# Socket.io Real-Time Implementation Guide

## Frontend Setup Complete ✅

### Files Created

1. **`src/utils/socket.js`** - Core Socket.io client utilities
2. **`src/context/SocketContext.jsx`** - React Context for Socket management
3. **`src/utils/useSocketHooks.js`** - Custom React hooks for Socket features
4. **`src/components/SocketStatus.jsx`** - Connection status indicator component

### Dependencies Added

```json
"socket.io-client": "^4.7.2"
```

---

## Features Implemented

### 1. Socket Client (`src/utils/socket.js`)

**Functions:**
- `initializeSocket(getToken)` - Initialize connection with auth token
- `getSocket()` - Get current socket instance
- `disconnectSocket()` - Clean disconnect
- `joinTransactionRoom(transactionId)` - Join transaction-specific room
- `leaveTransactionRoom(transactionId)` - Leave transaction room
- `onTransactionUpdate(callback)` - Subscribe to transaction updates
- `onTransactionStatusChange(callback)` - Subscribe to status changes
- `onPaymentUpdate(callback)` - Subscribe to payment updates
- `onNotification(callback)` - Subscribe to notifications
- `isSocketConnected()` - Check connection status

**Connection Features:**
- Auto-reconnection with exponential backoff
- Token-based authentication
- Multiple transport support (WebSocket + polling fallback)
- Connection status monitoring
- Error handling and logging

---

### 2. Socket Context (`src/context/SocketContext.jsx`)

**Provides:**
- Global socket instance
- Connection status tracking
- Automatic connection management based on auth state
- Global notification handler with toast integration

**Usage:**
```jsx
import { useSocket } from '../context/SocketContext';

const { socket, isConnected } = useSocket();
```

---

### 3. Custom Hooks (`src/utils/useSocketHooks.js`)

#### `useTransactionSocket(transactionId, callbacks)`

Manages real-time updates for a specific transaction.

**Callbacks:**
- `onUpdate` - Transaction data updated
- `onStatusChange` - Transaction status changed
- `onPaymentUpdate` - Payment status updated

**Features:**
- Auto join/leave transaction rooms
- Automatic cleanup on unmount
- Ref-based callbacks to avoid re-subscription

**Example:**
```jsx
useTransactionSocket(transactionId, {
  onUpdate: (data) => {
    setTransaction(prev => ({ ...prev, ...data.transaction }));
    toast.success('Transaction updated!');
  },
  onStatusChange: (data) => {
    setTransactionStatus(data.status);
    toast.success(`Status: ${data.status}`);
  },
  onPaymentUpdate: (data) => {
    if (data.paymentStatus === 'completed') {
      toast.success('Payment completed!');
    }
  }
});
```

#### `useNotifications(onNotification)`

Subscribe to user-specific notifications.

#### `useUserEvents(onUserEvent)`

Subscribe to user-specific events.

---

### 4. Components Updated

#### **TransactionProgress.jsx**
- ✅ Removed 30-second polling
- ✅ Added real-time updates via `useTransactionSocket`
- ✅ Toast notifications for updates
- ✅ Instant status changes

#### **Transactions.jsx**
- ✅ Real-time list updates
- ✅ New transaction notifications
- ✅ Updated transaction handling
- ✅ Connection status awareness

#### **main.jsx**
- ✅ Wrapped app with `SocketProvider`
- ✅ Configured toast position

---

## Backend Requirements

### Install Socket.io Server

```bash
cd backend
npm install socket.io
```

### Server Setup (`backend/server.js`)

```javascript
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGIN?.split('||') || ['http://localhost:5173'],
    credentials: true
  }
});

// Middleware to authenticate socket connections
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    // Verify token (use your auth middleware logic)
    const user = await verifyToken(token);
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.user.id}`);

  // Join user's personal room
  socket.join(`user:${socket.user.id}`);

  // Transaction room management
  socket.on('join-transaction', (transactionId) => {
    socket.join(`transaction:${transactionId}`);
    console.log(`User ${socket.user.id} joined transaction ${transactionId}`);
  });

  socket.on('leave-transaction', (transactionId) => {
    socket.leave(`transaction:${transactionId}`);
    console.log(`User ${socket.user.id} left transaction ${transactionId}`);
  });

  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.user.id}`);
  });
});

// Export io for use in routes
app.set('io', io);

// Use http server instead of app
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, io, server };
```

---

## Emitting Events from Backend

### In Transaction Routes

```javascript
// After updating transaction
const io = req.app.get('io');

// Emit to specific transaction room
io.to(`transaction:${transactionId}`).emit('transaction-updated', {
  transactionId,
  transaction: updatedTransaction
});

// Emit status change
io.to(`transaction:${transactionId}`).emit('transaction-status-changed', {
  transactionId,
  status: newStatus,
  timestamp: new Date()
});

// Emit to specific users
io.to(`user:${buyerId}`).emit('notification', {
  type: 'info',
  title: 'Transaction Updated',
  message: 'The seller has updated the transaction',
  transactionId
});
```

### In Payment Routes

```javascript
// Payment update
io.to(`transaction:${transactionId}`).emit('payment-updated', {
  transactionId,
  paymentStatus: 'completed',
  amount: transaction.amount
});

// Notify both parties
io.to(`user:${buyerId}`).emit('notification', {
  type: 'success',
  title: 'Payment Successful',
  message: 'Your payment has been received'
});

io.to(`user:${sellerId}`).emit('notification', {
  type: 'success',
  title: 'Payment Received',
  message: 'Buyer has completed payment'
});
```

---

## Event Types

### Client → Server

- `join-transaction` - Join a transaction room
- `leave-transaction` - Leave a transaction room

### Server → Client

- `transaction-created` - New transaction created
- `transaction-updated` - Transaction data updated
- `transaction-status-changed` - Status changed
- `payment-updated` - Payment status updated
- `notification` - User notification
- `user-event` - User-specific event

---

## Environment Variables

### Frontend (`.env`)

```env
VITE_API_URL=http://localhost:5000/api
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
```

### Backend (`.env`)

```env
ALLOWED_ORIGIN=http://localhost:5173||http://localhost:5174
```

---

## Testing Real-Time Features

### 1. Test Connection

Open browser console:
```javascript
// Should see: "✅ Socket.io connected: <socket-id>"
```

### 2. Test Transaction Updates

1. Open transaction in two browser tabs
2. Update transaction in one tab
3. See instant update in second tab

### 3. Test Notifications

Create a transaction and watch for toast notifications.

---

## Benefits Over Polling

| Feature | Polling (Before) | Socket.io (After) |
|---------|------------------|-------------------|
| Update Latency | 30 seconds | Instant (< 100ms) |
| Server Load | High (constant requests) | Low (event-driven) |
| Battery Usage | High | Low |
| Scalability | Poor | Excellent |
| Multi-tab Support | No | Yes |
| Real-time Notifications | No | Yes |

---

## Debugging

### Enable Socket.io Debug Mode

**Frontend:**
```javascript
localStorage.debug = 'socket.io-client:*';
```

**Backend:**
```bash
DEBUG=socket.io:* npm run dev
```

### Check Connection Status

```jsx
import { useSocket } from '../context/SocketContext';

function MyComponent() {
  const { isConnected } = useSocket();
  
  return <div>Status: {isConnected ? 'Connected' : 'Disconnected'}</div>;
}
```

---

## Production Considerations

1. **Connection Limits**: Configure max connections in Socket.io server
2. **Load Balancing**: Use Redis adapter for multi-server setups
3. **Error Monitoring**: Add Sentry or similar for Socket errors
4. **Rate Limiting**: Limit events per user
5. **Compression**: Enable WebSocket compression
6. **Security**: Validate all incoming events

### Redis Adapter (Optional)

For scaling across multiple servers:

```bash
npm install @socket.io/redis-adapter redis
```

```javascript
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');

const pubClient = createClient({ url: 'redis://localhost:6379' });
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.adapter(createAdapter(pubClient, subClient));
});
```

---

## Next Steps

1. ✅ Install Socket.io on backend: `npm install socket.io`
2. ✅ Update `backend/server.js` with Socket.io server
3. ✅ Add Socket.io emit events in transaction routes
4. ✅ Add Socket.io emit events in payment routes
5. ✅ Test real-time updates
6. ✅ Deploy with WebSocket support enabled

---

## Support

For issues or questions:
- Socket.io Docs: https://socket.io/docs/v4/
- React Integration: https://socket.io/how-to/use-with-react
