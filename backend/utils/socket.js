const { Server } = require('socket.io');
const { verifyToken } = require('@clerk/clerk-sdk-node');

let io = null;

/**
 * Initialize Socket.io server
 * @param {http.Server} server - HTTP server instance
 * @returns {Server} Socket.io server instance
 */
const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.ALLOWED_ORIGIN 
        ? process.env.ALLOWED_ORIGIN.split('||').map(s => s.trim()) 
        : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
      credentials: true,
      methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // Verify Clerk token
      try {
        const session = await verifyToken(token);
        socket.userId = session.sub || session.userId;
        socket.sessionId = session.sid;
        next();
      } catch (verifyError) {
        console.error('Token verification failed:', verifyError.message);
        return next(new Error('Invalid authentication token'));
      }
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`✅ Socket connected: ${socket.id} | User: ${socket.userId}`);

    // Join user's personal room
    const userRoom = `user:${socket.userId}`;
    socket.join(userRoom);
    console.log(`User ${socket.userId} joined personal room`);

    // Handle transaction room joins
    socket.on('join-transaction', (transactionId) => {
      const room = `transaction:${transactionId}`;
      socket.join(room);
      console.log(`User ${socket.userId} joined transaction room: ${transactionId}`);
      
      // Notify others in the room
      socket.to(room).emit('user-joined-transaction', {
        userId: socket.userId,
        transactionId,
        timestamp: new Date()
      });
    });

    // Handle transaction room leaves
    socket.on('leave-transaction', (transactionId) => {
      const room = `transaction:${transactionId}`;
      socket.leave(room);
      console.log(`User ${socket.userId} left transaction room: ${transactionId}`);
      
      // Notify others in the room
      socket.to(room).emit('user-left-transaction', {
        userId: socket.userId,
        transactionId,
        timestamp: new Date()
      });
    });

    // Handle typing indicators (optional)
    socket.on('typing', (data) => {
      const room = `transaction:${data.transactionId}`;
      socket.to(room).emit('user-typing', {
        userId: socket.userId,
        transactionId: data.transactionId
      });
    });

    // Handle stop typing (optional)
    socket.on('stop-typing', (data) => {
      const room = `transaction:${data.transactionId}`;
      socket.to(room).emit('user-stopped-typing', {
        userId: socket.userId,
        transactionId: data.transactionId
      });
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`❌ Socket disconnected: ${socket.id} | User: ${socket.userId} | Reason: ${reason}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`Socket error for user ${socket.userId}:`, error);
    });
  });

  console.log('🚀 Socket.io server initialized');
  return io;
};

/**
 * Get Socket.io server instance
 * @returns {Server} Socket.io server instance
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initializeSocket first.');
  }
  return io;
};

/**
 * Emit event to specific transaction room
 * @param {string} transactionId - Transaction ID
 * @param {string} event - Event name
 * @param {object} data - Event data
 */
const emitToTransaction = (transactionId, event, data) => {
  if (!io) return;
  io.to(`transaction:${transactionId}`).emit(event, data);
};

/**
 * Emit event to specific user
 * @param {string} userId - User ID
 * @param {string} event - Event name
 * @param {object} data - Event data
 */
const emitToUser = (userId, event, data) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
};

/**
 * Emit notification to user
 * @param {string} userId - User ID
 * @param {object} notification - Notification data
 */
const sendNotification = (userId, notification) => {
  if (!io) return;
  
  const notificationData = {
    id: Date.now().toString(),
    timestamp: new Date(),
    ...notification
  };
  
  io.to(`user:${userId}`).emit('notification', notificationData);
};

/**
 * Emit transaction update
 * @param {string} transactionId - Transaction ID
 * @param {object} transaction - Updated transaction data
 */
const emitTransactionUpdate = (transactionId, transaction) => {
  if (!io) return;
  
  emitToTransaction(transactionId, 'transaction-updated', {
    transactionId,
    transaction,
    timestamp: new Date()
  });
};

/**
 * Emit transaction status change
 * @param {string} transactionId - Transaction ID
 * @param {string} status - New status
 * @param {object} additionalData - Additional data
 */
const emitStatusChange = (transactionId, status, additionalData = {}) => {
  if (!io) return;
  
  emitToTransaction(transactionId, 'transaction-status-changed', {
    transactionId,
    status,
    timestamp: new Date(),
    ...additionalData
  });
};

/**
 * Emit payment update
 * @param {string} transactionId - Transaction ID
 * @param {object} paymentData - Payment data
 */
const emitPaymentUpdate = (transactionId, paymentData) => {
  if (!io) return;
  
  emitToTransaction(transactionId, 'payment-updated', {
    transactionId,
    ...paymentData,
    timestamp: new Date()
  });
};

/**
 * Broadcast to all connected clients
 * @param {string} event - Event name
 * @param {object} data - Event data
 */
const broadcast = (event, data) => {
  if (!io) return;
  io.emit(event, data);
};

module.exports = {
  initializeSocket,
  getIO,
  emitToTransaction,
  emitToUser,
  sendNotification,
  emitTransactionUpdate,
  emitStatusChange,
  emitPaymentUpdate,
  broadcast
};
