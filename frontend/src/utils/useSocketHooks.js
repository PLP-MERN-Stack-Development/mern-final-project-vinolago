import { useEffect, useCallback, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import {
  joinTransactionRoom,
  leaveTransactionRoom,
  onTransactionUpdate,
  onTransactionStatusChange,
  onPaymentUpdate,
  offEvent
} from '../utils/socket';

/**
 * Custom hook for transaction real-time updates
 * @param {string} transactionId - Transaction ID to monitor
 * @param {Object} callbacks - Callback functions for different events
 */
export const useTransactionSocket = (transactionId, callbacks = {}) => {
  const { socket, isConnected } = useSocket();
  const callbacksRef = useRef(callbacks);

  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  // Transaction update handler
  const handleTransactionUpdate = useCallback((data) => {
    if (data.transactionId === transactionId && callbacksRef.current.onUpdate) {
      callbacksRef.current.onUpdate(data);
    }
  }, [transactionId]);

  // Status change handler
  const handleStatusChange = useCallback((data) => {
    if (data.transactionId === transactionId && callbacksRef.current.onStatusChange) {
      callbacksRef.current.onStatusChange(data);
    }
  }, [transactionId]);

  // Payment update handler
  const handlePaymentUpdate = useCallback((data) => {
    if (data.transactionId === transactionId && callbacksRef.current.onPaymentUpdate) {
      callbacksRef.current.onPaymentUpdate(data);
    }
  }, [transactionId]);

  useEffect(() => {
    if (!socket || !isConnected || !transactionId) return;

    // Join transaction room
    joinTransactionRoom(transactionId);

    // Subscribe to events
    onTransactionUpdate(handleTransactionUpdate);
    onTransactionStatusChange(handleStatusChange);
    onPaymentUpdate(handlePaymentUpdate);

    // Cleanup
    return () => {
      leaveTransactionRoom(transactionId);
      offEvent('transaction-updated', handleTransactionUpdate);
      offEvent('transaction-status-changed', handleStatusChange);
      offEvent('payment-updated', handlePaymentUpdate);
    };
  }, [socket, isConnected, transactionId, handleTransactionUpdate, handleStatusChange, handlePaymentUpdate]);

  return { isConnected };
};

/**
 * Custom hook for general notifications
 * @param {Function} onNotification - Callback for notifications
 */
export const useNotifications = (onNotification) => {
  const { socket, isConnected } = useSocket();
  const callbackRef = useRef(onNotification);

  useEffect(() => {
    callbackRef.current = onNotification;
  }, [onNotification]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNotification = (notification) => {
      if (callbackRef.current) {
        callbackRef.current(notification);
      }
    };

    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
    };
  }, [socket, isConnected]);

  return { isConnected };
};

/**
 * Custom hook for user-specific events
 * @param {Function} onUserEvent - Callback for user events
 */
export const useUserEvents = (onUserEvent) => {
  const { socket, isConnected } = useSocket();
  const callbackRef = useRef(onUserEvent);

  useEffect(() => {
    callbackRef.current = onUserEvent;
  }, [onUserEvent]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleUserEvent = (event) => {
      if (callbackRef.current) {
        callbackRef.current(event);
      }
    };

    socket.on('user-event', handleUserEvent);

    return () => {
      socket.off('user-event', handleUserEvent);
    };
  }, [socket, isConnected]);

  return { isConnected };
};
