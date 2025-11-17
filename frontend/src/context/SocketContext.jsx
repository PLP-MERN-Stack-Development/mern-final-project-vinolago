import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { initializeSocket, disconnectSocket, getSocket } from '../utils/socket';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { getToken, isSignedIn } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let mounted = true;

    const setupSocket = async () => {
      if (isSignedIn && mounted) {
        try {
          const socketInstance = await initializeSocket(getToken);
          if (socketInstance && mounted) {
            setSocket(socketInstance);

            // Set up connection status listeners
            socketInstance.on('connect', () => {
              if (mounted) {
                setIsConnected(true);
              }
            });

            socketInstance.on('disconnect', () => {
              if (mounted) {
                setIsConnected(false);
              }
            });

            // Global notification handler
            socketInstance.on('notification', (notification) => {
              if (mounted) {
                const { type, message, title } = notification;
                
                switch (type) {
                  case 'success':
                    toast.success(title || message);
                    break;
                  case 'error':
                    toast.error(title || message);
                    break;
                  case 'info':
                    toast(message, {
                      icon: 'ℹ️',
                    });
                    break;
                  case 'warning':
                    toast(message, {
                      icon: '⚠️',
                    });
                    break;
                  default:
                    toast(message);
                }
              }
            });
          }
        } catch (error) {
          console.error('Failed to setup socket:', error);
        }
      }
    };

    setupSocket();

    return () => {
      mounted = false;
      if (!isSignedIn) {
        disconnectSocket();
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, [isSignedIn, getToken]);

  const value = {
    socket,
    isConnected,
    getSocket: () => socket || getSocket()
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
