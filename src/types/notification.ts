
export type NotificationType = 'habit' | 'task' | 'achievement' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  relatedId?: string; // ID of the related habit, task, etc.
  action?: {
    label: string;
    href: string;
  };
}
