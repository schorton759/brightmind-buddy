
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Notification } from '@/types/notification';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
  createNotification
} from '@/services/notification-service';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (
    type: Notification['type'], 
    title: string, 
    message: string, 
    relatedId?: string,
    action?: { label: string; href: string }
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const refreshNotifications = () => {
    const allNotifications = getNotifications();
    setNotifications(allNotifications);
  };

  useEffect(() => {
    refreshNotifications();
    
    // Set up an interval to refresh notifications
    const intervalId = setInterval(refreshNotifications, 60000); // Every minute
    
    return () => clearInterval(intervalId);
  }, []);

  const unreadCount = notifications.filter(notification => !notification.read).length;

  const addNotification = (
    type: Notification['type'], 
    title: string, 
    message: string, 
    relatedId?: string,
    action?: { label: string; href: string }
  ) => {
    const newNotification = createNotification(type, title, message, relatedId, action);
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    markNotificationAsRead(id);
    refreshNotifications();
  };

  const markAllAsRead = () => {
    markAllNotificationsAsRead();
    refreshNotifications();
  };

  const removeNotification = (id: string) => {
    deleteNotification(id);
    refreshNotifications();
  };

  const clearAll = () => {
    clearAllNotifications();
    refreshNotifications();
  };

  return (
    <NotificationContext.Provider 
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
        refreshNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
