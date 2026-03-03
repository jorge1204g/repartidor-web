import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AuthService from '../services/AuthService';
import MessageService from '../services/MessageService';

interface MessageContextType {
  unreadCount: number;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | null = null;

    const initMessageListener = async () => {
      try {
        const deliveryId = AuthService.getDeliveryId();
        if (!deliveryId) return;

        // Initial unread count
        const initialCount = await MessageService.countUnreadMessagesForUser(deliveryId);
        if (isMounted) {
          setUnreadCount(initialCount);
        }

        // Subscribe to real-time updates
        unsubscribe = MessageService.observeMessagesBetweenUsers(deliveryId, 'admin', async () => {
          const count = await MessageService.countUnreadMessagesForUser(deliveryId);
          if (isMounted) {
            setUnreadCount(count);
          }
        });

        // Also update periodically to ensure accuracy
        const interval = setInterval(async () => {
          const count = await MessageService.countUnreadMessagesForUser(deliveryId);
          if (isMounted) {
            setUnreadCount(count);
          }
        }, 5000); // Update every 5 seconds

        // Cleanup interval on unmount
        return () => {
          clearInterval(interval);
        };
      } catch (error) {
        console.error('Error initializing message listener:', error);
      }
    };

    initMessageListener();

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return (
    <MessageContext.Provider value={{ unreadCount }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessage = (): MessageContextType => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessage must be used within a MessageProvider');
  }
  return context;
};