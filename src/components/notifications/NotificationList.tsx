
import React from 'react';
import { useNotifications } from '@/context/NotificationContext';
import NotificationItem from './NotificationItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

const NotificationList = () => {
  const { notifications, clearAll } = useNotifications();

  if (notifications.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p>You don't have any notifications</p>
      </div>
    );
  }

  return (
    <div>
      <ScrollArea className="h-[300px]">
        <div className="flex flex-col">
          {notifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
        </div>
      </ScrollArea>
      <div className="p-2 border-t">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearAll}
          className="w-full text-xs text-muted-foreground"
        >
          Clear all notifications
        </Button>
      </div>
    </div>
  );
};

export default NotificationList;
