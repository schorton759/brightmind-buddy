
import { Notification, NotificationType } from '@/types/notification';

// Local storage key for notifications
const NOTIFICATIONS_STORAGE_KEY = 'brightmind_notifications';

// Get notifications from local storage
const getStoredNotifications = (): Notification[] => {
  const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
  if (!stored) return [];
  
  try {
    const parsed = JSON.parse(stored);
    // Convert string dates back to Date objects
    return parsed.map((notification: any) => ({
      ...notification,
      createdAt: new Date(notification.createdAt)
    }));
  } catch (error) {
    console.error('Failed to parse notifications from local storage', error);
    return [];
  }
};

// Save notifications to local storage
const saveNotifications = (notifications: Notification[]): void => {
  localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
};

// Create a new notification
export const createNotification = (
  type: NotificationType,
  title: string,
  message: string,
  relatedId?: string,
  action?: { label: string; href: string }
): Notification => {
  const notification: Notification = {
    id: Date.now().toString(),
    type,
    title,
    message,
    read: false,
    createdAt: new Date(),
    relatedId,
    action
  };
  
  const existingNotifications = getStoredNotifications();
  const updatedNotifications = [notification, ...existingNotifications];
  saveNotifications(updatedNotifications);
  
  return notification;
};

// Get all notifications
export const getNotifications = (): Notification[] => {
  return getStoredNotifications();
};

// Mark a notification as read
export const markNotificationAsRead = (id: string): void => {
  const notifications = getStoredNotifications();
  const updatedNotifications = notifications.map(notification => 
    notification.id === id ? { ...notification, read: true } : notification
  );
  saveNotifications(updatedNotifications);
};

// Mark all notifications as read
export const markAllNotificationsAsRead = (): void => {
  const notifications = getStoredNotifications();
  const updatedNotifications = notifications.map(notification => 
    ({ ...notification, read: true })
  );
  saveNotifications(updatedNotifications);
};

// Delete a notification
export const deleteNotification = (id: string): void => {
  const notifications = getStoredNotifications();
  const updatedNotifications = notifications.filter(notification => notification.id !== id);
  saveNotifications(updatedNotifications);
};

// Clear all notifications
export const clearAllNotifications = (): void => {
  saveNotifications([]);
};

// Create habit reminders for incomplete habits
export const createHabitReminders = (habits: any[]): void => {
  const incompleteHabits = habits.filter(habit => !habit.completed);
  
  incompleteHabits.forEach(habit => {
    createNotification(
      'habit',
      'Habit Reminder',
      `Don't forget to complete your habit: ${habit.name}`,
      habit.id,
      { label: 'View Habits', href: '/' }
    );
  });
};

// Create task reminders for high priority incomplete tasks
export const createTaskReminders = (tasks: any[]): void => {
  const highPriorityTasks = tasks.filter(task => !task.completed && task.priority === 'high');
  
  highPriorityTasks.forEach(task => {
    createNotification(
      'task',
      'Task Reminder',
      `You have a high priority task: ${task.title}`,
      task.id,
      { label: 'View Tasks', href: '/' }
    );
  });
};
