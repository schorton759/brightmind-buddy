
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Bell, CheckCircle, List, Trophy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Notification } from '@/types/notification';
import { useNotifications } from '@/context/NotificationContext';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: Notification;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const { markAsRead, removeNotification } = useNotifications();
  const navigate = useNavigate();
  
  const getIcon = () => {
    switch (notification.type) {
      case 'habit':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'task':
        return <List className="h-4 w-4 text-blue-500" />;
      case 'achievement':
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const handleClick = () => {
    markAsRead(notification.id);
    
    if (notification.action?.href) {
      navigate(notification.action.href);
    }
  };
  
  return (
    <div 
      className={cn(
        "p-4 border-b last:border-b-0 flex items-start gap-3 cursor-pointer hover:bg-accent/10",
        !notification.read && "bg-accent/5"
      )}
      onClick={handleClick}
    >
      <div className="mt-0.5">{getIcon()}</div>
      
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h4 className="font-medium text-sm">{notification.title}</h4>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-5 w-5 -mt-1 -mr-1" 
            onClick={(e) => {
              e.stopPropagation();
              removeNotification(notification.id);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
        
        <div className="flex justify-between items-center mt-2">
          <time className="text-xs text-muted-foreground">
            {format(notification.createdAt, 'MMM d, h:mm a')}
          </time>
          
          {notification.action && (
            <span className="text-xs font-medium text-primary">
              {notification.action.label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
