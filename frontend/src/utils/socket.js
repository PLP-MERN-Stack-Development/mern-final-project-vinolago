import { io } from 'socket.io-client';

let socket = null;

/**
 * Initialize Socket.io connection with authentication
 * @param {Function} getToken - Function to get authentication token
 * @returns {Socket} Socket.io client instance
 */
export const initializeSocket = async (getToken) => {
  if (socket && socket.connected) {
    return socket;
  }

  try {
    const token = await getToken();
    const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

    socket = io(SOCKET_URL, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      autoConnect: true
    });

    // Connection event handlers
    socket.on('connect', () => {
      console.log('✅ Socket.io connected:', socket.id);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket.io connection error:', error.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket.io disconnected:', reason);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Socket.io reconnected after ${attemptNumber} attempts`);
    });

    socket.on('reconnect_error', (error) => {
      console.error('❌ Socket.io reconnection error:', error.message);
    });

    socket.on('reconnect_failed', () => {
      console.error('❌ Socket.io reconnection failed after max attempts');
    });

    return socket;
  } catch (error) {
    console.error('Failed to initialize socket:', error);
    return null;
  }
};

/**
 * Get the current socket instance
 * @returns {Socket|null} Socket.io client instance or null
 */
export const getSocket = () => {
  return socket;
};

/**
 * Disconnect the socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Socket disconnected and cleaned up');
  }
};

/**
 * Join a specific transaction room
 * @param {string} transactionId - Transaction ID to join
 */
export const joinTransactionRoom = (transactionId) => {
  if (socket && socket.connected) {
    socket.emit('join-transaction', transactionId);
    console.log(`Joined transaction room: ${transactionId}`);
  }
};

/**
 * Leave a specific transaction room
 * @param {string} transactionId - Transaction ID to leave
 */
export const leaveTransactionRoom = (transactionId) => {
  if (socket && socket.connected) {
    socket.emit('leave-transaction', transactionId);
    console.log(`Left transaction room: ${transactionId}`);
  }
};

/**
 * Subscribe to transaction updates
 * @param {Function} callback - Callback function to handle updates
 */
export const onTransactionUpdate = (callback) => {
  if (socket) {
    socket.on('transaction-updated', callback);
  }
};

/**
 * Subscribe to transaction status changes
 * @param {Function} callback - Callback function to handle status changes
 */
export const onTransactionStatusChange = (callback) => {
  if (socket) {
    socket.on('transaction-status-changed', callback);
  }
};

/**
 * Subscribe to payment updates
 * @param {Function} callback - Callback function to handle payment updates
 */
export const onPaymentUpdate = (callback) => {
  if (socket) {
    socket.on('payment-updated', callback);
  }
};

/**
 * Subscribe to notifications
 * @param {Function} callback - Callback function to handle notifications
 */
export const onNotification = (callback) => {
  if (socket) {
    socket.on('notification', callback);
  }
};

/**
 * Subscribe to user-specific events
 * @param {Function} callback - Callback function to handle user events
 */
export const onUserEvent = (callback) => {
  if (socket) {
    socket.on('user-event', callback);
  }
};

/**
 * Remove specific event listener
 * @param {string} eventName - Event name to remove listener from
 * @param {Function} callback - Callback function to remove
 */
export const offEvent = (eventName, callback) => {
  if (socket) {
    if (callback) {
      socket.off(eventName, callback);
    } else {
      socket.off(eventName);
    }
  }
};

/**
 * Check if socket is connected
 * @returns {boolean} Connection status
 */
export const isSocketConnected = () => {
  return socket && socket.connected;
};

export default {
  initializeSocket,
  getSocket,
  disconnectSocket,
  joinTransactionRoom,
  leaveTransactionRoom,
  onTransactionUpdate,
  onTransactionStatusChange,
  onPaymentUpdate,
  onNotification,
  onUserEvent,
  offEvent,
  isSocketConnected
};
